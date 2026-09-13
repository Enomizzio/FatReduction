# GATE 03 — Menù giornaliero e settimanale con cinque pasti

## Status

COMPLETED

## Objective

Creare, consultare e modificare menù giornalieri/settimanali con cinque occasioni alimentari, quantità e stime nutrizionali, conservando le revisioni.

## Context

Richiede GATE 02 PASS e catalogo/calcoli operativi. Nessun piano alimentare definitivo è stato generato dal bootstrap.

## Scope

Questo Gate include:

- Piani, revisioni, scelta del piano per data e pasti pianificati.
- Viste giorno/settimana, quantità, nutrienti, note e sostituzioni.
- Cinque slot e controllo esclusioni sulle proposte.
- Sezione pianificata di Oggi e test di un percorso reale nel browser.

## Out of Scope

Questo Gate non include:

- Consumi effettivi, peso e diario completo, dashboard, vista mensile o backup.
- Generazione clinica automatica, obiettivi energetici dedotti o promesse di dimagrimento.

## Requirements

### Requirement 1

Con il profilo iniziale ogni giornata pianificata ha colazione, spuntino mattutino, pranzo, spuntino pomeridiano e cena, nell'ordine. Una diversa configurazione esplicita vale per nuovi piani/revisioni tramite snapshot degli slot; quelli storici non cambiano. Gli slot incompleti sono espliciti. Voci con quantità/unità, kcal/macro di fonte e note; sostituzioni non conteggiate fino alla scelta.

### Requirement 2

Modificare un piano crea una revisione immutabile, senza alterare quelle precedenti. Piani sovrapposti richiedono una selezione giornaliera esplicita. Calcoli usano snapshot validi, riepiloghi derivati.

### Requirement 3

Proposte e sostituzioni escludono tartufo e altre esclusioni, anche tramite ricette. Eventuali esempi sono dichiarati fittizi; un piano personale richiede dati/fonti e verifica del perimetro nutrizionale, senza presumere informazioni mancanti.

## Technical Constraints

Date locali, ADR-002, transazioni e integrità referenziale. Nessuna prescrizione, fonti inventate o cloud obbligatorio. Introdurre Playwright qui se fattibile, comunque entro GATE 04.

## Relevant Documentation

Prima dell'implementazione leggere:

- [AGENTS](../../AGENTS.md), [INDEX](../INDEX.md), [PROJECT_STATUS](../PROJECT_STATUS.md).
- [PRODUCT](../PRODUCT.md), [DATA_MODEL](../DATA_MODEL.md), [FRONTEND](../FRONTEND.md), [API](../API.md), [TESTING](../TESTING.md), [SECURITY](../SECURITY.md), [DECISIONS](../DECISIONS.md).

## Acceptance Criteria

Il Gate è completo quando:

- [x] Piano giornaliero/settimanale creato, consultato e salvato con cinque slot per data nel profilo iniziale; modifica delle occasioni conserva lo storico e vale per nuove revisioni.
- [x] Quantità, unità, fonte e calorie/macro sono visibili; note e sostituzioni funzionano senza doppi conteggi.
- [x] Tartufo e ingredienti esclusi non compaiono nelle proposte o sostituzioni.
- [x] Modifica produce nuova revisione e la precedente resta ricostruibile dopo reload.
- [x] Sovrapposizioni e slot vuoti sono gestiti esplicitamente; nessun consumo reale inventato.
- [x] Test pertinenti, lint, type-check, build e percorso browser passano; documentazione aggiornata.

## Validation

- [x] Unit test — cinque slot, date, esclusioni e conteggio sostituzioni.
- [x] Integration test — revisioni, selezione giornaliera e migrazioni.
- [x] End-to-end test — creazione/modifica/reload; se rinviato a 04 registrare motivazione e prova manuale equivalente.
- [x] Lint
- [x] Type-check
- [x] Build
- [x] Verifica manuale — giorno/settimana, tastiera e viewport piccolo.
- [x] Validatore documentale e prove registrate.

## Gate Result

`PASS`

## Completion Information

Started: 2026-09-13, richiesta esplicita di proseguire con GATE 03 e 04; successiva richiesta di pubblicare su GitHub.

Completed: 2026-09-13.

Git commit / reference: checkpoint con messaggio `feat: complete gate 03 menu planning and immutable revisions`; pubblicazione GitHub autorizzata.

## Notes

Il menù è uno strumento di organizzazione con stime; non un piano clinico. La vista mensile appartiene a GATE 05.

### Prove di completamento — 2026-09-13

17 test Vitest / 4 file PASS, 6 scenari Chromium PASS (suite e riesecuzione mirata menù), lint, type-check e build PASS. Test coprono date gregoriane e cambio anno, cinque slot/35 settimanali, alternative senza doppio conteggio, esclusioni anche da ricetta, modifica/reload, fonti storiche e occasioni, sovrapposizioni e selezione esplicita, migrazione v2/v3 senza perdita, conflitti e rollback. Quota simulata nel browser: bozza conservata e nuovo tentativo riuscito.

Review visiva dell'agente su screenshot desktop e 320 px; giorno/settimana e tastiera verificati nel browser automatizzato. Axe senza violazioni nelle viste esaminate. Non equivale a screen reader umano o audit release completo. Nessuna verifica obbligatoria rinviata o N/A. Validatore documentale eseguito alla chiusura; dettagli in TESTING. Storico e note persistiti solo con fixture fittizie.
