# Architettura

## Architettura attuale

App React 19.3.0, TypeScript 6.0.3, Vite 8.3.0, idb 8.0.3, Zod 4.6.4. Node 24.15.0/npm 12.0.2 verificati. Vitest 5.0.0, Playwright 1.63.0, ESLint 10.10.0. Versioni esatte e transitive nel manifest/lockfile. Nessun backend o remote Git.

Navigazione hash con link nativi, senza router aggiuntivo. Dev e preview su `http://127.0.0.1:5173`, loopback e strictPort. Build con asset locali e font di sistema. Compatibilità verificata su metadata npm e guide primarie Vite/Vitest il 2026-09-13; Node 24.15 soddisfa i requisiti. Scelte in ADR-004.

## Componenti — ADR-001

| Componente | Scelta iniziale | Responsabilità |
| --- | --- | --- |
| UI | React + TypeScript | Schermate italiane, form e stati accessibili |
| Tooling | Vite, npm e lockfile | Sviluppo e build locale riproducibile |
| Dominio | Moduli TypeScript puri | Validazioni, quantità e calcoli; nessun accesso al browser |
| Application | Servizi locali | Casi d'uso e transazioni attraverso repository |
| Persistenza | IndexedDB | Dati strutturati locali e migrazioni versionate |
| Unitari/integrazione UI | Vitest + Testing Library | Calcoli, comportamenti e form |
| End-to-end | Playwright | Percorsi reali e persistenza nel browser, quando introdotti |
| Backend/cloud | Assenti nella prima release | Nessun account o comunicazione obbligatoria |

Fondazione implementata. Nessuna libreria di stato o grafici introdotta.

## Struttura implementata

```text
src/app/                Avvio, layout, navigazione e gestione errori
src/features/           Schermate e casi d'uso per area
src/domain/             Entità, validazioni e calcoli puri
src/services/           Operazioni applicative e contratti
src/storage/            Adapter IndexedDB, schema e migrazioni
src/components/         Controlli e presentazione condivisa
tests/                  Test integrazione e, successivamente, e2e
```

GATE 01 introduce queste cartelle, profilo e adapter. Schema reale in DATA_MODEL; funzioni successive restano nei rispettivi Gate.

## Flussi dati

1. UI valida sintassi e comunica valori ai servizi; il dominio valida anche i vincoli semantici.
2. Servizio prepara entità e snapshot, quindi chiede una transazione all'adapter locale.
3. Il repository restituisce dati persistiti; il dominio calcola riepiloghi senza duplicarli nel database.
4. La UI presenta valori, fonte, unità e stati incompleti. Errori di scrittura non possono essere mostrati come salvataggi riusciti.
5. In GATE 06 l'import passa da parsing, schema, controlli di riferimenti e anteprima prima di una sostituzione atomica confermata.

## Vincoli e rischi

- Dati per origine browser (protocollo, host e porta), profilo e dispositivo. Fissare una porta locale e usare `strictPort`: cambiarla non deve simulare una perdita misteriosa dei dati.
- Servizio locale legato a loopback per impostazione iniziale. Pubblicarlo in LAN richiederebbe valutare esposizione, secure context e protezione del PC; responsive design non autorizza questa apertura.
- IndexedDB non è un backup e non offre cifratura applicativa automatica. Evizione, quota, modalità privata, pulizia del browser e multi-tab vanno gestiti e verificati.
- Schema database e formato backup hanno versioni distinte; le migrazioni non devono cancellare dati silenziosamente.
- Nessuna risorsa remota obbligatoria a runtime: evitare font CDN, analytics e servizi nutrizionali richiesti per aprire l'app.
- La prima release richiede un server statico locale per la build; aprire `index.html` tramite `file://` non è un percorso supportato. Service worker/PWA non sono ancora decisi.

## Riferimenti tecnici verificati nel bootstrap

Vite separa sviluppo e build: [guida ufficiale Vite](https://vite.dev/guide/). Requisiti ricontrollati in GATE 01 insieme a [Vitest](https://main.vitest.dev/guide/) e metadata npm.

IndexedDB gestisce dati strutturati con operazioni asincrone e transazioni nell'ambito dell'origine: [MDN IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API). Wrapper scelto: idb.

Configurazione dei runner: [guida ufficiale Vitest](https://vitest.dev/guide/) e [documentazione Playwright](https://playwright.dev/docs/intro). Le capacità degli strumenti non equivalgono a test già presenti nel repository.
