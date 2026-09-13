# Frontend

## Stato attuale

Layout, sei destinazioni hash e impostazioni implementati; aree future con stato vuoto. Skip link, focus visibile, pagina corrente e impaginazione a 320 px. Occasioni aggiunte/rimosse (1–10), etichette esplicite e pulsante per spostarle in alto; numero derivato. Form con decimali italiani, errori associati ai campi, input conservato su errore e riscontro solo dopo commit. Review visiva e percorsi browser documentati nel Gate.

GATE 02 aggiunge Alimenti/Ricette: ricerca, attivi/archiviati, creazione, modifica, archiviazione e ripristino. Schede con base/unità, nutrienti, fonti, esclusioni e calcolatore quantità. Fibre mancanti: Non disponibile. Form alimenti con provenienza obbligatoria e porzioni dichiarate; form ricette con snapshot ingredienti, quantità modificabili, resa e istruzioni. Fonti storiche conservate anche con alimento archiviato. Focus al titolo all'apertura form, al titolo pagina alla chiusura. Avvisi esclusioni descrittivi, senza impedire conservazione nel catalogo. Menù e diario implementati nei Gate seguenti, descritti sotto.

GATE 03 implementa Menù: bozza giorno/settimana, cinque slot iniziali, quantità in g/ml o porzioni dichiarate, fonti, note, alternative non conteggiate, nuova revisione e consultazione dello storico. Selezione esplicita del piano per data, avviso sovrapposizioni e applicazione delle occasioni attuali senza cancellare revisioni. Oggi mostra il pianificato selezionato. Data mantenuta navigando tra le aree, reset alla data locale attuale dopo reload. Voci di catalogo filtrate per esclusioni; nessuna proposta automatica. Errori di commit conservano la bozza, scarto della bozza confermato. Il diario è implementato in GATE 04; dashboard e backup restano futuri.

GATE 04: Oggi e Diario mostrano previsto e consumato separati, diario assente/aperto/completo, subtotali dei giorni aperti e zero solo per diario completo senza voci. Apertura e copia dal piano esplicite; quantità modificate con Applica quantità, poi Salva giornata. Alimenti esclusi ammessi nei consumi senza avvisi colpevolizzanti. Peso facoltativo senza copiare la baseline, attività descrittive con durata opzionale, fame/energia/umore 1–5 e note. Elenco delle date registrate con stato e peso, senza grafici.

Il piano storico resta congelato anche quando cambia la selezione nel Menù. Cambio del riferimento e rimozioni richiedono conferma; i consumi conservano le fonti e le occasioni occupate. Quote e conflitti conservano gli input. Cambio area, cambio data e reload proteggono le bozze non salvate; nessun salvataggio automatico. Date future consentono solo consultare il previsto. Audit completo release ancora futuro.

## Navigazione e schermate

| Area | Contenuto previsto | Gate |
| --- | --- | --- |
| Dashboard | Peso, andamento, calorie/macro, confronto con piano, accesso a Oggi | 05 |
| Oggi | Data locale selezionata, cinque pasti iniziali (occasioni configurabili), piano e registrazione rapida dei consumi/peso | 03–04 |
| Menù | Viste giorno/settimana, quantità, fonti, note e sostituzioni; mese successivamente | 03, mese 05 |
| Diario | Elenco e dettaglio date, consumi reali, peso, attività e campi opzionali | 04 |
| Alimenti/Ricette | Catalogo, nutrienti per base, fonte, conversioni e resa ricetta | 02 |
| Impostazioni e backup | Profilo e preferenze; export/import e cancellazione nella release | 01, backup 06 |

Una sola navigazione coerente su desktop e mobile, con indicazione della pagina corrente. La data selezionata deve essere visibile; Oggi torna esplicitamente alla data attuale. Dettagli giornalieri non devono perdere la data durante la navigazione. Evitare percorsi che richiedono conoscenze tecniche all'utente.

## Componenti condivisi

Layout con intestazione e contenuto principale; navigazione; selettore data; scheda pasto; quantità con unità; riepilogo nutrienti con colonne pianificato/consumato/obiettivo; campo fonte; stato vuoto; messaggio di errore; conferma di azioni distruttive. Introdurre componenti quando almeno un caso reale li richiede, senza costruire una libreria completa in GATE 01.

## Form, quantità e tabelle

- Etichette persistenti, descrizioni e messaggi collegati ai campi; indicare opzionalità e unità.
- Accettare input decimale italiano in modo controllato, convertire in numeri finiti; non interpretare silenziosamente formati ambigui.
- Errori vicino ai campi e riepilogo focalizzabile quando utile. Una scrittura fallita conserva i dati inseriti e permette un nuovo tentativo.
- Salvare con riscontro concreto. Nessun salvataggio apparente quando IndexedDB non è disponibile.
- Tabelle con intestazioni semantiche; su mobile scorrimento controllato o schede equivalenti, senza perdere etichette e unità.
- Mostrare `non disponibile` per nutrienti sconosciuti e `non registrato` per diario incompleto, senza zeri fittizi.

## Grafici — GATE 05

Grafico del peso con date di misurazione reali, tabella alternativa e testo della variazione. Non interpolare una misurazione come se fosse stata inserita. Calorie e macro con etichette, unità e dati mancanti distinguibili. Colore accompagnato da testo; niente soglie sanitarie inventate o indicatori morali.

## Responsive e accessibilità

Obiettivo di progetto: WCAG 2.2 livello AA per i percorsi principali, da verificare prima della release. Layout usabile a 320 px e con zoom 200%; testo e contrasti adeguati, controlli utilizzabili al tocco, rispetto di `prefers-reduced-motion`.

Usare HTML semantico, `lang=it`, skip link, focus visibile e ordine coerente, navigazione da tastiera. Dialoghi accessibili con focus iniziale, contenimento e ritorno al controllo di origine. Icone con nomi accessibili, aggiornamenti significativi annunciati senza rumore. Nessuna azione dipendente soltanto da hover, colore o drag.

## Stati vuoti, errori e conferme

- Prima apertura: spiegare il profilo iniziale e la modifica delle impostazioni; non creare storico personale fittizio.
- Nessun menù: invito a pianificare; slot vuoti chiaramente da compilare.
- Nessun peso: baseline dichiarata separata dalle misurazioni.
- Persistenza non disponibile/quota esaurita: errore comprensibile e possibilità di conservare l'input; non passare a un archivio volatile senza avviso.
- Import: riepilogo dei dati e dell'effetto di sostituzione prima della conferma.
- Cancellazione: indicare che dati locali saranno eliminati, raccomandare export se desiderato, confermare esplicitamente, poi mostrare l'esito.

Tono italiano chiaro e neutrale, senza messaggi colpevolizzanti. Le informazioni sulle stime devono aiutare a interpretare i valori, senza invadere ogni passaggio.
