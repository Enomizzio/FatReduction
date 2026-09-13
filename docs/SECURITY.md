# Sicurezza e gestione dei dati

## Stato e dati trattati

Profilo persistito in IndexedDB, inizializzato una volta dai valori autorizzati nel progetto. Prompt e specifiche contengono età, altezza e baseline: da considerare prima di pubblicare il repository. Repository pubblicato su GitHub su richiesta esplicita; dati runtime conservati solo nel browser. Test in browser isolati e fixture fittizie, risultati ignorati da Git.

L'app conserva dati personali su peso, alimentazione e note potenzialmente sanitarie. Minimizzare raccolta e diffusione; nessun analytics, account o invio a terzi obbligatorio. Non classificare l'app come strumento medico né promettere effetti clinici.

## Minacce e limiti della prima release

Browser e account del PC costituiscono il confine di accesso iniziale. Utenti con accesso al profilo browser, malware o estensioni possono leggere dati. IndexedDB locale non implica cifratura applicativa, backup o immunità da perdita. Export JSON contiene dati leggibili; la UI dovrà dirlo quando si esporta. Cifratura dei backup è una decisione ancora aperta, non una funzione presente.

Loopback come binding iniziale. Nessuna apertura LAN automatica, nessun CORS/API inventati. Prima di supportare un telefono che accede al PC definire esposizione e contesto sicuro; browser del telefono conserva un archivio distinto. Origine e porta stabili, gestione di quota, browser privato e multi-tab prima della release.

## Segreti e dipendenze

Nessuna chiave API necessaria. `.env` reali e chiavi sono ignorati; un eventuale `.env.example` contiene solo nomi e valori fittizi. Variabili esposte dal bundler al client sono pubbliche, non un posto per segreti.

Versioni esatte e lockfile introdotti in GATE 01. Installazione npm: zero vulnerabilità segnalate il 2026-09-13. Riesaminare aggiornamenti in base ai rischi concreti. Nessun download di codice a runtime, analytics o font remoti.

## Validazione e contenuti

Validare numeri finiti, quantità positive, date reali, limiti stringhe e relazioni sia nei form sia nel dominio/import. Non assumere affidabili dati già nel browser. Evitare `eval`, inserimenti HTML non sanitizzati e `dangerouslySetInnerHTML` per note, istruzioni o fonti. Renderizzare testo con escaping; URL solo http/https, link esterni con protezioni appropriate e nessun fetch automatico.

## Backup e importazione

Seguire [API](API.md): limite dimensione/record, envelope/versione, schema rigoroso, chiavi pericolose rifiutate, date/unità e riferimenti controllati. Nessuna scrittura prima della validazione completa e della conferma sostitutiva. Un errore deve causare rollback integrale. Non includere import/export o fixture personali in Git; usare `backups/`, `exports/` o nomi ignorati.

## Logging

Log tecnici minimi, senza nomi alimenti, peso, note, contenuto dei backup o intero profilo. Evitare payload di errore contenenti dati personali. Nessuna telemetria esterna; log generati non versionati.

## Cancellazione dei dati

L'app richiede una conferma esplicita che descriva l'ambito: archivio locale dell'origine corrente. Consentire di annullare e offrire export prima se disponibile. Eliminare gli store applicativi in modo coerente e verificare l'esito; aggiornare la UI solo al completamento. Non cancellare automaticamente i file di backup esterni e non promettere cancellazione sicura a livello disco. Il re-inserimento del profilo iniziale richiede una nuova inizializzazione chiaramente comunicata.

## Verifiche GATE 02

URL fonte limitati a http/https e 2.000 caratteri, nessun fetch automatico; note e istruzioni renderizzate come testo React. Browser test verifica istruzioni simili a script inerti e rifiuto URL javascript. Input e record catalogo validati, riferimenti snapshot controllati in transazione, conflitti espliciti e rollback provato. Archiviazione reversibile conserva tutte le revisioni; nessuna cancellazione fisica o import introdotti.

## Verifiche GATE 03

Piani e scelte giornaliere validati in transazione, snapshot confrontati con revisioni reali del catalogo, conflitti e rollback verificati. Nessun consumo inventato né dato personale di test. Note renderizzate come testo; bozze conservate dopo quota esaurita, scarto esplicitamente confermato. Test e screenshot usano contesti browser isolati. Pubblicazione del codice e documentazione su GitHub richiesta dall'utente; nessun backup, log o dato del suo browser incluso.

## Verifiche GATE 04

Diario, consumi e peso validati prima del commit e salvati atomicamente. Indici unici impediscono due diari o due misurazioni per profilo/data. Confronto updatedAt e controllo proprietario degli UUID contro conflitti/sovrascritture di altre giornate. Snapshot autentici verificati anche per consumi esclusi dalle proposte. Rimozioni e cambio del riferimento storico richiedono conferma nell'app, con annullamento verificato nel browser. Note simili a script restano testo inerte. Date future rifiutate sia nella UI sia nel dominio.

Quota simulata sull'ultima scrittura della misurazione: rollback di diario e consumi già scritti, input conservato e nuovo tentativo riuscito. Navigazione con bozza non salvata richiede conferma; annullamento mantiene input. Tutte le misure, fonti e giornate nei test sono fittizie; screenshot e trace esclusi da Git. Backup ancora assente, limite esposto nel footer.

## Verifiche richieste prima della release

Import ostile e rollback, assenza di rete obbligatoria e di segreti nei bundle, contenuti note inerti, errori storage recuperabili, conferme e annullamento, persistenza su origine stabile, gestione multi-tab e rischi export comprensibili. Lo stato reale di queste verifiche sarà registrato in GATE 06, senza considerarle già soddisfatte dalla documentazione.
