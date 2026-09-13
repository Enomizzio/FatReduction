# GATE 00 — Bootstrap del repository e documentazione

## Status

COMPLETED

## Objective

Preparare un repository locale che consenta a una nuova chat di conoscere requisiti, scelte, stato e prossimo Gate senza leggere conversazioni precedenti.

## Context

Ispezione iniziale: solo `FATAREDUCTION_codex_bootstrap.md`, nessun Git locale o ereditato, nessun codice, configurazione, docs o AGENTS preesistente. Git e Node sono già installati ma inizialmente non accessibili nel sandbox; verificati tramite accesso autorizzato.

## Scope

Questo Gate include:

- Inventario e preservazione del prompt originale.
- AGENTS, README, specifiche di prodotto/architettura/dati/UI/API/test/sicurezza, decisioni e stato.
- Template e specifiche Gate 00–06 con criteri verificabili.
- Directory preparatorie src/tests, controllo documentale, Git e .gitignore.
- Review formale e passaggio di consegne verso Gate 01 NOT STARTED.

## Out of Scope

Questo Gate non include:

- Dipendenze applicative, scaffold React, UI o database implementati.
- Piano alimentare definitivo, fabbisogno calorico e funzionalità dei Gate futuri.
- Pubblicazione, remote Git, account, cloud o installazione di tool di sistema.

## Requirements

### Requirement 1

Documentare i requisiti confermati, il profilo modificabile, cinque pasti, esclusione del tartufo, separazione pianificato/consumato e confini delle stime nutrizionali.

### Requirement 2

Distinguere stato attuale e pianificato, definire entità/relazioni/unità/invarianti e conservazione dello storico; chiarire assenza di backend e comandi applicativi.

### Requirement 3

Rendere ripetibile la review, inizializzare Git senza distruggere contenuti, proteggere segreti e backup, identificare la prossima attività senza iniziarla.

## Technical Constraints

Bootstrap documentale, nessuna dipendenza necessaria. Stack iniziale reversibile e motivato tramite ADR. Non inventare identità Git, fonti alimentari o dati clinici mancanti.

## Relevant Documentation

Prima dell'implementazione leggere:

- [Prompt originale](../../FATAREDUCTION_codex_bootstrap.md).
- [AGENTS](../../AGENTS.md), [INDEX](../INDEX.md), [PROJECT_STATUS](../PROJECT_STATUS.md).
- Tutti i documenti richiesti per la review finale, individuati nell'indice.

## Acceptance Criteria

Il Gate è completo quando:

- [x] Inventario eseguito, prompt preservato e assenza di stack preesistente documentata.
- [x] Tutti i documenti richiesti sono presenti, non vuoti e collegati nell'indice.
- [x] AGENTS è una mappa concisa con protocollo sequenziale e obbligo di aggiornamento.
- [x] Requisiti, profilo, architettura attuale/pianificata, modello iniziale, test e sicurezza sono coerenti.
- [x] Template e Gate 00–06 hanno scope, criteri e validazione; nessun Gate futuro iniziato.
- [x] Git inizializzato, .gitignore verificato; eventuale assenza di commit motivata.
- [x] Validatore documentale e review semantica superati; controlli applicativi N/A motivati.
- [x] PROJECT_STATUS indica Gate 01 NOT STARTED dopo questa review e nessun blocco del bootstrap.

## Validation

- [x] Unit test — N/A: nessun codice applicativo o runner.
- [x] Integration test — N/A: nessun servizio o database applicativo.
- [x] End-to-end test — N/A: nessuna app avviabile.
- [x] Lint — N/A: lint applicativo non configurato; link/formato documentale verificati dal controllo dedicato.
- [x] Type-check — N/A: nessun TypeScript o manifest.
- [x] Build — N/A: nessuno scaffold/build applicativo.
- [x] Verifica manuale — review semantica, preservazione, inventario e Git.
- [x] `powershell -NoProfile -ExecutionPolicy Bypass -File scripts/Validate-Documentation.ps1` — verifica strutturale.

## Gate Result

`PASS`

## Completion Information

Started: 2026-09-13.

Completed: 2026-09-13.

Git commit / reference: ramo `main`, file preparati nell'index locale; nessun commit, identità Git non configurata.

## Notes

Review del 2026-09-13: controllo documentale PASS su 26 file, parsing PowerShell senza errori, 13 controlli .gitignore superati. AGENTS: 35 righe. Tutti i documenti richiesti e Gate 00–06 presenti; requisiti, distinzione attuale/pianificato, confini locali, storico e fonti verificati semanticamente. PROJECT_STATUS trasferisce il Gate attivo a 01 NOT STARTED, senza implementarlo.

Prompt originale preservato: 17.320 byte, SHA-256 `74016D2433BB1E29EC67683F395760254123B7607FF1BFCD9AE81219681CB0BF`. Nessuna modifica applicativa, dipendenza installata o piano alimentare definitivo.

Versioni rilevate: Git 2.55.0.windows.3, Node.js 24.15.0, npm 12.0.2. Nome/email Git mancanti impediscono il primo commit con identità autentica; file preparati nell'index, nessuna identità inventata. Il comando del validatore usa una policy limitata al processo perché quella del PC blocca gli script per impostazione corrente.
