# Taskovi — feedback 25. maj 2026.

Zamena generičkih placeholder slika brendiranim fotografijama klijenta po
sekcijama: Humidor (Stari/Novi svet), Nastavi sa pićem (6 kategorija + glavna),
Alati rituala (5 kategorija + glavna).

> **Status legenda:** `[x]` urađeno · `[ ]` na čekanju · `[~]` delimično.

---

## 1. Sekcija — HUMIDOR (Stari svet / Novi svet)

- [x] **Stari svet kartica** — replace `/assets/categories/cuba.webp` sa
  `STARI SVET.jpg` (3399×3399 → 1600 max, WebP q85 + thumb 800×600).
- [x] **Novi svet kartica** — kreiran novi `/assets/categories/newworld.webp`
  iz `NOVI SVET.jpg` (zamenjuje `gallery/img-008.webp` referencu).
- [x] **15 novih humidor fotki** (`Humidor/1..16.jpg` minus `9.jpg`) →
  `/assets/humidor/humidor-01..15.webp`. Prvih 6 zamenjuju postojeće;
  7–15 nove. Korisni za `oldworld` i `humidors` gallery prikaze.

## 2. Sekcija — NASTAVI SA PIĆEM

Glavna slajdshow slika + 6 per-kategorija kartice:

- [x] **Glavna slika slajdshov-a** ← `glavna nastavi sa picem.jpg`
  → `/assets/spirits/spirits-pour.webp` (replace).
- [x] **Viski kartica** ← `viski.jpg` → `/assets/spirits/scotch.webp` (replace).
- [x] **Burbon kartica** — nema nove slike, zadržano `bourbon.webp`.
- [x] **Džin kartica** ← `dzin.jpg` →
  `/assets/spirits/spirits-process-1-destilacija.webp` (replace).
- [x] **Konjak kartica** ← `konjak.jpg` → `/assets/spirits/cognac.webp` (replace).
- [x] **Rum kartica** ← `rum.jpg` →
  `/assets/spirits/spirits-process-3-odlezavanje.webp` (replace).
- [x] **Rakija kartica** ← `rakija.jpg` → `/assets/spirits/rakija.webp` (replace).
- [x] **Dodatne varijacije** — `rakija 1.jpg` → `rakija-2.webp`,
  `rum 1.jpg` → `rum-2.webp` (rezervisano za buduće galerije).

## 3. Sekcija — ALATI RITUALA

Glavna slika slajdshov-a + 5 kartica + per-kategorija galerije:

- [x] **Glavna slika slajdshov-a** ← `Oprema glavna slika.jpg`
  → `/assets/gear/gear-ritual.webp` (replace).
- [x] **Sekači kartica** — novi `/assets/gear/cutters-card.webp` (zamenjuje
  `vitrine-01.webp` referencu). + 10 novih galerijskih fotki u
  `/assets/gear/cutters/01..10.webp`.
- [x] **Upaljači kartica** — nema novih slika, zadržano `vitrine-02.webp`.
- [x] **Humidori kartica** — novi `/assets/gear/humidors-card.webp` iz
  `Humidori glavna.jpg` (zamenjuje `humidor-06.webp` referencu).
- [x] **Pepeljare kartica** — novi `/assets/gear/ashtrays-card.webp` iz
  `Piksle glavna.webp` (zamenjuje `humidor-04.webp` referencu). + 2 nove
  galerijske u `/assets/gear/ashtrays/01..02.webp`.
- [x] **Futrole kartica** — novi `/assets/gear/cases-card.webp` iz
  `futrole glavna.jpg` (zamenjuje `humidor-01.webp` referencu). + 11 novih
  galerijskih u `/assets/gear/cases/01..11.webp` (uključuje `3a.jpg`).

## 4. Reusable izmene

- [x] **`scripts/process-feedback-2026-05-25.mjs`** — sharp pipeline za sve
  konverzije (full WebP 1600px q85 + thumb 800×600 q80). Auto-handle missing
  numbered files (npr. `Humidor/9.jpg` ne postoji → renumeriše sekvencijalno).
- [x] **`index.html`** — 5 region-card image referenci ažurirane (Novi svet,
  Sekači, Humidori, Pepeljare, Futrole).
- [x] **`public/data/categories.json`** — 5 `image` polja + 5 `gallery` polja
  ažurirana sa novim asetima.

## Šta još ostaje

- [ ] Vizuelna provera u browseru (https://cigarshop.rs):
  - Humidor sekcija — Stari/Novi svet kartice imaju nove brendirane slike
  - Spirits — 6 kartica sa novim brendiranim slikama (osim Burbon)
  - Gear — 5 kartica (Sekači, Humidori, Pepeljare, Futrole imaju nove slike;
    Upaljači zadržan)
  - Klik na karticu → detail strana ima novu galeriju (cutters 10, cases 11,
    ashtrays 2, humidors 15 fotki).
- [ ] Klijent potvrda da su nove kartice u skladu sa očekivanjem.
