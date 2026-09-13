import { z } from 'zod'

export function errorMessage(error: unknown): string {
  if (error instanceof z.ZodError) return 'Controlla i campi: valori fuori limite o dati non validi. Nessuna modifica salvata.'
  if (error instanceof DOMException) {
    if (error.name === 'QuotaExceededError') return 'Spazio del browser esaurito. Libera spazio e riprova: i dati inseriti sono ancora qui.'
    if (error.name === 'VersionError') return 'L’archivio richiede una versione più recente dell’app.'
    return 'Archivio locale non disponibile. Verifica le impostazioni del browser e riprova.'
  }
  return error instanceof Error ? error.message : 'Operazione non riuscita. Riprova.'
}
