# FATREDUCTION

Applicazione web locale, in italiano, per consultare un menù, registrare consumi effettivi e peso e seguire calorie, macronutrienti e progressi. La prima release è per un singolo utente, senza account o servizio cloud obbligatorio. Le informazioni nutrizionali saranno stime: l'app non sostituisce un medico o un dietista.

## Stato

GATE 01 e 02 completati: app locale con sei aree, profilo modificabile, catalogo alimenti/ricette e calcoli nutrizionali, persistiti in IndexedDB. Stato operativo in [PROJECT_STATUS](docs/PROJECT_STATUS.md). Menù, diario, dashboard e backup appartengono ai Gate successivi.

## Avvio locale

Richiede Node 24.15 o successivo della serie 24; verificato con npm 12.0.2. Da PowerShell nella radice:

```powershell
npm.cmd ci
npm.cmd run dev
```

Aprire `http://127.0.0.1:5173`. Usare sempre questo indirizzo: host, protocollo e porta identificano l'archivio; localhost ha dati separati. Porta fissa con strictPort, nessuna apertura LAN. Build: `npm.cmd run build`, poi `npm.cmd run preview` dopo aver fermato dev. Preview usa la stessa origine. `file://` non è supportato; nessuna risorsa remota obbligatoria a runtime.

## Riprendere il progetto

Leggere [AGENTS.md](AGENTS.md), [indice](docs/INDEX.md), [stato](docs/PROJECT_STATUS.md) e il documento del Gate attivo. Il file originale [FATAREDUCTION_codex_bootstrap.md](FATAREDUCTION_codex_bootstrap.md) è preservato come specifica di origine; non sostituisce lo stato aggiornato.

Prompt per la prossima chat:

> Continua il progetto FATREDUCTION lavorando esclusivamente sul Gate attivo. Prima di modificare file leggi AGENTS.md, docs/INDEX.md, docs/PROJECT_STATUS.md e il documento del Gate attivo, poi ispeziona l'implementazione e i documenti pertinenti. Implementa, valida e svolgi la Gate Review; aggiorna Gate, stato e documentazione. Non sviluppare Gate futuri.

## Struttura

```text
AGENTS.md                         Regole operative
FATAREDUCTION_codex_bootstrap.md   Prompt originale preservato
docs/                             Specifiche, decisioni e stato
docs/gates/                       Template e Gate 00–06
scripts/Validate-Documentation.ps1 Controllo documentale eseguibile
src/                              UI, dominio, servizi e storage
tests/                            Test unitari, integrazione e browser
package.json / package-lock.json   Script e dipendenze fissate
.gitignore                        Esclusioni, inclusi backup personali
.gitattributes                    Formato dei file di testo
```

## Verifica disponibile

Da PowerShell nella radice:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/Validate-Documentation.ps1
```

ExecutionPolicy vale solo per questo processo. Comandi applicativi e verifiche in [TESTING](docs/TESTING.md).

## Dati e utilizzo locale

La persistenza prevista risiede nel browser e dipende da origine, profilo e dispositivo: cancellare i dati del sito può perdere lo storico. Un layout responsive permette l'uso su smartphone, ma non sincronizza i dati del PC. Backup e importazione saranno implementati in GATE 06; rischi e vincoli sono in [SECURITY](docs/SECURITY.md).
