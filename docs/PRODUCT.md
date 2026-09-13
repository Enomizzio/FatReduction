# Prodotto

## Scopo e utente target

FATREDUCTION aiuta un adulto a organizzare un'alimentazione equilibrata, registrare ciò che mangia e monitorare il peso nel tempo per un obiettivo di perdita graduale. Prima release: applicazione web locale sul PC, un singolo profilo, lingua italiana, nessun account o cloud obbligatorio.

## Profilo iniziale confermato

| Impostazione | Valore iniziale | Regola |
| --- | --- | --- |
| Età | 40 anni | Modificabile; non inventare data di nascita |
| Altezza | 180 cm | Modificabile, unità esplicita |
| Peso iniziale | 100 kg | Baseline dichiarata, senza inventare una data di misurazione |
| Attività | Bassa | Modificabile |
| Obiettivo | Perdita di peso | Nessuna scadenza o peso finale confermato |
| Regime | Onnivoro | Modificabile |
| Alimenti esclusi | Tartufo | Valido anche per ingredienti delle ricette |
| Pasti | 5 al giorno | Slot iniziali: colazione, spuntino mattutino, pranzo, spuntino pomeridiano, cena |

Tutti questi valori saranno modificabili nelle impostazioni e inizializzati una volta nei dati di configurazione, mai usati come costanti nei calcoli o nella UI. La configurazione iniziale usa esattamente cinque pasti. Una modifica esplicita del numero richiede scegliere le occasioni e il loro ordine; il modello conserverà la configurazione nei piani storici, senza riscriverli. Il dettaglio UX implementato è descritto in FRONTEND.

## Casi d'uso e requisiti confermati

- Consultare la Dashboard: peso iniziale/corrente, variazione totale, andamento, calorie e macronutrienti della giornata, confronto con pianificato e accesso rapido a Oggi.
- Consultare Menù per giorno, settimana e mese. Con il profilo iniziale ogni giorno pianificato contiene cinque occasioni, con alimenti/ricette, quantità, calorie/macronutrienti stimati, note e sostituzioni; eventuali modifiche esplicite del numero valgono per nuovi piani.
- Registrare nel Diario data, piano previsto, alimenti e quantità realmente consumate, eventuale peso, attività, fame/energia/umore opzionali e note libere.
- Ricostruire una data passata con il menù allora pianificato, il peso se inserito e i consumi registrati, anche dopo modifiche al catalogo o al menù.
- Gestire alimenti e ricette con provenienza dei nutrienti e indicazione delle stime.
- Modificare profilo, esclusioni e obiettivi eventualmente inseriti dall'utente; creare e ripristinare backup locali documentati.

## Regole di business

1. Pianificato, consumato e obiettivo sono grandezze distinte, con unità (`kcal`, `g`, `kg`, `cm`). Fibre assenti in fonte sono sconosciute, non zero.
2. Calorie e macro derivano da quantità e valori di fonte; non imporre che calorie dichiarate coincidano con una formula dai soli macronutrienti.
3. Nessuna voce registrata non equivale a consumo zero: diario aperto o non compilato deve essere riconoscibile. Nessun peso misurato non equivale a peso invariato.
4. Il peso corrente è l'ultima misurazione disponibile alla data selezionata e ne mostra la data; in assenza di misurazioni mostrare solo la baseline dichiarata, senza definirla misurazione corrente.
5. Una modifica del piano genera una revisione. Il diario mantiene il riferimento alla revisione prevista; aggiornare tale riferimento richiede un'azione esplicita.
6. Il tartufo e le altre esclusioni impostate non compaiono nelle proposte, neppure attraverso ricette. Un consumo reale può contenere un alimento escluso: registrarlo resta possibile, senza giudizi.
7. Non proporre un piano definitivo durante il bootstrap. Successivamente distinguere un menù dimostrativo da uno verificato per il profilo; esempi di test devono essere fittizi.
8. L'aderenza è un confronto descrittivo sui dati disponibili. Prima di una percentuale definire formula, denominatore e gestione dei dati incompleti in GATE 05; non ricavare giudizi sanitari.
9. Cancellazione e importazione sostitutiva richiedono una conferma che descriva l'effetto concreto. Nessuna gamification punitiva, colpa o promessa di risultati.

## Confini nutrizionali

Calorie, macronutrienti e futuri fabbisogni sono stime con fonte e metodo dichiarati. Nessuna prescrizione clinica. In presenza di patologie, farmaci, allergie, disturbi alimentari o esigenze cliniche, il prodotto invita al confronto con un medico o dietista. Queste informazioni non vanno presunte né raccolte se non necessarie.

Non è confermato un obiettivo calorico o di macronutrienti. Non inventare sesso biologico, condizioni cliniche, allergie, preferenze aggiuntive o velocità di dimagrimento. Il bootstrap non sceglie formule energetiche né valori nutrizionali per un piano personale.

## Terminologia

| Termine | Significato |
| --- | --- |
| Alimento | Elemento del catalogo con nutrienti riferiti a una quantità base |
| Ricetta | Ingredienti quantificati e resa finale dichiarata |
| Occasione alimentare | Slot configurato della giornata; cinque nella configurazione iniziale |
| Pasto pianificato | Voci previste per una data/slot in una revisione di menù |
| Voce consumata | Registrazione effettiva indipendente dal piano |
| Diario | Contenitore unico per una data locale, con consumi e informazioni opzionali |
| Obiettivo | Target opzionale inserito consapevolmente, distinto da piano e consumo |
| Snapshot | Dati di fonte e conversione congelati per ricostruire una registrazione |

## Assunzioni reversibili e informazioni mancanti

- Browser moderno su PC; layout responsive su smartphone. Persistenza separata per dispositivo, nessuna sincronizzazione implicita.
- Gestione manuale di menù e catalogo nella prima release; generazione automatica e acquisto di database alimentari non sono decisi.
- GATE 02 usa catalogo manuale senza dataset preinstallato, fonti obbligatorie, porzioni con conversioni dichiarate e resa ricette esplicita; scelte in ADR-005.
- Accesso del telefono al servizio sul PC, eventuale modalità offline dopo chiusura del server e cifratura dei backup richiedono scelte esplicite prima della release.

## Non-obiettivi della prima release

Funzioni social, account multipli, sincronizzazione cloud, integrazioni sanitarie, prescrizioni, scansione automatica dei pasti, API esterne obbligatorie. CSV è un'estensione futura; backup JSON completo è previsto per GATE 06.
