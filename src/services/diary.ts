import { consumedEntrySchema, diarySchema, measurementSchema, validateDiary, type DiaryBundle } from '../domain/diary'
import { localDateSchema } from '../domain/menu'
import { profileSchema } from '../domain/profile'
import { DATABASE_NAME, withDatabase } from '../storage/database'
import { verifyCatalogItem } from './menu'

export type DiarySaveOptions = {
  expectedUpdatedAt: string | null
  expectedWeightUpdatedAt: string | null
  confirmPlanChange?: boolean
  confirmEntryRemoval?: boolean
  confirmMeasurementRemoval?: boolean
}

export async function readDiary(profileId: string, date: string, name = DATABASE_NAME): Promise<DiaryBundle | null> {
  localDateSchema.parse(date)
  return withDatabase(async db => {
    const tx = db.transaction(['dailyDiaries', 'consumedEntries', 'bodyMeasurements', 'menuPlanRevisions', 'menuPlans', 'plannedMeals'], 'readonly')
    const diary = await tx.objectStore('dailyDiaries').index('profileDate').get([profileId, date])
    if (!diary) { await tx.done; return null }
    const entries = await tx.objectStore('consumedEntries').index('diary').getAll(diary.id)
    const measurement = await tx.objectStore('bodyMeasurements').index('profileDate').get([profileId, date]) ?? null
    const valid = validateDiary({ diary, entries, measurement })
    if (diary.plannedRevisionId) {
      const revision = await tx.objectStore('menuPlanRevisions').get(diary.plannedRevisionId)
      const plan = revision && await tx.objectStore('menuPlans').get(revision.menuPlanId)
      const planned = (await tx.objectStore('plannedMeals').getAll()).filter(m => m.revisionId === diary.plannedRevisionId && m.date === diary.date).flatMap(m => m.items)
      if (!plan || plan.profileId !== profileId || date < plan.startDate || date > plan.endDate || entries.some(e => e.plannedItemId && !planned.some(i => i.id === e.plannedItemId))) throw new Error('Riferimenti storici del diario non validi.')
    } else if (entries.some(e => e.plannedItemId)) throw new Error('Riferimento al previsto senza piano.')
    await tx.done
    return valid
  }, name)
}

export async function readDiaryHistory(profileId: string, name = DATABASE_NAME) {
  return withDatabase(async db => {
    const tx = db.transaction(['dailyDiaries', 'bodyMeasurements'], 'readonly')
    const [diaries, measurements] = await Promise.all([tx.objectStore('dailyDiaries').getAll(), tx.objectStore('bodyMeasurements').getAll()])
    await tx.done
    return { diaries: diaries.map(d => diarySchema.parse(d)).filter(d => d.profileId === profileId).sort((a, b) => b.date.localeCompare(a.date)), measurements: measurements.map(m => measurementSchema.parse(m)).filter(m => m.profileId === profileId) }
  }, name)
}

export async function saveDiary(input: DiaryBundle, options: DiarySaveOptions, name = DATABASE_NAME): Promise<DiaryBundle> {
  const valid = validateDiary(input)
  return withDatabase(async db => {
    const tx = db.transaction(['profiles', 'dailyDiaries', 'consumedEntries', 'bodyMeasurements', 'menuPlans', 'menuPlanRevisions', 'plannedMeals', 'foods', 'recipes', 'foodRevisions', 'recipeRevisions'], 'readwrite')
    try {
      const d = valid.diary, profile = profileSchema.parse(await tx.objectStore('profiles').get(d.profileId))
      const current = await tx.objectStore('dailyDiaries').index('profileDate').get([d.profileId, d.date])
      if ((current?.updatedAt ?? null) !== options.expectedUpdatedAt || (current && current.id !== d.id)) throw new Error('Diario modificato in un’altra scheda. Conserva gli input e ricarica.')
      const byId = await tx.objectStore('dailyDiaries').get(d.id)
      if (byId && (!current || byId.profileId !== d.profileId || byId.date !== d.date)) throw new Error('Identità del diario non valida.')
      const oldEntries = current ? (await tx.objectStore('consumedEntries').index('diary').getAll(d.id)).map(e => consumedEntrySchema.parse(e)) : []
      const removed = oldEntries.filter(e => !valid.entries.some(i => i.id === e.id))
      if (removed.length && !options.confirmEntryRemoval) throw new Error('Conferma la rimozione delle voci consumate.')
      const changedPlan = !!current && current.plannedRevisionId !== d.plannedRevisionId
      if (changedPlan && !options.confirmPlanChange) throw new Error('Conferma il cambio del piano storico.')
      const revision = d.plannedRevisionId ? await tx.objectStore('menuPlanRevisions').get(d.plannedRevisionId) : null
      const plan = revision ? await tx.objectStore('menuPlans').get(revision.menuPlanId) : null
      if (d.plannedRevisionId && (!revision || !plan || plan.profileId !== d.profileId || d.date < plan.startDate || d.date > plan.endDate)) throw new Error('Piano non valido per la data del diario.')
      const incoming = revision?.mealSlotsSnapshot ?? profile.mealSlots
      const expectedSlots = current && !changedPlan ? current.mealSlotsSnapshot : [...incoming, ...(current?.mealSlotsSnapshot ?? []).filter(s => !incoming.some(i => i.key === s.key) && valid.entries.some(e => e.slot === s.key))]
      if (JSON.stringify(d.mealSlotsSnapshot) !== JSON.stringify(expectedSlots)) throw new Error('Occasioni storiche non valide: riapri il diario.')
      const planned = (await tx.objectStore('plannedMeals').getAll()).filter(m => m.revisionId === d.plannedRevisionId && m.date === d.date).flatMap(m => m.items)
      const [foods, recipes, foodHistory, recipeHistory] = await Promise.all([tx.objectStore('foods').getAll(), tx.objectStore('recipes').getAll(), tx.objectStore('foodRevisions').getAll(), tx.objectStore('recipeRevisions').getAll()])
      for (const entry of valid.entries) {
        const owner = await tx.objectStore('consumedEntries').get(entry.id)
        if (owner && owner.diaryId !== d.id) throw new Error('Identità della voce già usata in un’altra giornata.')
        const copied = entry.plannedItemId ? planned.find(i => i.id === entry.plannedItemId) : undefined
        if (entry.plannedItemId && (!copied || copied.kind !== entry.kind || JSON.stringify(copied.snapshot) !== JSON.stringify(entry.snapshot))) throw new Error('Riferimento alla voce pianificata non valido.')
        verifyCatalogItem(entry, [...oldEntries, ...(copied ? [{ ...copied, id: entry.id }] : [])], foods, recipes, foodHistory, recipeHistory)
      }
      const currentWeight = await tx.objectStore('bodyMeasurements').index('profileDate').get([d.profileId, d.date])
      if ((currentWeight?.updatedAt ?? null) !== options.expectedWeightUpdatedAt) throw new Error('Peso modificato in un’altra scheda. Conserva gli input e ricarica.')
      if (currentWeight && !valid.measurement && !options.confirmMeasurementRemoval) throw new Error('Conferma la cancellazione della misurazione.')
      if (valid.measurement) {
        const weightById = await tx.objectStore('bodyMeasurements').get(valid.measurement.id)
        if ((currentWeight && valid.measurement.id !== currentWeight.id) || (weightById && (weightById.profileId !== d.profileId || weightById.date !== d.date))) throw new Error('Una sola misurazione per data: aggiorna quella esistente.')
      }
      const now = new Date(Math.max(Date.now(), Date.parse(current?.updatedAt ?? '') + 1 || 0, Date.parse(currentWeight?.updatedAt ?? '') + 1 || 0)).toISOString()
      const saved = validateDiary({ diary: { ...d, createdAt: current?.createdAt ?? now, updatedAt: now }, entries: valid.entries.map(e => ({ ...e, createdAt: oldEntries.find(old => old.id === e.id)?.createdAt ?? now, updatedAt: now })), measurement: valid.measurement ? { ...valid.measurement, createdAt: currentWeight?.createdAt ?? now, updatedAt: now } : null })
      await tx.objectStore('dailyDiaries').put(saved.diary)
      for (const entry of removed) await tx.objectStore('consumedEntries').delete(entry.id)
      for (const entry of saved.entries) await tx.objectStore('consumedEntries').put(entry)
      if (saved.measurement) await tx.objectStore('bodyMeasurements').put(saved.measurement)
      else if (currentWeight) await tx.objectStore('bodyMeasurements').delete(currentWeight.id)
      await tx.done
      return saved
    } catch (error) { try { tx.abort() } catch { /* Transazione già terminata. */ } await tx.done.catch(() => {}); throw error }
  }, name)
}
