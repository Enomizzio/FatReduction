# Confini locali e formato backup

## Stato attuale

Nessun backend o endpoint dati. Vite serve asset locali. Adapter implementa `initializeProfile(name?)` e `saveProfile(profile, expectedUpdatedAt, name?)`, asincroni con validazione e attesa commit. Nome database parametrico per test isolati. `errorMessage` traduce errori Zod, quota, versione e accesso; conflitti richiedono annotare modifiche e ricaricare la pagina. Altri confini sotto sono pianificati finché introdotti nei rispettivi Gate.

## Confini dei moduli

Implementati in GATE 02:

- `readCatalog(name?)`: lettura e validazione alimenti/ricette, inclusi archiviati.
- `saveFood(food, expectedRevision, name?)`, `saveRecipe(recipe, expectedRevision, name?)`: null per creazione, revisione attesa per modifica/archiviazione; ritornano il record dopo commit atomico con storico. Rifiutano conflitti, ingredienti orfani/falsificati e nuovi usi di alimenti archiviati/obsoleti; consentono mantenere gli ingredienti storici già presenti.
- `foodSnapshot`, `recipeSnapshot`, `makeQuantity`, `calculate`, `sumNutrients`, `matchedExclusions`: funzioni pure in domain/nutrition. Nessuna rete o persistenza dei totali derivati.

Errori Zod e DOMException tradotti senza payload personali. La UI aggiorna il catalogo dal record ritornato, senza confondere un refresh fallito con una scrittura fallita.

| Modulo | Operazioni previste | Vincoli |
| --- | --- | --- |
| ProfileService | Lettura, inizializzazione una volta, modifica profilo | Un profilo; default non sovrascrivono valori salvati |
| CatalogService | Gestione alimenti e ricette, archiviazione | Fonti, revisioni, quantità e ingredienti validati |
| NutritionCalculator | Calcolo voce e aggregazione | Funzioni pure, unità esplicite, fibre sconosciute conservate |
| MenuService | Creazione/revisione piano, scelta piano per data | Cinque slot, revisioni immutabili ed esclusioni sulle proposte |
| DiaryService | Apertura giornata, consumi, stato completo e peso | Pianificato separato; data locale, snapshot storici |
| ProgressService | Riepiloghi e andamento per intervallo | Solo dati disponibili, nessun indicatore sanitario inventato |
| BackupService | Export, validazione, anteprima, import sostitutivo | Nessuna rete, versioni supportate e transazione atomica |
| StorageAdapter | CRUD, indici, transazioni e migrazioni | Errori espliciti; servizi indipendenti dall'API IndexedDB |

Operazioni asincrone per persistenza; errori distinguibili: `validation`, `notFound`, `conflict`, `storageUnavailable`, `quotaExceeded`, `unsupportedVersion`, `invalidBackup`. Le firme concrete e il formato degli errori saranno fissati quando il modulo viene introdotto; non aggiungere livelli senza responsabilità reale.

Implementati in GATE 03 in services/menu:

- `readMenus(profileId, name?)`: piani, revisioni, pasti e selezioni validati; storico interamente ricostruibile.
- `saveMenu(bundle, expectedRevisionId, name?)`: null per creazione; testa attesa per nuova revisione, commit atomico e ritorno del bundle salvato. Verifica profilo, occasioni, date, snapshot, esclusioni, riferimenti al catalogo e aggregati finiti.
- `selectDayPlan(profileId, date, revisionId, expectedUpdatedAt, name?)`: scelta esplicita e unica per data con controllo conflitti; non aggiorna altri dati.
- `newMenu`, `reviseMenu`, `applySlots`, `chooseSubstitution`, `menuTotal`, `todayLocal`, `addDays`: dominio puro e date gregoriane senza conversione del giorno locale in UTC.

## Backup JSON — proposta per GATE 06

Formato completo locale, file UTF-8 suggerito `fatreduction-backup-YYYY-MM-DD.json`. Nessuna cifratura o import già implementati. Envelope previsto:

```json
{
  "format": "fatreduction-backup",
  "formatVersion": 1,
  "exportedAt": "2026-09-13T00:00:00Z",
  "appVersion": "versione-da-package-manifest",
  "data": {
    "profiles": [],
    "bodyMeasurements": [],
    "foods": [],
    "recipes": [],
    "menuPlans": [],
    "menuPlanRevisions": [],
    "plannedMeals": [],
    "dayPlanSelections": [],
    "dailyDiaries": [],
    "consumedEntries": []
  }
}
```

Esempio strutturale fittizio: gli array vuoti non costituiscono un backup reale valido; il backup reale deve contenere esattamente un profilo. I campi delle entità corrispondono al modello dati effettivo, che GATE 06 renderà uno schema verificabile. Non esportare cache, riepiloghi derivati, log o configurazione tecnica non necessaria. L'ordine degli array non modifica il significato; ID e relazioni sì.

`formatVersion` descrive il contratto portabile e non coincide necessariamente con la versione IndexedDB. Un nuovo schema richiede migrazione esplicita e test; versioni sconosciute non sono reinterpretate automaticamente.

## Importazione prevista

1. Controllare dimensione del file e parse JSON senza eseguire contenuti. Limiti iniziali proposti: 20 MiB e 100.000 record complessivi, da misurare in GATE 06.
2. Validare envelope, versione, campi ammessi, tipi, date, numeri, unità, unicità, riferimenti e invarianti di [DATA_MODEL](DATA_MODEL.md). Rifiutare chiavi pericolose per prototype pollution.
3. Preparare l'intero risultato prima di scrivere e mostrare conteggi, date e dati che saranno sostituiti.
4. Ottenere conferma esplicita per modalità sostitutiva; merge non previsto nella prima release. Proporre un backup dei dati correnti.
5. Applicare in un'unica transazione; su errore conservare i dati originali. Aggiornare UI solo dopo commit della transazione.

Gli URL delle fonti sono testo validato, mai istruzioni per scaricare dati. Note e HTML importati non devono essere eseguiti.

## Esportazioni future

CSV del diario e JSON parziali sono estensioni dopo il backup completo; schema e mitigazione delle formule CSV da definire prima dell'implementazione. Nessuna API cloud, chiave o integrazione nutrizionale esterna è richiesta nella prima release.
