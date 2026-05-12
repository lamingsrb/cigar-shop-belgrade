# Taskovi — feedback od Ane (MyCase tim), 11. maj 2026.

Pristigli su nam Anini autorski tekstovi za većinu sekcija sajta (3 word
dokumenta), kao i zahtev za coming-soon stranicu na produkcijskom domenu
dok ne završimo finalizaciju.

> **Status legenda:** `[x]` urađeno · `[ ]` na čekanju · `[~]` delimično.

---

## Izvor

- **Materijal:**
  - [`TEKST ZA SAJT.docx`](TEKST%20ZA%20SAJT.docx)
  - [`TEKST ZA sekcije na sajtu.docx`](TEKST%20ZA%20sekcije%20na%20sajtu.docx)
  - [`Kompletan text sa delom z astari i  novi svet.docx`](Kompletan%20text%20sa%20delom%20z%20astari%20i%20%20novi%20svet.docx)

---

## 1. Tekstovi za 4 osnovne sekcije (TEKST ZA sekcije na sajtu.docx)

- [x] **Humidor** — nov lead/body o prostoru gde vreme usporava, dva sveta
  na policama, cigare koje ne traže pažnju vec je uzmu.
  - Ažurirano u `public/locales/sr.json` i `en.json` (`humidor.lead` +
    `humidor.body`).
- [x] **Nastavi sa pićem** — nov lead/body o piću koje prati dim bez
  nadmetanja, balansu ukusa, trenutku kada se sve slaže.
  - Ažurirano u `spirits.lead` + `spiritsProcess.body1/body2`.
- [x] **Alati rituala** — nov lead/body o alatima (ne dodacima!) koji
  zaokružuju ritual, sekači, upaljači, humidori, pepeljare, futrole.
  - Ažurirano u `gear.lead` + `gearProcess.body1/body2`.
- [x] **Godine tišine** — produžen lead u Aninom autorskom stilu — sve
  počinje pre prvog dima, listovi koji su odležali, znanje bez žurbe.
  - Ažurirano u `gallery.lead` (i naslov u `gallery.title` proširen
    na "Godine tišine za trenutak uživanja.").

## 2. Coming-soon stranica za cigarshop.rs

Cilj: dok se finalizuje sadržaj, posetioci na produkcijskom domenu
treba da vide elegantnu poruku „Sajt u izradi". Razvojni tim i dalje ima
pun pristup pravom sajtu preko vercel.app linka.

- [x] Kreirana `public/coming-soon.html` — samostalna stranica sa istim
  brendingom (zlatni monogram + champagne wordmark + animirane zlatne
  čestice + 18+ napomena u footeru).
- [x] **Vercel Edge Middleware** (`middleware.js` u rootu) detektuje
  hostname:
  - `cigarshop.rs` / `www.cigarshop.rs` → interni rewrite na
    `/coming-soon.html` (URL u browseru ostaje `cigarshop.rs/...`).
  - `*.vercel.app` → pass-through na pravi sajt (preview je intaktan).
- [x] `meta robots="noindex, nofollow"` — Google ne indeksira coming-soon.
- **Tehnička napomena:** prvo je probano sa `vercel.json` rewrites uz
  `has` host condition + negative lookahead — nije pouzdano radilo. Pure
  Web API middleware sa `x-middleware-rewrite` header-om radi savršeno.

## 3. Tekstovi za "Tvoj izbor, naš svet" + STARI / NOVI SVET (Kompletan text...)

### 3a. Manifest sekcija „Tvoj izbor, naš svet"

- [x] **Lead** — nov: "Cigar Shop je maloprodajni lanac specijalizovan za
  premium cigare, vrhunska pića i luksuznu opremu za cigare, sa radnjama
  na pet ekskluzivnih lokacija."
- [x] **Body** — kompletan Anin autorski opis o sofisticiranom životnom
  stilu, individualnom pristupu, ritualu / stilu / iskustvu.
- Srpski i engleski (`public/locales/sr.json` + `en.json`).

### 3b. Rename Kuba → STARI SVET

- [x] **Naziv kartice** u Humidor sekciji: "Kuba" → "Stari svet".
- [x] **Locale ključ** `regions.cuba` → `regions.oldworld` (sa value
  "Stari svet" / "Old World").
- [x] **HTML `data-i18n`** atribut + `href` "/category.html#cuba" →
  "#oldworld" u [index.html](../../index.html).
- [x] **Backward-compat redirect** u `js/category-page.js` —
  stari bookmark sa `#cuba` se i dalje rezoluje na Stari svet stranicu.
- [x] **`categories.json`** ključ `cuba` → `oldworld` (sadržaj zadržan
  + zamenjen Aninom verzijom).

### 3c. Detail strana STARI SVET

- [x] **Naslov:** "Stari svet — tradicija, nasleđe i autentično umeće."
- [x] **Body:** Anin autorski tekst — bogate arome, sofisticiran balans
  ukusa, generacijsko umeće. Lista brendova: **COHIBA, MONTECRISTO,
  PARTAGAS, ROMEO y JULIETA, HOYO DE MONTERREY, H. UPMANN, BOLIVAR**.

### 3d. Detail strana NOVI SVET

- [x] **Naslov:** "Novi svet — savremen pristup i kreativnost."
- [x] **Body:** Anin autorski tekst — savremen pristup, inovacija, širok
  spektar aroma. Države: Dominikanska Republika, Nikaragva, Honduras.
  Lista brendova: **ARTURO FUENTE, DAVIDOFF, ROCKY PATEL, HORACIO,
  J. C. NEWMAN, DREW ESTATE, CASA TURENT**.

---

## Naredni koraci (čeka se od MyCase tima)

- [ ] **Slike po sekcijama** — fotografije humidora, pića, opreme,
  atmosfere prodavnica, koje će biti raspoređene po dogovoru.
- [ ] **Video po sekcijama** — kratki klipovi iz radnji, humidora,
  atmosfere — biraju se po dogovoru.
- [ ] Eventualne dodatne korekcije postojećih tekstova (ako Ana ima
  novu rundu).
