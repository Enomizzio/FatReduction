# Test

Vitest e Testing Library: 12 test su profilo, calcoli, conversioni, fibre null, esclusioni, snapshot, revisioni, migrazione v1/v2, conflitti, rollback e recupero form su quota esaurita. fake-indexeddb con database UUID isolati. Playwright: 4 scenari Chromium in contesti puliti su navigazione, tastiera, persistenza, catalogo/ricette, archiviazione/ripristino, errori storage, contenuti HTML inerti e axe. Screenshot/trace in test-results, ignorati.

GATE 03 porta il totale a 17 test Vitest e 6 scenari Chromium: date gregoriane, settimana su cambio anno, slot storici, alternative, esclusioni alimento/ricetta, migrazione v2/v3, revisioni, selezione esplicita e rollback. Browser: creazione/modifica/reload, settimana con 35 slot, fonte immutata, quota, tastiera, axe e viewport 320 px.

GATE 04: 24 test Vitest in 5 file e 8 scenari Chromium PASS. Nuove prove su copia esplicita/idempotente, date future, stato incompleto, peso unico e conflitti, cambio previsto con slot conservati, alimenti esclusi nei consumi, migrazione v3/v4, rollback quota, conferme/annullamento, storico dopo cambio catalogo/piano, note inerti e bozze preservate. Review screenshot desktop e dettagli a 320 px.

Comandi e limiti delle verifiche in [TESTING](../docs/TESTING.md). Usare solo fixture fittizie, senza log personali.
