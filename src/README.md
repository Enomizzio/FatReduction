# Codice applicativo

`app/`: shell e navigazione hash; `features/`: profilo e catalogo; `components/`: campi e dettagli nutrizionali accessibili; `domain/`: validazione e calcoli puri; `services/`: catalogo transazionale ed errori; `storage/`: IndexedDB e migrazioni. Nessun backend o storico fittizio.

GATE 03: domain/menu per date, piani e revisioni; services/menu per transazioni e selezione giornaliera; features/Menu per giorno/settimana e pianificato di Oggi; components/MealItems per quantità, fonti e scelta catalogo. Schema IndexedDB v3 additivo.

GATE 04: domain/diary per validazione, copia e subtotali; services/diary per lettura storico e transazioni atomiche diario/consumi/peso; features/Diary condivisa da Oggi e Diario. IndexedDB v4, date future rifiutate, conferme esplicite e protezione delle bozze nella shell.

Leggere [ARCHITECTURE](../docs/ARCHITECTURE.md), [DATA_MODEL](../docs/DATA_MODEL.md) e [stato](../docs/PROJECT_STATUS.md) prima di estendere i moduli.
