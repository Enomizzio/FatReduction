# Project Status

## Current Gate

Gate: [GATE 03 — Menù giornaliero e settimanale](gates/GATE_03_MENU.md)
Status: COMPLETED

## Completed Gates

- [x] GATE 00 — Bootstrap del repository e documentazione
- [x] GATE 01 — Fondazione tecnica, layout, navigazione e persistenza
- [x] GATE 02 — Alimenti, ricette e calcoli nutrizionali
- [x] GATE 03 — Menù giornaliero e settimanale
- [ ] GATE 04 — Diario, consumi reali e peso
- [ ] GATE 05 — Dashboard, andamento e menù mensile
- [ ] GATE 06 — Backup, accessibilità, hardening e release locale

## Current System State

### Frontend

React/TypeScript/Vite, sei aree italiane, profilo e occasioni modificabili. Catalogo alimenti/ricette con fonti, quantità, resa, revisioni e archiviazione. Menù giorno/settimana con cinque occasioni iniziali, note, quantità e alternative non conteggiate fino alla scelta. Revisioni storiche consultabili e selezione esplicita per data; Oggi mostra il pianificato. Data condivisa durante la navigazione, reload torna alla data locale attuale. Nessun piano personale, consumo o peso fittizio. Diario e Dashboard ancora vuoti.

### Data persistence

IndexedDB fatreduction v3: profiles, foods, recipes, foodRevisions, recipeRevisions, menuPlans, menuPlanRevisions, plannedMeals, dayPlanSelections. Migrazioni additive da v1/v2; snapshot e revisioni immutabili, transazioni e indici unici. Calcoli derivati, fonti conservate, conflitti espliciti. Origine http://127.0.0.1:5173. Quota e accesso falliti conservano le bozze.

### Testing

GATE 01–03 PASS. 17 test Vitest in 4 file, 6 scenari Playwright Chromium, lint, type-check, build e validatore documentale PASS. Nuove prove su date, slot, alternative, esclusioni di ricette, selezione giornaliera, migrazione v2/v3 e rollback. Axe senza violazioni nelle viste esaminate, tastiera automatizzata e review visiva dell'agente desktop/320 px. Limiti e prove in TESTING e nei Gate.

### Infrastructure

Node 24.15.0, npm 12.0.2 e Git 2.55.0 già installati, dipendenze esatte nel lockfile. In questa sessione gli eseguibili utente richiedono esecuzione fuori sandbox. Nessuna nuova dipendenza. Identità Git locale già fornita dall'utente. Cronologia iniziale: 8554bd2, f513bb0, 16704b6; checkpoint GATE 03 identificato dal commit `feat: complete gate 03 menu planning and immutable revisions`. Origin https://github.com/Enomizzio/FatReduction.git configurato su richiesta; repository remoto inizialmente vuoto. Pubblicazione del checkpoint prevista alla chiusura della review, esito da registrare nel passaggio al GATE 04.

## Known Issues

- Backup/import solo in GATE 06: versione intermedia, pulire i dati del sito elimina l'archivio.
- Dati separati per browser, origine e dispositivo; LAN, PWA e cifratura backup non implementati.
- Catalogo inizialmente vuoto; ingredienti composti dichiarati dall'utente, nessuna verifica allergeni automatica.
- Nessun target energetico dedotto. Audit completo accessibilità e altri browser restano alla release.
- Piani creati per un giorno o sette giorni consecutivi; per cambiare titolo/intervallo si crea un nuovo piano. Le occasioni rimosse dal profilo con voci/note richiedono sistemare la nuova bozza prima del salvataggio.

## Current Blockers

Nessun blocco attuale. Strumenti locali accessibili tramite esecuzione autorizzata fuori sandbox.

## Next Objective

Richiesta attuale: completare GATE 03 e GATE 04, aggiornare la documentazione dopo ciascuno e pubblicare su GitHub. GATE 03 completato. Proseguire ora con GATE 04 già autorizzato: diario unico per data, consumi indipendenti, peso, campi opzionali e storico. GATE 05 e 06 restano NOT STARTED e richiedono nuova richiesta.

## Relevant Documents

[AGENTS](../AGENTS.md), [INDEX](INDEX.md), [GATE 03](gates/GATE_03_MENU.md), [GATE 04](gates/GATE_04_DIARY.md), [ARCHITECTURE](ARCHITECTURE.md), [DATA_MODEL](DATA_MODEL.md), [FRONTEND](FRONTEND.md), [API](API.md), [TESTING](TESTING.md), [SECURITY](SECURITY.md), [DECISIONS](DECISIONS.md).
