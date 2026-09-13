import { useState } from 'react'
import { calculate, foodSnapshot, recipeSnapshot, makeQuantity, matchedExclusions, type Food, type Recipe } from '../domain/nutrition'
import { plannedItemSchema, type PlannedItem } from '../domain/menu'
import { parseDecimal } from '../domain/profile'
import { Field, Select } from './Field'
import { formatNumber, NutrientsView, SourceView } from './NutritionDetails'
import { errorMessage } from '../services/errors'

export function ItemView({ item }: { item: PlannedItem }) {
  return <div className="item-details"><strong>{item.snapshot.displayName}</strong><p>{formatNumber(item.quantity.amount)} {item.quantity.unit === 'portion' ? 'porzioni' : item.quantity.unit}</p>
    <NutrientsView nutrients={calculate(item.snapshot, item.quantity)} /><SourceView source={item.snapshot.source} />
    {item.quantity.conversionSource && <p className="source">Conversione: {item.quantity.conversionToBasis} {item.quantity.basisUnit} · {item.quantity.conversionSource}</p>}
    {item.snapshot.ingredientSnapshots && <details><summary>Fonti degli ingredienti</summary>{item.snapshot.ingredientSnapshots.map((i, n) => <div key={n}><strong>{i.snapshot.displayName}</strong><p>{formatNumber(i.quantity.amount)} {i.quantity.unit}</p><SourceView source={i.snapshot.source} />{i.quantity.conversionSource && <p className="source">Conversione: {i.quantity.conversionSource}</p>}</div>)}</details>}
  </div>
}

export function ItemPicker({ foods, recipes, exclusions = [], onAdd, label = 'Aggiungi voce' }: { foods: Food[]; recipes: Recipe[]; exclusions?: string[]; onAdd: (item: PlannedItem) => void; label?: string }) {
  const [selected, setSelected] = useState(''), [amount, setAmount] = useState('100'), [unit, setUnit] = useState(''), [error, setError] = useState('')
  const options = [...foods.filter(f => !f.archived).map(f => ({ id: f.id, kind: 'food' as const, snapshot: foodSnapshot(f), conversions: f.portionConversions })), ...recipes.filter(r => !r.archived).map(r => ({ id: r.id, kind: 'recipe' as const, snapshot: recipeSnapshot(r), conversions: [] as Food['portionConversions'] }))].filter(i => !matchedExclusions(i.snapshot, exclusions).length)
  const choice = options.find(i => `${i.kind}:${i.id}` === selected)
  const add = () => {
    try {
      if (!choice) throw new Error('Seleziona un alimento o una ricetta.')
      const portion = unit.startsWith('portion:') ? choice.conversions[Number(unit.split(':')[1])] : undefined
      const quantity = makeQuantity(choice.snapshot.basisUnit, parseDecimal(amount), portion ? 'portion' : choice.snapshot.basisUnit, portion ? { factor: portion.basisQuantity, source: portion.source } : undefined)
      const item = plannedItemSchema.parse({ id: crypto.randomUUID(), kind: choice.kind, catalogId: choice.id, snapshot: choice.snapshot, quantity })
      calculate(item.snapshot, item.quantity); onAdd(item); setError('')
    } catch (e) { setError(errorMessage(e)) }
  }
  return <div className="ingredient-box">{!options.length ? <p>Nessuna voce disponibile. Aggiungi alimenti o ricette nel <a href="#catalogo">catalogo</a>{exclusions.length ? ' compatibili con le esclusioni' : ''}.</p> : <><div className="form-grid">
    <Select label="Alimento o ricetta" value={selected} onChange={value => { setSelected(value); setUnit('') }}><option value="">Scegli dal catalogo</option>{options.map(i => <option key={`${i.kind}:${i.id}`} value={`${i.kind}:${i.id}`}>{i.snapshot.displayName} · {i.kind === 'food' ? 'alimento' : 'ricetta'}</option>)}</Select>
    <Field label="Quantità da aggiungere" inputMode="decimal" value={amount} onChange={e => setAmount(e.target.value)} error={error && !Number.isFinite(parseDecimal(amount)) || parseDecimal(amount) <= 0 ? 'Inserisci una quantità positiva.' : undefined} />
    <Select label="Unità della voce" value={unit} onChange={setUnit}><option value="">{choice?.snapshot.basisUnit ?? 'Unità di base'}</option>{choice?.conversions.map((c, n) => <option value={`portion:${n}`} key={n}>{c.label} ({c.basisQuantity} {choice.snapshot.basisUnit})</option>)}</Select>
  </div><button type="button" onClick={add}>{label}</button></>}{error && <p role="alert" className="notice error">{error}</p>}</div>
}

export function ItemAmount({ item, onChange, label }: { item: PlannedItem; onChange: (item: PlannedItem) => void; label: string }) {
  const [value, setValue] = useState(String(item.quantity.amount)), [error, setError] = useState('')
  return <div className="actions"><Field label={label} inputMode="decimal" value={value} error={error} onChange={e => setValue(e.target.value)} /><button type="button" onClick={() => { try { const updated = { ...item, quantity: { ...item.quantity, amount: parseDecimal(value) } }; calculate(updated.snapshot, updated.quantity); onChange(updated); setError('') } catch { setError('Inserisci una quantità positiva e finita.') } }}>Applica quantità</button></div>
}
