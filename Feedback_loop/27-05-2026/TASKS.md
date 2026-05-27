# Taskovi — Anin batch 26-05-2026, obrađen 27-05

8 mejlova sa Anom slikama: cigare (Stari/Novi svet), 6 pića (Viski, Konjak,
Džin, Rakija, Burbon, Rum), 4 istorijske figure za blog (Kolumbo, Castro,
Čerčil, Kenedi). Ukupno 111 slika. **Layout neizmenjen** — samo proširenje
gallery-ja u kategorijama + zamena blog cover slika.

> **Status:** `[x]` urađeno · `[ ]` čeka.

---

## 1. Cigare — region galerije (proširene)

- [x] **Stari svet** ← 23 nove slike u `/assets/categories/oldworld/01..23.webp`.
  Card image `cuba.webp` iz 25-05 ostaje. `oldworld.gallery` u
  `categories.json` proširen sa 24 slike (cuba.webp + 23 nove).
- [x] **Novi svet** ← 28 novih slika u `/assets/categories/newworld/01..28.webp`.
  Card image `newworld.webp` iz 25-05 ostaje. `world.gallery` proširen na 29.

## 2. Pića — galerije po kategoriji

Card slike (`scotch.webp`, `bourbon.webp`, `cognac.webp`, `rakija.webp`,
`spirits-process-1-destilacija.webp`, `spirits-process-3-odlezavanje.webp`)
iz 25-05 ostaju netaknute. Galerije proširene sa novim brendiranim
fotkama:

- [x] **Viski** — 19 novih → `/assets/spirits/viski/01..19.webp`.
- [x] **Konjak** — 7 novih → `/assets/spirits/konjak/01..07.webp`.
- [x] **Džin** — 3 nove → `/assets/spirits/dzin/01..03.webp`.
- [x] **Rakija** — 11 novih → `/assets/spirits/rakija/01..11.webp`.
- [x] **Burbon** — 5 novih → `/assets/spirits/burbon/01..05.webp`.
- [x] **Rum** — 4 nove → `/assets/spirits/rum/01..04.webp`.

## 3. Blog — istorijske figure (cover slike)

Mali web-source portretni fajlovi (hash-imena), izabran najveći iz svakog
foldera. Sačuvani kao dedicated blog cover-i:

- [x] **Kolumbo** ← `Kolumbo/efed5db4...jpg` (832×1216) → `/assets/blog/kolumbo.webp`
  - Update: `blog.json` post `kolumbo-i-prvi-dim` image field.
- [x] **Fidel Castro** ← `Fidel Castro/10.jpg` (2026×2026) → `/assets/blog/castro.webp`
  - Update: post `cohiba-i-fidel-castro` image field.
- [x] **Čerčil** ← `Cercil/63d1c604...jpg` (800×831) → `/assets/blog/churchill.webp`
  - Update: post `churchill-i-romeo` image field.
- [x] **Kenedi** ← `Kenedi/591b08...jpg` (3876×2980) → `/assets/blog/kennedy.webp`
  - Update: post `embargo-i-bekstvo-iz-kube` image field.

## 4. Reusable

- [x] **`scripts/process-feedback-2026-05-27.mjs`** — sharp pipeline:
  batch sequential renumeration (1.jpg, 2.jpg, 3a.jpg → 01.webp, 02.webp,
  03.webp), full 1600px q85 + thumb 800×600 q80. Pickup pickLargestAs helper
  za blog (bira najveću sliku po pixel area).

## Šta NIJE menjano

- `index.html`, `category.html`, `blog.html` — bez ijedne izmene (per Vojinovom
  uputstvu: ne diraj layout).
- Card slike svih sekcija (Stari svet, Novi svet, 6 pića, 5 gear kategorija)
  ostaju iz 25-05 feedback-a.
- Postojeća galerija u `/assets/gallery/img-*.webp` — netaknuta.
- Humidor `humidor-01..15.webp` — netaknuti.

## Šta ostaje

- [ ] Vizuelna provera kategorije strana (https://cigarshop.rs/category.html#oldworld):
  - 24 slike u Stari svet galeriji (1 card + 23 nove)
  - 29 slika u Novi svet galeriji
  - Po 4-20 slika u svakoj pić kategoriji
- [ ] Vizuelna provera blog kartica — nove cover slike za 4 istorijska posta.
- [ ] Klijent potvrda da blog cover slike (mali low-res portreti) zadovoljavaju
  vizuelni kvalitet, ili da poprimi veće verzije.
