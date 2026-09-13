FATREDUCTION — Prompt iniziale per Codex in Visual Studio Code

Usa questo file come prompt iniziale nella prima chat Codex aperta nella cartella del progetto.
Questa prima chat deve preparare il repository e la pianificazione; non deve sviluppare subito tutta l'applicazione.

Ruolo

Stai iniziando un nuovo progetto software chiamato FATREDUCTION.

Lavora come:

software architect e sviluppatore full-stack senior;

product designer orientato alla semplicità;

esperto di qualità, test e sicurezza dei dati;

supporto alla progettazione nutrizionale, senza presentare l'app come sostituto di un medico o di un dietista abilitato.

Il repository deve diventare la memoria permanente del progetto. Le chat future non devono dipendere dalla cronologia delle conversazioni per capire obiettivi, architettura, decisioni, stato dei lavori e prossima attività.

Regola principale:

Il repository è la memoria del progetto. La cronologia della chat non lo è.

1. Informazioni sul progetto

Nome

FATREDUCTION

Obiettivo

Creare un'applicazione web utilizzabile in locale sul PC per aiutare l'utente a:

perdere peso in modo graduale;

mangiare in maniera più equilibrata;

consultare un piano alimentare;

registrare ciò che mangia realmente;

monitorare peso, calorie e macronutrienti;

conservare uno storico giornaliero chiaro e consultabile.

Profilo iniziale dell'utente

Età: 40 anni

Altezza: 180 cm

Peso iniziale: 100 kg

Livello di attività: basso

Obiettivo: perdita di peso

Regime alimentare: alimentazione normale/onnivora

Alimento escluso: tartufo

Numero desiderato di pasti: 5 al giorno, inclusi gli spuntini

Questi valori devono essere modificabili dalle impostazioni. Non trattarli come costanti scritte direttamente nel codice.

2. Requisiti funzionali confermati

L'applicazione deve prevedere almeno le seguenti aree.

Dashboard dei progressi

Mostrare, con aggiornamento giorno per giorno:

peso corrente e peso iniziale;

variazione totale e andamento nel tempo;

riepilogo calorico giornaliero;

macronutrienti assunti;

aderenza rispetto al menù pianificato;

collegamento rapido alla registrazione della giornata.

Non inventare metriche sanitarie che non siano supportate dai dati realmente inseriti.

Macronutrienti

Mostrare almeno:

calorie;

proteine;

carboidrati;

grassi;

fibre, se disponibili.

Per ogni valore distinguere chiaramente:

quantità pianificata;

quantità effettivamente consumata;

eventuale obiettivo giornaliero;

unità di misura.

Menù

Prevedere viste:

giornaliera;

settimanale;

mensile.

Ogni giornata deve contenere cinque occasioni alimentari:

colazione;

spuntino mattutino;

pranzo;

spuntino pomeridiano;

cena.

Per ogni pasto indicare:

alimenti o ricette;

quantità in grammi o altra unità appropriata;

calorie stimate;

macronutrienti stimati;

eventuali note o possibili sostituzioni.

Il tartufo non deve comparire nei menù proposti.

Diario giornaliero

Per ogni data consentire di registrare almeno:

menù pianificato;

alimenti realmente consumati;

quantità consumate;

peso del giorno, se misurato;

calorie e macronutrienti calcolati;

attività fisica, se svolta;

livello di fame, energia o umore, come campi opzionali;

note libere.

Esempio di informazione che deve essere ricostruibile:

Il 12 settembre il menù pianificato era “XX”, il peso era “XX” e sono stati consumati “XX”.

Il menù pianificato e ciò che è stato realmente consumato devono essere dati distinti.

Piano alimentare

L'app dovrà poter ospitare un piano alimentare giornaliero o settimanale coerente con il profilo iniziale e con l'obiettivo di dimagrimento.

Il piano deve:

contenere cinque pasti al giorno;

riportare grammature e calorie stimate per pasto;

riportare i macronutrienti;

permettere modifiche e sostituzioni;

rendere chiaro che calorie e fabbisogni sono stime;

evitare prescrizioni cliniche o promesse di risultato;

suggerire il confronto con un professionista in presenza di patologie, farmaci, allergie, disturbi alimentari o esigenze cliniche.

Non generare ancora il piano alimentare definitivo durante il bootstrap del repository.

Gestione dati

La prima versione deve essere local-first:

utilizzo sul computer dell'utente;

nessun account obbligatorio;

nessun servizio cloud obbligatorio;

dati personali conservati localmente;

esportazione e importazione di backup in formato documentato;

possibilità futura di esportare dati in CSV e/o JSON.

3. Vincoli e principi di prodotto

Interfaccia in italiano.

Utilizzo semplice anche da smartphone, pur restando un'app locale.

Accessibilità da tastiera e contrasto adeguato.

Nessuna chiave API o credenziale nel repository.

Le informazioni nutrizionali devono riportare fonte e natura stimata quando applicabile.

I dati relativi a peso e alimentazione devono essere trattati come dati personali sensibili.

La cancellazione dei dati deve richiedere conferma e deve essere chiaramente descritta.

Evitare gamification punitiva, giudizi morali sul cibo e messaggi colpevolizzanti.

Non sviluppare funzioni social, account multipli o sincronizzazione cloud nella prima release, salvo nuova decisione documentata.

4. Prima attività: ispeziona il repository

Prima di creare o modificare file:

ispeziona l'intera struttura del repository;

verifica se Git è già inizializzato;

controlla codice, documentazione e configurazioni esistenti;

identifica lo stack tecnologico, se presente;

identifica comandi esistenti di test, lint, type-check e build;

cerca eventuali AGENTS.md, README.md, docs/ e .codex/;

preserva e integra tutto ciò che è utile;

non sovrascrivere o duplicare contenuti senza motivo.

Se il repository è vuoto, inizializza la struttura descritta di seguito.

5. Struttura documentale richiesta

Creare o adattare:

PROJECT_ROOT/
├── AGENTS.md
├── README.md
├── docs/
│   ├── INDEX.md
│   ├── PRODUCT.md
│   ├── ARCHITECTURE.md
│   ├── DATA_MODEL.md
│   ├── FRONTEND.md
│   ├── API.md
│   ├── TESTING.md
│   ├── SECURITY.md
│   ├── DECISIONS.md
│   ├── PROJECT_STATUS.md
│   └── gates/
│       ├── GATE_TEMPLATE.md
│       └── ...
├── src/
├── tests/
└── ...

Non creare documenti vuoti solo per soddisfare la struttura. Se un argomento non è ancora applicabile, inserire una breve nota che spieghi lo stato attuale e quando il documento dovrà essere completato.

6. Contenuto dei documenti

AGENTS.md

Deve essere una mappa operativa concisa. Deve indicare:

quali documenti leggere e quando;

il workflow a Gate;

come individuare il Gate attivo;

i criteri per completare un Gate;

l'obbligo di aggiornare documentazione e stato insieme al codice;

il divieto di dipendere dalla cronologia della chat.

Prima di ogni attività di implementazione, Codex deve:

leggere AGENTS.md;

leggere docs/INDEX.md;

leggere docs/PROJECT_STATUS.md;

identificare il Gate attivo;

leggere il relativo documento;

leggere soltanto gli altri documenti rilevanti;

ispezionare l'implementazione esistente;

pianificare, implementare, validare e aggiornare lo stato.

docs/INDEX.md

Mappa della documentazione. Per ogni file deve spiegare brevemente cosa contiene e quando leggerlo, senza duplicarne il contenuto.

docs/PRODUCT.md

Descrivere:

scopo del prodotto;

utente target;

casi d'uso;

funzionalità principali;

regole di business;

terminologia;

requisiti confermati;

assunzioni;

vincoli e non-obiettivi.

docs/ARCHITECTURE.md

Separare chiaramente architettura attuale e pianificata. Documentare:

stack;

componenti;

responsabilità;

struttura del repository;

flussi dati;

dipendenze;

integrazioni;

vincoli architetturali.

Se il repository è vuoto, usare come ipotesi iniziale reversibile:

React;

TypeScript;

Vite;

persistenza locale tramite IndexedDB;

nessun backend nella prima versione;

test unitari con Vitest e Testing Library;

test end-to-end con Playwright quando introdotti.

Confermare o modificare questa ipotesi tramite una decisione architetturale motivata. Non installare dipendenze nella fase di bootstrap, salvo stretta necessità.

docs/DATA_MODEL.md

Definire almeno, a livello iniziale:

profilo utente;

misurazioni corporee;

alimento/ricetta;

pasto pianificato;

voce consumata;

piano menù;

diario giornaliero;

eventuali dati derivati, come riepiloghi nutrizionali.

Per ogni entità indicare campi, tipi, identificativi, relazioni, unità di misura, validazioni e invarianti. I riepiloghi calcolabili non devono essere duplicati in persistenza senza una ragione documentata.

docs/FRONTEND.md

Documentare almeno:

Dashboard;

Oggi;

Menù;

Diario;

Alimenti/Ricette;

Impostazioni e backup;

navigazione;

componenti riutilizzabili;

responsive design;

form e tabelle;

grafici;

accessibilità;

gestione di stati vuoti, errori e conferme.

docs/API.md

Se non è presente un backend, dichiararlo esplicitamente. Documentare comunque i confini dei moduli e il formato previsto per importazione/esportazione. Non descrivere endpoint inesistenti come già implementati.

docs/TESTING.md

Definire:

test unitari;

test di integrazione;

test end-to-end;

lint;

type-check;

build;

comandi effettivi;

Definition of Done generale.

Un'attività non è completa solo perché il codice è stato scritto.

docs/SECURITY.md

Documentare almeno:

dati personali e nutrizionali;

segreti e variabili d'ambiente;

validazione degli input;

importazione sicura dei backup;

logging;

dipendenze;

cancellazione dei dati;

eventuali rischi derivanti da contenuti HTML o note libere.

docs/DECISIONS.md

Registrare soltanto decisioni importanti usando questo formato:

## ADR-XXX — Titolo

Status: Accepted

### Context

Perché era necessaria una decisione.

### Decision

Cosa è stato deciso.

### Rationale

Perché.

### Alternatives considered

Alternative valutate.

### Consequences

Conseguenze positive e negative.

docs/PROJECT_STATUS.md

È il passaggio di consegne tra chat indipendenti. Deve descrivere lo stato presente, non diventare un diario storico.

Usare questa struttura:

# Project Status

## Current Gate

Gate:
Status:

## Completed Gates

- [ ] GATE 00 — ...
- [ ] GATE 01 — ...

## Current System State

### Frontend
...

### Data persistence
...

### Testing
...

### Infrastructure
...

## Known Issues
...

## Current Blockers
...

## Next Objective
...

## Relevant Documents
...

Stati ammessi:

NOT STARTED

IN PROGRESS

BLOCKED

COMPLETED

7. Workflow a Gate

Lo sviluppo deve essere diviso in Gate sequenziali. Ogni Gate deve essere un risultato significativo, verificabile e adatto a una chat Codex principale distinta.

Piano iniziale suggerito, da confermare durante il bootstrap:

Gate

Obiettivo

GATE 00

Bootstrap del repository, documentazione e regole operative

GATE 01

Fondazione tecnica, layout base, navigazione e persistenza locale

GATE 02

Modello nutrizionale, alimenti/ricette e calcoli di calorie/macronutrienti

GATE 03

Menù giornaliero e settimanale con cinque pasti

GATE 04

Diario giornaliero, consumi reali e registrazione del peso

GATE 05

Dashboard, andamento nel tempo e vista mensile

GATE 06

Backup/import-export, accessibilità, hardening e release locale

Adatta i Gate se l'ispezione tecnica dimostra che una diversa suddivisione è più coerente. Non creare Gate enormi né Gate ridotti a singole operazioni.

Non implementare funzioni assegnate a Gate futuri, salvo quanto strettamente necessario per il Gate attivo.

8. Template obbligatorio per ogni Gate

Creare docs/gates/GATE_TEMPLATE.md con questa struttura:

# GATE XX — Nome del Gate

## Status

NOT STARTED

## Objective

Risultato misurabile del Gate.

## Context

Stato su cui si basa e motivo del Gate.

## Scope

Questo Gate include:

- ...

## Out of Scope

Questo Gate non include:

- ...

## Requirements

### Requirement 1

...

## Technical Constraints

...

## Relevant Documentation

Prima dell'implementazione leggere:

- ...

## Acceptance Criteria

Il Gate è completo quando:

- [ ] ...

## Validation

- [ ] Unit test
- [ ] Integration test, se applicabili
- [ ] End-to-end test, se applicabili
- [ ] Lint
- [ ] Type-check, se applicabile
- [ ] Build
- [ ] Verifica manuale, se applicabile

## Gate Result

`NOT EVALUATED`

Risultati ammessi:

- `PASS`
- `FAIL`
- `BLOCKED`
- `NOT EVALUATED`

## Completion Information

Started:

Completed:

Git commit / reference:

## Notes

...

9. Protocollo PASS / FAIL / BLOCKED

Un Gate può diventare COMPLETED soltanto quando:

tutti i criteri obbligatori sono soddisfatti;

i test richiesti passano;

lint e type-check passano, se configurati;

la build riesce, se applicabile;

la documentazione riflette il codice reale;

non restano regressioni bloccanti.

Assegnare un solo risultato:

PASS: Gate completato e validato;

FAIL: implementazione tentata ma criteri non soddisfatti; lo stato resta IN PROGRESS;

BLOCKED: dipendenza esterna o impedimento non risolvibile; documentare il blocco anche in PROJECT_STATUS.md.

Al completamento aggiornare sempre:

documento del Gate;

docs/PROJECT_STATUS.md;

documentazione interessata;

docs/DECISIONS.md, se è stata presa una decisione importante.

10. Git e configurazione

Se Git non è inizializzato e il progetto è nuovo, inizializzarlo.

Creare un .gitignore appropriato. Non versionare:

segreti e credenziali;

file .env contenenti valori reali;

dipendenze installate;

cache;

output di build generabili;

dati personali reali esportati dall'app.

Non riscrivere o distruggere una cronologia Git esistente. Usare checkpoint significativi in corrispondenza dei Gate completati.

11. Attività consentite in questa prima chat

Durante il bootstrap:

ispeziona il repository;

crea o integra la struttura documentale;

crea AGENTS.md;

crea PROJECT_STATUS.md;

definisci il piano dei Gate;

crea GATE_TEMPLATE.md;

crea le specifiche dei Gate iniziali;

identifica o pianifica i comandi di sviluppo e validazione;

verifica la coerenza dei documenti;

inizializza Git e .gitignore, se opportuno.

Non sviluppare automaticamente tutte le funzionalità del prodotto. Non iniziare il Gate successivo senza una nuova richiesta esplicita.

12. Revisione finale del bootstrap

Prima di terminare verificare:

AGENTS.md esiste ed è conciso;

README.md esiste o è stato preservato;

docs/INDEX.md esiste;

i requisiti del prodotto sono documentati;

architettura attuale e pianificata sono distinte;

modello dati iniziale, test e sicurezza sono documentati;

docs/DECISIONS.md esiste;

docs/PROJECT_STATUS.md identifica chiaramente il prossimo Gate;

docs/gates/GATE_TEMPLATE.md esiste;

i Gate iniziali sono definiti e hanno criteri di accettazione;

le chat future possono riprendere il progetto senza leggere chat precedenti;

la documentazione non contraddice il repository.

13. Output richiesto a Codex

Alla fine della prima chat mostra:

Struttura del progetto

Albero sintetico dei file creati o preservati.

Comprensione del progetto

Breve descrizione di FATREDUCTION e del suo perimetro.

Piano dei Gate

Gate

Obiettivo

Stato

Gate corrente

Indicare quale Gate deve essere sviluppato nella chat successiva.

Assunzioni

Elencare soltanto le assunzioni importanti e reversibili.

Rischi e informazioni mancanti

Segnalare decisioni ancora da prendere, soprattutto quelle che potrebbero cambiare il piano alimentare o l'architettura.

Esito

Restituire esattamente uno dei seguenti risultati:

BOOTSTRAP PASS

BOOTSTRAP INCOMPLETE

Se incompleto, spiegare cosa manca. Fermarsi dopo il bootstrap e attendere una nuova richiesta.

14. Prompt breve per le chat dei Gate successivi

Dalla seconda chat in poi è sufficiente usare questo testo:

Continua il progetto FATREDUCTION lavorando esclusivamente sul Gate attivo.

Prima di modificare qualsiasi file:
1. leggi AGENTS.md;
2. leggi docs/INDEX.md;
3. leggi docs/PROJECT_STATUS.md;
4. leggi il documento del Gate attivo;
5. ispeziona l'implementazione e la documentazione rilevante.

Poi pianifica, implementa e valida tutti i criteri del Gate. Esegui la Gate Review formale e aggiorna il documento del Gate, PROJECT_STATUS.md, la documentazione interessata e DECISIONS.md quando necessario.

Non sviluppare funzionalità appartenenti a Gate futuri. Se il Gate non può essere completato, assegna FAIL o BLOCKED spiegandone la causa. Non dipendere dalla cronologia di altre chat.