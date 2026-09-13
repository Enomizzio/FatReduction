import { openDB, type DBSchema, type IDBPDatabase } from 'idb'
import { defaultProfile, profileSchema, type Profile } from '../domain/profile'
import type { Food, Recipe } from '../domain/nutrition'

interface Database extends DBSchema {
  profiles: { key: string; value: Profile }
  foods: { key: string; value: Food }
  foodRevisions: { key: [string, number]; value: Food }
  recipes: { key: string; value: Recipe }
  recipeRevisions: { key: [string, number]; value: Recipe }
}
export const DATABASE_NAME = 'fatreduction'
export const DATABASE_VERSION = 2

export async function openDatabase(name = DATABASE_NAME) {
  const opening = openDB<Database>(name, DATABASE_VERSION, {
    upgrade(db, oldVersion) {
      if (oldVersion < 1) db.createObjectStore('profiles', { keyPath: 'id' })
      if (oldVersion < 2) {
        db.createObjectStore('foods', { keyPath: 'id' })
        db.createObjectStore('foodRevisions', { keyPath: ['id', 'revision'] })
        db.createObjectStore('recipes', { keyPath: 'id' })
        db.createObjectStore('recipeRevisions', { keyPath: ['id', 'revision'] })
      }
    },
    blocked() { /* Il timeout sotto comunica un errore recuperabile alla UI. */ },
    blocking() { void opening.then(db => db.close()) },
  })
  return opening
}

export async function withDatabase<T>(operation: (db: IDBPDatabase<Database>) => Promise<T>, name = DATABASE_NAME): Promise<T> {
  let expired = false
  let timer: ReturnType<typeof setTimeout> | undefined
  const opening = openDatabase(name).then(db => { if (expired) db.close(); return db })
  try {
    const db = await Promise.race([opening, new Promise<never>((_, reject) => {
      timer = setTimeout(() => { expired = true; reject(new Error('Archivio occupato: chiudi le altre schede e riprova.')) }, 3000)
    })])
    try { return await operation(db) } finally { db.close() }
  } finally { clearTimeout(timer) }
}

export async function initializeProfile(name = DATABASE_NAME): Promise<Profile> {
  return withDatabase(async db => {
    const tx = db.transaction('profiles', 'readwrite')
    const existing = await tx.store.getAll()
    if (existing.length > 1) { tx.abort(); await tx.done.catch(() => {}); throw new Error('Archivio profilo non valido.') }
    const profile = profileSchema.parse(existing[0] ?? defaultProfile())
    if (!existing.length) await tx.store.add(profile)
    await tx.done
    return profile
  }, name)
}

export async function saveProfile(profile: Profile, expectedUpdatedAt: string, name = DATABASE_NAME): Promise<Profile> {
  const valid = profileSchema.parse(profile)
  return withDatabase(async db => {
    const tx = db.transaction('profiles', 'readwrite')
    const current = await tx.store.get(valid.id)
    if (!current || current.updatedAt !== expectedUpdatedAt) {
      tx.abort(); await tx.done.catch(() => {})
      throw new Error('Il profilo è cambiato in un’altra scheda. Annota le modifiche e ricarica la pagina prima di riprovare.')
    }
    const saved = { ...valid, createdAt: current.createdAt, updatedAt: new Date(Math.max(Date.now(), Date.parse(current.updatedAt) + 1)).toISOString() }
    await tx.store.put(saved)
    await tx.done
    return saved
  }, name)
}
