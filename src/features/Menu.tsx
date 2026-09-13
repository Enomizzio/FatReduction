import { useEffect, useState } from 'react'
import type { Profile } from '../domain/profile'
import { matchedExclusions, type Food, type Recipe } from '../domain/nutrition'
import { applySlots, chooseSubstitution, datesBetween, menuTotal, newMenu, reviseMenu, todayLocal, type MenuBundle, type MenuData, type PlannedMeal } from '../domain/menu'
import { readCatalog } from '../services/catalog'
import { readMenus, saveMenu, selectDayPlan } from '../services/menu'
import { errorMessage } from '../services/errors'
import { Field, Select } from '../components/Field'
import { ItemAmount, ItemPicker, ItemView } from '../components/MealItems'
import { NutrientsView } from '../components/NutritionDetails'

export function MealView({ meal, label }: { meal: PlannedMeal; label: string }) {
  return <section className="meal-card" aria-label={label}><h3>{label}</h3>{meal.items.length ? meal.items.map(item => <ItemView item={item} key={item.id} />) : <p className="muted">Da compilare · nessuna voce pianificata</p>}
    {meal.notes && <p className="instructions">{meal.notes}</p>}{!!meal.substitutions.length && <details><summary>Alternative non conteggiate ({meal.substitutions.length})</summary>{meal.substitutions.map(item => <ItemView item={item} key={item.id} />)}</details>}</section>
}

export function DayPlanView({ data, revisionId, date }: { data: MenuData; revisionId: string | null; date: string }) {
  const revision = data.revisions.find(r => r.id === revisionId), plan = data.plans.find(p => p.id === revision?.menuPlanId)
  const meals = data.meals.filter(m => m.revisionId === revisionId && m.date === date)
  return <section className="panel stack"><h2>Pianificato · {date}</h2>{!revision || !plan ? <p>Nessun piano selezionato per questa data. Sceglilo nell’area <a href="#menu">Menù</a>.</p> : <><p>{plan.title} · Revisione {revision.revisionNumber}</p>{revision.mealSlotsSnapshot.map(s => { const meal = meals.find(m => m.slot === s.key); return meal ? <MealView key={s.key} meal={meal} label={s.label} /> : null })}<p>Stime delle voci pianificate{meals.some(m => !m.items.length) ? ' · giornata da completare' : ''}</p>{meals.some(m => m.items.length) ? <NutrientsView nutrients={menuTotal(meals)} /> : <p>Nessuna stima disponibile.</p>}</>}</section>
}

export function DateNavigation({ date, onDate }: { date: string; onDate: (date: string) => void }) {
  return <div className="actions"><Field label="Data selezionata" type="date" value={date} onChange={e => { if (/^\d{4}-\d{2}-\d{2}$/.test(e.target.value)) onDate(e.target.value) }} /><button type="button" onClick={() => onDate(todayLocal())}>Torna a oggi</button></div>
}

function MealEditor({ meal, label, catalog, profile, onChange }: { meal: PlannedMeal; label: string; catalog: { foods: Food[]; recipes: Recipe[] }; profile: Profile; onChange: (meal: PlannedMeal) => void }) {
  const [alternative, setAlternative] = useState(false), [replaceId, setReplaceId] = useState('')
  return <section className="meal-card" aria-label={label}><h3>{label}</h3>{!meal.items.length && <p>Da compilare · nessuna voce pianificata</p>}
    {meal.items.map((item, n) => <div className="ingredient-box" key={item.id}><ItemView item={item} /><ItemAmount item={item} label={`Quantità voce ${n + 1} (${item.quantity.unit})`} onChange={updated => onChange({ ...meal, items: meal.items.map(i => i.id === updated.id ? updated : i) })} /><button type="button" onClick={() => onChange({ ...meal, items: meal.items.filter(i => i.id !== item.id) })}>Rimuovi voce dalla bozza</button></div>)}
    <label className="field"><span>Note {label} (facoltative)</span><textarea maxLength={5000} value={meal.notes ?? ''} onChange={e => onChange({ ...meal, notes: e.target.value || null })} /></label>
    <details><summary>Aggiungi alimenti o alternative</summary><label className="check"><input type="checkbox" checked={alternative} onChange={e => setAlternative(e.target.checked)} />Aggiungi come alternativa non conteggiata</label><ItemPicker {...catalog} exclusions={profile.excludedFoodKeys} label={alternative ? 'Aggiungi alternativa' : 'Aggiungi al pasto'} onAdd={item => onChange({ ...meal, [alternative ? 'substitutions' : 'items']: [...meal[alternative ? 'substitutions' : 'items'], item] })} /></details>
    {!!meal.substitutions.length && <div><h4>Alternative non conteggiate</h4><Select label={`Voce da sostituire · ${label}`} value={replaceId} onChange={setReplaceId}><option value="">Aggiungi al pasto senza sostituire</option>{meal.items.map(i => <option key={i.id} value={i.id}>{i.snapshot.displayName}</option>)}</Select>{meal.substitutions.map(item => <div className="ingredient-box" key={item.id}><ItemView item={item} /><button type="button" disabled={!!matchedExclusions(item.snapshot, profile.excludedFoodKeys).length} onClick={() => { onChange(chooseSubstitution(meal, item.id, meal.items.some(i => i.id === replaceId) ? replaceId : '')); setReplaceId('') }}>Usa questa alternativa</button><button type="button" onClick={() => onChange({ ...meal, substitutions: meal.substitutions.filter(i => i.id !== item.id) })}>Rimuovi alternativa dalla bozza</button></div>)}</div>}
  </section>
}

export function Menu({ profile, date, onDate, onDirty }: { profile: Profile; date: string; onDate: (date: string) => void; onDirty: (dirty: boolean) => void }) {
  const [data, setData] = useState<MenuData>(), [catalog, setCatalog] = useState<{ foods: Food[]; recipes: Recipe[] }>(), [error, setError] = useState(''), [message, setMessage] = useState(''), [retry, setRetry] = useState(0)
  const [draft, setDraft] = useState<MenuBundle>(), [expected, setExpected] = useState<string | null>(null), [viewId, setViewId] = useState(''), [week, setWeek] = useState(false), [busy, setBusy] = useState(false)
  const [title, setTitle] = useState(''), [start, setStart] = useState(date), [days, setDays] = useState('1')
  useEffect(() => { onDirty(!!draft); return () => onDirty(false) }, [draft, onDirty])
  useEffect(() => { let active = true; Promise.all([readMenus(profile.id), readCatalog()]).then(([d, c]) => { if (active) { setData(d); setCatalog(c); setError('') } }).catch(e => { if (active) setError(errorMessage(e)) }); return () => { active = false } }, [profile.id, retry])
  const revision = data?.revisions.find(r => r.id === viewId), plan = data?.plans.find(p => p.id === revision?.menuPlanId)
  const viewed = plan && revision && data ? { plan, revision, meals: data.meals.filter(m => m.revisionId === revision.id) } : undefined
  const displayed = draft ?? viewed
  const shownDate = displayed && (date < displayed.plan.startDate || date > displayed.plan.endDate) ? displayed.plan.startDate : date
  async function save() {
    if (!draft || !data) return
    setBusy(true); setError(''); setMessage('')
    try {
      const saved = await saveMenu(draft, expected)
      setData({ ...data, plans: [...data.plans.filter(p => p.id !== saved.plan.id), saved.plan], revisions: [...data.revisions, saved.revision], meals: [...data.meals, ...saved.meals] })
      setDraft(undefined); setViewId(saved.revision.id); setMessage('Menù salvato. Seleziona la revisione per ciascuna data desiderata.')
    } catch (e) { setError(errorMessage(e)) } finally { setBusy(false) }
  }
  async function select() {
    if (!viewed || !data) return
    setBusy(true); setError(''); setMessage('')
    try { const selected = await selectDayPlan(profile.id, shownDate, viewed.revision.id, data.selections.find(s => s.date === shownDate)?.updatedAt ?? null); setData({ ...data, selections: [...data.selections.filter(s => s.date !== shownDate), selected] }); setMessage(`Piano selezionato per ${shownDate}.`) } catch (e) { setError(errorMessage(e)) } finally { setBusy(false) }
  }
  const startDraft = () => { try { const d = newMenu(profile, title, start, Number(days)); setDraft(d); setExpected(null); onDate(start); setError(''); setMessage('') } catch (e) { setError(errorMessage(e)) } }
  return <div className="stack">{error && <div className="notice error" role="alert">{error}{!data && <button onClick={() => setRetry(retry + 1)}>Riprova apertura menù</button>}</div>}{message && <p className="notice" role="status">{message}</p>}
    {!data || !catalog ? !error && <p role="status">Apertura menù…</p> : <><fieldset className="form-body stack" disabled={busy}>
      {!draft && <section className="panel"><h2>Organizza i tuoi pasti</h2><p>Componi un giorno o sette giorni consecutivi usando le fonti del tuo catalogo. Gli slot vuoti restano da compilare.</p><div className="form-grid"><Field label="Titolo del piano" value={title} maxLength={200} onChange={e => setTitle(e.target.value)} /><Field label="Inizio del piano" type="date" value={start} onChange={e => setStart(e.target.value)} /><Select label="Durata del piano" value={days} onChange={setDays}><option value="1">Un giorno</option><option value="7">Una settimana</option></Select></div><button onClick={startDraft}>Crea bozza del menù</button></section>}
      <DateNavigation date={date} onDate={onDate} />
      {!draft && <section className="panel"><h2>I tuoi piani e revisioni</h2>{!data.plans.length ? <p>Nessun menù salvato.</p> : <><Select label="Piano e revisione da consultare" value={viewId} onChange={id => { setViewId(id); const r = data.revisions.find(r => r.id === id), p = data.plans.find(p => p.id === r?.menuPlanId); if (p && (date < p.startDate || date > p.endDate)) onDate(p.startDate) }}><option value="">Scegli un piano</option>{data.revisions.map(r => { const p = data.plans.find(p => p.id === r.menuPlanId)!; return <option key={r.id} value={r.id}>{p.title} · Revisione {r.revisionNumber} · {p.startDate} / {p.endDate}</option> })}</Select><p>{data.plans.filter(p => date >= p.startDate && date <= p.endDate).length > 1 ? 'Più piani coprono questa data: scegli esplicitamente quello da usare.' : 'La scelta del piano per data è esplicita.'}</p><p>{data.selections.some(s => s.date === date) ? 'Un piano è selezionato per questa data.' : 'Nessun piano selezionato per questa data.'}</p></>}</section>}
      {displayed && <section className="panel stack"><div><h2>{displayed.plan.title}{draft ? ' · Bozza' : ''}</h2><p>Revisione {displayed.revision.revisionNumber} · {displayed.plan.startDate} / {displayed.plan.endDate}</p>{displayed.revision.changeNote && !draft && <p className="instructions">{displayed.revision.changeNote}</p>}</div>
        <div className="actions"><button aria-pressed={!week} onClick={() => setWeek(false)}>Giorno</button><button aria-pressed={week} onClick={() => setWeek(true)}>Settimana</button></div>
        {draft && <><p>Le modifiche restano in bozza fino al salvataggio. Le revisioni precedenti rimangono consultabili.</p><button onClick={() => { try { setDraft(applySlots(draft, profile.mealSlots)); setError('') } catch (e) { setError(errorMessage(e)) } }}>Applica occasioni attuali del profilo</button><Field label="Nota della revisione (facoltativa)" maxLength={5000} value={draft.revision.changeNote ?? ''} onChange={e => setDraft({ ...draft, revision: { ...draft.revision, changeNote: e.target.value || null } })} /></>}
        {(week ? datesBetween(displayed.plan.startDate, displayed.plan.endDate) : [shownDate]).map(day => <section key={day} className="menu-day" aria-label={`Menù ${day}`}><h2>{day}</h2>{displayed.revision.mealSlotsSnapshot.map(slot => { const meal = displayed.meals.find(m => m.date === day && m.slot === slot.key)!; return draft ? <MealEditor key={meal.id} meal={meal} label={slot.label} catalog={catalog} profile={profile} onChange={updated => setDraft({ ...draft, meals: draft.meals.map(m => m.id === updated.id ? updated : m) })} /> : <MealView key={meal.id} meal={meal} label={slot.label} /> })}</section>)}
        <div><h3>Stime {week ? 'del periodo' : 'del giorno'}</h3><p>Solo voci pianificate; alternative escluse. {displayed.meals.filter(m => week || m.date === shownDate).some(m => !m.items.length) && 'Sono presenti occasioni da compilare.'}</p>{displayed.meals.some(m => (week || m.date === shownDate) && m.items.length) ? <NutrientsView nutrients={menuTotal(displayed.meals.filter(m => week || m.date === shownDate))} /> : <p>Nessuna stima disponibile.</p>}</div>
        <div className="actions">{draft ? <><button className="primary" onClick={() => void save()}>{busy ? 'Salvataggio…' : 'Salva revisione del menù'}</button><button onClick={() => { if (window.confirm('Scartare le modifiche della bozza? Le revisioni salvate rimangono conservate.')) { setDraft(undefined); setError('') } }}>Scarta bozza</button></> : <><button onClick={() => void select()}>Usa questa revisione per {shownDate}</button>{viewed?.plan.currentRevisionId === viewed?.revision.id && <button onClick={() => { if (!viewed) return; const next = reviseMenu(viewed); try { setDraft(applySlots(next, profile.mealSlots)) } catch (e) { setDraft(next); setError(errorMessage(e)) } setExpected(viewed.revision.id); setMessage('') }}>Modifica con nuova revisione</button>}</>}</div>
      </section>}
    </fieldset></>}
  </div>
}
