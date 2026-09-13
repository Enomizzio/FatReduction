# FATREDUCTION — Mappa operativa

Il repository è la memoria del progetto. Non dipendere dalla cronologia della chat.

## Prima di lavorare

1. Leggere questo file, [docs/INDEX.md](docs/INDEX.md) e [docs/PROJECT_STATUS.md](docs/PROJECT_STATUS.md).
2. Individuare il Current Gate nello stato e leggere il relativo file in `docs/gates/`.
3. Leggere solo i documenti pertinenti, usando INDEX come mappa; ispezionare codice e configurazioni esistenti.
4. Pianificare il lavoro nel perimetro autorizzato, implementare, validare e aggiornare documentazione e stato insieme al codice.

## Workflow a Gate

- I Gate sono sequenziali. Il Gate attivo è indicato esclusivamente in PROJECT_STATUS, che deve concordare con il suo documento.
- Un Gate `NOT STARTED` inizia soltanto su richiesta esplicita. Il completamento di un Gate non autorizza automaticamente il successivo.
- Evitare funzioni di Gate futuri, salvo una dipendenza strettamente necessaria e documentata.
- Stati: `NOT STARTED`, `IN PROGRESS`, `BLOCKED`, `COMPLETED`.
- Risultati: `NOT EVALUATED`, `PASS`, `FAIL`, `BLOCKED`. `FAIL` mantiene lo stato `IN PROGRESS`.
- Assegnare `COMPLETED` e `PASS` solo dopo tutti i criteri obbligatori, controlli richiesti superati, documentazione coerente e nessuna regressione bloccante. Motivare ogni verifica non applicabile; non dichiararla eseguita.
- Registrare blocchi esterni sia nel Gate sia nello stato. Aggiornare Gate, PROJECT_STATUS, documenti interessati e DECISIONS per decisioni importanti.
- Usare checkpoint Git significativi al completamento, senza riscrivere la cronologia né includere modifiche estranee. Non inventare identità Git se manca la configurazione.

## Regole di prodotto e dati

- Interfaccia in italiano, accessibile, utilizzabile su schermi piccoli; dati locali, senza backend, account o cloud obbligatori nella prima release.
- Profilo modificabile; valori iniziali in PRODUCT sono dati di configurazione. Nessun piano alimentare definitivo nel bootstrap.
- Pianificato e consumato sono entità distinte. Conservare revisioni e snapshot necessari a ricostruire il passato; non duplicare riepiloghi derivabili.
- Calorie e fabbisogni sono stime con fonte; nessuna prescrizione clinica, promessa o giudizio morale. Non presumere informazioni personali mancanti.
- Niente segreti, backup personali o log alimentari reali nel repository. Conferma esplicita nell'app prima della cancellazione dei dati o di un import sostitutivo.

## Controlli

- Ora: `powershell -NoProfile -ExecutionPolicy Bypass -File scripts/Validate-Documentation.ps1` (policy limitata a quel processo).
- Comandi applicativi futuri e Definition of Done: [docs/TESTING.md](docs/TESTING.md). Verificare quelli realmente presenti nel `package.json` prima di usarli.
- Preservare il prompt originale `FATAREDUCTION_codex_bootstrap.md`. Stato attuale e prossima attività devono essere comprensibili dai file del repository.
