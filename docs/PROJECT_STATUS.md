# Project Status

## Current Gate

Gate: [GATE 05 — Dashboard, andamento e menù mensile](gates/GATE_05_DASHBOARD.md)
Status: NOT STARTED

## Completed Gates

- [x] GATE 00 — Bootstrap del repository e documentazione
- [x] GATE 01 — Fondazione tecnica, layout, navigazione e persistenza
- [x] GATE 02 — Alimenti, ricette e calcoli nutrizionali
- [x] GATE 03 — Menù giornaliero e settimanale
- [x] GATE 04 — Diario, consumi reali e peso
- [ ] GATE 05 — Dashboard, andamento e menù mensile
- [ ] GATE 06 — Backup, accessibilità, hardening e release locale

## Current System State

### Frontend

React/TypeScript/Vite, sei aree italiane, profilo e occasioni modificabili. Catalogo alimenti/ricette con fonti, quantità, resa, revisioni e archiviazione. Menù giorno/settimana con cinque occasioni iniziali, note, quantità e alternative non conteggiate fino alla scelta. Revisioni storiche consultabili e selezione esplicita per data.

Oggi e Diario mostrano previsto e consumato separati, giornate assenti/aperte/complete, copie esplicite e modificabili del piano, peso opzionale, attività, fame/energia/umore e note. Storico con elenco date e peso effettivamente registrato; previsto congelato e fonti conservate. Rimozioni e cambio previsto confermati. Errori storage e navigazione proteggono le bozze. Data condivisa tra aree; reload torna a oggi. Nessun piano personale o dato reale precompilato; Dashboard ancora vuota.

### Data persistence

IndexedDB fatreduction v4: profiles, foods, recipes, foodRevisions, recipeRevisions, menuPlans, menuPlanRevisions, plannedMeals, dayPlanSelections, dailyDiaries, consumedEntries, bodyMeasurements. Migrazioni additive da v1–v3 senza dati fittizi. Revisioni/snapshot immutabili, indici unici e conflitti espliciti. Diario/consumi/peso salvati in una transazione, peso separato e unico per data. Totali derivati, nessuno zero implicito per giorno aperto senza voci. Origine http://127.0.0.1:5173.

### Testing

GATE 01–04 PASS. 24 test Vitest in 5 file, suite completa di 8 scenari Playwright Chromium PASS; percorso diario rieseguito con controllo tastiera esplicito. Lint, type-check, build e validatore documentale PASS. Prove su date future, peso unico, copia idempotente/indipendente, cambio piano con slot conservati, migrazione v3/v4, conflitti, rollback quota e conferme. Storico invariato dopo modifiche di menù/catalogo. Axe senza violazioni nelle viste esaminate, review visiva desktop/320 px e note inerti. Limiti e prove in TESTING e nei Gate.

### Infrastructure

Node 24.15.0, npm 12.0.2 e Git 2.55.0, dipendenze esatte nel lockfile; nessuna nuova dipendenza nei Gate 03/04. In questa sessione gli strumenti installati richiedono esecuzione fuori sandbox. Identità Git locale già fornita dall'utente.

Repository GitHub origin: https://github.com/Enomizzio/FatReduction.git, branch main. Checkpoint GATE 03: c6959e0, pubblicato il 2026-09-13. Checkpoint GATE 04: tag `gate-04-completed`, commit con messaggio `feat: complete gate 04 diary, actual intake and weight`. Codice, documentazione e test inclusi; esclusi screenshot/trace, backup e dati del browser. Il tag identifica stabilmente il checkpoint senza incorporare nel documento il proprio hash di commit.

## Known Issues

- Backup/import solo in GATE 06: versione intermedia, pulire i dati del sito elimina l'archivio. Limite visibile nell'app.
- Dati separati per browser, origine e dispositivo; LAN, PWA e cifratura backup non implementati.
- Catalogo inizialmente vuoto; ingredienti composti dichiarati dall'utente, nessuna verifica allergeni automatica. Valori manuali inseriti tramite catalogo con fonte dichiarata.
- Nessun target energetico dedotto. Dashboard, grafici e menù mensile non implementati; audit completo accessibilità e altri browser restano alla release.
- Piani da un giorno o sette giorni consecutivi; nuovo piano per cambiare titolo/intervallo. Occasioni eliminate con voci/note richiedono sistemare la nuova bozza; revisioni precedenti conservate.
- Quantità modificate mediante Applica quantità, poi salvataggio della revisione/giornata. Nessun salvataggio automatico delle bozze.

## Current Blockers

Nessun blocco attuale. Strumenti locali e GitHub accessibili tramite esecuzione autorizzata fuori sandbox.

## Next Objective

Richiesta di completare altri due Gate conclusa: GATE 03 e GATE 04, con documentazione aggiornata alla chiusura di ciascuno e checkpoint su GitHub. Fermarsi qui. Su nuova richiesta esplicita iniziare GATE 05: dashboard, andamento del peso e nutrienti, confronto descrittivo con piano e vista mensile, usando entità canoniche senza riepiloghi persistiti duplicati. GATE 06 resta successivo e non iniziato.

## Relevant Documents

[AGENTS](../AGENTS.md), [INDEX](INDEX.md), [GATE 03](gates/GATE_03_MENU.md), [GATE 04](gates/GATE_04_DIARY.md), [GATE 05](gates/GATE_05_DASHBOARD.md), [ARCHITECTURE](ARCHITECTURE.md), [DATA_MODEL](DATA_MODEL.md), [FRONTEND](FRONTEND.md), [API](API.md), [TESTING](TESTING.md), [SECURITY](SECURITY.md), [DECISIONS](DECISIONS.md).
