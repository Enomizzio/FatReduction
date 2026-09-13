import { foodSnapshot, recipeSnapshot, matchedExclusions, type Food, type Recipe } from '../domain/nutrition'
import { menuPlanSchema, menuRevisionSchema, plannedMealSchema, selectionSchema, validateMenu, localDateSchema, type MenuBundle, type MenuData, type PlannedItem } from '../domain/menu'
import { profileSchema } from '../domain/profile'
import { DATABASE_NAME, withDatabase } from '../storage/database'

export function verifyCatalogItem(item: PlannedItem, previous: PlannedItem[], foods: Food[], recipes: Recipe[], foodHistory: Food[], recipeHistory: Recipe[]) {
  const source = item.kind === 'food' ? foodHistory.find(f => f.id === item.catalogId && f.revision === item.snapshot.catalogRevision) : recipeHistory.find(r => r.id === item.catalogId && r.revision === item.snapshot.catalogRevision)
  const snapshot = source ? item.kind === 'food' ? foodSnapshot(source as Food) : recipeSnapshot(source as Recipe) : null
  if (JSON.stringify(snapshot) !== JSON.stringify(item.snapshot)) throw new Error('Fonte non valida: seleziona di nuovo la voce dal catalogo.')
  const unchanged = previous.some(p => p.id === item.id && p.kind === item.kind && JSON.stringify(p.snapshot) === JSON.stringify(item.snapshot))
  const latest = (item.kind === 'food' ? foods : recipes).find(i => i.id === item.catalogId)
  if (!unchanged && (!latest || latest.archived || latest.revision !== item.snapshot.catalogRevision)) throw new Error('Catalogo aggiornato o archiviato: ricarica prima di aggiungere la voce.')
}

export async function readMenus(profileId: string, name = DATABASE_NAME): Promise<MenuData> {
  return withDatabase(async db => {
    const tx = db.transaction(['menuPlans', 'menuPlanRevisions', 'plannedMeals', 'dayPlanSelections'], 'readonly')
    const [rawPlans, rawRevisions, rawMeals, rawSelections] = await Promise.all([tx.objectStore('menuPlans').getAll(), tx.objectStore('menuPlanRevisions').getAll(), tx.objectStore('plannedMeals').getAll(), tx.objectStore('dayPlanSelections').getAll()])
    await tx.done
    const plans = rawPlans.map(p => menuPlanSchema.parse(p)).filter(p => p.profileId === profileId)
    const revisions = rawRevisions.map(r => menuRevisionSchema.parse(r)).filter(r => plans.some(p => p.id === r.menuPlanId))
    const meals = rawMeals.map(m => plannedMealSchema.parse(m)).filter(m => revisions.some(r => r.id === m.revisionId))
    const selections = rawSelections.map(s => selectionSchema.parse(s)).filter(s => s.profileId === profileId)
    for (const revision of revisions) validateMenu({ plan: { ...plans.find(p => p.id === revision.menuPlanId)!, currentRevisionId: revision.id }, revision, meals: meals.filter(m => m.revisionId === revision.id) })
    if (plans.some(p => !revisions.some(r => r.id === p.currentRevisionId)) || selections.some(s => !meals.some(m => m.revisionId === s.revisionId && m.date === s.date))) throw new Error('Riferimenti del menù non validi.')
    return { plans, revisions, meals, selections }
  }, name)
}

export async function saveMenu(input: MenuBundle, expectedRevisionId: string | null, name = DATABASE_NAME): Promise<MenuBundle> {
  const valid = validateMenu(input)
  return withDatabase(async db => {
    const tx = db.transaction(['profiles', 'menuPlans', 'menuPlanRevisions', 'plannedMeals', 'foods', 'recipes', 'foodRevisions', 'recipeRevisions'], 'readwrite')
    try {
      const current = await tx.objectStore('menuPlans').get(valid.plan.id)
      if ((current?.currentRevisionId ?? null) !== expectedRevisionId) throw new Error('Piano modificato in un’altra scheda. Conserva la bozza e ricarica.')
      const profile = profileSchema.parse(await tx.objectStore('profiles').get(valid.plan.profileId))
      if (current && (current.profileId !== valid.plan.profileId || current.startDate !== valid.plan.startDate || current.endDate !== valid.plan.endDate || current.title !== valid.plan.title)) throw new Error('Titolo e intervallo appartengono al piano originale. Crea un nuovo piano per cambiarli.')
      if (JSON.stringify(profile.mealSlots) !== JSON.stringify(valid.revision.mealSlotsSnapshot)) throw new Error('Applica le occasioni attuali del profilo alla nuova revisione.')
      const oldRevision = current ? await tx.objectStore('menuPlanRevisions').get(current.currentRevisionId) : undefined
      if (valid.revision.revisionNumber !== (oldRevision?.revisionNumber ?? 0) + 1) throw new Error('Numero di revisione non valido.')
      const previous = (await tx.objectStore('plannedMeals').getAll()).filter(m => m.revisionId === current?.currentRevisionId).flatMap(m => [...m.items, ...m.substitutions])
      const [foods, recipes, foodHistory, recipeHistory] = await Promise.all([tx.objectStore('foods').getAll(), tx.objectStore('recipes').getAll(), tx.objectStore('foodRevisions').getAll(), tx.objectStore('recipeRevisions').getAll()])
      for (const item of valid.meals.flatMap(m => [...m.items, ...m.substitutions])) {
        verifyCatalogItem(item, previous, foods, recipes, foodHistory, recipeHistory)
        if (matchedExclusions(item.snapshot, profile.excludedFoodKeys).length) throw new Error('Una voce contiene ingredienti esclusi nel profilo attuale. Rimuovila dalla nuova proposta; lo storico resta conservato.')
      }
      const now = new Date().toISOString()
      const saved = validateMenu({ ...valid, plan: { ...valid.plan, createdAt: current?.createdAt ?? now, updatedAt: now }, revision: { ...valid.revision, createdAt: now } })
      await tx.objectStore('menuPlans').put(saved.plan)
      await tx.objectStore('menuPlanRevisions').add(saved.revision)
      for (const meal of saved.meals) await tx.objectStore('plannedMeals').add(meal)
      await tx.done
      return saved
    } catch (error) { try { tx.abort() } catch { /* Già terminata. */ } await tx.done.catch(() => {}); throw error }
  }, name)
}

export async function selectDayPlan(profileId: string, date: string, revisionId: string, expectedUpdatedAt: string | null, name = DATABASE_NAME) {
  localDateSchema.parse(date)
  return withDatabase(async db => {
    const tx = db.transaction(['profiles', 'menuPlans', 'menuPlanRevisions', 'plannedMeals', 'dayPlanSelections'], 'readwrite')
    try {
      const revision = await tx.objectStore('menuPlanRevisions').get(revisionId)
      const plan = revision && await tx.objectStore('menuPlans').get(revision.menuPlanId)
      if (!plan || plan.profileId !== profileId || date < plan.startDate || date > plan.endDate || !await tx.objectStore('profiles').get(profileId)) throw new Error('Piano non disponibile per questa data.')
      const current = await tx.objectStore('dayPlanSelections').index('profileDate').get([profileId, date])
      if ((current?.updatedAt ?? null) !== expectedUpdatedAt) throw new Error('Selezione cambiata in un’altra scheda. Ricarica la pagina.')
      const now = new Date(Math.max(Date.now(), Date.parse(current?.updatedAt ?? '') + 1 || 0)).toISOString()
      const saved = selectionSchema.parse({ id: current?.id ?? crypto.randomUUID(), profileId, date, revisionId, createdAt: current?.createdAt ?? now, updatedAt: now })
      await tx.objectStore('dayPlanSelections').put(saved); await tx.done
      return saved
    } catch (error) { try { tx.abort() } catch { /* Già terminata. */ } await tx.done.catch(() => {}); throw error }
  }, name)
}
