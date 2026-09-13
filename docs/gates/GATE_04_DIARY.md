# GATE 04 — Diario giornaliero, consumi reali e peso

## Status

COMPLETED

## Objective

Registrare e ricostruire una giornata con piano previsto, alimenti realmente consumati e peso misurato, mantenendo distinti dati reali e pianificati.

## Context

Richiede GATE 03 PASS e revisioni del menù operative. È il primo Gate che introduce registrazioni personali giornaliere.

## Scope

Questo Gate include:

- Diario unico per data, consumi, stato aperto/completo e peso opzionale.
- Attività descrittiva, fame/energia/umore opzionali e note.
- Copia esplicita dal piano a consumi indipendenti e consultazione storico.
- Snapshot, riferimenti alla revisione prevista e test e2e con storage reale.

## Out of Scope

Questo Gate non include:

- Dashboard/grafici aggregati, menù mensile, backup/import o stime di calorie bruciate.
- Diagnosi, giudizi sull'alimentazione e registrazione automatica del consumo del piano.

## Requirements

### Requirement 1

Per una data locale registrare quantità consumate, peso se misurato e campi opzionali. Più voci per slot; una misurazione di peso per profilo/data. Diario assente/aperto/completo distinti, giorni vuoti senza consumi o peso fittizi.

### Requirement 2

Copiare dal piano è un'azione esplicita che genera voci indipendenti. Modificare il consumato non modifica il piano. Conservare snapshot nutrizionali e revisione prevista; sostituire il riferimento storico richiede scelta consapevole.

### Requirement 3

Lo storico mostra per data menù previsto, peso se disponibile e consumi reali, anche dopo modifica/archiviazione del catalogo o revisione del menù. Accettare un consumo reale di alimento escluso senza messaggi colpevolizzanti.

## Technical Constraints

DATA_MODEL, ADR-002, nessuna duplicazione di riepiloghi o peso nel diario. Date future non valide per consumi/misurazioni. Dati sensibili e note come testo; Playwright obbligatorio entro questo Gate.

## Relevant Documentation

Prima dell'implementazione leggere:

- [AGENTS](../../AGENTS.md), [INDEX](../INDEX.md), [PROJECT_STATUS](../PROJECT_STATUS.md).
- [DATA_MODEL](../DATA_MODEL.md), [PRODUCT](../PRODUCT.md), [FRONTEND](../FRONTEND.md), [API](../API.md), [TESTING](../TESTING.md), [SECURITY](../SECURITY.md), [DECISIONS](../DECISIONS.md).

## Acceptance Criteria

Il Gate è completo quando:

- [x] Una giornata registra consumi, quantità, peso opzionale, attività e note con validazione e persistenza.
- [x] Pianificato e consumato restano distinti; copia dal piano esplicita ed editabile.
- [x] Diario assente/aperto/completo e nutrienti mancanti sono riconoscibili senza zeri impliciti.
- [x] Dopo reload e modifiche al catalogo/menù si ricostruisce la stessa giornata storica.
- [x] Date future, quantità invalide, duplicati di peso e fallimenti storage sono gestiti senza perdita silenziosa.
- [x] Unitari, integrazione, e2e reali, lint, type-check, build e review manuale passano; documenti aggiornati.

## Validation

- [x] Unit test — date, unicità peso, totali effettivi e dati incompleti.
- [x] Integration test — diario/revisioni/snapshot e transazioni.
- [x] End-to-end test — pianificato diverso da consumato, peso, reload e storico dopo modifiche.
- [x] Lint
- [x] Type-check
- [x] Build
- [x] Verifica manuale — Oggi, selezione date, campi opzionali, errori e tastiera.
- [x] Validatore documentale e prove registrate.

## Gate Result

`PASS`

## Completion Information

Started: 2026-09-13, dopo GATE 03 PASS e pubblicazione del checkpoint c6959e0.

Completed: 2026-09-13.

Git commit / reference: tag `gate-04-completed`, commit `feat: complete gate 04 diary, actual intake and weight`, su origin/main.

## Notes

Fixture fittizie e browser test isolati. Backup completo arriva in GATE 06: rendere questo limite evidente prima di affidare dati reali alle versioni intermedie.

### Prove di completamento — 2026-09-13

24 test Vitest in 5 file PASS, 8 scenari Chromium PASS, lint/type-check/build PASS. Diario unico per data, peso unico aggiornabile, quantità indipendenti, campi opzionali, stato aperto/completo, null delle fibre, date future e snapshot verificati. Migrazione additiva v3/v4 conserva piani e selezioni, non crea diari/pesi. Copia esplicita idempotente e cambio previsto con occasioni occupate conservate verificati nel dominio e nella persistenza.

E2E reali: pianificato 100 g e consumato 50 g, peso fittizio e campi opzionali persistono dopo reload, modifica/archiviazione catalogo e revisione menù. Cambio storico e rimozioni hanno conferma con annullamento verificato. Alimento escluso ammesso nei consumi. Errore quota sulla misurazione causa rollback di diario/consumi, mantiene input e consente nuovo tentativo. Conflitti tra scritture obsolete e snapshot falsificati rifiutati dai servizi.

Review visiva dell'agente su diary-desktop.png, diary-consumed-320.png e diary-weight-320.png; nessun overflow a 320 px, axe senza violazioni nelle viste esaminate. Tastiera sul controllo del piano storico e selettore data nella suite. Note simili a script inerti. Bozze protette in navigazione; annullamento mantiene gli input. Validatore documentale e diff Git verificati alla chiusura. Nessuna verifica obbligatoria N/A. Non dichiarati audit release completo, screen reader umano o altri browser; restano a GATE 06. Nessun dato personale reale nei test, screenshot/trace non versionati.
