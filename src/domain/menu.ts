import { z } from 'zod'
import { profileSchema, instant, nameSchema, type Profile } from './profile'
import { calculate, quantitySchema, snapshotSchema, sumNutrients } from './nutrition'

export const localDateSchema = z.iso.date().refine(value => value >= '0001-01-01', 'Data non valida.')
export const todayLocal = () => {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
}
export function addDays(date: string, days: number): string {
  localDateSchema.parse(date)
  const value = new Date(`${date}T12:00:00Z`)
  value.setUTCDate(value.getUTCDate() + days)
  return localDateSchema.parse(value.toISOString().slice(0, 10))
}
export function datesBetween(start: string, end: string): string[] {
  localDateSchema.parse(start); localDateSchema.parse(end)
  if (end < start) throw new Error('Intervallo di date non valido.')
  const dates = [start]
  while (dates.at(-1)! < end) {
    if (dates.length >= 7) throw new Error('Un piano può coprire da uno a sette giorni.')
    dates.push(addDays(dates.at(-1)!, 1))
  }
  return dates
}
export const noteSchema = z.string().trim().max(5000).nullable()
export const slotsSchema = profileSchema.shape.mealSlots
export const plannedItemSchema = z.object({
  id: z.uuid(), kind: z.enum(['food', 'recipe']), catalogId: z.uuid(), snapshot: snapshotSchema, quantity: quantitySchema,
}).refine(i => i.catalogId === i.snapshot.catalogId && i.snapshot.basisUnit === i.quantity.basisUnit, 'Fonte o unità incoerente.')
export type PlannedItem = z.infer<typeof plannedItemSchema>
export const plannedMealSchema = z.object({
  id: z.uuid(), revisionId: z.uuid(), date: localDateSchema, slot: z.string().min(1).max(64),
  items: z.array(plannedItemSchema).max(100), substitutions: z.array(plannedItemSchema).max(100), notes: noteSchema,
})
export type PlannedMeal = z.infer<typeof plannedMealSchema>
export const menuPlanSchema = z.object({
  id: z.uuid(), profileId: z.uuid(), title: nameSchema, startDate: localDateSchema, endDate: localDateSchema,
  currentRevisionId: z.uuid(), archived: z.boolean(), createdAt: instant, updatedAt: instant,
}).refine(p => p.startDate <= p.endDate && p.createdAt <= p.updatedAt, 'Date incoerenti.')
export type MenuPlan = z.infer<typeof menuPlanSchema>
export const menuRevisionSchema = z.object({
  id: z.uuid(), menuPlanId: z.uuid(), revisionNumber: z.number().int().positive(), mealSlotsSnapshot: slotsSchema,
  createdAt: instant, changeNote: noteSchema,
})
export type MenuRevision = z.infer<typeof menuRevisionSchema>
export const selectionSchema = z.object({ id: z.uuid(), profileId: z.uuid(), date: localDateSchema, revisionId: z.uuid(), createdAt: instant, updatedAt: instant })
export type DayPlanSelection = z.infer<typeof selectionSchema>
export type MenuBundle = { plan: MenuPlan; revision: MenuRevision; meals: PlannedMeal[] }
export type MenuData = { plans: MenuPlan[]; revisions: MenuRevision[]; meals: PlannedMeal[]; selections: DayPlanSelection[] }

export function validateMenu(input: MenuBundle): MenuBundle {
  const plan = menuPlanSchema.parse(input.plan), revision = menuRevisionSchema.parse(input.revision)
  const meals = input.meals.map(m => plannedMealSchema.parse(m)), dates = datesBetween(plan.startDate, plan.endDate)
  if (revision.menuPlanId !== plan.id || plan.currentRevisionId !== revision.id) throw new Error('Revisione del piano incoerente.')
  const expected = dates.flatMap(date => revision.mealSlotsSnapshot.map(s => `${date}/${s.key}`))
  const actual = meals.map(m => `${m.date}/${m.slot}`)
  const ids = meals.flatMap(m => [m.id, ...m.items.map(i => i.id), ...m.substitutions.map(i => i.id)])
  if (actual.length !== expected.length || new Set(actual).size !== actual.length || actual.some(k => !expected.includes(k)) || new Set(ids).size !== ids.length || meals.some(m => m.revisionId !== revision.id)) throw new Error('Occasioni mancanti, duplicate o incoerenti.')
  meals.forEach(m => [...m.items, ...m.substitutions].forEach(i => calculate(i.snapshot, i.quantity)))
  // Valida anche l'aggregato: nessun overflow tra voci singolarmente finite.
  menuTotal(meals)
  return { plan, revision, meals }
}
export const menuTotal = (meals: PlannedMeal[]) => sumNutrients(meals.flatMap(m => m.items.map(i => calculate(i.snapshot, i.quantity))))

export function newMenu(profile: Profile, title: string, startDate: string, days: number): MenuBundle {
  if (![1, 7].includes(days)) throw new Error('Scegli un giorno o una settimana.')
  const now = new Date().toISOString(), planId = crypto.randomUUID(), revisionId = crypto.randomUUID()
  const endDate = addDays(startDate, days - 1)
  return validateMenu({ plan: { id: planId, profileId: profile.id, title, startDate, endDate, currentRevisionId: revisionId, archived: false, createdAt: now, updatedAt: now },
    revision: { id: revisionId, menuPlanId: planId, revisionNumber: 1, mealSlotsSnapshot: structuredClone(profile.mealSlots), createdAt: now, changeNote: null },
    meals: datesBetween(startDate, endDate).flatMap(date => profile.mealSlots.map(s => ({ id: crypto.randomUUID(), revisionId, date, slot: s.key, items: [], substitutions: [], notes: null }))),
  })
}

export function reviseMenu(bundle: MenuBundle): MenuBundle {
  const copy = structuredClone(bundle), id = crypto.randomUUID(), now = new Date().toISOString()
  copy.plan.currentRevisionId = id; copy.plan.updatedAt = now
  copy.revision = { ...copy.revision, id, revisionNumber: copy.revision.revisionNumber + 1, createdAt: now, changeNote: null }
  copy.meals = copy.meals.map(m => ({ ...m, id: crypto.randomUUID(), revisionId: id }))
  return copy
}

export function applySlots(bundle: MenuBundle, slots: Profile['mealSlots']): MenuBundle {
  slotsSchema.parse(slots)
  if (bundle.meals.some(m => !slots.some(s => s.key === m.slot) && (m.items.length || m.substitutions.length || m.notes))) throw new Error('Sposta o rimuovi dalla bozza le voci e le note delle occasioni eliminate prima di applicare la configurazione. La revisione salvata resta conservata.')
  return { ...bundle, revision: { ...bundle.revision, mealSlotsSnapshot: structuredClone(slots) }, meals: datesBetween(bundle.plan.startDate, bundle.plan.endDate).flatMap(date => slots.map(s => bundle.meals.find(m => m.date === date && m.slot === s.key) ?? { id: crypto.randomUUID(), revisionId: bundle.revision.id, date, slot: s.key, items: [], substitutions: [], notes: null })) }
}

export function chooseSubstitution(meal: PlannedMeal, alternativeId: string, replaceId: string): PlannedMeal {
  const item = meal.substitutions.find(i => i.id === alternativeId)
  if (!item || (replaceId && !meal.items.some(i => i.id === replaceId))) throw new Error('Seleziona una sostituzione e la voce da sostituire.')
  return { ...meal, items: replaceId ? meal.items.map(i => i.id === replaceId ? item : i) : [...meal.items, item], substitutions: meal.substitutions.filter(i => i.id !== alternativeId) }
}
