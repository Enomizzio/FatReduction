# GATE 02 — Alimenti, ricette e calcoli nutrizionali

## Status

NOT STARTED

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

- [ ] Alimenti e ricette creati/modificati/archiviati persistono e mostrano fonte, base, unità e stima.
- [ ] Calcoli verificati su quantità frazionarie, porzioni convertite e ricetta con resa; conversione ignota blocca il calcolo.
- [ ] Fibre mancanti e calorie indipendenti dai macro sono trattate come specificato.
- [ ] Snapshot non cambiano quando cambia il catalogo; nessun totale derivato duplicato in storage.
- [ ] Esclusioni rilevate anche negli ingredienti di ricetta, senza impedire future registrazioni reali.
- [ ] Test pertinenti, lint, type-check, build, migrazioni e review UI passano; fonti e decisioni aggiornate.

## Validation

- [ ] Unit test — proporzioni, conversioni, resa, null, input invalidi ed esclusioni.
- [ ] Integration test — catalogo, revisioni, archiviazione e migrazione senza perdita.
- [ ] End-to-end test — se runner presente, catalogo/ricetta; altrimenti motivare verifica manuale.
- [ ] Lint
- [ ] Type-check
- [ ] Build
- [ ] Verifica manuale — fonti, unità, form ed errori.
- [ ] Validatore documentale e prove registrate.

## Gate Result

`NOT EVALUATED`

## Completion Information

Started: non iniziato.

Completed: non completato.

Git commit / reference: da registrare al completamento.

## Notes

La scelta delle fonti e delle porzioni è ancora aperta; non scegliere un target calorico personale in questo Gate.
