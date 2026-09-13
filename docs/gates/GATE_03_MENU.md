# GATE 03 — Menù giornaliero e settimanale con cinque pasti

## Status

NOT STARTED

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

- [ ] Piano giornaliero/settimanale creato, consultato e salvato con cinque slot per data nel profilo iniziale; modifica delle occasioni conserva lo storico e vale per nuove revisioni.
- [ ] Quantità, unità, fonte e calorie/macro sono visibili; note e sostituzioni funzionano senza doppi conteggi.
- [ ] Tartufo e ingredienti esclusi non compaiono nelle proposte o sostituzioni.
- [ ] Modifica produce nuova revisione e la precedente resta ricostruibile dopo reload.
- [ ] Sovrapposizioni e slot vuoti sono gestiti esplicitamente; nessun consumo reale inventato.
- [ ] Test pertinenti, lint, type-check, build e percorso browser passano; documentazione aggiornata.

## Validation

- [ ] Unit test — cinque slot, date, esclusioni e conteggio sostituzioni.
- [ ] Integration test — revisioni, selezione giornaliera e migrazioni.
- [ ] End-to-end test — creazione/modifica/reload; se rinviato a 04 registrare motivazione e prova manuale equivalente.
- [ ] Lint
- [ ] Type-check
- [ ] Build
- [ ] Verifica manuale — giorno/settimana, tastiera e viewport piccolo.
- [ ] Validatore documentale e prove registrate.

## Gate Result

`NOT EVALUATED`

## Completion Information

Started: non iniziato.

Completed: non completato.

Git commit / reference: da registrare al completamento.

## Notes

Il menù è uno strumento di organizzazione con stime; non un piano clinico. La vista mensile appartiene a GATE 05.
