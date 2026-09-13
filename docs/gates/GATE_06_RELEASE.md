# GATE 06 — Backup, import-export, accessibilità, hardening e release locale

## Status

NOT STARTED

## Objective

Consegnare una prima release locale installabile, con dati ripristinabili da backup documentato e percorsi principali verificati per sicurezza e accessibilità.

## Context

Richiede GATE 05 PASS. La gestione backup deve essere completata prima di presentare l'app come release utilizzabile per lo storico personale.

## Scope

Questo Gate include:

- Backup JSON completo e schema/versioni documentati.
- Import sostitutivo validato, anteprima, conferma e rollback atomico.
- Cancellazione dati confermata e gestione quota/multi-tab/migrazioni.
- Verifica accessibilità dei percorsi, errori e responsive design.
- Packaging statico, avvio locale riproducibile e guida backup/ripristino.

## Out of Scope

Questo Gate non include:

- Cloud, account multipli, funzioni social, merge di backup e integrazioni esterne obbligatorie.
- CSV, cifratura, LAN e PWA se non decisi esplicitamente con scope e verifiche aggiuntive.

## Requirements

### Requirement 1

Finalizzare lo schema backup secondo le entità reali. Export/import round-trip conserva profilo, revisioni, snapshot, diari, consumi e misurazioni, senza totali duplicati. Versioni supportate esplicite, file locali leggibili e rischio privacy comunicato.

### Requirement 2

Import malformato, sovradimensionato, versione ignota, ID duplicati, riferimenti orfani, numeri invalidi o chiavi pericolose rifiutati prima delle scritture. Anteprima e conferma prima di sostituzione; fallimento transazione conserva integralmente l'archivio precedente.

### Requirement 3

Cancellazione con ambito chiaro, conferma/annullamento e verifica esito. Avvio release su origine stabile e loopback, senza rete obbligatoria a runtime. Gestire multi-tab, quota e migrazioni senza falso successo. Tastiera, focus, contrasto, zoom e viewport piccolo verificati sui percorsi principali.

## Technical Constraints

API/SECURITY aggiornati allo schema reale. Nessuna pubblicazione o esposizione LAN automatica. Decisioni su cifratura/offline dichiarate prima della release; non promettere protezioni assenti. Dipendenze e bundle valutati per rischi concreti.

## Relevant Documentation

Prima dell'implementazione leggere:

- [AGENTS](../../AGENTS.md), [INDEX](../INDEX.md), [PROJECT_STATUS](../PROJECT_STATUS.md).
- [API](../API.md), [SECURITY](../SECURITY.md), [DATA_MODEL](../DATA_MODEL.md), [FRONTEND](../FRONTEND.md), [ARCHITECTURE](../ARCHITECTURE.md), [TESTING](../TESTING.md), [PRODUCT](../PRODUCT.md), [DECISIONS](../DECISIONS.md), [README](../../README.md).

## Acceptance Criteria

Il Gate è completo quando:

- [ ] Backup completo documentato e round-trip verificato con tutte le relazioni e gli snapshot storici.
- [ ] Import ostile/errato rifiutato e rollback conserva i dati; anteprima e annullamento non modificano l'archivio.
- [ ] Cancellazione elimina l'archivio previsto soltanto dopo conferma e non promette di eliminare backup esterni.
- [ ] Errori quota, multi-tab e migrazioni sono verificati, con strategie documentate e nessuna perdita silenziosa.
- [ ] Percorsi principali usabili da tastiera, a 320 px e zoom 200%, con focus, etichette e contrasti verificati.
- [ ] Installazione/build/avvio release da checkout pulito documentati; origine stabile e nessuna rete obbligatoria a runtime.
- [ ] Unitari, integrazione, e2e, lint, type-check, build e review manuale passano; nessuna regressione bloccante.
- [ ] README, API, sicurezza, stato e limiti nutrizionali corrispondono alla release effettiva.

## Validation

- [ ] Unit test — schema, limiti, versioni, riferimenti e contenuti pericolosi.
- [ ] Integration test — import atomico, rollback, cancellazione e migrazioni.
- [ ] End-to-end test — export/import, annullamento, errore, storico e reinstallazione/avvio locale.
- [ ] Lint
- [ ] Type-check
- [ ] Build
- [ ] Verifica manuale — accessibilità, storage, assenza rete obbligatoria e guida release.
- [ ] Validatore documentale, review dipendenze/bundle e prove registrate.

## Gate Result

`NOT EVALUATED`

## Completion Information

Started: non iniziato.

Completed: non completato.

Git commit / reference: da registrare al completamento; versione/tag locale se appropriato.

## Notes

La release locale è un artefatto preparato e verificato. Pubblicazione, upload o esposizione del PC richiedono una richiesta distinta se non già autorizzati.
