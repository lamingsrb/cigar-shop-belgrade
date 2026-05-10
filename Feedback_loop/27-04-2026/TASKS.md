# Taskovi — Anin feedback, 27. april 2026.

Lista izvedena iz `FEEDBACK.md` (veliki update, 13 stavki + naknadna 14.
za rename gear kategorija). Pratiti redosled faza A → E iz feedback fajla.

> **Status legenda:** `[x]` urađeno · `[ ]` na čekanju · `[~]` delimično /
> super-seded.

---

## Faza A — Hero, loader, kursor, copy

### 1. Loader — bez šibice i bez teksta

- [x] Stranica se učitava odmah, bez match-strike animacije.
- [x] Bez "Strike a match." / "Zapali šibicu." tagline-a.

### 2. "CIGAR SHOP" tipografija i boja

- [x] **Puna zlatna boja** (bez gradijenta) — `--champagne #d4af37`.
- [x] Font čitljiviji ali još uvek lep, usklađen sa logoom.
- [x] Isto za "Tobacco and Drinks" subtitle.

### 3. Logo redizajn

- [x] **Pun zlatan monogram** (jedna boja kroz ceo monogram).
- [x] Kasnije refinisan još jednom 09-05-2026 — finalno preko CSS mask
  pristupa (`background-color: var(--champagne)` + `mask-image: url(logo)`)
  za **identičnu** boju kao hero wordmark.

### 4. Hero — ukloniti "Zapali iskustvo"

- [x] Scroll link "Zapali iskustvo" obrisan.

### 5. Hero slajdovi 2 i 3

- [x] **Slajd 2:** "Posetite nas na 5 lokacija" + 5 adresa prodavnica.
- [x] **Slajd 3:** sav tekst uklonjen — samo video.

### 6. Hero — modern man video

- [x] Generisano preko PixVerse: moderni čovek u odelu, cigara u ruci
  (bez dima), čaša pića. Loop, primarno vidljiv, bez crnog overlay-a, bez
  teksta.

## Faza B — Section reorder + Library minimal

### 7. Humidor ↔ Library swap

- [x] Trenutni redosled: **Humidor prvo, pa "Godine tišine".**

### 8. Library: ukloniti tekst, full-bleed video kompilacija

- [x] Sav tekst osim naslov + podnaslov uklonjen.
- [x] Cela površina pokrivena video kompilacijom + animativni slajdovi
  slika.

### 9. Cigar brand division → Humidor section

- [x] Brand-tabs + grid premešten na **kraj Humidor sekcije**.
- [x] Podela na **2 grupe**: **Kuba** i **Novi svet**.
- [x] (Posle 09-05-2026 ovo je ponovo refaktorisano: tab-showcase
  zamenjen klikabilnim region-cards koje vode na detail page-ove.)

### 10. Brand UX

- [x] Slajd-galerija logoa + slajd-galerija proizvoda po brendu (auto-
  advance, moderno, lepo dizajnirano).

## Faza C — Spirits + Gear redesign

### 11. Spirits redizajn

- [x] Rename: "Pića" / "Tečni prijatelji dima" → **"Nastavi sa pićem"**.
- [x] Podele: **Viski / Burbon / Džin / Konjak / Rum / Rakija** (6 grupa).
- [x] Klik na grupu → kratka rečenica + slajd sa slikama vrsta.
- [x] (Posle 09-05-2026 isto refaktorisano: tab-showcase zamenjen region-
  cards koje vode na detail page-ove.)

### 12. Gear: rename "Sekači" + "Futrole"

- [x] **"Rezači" → "Sekači"** (refaktorisano u JSON i locales).
- [x] **"Putni etui" → "Futrole"** (refaktorisano).
- [x] Ostali nazivi (Upaljači / Humidori / Pepeljare) ostaju.

## Faza D — Blogovi

### 13. 10 blog postova — original copy

- [x] **10 postova** napisano u `public/data/blog.json`:
  1. Kolumbo i prvi dim Evrope (1492)
  2. Cohiba — cigara rezervisana samo za Fidela (1966)
  3. Vinston Čerčil i Romeo y Julieta (1948)
  4. Embargo i veliko bekstvo kubanskih dinastija (1962)
  5. Torcedor — zanat koji se uči pet godina (1810)
  6. Humidor — nauka 70 odsto (1895)
  7. Vitola — anatomija formata (1492)
  8. Vuelta Abajo — zlatna zemlja duvana (1843)
  9. Od lista do pepela — 47 koraka (1847)
  10. (varies — Ana može da pokrije i 10. ako želi)

### 14. Blog showcase sekcija pre Contact

- [x] Auto-advance horizontal rail sa preview kartice.

### 15. Blog stranica (route)

- [x] `/blog.html` sa svim postovima u dugačkoj listi.

### 16. Nav link

- [x] "Blog" link dodat u glavnu nav (header) i footer.

## Faza E — Galerija + finalni build

### 17. Galerija 9 → 6 vidljivih

- [x] `gallery-pages.js` konfigurisan sa `itemsPerPage: 6` (umesto 9).
- [x] Slike veće, animativnije.

### 18. Build + deploy

- [x] `npx vercel --prod` deploy.

---

## Asseti koji su čekali (status posle dolaska)

- [x] **Modern man video** — generisano preko PixVerse.
- [x] **Brand logoi** za Kubu i Novi svet — koristimo postojeće u
  `gallery/` slikama jer klijent nema čiste pakete; tekstualne kartice
  funkcionišu.
- [x] **Single-color full-gold logo** — postignuto kombinacijom pixel
  recolor (sharp) + CSS mask (09-05-2026 final fix).
