# Project Status

## Current Gate

Gate: [GATE 01 — Fondazione tecnica](gates/GATE_01_FOUNDATION.md)
Status: COMPLETED

## Completed Gates

- [x] GATE 00 — Bootstrap del repository e documentazione
- [x] GATE 01 — Fondazione tecnica, layout, navigazione e persistenza
- [ ] GATE 02 — Alimenti, ricette e calcoli nutrizionali
- [ ] GATE 03 — Menù giornaliero e settimanale
- [ ] GATE 04 — Diario, consumi reali e peso
- [ ] GATE 05 — Dashboard, andamento e menù mensile
- [ ] GATE 06 — Backup, accessibilità, hardening e release locale

## Current System State

### Frontend

React/TypeScript/Vite implementati. Sei aree italiane, impostazioni profilo con default confermati, esclusioni e occasioni ordinabili (1–10). Form con decimali italiani, validazione e conservazione input su errore. Aree future con stati vuoti; nessun piano o diario fittizio.

### Data persistence

IndexedDB fatreduction v1, store profiles, wrapper idb e validazione Zod. Inizializzazione idempotente in transazione, scritture con rilevamento conflitti, errori quota/versione/accesso espliciti. Origine fissa http://127.0.0.1:5173 per dev e preview.

### Testing

Runner Vitest/Testing Library, fake-indexeddb, Playwright Chromium e axe disponibili. Gate 01 PASS: 3 test Vitest, 2 E2E Chromium, lint, type-check, build, npm ci e review visiva; risultati nel Gate. Installazione riproducibile npm ci, script reali in TESTING.

### Infrastructure

Node 24.15.0, npm 12.0.2, Git 2.55.0. Dipendenze esatte e lockfile; npm audit installazione senza vulnerabilità. Git locale su main, nessun remote. Identità Git assente; bootstrap già preparato nell'index prima di questa sessione.

## Known Issues

- Nome/email Git non configurati: nessuna identità inventata.
- Backup disponibile solo in GATE 06; versione intermedia, nessuna release completa.
- Dati separati per browser, origine e dispositivo; LAN, PWA e cifratura backup non implementati.
- Fonti alimentari e conversioni da definire in GATE 02; nessun target calorico personale.

## Current Blockers

Nessun blocco applicativo. Identità Git assente impedisce solo il commit; documentare il checkpoint senza fingere un commit.

## Next Objective

Richiesta del 2026-09-13 autorizza GATE 01 e GATE 02 in sequenza. Gate 01 PASS; avviare Gate 02 già autorizzato: catalogo, ricette e calcoli. Gate 03 e successivi restano fuori perimetro.

## Relevant Documents

[AGENTS](../AGENTS.md), [INDEX](INDEX.md), [GATE 01](gates/GATE_01_FOUNDATION.md), [GATE 02](gates/GATE_02_NUTRITION.md), [ARCHITECTURE](ARCHITECTURE.md), [DATA_MODEL](DATA_MODEL.md), [TESTING](TESTING.md), [SECURITY](SECURITY.md), [DECISIONS](DECISIONS.md).
