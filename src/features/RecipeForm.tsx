import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Field, Select } from '../components/Field'
import { NutrientsView, SourceView, formatNumber } from '../components/NutritionDetails'
import { foodSnapshot, makeQuantity, matchedExclusions, recipeSchema, recipeSnapshot, type Food, type Recipe, type RecipeIngredient } from '../domain/nutrition'
import { keyLabel, parseDecimal } from '../domain/profile'
import { saveRecipe } from '../services/catalog'
import { errorMessage } from '../services/errors'

export function RecipeForm({ recipe, foods, exclusions, onSaved, onCancel }: { recipe?: Recipe; foods: Food[]; exclusions: string[]; onSaved: (recipe: Recipe) => void; onCancel: () => void }) {
  const heading = useRef<HTMLHeadingElement>(null)
  useEffect(() => { heading.current?.focus() }, [])
  const [name, setName] = useState(recipe?.name ?? '')
  const [yieldAmount, setYieldAmount] = useState(String(recipe?.yieldAmount ?? ''))
  const [yieldUnit, setYieldUnit] = useState<'g' | 'ml'>(recipe?.yieldUnit ?? 'g')
  const [instructions, setInstructions] = useState(recipe?.instructions ?? '')
  const [ingredients, setIngredients] = useState<RecipeIngredient[]>(recipe?.ingredients ?? [])
  const [ingredientAmounts, setIngredientAmounts] = useState<Record<string, string>>({})
  const [foodId, setFoodId] = useState('')
  const [amount, setAmount] = useState('')
  const [unit, setUnit] = useState('g')
  const [error, setError] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [busy, setBusy] = useState(false)
  const selected = foods.find(f => f.id === foodId)
  const now = new Date().toISOString()
  const draft = { id: recipe?.id ?? crypto.randomUUID(), revision: recipe?.revision ?? 1, name,
    ingredients: ingredients.map(i => ({ ...i, quantity: { ...i.quantity, amount: parseDecimal(ingredientAmounts[i.id] ?? String(i.quantity.amount)) } })),
    yieldAmount: parseDecimal(yieldAmount), yieldUnit, instructions: instructions || null, archived: recipe?.archived ?? false, createdAt: recipe?.createdAt ?? now, updatedAt: now }
  let preview
  try { preview = recipeSnapshot(draft) } catch { /* Il form incompleto non presenta totali fittizi. */ }
  const matches = preview ? matchedExclusions(preview, exclusions) : []
  function addIngredient() {
    setError('')
    try {
      if (!selected) throw new Error('Scegli un alimento dal catalogo.')
      const portion = unit.startsWith('portion:') ? selected.portionConversions[Number(unit.split(':')[1])] : undefined
      const quantity = makeQuantity(selected.basisUnit, parseDecimal(amount), portion ? 'portion' : unit as 'g' | 'ml' | 'portion', portion ? { factor: portion.basisQuantity, source: portion.source } : undefined)
      setIngredients([...ingredients, { id: crypto.randomUUID(), foodId: selected.id, snapshot: foodSnapshot(selected), quantity }])
      setAmount('')
    } catch (e) { setError(errorMessage(e)) }
  }
  async function submit(event: FormEvent) {
    event.preventDefault(); setError(''); setErrors({})
    const parsed = recipeSchema.safeParse(draft)
    if (!parsed.success) { setError('Controlla nome, ingredienti e resa. Ricetta non salvata.'); setErrors(Object.fromEntries(parsed.error.issues.map(i => [i.path.join('.'), 'Valore obbligatorio o non valido.']))); return }
    setBusy(true)
    try { onSaved(await saveRecipe(parsed.data, recipe?.revision ?? null)) } catch (e) { setError(errorMessage(e)) } finally { setBusy(false) }
  }
  return <form className="panel stack" onSubmit={submit} noValidate><h2 ref={heading} tabIndex={-1}>{recipe ? 'Modifica ricetta' : 'Nuova ricetta'}</h2><p className="muted">Somma i nutrienti degli ingredienti e indica la resa finale. Il calcolo non applica fattori di cottura o ritenzione.</p>
    <fieldset disabled={busy} className="form-body stack"><Field label="Nome ricetta" value={name} maxLength={200} error={errors.name} onChange={e => setName(e.target.value)} />
    <h3>Ingredienti</h3><p className="muted">Gli ingredienti già inseriti conservano la fonte e i valori usati. Per adottare un alimento aggiornato, rimuovi l’ingrediente e aggiungilo di nuovo.</p>
    {ingredients.map((i, index) => <div key={i.id} className="ingredient-box stack"><strong>{i.snapshot.displayName}</strong>
      <Field label={`Quantità ingrediente ${index + 1} (${i.quantity.unit === 'portion' ? 'porzioni' : i.quantity.unit})`} inputMode="decimal" value={ingredientAmounts[i.id] ?? String(i.quantity.amount)} error={errors[`ingredients.${index}.quantity.amount`]} onChange={e => setIngredientAmounts({ ...ingredientAmounts, [i.id]: e.target.value })} />
      {i.quantity.unit !== i.quantity.basisUnit && <p>1 porzione = {formatNumber(i.quantity.conversionToBasis)} {i.quantity.basisUnit} · {i.quantity.conversionSource}</p>}<SourceView source={i.snapshot.source} /><button type="button" onClick={() => setIngredients(ingredients.filter((_, n) => n !== index))}>Rimuovi ingrediente {index + 1}</button></div>)}
    {!ingredients.length && <p>Nessun ingrediente aggiunto.</p>}
    <div className="ingredient-box stack"><Select label="Alimento da aggiungere" value={foodId} onChange={id => { setFoodId(id); setUnit(foods.find(f => f.id === id)?.basisUnit ?? 'g') }}><option value="">Seleziona un alimento</option>{foods.filter(f => !f.archived).map(f => <option key={f.id} value={f.id}>{f.name}</option>)}</Select>
    <div className="form-grid"><Field label="Quantità ingrediente" inputMode="decimal" value={amount} onChange={e => setAmount(e.target.value)} /><Select label="Unità ingrediente" value={unit} onChange={setUnit}><option value="g">g</option><option value="ml">ml</option><option value="portion">Porzione senza conversione</option>{selected?.portionConversions.map((p, i) => <option key={i} value={`portion:${i}`}>{p.label} ({p.basisQuantity} {selected.basisUnit})</option>)}</Select></div><button type="button" disabled={ingredients.length >= 100} onClick={addIngredient}>+ Aggiungi ingrediente</button></div>
    <div className="form-grid"><Field label="Resa finale" inputMode="decimal" hint="Quantità totale ottenuta, maggiore di zero." value={yieldAmount} error={errors.yieldAmount} onChange={e => setYieldAmount(e.target.value)} /><Select label="Unità della resa" value={yieldUnit} onChange={v => setYieldUnit(v as 'g' | 'ml')}><option value="g">g</option><option value="ml">ml</option></Select></div>
    <label className="field"><span>Istruzioni (facoltative)</span><textarea value={instructions} maxLength={5000} rows={4} onChange={e => setInstructions(e.target.value)} /></label>
    {preview && <div><h3>Totale ricetta · {formatNumber(preview.basisAmount)} {preview.basisUnit}</h3><NutrientsView nutrients={preview.nutrients} /><SourceView source={preview.source} /></div>}
    {matches.length > 0 && <p className="notice">Contiene alimenti esclusi: {matches.map(keyLabel).join(', ')}. La ricetta può essere conservata; sarà esclusa dalle proposte.</p>}
    {error && <div className="notice error" role="alert">{error}</div>}
    <div className="actions"><button type="submit" className="primary">{busy ? 'Salvataggio…' : 'Salva ricetta'}</button><button type="button" onClick={onCancel}>Annulla</button></div>
    </fieldset>
  </form>
}
