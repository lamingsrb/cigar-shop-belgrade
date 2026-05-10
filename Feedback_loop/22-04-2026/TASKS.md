# Taskovi — Klijentov feedback, 22. april 2026.

Lista izvedena iz `FEEDBACK.md` od 2026-04-22 (klijent, večernja poruka).
Svi taskovi su prošli kroz commit historiju i nalaze se u `main` grani —
proverljivo `git log --since='2026-04-21' --until='2026-04-30'`.

> **Status legenda:** `[x]` urađeno · `[ ]` na čekanju · `[~]` delimično.

---

## Asseti koji su stigli (integrisani odmah)

- [x] **3 nova MP4 klipa** u `Video/` (storefront / interior + humidor /
  whisky shelves) — integrisano u hero (commit `74fbaea`).
- [x] **`CIGAR SHOP LOKACIJE.xlsx`** — 5 realnih adresa sa telefonima
  (commit `fbdff87`).
- [x] **Instagram handle** `@cigarshopbelgrade` (commit `25957e5`).

---

## 1. Hero sekcija

- [x] **Slajd A** — postojeći video sa live slideshow-dojmom (cross-fade +
  smene scena unutar kompilacije).
- [x] **"CIGAR SHOP" natpis** — rekreiran (veći, kontrast, moderan tretman,
  ručno kreiran wordmark).
- [x] **Logo layout** — monogram levo, "CIGAR SHOP" wordmark desno, "lanac
  Beograd" ispod (kasnije evolviralo u "Tobacco and Drinks" subwordmark).
- [x] **Slajd B** — kompilacija slika proizvoda, animirana, premium feel.
- [x] **Rotacija** Slajd A → Slajd B u loop (kasnije proširen na 3 slajda).

## 2. O nama

- [x] Uklonjena statična slika sa desne strane.
- [x] Dodat hero video sa sveobuhvatnim scenama prodavnica i proizvoda.

## 3. Od polja do humidora

- [x] Naslov i uvodni tekst zadržani.
- [x] **3D globus uklonjen.**
- [x] Dodat blok ispod: tekst o procesu proizvodnje duvana + video o
  proizvodnji cigara + showcase slike.

## 4. Biblioteka cigara

- [x] **Spojena** sa brands delom iz "Od polja do humidora".
- [x] Novi spojeni naziv **"Biblioteka cigara"** (kasnije evoluirao kroz
  redizajn).
- [x] Brand-tabovi prikazuju **po do 10 slika** najpoznatijih cigara po
  brendu (auto-lista iz `brand-gallery.json`).

## 5. Uđi u humidor

- [x] Sekcija zadržana.
- [x] **Left** — humidor video.
- [x] **Right** — tekst sa lead-om, body i statistikom.

## 6. Tečni prijatelji dima (Spirits)

- [x] Redizajniran po uzoru na "Biblioteka cigara":
  - [x] Vrste pića → brendovi → opis
  - [x] Grupacija (kategorija → brendovi → slike)

## 7. Nova sekcija: Oprema

- [x] Sekcija dodata: rezači, upaljači, humidori, pepeljare, putni etui.
- [x] Grupacija po vrsti opreme.
- [x] Realne slike + podaci iz Excela (placeholder gde nedostaju).
- [x] Dizajn usklađen sa ostalim sekcijama.

## 8. Kontakt — Stupi u kontakt

- [x] **Mapa** sa svih 5 lokacija.
- [x] **Info kartice** sa Ušće kao flagship.
- [x] **Store selector** dropdown koji ažurira info kartice (telefon,
  adresa, radno vreme).

## 9. Redosled sekcija

- [x] Promenjen na: Origins (Biblioteka cigara) → **Humidor** → Biblioteka
  cigara → Spirits → **Oprema** → Gallery → Locations → Contact.

(Kasnije, 23-04-2026 i 27-04-2026, redosled se dodatno menjao —
trenutno je: Hero → Manifest → Humidor → Spirits → Oprema → Gallery
(Godine tišine) → Blog → Contact.)
