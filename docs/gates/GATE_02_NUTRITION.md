# GATE 02 — Alimenti, ricette e calcoli nutrizionali

## Status

COMPLETED

## Objective

Gestire un catalogo locale con fonti e ottenere calorie/macronutrienti verificabili da quantità di alimenti e ricette.

## Context

Richiede GATE 01 PASS, profilo e storage operativi. Non esiste ancora un dominio nutrizionale implementato.

## Scope

Questo Gate include:

- Catalogo alimenti con valori per base, fonti, conversioni e archiviazione.
- Ricette con ingredienti, resa dichiarata e calcolo per quantità.
- Calcoli puri, snapshot e propagazione delle esclusioni.
- UI Alimenti/Ricette e schema/migrazioni necessari.

## Out of Scope

Questo Gate non include:

- Pianificazione menù, diario, dashboard, import/export e prescrizioni personali.
- Database esterno obbligatorio, scansioni, ricette annidate o fattori clinici inventati.

## Requirements

### Requirement 1

CRUD validato per alimenti con kcal, proteine, carboidrati, grassi e fibre se disponibili, base/unità e fonte. Informazioni manuali etichettate stimate; eventuali valori iniziali hanno fonte verificata, senza attribuzioni inventate.

### Requirement 2

Conversioni solo con fattore dichiarato; ricette con almeno un alimento e resa >0. Totali derivati dagli ingredienti senza inventare effetti della cottura. Snapshot conservano nutrienti, fonte e conversione usati.

### Requirement 3

Riconoscere il tartufo e altre esclusioni tramite ingredienti, inclusi quelli di ricetta. Archiviazione e revisioni non invalidano snapshot storici. Fibre sconosciute non diventano zero.

## Technical Constraints

DATA_MODEL e ADR-002. Funzioni pure e arrotondamento solo UI. Nessuna rete obbligatoria. Eventuali fonti alimentari vanno verificate e documentate con condizioni d'uso prima di includere dati nel repo.

## Relevant Documentation

Prima dell'implementazione leggere:

- [AGENTS](../../AGENTS.md), [INDEX](../INDEX.md), [PROJECT_STATUS](../PROJECT_STATUS.md).
- [DATA_MODEL](../DATA_MODEL.md), [PRODUCT](../PRODUCT.md), [API](../API.md), [FRONTEND](../FRONTEND.md), [TESTING](../TESTING.md), [SECURITY](../SECURITY.md), [DECISIONS](../DECISIONS.md).

## Acceptance Criteria

Il Gate è completo quando:

- [x] Alimenti e ricette creati/modificati/archiviati persistono e mostrano fonte, base, unità e stima.
- [x] Calcoli verificati su quantità frazionarie, porzioni convertite e ricetta con resa; conversione ignota blocca il calcolo.
- [x] Fibre mancanti e calorie indipendenti dai macro sono trattate come specificato.
- [x] Snapshot non cambiano quando cambia il catalogo; nessun totale derivato duplicato in storage.
- [x] Esclusioni rilevate anche negli ingredienti di ricetta, senza impedire future registrazioni reali.
- [x] Test pertinenti, lint, type-check, build, migrazioni e review UI passano; fonti e decisioni aggiornate.

## Validation

- [x] Unit test — proporzioni, conversioni, resa, null, input invalidi ed esclusioni.
- [x] Integration test — catalogo, revisioni, archiviazione e migrazione senza perdita.
- [x] End-to-end test — se runner presente, catalogo/ricetta; altrimenti motivare verifica manuale.
- [x] Lint
- [x] Type-check
- [x] Build
- [x] Verifica manuale — fonti, unità, form ed errori.
- [x] Validatore documentale e prove registrate.

## Gate Result

`PASS`

## Completion Information

Started: 2026-09-13, dopo PASS e checkpoint di GATE 01; richiesta dei due Gate già autorizzata.

Completed: 2026-09-13.

Git commit / reference: `f513bb0`, figlio del commit GATE 01 `8554bd2`, creato con l'identità successivamente fornita dall'utente. Albero identico a refs/checkpoints/gate-02; snapshot originale conservato.

## Notes

Fonti manuali con provenienza obbligatoria e porzioni dichiarate, ADR-005. Nessun dataset esterno incluso e nessun target calorico personale scelto.

### Prove della Gate Review — 2026-09-13

- npm run typecheck, npm run lint, npm test (12 test in 3 file), npm run build: PASS. Stesso lockfile già verificato con npm ci in GATE 01, nessuna nuova dipendenza.
- Test dominio: quantità frazionarie, porzioni, densità esplicita, unità incoerenti/conversione ignota, resa, fibre null, calorie indipendenti dai macro, overflow, fonti manuali e URL, esclusioni dirette e di ricetta, copie snapshot indipendenti.
- Integrazione: v1 -> v2 conserva esattamente il profilo, versione futura rifiutata, revisioni e archiviazione persistenti, riferimenti orfani/snapshot falsificati rifiutati, rollback atomico su collisione nello storico. Ricette senza totali duplicati in storage.
- npm run test:e2e: 4 scenari Chromium PASS, inclusa regressione GATE 01. Creazione alimento e ricetta, porzioni, modifica catalogo, conservazione fonti, modifica quantità di ingredienti già archiviati, archiviazione/ripristino, reload, quota e nuovo tentativo senza perdita input, input invalidi e istruzioni simili a script renderizzate inerti.
- Axe senza violazioni nelle viste esaminate. Nessun overflow orizzontale a 320 px. Review visiva dell'agente su screenshot catalogo/food form a 320 px e recipe form desktop: unità, fonti, errori, resa, fibre sconosciute ed esclusioni leggibili. Interazioni via Playwright, non una verifica umana con screen reader; audit release futuro. Nessuna verifica obbligatoria N/A.
- Validatore documentale PASS; modello v2, API, fonti, frontend, testing, sicurezza, decisioni e stato aggiornati. Prompt originale preservato. GATE 03 non avviato.
