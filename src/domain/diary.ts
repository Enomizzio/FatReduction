import { z } from 'zod'
import { instant, nameSchema, positive, type Profile } from './profile'
import { calculate, sumNutrients } from './nutrition'
import { localDateSchema, noteSchema, plannedItemSchema, todayLocal, type MenuData, type PlannedItem, type PlannedMeal } from './menu'

export function validateRecordedDate(date: string, today = todayLocal()) {
  localDateSchema.parse(date); localDateSchema.parse(today)
  if (date > today) throw new Error('Consumi e misurazioni non possono avere una data futura.')
  return date
}
const historicalSlotsSchema = z.array(z.object({ key: z.string().min(1).max(64), label: nameSchema })).min(1).max(100).refine(slots => new Set(slots.map(s => s.key)).size === slots.length, 'Occasioni duplicate.')
const rating = z.number().int().min(1).max(5).nullable()
export const diarySchema = z.object({
  id: z.uuid(), profileId: z.uuid(), date: localDateSchema, plannedRevisionId: z.uuid().nullable(), mealSlotsSnapshot: historicalSlotsSchema,
  status: z.enum(['open', 'complete']), activity: z.array(z.object({ description: nameSchema, durationMinutes: positive.max(1440).nullable() })).max(100),
  hunger: rating, energy: rating, mood: rating, notes: noteSchema, createdAt: instant, updatedAt: instant,
}).refine(d => d.createdAt <= d.updatedAt, 'Date incoerenti.')
export type DailyDiary = z.infer<typeof diarySchema>
export const consumedEntrySchema = plannedItemSchema.safeExtend({ diaryId: z.uuid(), slot: z.string().min(1).max(64), plannedItemId: z.uuid().nullable(), consumedAt: instant.nullable(), notes: noteSchema, createdAt: instant, updatedAt: instant })
  .refine(e => e.createdAt <= e.updatedAt && e.catalogId === e.snapshot.catalogId && e.quantity.basisUnit === e.snapshot.basisUnit, 'Voce consumata incoerente.')
export type ConsumedEntry = z.infer<typeof consumedEntrySchema>
export const measurementSchema = z.object({ id: z.uuid(), profileId: z.uuid(), date: localDateSchema, weightKg: positive.max(500), notes: noteSchema, createdAt: instant, updatedAt: instant })
  .refine(m => m.createdAt <= m.updatedAt, 'Date incoerenti.')
export type BodyMeasurement = z.infer<typeof measurementSchema>
export type DiaryBundle = { diary: DailyDiary; entries: ConsumedEntry[]; measurement: BodyMeasurement | null }

export function validateDiary(input: DiaryBundle, today = todayLocal()): DiaryBundle {
  const diary = diarySchema.parse(input.diary), entries = input.entries.map(e => consumedEntrySchema.parse(e)), measurement = input.measurement ? measurementSchema.parse(input.measurement) : null
  validateRecordedDate(diary.date, today)
  if (entries.length > 1000 || new Set(entries.map(e => e.id)).size !== entries.length || entries.some(e => e.diaryId !== diary.id || !diary.mealSlotsSnapshot.some(s => s.key === e.slot))) throw new Error('Voci duplicate o occasioni del diario incoerenti.')
  if (measurement && (measurement.profileId !== diary.profileId || measurement.date !== diary.date)) throw new Error('Misurazione non coerente con la giornata.')
  entries.forEach(e => calculate(e.snapshot, e.quantity)); consumedTotal(diary, entries)
  return { diary, entries, measurement }
}

export function newDiary(profile: Profile, date: string, menu: MenuData): DiaryBundle {
  validateRecordedDate(date)
  const selection = menu.selections.find(s => s.profileId === profile.id && s.date === date)
  const revision = menu.revisions.find(r => r.id === selection?.revisionId), now = new Date().toISOString()
  return { diary: { id: crypto.randomUUID(), profileId: profile.id, date, plannedRevisionId: revision?.id ?? null, mealSlotsSnapshot: structuredClone(revision?.mealSlotsSnapshot ?? profile.mealSlots), status: 'open', activity: [], hunger: null, energy: null, mood: null, notes: null, createdAt: now, updatedAt: now }, entries: [], measurement: null }
}
export function consumedFromItem(item: PlannedItem, diary: DailyDiary, slot: string, plannedItemId: string | null = null): ConsumedEntry {
  const now = new Date().toISOString()
  return consumedEntrySchema.parse({ ...structuredClone(item), id: crypto.randomUUID(), diaryId: diary.id, slot, plannedItemId, consumedAt: null, notes: null, createdAt: now, updatedAt: now })
}
export function copyPlanned(bundle: DiaryBundle, meals: PlannedMeal[]): DiaryBundle {
  const relevant = meals.filter(m => m.revisionId === bundle.diary.plannedRevisionId && m.date === bundle.diary.date)
  const additions = relevant.flatMap(m => m.items.filter(i => !bundle.entries.some(e => e.plannedItemId === i.id)).map(i => consumedFromItem(i, bundle.diary, m.slot, i.id)))
  return validateDiary({ ...bundle, entries: [...bundle.entries, ...additions] })
}
export function changeDiaryPlan(bundle: DiaryBundle, revisionId: string | null, menu: MenuData, profile: Profile): DiaryBundle {
  if (revisionId === bundle.diary.plannedRevisionId) return bundle
  const revision = menu.revisions.find(r => r.id === revisionId)
  const plan = menu.plans.find(p => p.id === revision?.menuPlanId)
  if (revisionId && (!revision || !plan || plan.profileId !== bundle.diary.profileId || bundle.diary.date < plan.startDate || bundle.diary.date > plan.endDate)) throw new Error('Revisione non disponibile per questa data.')
  const incoming = structuredClone(revision?.mealSlotsSnapshot ?? profile.mealSlots)
  const preserved = bundle.diary.mealSlotsSnapshot.filter(s => !incoming.some(i => i.key === s.key) && bundle.entries.some(e => e.slot === s.key))
  return validateDiary({ ...bundle, diary: { ...bundle.diary, plannedRevisionId: revisionId, mealSlotsSnapshot: [...incoming, ...preserved] }, entries: bundle.entries.map(e => ({ ...e, plannedItemId: null })) })
}
export function consumedTotal(diary: DailyDiary, entries: ConsumedEntry[]) {
  if (!entries.length && diary.status === 'open') return null
  return sumNutrients(entries.map(e => calculate(e.snapshot, e.quantity)))
}
