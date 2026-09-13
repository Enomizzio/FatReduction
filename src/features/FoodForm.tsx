import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Field, Select } from '../components/Field'
import { nutrientLabels } from '../components/NutritionDetails'
import { foodSchema, type Food, type Nutrients } from '../domain/nutrition'
import { keysFromText, keyLabel, parseDecimal } from '../domain/profile'
import { saveFood } from '../services/catalog'
import { errorMessage } from '../services/errors'

export function FoodForm({ food, onSaved, onCancel }: { food?: Food; onSaved: (food: Food) => void; onCancel: () => void }) {
  const heading = useRef<HTMLHeadingElement>(null)
  useEffect(() => { heading.current?.focus() }, [])
  const [name, setName] = useState(food?.name ?? '')
  const [keys, setKeys] = useState(food?.normalizedIngredientKeys.map(keyLabel).join(', ') ?? '')
  const [basis, setBasis] = useState(String(food?.basisAmount ?? 100))
  const [unit, setUnit] = useState<'g' | 'ml'>(food?.basisUnit ?? 'g')
  const [values, setValues] = useState<Record<keyof Nutrients, string>>({ energyKcal: String(food?.nutrients.energyKcal ?? ''), proteinG: String(food?.nutrients.proteinG ?? ''), carbohydrateG: String(food?.nutrients.carbohydrateG ?? ''), fatG: String(food?.nutrients.fatG ?? ''), fiberG: String(food?.nutrients.fiberG ?? '') })
  const [source, setSource] = useState(food?.source ?? { kind: 'manual' as const, reference: '', url: null, retrievedAt: null, isEstimate: true })
  const [conversions, setConversions] = useState((food?.portionConversions ?? []).map(c => ({ ...c, basisQuantity: String(c.basisQuantity) })))
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  async function submit(event: FormEvent) {
    event.preventDefault(); setError(''); setErrors({})
    const now = new Date().toISOString()
    const parsed = foodSchema.safeParse({ id: food?.id ?? crypto.randomUUID(), revision: food?.revision ?? 1, createdAt: food?.createdAt ?? now, updatedAt: now, archived: food?.archived ?? false,
      name, normalizedIngredientKeys: keysFromText(keys), basisAmount: parseDecimal(basis), basisUnit: unit,
      nutrients: Object.fromEntries(Object.entries(values).map(([key, value]) => [key, key === 'fiberG' && !value.trim() ? null : parseDecimal(value)])),
      source: { ...source, isEstimate: true }, portionConversions: conversions.map(c => ({ ...c, basisQuantity: parseDecimal(c.basisQuantity) })) })
    if (!parsed.success) { setError('Controlla i campi indicati. Alimento non salvato.'); setErrors(Object.fromEntries(parsed.error.issues.map(i => [i.path.join('.'), 'Valore obbligatorio, non valido o fuori limite.']))); return }
    setBusy(true)
    try { onSaved(await saveFood(parsed.data, food?.revision ?? null)) } catch (e) { setError(errorMessage(e)) } finally { setBusy(false) }
  }
  return <form onSubmit={submit} noValidate className="panel stack"><h2 ref={heading} tabIndex={-1}>{food ? 'Modifica alimento' : 'Nuovo alimento'}</h2><p className="muted">Riporta i nutrienti dalla fonte scelta. I valori sono stime, riferite alla quantità base indicata.</p>
    <fieldset disabled={busy} className="form-body stack">
    <Field label="Nome alimento" value={name} maxLength={200} error={errors.name} onChange={e => setName(e.target.value)} />
    <Field label="Ingredienti e chiavi per le esclusioni" hint="Separati da virgola, ad esempio: farina, arachidi. Per prodotti composti riporta tutti gli ingredienti rilevanti. Il nome viene considerato automaticamente." value={keys} maxLength={5000} error={errors.normalizedIngredientKeys} onChange={e => setKeys(e.target.value)} />
    <div className="form-grid"><Field label="Quantità base" inputMode="decimal" value={basis} onChange={e => setBasis(e.target.value)} error={errors.basisAmount} /><Select label="Unità base" value={unit} onChange={v => setUnit(v as 'g' | 'ml')}><option value="g">g</option><option value="ml">ml</option></Select></div>
    <div className="form-grid">{Object.entries(nutrientLabels).map(([key, label]) => <Field key={key} label={label} inputMode="decimal" value={values[key as keyof Nutrients]} onChange={e => setValues({ ...values, [key]: e.target.value })} hint={key === 'fiberG' ? 'Facoltative: vuoto significa non disponibili.' : 'Valore non negativo, riferito alla base.'} error={errors[`nutrients.${key}`]} />)}</div>
    <div className="form-grid"><Select label="Tipo di fonte" value={source.kind} onChange={v => setSource({ ...source, kind: v as Food['source']['kind'] })}><option value="manual">Inserimento manuale · stima</option><option value="label">Etichetta nutrizionale</option><option value="database">Database consultato</option></Select>
    <Field label="Riferimento della fonte" value={source.reference} maxLength={200} hint="Prodotto/etichetta, database e record, oppure descrizione della stima manuale." error={errors['source.reference']} onChange={e => setSource({ ...source, reference: e.target.value })} />
    <Field label="URL fonte (facoltativo)" value={source.url ?? ''} maxLength={2000} error={errors['source.url']} onChange={e => setSource({ ...source, url: e.target.value || null })} />
    <Field label="Data consultazione (facoltativa)" type="date" value={source.retrievedAt ?? ''} error={errors['source.retrievedAt']} onChange={e => setSource({ ...source, retrievedAt: e.target.value || null })} /></div>
    <h3>Porzioni dichiarate</h3><p className="muted">Una porzione è calcolabile solo indicando quanti {unit} contiene e la provenienza della conversione.</p>
    {conversions.map((c, index) => <div className="ingredient-box stack" key={index}><Field label={`Etichetta porzione ${index + 1}`} value={c.label} maxLength={200} error={errors[`portionConversions.${index}.label`]} onChange={e => setConversions(conversions.map((x, i) => i === index ? { ...x, label: e.target.value } : x))} />
      <Field label={`Quantità porzione ${index + 1} (${unit})`} inputMode="decimal" value={c.basisQuantity} error={errors[`portionConversions.${index}.basisQuantity`]} onChange={e => setConversions(conversions.map((x, i) => i === index ? { ...x, basisQuantity: e.target.value } : x))} />
      <Field label={`Fonte conversione ${index + 1}`} value={c.source} maxLength={200} error={errors[`portionConversions.${index}.source`]} onChange={e => setConversions(conversions.map((x, i) => i === index ? { ...x, source: e.target.value } : x))} /><button type="button" onClick={() => setConversions(conversions.filter((_, i) => i !== index))}>Rimuovi porzione {index + 1}</button></div>)}
    {errors.portionConversions && <p role="alert">Etichette duplicate o troppe porzioni (massimo 20).</p>}
    <button type="button" disabled={conversions.length >= 20} onClick={() => setConversions([...conversions, { label: '', basisQuantity: '', source: '' }])}>+ Aggiungi porzione</button>
    {error && <div className="notice error" role="alert">{error}</div>}
    <div className="actions"><button type="submit" className="primary">{busy ? 'Salvataggio…' : 'Salva alimento'}</button><button type="button" onClick={onCancel}>Annulla</button></div>
    </fieldset>
  </form>
}
