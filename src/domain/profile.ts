import { z } from 'zod'

export const nameSchema = z.string().trim().min(1, 'Campo obbligatorio.').max(200, 'Massimo 200 caratteri.')
export const positive = z.number().finite().positive('Inserisci un valore maggiore di zero.')
export const instant = z.iso.datetime()
export const normalizeKey = (value: string) => {
  const key = value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLowerCase().replace(/\s+/g, ' ')
  return /^(tartufo|tartufi|truffle|truffles)$/.test(key) ? 'truffle' : key
}
export const keysFromText = (value: string) => [...new Set(value.split(',').map(normalizeKey).filter(Boolean))]
export const keyLabel = (value: string) => value === 'truffle' ? 'tartufo' : value
export const profileSchema = z.object({
  id: z.uuid(), ageYears: z.number().int().min(18).max(120),
  heightCm: positive.max(300), initialWeightKg: positive.max(500),
  initialWeightDate: z.iso.date().nullable(), activityLevel: z.enum(['low', 'moderate', 'high']),
  goal: z.enum(['weightLoss', 'maintenance']), diet: z.enum(['omnivore', 'vegetarian', 'vegan']),
  excludedFoodKeys: z.array(nameSchema).max(100).refine(keys => new Set(keys).size === keys.length && keys.every(k => normalizeKey(k) === k)),
  mealSlots: z.array(z.object({ key: z.string().min(1).max(64), label: nameSchema })).min(1).max(10)
    .refine(slots => new Set(slots.map(s => s.key)).size === slots.length, 'Le occasioni devono essere uniche.'),
  dailyTargets: z.null(), createdAt: instant, updatedAt: instant,
}).refine(p => p.updatedAt >= p.createdAt, 'Date di modifica incoerenti.')
export type Profile = z.infer<typeof profileSchema>

export function defaultProfile(): Profile {
  const now = new Date().toISOString()
  return { id: crypto.randomUUID(), ageYears: 40, heightCm: 180, initialWeightKg: 100,
    initialWeightDate: null, activityLevel: 'low', goal: 'weightLoss', diet: 'omnivore',
    excludedFoodKeys: ['truffle'], dailyTargets: null,
    mealSlots: [ ['breakfast', 'Colazione'], ['morningSnack', 'Spuntino mattutino'], ['lunch', 'Pranzo'], ['afternoonSnack', 'Spuntino pomeridiano'], ['dinner', 'Cena'] ].map(([key, label]) => ({ key, label })),
    createdAt: now, updatedAt: now }
}

// Nessun separatore delle migliaia: la virgola italiana è un separatore decimale.
export function parseDecimal(value: string): number {
  if (!/^\d+(?:[.,]\d+)?$/.test(value.trim())) return NaN
  return Number(value.trim().replace(',', '.'))
}
