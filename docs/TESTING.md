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
