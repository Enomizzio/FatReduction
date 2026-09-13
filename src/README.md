# Codice applicativo

`app/`: shell e navigazione hash; `features/`: profilo e catalogo; `components/`: campi e dettagli nutrizionali accessibili; `domain/`: validazione e calcoli puri; `services/`: catalogo transazionale ed errori; `storage/`: IndexedDB e migrazioni. Nessun backend o storico fittizio.

GATE 03: domain/menu per date, piani e revisioni; services/menu per transazioni e selezione giornaliera; features/Menu per giorno/settimana e pianificato di Oggi; components/MealItems per quantità, fonti e scelta catalogo. Schema IndexedDB v3 additivo.

Leggere [ARCHITECTURE](../docs/ARCHITECTURE.md), [DATA_MODEL](../docs/DATA_MODEL.md) e [stato](../docs/PROJECT_STATUS.md) prima di estendere i moduli.
