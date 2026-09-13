# GATE 05 — Dashboard, andamento e menù mensile

## Status

NOT STARTED

## Objective

Mostrare progressi e riepiloghi verificabili sui dati registrati, con andamento del peso e navigazione del menù mensile.

## Context

Richiede GATE 04 PASS: piano, consumi e misurazioni sono disponibili come fonti canoniche.

## Scope

Questo Gate include:

- Dashboard con baseline, ultima misurazione datata, variazione e grafico.
- Calorie/macronutrienti pianificati, consumati e target opzionali.
- Confronto descrittivo di aderenza con formula esplicita se numerico.
- Vista mensile del menù e accesso al dettaglio di una giornata.

## Out of Scope

Questo Gate non include:

- Metriche sanitarie non supportate, previsione clinica, punteggi morali o calorie attività inventate.
- Backup, import, sincronizzazione, social o modifica delle registrazioni tramite grafico.

## Requirements

### Requirement 1

Peso corrente derivato dall'ultima misurazione disponibile alla data selezionata, con data visibile; baseline distinta. Giorni senza misura non diventano misurazioni interpolate. Tabelle/testo alternativi ai grafici.

### Requirement 2

Distinguere kcal e grammi, pianificato/consumato/obiettivo; diario incompleto e fibre sconosciute mantengono significato. Periodi e date locali coerenti. Riepiloghi calcolati, nessuna nuova copia persistita.

### Requirement 3

Definire in PRODUCT/DATA_MODEL il confronto di aderenza prima di implementarlo: dati richiesti, denominatore e trattamento di giornate incomplete. La vista mensile usa revisioni/selezioni esistenti e apre giorno/settimana senza perdere contesto.

## Technical Constraints

Nessuna metrica clinica o promessa. Colore mai unico canale informativo; grafici accessibili. Eventuale libreria grafici scelta soltanto per necessità e documentata.

## Relevant Documentation

Prima dell'implementazione leggere:

- [AGENTS](../../AGENTS.md), [INDEX](../INDEX.md), [PROJECT_STATUS](../PROJECT_STATUS.md).
- [PRODUCT](../PRODUCT.md), [DATA_MODEL](../DATA_MODEL.md), [FRONTEND](../FRONTEND.md), [TESTING](../TESTING.md), [SECURITY](../SECURITY.md), [DECISIONS](../DECISIONS.md).

## Acceptance Criteria

Il Gate è completo quando:

- [ ] Dashboard mostra baseline e ultima misurazione con date e variazione corretta oppure stato vuoto esplicito.
- [ ] Grafico e tabella alternativa rispettano misurazioni reali e intervallo scelto.
- [ ] Nutrienti distinguono piano, consumo e target, unità e dati mancanti/incompleti.
- [ ] Aderenza è descrittiva e verificabile; eventuale percentuale ha formula e denominatore documentati.
- [ ] Vista mensile navigabile da tastiera e mobile apre il dettaglio della data corretta.
- [ ] Test pertinenti, e2e, lint, type-check, build e review accessibilità passano; documenti aggiornati.

## Validation

- [ ] Unit test — variazioni, intervalli, aggregati, mancanti e formula di confronto.
- [ ] Integration test — riepiloghi dalle entità canoniche, nessuna cache divergente.
- [ ] End-to-end test — dashboard con registrazioni fittizie e navigazione mese/giorno.
- [ ] Lint
- [ ] Type-check
- [ ] Build
- [ ] Verifica manuale — grafici con alternativa, focus, contrasto e viewport piccolo.
- [ ] Validatore documentale e prove registrate.

## Gate Result

`NOT EVALUATED`

## Completion Information

Started: non iniziato.

Completed: non completato.

Git commit / reference: da registrare al completamento.

## Notes

Formula di aderenza ancora da scegliere. Nessun confronto deve trasformare dati incompleti in valutazioni negative dell'utente.
