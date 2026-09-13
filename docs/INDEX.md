# Indice della documentazione

Questo indice è una mappa, non una copia delle specifiche. Iniziare sempre da AGENTS e PROJECT_STATUS, poi leggere il Gate attivo.

| File | Contenuto | Quando leggerlo |
| --- | --- | --- |
| [AGENTS](../AGENTS.md) | Protocollo operativo e limiti dei Gate | Prima di ogni attività |
| [README](../README.md) | Presentazione, struttura e ingresso al progetto | Primo accesso e avvio locale |
| [Prompt originale](../FATAREDUCTION_codex_bootstrap.md) | Richiesta iniziale preservata | Per verificare l'origine dei requisiti |
| [PRODUCT](PRODUCT.md) | Requisiti, profilo, regole, assunzioni e non-obiettivi | Modifiche al comportamento del prodotto |
| [ARCHITECTURE](ARCHITECTURE.md) | Sistema attuale, stack e componenti pianificati | Fondazione tecnica e dipendenze |
| [DATA_MODEL](DATA_MODEL.md) | Entità, unità, relazioni, validazioni e storico | Persistenza, calcoli, diario, importazione |
| [FRONTEND](FRONTEND.md) | Schermate, navigazione, stati e accessibilità | Qualsiasi modifica alla UI |
| [API](API.md) | Confini locali e contratto backup previsto | Servizi, repository e import/export |
| [TESTING](TESTING.md) | Comandi effettivi/futuri, livelli di test e DoD | Implementazione e Gate Review |
| [SECURITY](SECURITY.md) | Dati personali, input, import e cancellazione | Modifiche ai dati o all'esposizione dell'app |
| [DECISIONS](DECISIONS.md) | Decisioni architetturali importanti | Prima di cambiare una scelta trasversale |
| [PROJECT_STATUS](PROJECT_STATUS.md) | Stato corrente, blocchi e prossimo obiettivo | Inizio e fine di ogni attività |
| [GATE_TEMPLATE](gates/GATE_TEMPLATE.md) | Struttura obbligatoria di una specifica Gate | Creazione o revisione dei Gate |
| [GATE 00](gates/GATE_00_BOOTSTRAP.md) | Bootstrap, inventario e review documentale | Verifica delle fondamenta del progetto |
| [GATE 01](gates/GATE_01_FOUNDATION.md) | Tooling, layout, navigazione e persistenza | Prossima implementazione |
| [GATE 02](gates/GATE_02_NUTRITION.md) | Alimenti, ricette e calcoli nutrizionali | Implementazione del dominio nutrizionale |
| [GATE 03](gates/GATE_03_MENU.md) | Menù giornaliero/settimanale e cinque pasti | Pianificazione dei pasti |
| [GATE 04](gates/GATE_04_DIARY.md) | Diario, consumi effettivi e peso | Registrazione delle giornate |
| [GATE 05](gates/GATE_05_DASHBOARD.md) | Progressi, grafici e menù mensile | Visualizzazione aggregata |
| [GATE 06](gates/GATE_06_RELEASE.md) | Backup, import, hardening e release locale | Preparazione della prima release |
| [src/README](../src/README.md) | Responsabilità del futuro codice | Prima di creare i moduli |
| [tests/README](../tests/README.md) | Convenzioni del futuro albero test | Prima di aggiungere test |
| [Validatore](../scripts/Validate-Documentation.ps1) | Verifica dei documenti e dei link locali | Gate Review e aggiornamenti documentali |

Ogni documento deve distinguere ciò che esiste da ciò che è pianificato. PROJECT_STATUS descrive il presente; le decisioni durevoli vanno in DECISIONS, le prove di completamento nel Gate.
