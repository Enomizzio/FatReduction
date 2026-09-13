# Decisioni importanti

## ADR-005 — Catalogo manuale, revisioni immutabili e resa dichiarata

Status: Accepted — 2026-09-13, GATE 02.

Catalogo inizialmente vuoto: nessun dataset esterno incluso e nessuna licenza alimentare da acquisire. L'utente trascrive una fonte (etichetta, database consultato o stima manuale); riferimento obbligatorio, URL http/https e data opzionali. Tutti i valori UI sono stime; nessuna fonte inventata o chiamata di rete. Fixture con numeri aritmetici fittizi, non alimenti di riferimento.

IndexedDB v2 aggiunge foods, recipes, foodRevisions e recipeRevisions. Ogni salvataggio/archiviazione incrementa la revisione e scrive testa e copia immutabile nella stessa transazione; confronto revisione contro conflitti. Archivio reversibile, nessuna cancellazione fisica. Migrazione v1 additiva conserva il profilo. Nessun totale ricetta persistito.

Quantità nella stessa unità hanno fattore 1; conversioni massa/volume solo se dichiarate con fonte nel dominio. UI con g/ml e porzioni dichiarate; unità non convertibili danno errore, senza densità implicita. Porzioni alimento con etichetta, quantità base e fonte; ricette con resa totale in g/ml e calcolo per quantità della preparazione. Nessun fattore di cottura o ritenzione inventato.

Ingredienti ricetta congelano fonte, nutrienti, revisione e conversione; modificare quantità conserva la fonte storica, anche per alimenti archiviati. Sostituire una fonte richiede rimuovere e aggiungere l'ingrediente esplicitamente. Snapshot ricetta includono ingredientSnapshots per ricostruire tutte le fonti e conversioni: dipendenza necessaria dello storico, senza implementare menù o diario.

Esclusioni per chiavi normalizzate, nomi e alias tartufo/tartufi/truffle/truffles. Per prodotti composti l'utente dichiara gli ingredienti; nessuna lettura automatica completa delle etichette o verifica allergeni. Le ricette propagano le chiavi degli ingredienti. Gli avvisi non impediscono conservazione nel catalogo o futuri consumi reali. Filtro delle proposte da integrare in GATE 03.

Alternative escluse: dataset senza provenienza/licenza, calorie ricalcolate dai macro, conversioni implicite e aggiornamento automatico delle ricette al cambio catalogo. Questi confini mantengono ricostruibili i calcoli.

## ADR-004 — Fondazione, origine stabile e validazione

Status: Accepted — 2026-09-13, GATE 01.

idb 8.0.3 per transazioni con attesa del commit, Zod 4.6.4 per validare dominio e record in lettura, navigazione hash nativa senza router. React 19.3.0/TypeScript 6.0.3/Vite 8.3.0, versioni esatte nel lockfile, compatibili con Node 24.15.0 verificato. Nessuna libreria di stato aggiuntiva.

Dev e preview condividono 127.0.0.1:5173 con strictPort: origine stabile e nessun binding LAN. Database versione 1 con solo profiles; default in transazione idempotente e confronto updatedAt contro scritture obsolete tra schede. Numero pasti derivato dagli slot ordinati, configurabili da 1 a 10.

Playwright introdotto subito per persistenza reale, navigazione e viewport; axe integra la review visiva. Alternative: IndexedDB nativo richiede più plumbing; router completo e store globale non necessari. Nessun backend o PWA. All'epoca identità Git assente: checkpoint tree conservati senza inventarla. Dopo la comunicazione dell'identità da parte dell'utente, configurazione solo locale e creazione dei commit `8554bd2` e `f513bb0` in sequenza, mantenendo esattamente gli alberi salvati e i riferimenti originali.

## ADR-001 — Frontend locale con React, TypeScript, Vite e IndexedDB

Status: Accepted

### Context

Il repository non contiene codice o stack. Occorre una base semplice per un'app locale con dati strutturati e storico, senza account o backend obbligatorio.

### Decision

Adottare come architettura iniziale React, TypeScript e Vite, moduli di dominio puri, adapter IndexedDB, npm con lockfile, Vitest/Testing Library e Playwright quando si introducono percorsi e2e. Nessuna dipendenza installata nel bootstrap. Versioni e wrapper saranno definiti in GATE 01.

### Rationale

È coerente con lo stack suggerito nel prompt e permette separare UI, regole e dati. IndexedDB offre persistenza strutturata per origine; i contratti isolano una futura sostituzione. Riferimenti primari in ARCHITECTURE.

### Alternatives considered

Backend con SQLite: aggiunge processo e API non necessari alla prima release. Solo localStorage: insufficiente per transazioni e relazioni dello storico. Applicazione desktop: distribuzione più impegnativa rispetto alla web app locale richiesta.

### Consequences

Nessun cloud o account richiesto; testabilità dei calcoli. Dati legati al browser e all'origine, rischio di evizione e necessità di backup; smartphone non sincronizzato. Versioni e modalità di distribuzione restano reversibili con nuova ADR.

## ADR-002 — Revisioni dei piani e snapshot dei nutrienti per lo storico

Status: Accepted

### Context

Bisogna ricostruire cosa era pianificato e consumato per una data anche quando alimenti, ricette e piano cambiano.

### Decision

Piani salvati in revisioni immutabili, diario legato alla revisione selezionata, voci pianificate e consumate separate. Ogni voce conserva uno snapshot di base nutrizionale, fonte e conversione. Riepiloghi derivabili non persistiti.

### Rationale

I soli riferimenti al catalogo corrente riscriverebbero il passato. Gli snapshot duplicano fatti necessari alla ricostruzione, non totali ricalcolabili, e mantengono la provenienza.

### Alternatives considered

Riferimenti mutabili al catalogo: perdita dello storico. Totali giornalieri salvati: possibile divergenza dai dettagli. Event sourcing completo: complessità eccessiva per il perimetro locale iniziale.

### Consequences

Storico stabile e confrontabile; maggiore volume e controlli di integrità. Revisioni referenziate richiedono archiviazione e import coerenti.

## ADR-003 — Gate sequenziali con memoria nel repository

Status: Accepted

### Context

Chat indipendenti devono riprendere senza cronologia e senza estendere involontariamente il lavoro.

### Decision

Confermare Gate 00–06 proposti dal bootstrap, ciascuno con scope, criteri e risultato unico. PROJECT_STATUS è la fonte del Gate attivo; il bootstrap termina con Gate 01 NOT STARTED. Documenti e stato si aggiornano insieme al codice.

### Rationale

La suddivisione segue dipendenze verificabili: fondazione, calcoli, piano, diario, dashboard e release. Limita lavoro prematuro e conserva un passaggio di consegne concreto.

### Alternatives considered

Sviluppare tutta l'app nella prima chat: contrario al perimetro. Usare la sola cronologia: non riproducibile tra chat. Gate per singola operazione: frammentazione senza risultato significativo.

### Consequences

Più review documentali ma ripresa autonoma del contesto. Ogni Gate successivo richiede nuova richiesta esplicita; backup completo arriva prima della release e nessuna versione precedente va presentata come pronta per dati personali senza spiegare i limiti.
