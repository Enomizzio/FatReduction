import { z } from 'zod'
import { instant, nameSchema, normalizeKey, positive } from './profile'

const nonnegative = z.number().finite().nonnegative()
const keysSchema = z.array(nameSchema).max(100).refine(keys => new Set(keys).size === keys.length && keys.every(k => normalizeKey(k) === k))
export const nutrientsSchema = z.object({ energyKcal: nonnegative, proteinG: nonnegative, carbohydrateG: nonnegative, fatG: nonnegative, fiberG: nonnegative.nullable() })
export type Nutrients = z.infer<typeof nutrientsSchema>
export const sourceSchema = z.object({
  kind: z.enum(['label', 'database', 'manual', 'calculated']), reference: nameSchema,
  url: z.url().max(2000).refine(v => ['https:', 'http:'].includes(new URL(v).protocol), 'Usa un URL http o https.').nullable(),
  retrievedAt: z.iso.date().nullable(), isEstimate: z.boolean(),
}).refine(s => s.kind !== 'manual' || s.isEstimate, 'I dati manuali sono stime.')
export type NutritionSource = z.infer<typeof sourceSchema>
export const quantitySchema = z.object({
  amount: positive, unit: z.enum(['g', 'ml', 'portion']), basisUnit: z.enum(['g', 'ml']),
  conversionToBasis: positive, conversionSource: nameSchema.nullable(),
}).refine(q => q.unit === q.basisUnit ? q.conversionToBasis === 1 : !!q.conversionSource, 'Conversione dichiarata e fonte obbligatorie.')
export type Quantity = z.infer<typeof quantitySchema>
const baseSnapshotSchema = z.object({
  catalogId: z.uuid(), catalogRevision: z.number().int().positive(), displayName: nameSchema,
  basisAmount: positive, basisUnit: z.enum(['g', 'ml']), nutrients: nutrientsSchema,
  source: sourceSchema, excludedIngredientKeys: keysSchema,
})
const snapshotIngredientSchema = z.object({ snapshot: baseSnapshotSchema, quantity: quantitySchema })
export const snapshotSchema = baseSnapshotSchema.extend({ ingredientSnapshots: z.array(snapshotIngredientSchema).min(1).max(100).optional() })
export type NutritionSnapshot = z.infer<typeof snapshotSchema>
const recordFields = { id: z.uuid(), revision: z.number().int().positive(), name: nameSchema, archived: z.boolean(), createdAt: instant, updatedAt: instant }
export const foodSchema = z.object({
  ...recordFields, normalizedIngredientKeys: keysSchema, basisAmount: positive, basisUnit: z.enum(['g', 'ml']),
  nutrients: nutrientsSchema, source: sourceSchema.refine(s => s.kind !== 'calculated', 'Usa la fonte dell’alimento.'),
  portionConversions: z.array(z.object({ label: nameSchema, basisQuantity: positive, source: nameSchema })).max(20)
    .refine(items => new Set(items.map(i => normalizeKey(i.label))).size === items.length, 'Etichette porzione duplicate.'),
}).refine(r => r.createdAt <= r.updatedAt, 'Date incoerenti.')
export type Food = z.infer<typeof foodSchema>
export const recipeIngredientSchema = z.object({ id: z.uuid(), foodId: z.uuid(), snapshot: baseSnapshotSchema, quantity: quantitySchema })
  .refine(i => i.foodId === i.snapshot.catalogId && i.snapshot.basisUnit === i.quantity.basisUnit, 'Ingrediente o unità incoerente.')
export type RecipeIngredient = z.infer<typeof recipeIngredientSchema>
export const recipeSchema = z.object({
  ...recordFields, ingredients: z.array(recipeIngredientSchema).min(1).max(100).refine(items => new Set(items.map(i => i.id)).size === items.length, 'Ingredienti duplicati.'),
  yieldAmount: positive, yieldUnit: z.enum(['g', 'ml']), instructions: z.string().trim().max(5000).nullable(),
}).refine(r => r.createdAt <= r.updatedAt, 'Date incoerenti.')
export type Recipe = z.infer<typeof recipeSchema>

export function ingredientKeys(name: string, keys: string[]): string[] {
  const normalizedName = normalizeKey(name)
  const inferred = /\b(tartuf[oi]|truffles?)\b/.test(normalizedName) ? ['truffle'] : []
  return [...new Set([...keys.map(normalizeKey), normalizedName, ...inferred])].filter(Boolean)
}

export function foodSnapshot(food: Food): NutritionSnapshot {
  const valid = foodSchema.parse(food)
  return snapshotSchema.parse({ catalogId: valid.id, catalogRevision: valid.revision, displayName: valid.name,
    basisAmount: valid.basisAmount, basisUnit: valid.basisUnit, nutrients: valid.nutrients, source: valid.source,
    excludedIngredientKeys: ingredientKeys(valid.name, valid.normalizedIngredientKeys) })
}

export function makeQuantity(basisUnit: 'g' | 'ml', amount: number, unit: Quantity['unit'], conversion?: { factor: number; source: string }): Quantity {
  if (unit !== basisUnit && !conversion) throw new Error('Conversione non disponibile: dichiara il fattore e la fonte.')
  return quantitySchema.parse({ amount, unit, basisUnit, conversionToBasis: unit === basisUnit ? 1 : conversion?.factor, conversionSource: unit === basisUnit ? null : conversion?.source })
}

export function calculate(snapshot: NutritionSnapshot, quantity: Quantity): Nutrients {
  const s = snapshotSchema.parse(snapshot), q = quantitySchema.parse(quantity)
  if (s.basisUnit !== q.basisUnit) throw new Error('Unità della quantità e della base non coerenti.')
  const factor = q.amount * q.conversionToBasis / s.basisAmount
  return nutrientsSchema.parse(Object.fromEntries(Object.entries(s.nutrients).map(([key, value]) => [key, value === null ? null : value * factor])))
}

export function sumNutrients(items: Nutrients[]): Nutrients {
  return items.reduce((sum, item) => {
    const n = nutrientsSchema.parse(item)
    return nutrientsSchema.parse({ energyKcal: sum.energyKcal + n.energyKcal, proteinG: sum.proteinG + n.proteinG,
      carbohydrateG: sum.carbohydrateG + n.carbohydrateG, fatG: sum.fatG + n.fatG,
      fiberG: sum.fiberG === null || n.fiberG === null ? null : sum.fiberG + n.fiberG })
  }, { energyKcal: 0, proteinG: 0, carbohydrateG: 0, fatG: 0, fiberG: 0 })
}

export function recipeSnapshot(recipe: Recipe): NutritionSnapshot {
  const r = recipeSchema.parse(recipe)
  return snapshotSchema.parse({ catalogId: r.id, catalogRevision: r.revision, displayName: r.name,
    basisAmount: r.yieldAmount, basisUnit: r.yieldUnit, nutrients: sumNutrients(r.ingredients.map(i => calculate(i.snapshot, i.quantity))),
    source: { kind: 'calculated', reference: 'Somma ingredienti / resa dichiarata; fonti conservate negli ingredienti.', url: null, retrievedAt: null, isEstimate: true },
    excludedIngredientKeys: [...new Set(r.ingredients.flatMap(i => i.snapshot.excludedIngredientKeys))],
    ingredientSnapshots: r.ingredients.map(i => ({ snapshot: i.snapshot, quantity: i.quantity })) })
}

export function matchedExclusions(snapshot: NutritionSnapshot, excluded: string[]): string[] {
  const candidates = ingredientKeys(snapshot.displayName, snapshot.excludedIngredientKeys)
  return [...new Set(excluded.map(normalizeKey))].filter(key => candidates.some(candidate =>
    candidate === key || (` ${candidate.replace(/[^\p{L}\p{N} ]/gu, ' ')} `).includes(` ${key} `)))
}
