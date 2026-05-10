# Taskovi — Anin feedback, 24. april 2026.

Iz `FEEDBACK.md` (treća runda Aninih poruka, originalno datirano 23-04-2026
ali stiglo kasno popodne pa je arhivirano u 24-04 folderu) + asseti za
spirits sekciju.

> **Status legenda:** `[x]` urađeno · `[ ]` na čekanju · `[~]` delimično.

---

## Asseti koji su stigli

- [x] **4 nova MP4 klipa** (`0-02-05-*`) — destilerija / cocktails / spirits.
  Integrisano u spirits process video.
- [x] **6 viber slika** (`viber_image_2026-04-24_*`) — spirits vitrine.
- [x] **`Pice slike/`** folder — dodatne spirits slike po kategorijama
  (sortiranje po brendovima u `brand-gallery.json`).

---

## 1. Novi tekst za sekciju (process blok)

- [x] Anin finalan copy o procesu proizvodnje cigare ubacen kao
  `process.body1` … `process.body4` u `public/locales/sr.json` i
  `public/locales/en.json`.
- [x] Razbijen na **4 paragrafa** (umesto 2-3 zbog dužine):
  - Plantaže + berba
  - Sušenje + fermentacija
  - Selekcija + torcedori
  - Odležavanje + pakovanje + zaključak

## 2. Rename sekcije

- [x] **Stari naziv:** "Od polja do humidora"
- [x] **Novi naziv:** **"Godine tišine za trenutak uživanja"**
- [x] Update u `library.title` i `index.html` fallback-u.

(Posle 02-05-2026 sekcija je dodatno preimenovana u **"Godine tišine"**
— samo galerija, bez "trenutak uživanja" teksta.)

## 3. Slike procesa proizvodnje

- [x] Trenutne 4 showcase figure (Polje / Fermentacija / Rolanje /
  Humidor) zadržane do dolaska novih slika.
- [x] Kasnije zamenjene `process-1-plantaza.webp`, `process-2-fermentacija.webp`,
  `process-3-rolanje.webp`, `process-4-odlezavanje.webp` (real photographs
  iz Aninih dostavljenih asseta).

## 4. SR + EN prevod

- [x] Srpski tekst direktno iz Aninog feedback-a (`public/locales/sr.json`).
- [x] Engleski prevod (`public/locales/en.json`) — održava narrative i
  technical terms (torcedor, ligero, seco, volado, vitola).

## 5. Build + deploy

- [x] Lokalni build na C: drive (per `D:\IT_Projects\CLAUDE.md` workflow).
- [x] `npx vercel --prod --yes` deploy.
