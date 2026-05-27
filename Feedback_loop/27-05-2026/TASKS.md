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

---

## Anin Viber batch (popodne 27-05-2026)

Nakon prvog batch-a, Ana je dodatno poslala materijal na Viber:
- 8 fotki za sekciju "Godine tišine" (slideshow)
- 50 slika za "Glavna galerija" (paginated gallery na dnu sekcije)
- 1 MP4 video za "Tvoj izbor, naš svet" (manifest) sekciju
- `burbon.jpg` za naslovnu Burbon kartice (već je bila u Burbon folderu sa
  ostalih 4, ali Ana je naglasila da je upravo ova naslovna)

### Šta je odrađeno

- [x] **Manifest "Tvoj izbor, naš svet" → video umesto slideshow:**
  - Transcode MP4: `Viber/0-02-05-...mp4` (1920×1080, 47s, 21MB) →
    `/assets/video/manifest.mp4` (1280×720, ~17MB, libx264 crf24, faststart, no audio).
  - Poster frame: `/assets/video/manifest-poster.jpg`.
  - `index.html` manifest__media: zamenjen 5-slide slideshow sa `<video autoplay muted loop playsinline>`.

- [x] **Godine tišine slideshow → 8 novih brendiranih slika:**
  - 8 Viber fotki → `/assets/gallery/godine-tisine/01..08.webp`.
  - `index.html` gallery-media: zamenjen 6 starih `img-XXX.webp` sa 8 novih.

- [x] **Glavna galerija (paginated) → 50 novih slika:**
  - 50 Viber fotki → `/assets/gallery/main/01..50.webp` (+ thumbs).
  - `index.html`: dodat `<div id="gallery-track">` ispod gallery-media (u
    `#gallery` sekciji, iznad #blog). Restaurira gallery-pages komponentu koja
    je bila u JS-u (dead code) — sad je aktivna sa 50 slika u 9 stranica × 6.
  - `js/gallery.js`: kompletno prepisan — više ne čita gallery-manifest.json
    + curated whitelist, već gradi listu od 50 indexiranih images iz
    `/assets/gallery/main/`.

- [x] **Stari/Novi svet dominantne naslovne fotke:**
  - CSS `.region-grid--2 > .region-card`: stack u 1 kolonu, full-width
    (umesto 2-col side-by-side). Aspect ratio 16:9 zadržan.
  - Svaka kartica sad zauzima ~1440px x 810px na desktop-u — prava "hero"
    veličina, dominantna na ekranu.

- [x] **Burbon naslovna:**
  - `Burbon/burbon.jpg` (3053×3053) → `/assets/spirits/bourbon.webp` (replace).
  - Card image se sad odnosi na pravu brendiranu fotku umesto staru generic.

### Šta NIJE odrađeno (nedostaje materijal)

- [ ] **Upaljači (lighters)**: Ana je napomenula "fale slike za upaljace" — ali
  NIJE poslala nijednu novu sliku. Trenutno `lighters` kartica i dalje koristi
  staru `vitrine-02.webp`. Treba zatražiti od Ane brendirani materijal za ovu
  kategoriju (po obrascu Sekači, Pepeljare, Futrole, Humidori).

### Reusable

- [x] **`scripts/process-viber-2026-05-27.mjs`** — sharp pipeline za Viber
  batch (50 + 8 slika, isti format kao prethodni feedback procesi).
