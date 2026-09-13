# GATE 04 — Diario giornaliero, consumi reali e peso

## Status

NOT STARTED

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

- [ ] Una giornata registra consumi, quantità, peso opzionale, attività e note con validazione e persistenza.
- [ ] Pianificato e consumato restano distinti; copia dal piano esplicita ed editabile.
- [ ] Diario assente/aperto/completo e nutrienti mancanti sono riconoscibili senza zeri impliciti.
- [ ] Dopo reload e modifiche al catalogo/menù si ricostruisce la stessa giornata storica.
- [ ] Date future, quantità invalide, duplicati di peso e fallimenti storage sono gestiti senza perdita silenziosa.
- [ ] Unitari, integrazione, e2e reali, lint, type-check, build e review manuale passano; documenti aggiornati.

## Validation

- [ ] Unit test — date, unicità peso, totali effettivi e dati incompleti.
- [ ] Integration test — diario/revisioni/snapshot e transazioni.
- [ ] End-to-end test — pianificato diverso da consumato, peso, reload e storico dopo modifiche.
- [ ] Lint
- [ ] Type-check
- [ ] Build
- [ ] Verifica manuale — Oggi, selezione date, campi opzionali, errori e tastiera.
- [ ] Validatore documentale e prove registrate.

## Gate Result

`NOT EVALUATED`

## Completion Information

Started: non iniziato.

Completed: non completato.

Git commit / reference: da registrare al completamento.

## Notes

Fixture fittizie e browser test isolati. Backup completo arriva in GATE 06: rendere questo limite evidente prima di affidare dati reali alle versioni intermedie.
