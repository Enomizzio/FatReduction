# Modello dati iniziale

## Stato e convenzioni

Profilo implementato in GATE 01; Food, Recipe, fonti, quantità e snapshot in GATE 02; piani, revisioni, pasti e selezioni in GATE 03. Entità GATE 04–06 ancora pianificate. Schema verificabile in domain/profile, domain/nutrition, domain/menu e storage/database.

- `Id`: UUID stringa, generato localmente. `LocalDate`: data gregoriana reale `YYYY-MM-DD`, senza conversione automatica a UTC. `Instant`: timestamp ISO 8601 UTC per audit tecnico, non per decidere il giorno alimentare.
- `number`: finito, mai `NaN`/infinito. Quantità positive, nutrienti non negativi. Precisione mantenuta nei calcoli, arrotondamento solo in presentazione.
- `null`: sconosciuto/non impostato; array vuoto: nessuna voce. Non confondere dati mancanti e zero.
- Stringhe di nome 1–200 caratteri; note massimo 5.000; ID massimo 64. Questi limiti sono scelte iniziali reversibili, identiche in UI, dominio e import.
- Record mutabili: `createdAt`, `updatedAt` di tipo Instant. Record immutabili: `createdAt`. Date future non sono misurazioni o consumi validi; sono ammesse nei piani.
- Integrità dei riferimenti applicativa: IndexedDB non impone foreign key. Ogni modifica/import controlla riferimenti, unicità e invarianti in transazione.

## Tipi condivisi

| Tipo | Campi e unità | Validazioni |
| --- | --- | --- |
| Nutrients | `energyKcal`, `proteinG`, `carbohydrateG`, `fatG`: number; `fiberG`: number/null | Finiti e >= 0. Fibre sconosciute restano null. Calorie di fonte indipendenti dalla somma dei macro |
| Quantity | `amount`: number; `unit`: `g`/`ml`/`portion`; `basisUnit`: `g`/`ml`; `conversionToBasis`: number; `conversionSource`: string/null | Valori > 0; basisUnit uguale allo snapshot. Fattore 1 per stessa unità, altrimenti conversione solo con fattore e fonte espliciti. Conversione non disponibile impedisce il calcolo |
| NutritionSource | `kind`: `label`/`database`/`manual`/`calculated`; `reference`: string; `url`: string/null; `retrievedAt`: LocalDate/null; `isEstimate`: boolean | Provenienza obbligatoria; URL solo http/https, senza recupero automatico; dati manuali identificati come stime |
| NutritionSnapshot | `catalogId`: Id/null; `catalogRevision`: integer/null; `displayName`: string; `basisAmount`, `basisUnit`; `nutrients`: Nutrients; `source`: NutritionSource; `excludedIngredientKeys`: string[] | Snapshot immutabile con base > 0; quantità riferite alla stessa base. Copia della fonte e ingredienti necessari a verifica esclusioni |
| MealSlot | Chiave stringa 1–64; iniziali `breakfast`, `morningSnack`, `lunch`, `afternoonSnack`, `dinner` | Etichette italiane e ordine nella configurazione; unica occasione per slot/data/revisione |
| MealSlotDefinition | `key`: MealSlot; `label`: string | Chiavi uniche, etichette non vuote; l'ordine dell'array è quello dei pasti |

Per una voce: nutrienti = nutrienti snapshot × quantità convertita / quantità base. La quantità memorizza il fattore usato, così una successiva conversione del catalogo non modifica lo storico.

In GATE 02 catalogId/catalogRevision sempre presenti per snapshot da catalogo; caso manuale senza catalogo futuro. Snapshot ricetta aggiunge `ingredientSnapshots?: {snapshot: FoodSnapshot, quantity: Quantity}[]`, copie senza ricette annidate per conservare tutte le fonti/conversioni. Calcoli rifiutano overflow non finiti. URL massimo 2.000 caratteri; chiavi ingredienti/esclusioni massimo 100, porzioni massimo 20 con etichette uniche, ingredienti ricetta massimo 100 (limiti tecnici). Dati manuali richiedono isEstimate=true; UI marca stimate anche trascrizioni etichette/database.

## UserProfile — GATE 01

| Campo | Tipo / unità | Regola |
| --- | --- | --- |
| id | Id | Un solo profilo per database |
| ageYears | integer, anni | 18–120; iniziale 40, aggiornato manualmente senza inventare nascita |
| heightCm | number, cm | > 0 e <= 300; iniziale 180, limite tecnico non sanitario |
| initialWeightKg | number, kg | > 0 e <= 500; iniziale 100, baseline dichiarata |
| initialWeightDate | LocalDate/null | Non inventare la data della baseline |
| activityLevel | `low`/`moderate`/`high` | Iniziale low |
| goal | `weightLoss`/`maintenance` | Iniziale weightLoss; nessun target implicito |
| diet | `omnivore`/`vegetarian`/`vegan` | Iniziale omnivore; supporto alle proposte da definire quando necessario |
| excludedFoodKeys | string[] | Chiavi normalizzate uniche; iniziale `truffle`, etichetta tartufo |
| mealSlots | MealSlotDefinition[] | Configurazione modificabile; inizialmente i cinque slot confermati. Limite tecnico iniziale 1–10 occasioni |
| mealsPerDay | integer, derivato non persistito | Numero desiderato mostrato/modificato nelle impostazioni tramite configurazione di mealSlots; iniziale 5 |
| dailyTargets | Nutrients/null | Iniziale null; eventuali valori sono inseriti dall'utente, mai derivati dal profilo in questo Gate |
| createdAt, updatedAt | Instant | Persistiti, validi e ordinati |

Non inserire automaticamente la baseline in BodyMeasurement. Cambiare la baseline cambia il confronto totale e richiede UI chiara; non riscrive le misurazioni storiche.

## BodyMeasurement — GATE 04

`id: Id`, `profileId: Id`, `date: LocalDate`, `weightKg: number (>0, <=500)`, `notes: string/null`, `createdAt/updatedAt: Instant`. Relazione al profilo; indice unico `(profileId, date)`. Una misurazione del peso per giorno nella prima release, aggiornabile esplicitamente. Nessuna misura fittizia nei giorni mancanti; altre misure corporee non sono ancora previste.

## Food — GATE 02

`id: Id`, `revision: integer >=1`, `name: string`, `normalizedIngredientKeys: string[]`, `basisAmount: number >0` (normalmente 100), `basisUnit: g/ml`, `nutrients: Nutrients`, `source: NutritionSource`, `portionConversions: {label: string, basisQuantity: number >0, source: string}[]`, `archived: boolean`, `createdAt/updatedAt: Instant`.

Ogni modifica incrementa revision. L'identità degli ingredienti supporta le esclusioni; il solo confronto del nome non basta. Fonti non note richiedono dichiarazione manuale stimata, mai provenienza inventata. Archiviare un alimento usato conserva i riferimenti; snapshot storici non vengono aggiornati.

Il servizio integra nome e alias tartufo/tartufi nelle chiavi. Per prodotti composti l'utente dichiara gli ingredienti nell'app. Nessun catalogo iniziale o dato alimentare di terzi incluso.

## Recipe — GATE 02

`id: Id`, `revision: integer >=1`, `name: string`, `ingredients: RecipeIngredient[]`, `yieldAmount: number >0`, `yieldUnit: g/ml`, `instructions: string/null`, `archived: boolean`, `createdAt/updatedAt: Instant`.

`RecipeIngredient`: `id: Id`, `foodId: Id`, `snapshot: NutritionSnapshot`, `quantity: Quantity`. Almeno un ingrediente; solo Food, nessuna ricetta annidata o ciclo nella prima release. Somma degli ingredienti e resa dichiarata determinano i nutrienti per base; non aggiungere fattori di cottura o ritenzione inventati. Le fonti rimangono ricostruibili dagli snapshot; gli ingredienti esclusi si propagano alle proposte. Totali ricetta calcolati, non salvati come seconda verità.

## MenuPlan e MenuPlanRevision — GATE 03

- `MenuPlan`: `id: Id`, `profileId: Id`, `title: string`, `startDate/endDate: LocalDate`, `currentRevisionId: Id`, `archived: boolean`, `createdAt/updatedAt: Instant`. Intervallo ordinato; ogni data prevista è inclusa nell'intervallo.
- `MenuPlanRevision`: `id: Id`, `menuPlanId: Id`, `revisionNumber: integer >=1`, `mealSlotsSnapshot: MealSlotDefinition[]`, `createdAt: Instant`, `changeNote: string/null`. Unico `(menuPlanId, revisionNumber)`, immutabile dopo salvataggio; snapshot delle occasioni per non riscrivere lo storico quando cambiano le impostazioni.
- `PlannedMeal`: `id: Id`, `revisionId: Id`, `date: LocalDate`, `slot: MealSlot`, `items: PlannedItem[]`, `notes: string/null`, `substitutions: PlannedItem[]`. Unico `(revisionId, date, slot)`; tutti e soli gli slot della revisione per giorno, esattamente cinque nella configurazione iniziale. Gli slot vuoti sono esplicitamente da compilare, non menù definitivi.
- `PlannedItem`: `id: Id`, `kind: food/recipe`, `catalogId: Id`, `snapshot: NutritionSnapshot`, `quantity: Quantity`. Quantità calcolabile, fonte e snapshot richiesti. Le sostituzioni restano opzioni e non sommano ai totali del piano.
- `DayPlanSelection`: `id: Id`, `profileId: Id`, `date: LocalDate`, `revisionId: Id`, `createdAt/updatedAt: Instant`. Unico `(profileId, date)`; selezione esplicita in caso di piani sovrapposti.

Modificare un piano crea una nuova revisione. La selezione futura può cambiarla esplicitamente; un diario già associato mantiene la precedente. Una revisione referenziata non può essere cancellata fisicamente senza un'operazione coerente e confermata.

Implementazione GATE 03: creazione di uno o sette giorni consecutivi; titolo e intervallo del piano non cambiano nelle revisioni. Massimo 100 voci e 100 alternative per pasto. Nuove revisioni richiedono gli slot attuali del profilo: se un'occasione rimossa contiene voci/note, spostarle o rimuoverle dalla bozza prima di applicare la configurazione; la revisione salvata resta conservata. Selezione sempre esplicita, anche con un solo piano; salvare una revisione non cambia le selezioni esistenti. Alternative possono sostituire una voce scelta o aggiungersi esplicitamente; solo allora entrano nei totali. Fonti storiche autentiche e catalogo aggiornato verificati in transazione; voci già presenti possono mantenere fonti archiviate.

## DailyDiary — GATE 04

`id: Id`, `profileId: Id`, `date: LocalDate`, `plannedRevisionId: Id/null`, `mealSlotsSnapshot: MealSlotDefinition[]`, `status: open/complete`, `activity: {description: string, durationMinutes: number/null}[]`, `hunger/energy/mood: integer 1–5/null`, `notes: string/null`, `createdAt/updatedAt: Instant`.

Unico `(profileId, date)`; diario assente, aperto e completo sono distinti. `plannedRevisionId` deve includere la data e resta congelato finché l'utente non sceglie esplicitamente un'altra revisione. Slot del diario copiati dalla revisione, o dal profilo se manca il piano; un cambio esplicito del piano non elimina slot con consumi già presenti. Attività con descrizione non vuota e durata opzionale >0 e <=1.440 minuti, senza stima automatica di calorie bruciate. Peso collegato mediante profilo/data, non duplicato nel diario. Fame/energia/umore sono descrittivi, mai punteggi clinici.

## ConsumedEntry — GATE 04

`id: Id`, `diaryId: Id`, `slot: MealSlot`, `catalogId: Id/null`, `kind: food/recipe/manual`, `snapshot: NutritionSnapshot`, `quantity: Quantity`, `plannedItemId: Id/null`, `consumedAt: Instant/null`, `notes: string/null`, `createdAt/updatedAt: Instant`.

Molte voci per diario; slot presente nella configurazione storica del diario. Riferimento al pianificato opzionale e valido solo nella revisione associata; copiare dal piano crea una voce indipendente ed editabile. Una voce manuale richiede base, nutrienti e fonte manuale esplicita. I consumi non sono limitati dal piano o dalle esclusioni. L'ora non sposta automaticamente la LocalDate scelta dall'utente.

## Dati derivati — GATE 02/05

Riepiloghi di pasto/giorno/settimana, calorie e macro pianificati/consumati, andamento del peso e variazione sono calcolati sulle entità canoniche. Nessuna duplicazione persistita; eventuali cache richiedono ADR, invalidazione e versione dell'algoritmo.

Le fibre aggregate sono `null` se almeno una voce ha fibre sconosciute; eventualmente mostrare un subtotale noto chiaramente etichettato. Un totale completo zero è possibile solo con diario segnato completo e nessuna voce. Un periodo incompleto non diventa un totale giornaliero affidabile. L'aderenza sarà specificata in GATE 05 prima di essere implementata.

## Persistenza e migrazioni

Database `fatreduction`, versione 1 (GATE 01): store `profiles`, keyPath `id`. Unico profilo inizializzato in transazione readwrite, validato anche in lettura; numero pasti derivato. `dailyTargets` resta null. Nessuno store meta necessario: versione nativa IndexedDB. Scritture profilo confrontano `updatedAt` contro conflitti tra schede. Upgrade versionati additivi, nessun reset silenzioso; errori versione futura e timeout apertura bloccata comunicati. Store delle altre entità pianificati; contratto backup in [API](API.md).

Versione 2 (GATE 02): mantiene profiles e aggiunge foods/recipes (keyPath id), foodRevisions/recipeRevisions (keyPath composto [id, revision]). Revisioni come copie immutabili dei record validati; createdAt resta la creazione dell'entità, updatedAt indica la revisione. Testa e revisione atomiche, rollback verificato con collisione nello storico. Ricette con ingredienti/snapshot, resa e istruzioni, mai nutrienti totali persistiti. Riferimenti ai foodRevisions verificati in transazione; archiviazione reversibile incrementa revision.

Versione corrente 3 (GATE 03): aggiunge menuPlans, menuPlanRevisions, plannedMeals e dayPlanSelections, tutti con keyPath id. Indici unici rispettivamente sulle revisioni [menuPlanId, revisionNumber], sui pasti [revisionId, date, slot], sulle selezioni [profileId, date]. Testa/revisione/pasti salvati atomicamente, revisione attesa e updatedAt della selezione contro conflitti. Nessuno store dei Gate futuri.
