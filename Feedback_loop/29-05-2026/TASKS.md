# Taskovi — Vojin/Ana feedback 29. maj 2026.

**KRITIČNO PRAVILO:** Sve se primarno odnosi na **TELEFON**. Desktop ne menjati
osim gde je eksplicitno navedeno (blog 4 posta; Manifest "Ambijent" pasus
layout na desktopu).

> Status: `[x]` urađeno · `[ ]` čeka · `[~]` delimično

---

## 1. Telefon — dots/kružići + 5. lokacija

- [ ] **Ukloniti SKROZ kružiće (dots)** sa telefona na SVIM slideshow-ovima
  + hero slide indikatorima. (Radi na iPhone, ne na Samsung S23+ — preveliki.)
- [ ] **5. lokacija se ne vidi** na manjim telefonima (hero slide 2 — lista
  lokacija). Fix da se svih 5 vidi.

## 2. Humidor tekst — nota o veličini

- [ ] Dodati u postojeći humidor tekst notu da imamo **najveći Humidor na
  Balkanu** (uklopiti u pasus, vidi sekciju 4 za tačnu poziciju).

## 3. Manifest "Tvoj izbor, naš svet" — TELEFON restruktura

- [ ] Veći razmak naslov ↔ sekcija.
- [ ] Redosled (telefon): naslov → **1. pasus teksta** (lead) → **snimak (video)**
  → **2. pasus** (Kreiran za ljubitelje... do najistančaniji ukus) →
  **NOVI slideshow** (bilo koje slike za sad, prave sutra) → **ostatak teksta**.
- [ ] Unificirati font da bude isti svuda (da se ne ističe).
- [ ] **DESKTOP:** pasus "Ambijent naših radnji.." ceo, desno ispod snimka;
  levo ide novi slideshow.

## 4. Humidor "Uđi u humidor" — TELEFON restruktura

- [ ] Veći razmak naslov ↔ sekcija.
- [ ] Redosled: naslov → **pasus** (Dobrodošli u prostor... do "majstori koji
  su je stvarali") + **ubaciti rečenicu o veličini humidora (najveći na
  Balkanu)** → **snimak** → **pasus** (Na policama humidora... do "usavršavanog
  zanata") → **kartica Stari svet** → rečenica (Nasuprot njima stoje cigare
  Novog sveta... pun dim izražen karakter) → **kartica Novi svet** → ostatak
  (Ovo nije mesto za brz izbor... cigare ne traže pažnju).
- [ ] **Stari svet detail strana** (category.html#oldworld): skratiti tekst.

## 5. Spirits "Nastavi sa pićem" — TELEFON restruktura

- [ ] Veći razmak naslov ↔ sekcija.
- [ ] Redosled: naslov → **pasus** (Nakon izabrane cigare... ali sa karakterom
  koji zna da odgovori) → **slika "Glavna nastavi sa picem"** (bez strelica,
  bez ičega) → **tekst** (Bilo da biraš viski sa dubinom... svaka kombinacija
  otkriva novu nijansu ukusa) → **postojeći slideshow** (premesti, ukloni
  kružiće) → **tekst** (U našim radnjama pronađi pažljivo odabrana pića... do
  "prepustiš ritualu dobrog ukusa") → **NOVI slideshow vitrina pića** (Anine
  slike, 2-3 kom).

## 6. Gear "Alati rituala" — TELEFON restruktura

- [ ] Veći razmak naslov ↔ sekcija.
- [ ] Redosled: naslov → **pasus** (prva rečenica... do "do poslednjeg detalja")
  → **glavna slika opreme** (imamo preuzetu) → **tekst** (Precizni sekači koji
  čuvaju... a ne da ga prekidaju) → **postojeći slideshow** (premesti) →
  **tekst** (Svaki komad opreme ima svoju ulogu... do kraja).

## 7. Gallery "Godine tišine" — TELEFON restruktura

- [ ] Veći razmak naslov ↔ sekcija.
- [ ] Redosled: naslov → **tekst** (Sve počinje pre prvog dima... do "Svaki dim
  je rezultat...") → **NOVI slideshow plantaža/fabrika** (3-4 slike) → **tekst**
  (A onda dolazi trenutak koji sve to zaokružuje... do "To nije samo tečnost u
  čaši") → **NOVI slideshow destilerija/burići** → **tekst** (U tom susretu
  cigara i pića... do kraja) → **postojeći gallery slideshow** (na dno).

## 8. Blog "Priče iz dima" — DESKTOP + TELEFON

- [ ] Obrisati ostale postove, ostaviti **samo prva 4** koja se pojavljuju.

---

## 9. Detail (pod)stranice — category.html

- [ ] Na stranicama koje se otvaraju klikom na pića/opremu/cigare (category.html),
  **ukloniti sav tekst, ostaviti SAMO slike**. (NE odnosi se na glavne sekcije
  na index-u, samo na pod-stranice.)

## 10. Kontakt sekcija — TELEFON

- [ ] Optimizovati da na svakom telefonu cela kontakt sekcija stane u **jedan
  scroll/viewport** — sada se mora skrolovati pa se ne vide odmah sve lokacije.

---

## Implementacija (status)

**Batch 1 — globalni quick wins (commit 02e51af):**
- [x] Blog → 4 posta (slice(0,4) u blog.js rail + renderPosts)
- [x] Mobile dots uklonjeni (hero + media-slideshow + gallery-pages)
- [x] Hero 5. lokacija (tighter gap/padding na malim telefonima)
- [x] Humidor "najveći na Balkanu" nota dodata u lead (sr + en)
- [x] Mobile veći razmak naslov ↔ sadržaj (section/origins margin 2.75rem)
- [x] category.html detail strane — uklonjen tekst, ostaju hero slika + galerija
- [x] Kontakt mobile — kompaktan (2×2 info kartice, ikone skrivene, mapa niža)

**Batch 2-6 — section restruktura (jedan veliki commit):**
- [x] Manifest: lead → video → body1 → novi slideshow → body2 (Ambijent)
      Desktop: grid-template-areas (video span desno, slideshow levo, Ambijent
      desno ispod video-a). Mobile: flex column.
- [x] Humidor: intro → video → body2 → Stari svet → body3 → Novi svet → body4
      Desktop: grid (video levo span, tekst desno, 2 kartice u redu ispod).
      Mobile: flex column sa explicit order.
- [x] Spirits: section-flow editorial → body1 → glavna slika → body2 →
      card-slideshow → body3 → vitrine slideshow (3 nove vitrine slike)
- [x] Gear: section-flow → body1 → glavna slika (gear-ritual) → body2 →
      card-slideshow → body3
- [x] Gallery: section-flow → lead → plantaža slideshow (4) → lead2 →
      destilerija slideshow (3) → lead3 → glavna galerija slideshow (50)

**Nova `.section-flow` komponenta** u style.css: centrirana editorial
kolona (max 940px), gold-frame hero slike, koristi Spirits/Gear/Gallery.

## Slike koje treba naći (Ana kaže "poslala je / imamo negde")

- Vitrina pića (spirits #5) — 2-3 slike
- Plantaža duvana / fabrika proizvodnje (gallery #7) — 3-4 slike
- Destilerija / burići (gallery #7) — par slika
- Glavna slika opreme (gear #6) — preuzeta već (`gear-ritual.webp`?)
- Glavna nastavi sa pićem (spirits #5) — `spirits-pour.webp` (od ranije)
