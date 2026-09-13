import { useEffect, useState } from 'react'
import type { Profile } from '../domain/profile'
import { initializeProfile } from '../storage/database'
import { errorMessage } from '../services/errors'
import { ProfileForm } from '../features/ProfileForm'
import { Catalog } from '../features/Catalog'

const areas = [ ['dashboard', 'Dashboard', '◫'], ['oggi', 'Oggi', '☀'], ['menu', 'Menù', '▤'], ['diario', 'Diario', '▥'], ['catalogo', 'Alimenti / Ricette', '◇'], ['impostazioni', 'Impostazioni', '⚙'] ]
const currentArea = () => areas.some(([key]) => key === location.hash.slice(1)) ? location.hash.slice(1) : 'impostazioni'
const descriptions: Record<string, string> = { dashboard: 'Una visione d’insieme del tuo percorso.', oggi: 'Uno spazio per organizzare la tua giornata.', menu: 'Le tue occasioni alimentari, giorno per giorno.', diario: 'La storia delle tue giornate.', catalogo: 'La tua raccolta di alimenti e preparazioni.', impostazioni: 'Un percorso che parte da te.' }

export function App() {
  const [area, setArea] = useState(currentArea)
  const [profile, setProfile] = useState<Profile>()
  const [error, setError] = useState('')
  const [retry, setRetry] = useState(0)
  useEffect(() => { const change = () => { if (location.hash === '#main') return; setArea(currentArea()); document.getElementById('page-title')?.focus() }; window.addEventListener('hashchange', change); return () => window.removeEventListener('hashchange', change) }, [])
  useEffect(() => { let active = true; initializeProfile().then(p => { if (active) { setProfile(p); setError('') } }).catch(e => { if (active) setError(errorMessage(e)) }); return () => { active = false } }, [retry])
  return <><a className="skip-link" href="#main">Vai al contenuto</a><div className="app-shell">
    <aside className="sidebar"><a className="brand" href="#impostazioni"><span className="brand-mark">f.</span><span>FATREDUCTION<small>Un giorno alla volta</small></span></a>
      <nav aria-label="Navigazione principale">{areas.map(([key, label, icon]) => <a key={key} href={`#${key}`} aria-current={area === key ? 'page' : undefined}><span aria-hidden="true">{icon}</span>{label}</a>)}</nav>
      <div className="local-note"><span className="status-dot" /> Il tuo spazio locale<p>I dati restano in questo browser.<br />Nessun account necessario.</p></div>
    </aside>
    <main id="main" tabIndex={-1}><header className="page-header"><div><p className="eyebrow">IL TUO PERCORSO, CON CONSAPEVOLEZZA</p><h1 id="page-title" tabIndex={-1}>{areas.find(([key]) => key === area)?.[1]}</h1><p>{descriptions[area]}</p></div><span className="badge">Solo sul tuo dispositivo</span></header>
      {error ? <div role="alert" className="notice error"><p>{error}</p><button onClick={() => setRetry(retry + 1)}>Riprova apertura archivio</button></div> : !profile ? <p role="status">Apertura del tuo spazio…</p> : area === 'impostazioni' ? <ProfileForm key={profile.id} profile={profile} onSaved={setProfile} /> : area === 'catalogo' ? <Catalog exclusions={profile.excludedFoodKeys} /> : <section className="panel empty"><span className="empty-symbol" aria-hidden="true">◌</span><h2>{area === 'catalogo' ? 'Il catalogo prende forma da qui' : 'Questo spazio è ancora da compilare'}</h2><p>Questa funzione sarà disponibile in una prossima tappa del progetto.</p><a className="button" href="#impostazioni">Vai al tuo profilo</a></section>}
      <footer>FATREDUCTION · Uno strumento per organizzarti, al tuo ritmo.<p>Versione in sviluppo. Backup non ancora disponibile: la pulizia dei dati del browser elimina l’archivio locale.</p></footer>
    </main></div></>
}
