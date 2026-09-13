# Project Status

## Current Gate

Gate: [GATE 03 — Menù giornaliero e settimanale](gates/GATE_03_MENU.md)
Status: NOT STARTED

## Completed Gates

- [x] GATE 00 — Bootstrap del repository e documentazione
- [x] GATE 01 — Fondazione tecnica, layout, navigazione e persistenza
- [x] GATE 02 — Alimenti, ricette e calcoli nutrizionali
- [ ] GATE 03 — Menù giornaliero e settimanale
- [ ] GATE 04 — Diario, consumi reali e peso
- [ ] GATE 05 — Dashboard, andamento e menù mensile
- [ ] GATE 06 — Backup, accessibilità, hardening e release locale

## Current System State

### Frontend

React/TypeScript/Vite operativi. Sei aree italiane, profilo con default confermati modificabili, esclusioni e occasioni ordinabili (1–10). Alimenti/Ricette con ricerca, creazione/modifica, archiviazione/ripristino, nutrienti, fonti e calcolatore quantità. Ricette con ingredienti storici, quantità modificabili e resa dichiarata. Decimali italiani, errori accessibili e input conservato su errore. Menù, Oggi, Diario e Dashboard con stati vuoti; nessun piano o storico fittizio.

### Data persistence

IndexedDB fatreduction v2: profiles, foods, recipes, foodRevisions, recipeRevisions. Migrazione additiva da v1 verificata senza perdita del profilo. Wrapper idb e Zod; default inizializzati una volta, revisioni atomiche con controllo conflitti, fonti/snapshot storici conservati. Nessun totale ricetta duplicato. Origine fissa http://127.0.0.1:5173 per dev e preview; errori quota/versione/accesso recuperabili.

### Testing

GATE 01 e 02 PASS. Ultima esecuzione: 12 test Vitest in 3 file, 4 scenari Playwright Chromium, lint, type-check, build e validatore documentale PASS. Migrazione, rollback, snapshot, esclusioni, quantità, resa, fibre null, input invalidi e quota verificati. Axe senza violazioni nelle viste esaminate; review visiva dell'agente su screenshot desktop/320 px. Installazione riproducibile npm ci verificata; comandi e limiti in TESTING, prove nei Gate.

### Infrastructure

Node 24.15.0, npm 12.0.2, Git 2.55.0. Versioni esatte e package-lock.json; zero vulnerabilità segnalate dall'installazione npm del 2026-09-13. Avvio npm.cmd run dev, build npm.cmd run build, preview npm.cmd run preview. Git locale su main, nessun remote. Identità fornita dall'utente e configurata solo in questo repository. Commit creati dai checkpoint originali: `8554bd2` (bootstrap e GATE 01), `f513bb0` (GATE 02, figlio del primo). Gli snapshot tree refs/checkpoints/gate-01 e refs/checkpoints/gate-02 restano conservati. Aggiornamento Git/documentale senza modifiche applicative.

## Known Issues

- Backup e import solo in GATE 06: versione intermedia, non release completa. Pulire i dati del sito elimina l'archivio.
- Dati separati per browser, origine e dispositivo; LAN, PWA e cifratura backup non implementati.
- Catalogo inizialmente vuoto, nessun database alimentare esterno incluso. Per prodotti composti l'utente deve dichiarare gli ingredienti per le esclusioni; nessuna verifica allergeni automatica.
- Nessun target calorico o piano personale dedotto dal profilo. Audit accessibilità completo e altri browser restano alla release.

## Current Blockers

Nessun blocco attuale. Il precedente blocco dei commit è risolto con l'identità fornita dall'utente: entrambi i Gate hanno un commit su main, con alberi identici ai rispettivi checkpoint.

## Next Objective

Richiesta del 2026-09-13 di proseguire con due Gate completata: GATE 01 e GATE 02. Su nuova richiesta esplicita iniziare esclusivamente GATE 03: piani giorno/settimana, revisioni immutabili, selezione per data, snapshot slot, cinque occasioni iniziali e filtro esclusioni sulle proposte. Riutilizzare calcoli, snapshot e repository esistenti; introdurre solo store necessari. Diario/consumi, grafici, menù mensile e backup restano ai Gate successivi.

## Relevant Documents

[AGENTS](../AGENTS.md), [INDEX](INDEX.md), [GATE 01](gates/GATE_01_FOUNDATION.md), [GATE 02](gates/GATE_02_NUTRITION.md), [GATE 03](gates/GATE_03_MENU.md), [ARCHITECTURE](ARCHITECTURE.md), [DATA_MODEL](DATA_MODEL.md), [TESTING](TESTING.md), [SECURITY](SECURITY.md), [DECISIONS](DECISIONS.md).
