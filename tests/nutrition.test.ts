import { describe, expect, it } from 'vitest'
import { calculate, foodSchema, foodSnapshot, makeQuantity, matchedExclusions, recipeSchema, recipeSnapshot, sourceSchema, sumNutrients } from '../src/domain/nutrition'
import { sampleFood, sampleRecipe } from './fixtures'

describe('Calcoli e fonti', () => {
  it('mantiene precisione, calorie indipendenti dai macro e fibre sconosciute', () => {
    const f = sampleFood(), snapshot = foodSnapshot(f)
    const result = calculate(snapshot, makeQuantity('g', 12.5, 'g'))
    expect(result.energyKcal).toBe(15.375)
    expect(result.proteinG).toBe(1.25)
    expect(result.fiberG).toBeNull()
    expect(sumNutrients([result, { ...result, fiberG: 2 }]).fiberG).toBeNull()
    expect(sumNutrients([{ ...result, fiberG: 0 }]).fiberG).toBe(0)
  })
  it('calcola porzioni con provenienza e blocca conversione ignota o unità incoerenti', () => {
    const snapshot = foodSnapshot(sampleFood())
    const quantity = makeQuantity('g', 1.5, 'portion', { factor: 30, source: 'Pesata fittizia' })
    expect(calculate(snapshot, quantity).energyKcal).toBeCloseTo(55.35)
    expect(quantity.conversionSource).toBe('Pesata fittizia')
    expect(() => makeQuantity('g', 1, 'ml')).toThrow('Conversione non disponibile')
    expect(() => makeQuantity('g', 1, 'portion', { factor: 20, source: '' })).toThrow()
    expect(() => calculate(snapshot, makeQuantity('ml', 10, 'ml'))).toThrow('non coerenti')
    expect(calculate(snapshot, makeQuantity('g', 10, 'ml', { factor: 0.8, source: 'Densità dichiarata fittizia' })).energyKcal).toBeCloseTo(9.84)
  })
  it('usa resa dichiarata, conserva fonti/conversioni e non modifica snapshot preesistenti', () => {
    const food = sampleFood(), recipe = sampleRecipe(food)
    const snapshot = recipeSnapshot(recipe)
    expect(snapshot.nutrients.energyKcal).toBe(61.5)
    expect(calculate(snapshot, makeQuantity('g', 20, 'g')).energyKcal).toBe(15.375)
    food.nutrients.energyKcal = 999
    food.source.reference = 'Fonte cambiata'
    recipe.ingredients[0].quantity.amount = 999
    expect(snapshot.ingredientSnapshots?.[0].quantity.amount).toBe(50)
    expect(snapshot.ingredientSnapshots?.[0].snapshot.source.reference).toBe('Fixture aritmetica inventata')
    expect(snapshot.nutrients.energyKcal).toBe(61.5)
  })
  it('rileva tartufo dal nome e ingredienti compositi, senza bloccare il salvataggio', () => {
    const food = sampleFood({ name: 'Crema ai TARTUFI', normalizedIngredientKeys: ['arachidi'] })
    const recipe = sampleRecipe(food)
    expect(matchedExclusions(recipeSnapshot(recipe), ['tartufo', 'arachidi'])).toEqual(['truffle', 'arachidi'])
    expect(matchedExclusions(foodSnapshot(sampleFood({ name: 'Burro di arachidi' })), ['arachidi'])).toEqual(['arachidi'])
    expect(recipeSchema.safeParse(recipe).success).toBe(true)
  })
  it('rifiuta numeri invalidi, overflow, URL attivi e fonti manuali non stimate', () => {
    const food = sampleFood()
    for (const amount of [0, -1, NaN, Infinity]) expect(() => makeQuantity('g', amount, 'g')).toThrow()
    expect(foodSchema.safeParse({ ...food, nutrients: { ...food.nutrients, fatG: -1 } }).success).toBe(false)
    expect(sourceSchema.safeParse({ ...food.source, url: 'javascript:alert(1)' }).success).toBe(false)
    expect(sourceSchema.safeParse({ ...food.source, isEstimate: false }).success).toBe(false)
    expect(() => calculate(foodSnapshot(food), makeQuantity('g', Number.MAX_VALUE, 'portion', { factor: 20, source: 'Test' }))).toThrow()
    expect(recipeSchema.safeParse({ ...sampleRecipe(food), ingredients: [] }).success).toBe(false)
    expect(recipeSchema.safeParse({ ...sampleRecipe(food), yieldAmount: 0 }).success).toBe(false)
  })
})
