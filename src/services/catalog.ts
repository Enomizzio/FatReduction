import { foodSchema, foodSnapshot, ingredientKeys, recipeSchema, recipeSnapshot, type Food, type Recipe } from '../domain/nutrition'
import { DATABASE_NAME, withDatabase } from '../storage/database'

export async function readCatalog(name = DATABASE_NAME): Promise<{ foods: Food[]; recipes: Recipe[] }> {
  return withDatabase(async db => {
    const tx = db.transaction(['foods', 'recipes'], 'readonly')
    const [foods, recipes] = await Promise.all([tx.objectStore('foods').getAll(), tx.objectStore('recipes').getAll()])
    await tx.done
    return { foods: foods.map(f => { const valid = foodSchema.parse(f); foodSnapshot(valid); return valid }), recipes: recipes.map(r => { const valid = recipeSchema.parse(r); recipeSnapshot(valid); return valid }) }
  }, name)
}

export async function saveFood(input: Food, expectedRevision: number | null, name = DATABASE_NAME): Promise<Food> {
  const valid = foodSchema.parse({ ...input, normalizedIngredientKeys: ingredientKeys(input.name, input.normalizedIngredientKeys) })
  return withDatabase(async db => {
    const tx = db.transaction(['foods', 'foodRevisions'], 'readwrite')
    try {
      const current = await tx.objectStore('foods').get(valid.id)
      if ((current?.revision ?? null) !== expectedRevision) throw new Error('Alimento modificato in un’altra scheda. Annota i dati e ricarica la pagina.')
      const saved = foodSchema.parse({ ...valid, revision: (current?.revision ?? 0) + 1, createdAt: current?.createdAt ?? new Date().toISOString(), updatedAt: new Date().toISOString() })
      // Verifica anche che il futuro snapshot sia calcolabile e valido.
      foodSnapshot(saved)
      await tx.objectStore('foods').put(saved)
      await tx.objectStore('foodRevisions').add(saved)
      await tx.done
      return saved
    } catch (error) { try { tx.abort() } catch { /* Transazione già terminata. */ } await tx.done.catch(() => {}); throw error }
  }, name)
}

export async function saveRecipe(input: Recipe, expectedRevision: number | null, name = DATABASE_NAME): Promise<Recipe> {
  const valid = recipeSchema.parse(input)
  recipeSnapshot(valid)
  return withDatabase(async db => {
    const tx = db.transaction(['recipes', 'recipeRevisions', 'foodRevisions', 'foods'], 'readwrite')
    try {
      const current = await tx.objectStore('recipes').get(valid.id)
      if ((current?.revision ?? null) !== expectedRevision) throw new Error('Ricetta modificata in un’altra scheda. Annota i dati e ricarica la pagina.')
      for (const ingredient of valid.ingredients) {
        const food = await tx.objectStore('foodRevisions').get([ingredient.foodId, ingredient.snapshot.catalogRevision])
        if (!food || JSON.stringify(foodSnapshot(food)) !== JSON.stringify(ingredient.snapshot)) throw new Error('Fonte dell’ingrediente non valida: seleziona di nuovo l’alimento.')
        const previous = current?.ingredients.find(i => i.id === ingredient.id)
        const unchangedSnapshot = previous && JSON.stringify(previous.snapshot) === JSON.stringify(ingredient.snapshot)
        const latest = await tx.objectStore('foods').get(ingredient.foodId)
        if (!unchangedSnapshot && (!latest || latest.archived || latest.revision !== ingredient.snapshot.catalogRevision)) throw new Error('Alimento aggiornato o archiviato: riapri il catalogo prima di aggiungerlo.')
      }
      const saved = recipeSchema.parse({ ...valid, revision: (current?.revision ?? 0) + 1, createdAt: current?.createdAt ?? new Date().toISOString(), updatedAt: new Date().toISOString() })
      await tx.objectStore('recipes').put(saved)
      await tx.objectStore('recipeRevisions').add(saved)
      await tx.done
      return saved
    } catch (error) { try { tx.abort() } catch { /* Transazione già terminata. */ } await tx.done.catch(() => {}); throw error }
  }, name)
}
