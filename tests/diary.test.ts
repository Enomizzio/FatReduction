import { openDB } from 'idb'
import { describe, expect, it, vi } from 'vitest'
import { defaultProfile } from '../src/domain/profile'
import { addDays, applySlots, newMenu, reviseMenu, todayLocal, type MenuData } from '../src/domain/menu'
import { changeDiaryPlan, consumedFromItem, consumedTotal, copyPlanned, newDiary, validateDiary, validateRecordedDate } from '../src/domain/diary'
import { foodSnapshot, makeQuantity } from '../src/domain/nutrition'
import { initializeProfile, openDatabase, saveProfile } from '../src/storage/database'
import { readMenus, saveMenu, selectDayPlan } from '../src/services/menu'
import { readDiary, readDiaryHistory, saveDiary } from '../src/services/diary'
import { saveFood } from '../src/services/catalog'
import { sampleFood } from './fixtures'

const emptyMenu: MenuData = { plans: [], revisions: [], meals: [], selections: [] }
const options = { expectedUpdatedAt: null, expectedWeightUpdatedAt: null }
const date = '2026-09-10'
const itemFor = (food: ReturnType<typeof sampleFood>) => ({ id: crypto.randomUUID(), kind: 'food' as const, catalogId: food.id, snapshot: foodSnapshot(food), quantity: makeQuantity('g', 100, 'g') })
async function setup() {
  const name = crypto.randomUUID(), profile = await initializeProfile(name), food = await saveFood(sampleFood(), null, name)
  const draft = newMenu(profile, 'Piano fittizio', date, 1); draft.meals[0].items = [itemFor(food)]
  const plan = await saveMenu(draft, null, name)
  await selectDayPlan(profile.id, date, plan.revision.id, null, name)
  const menu = await readMenus(profile.id, name)
  return { name, profile, food, plan, menu }
}
describe('Diario e peso', () => {
  it('rifiuta date future e impossibili, distingue aperto/completo e fibre mancanti', () => {
    expect(() => validateRecordedDate(addDays(todayLocal(), 1))).toThrow('futura')
    expect(() => validateRecordedDate('2026-02-29')).toThrow()
    const bundle = newDiary(defaultProfile(), date, emptyMenu)
    expect(bundle.measurement).toBeNull(); expect(bundle.entries).toEqual([])
    expect(consumedTotal(bundle.diary, bundle.entries)).toBeNull()
    expect(consumedTotal({ ...bundle.diary, status: 'complete' }, [])?.energyKcal).toBe(0)
    bundle.entries = [consumedFromItem(itemFor(sampleFood()), bundle.diary, 'breakfast')]
    expect(consumedTotal(bundle.diary, bundle.entries)?.fiberG).toBeNull()
    for (const amount of [0, -1, NaN, Infinity]) expect(() => validateDiary({ ...bundle, entries: bundle.entries.map(e => ({ ...e, quantity: { ...e.quantity, amount } })) })).toThrow()
  })
  it('copia esplicita idempotente, consumato indipendente e storico immutato dopo revisioni/archivio', async () => {
    const { name, profile, food, plan, menu } = await setup()
    expect(await readDiary(profile.id, date, name)).toBeNull()
    let bundle = newDiary(profile, date, menu)
    expect(bundle.entries).toEqual([])
    bundle = copyPlanned(copyPlanned(bundle, menu.meals), menu.meals)
    expect(bundle.entries).toHaveLength(1)
    bundle.entries[0].quantity.amount = 50
    const now = new Date().toISOString()
    bundle.measurement = { id: crypto.randomUUID(), profileId: profile.id, date, weightKg: 87.5, notes: 'Fixture', createdAt: now, updatedAt: now }
    bundle.diary = { ...bundle.diary, status: 'complete', activity: [{ description: 'Attività fittizia', durationMinutes: 20 }], hunger: 3, energy: 4, mood: 2, notes: '<script>test fittizio</script>' }
    const saved = await saveDiary(bundle, options, name)
    await saveFood({ ...food, archived: true, nutrients: { ...food.nutrients, energyKcal: 999 } }, food.revision, name)
    const revision = reviseMenu(plan); revision.meals[0].items[0].quantity.amount = 200
    const next = await saveMenu(revision, plan.revision.id, name)
    await selectDayPlan(profile.id, date, next.revision.id, menu.selections[0].updatedAt, name)
    expect(await readDiary(profile.id, date, name)).toEqual(saved)
    expect(consumedTotal(saved.diary, saved.entries)?.energyKcal).toBe(61.5)
    expect((await readMenus(profile.id, name)).meals.find(m => m.revisionId === plan.revision.id && m.slot === 'breakfast')?.items[0].quantity.amount).toBe(100)
    expect((await readDiaryHistory(profile.id, name)).measurements).toHaveLength(1)
  })
  it('peso unico aggiornabile, conflitti di due schede e cancellazioni confermate', async () => {
    const { name, profile, menu } = await setup(), draft = copyPlanned(newDiary(profile, date, menu), menu.meals), now = new Date().toISOString()
    draft.measurement = { id: crypto.randomUUID(), profileId: profile.id, date, weightKg: 80, notes: null, createdAt: now, updatedAt: now }
    const first = await saveDiary(draft, options, name)
    const expected = { expectedUpdatedAt: first.diary.updatedAt, expectedWeightUpdatedAt: first.measurement!.updatedAt }
    await expect(saveDiary({ ...first, measurement: { ...first.measurement!, id: crypto.randomUUID() } }, expected, name)).rejects.toThrow('Una sola')
    const updated = await saveDiary({ ...first, measurement: { ...first.measurement!, weightKg: 79.5 } }, expected, name)
    await expect(saveDiary(first, expected, name)).rejects.toThrow('altra scheda')
    await expect(saveDiary(newDiary(profile, date, menu), options, name)).rejects.toThrow('altra scheda')
    const latest = { expectedUpdatedAt: updated.diary.updatedAt, expectedWeightUpdatedAt: updated.measurement!.updatedAt }
    await expect(saveDiary({ ...updated, measurement: null }, latest, name)).rejects.toThrow('Conferma')
    await expect(saveDiary({ ...updated, entries: [] }, latest, name)).rejects.toThrow('Conferma')
    const db = await openDatabase(name)
    await expect(db.add('bodyMeasurements', { ...updated.measurement!, id: crypto.randomUUID() })).rejects.toMatchObject({ name: 'ConstraintError' }); db.close()
    const removed = await saveDiary({ ...updated, entries: [], measurement: null }, { ...latest, confirmEntryRemoval: true, confirmMeasurementRemoval: true }, name)
    expect(removed.entries).toEqual([]); expect(removed.measurement).toBeNull()
  })
  it('cambio previsto consapevole conserva slot con consumi e snapshot', async () => {
    const { name, profile, plan, menu } = await setup()
    const first = await saveDiary(copyPlanned(newDiary(profile, date, menu), menu.meals), options, name)
    const changed = await saveProfile({ ...profile, mealSlots: [{ key: 'new', label: 'Nuova occasione' }] }, profile.updatedAt, name)
    const draft = reviseMenu(plan); draft.meals.forEach(m => { m.items = [] })
    const next = await saveMenu(applySlots(draft, changed.mealSlots), plan.revision.id, name)
    const menus = await readMenus(profile.id, name), updated = changeDiaryPlan(first, next.revision.id, menus, changed)
    expect(updated.diary.mealSlotsSnapshot.map(s => s.key)).toEqual(['new', 'breakfast'])
    expect(updated.entries[0].snapshot).toEqual(first.entries[0].snapshot)
    expect(updated.entries[0].plannedItemId).toBeNull()
    const expected = { expectedUpdatedAt: first.diary.updatedAt, expectedWeightUpdatedAt: null }
    await expect(saveDiary(updated, expected, name)).rejects.toThrow('Conferma')
    const saved = await saveDiary(updated, { ...expected, confirmPlanChange: true }, name)
    expect((await readDiary(profile.id, date, name))?.diary.plannedRevisionId).toBe(next.revision.id)
    expect(saved.entries[0].quantity).toEqual(first.entries[0].quantity)
  })
  it('consente alimenti esclusi realmente consumati ma rifiuta snapshot falsi e riferimenti orfani', async () => {
    const { name, profile } = await setup(), truffle = await saveFood(sampleFood({ name: 'Tartufo fittizio' }), null, name)
    const draft = newDiary(profile, date, emptyMenu)
    draft.entries = [consumedFromItem(itemFor(truffle), draft.diary, 'breakfast')]
    const forged = structuredClone(draft); forged.entries[0].snapshot.nutrients.energyKcal = 999
    await expect(saveDiary(forged, options, name)).rejects.toThrow('Fonte')
    await expect(saveDiary({ ...draft, entries: draft.entries.map(e => ({ ...e, plannedItemId: crypto.randomUUID() })) }, options, name)).rejects.toThrow('pianificata')
    expect(await readDiary(profile.id, date, name)).toBeNull()
    expect((await saveDiary(draft, options, name)).entries[0].snapshot.displayName).toBe('Tartufo fittizio')
  })
  it('fallimento peso annulla consumi e diario, nuovo tentativo conserva gli input', async () => {
    const { name, profile, menu } = await setup(), draft = copyPlanned(newDiary(profile, date, menu), menu.meals), now = new Date().toISOString()
    draft.measurement = { id: crypto.randomUUID(), profileId: profile.id, date, weightKg: 80, notes: null, createdAt: now, updatedAt: now }
    const original = IDBObjectStore.prototype.put
    const mock = vi.spyOn(IDBObjectStore.prototype, 'put').mockImplementation(function (this: IDBObjectStore, ...args) { if (this.name === 'bodyMeasurements') throw new DOMException('quota', 'QuotaExceededError'); return original.apply(this, args) })
    try { await expect(saveDiary(draft, options, name)).rejects.toMatchObject({ name: 'QuotaExceededError' }) } finally { mock.mockRestore() }
    expect(await readDiary(profile.id, date, name)).toBeNull()
    const db = await openDatabase(name); expect(await db.count('consumedEntries')).toBe(0); expect(await db.count('bodyMeasurements')).toBe(0); db.close()
    expect((await saveDiary(draft, options, name)).measurement?.weightKg).toBe(80)
  })
  it('migra v3 mantenendo piani, selezioni e profilo, senza creare pesi o diari', async () => {
    const name = crypto.randomUUID(), profile = defaultProfile(), plan = newMenu(profile, 'Fixture', date, 1)
    const db = await openDB(name, 3, { upgrade(db) {
      for (const store of ['profiles', 'foods', 'recipes', 'menuPlans', 'menuPlanRevisions', 'plannedMeals', 'dayPlanSelections']) db.createObjectStore(store, { keyPath: 'id' })
      db.createObjectStore('foodRevisions', { keyPath: ['id', 'revision'] }); db.createObjectStore('recipeRevisions', { keyPath: ['id', 'revision'] })
    } })
    await db.put('profiles', profile); await db.put('menuPlans', plan.plan); await db.put('menuPlanRevisions', plan.revision)
    for (const m of plan.meals) await db.put('plannedMeals', m)
    const selection = { id: crypto.randomUUID(), profileId: profile.id, date, revisionId: plan.revision.id, createdAt: plan.plan.createdAt, updatedAt: plan.plan.createdAt }
    await db.put('dayPlanSelections', selection); db.close()
    expect(await initializeProfile(name)).toEqual(profile)
    expect((await readMenus(profile.id, name)).selections).toEqual([selection])
    expect(await readDiary(profile.id, date, name)).toBeNull()
    expect(await readDiaryHistory(profile.id, name)).toEqual({ diaries: [], measurements: [] })
  })
})
