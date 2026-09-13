import { useEffect, useState } from 'react'
import { parseDecimal, type Profile } from '../domain/profile'
import { changeDiaryPlan, consumedFromItem, consumedTotal, copyPlanned, newDiary, type DiaryBundle, type DailyDiary } from '../domain/diary'
import { todayLocal, type MenuData } from '../domain/menu'
import type { Food, Recipe } from '../domain/nutrition'
import { readCatalog } from '../services/catalog'
import { readMenus } from '../services/menu'
import { readDiary, readDiaryHistory, saveDiary, type DiarySaveOptions } from '../services/diary'
import { errorMessage } from '../services/errors'
import { DateNavigation, DayPlanView } from './Menu'
import { Field, Select } from '../components/Field'
import { ItemAmount, ItemPicker, ItemView } from '../components/MealItems'
import { formatNumber, NutrientsView } from '../components/NutritionDetails'

type LoadedDay = { date: string; bundle: DiaryBundle | null; menu: MenuData; catalog: { foods: Food[]; recipes: Recipe[] }; history: Awaited<ReturnType<typeof readDiaryHistory>> }

export function Diary({ profile, date, onDate, showHistory, onDirty }: { profile: Profile; date: string; onDate: (date: string) => void; showHistory: boolean; onDirty: (dirty: boolean) => void }) {
  const [loaded, setLoaded] = useState<LoadedDay>(), [error, setError] = useState(''), [retry, setRetry] = useState(0)
  useEffect(() => {
    let active = true
    Promise.all([readDiary(profile.id, date), readMenus(profile.id), readCatalog(), readDiaryHistory(profile.id)]).then(([bundle, menu, catalog, history]) => { if (active) { setLoaded({ date, bundle, menu, catalog, history }); setError('') } }).catch(e => { if (active) setError(errorMessage(e)) })
    return () => { active = false }
  }, [profile.id, date, retry])
  if (error) return <div className="stack"><DateNavigation date={date} onDate={onDate} /><div role="alert" className="notice error">{error}<button onClick={() => setRetry(retry + 1)}>Riprova apertura diario</button></div></div>
  if (!loaded || loaded.date !== date) return <p role="status">Apertura della giornata…</p>
  return <DiaryEditor key={`${date}:${retry}`} profile={profile} loaded={loaded} onDate={onDate} showHistory={showHistory} onDirty={onDirty} />
}

function DiaryEditor({ profile, loaded, onDate, showHistory, onDirty }: { profile: Profile; loaded: LoadedDay; onDate: (date: string) => void; showHistory: boolean; onDirty: (dirty: boolean) => void }) {
  const { date, menu, catalog } = loaded
  const [bundle, setBundle] = useState(loaded.bundle), [persisted, setPersisted] = useState(loaded.bundle), [history, setHistory] = useState(loaded.history)
  const [weight, setWeight] = useState(loaded.bundle?.measurement ? String(loaded.bundle.measurement.weightKg) : ''), [weightNotes, setWeightNotes] = useState(loaded.bundle?.measurement?.notes ?? '')
  const [activity, setActivity] = useState((loaded.bundle?.diary.activity ?? []).map(a => ({ description: a.description, duration: a.durationMinutes === null ? '' : String(a.durationMinutes) })))
  const [error, setError] = useState(''), [weightError, setWeightError] = useState(''), [message, setMessage] = useState(''), [busy, setBusy] = useState(false), [dirty, setDirty] = useState(false)
  const [confirmations, setConfirmations] = useState<Partial<DiarySaveOptions>>({}), [newPlanId, setNewPlanId] = useState(loaded.bundle?.diary.plannedRevisionId ?? '')
  useEffect(() => { onDirty(dirty); return () => onDirty(false) }, [dirty, onDirty])
  const update = (next: DiaryBundle) => { setBundle(next); setDirty(true); setMessage('') }
  const changeDate = (next: string) => { if (busy) return; if (next !== date && (!dirty || window.confirm('Cambiare data e scartare le modifiche non salvate di questa giornata?'))) onDate(next) }
  const changeField = (patch: Partial<DailyDiary>) => { if (bundle) update({ ...bundle, diary: { ...bundle.diary, ...patch } }) }
  const future = date > todayLocal()
  const revisionId = bundle ? bundle.diary.plannedRevisionId : menu.selections.find(s => s.date === date)?.revisionId ?? null
  const total = bundle ? consumedTotal(bundle.diary, bundle.entries) : null
  async function save() {
    if (!bundle) return
    setError(''); setWeightError(''); setMessage('')
    let confirmation = confirmations
    if (persisted?.measurement && !weight.trim() && !confirmation.confirmMeasurementRemoval) {
      if (!window.confirm('Eliminare la misurazione del peso di questa data? I consumi rimangono conservati.')) return
      confirmation = { ...confirmation, confirmMeasurementRemoval: true }; setConfirmations(confirmation)
    }
    const parsedWeight = weight.trim() ? parseDecimal(weight) : null
    if (parsedWeight !== null && (!Number.isFinite(parsedWeight) || parsedWeight <= 0 || parsedWeight > 500)) { setWeightError('Inserisci un peso maggiore di 0 e massimo 500 kg.'); setError('Controlla il peso: i dati inseriti sono conservati.'); return }
    if (activity.some(a => !a.description.trim() || (a.duration && (!Number.isFinite(parseDecimal(a.duration)) || parseDecimal(a.duration) <= 0 || parseDecimal(a.duration) > 1440)))) { setError('Ogni attività richiede una descrizione e, se indicata, una durata maggiore di 0 e massimo 1440 minuti.'); return }
    setBusy(true)
    try {
      const now = new Date().toISOString()
      const saved = await saveDiary({ ...bundle, diary: { ...bundle.diary, activity: activity.map(a => ({ description: a.description, durationMinutes: a.duration ? parseDecimal(a.duration) : null })) }, measurement: parsedWeight === null ? null : { id: persisted?.measurement?.id ?? crypto.randomUUID(), profileId: profile.id, date, weightKg: parsedWeight, notes: weightNotes || null, createdAt: persisted?.measurement?.createdAt ?? now, updatedAt: now } }, { ...confirmation, expectedUpdatedAt: persisted?.diary.updatedAt ?? null, expectedWeightUpdatedAt: persisted?.measurement?.updatedAt ?? null })
      setBundle(saved); setPersisted(saved); setDirty(false); setConfirmations({}); setMessage('Giornata salvata. Piano e consumi restano distinti.')
      setHistory({ diaries: [...history.diaries.filter(d => d.date !== date), saved.diary].sort((a, b) => b.date.localeCompare(a.date)), measurements: [...history.measurements.filter(m => m.date !== date), ...(saved.measurement ? [saved.measurement] : [])] })
    } catch (e) { setError(errorMessage(e)) } finally { setBusy(false) }
  }
  return <div className="stack"><DateNavigation date={date} onDate={changeDate} />
    {showHistory && <section className="panel"><h2>Giornate registrate</h2>{!history.diaries.length ? <p>Nessuna giornata registrata.</p> : <ul className="history-list">{history.diaries.map(d => { const m = history.measurements.find(m => m.date === d.date); return <li key={d.id}><button type="button" onClick={() => changeDate(d.date)} aria-current={d.date === date ? 'date' : undefined}>{d.date}</button><span>{d.status === 'open' ? 'Aperto' : 'Completo'} · {m ? `${formatNumber(m.weightKg)} kg` : 'Peso non registrato'}</span></li> })}</ul>}</section>}
    {message && <p role="status" className="notice">{message}</p>}{error && <p role="alert" className="notice error">{error}</p>}
    <DayPlanView data={menu} revisionId={revisionId} date={date} />
    <section className="panel stack"><h2>Consumato · {date}</h2>{future ? <p>Data futura: puoi consultare il piano; consumi e peso si registrano fino a oggi.</p> : !bundle ? <><p>Diario assente · nessun consumo o peso registrato.</p><button onClick={() => { const draft = newDiary(profile, date, menu); update(draft); setNewPlanId(draft.diary.plannedRevisionId ?? '') }}>Apri diario della giornata</button></> : <fieldset className="form-body stack" disabled={busy}>
      <div><p><strong>Diario {bundle.diary.status === 'open' ? 'aperto' : 'completo'}</strong>{dirty ? ' · modifiche da salvare' : ''}</p><Select label="Stato della giornata" value={bundle.diary.status} onChange={value => changeField({ status: value as DailyDiary['status'] })}><option value="open">Aperto · registrazione parziale</option><option value="complete">Completo · registrazione terminata</option></Select><p>Segna completo quando hai terminato di registrare. I valori dei giorni aperti sono subtotali.</p></div>
      {bundle.diary.plannedRevisionId && <div><button onClick={() => { try { update(copyPlanned(bundle, menu.meals)); setError('') } catch (e) { setError(errorMessage(e)) } }}>Copia esplicitamente il piano nei consumi</button><p>La copia aggiunge solo voci del piano non ancora copiate. Potrai modificarle; le alternative restano escluse.</p></div>}
      {bundle.diary.mealSlotsSnapshot.map(slot => <section className="meal-card" key={slot.key} aria-label={`Consumato ${slot.label}`}><h3>{slot.label}</h3>{!bundle.entries.some(e => e.slot === slot.key) && <p>Nessuna voce consumata registrata.</p>}{bundle.entries.filter(e => e.slot === slot.key).map((entry, n) => <div className="ingredient-box" key={entry.id}><ItemView item={entry} />{entry.plannedItemId && <p className="source">Copiata dal piano · quantità indipendente</p>}<ItemAmount item={entry} label={`Quantità consumata ${n + 1} (${entry.quantity.unit})`} onChange={item => update({ ...bundle, entries: bundle.entries.map(e => e.id === entry.id ? { ...e, quantity: item.quantity } : e) })} /><Field label={`Note consumo ${n + 1} (facoltative)`} maxLength={5000} value={entry.notes ?? ''} onChange={e => update({ ...bundle, entries: bundle.entries.map(i => i.id === entry.id ? { ...i, notes: e.target.value || null } : i) })} /><button onClick={() => { if (window.confirm('Rimuovere questa voce consumata? Il piano rimane conservato. La modifica sarà applicata al salvataggio.')) { update({ ...bundle, entries: bundle.entries.filter(e => e.id !== entry.id) }); setConfirmations({ ...confirmations, confirmEntryRemoval: true }) } }}>Rimuovi consumo</button></div>)}
        <details><summary>Registra un alimento o una ricetta</summary><ItemPicker {...catalog} label="Aggiungi consumo" onAdd={item => update({ ...bundle, entries: [...bundle.entries, consumedFromItem(item, bundle.diary, slot.key)] })} /><p className="muted">Puoi registrare anche alimenti esclusi dalle proposte del menù.</p></details>
      </section>)}
      <div><h3>{bundle.diary.status === 'open' ? 'Subtotale registrato · giornata aperta' : 'Totale registrato · giornata completa'}</h3>{total ? <NutrientsView nutrients={total} /> : <p>Non registrato · nessuno zero implicito.</p>}</div>
      <section className="meal-card"><h3>Peso e informazioni della giornata</h3><p>Peso facoltativo, solo se misurato. La baseline del profilo non viene copiata qui.</p><div className="form-grid"><Field label="Peso (kg, facoltativo)" inputMode="decimal" value={weight} error={weightError} onChange={e => { setWeight(e.target.value); setDirty(true); setMessage('') }} /><Field label="Note peso (facoltative)" maxLength={5000} value={weightNotes} onChange={e => { setWeightNotes(e.target.value); setDirty(true) }} />{(['hunger', 'energy', 'mood'] as const).map((key, n) => <Select key={key} label={`${['Fame', 'Energia percepita', 'Umore'][n]} (facoltativo)`} value={bundle.diary[key] === null ? '' : String(bundle.diary[key])} onChange={value => changeField({ [key]: value ? Number(value) : null })}><option value="">Non registrato</option>{[1, 2, 3, 4, 5].map(v => <option key={v} value={v}>{v}{v === 1 ? ' · basso' : v === 5 ? ' · alto' : ''}</option>)}</Select>)}</div><p className="muted">Scale descrittive personali da 1 a 5.</p>
        <h3>Attività (facoltative)</h3>{activity.map((a, n) => <div className="ingredient-box" key={n}><div className="form-grid"><Field label={`Attività ${n + 1}`} maxLength={200} value={a.description} onChange={e => { setActivity(activity.map((i, index) => index === n ? { ...i, description: e.target.value } : i)); setDirty(true) }} /><Field label={`Durata attività ${n + 1} (minuti, facoltativa)`} inputMode="decimal" value={a.duration} onChange={e => { setActivity(activity.map((i, index) => index === n ? { ...i, duration: e.target.value } : i)); setDirty(true) }} /></div><button onClick={() => { if (window.confirm('Rimuovere questa attività dalla giornata al prossimo salvataggio?')) { setActivity(activity.filter((_, index) => index !== n)); setDirty(true) } }}>Rimuovi attività</button></div>)}<button disabled={activity.length >= 100} onClick={() => { setActivity([...activity, { description: '', duration: '' }]); setDirty(true) }}>Aggiungi attività</button>
        <label className="field"><span>Note della giornata (facoltative)</span><textarea maxLength={5000} value={bundle.diary.notes ?? ''} onChange={e => changeField({ notes: e.target.value || null })} /></label>
      </section>
      <details><summary>Cambia il riferimento al piano storico</summary><p>Il previsto resta legato alla revisione originale anche se cambi il menù. Un cambio esplicito conserva i consumi e le loro fonti, scollegandoli dalle vecchie voci previste.</p><Select label="Nuovo piano storico" value={newPlanId} onChange={setNewPlanId}><option value="">Nessun piano</option>{menu.revisions.filter(r => menu.plans.some(p => p.id === r.menuPlanId && date >= p.startDate && date <= p.endDate)).map(r => <option key={r.id} value={r.id}>{menu.plans.find(p => p.id === r.menuPlanId)?.title} · Revisione {r.revisionNumber}</option>)}</Select><button onClick={() => { if (window.confirm('Cambiare il previsto storico di questa giornata? I consumi e le loro fonti resteranno conservati; i collegamenti alle vecchie voci pianificate saranno rimossi.')) { try { update(changeDiaryPlan(bundle, newPlanId || null, menu, profile)); setConfirmations({ ...confirmations, confirmPlanChange: true }); setError('') } catch (e) { setError(errorMessage(e)) } } }}>Conferma cambio del piano storico</button></details>
      <button className="primary" onClick={() => void save()}>{busy ? 'Salvataggio…' : 'Salva giornata'}</button>
    </fieldset>}</section>
  </div>
}
