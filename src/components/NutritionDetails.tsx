import { useState } from 'react'
import { calculate, makeQuantity, type Food, type NutritionSnapshot, type NutritionSource, type Nutrients } from '../domain/nutrition'
import { parseDecimal } from '../domain/profile'
import { errorMessage } from '../services/errors'
import { Field, Select } from './Field'

export const nutrientLabels: Record<keyof Nutrients, string> = { energyKcal: 'Energia (kcal)', proteinG: 'Proteine (g)', carbohydrateG: 'Carboidrati (g)', fatG: 'Grassi (g)', fiberG: 'Fibre (g)' }
export const formatNumber = (n: number) => new Intl.NumberFormat('it-IT', { maximumFractionDigits: 2 }).format(n)
export function NutrientsView({ nutrients }: { nutrients: Nutrients }) {
  return <dl className="nutrients">{Object.entries(nutrientLabels).map(([key, label]) => <div key={key}><dt>{label}</dt><dd>{nutrients[key as keyof Nutrients] === null ? 'Non disponibile' : formatNumber(nutrients[key as keyof Nutrients]!)}</dd></div>)}</dl>
}
const kinds = { label: 'Etichetta', database: 'Database', manual: 'Inserimento manuale', calculated: 'Calcolo da ingredienti' }
export function SourceView({ source }: { source: NutritionSource }) {
  return <p className="source"><strong>Fonte · {kinds[source.kind]}</strong>: {source.reference}{source.url && <> · <a href={source.url} target="_blank" rel="noopener noreferrer">Apri fonte</a></>}{source.retrievedAt && <> · Consultata il {source.retrievedAt}</>}{source.isEstimate && <> · Stima</>}</p>
}
export function QuantityCalculator({ snapshot, conversions = [] }: { snapshot: NutritionSnapshot; conversions?: Food['portionConversions'] }) {
  const [amount, setAmount] = useState('100')
  const [unit, setUnit] = useState<string>(snapshot.basisUnit)
  let result: Nutrients | undefined, error = ''
  try {
    const portion = unit.startsWith('portion:') ? conversions[Number(unit.split(':')[1])] : undefined
    result = calculate(snapshot, makeQuantity(snapshot.basisUnit, parseDecimal(amount), portion ? 'portion' : unit as 'g' | 'ml' | 'portion', portion ? { factor: portion.basisQuantity, source: portion.source } : undefined))
  } catch (e) { error = errorMessage(e) }
  return <details className="calculator"><summary>Calcola per una quantità</summary><div className="form-grid">
    <Field label="Quantità da calcolare" inputMode="decimal" value={amount} onChange={e => setAmount(e.target.value)} />
    <Select label="Unità da calcolare" value={unit} onChange={setUnit}><option value="g">g</option><option value="ml">ml</option><option value="portion">Porzione senza conversione</option>{conversions.map((c, i) => <option key={i} value={`portion:${i}`}>{c.label} ({formatNumber(c.basisQuantity)} {snapshot.basisUnit})</option>)}</Select>
  </div>{result ? <NutrientsView nutrients={result} /> : <p role="status" className="field-error">{error}</p>}
    {unit.startsWith('portion:') && <p className="source">Conversione dichiarata: {conversions[Number(unit.split(':')[1])]?.source}</p>}
  </details>
}
