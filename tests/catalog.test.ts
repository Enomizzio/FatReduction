import { openDB } from 'idb'
import { describe, expect, it } from 'vitest'
import { defaultProfile } from '../src/domain/profile'
import { calculate, makeQuantity, recipeSnapshot } from '../src/domain/nutrition'
import { initializeProfile, openDatabase } from '../src/storage/database'
import { readCatalog, saveFood, saveRecipe } from '../src/services/catalog'
import { sampleFood, sampleRecipe } from './fixtures'

describe('Catalogo persistente', () => {
  it('migra v1 a v2 senza cambiare il profilo e rifiuta versioni future', async () => {
    const name = crypto.randomUUID(), profile = { ...defaultProfile(), ageYears: 47 }
    const old = await openDB(name, 1, { upgrade(db) { db.createObjectStore('profiles', { keyPath: 'id' }) } })
    await old.put('profiles', profile); old.close()
    expect(await initializeProfile(name)).toEqual(profile)
    expect(await readCatalog(name)).toEqual({ foods: [], recipes: [] })
    const db = await openDatabase(name)
    expect(db.version).toBe(2); expect([...db.objectStoreNames]).toEqual(['foodRevisions', 'foods', 'profiles', 'recipeRevisions', 'recipes']); db.close()
    const futureName = crypto.randomUUID(), future = await openDB(futureName, 99); future.close()
    await expect(openDatabase(futureName)).rejects.toMatchObject({ name: 'VersionError' })
  })
  it('modifiche e archiviazione mantengono revisioni, snapshot e totali derivati', async () => {
    const name = crypto.randomUUID()
    const food = await saveFood(sampleFood(), null, name)
    const recipe = await saveRecipe(sampleRecipe(food), null, name)
    const snapshot = recipeSnapshot(recipe)
    const revised = await saveFood({ ...food, nutrients: { ...food.nutrients, energyKcal: 999 } }, food.revision, name)
    const archived = await saveFood({ ...revised, archived: true }, revised.revision, name)
    expect(archived.revision).toBe(3)
    const updatedRecipe = await saveRecipe({ ...recipe, name: 'Nome aggiornato' }, recipe.revision, name)
    const archivedRecipe = await saveRecipe({ ...updatedRecipe, archived: true }, updatedRecipe.revision, name)
    const data = await readCatalog(name)
    expect(data.foods[0].archived).toBe(true); expect(data.recipes[0].archived).toBe(true)
    expect(recipeSnapshot(data.recipes[0]).nutrients).toEqual(snapshot.nutrients)
    expect(calculate(snapshot, makeQuantity('g', 20, 'g')).energyKcal).toBe(15.375)
    const db = await openDatabase(name)
    expect(await db.count('foodRevisions')).toBe(3); expect(await db.count('recipeRevisions')).toBe(3)
    expect(await db.get('foodRevisions', [food.id, 1])).toEqual(food)
    expect(await db.get('recipeRevisions', [recipe.id, 1])).toEqual(recipe)
    expect(await db.get('recipes', archivedRecipe.id)).not.toHaveProperty('nutrients')
    db.close()
    await expect(saveFood(food, 1, name)).rejects.toThrow('altra scheda')
  })
  it('rifiuta riferimenti orfani, snapshot falsificati e nuovi usi di archiviati senza scritture parziali', async () => {
    const name = crypto.randomUUID()
    const unsavedFood = sampleFood()
    await expect(saveRecipe(sampleRecipe(unsavedFood), null, name)).rejects.toThrow('Fonte')
    const food = await saveFood(unsavedFood, null, name)
    const forged = sampleRecipe(food); forged.ingredients[0].snapshot.nutrients.energyKcal = 999
    await expect(saveRecipe(forged, null, name)).rejects.toThrow('Fonte')
    await saveFood({ ...food, archived: true }, food.revision, name)
    await expect(saveRecipe(sampleRecipe(food), null, name)).rejects.toThrow('archiviato')
    const db = await openDatabase(name)
    expect(await db.count('recipes')).toBe(0); expect(await db.count('recipeRevisions')).toBe(0); db.close()
  })
  it('una collisione nello storico causa rollback anche della testa del catalogo', async () => {
    const name = crypto.randomUUID(), input = sampleFood()
    const db = await openDatabase(name)
    await db.add('foodRevisions', input); db.close()
    await expect(saveFood(input, null, name)).rejects.toMatchObject({ name: 'ConstraintError' })
    expect((await readCatalog(name)).foods).toEqual([])
  })
})
