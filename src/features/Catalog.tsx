import { useEffect, useState } from 'react'
import { Field } from '../components/Field'
import { NutrientsView, QuantityCalculator, SourceView, formatNumber } from '../components/NutritionDetails'
import { foodSnapshot, matchedExclusions, recipeSnapshot, type Food, type Recipe } from '../domain/nutrition'
import { keyLabel, normalizeKey } from '../domain/profile'
import { readCatalog, saveFood, saveRecipe } from '../services/catalog'
import { errorMessage } from '../services/errors'
import { FoodForm } from './FoodForm'
import { RecipeForm } from './RecipeForm'

type Editor = { kind: 'food'; item?: Food } | { kind: 'recipe'; item?: Recipe }
export function Catalog({ exclusions }: { exclusions: string[] }) {
  const [catalog, setCatalog] = useState<{ foods: Food[]; recipes: Recipe[] }>()
  const [tab, setTab] = useState<'foods' | 'recipes'>('foods')
  const [query, setQuery] = useState('')
  const [archived, setArchived] = useState(false)
  const [editor, setEditor] = useState<Editor>()
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [retry, setRetry] = useState(0)
  const [busy, setBusy] = useState(false)
  useEffect(() => { let active = true; readCatalog().then(data => { if (active) { setCatalog(data); setError('') } }).catch(e => { if (active) setError(errorMessage(e)) }); return () => { active = false } }, [retry])
  function updatedFood(food: Food) { setCatalog(c => c && ({ ...c, foods: [...c.foods.filter(f => f.id !== food.id), food] })); setEditor(undefined); document.getElementById('page-title')?.focus(); setError(''); setMessage('Alimento salvato su questo browser.') }
  function updatedRecipe(recipe: Recipe) { setCatalog(c => c && ({ ...c, recipes: [...c.recipes.filter(r => r.id !== recipe.id), recipe] })); setEditor(undefined); document.getElementById('page-title')?.focus(); setError(''); setMessage('Ricetta salvata su questo browser.') }
  async function archive(item: Food | Recipe) {
    setBusy(true); setError(''); setMessage('')
    try { if ('nutrients' in item) updatedFood(await saveFood({ ...item, archived: !item.archived }, item.revision)); else updatedRecipe(await saveRecipe({ ...item, archived: !item.archived }, item.revision)); setMessage(item.archived ? 'Elemento ripristinato.' : 'Elemento archiviato. Fonti e revisioni conservate.') }
    catch (e) { setError(errorMessage(e)) } finally { setBusy(false) }
  }
  if (!catalog) return error ? <div className="notice error" role="alert">{error}<button onClick={() => setRetry(retry + 1)}>Riprova catalogo</button></div> : <p role="status">Apertura catalogo…</p>
  if (editor?.kind === 'food') return <FoodForm food={editor.item} onSaved={updatedFood} onCancel={() => { setEditor(undefined); document.getElementById('page-title')?.focus() }} />
  if (editor?.kind === 'recipe') return <RecipeForm recipe={editor.item} foods={catalog.foods} exclusions={exclusions} onSaved={updatedRecipe} onCancel={() => { setEditor(undefined); document.getElementById('page-title')?.focus() }} />
  const items = catalog[tab].filter(item => item.archived === archived && normalizeKey(item.name).includes(normalizeKey(query))).sort((a, b) => a.name.localeCompare(b.name, 'it'))
  return <div className="stack"><section className="catalog-intro"><div><p className="eyebrow">LA TUA RACCOLTA</p><h2>Conosci quello che prepari</h2><p>Nutrienti, ingredienti e fonti in un unico posto. Tutti i valori nutrizionali sono stime.</p></div><span className="catalog-decoration" aria-hidden="true">◒</span></section>
    <div className="catalog-toolbar"><div className="actions" aria-label="Tipo di catalogo"><button aria-pressed={tab === 'foods'} onClick={() => { setTab('foods'); setMessage('') }}>Alimenti</button><button aria-pressed={tab === 'recipes'} onClick={() => { setTab('recipes'); setMessage('') }}>Ricette</button></div><button className="primary" onClick={() => { setMessage(''); setEditor(tab === 'foods' ? { kind: 'food' } : { kind: 'recipe' }) }}>{tab === 'foods' ? '+ Nuovo alimento' : '+ Nuova ricetta'}</button></div>
    <div className="catalog-toolbar"><Field label="Cerca nel catalogo" value={query} maxLength={200} onChange={e => setQuery(e.target.value)} /><label className="check"><input type="checkbox" checked={archived} onChange={e => setArchived(e.target.checked)} /> Mostra archiviati</label></div>
    {error && <div className="notice error" role="alert">{error}</div>}{message && <div className="notice" role="status">{message}</div>}
    {!items.length ? <section className="panel empty"><span className="empty-symbol" aria-hidden="true">◇</span><h2>{query || archived ? 'Nessun risultato' : tab === 'foods' ? 'Il tuo primo alimento' : 'La tua prima ricetta'}</h2><p>{query || archived ? 'Prova un’altra ricerca o cambia il filtro.' : tab === 'foods' ? 'Aggiungi un alimento e riporta i nutrienti dalla sua fonte.' : 'Scegli gli ingredienti dal catalogo e dichiara la resa finale.'}</p></section> : <div className="stack">{items.map(item => {
      const isFood = 'nutrients' in item
      const snapshot = isFood ? foodSnapshot(item) : recipeSnapshot(item)
      const matches = matchedExclusions(snapshot, exclusions)
      return <article className="panel" key={item.id}><div className="section-heading"><h2>{item.name}</h2><span className="badge">{item.archived ? 'Archiviato' : 'Stima nutrizionale'}</span></div><p className="muted">{isFood ? 'Valori per' : 'Totale ricetta · resa'} {formatNumber(snapshot.basisAmount)} {snapshot.basisUnit}</p>
        <NutrientsView nutrients={snapshot.nutrients} /><SourceView source={snapshot.source} />
        {matches.length > 0 && <p className="notice">Contiene alimenti esclusi: {matches.map(keyLabel).join(', ')}. Escluso dalle proposte; conservabile nel catalogo.</p>}
        {isFood && item.portionConversions.length > 0 && <details><summary>Porzioni e conversioni</summary>{item.portionConversions.map(c => <p key={c.label}>{c.label}: {formatNumber(c.basisQuantity)} {item.basisUnit} · Fonte: {c.source}</p>)}</details>}
        {!isFood && <details><summary>Ingredienti, fonti e preparazione</summary>{item.ingredients.map(i => <div className="ingredient-box" key={i.id}><strong>{i.snapshot.displayName}</strong><p>{formatNumber(i.quantity.amount)} {i.quantity.unit === 'portion' ? 'porzioni' : i.quantity.unit} · Base fonte: {formatNumber(i.snapshot.basisAmount)} {i.snapshot.basisUnit}</p>{i.quantity.conversionSource && <p>Fattore: {formatNumber(i.quantity.conversionToBasis)} {i.quantity.basisUnit} per unità · {i.quantity.conversionSource}</p>}<SourceView source={i.snapshot.source} /></div>)}{item.instructions && <p className="instructions">{item.instructions}</p>}</details>}
        <QuantityCalculator snapshot={snapshot} conversions={isFood ? item.portionConversions : []} />
        <div className="actions card-actions"><button disabled={busy} onClick={() => setEditor(isFood ? { kind: 'food', item } : { kind: 'recipe', item })}>Modifica {isFood ? 'alimento' : 'ricetta'}</button><button disabled={busy} onClick={() => void archive(item)}>{item.archived ? 'Ripristina' : 'Archivia'}</button></div>
      </article>
    })}</div>}
  </div>
}
