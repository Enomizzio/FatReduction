# GATE 01 — Fondazione tecnica, layout, navigazione e persistenza locale

## Status

COMPLETED

## Objective

Ottenere un'app locale avviabile e compilabile, con navigazione italiana accessibile e profilo modificabile conservato in IndexedDB dopo una riapertura.

## Context

GATE 00 prepara specifiche e Git; nessun codice applicativo o dipendenza esiste. Questa implementazione inizia solo dopo nuova richiesta esplicita.

## Scope

Questo Gate include:

- Scaffold React/TypeScript/Vite integrato senza sovrascrivere i documenti; npm e lockfile.
- Script test/lint/type-check/build e configurazione iniziale.
- Layout e navigazione per le sei aree, con stati vuoti per funzioni future.
- Impostazioni profilo, default inseriti una volta, validazione e persistenza IndexedDB.
- Adapter locale e schema/migrazioni minime, errori storage e origine stabile.

## Out of Scope

Questo Gate non include:

- Catalogo/calcoli nutrizionali, menù, diario, grafici, backup e import.
- Fabbisogno calorico, piano personale definitivo, LAN/cloud o PWA.

## Requirements

### Requirement 1

Verificare versioni compatibili con Node e fissarle nel lockfile. Avvio documentato su loopback e porta fissa con strictPort. Build produce asset locali senza risorse remote obbligatorie.

### Requirement 2

Navigazione italiana da tastiera e su schermi piccoli. Impostazioni permettono modificare età, altezza, baseline, attività, obiettivo, regime, esclusioni e numero desiderato di pasti. Iniziare con i cinque slot confermati; cambiare numero configura esplicitamente etichette e ordine, senza duplicare il conteggio in persistenza.

### Requirement 3

Profilo inizializzato una volta con valori confermati, poi mai sovrascritto da default. Operazioni validate; fallimenti IndexedDB/quota comunicati conservando l'input. Schema/versione e strategia migrazioni documentati.

## Technical Constraints

ADR-001; UI/dominio/storage separati. Nessun dato giornaliero personale fittizio. Scegliere wrapper/router solo se utile e motivare scelte importanti. Nessun segreto nel client. Evitare modifica della porta che faccia apparire un archivio diverso senza spiegazione.

## Relevant Documentation

Prima dell'implementazione leggere:

- [AGENTS](../../AGENTS.md), [INDEX](../INDEX.md), [PROJECT_STATUS](../PROJECT_STATUS.md).
- [ARCHITECTURE](../ARCHITECTURE.md), [PRODUCT](../PRODUCT.md), [DATA_MODEL](../DATA_MODEL.md).
- [FRONTEND](../FRONTEND.md), [API](../API.md), [TESTING](../TESTING.md), [SECURITY](../SECURITY.md), [DECISIONS](../DECISIONS.md).

## Acceptance Criteria

Il Gate è completo quando:

- [x] Da checkout pulito si installa con lockfile, si avvia e si compila usando i comandi documentati.
- [x] Navigazione mostra sei aree italiane, pagina corrente, stati vuoti e layout usabile a 320 px e da tastiera.
- [x] Profilo iniziale corretto, tutti i valori confermati modificabili (incluse occasioni/numero di pasti), input invalidi rifiutati e unità visibili.
- [x] Dopo salvataggio e riapertura sullo stesso browser/origine i valori modificati persistono e i default non li sovrascrivono.
- [x] Errore di storage produce messaggio recuperabile e non un falso salvataggio; inizializzazione e versione schema testate.
- [x] Unitari/integrazione pertinenti, lint, type-check, build e review manuale passano.
- [x] Documenti riflettono script, versioni, struttura e store effettivi; Gate 02 resta da avviare.

## Validation

- [x] Unit test — invarianti profilo e inizializzazione idempotente.
- [x] Integration test — adapter e form, salvataggio/riapertura ed errore storage.
- [x] End-to-end test — opzionale qui; se assente verificare persistenza nel browser manualmente e motivare N/A.
- [x] Lint
- [x] Type-check
- [x] Build
- [x] Verifica manuale — avvio, reload, navigazione, tastiera, viewport piccolo ed errore storage.
- [x] Validatore documentale; registrare comandi effettivi e risultati.

## Gate Result

`PASS`

## Completion Information

Started: 2026-09-13, richiesta esplicita di implementare i prossimi due Gate (01 e 02).

Completed: 2026-09-13.

Git commit / reference: `8554bd2`, creato con l'identità successivamente fornita dall'utente. Albero identico a refs/checkpoints/gate-01; comprende anche il bootstrap. Snapshot originale conservato.

## Notes

Git/Node/npm presenti nel sistema; esecuzione dai percorsi utente può richiedere accesso fuori sandbox. Identità Git ora configurata localmente e checkpoint trasformato in commit. Questa tappa non dispone ancora di backup e non è la release completa.

### Prove della Gate Review — 2026-09-13

- npm ci PASS, 243 pacchetti reinstallati dal lockfile; zero vulnerabilità segnalate.
- npm run typecheck, npm run lint, npm test (3 test), npm run build: PASS.
- npm run test:e2e: 2 scenari Chromium PASS; inizializzazione, modifica/riapertura, sei aree, focus skip link, tastiera, 320 px senza overflow, storage negato recuperabile. Axe senza violazioni nelle viste testate.
- Review visiva dell'agente su screenshot desktop e 320 px: etichette, unità, stato locale, ordine pasti e leggibilità verificati. Interazioni effettuate via Playwright; non dichiarata una prova umana con screen reader. Quota simulata a livello form; input conservato e nuovo tentativo riuscito. Nessuna verifica obbligatoria N/A.
- Validatore documentale PASS; sorgenti, schema v1, comandi, versioni e ADR aggiornati. Gate 02 non iniziato al checkpoint; avvio successivo già autorizzato dalla richiesta dei due Gate.
