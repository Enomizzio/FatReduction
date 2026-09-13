import { openDB } from 'idb'
import { describe, it, expect } from 'vitest'
import { defaultProfile } from '../src/domain/profile'
import { addDays, applySlots, chooseSubstitution, localDateSchema, menuTotal, newMenu, reviseMenu, validateMenu, type PlannedItem } from '../src/domain/menu'
import { foodSnapshot, makeQuantity, recipeSnapshot } from '../src/domain/nutrition'
import { initializeProfile, openDatabase, saveProfile } from '../src/storage/database'
import { readMenus, saveMenu, selectDayPlan } from '../src/services/menu'
import { saveFood, saveRecipe } from '../src/services/catalog'
import { sampleFood, sampleRecipe } from './fixtures'

export function sampleItem(food = sampleFood(), amount = 100): PlannedItem {
  return { id: crypto.randomUUID(), kind: 'food', catalogId: food.id, snapshot: foodSnapshot(food), quantity: makeQuantity('g', amount, 'g') }
}
describe('Piani e revisioni', () => {
  it('date reali, settimana su cambio anno, cinque slot e alternative senza doppio conteggio', () => {
    expect(localDateSchema.safeParse('2025-02-29').success).toBe(false)
    expect(addDays('2024-02-28', 1)).toBe('2024-02-29')
    const bundle = newMenu(defaultProfile(), 'Fixture', '2026-12-29', 7)
    expect(bundle.plan.endDate).toBe('2027-01-04'); expect(bundle.meals).toHaveLength(35)
    const meal = bundle.meals[0], item = sampleItem(), alt = sampleItem(sampleFood(), 50)
    meal.items = [item]; meal.substitutions = [alt]
    expect(menuTotal(bundle.meals).energyKcal).toBe(123)
    bundle.meals[0] = chooseSubstitution(meal, alt.id, item.id)
    expect(menuTotal(bundle.meals).energyKcal).toBe(61.5)
    expect(bundle.meals[0].substitutions).toEqual([])
    expect(menuTotal(bundle.meals).fiberG).toBeNull()
    expect(() => validateMenu({ ...bundle, meals: bundle.meals.slice(1) })).toThrow('Occasioni')
    expect(() => applySlots(bundle, defaultProfile().mealSlots.slice(1))).toThrow('Sposta')
  })
  it('migra v2 preservando profilo e catalogo', async () => {
    const name = crypto.randomUUID(), profile = defaultProfile(), food = sampleFood()
    const db = await openDB(name, 2, { upgrade(db) { db.createObjectStore('profiles', { keyPath: 'id' }); db.createObjectStore('foods', { keyPath: 'id' }); db.createObjectStore('foodRevisions', { keyPath: ['id', 'revision'] }); db.createObjectStore('recipes', { keyPath: 'id' }); db.createObjectStore('recipeRevisions', { keyPath: ['id', 'revision'] }) } })
    await db.put('profiles', profile); await db.put('foods', food); await db.put('foodRevisions', food); db.close()
    expect(await initializeProfile(name)).toEqual(profile)
    expect((await readMenus(profile.id, name)).plans).toEqual([])
    const migrated = await openDatabase(name); expect(await migrated.get('foods', food.id)).toEqual(food); migrated.close()
  })
  it('salva revisioni immutabili, occasioni storiche, sovrapposizioni e selezione esplicita', async () => {
    const name = crypto.randomUUID(), profile = await initializeProfile(name), food = await saveFood(sampleFood(), null, name)
    const draft = newMenu(profile, 'Fixture', '2026-09-10', 1); draft.meals[0].items = [sampleItem(food)]
    const first = await saveMenu(draft, null, name)
    const selection = await selectDayPlan(profile.id, '2026-09-10', first.revision.id, null, name)
    const changed = await saveProfile({ ...profile, mealSlots: [...profile.mealSlots, { key: 'extra', label: 'Extra' }] }, profile.updatedAt, name)
    const next = applySlots(reviseMenu(first), changed.mealSlots); next.meals[0].items[0].quantity.amount = 50
    await saveFood({ ...food, archived: true }, food.revision, name)
    const second = await saveMenu(next, first.revision.id, name)
    await expect(saveMenu(reviseMenu(first), first.revision.id, name)).rejects.toThrow('altra scheda')
    const overlap = await saveMenu(newMenu(changed, 'Altro piano', '2026-09-10', 1), null, name)
    let data = await readMenus(profile.id, name)
    expect(data.plans).toHaveLength(2); expect(data.selections[0].revisionId).toBe(first.revision.id)
    expect(data.revisions.find(r => r.id === first.revision.id)?.mealSlotsSnapshot).toHaveLength(5)
    expect(data.revisions.find(r => r.id === second.revision.id)?.mealSlotsSnapshot).toHaveLength(6)
    expect(menuTotal(data.meals.filter(m => m.revisionId === first.revision.id)).energyKcal).toBe(123)
    await selectDayPlan(profile.id, selection.date, overlap.revision.id, selection.updatedAt, name)
    await expect(selectDayPlan(profile.id, selection.date, first.revision.id, selection.updatedAt, name)).rejects.toThrow('altra scheda')
    await expect(selectDayPlan(profile.id, '2026-09-11', first.revision.id, null, name)).rejects.toThrow('data')
    data = await readMenus(profile.id, name); expect(data.selections).toHaveLength(1)
  })
  it('rifiuta esclusioni di alimento/ricetta, snapshot falsi e orfani senza salvare piani parziali', async () => {
    const name = crypto.randomUUID(), profile = await initializeProfile(name)
    const food = await saveFood(sampleFood({ name: 'Crema ai tartufi' }), null, name), recipe = await saveRecipe(sampleRecipe(food), null, name)
    const draft = newMenu(profile, 'Fixture', '2026-09-10', 1)
    draft.meals[0].substitutions = [sampleItem(food)]
    await expect(saveMenu(draft, null, name)).rejects.toThrow('esclusi')
    draft.meals[0].substitutions = [{ ...sampleItem(food), kind: 'recipe', catalogId: recipe.id, snapshot: recipeSnapshot(recipe) }]
    await expect(saveMenu(draft, null, name)).rejects.toThrow('esclusi')
    draft.meals[0].substitutions = [sampleItem()]
    await expect(saveMenu(draft, null, name)).rejects.toThrow('Fonte')
    draft.meals[0].substitutions = [sampleItem(food)]; draft.meals[0].substitutions[0].snapshot.nutrients.energyKcal = 99
    await expect(saveMenu(draft, null, name)).rejects.toThrow('Fonte')
    expect((await readMenus(profile.id, name)).plans).toEqual([])
  })
  it('collisione nella revisione annulla anche la testa del piano', async () => {
    const name = crypto.randomUUID(), profile = await initializeProfile(name), draft = newMenu(profile, 'Fixture', '2026-09-10', 1)
    const db = await openDatabase(name); await db.add('menuPlanRevisions', draft.revision); db.close()
    await expect(saveMenu(draft, null, name)).rejects.toMatchObject({ name: 'ConstraintError' })
    const after = await openDatabase(name); expect(await after.count('menuPlans')).toBe(0); expect(await after.count('plannedMeals')).toBe(0); after.close()
  })
})
