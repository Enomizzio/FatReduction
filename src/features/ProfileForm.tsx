import { useState, type FormEvent } from 'react'
import { Field, Select } from '../components/Field'
import { keysFromText, keyLabel, parseDecimal, profileSchema, type Profile } from '../domain/profile'
import { saveProfile } from '../storage/database'
import { errorMessage } from '../services/errors'

export function ProfileForm({ profile, onSaved, persist = saveProfile }: { profile: Profile; onSaved: (profile: Profile) => void; persist?: typeof saveProfile }) {
  const [draft, setDraft] = useState(profile)
  const [numbers, setNumbers] = useState({ ageYears: String(profile.ageYears), heightCm: String(profile.heightCm), initialWeightKg: String(profile.initialWeightKg) })
  const [exclusions, setExclusions] = useState(profile.excludedFoodKeys.map(keyLabel).join(', '))
  const [message, setMessage] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [busy, setBusy] = useState(false)
  const [failed, setFailed] = useState(false)
  async function submit(event: FormEvent) {
    event.preventDefault(); setMessage(''); setErrors({}); setFailed(false)
    const parsed = profileSchema.safeParse({ ...draft, ...Object.fromEntries(Object.entries(numbers).map(([k, v]) => [k, parseDecimal(v)])), excludedFoodKeys: keysFromText(exclusions) })
    if (!parsed.success) {
      setErrors(Object.fromEntries(parsed.error.issues.map(i => [i.path.join('.'), 'Controlla questo valore e i limiti indicati.'])))
      setMessage('Controlla i campi indicati. Il profilo non è stato salvato.'); setFailed(true); return
    }
    setBusy(true)
    try { const saved = await persist(parsed.data, draft.updatedAt); setDraft(saved); onSaved(saved); setMessage('Profilo salvato su questo browser.') }
    catch (error) { setFailed(true); setMessage(errorMessage(error)) }
    finally { setBusy(false) }
  }
  return <form onSubmit={submit} noValidate className="stack">
    <section className="panel"><div className="section-heading"><div><p className="eyebrow">IL TUO PUNTO DI PARTENZA</p><h2>Profilo personale</h2></div><span className="badge">Modificabile</span></div>
      <p>I valori iniziali sono quelli configurati per il progetto. Aggiornali quando serve.</p>
      <div className="form-grid">
        <Field label="Età (anni)" inputMode="numeric" value={numbers.ageYears} onChange={e => setNumbers({ ...numbers, ageYears: e.target.value })} hint="Da 18 a 120 anni" error={errors.ageYears} />
        <Field label="Altezza (cm)" inputMode="decimal" value={numbers.heightCm} onChange={e => setNumbers({ ...numbers, heightCm: e.target.value })} hint="Maggiore di 0, massimo 300 cm" error={errors.heightCm} />
        <Field label="Peso iniziale (kg)" inputMode="decimal" value={numbers.initialWeightKg} onChange={e => setNumbers({ ...numbers, initialWeightKg: e.target.value })} hint="Baseline dichiarata, massimo 500 kg. La modifica aggiorna il punto di confronto, senza creare misurazioni." error={errors.initialWeightKg} />
        <Select label="Attività" value={draft.activityLevel} onChange={v => setDraft({ ...draft, activityLevel: v as Profile['activityLevel'] })}><option value="low">Bassa</option><option value="moderate">Moderata</option><option value="high">Alta</option></Select>
        <Select label="Obiettivo" value={draft.goal} onChange={v => setDraft({ ...draft, goal: v as Profile['goal'] })}><option value="weightLoss">Perdita di peso</option><option value="maintenance">Mantenimento</option></Select>
        <Select label="Regime alimentare" value={draft.diet} onChange={v => setDraft({ ...draft, diet: v as Profile['diet'] })}><option value="omnivore">Onnivoro</option><option value="vegetarian">Vegetariano</option><option value="vegan">Vegano</option></Select>
      </div>
      <Field label="Alimenti esclusi" hint="Separali con una virgola. Le esclusioni saranno considerate anche negli ingredienti delle ricette." value={exclusions} maxLength={5000} onChange={e => setExclusions(e.target.value)} error={errors.excludedFoodKeys} />
    </section>
    <section className="panel"><p className="eyebrow">IL RITMO DELLA GIORNATA</p><h2>Occasioni alimentari</h2><p>Aggiungi o rimuovi occasioni e scegli etichette e ordine. La configurazione varrà per i nuovi piani.</p><p><strong>{draft.mealSlots.length} pasti al giorno</strong> · da 1 a 10 occasioni</p>
      <ol className="slots">{draft.mealSlots.map((slot, index) => <li key={slot.key}>
        <Field label={`Pasto ${index + 1}`} value={slot.label} maxLength={200} error={errors[`mealSlots.${index}.label`]} onChange={e => setDraft({ ...draft, mealSlots: draft.mealSlots.map((s, i) => i === index ? { ...s, label: e.target.value } : s) })} />
        <div className="actions"><button type="button" disabled={index === 0} aria-label={`Sposta ${slot.label} in alto`} onClick={() => { const slots = [...draft.mealSlots]; [slots[index - 1], slots[index]] = [slots[index], slots[index - 1]]; setDraft({ ...draft, mealSlots: slots }) }}>↑</button>
        <button type="button" disabled={draft.mealSlots.length === 1} aria-label={`Rimuovi ${slot.label}`} onClick={() => setDraft({ ...draft, mealSlots: draft.mealSlots.filter((_, i) => i !== index) })}>Rimuovi</button></div>
      </li>)}</ol>
      <button type="button" disabled={draft.mealSlots.length >= 10} onClick={() => setDraft({ ...draft, mealSlots: [...draft.mealSlots, { key: crypto.randomUUID(), label: '' }] })}>+ Aggiungi occasione</button>
    </section>
    {message && <div className={failed ? 'notice error' : 'notice'} role={failed ? 'alert' : 'status'}>{message}</div>}
    <div className="actions"><button className="primary" disabled={busy} type="submit">{busy ? 'Salvataggio…' : 'Salva profilo'}</button><span className="muted">Conservato solo su questo browser</span></div>
  </form>
}
