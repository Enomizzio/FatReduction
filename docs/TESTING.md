# Test e validazione

## Stato e comandi effettivi

Stack applicativo e runner presenti da GATE 01. Node 24.15.0, npm 12.0.2. Installazione pulita: `npm.cmd ci`. Per Chromium: `npx.cmd playwright install chromium` (download necessario solo nel setup degli strumenti).

| Comando | Effetto |
| --- | --- |
| `npm.cmd run dev` | Vite su 127.0.0.1:5173, strictPort |
| `npm.cmd test` | Vitest run, unitari e integrazione |
| `npm.cmd run lint` | ESLint |
| `npm.cmd run typecheck` | tsc --noEmit |
| `npm.cmd run build` | tsc --noEmit e build Vite |
| `npm.cmd run preview` | Build su stessa origine di dev; arrestare dev prima |
| `npm.cmd run test:e2e` | Playwright, server gestito e contesti browser isolati |

E2E introdotti già in GATE 01 per verificare IndexedDB reale. Nessun riuso di server preesistente, nessun accesso al profilo browser personale. Screenshot e trace ignorati. Review visiva dell'agente sugli screenshot a 320 px e desktop; tastiera, axe e scenari errore eseguiti via browser automatizzato. Non equivale a certificazione WCAG o a prova con screen reader umano; audit completo GATE 06.

Controllo documentale:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/Validate-Documentation.ps1
```

Bypass limitato a questo processo; verifica UTF-8, link, stati e checklist, non runtime o fonti remote. Risultati effettivi registrati nei Gate.

## Evidenze GATE 01–02 — 2026-09-13

GATE 01: npm ci, typecheck, lint, build, 3 test unitari/integrazione e 2 E2E PASS. GATE 02: 12 test Vitest (3 file), 4 E2E Chromium, typecheck, lint e build PASS, più validatore documentale. Nuove prove: migrazione v1/v2 senza perdita, versioni future rifiutate, revisioni e fonti immutate, rollback atomico, porzioni e resa, fibre null, esclusioni di ricetta, archiviazione/ripristino, input invalidi, quota con nuovo tentativo, istruzioni HTML inerti. Axe senza violazioni nelle viste esaminate; review visiva dell'agente su screenshot desktop e 320 px.

Nessun dato reale inserito nei test: default di configurazione autorizzati e fixture aritmetiche inventate. Nessun test obbligatorio N/A nei due Gate. Audit release completo, screen reader umano, backup/import, altri browser e PWA non dichiarati eseguiti; appartengono al perimetro futuro.

## Evidenze GATE 03 — 2026-09-13

17 test Vitest in 4 file PASS; 6 scenari Chromium PASS (4 preesistenti nella suite completa, 2 menù rieseguiti dopo correzione delle assunzioni del test su data al reload e segmenti del campo data nativo). Lint, type-check e build PASS. Migrazione v2/v3 preserva profilo e catalogo; revisioni e selezioni storiche, slot, esclusioni e rollback verificati. Percorso reale settimana, alternativa senza doppio conteggio, modifica quantità e reload; quota con bozza conservata e nuovo tentativo.

Axe senza violazioni nelle viste esaminate; tastiera automatizzata e review visiva dell'agente su menu-today-desktop.png e menu-form-320.png. Screenshot in test-results ignorati da Git. Validatore documentale PASS registrato nella review. Nessun criterio obbligatorio rinviato al GATE 04; audit completo release ancora futuro.

## Evidenze GATE 04 — 2026-09-13

24 test Vitest in 5 file, suite completa di 8 scenari Chromium, lint, type-check (anche nella build) e build PASS. Migrazione v3/v4 conserva profilo/piani/selezioni senza creare diari o peso. Copia esplicita e idempotente, quantità indipendenti, stato aperto/completo, null delle fibre, date future, indici unici peso/diario, conflitti e rollback transazionale verificati. Cambio previsto confermato conserva slot con consumi, fonti e quantità; storico invariato dopo revisione del piano e modifica/archiviazione del catalogo.

Browser: consumi reali di alimenti esclusi accettati, peso aggiornato e reload, attività/campi opzionali, note simili a script inerti, quota sulla misurazione annulla le precedenti scritture, input conservato, conferme accettate/annullate e annullamento della navigazione con bozza. Axe senza violazioni nelle viste esaminate; review visiva dell'agente su diary-desktop.png, diary-consumed-320.png e diary-weight-320.png. Tastiera verificata sul controllo del piano storico e sul selettore data nella suite; non è una prova con screen reader umano. Nessun criterio obbligatorio N/A, audit release completo ancora futuro.

Validatore documentale eseguito alla chiusura insieme al controllo diff Git; nessun backup o dato personale reale nei test/repository. Non è stata ripetuta npm ci: nessuna dipendenza o lockfile modificati rispetto all'installazione già verificata.

## Strategia

- Unitari: conversioni quantità, aggregazione, null delle fibre, date locali, validazioni, esclusioni e revisione. In GATE 01 coprire soltanto invarianti del profilo e inizializzazione senza sovrascrittura.
- Integrazione: servizi con repository, transazioni, migrazioni, persistenza profilo dopo riapertura; form con Testing Library basati sul comportamento osservabile.
- E2E: menù con cinque pasti, registrazione reale distinta, peso per data, ricostruzione storico, backup round-trip e fallimento import senza perdita. Verificare IndexedDB reale nel browser, oltre agli adapter di test.
- Accessibilità: tastiera, focus, etichette, errori e contrasti; controlli automatici quando introdotti non sostituiscono verifica manuale.
- Sicurezza/import: file malformati, schema/versione errata, duplicati, riferimenti orfani, quantità non valide, note HTML, file sovradimensionati, rollback e annullamento conferma.

Test proporzionati al rischio: privilegiare confini e casi di errore; niente test che copiano banalmente l'implementazione o storico personale reale. Dati di test fittizi, clock controllabile per date e timestamp. Test e2e isolati per profilo/origine, senza alterare dati dell'utente.

## Definition of Done generale

Un Gate è completo soltanto quando:

- Tutti i criteri obbligatori sono verificati e i test pertinenti passano.
- Lint, type-check e build passano quando configurati; controlli non applicabili hanno una motivazione esplicita.
- Percorsi manuali rilevanti e stati vuoti/errore sono verificati; niente regressioni bloccanti o dati fittizi spacciati per reali.
- Fonti, unità, persistenza e confini nutrizionali rispettano PRODUCT, DATA_MODEL e SECURITY.
- Documentazione, Gate e PROJECT_STATUS corrispondono ai file reali; decisioni importanti sono registrate.
- Gate Result unico: PASS, FAIL o BLOCKED. Solo PASS consente COMPLETED. Il successivo resta NOT STARTED fino a nuova richiesta.

## Review del bootstrap

Inventario completo e prompt preservato; struttura documentale completa; modello iniziale con storico, fonti e unità; specifiche Gate 00–06; validatore e review semantica; Git inizializzato e esclusioni verificate. Se manca identità Git, non inventarla: documentare l'assenza del primo commit senza dichiarare una build o un test applicativo.
