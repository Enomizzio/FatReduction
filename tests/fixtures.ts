import type { Food, Recipe } from '../src/domain/nutrition'
import { foodSnapshot, makeQuantity } from '../src/domain/nutrition'

// Valori aritmetici inventati per test, nessun dato nutrizionale reale.
export function sampleFood(overrides: Partial<Food> = {}): Food {
  const now = '2026-09-13T10:00:00.000Z'
  return { id: crypto.randomUUID(), revision: 1, name: 'Alimento fittizio', normalizedIngredientKeys: ['ingrediente test'],
    basisAmount: 100, basisUnit: 'g', nutrients: { energyKcal: 123, proteinG: 10, carbohydrateG: 20, fatG: 3, fiberG: null },
    source: { kind: 'manual', reference: 'Fixture aritmetica inventata', url: null, retrievedAt: null, isEstimate: true },
    portionConversions: [{ label: 'Porzione test', basisQuantity: 30, source: 'Conversione fittizia' }], archived: false, createdAt: now, updatedAt: now, ...overrides }
}
export function sampleRecipe(food: Food, overrides: Partial<Recipe> = {}): Recipe {
  return { id: crypto.randomUUID(), revision: 1, name: 'Ricetta fittizia', yieldAmount: 80, yieldUnit: 'g', instructions: null,
    ingredients: [{ id: crypto.randomUUID(), foodId: food.id, snapshot: foodSnapshot(food), quantity: makeQuantity(food.basisUnit, 50, food.basisUnit) }],
    archived: false, createdAt: food.createdAt, updatedAt: food.updatedAt, ...overrides }
}
