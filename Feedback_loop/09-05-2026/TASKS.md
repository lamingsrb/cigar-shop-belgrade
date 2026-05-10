# Taskovi — Vojinov feedback, 9. maj 2026.

Lista izmena izvedena iz feedback-a od 2026-05-09 + naknadnih ispravki tokom
sesije. Pratiti redosled sekcija po sajtu.

> **Status legenda:** `[x]` urađeno · `[ ]` na čekanju · `[~]` delimično / čeka
> potvrdu klijenta.

---

## 1. Sekcija — HERO (Naslovna)

- [x] OK — bez izmena (eksplicitno: "ne diraj za sada").

## 2. Sekcija — TVOJ IZBOR, NAŠ SVET

- [x] OK — bez izmena (eksplicitno: "ne diraj za sada").

## 3. Sekcija — UĐI U HUMIDOR

- [x] **Obrisati blok statistika** (70% / 20°C / 5 humidora) ispod teksta.
- [x] **Obrisati ceo "Po regiji" blok** (Kuba / Novi svet tab-showcase sa 5
  fotki po tabu).
- [x] **Postaviti dve klikabilne velike kartice** širinom cele sekcije:
  - [x] Kartica 1 — **Kuba** (slika `KUBA 9.jpg`, kropovan watermark + naslov)
  - [x] Kartica 2 — **Novi svet** (atmosferski kadar iz galerije)
  - [x] Naziv u sredini kartice, hover animacija, gold accent.
- [x] **Klik na karticu otvara detail stranicu** (analogno blog post
  pattern-u): `category.html#cuba` i `category.html#world`.
  - [x] Hero slika + kicker + naslov
  - [x] Body tekst (markdown light: `**bold**` + `*italic*`)
  - [x] Galerija slika ispod teksta

## 4. Sekcija — NASTAVI SA PIĆEM

- [x] **Zadržati slajdshov** sa desne strane teksta.
- [x] **Prva slika u slajdshov-u → `Media/PICE 1.jpg`** (konvertovano u
  `/assets/spirits/spirits-pour.webp`).
- [x] **Obrisati postojeći tab-showcase** (Viski/Burbon/Džin/Konjak/Rum/
  Rakija sa po 6 brendova).
- [x] **Postaviti grupu klikabilnih kartica** (3×2 grid) za 6 kategorija:
  - [x] Viski → `category.html#whisky`
  - [x] Burbon → `category.html#bourbon`
  - [x] Džin → `category.html#gin`
  - [x] Konjak → `category.html#cognac`
  - [x] Rum → `category.html#rum`
  - [x] Rakija → `category.html#rakija`
- [x] Detail strane za svih 6 kategorija (text + galerija) — vidi
  `public/data/categories.json`.

## 5. Sekcija — ALATI RITUALA

- [x] **Prva slika u slajdshov-u → `Media/OPREMA 6.jpg`** (konvertovano u
  `/assets/gear/gear-ritual.webp`).
- [x] **Obrisati postojeći tab-showcase** (Sekači/Upaljači/Humidori/
  Pepeljare/Futrole sa po 4 brenda).
- [x] **Postaviti grupu klikabilnih kartica** za 5 kategorija:
  - [x] Sekači → `category.html#cutters`
  - [x] Upaljači → `category.html#lighters`
  - [x] Humidori → `category.html#humidors`
  - [x] Pepeljare → `category.html#ashtrays`
  - [x] Futrole → `category.html#cases`
- [x] **Centriranje orphan reda** — pošto je 5 kartica u 3-koloni gridu,
  poslednja 2 reda se centriraju (umesto da budu levo-poravnati). Rešeno
  flexbox + `justify-content: center` pristupom u `.region-grid--3`.
- [x] Detail strane za svih 5 kategorija (text + galerija).

## 6. Sekcija — GODINE TIŠINE (galerija)

- [x] **Sekcija ostaje** (struktura, naslov, animacije bez izmene).
- [x] **Filtriran subset slika** — 24 hand-picked iz 62 originalnih:
  - Klasici: Cohiba, Romeo y Julieta, Montecristo, Partagas, Bolivar,
    Juan Lopez
  - Novi svet: Plasencia, Joya de Nicaragua, J.C. Newman, Davidoff, Maya
    Selva, Ashton, Brun del Re
  - Atmosferski kadrovi: 8 odabranih
  - HORACIO smanjeno sa 10 na 3 (uklonjeni near-duplikati).
- [x] Implementirano kao `CURATED` whitelist u `js/gallery.js` koja filtrira
  postojeći `gallery-manifest.json`.

## 7. Boja logo monograma

- [x] **Mora da bude identična sa hero "CIGAR SHOP" wordmark-om** (`--champagne
  #d4af37`).
- [x] **Prvi pokušaj** — pixel-recoloring PNG-a (sharp HSL transform) nije
  bio dovoljan; metalni 3D shading je rezultovao tamnijom prosečnom bojom
  (~`#c0a020` umesto `#d4af37`).
- [x] **Finalno rešenje** — IMG zamenjen SPAN-om sa `mask-image` postavljenim
  na logo PNG i `background-color: var(--champagne)`. Logo je sada **flat
  champagne** boja, **identična** sa hero wordmark-om. Promena u 4 fajla:
  - [x] `index.html` — header brand logo
  - [x] `index.html` — footer brand logo
  - [x] `blog.html` — header brand logo
  - [x] `category.html` — header brand logo
- [x] CSS u `style.css` — `.brand__logo` i `.footer__logo` koriste
  `mask: url(...) center/contain no-repeat` + `background-color: var(--champagne)`.

## 8. Domen cigarshop.rs i deploy

- [x] **Domen dodat u Vercel projekat** `lazar-milicevics-projects/cigar-shop-belgrade`:
  - [x] `cigarshop.rs` (apex)
  - [x] `www.cigarshop.rs`
- [x] **Production deploy** na Vercel — `npx vercel --prod --yes` iz Z:.
  Aliased na `https://cigarshop.rs` (radi tek kad DNS bude konfigurisan).
- [x] **DEPLOY.md** — kompletna dokumentacija sa:
  - [x] Trenutno stanje (vlasništvo, GitHub, Vercel, domen)
  - [x] Loopia DNS koraci (Opcija A — manuelno; Opcija B — preko API user-a)
  - [x] Predator-style transfer pattern analiza (zaključak: **isti smo
    setup kao Predator** — code i Vercel kod Lazara, domen kod klijenta)
  - [x] Build & deploy workflow lokalno
  - [x] Provera posle DNS propagacije
- [x] **`scripts/loopia-dns-setup.mjs`** — XML-RPC klijent koji čita
  kredencijale iz `CREDENTIALS.local.md` i automatski dodaje A record-e.
  - [x] **Auth fix:** kreiran zaseban API user `lazarm@loopiaapi` u
    Loopia panelu sa svim privilegijama (web panel ≠ API user).
  - [x] **Endpoint fix:** Loopia Srbija koristi `https://api.loopia.rs/RPCSERV`
    (NE `.se` — to je švedski endpoint koji vraća 401 za `.rs` domene).
  - [x] **Surgical migration izvršena 09-05-2026 19:36:**
    - Obrisano: `A @ 23.227.38.65` (Shopify), `AAAA @ 2620:0127:f00f:5::`,
      `CNAME www → shops.myshopify.com`
    - Dodato: `A @ 76.76.21.21`, `A www 76.76.21.21` (Vercel)
    - Email infra (MX, SPF, DKIM, autoconfig) NEDIRANA — verifikovano.
- [x] **DNS propagacija** — < 1 min posle izmene, Google DNS rezolvuje
  cigarshop.rs → 76.76.21.21.
- [x] **HTTP test** — `curl -I http://cigarshop.rs` → 200 OK, `Server: Vercel`,
  novi sajt sa svim izmenama servira se preko Vercel-a.
- [x] **HTTPS / SSL** — Vercel je izdao Let's Encrypt cert za
  `cigarshop.rs` + `www.cigarshop.rs` posle ~30 min Loopia DNSSEC
  auto-sync-a. Verifikovano `curl -I https://cigarshop.rs` → 200 OK.
- [x] **Reusable knowledge:** kreiran [LOOPIA_DNS_API_INTEGRATION.md](
  ../../GENERAL%20MODUL%20INSTRUCTIONS/integrations/LOOPIA_DNS_API_INTEGRATION.md)
  za buduće `.rs`/`.se` Vercel migracije.

---

## Reusable izmene koje su nastale uz feedback

- **`category.html`** — nova generička detail stranica za sve kategorije
  (Kuba, Novi svet, 6 kategorija pića, 5 kategorija opreme).
- **`js/category-page.js`** — router po hash-u (`#cuba`, `#world`,
  `#whisky`, `#bourbon`, `#gin`, `#cognac`, `#rum`, `#rakija`,
  `#cutters`, `#lighters`, `#humidors`, `#ashtrays`, `#cases`); podržava
  i18n i lightbox.
- **`public/data/categories.json`** — sadržaj za svih 13 detail strana
  (sr + en, hero slika, body markdown, gallery URI lista).
- **`css/style.css`** — nove komponente:
  - `.region-grid` (flexbox sa `justify-content: center` za orphan
    centering)
  - `.region-card` (klikabilna velika kartica sa hover animacijom)
  - `.category-post` + `.category-gallery` (detail strana layout)
- **`scripts/process-feedback-2026-05-09.mjs`** — sharp pipeline za:
  - kropovanje KUBA 9.jpg watermark-a (top 38% + bottom 22%)
  - konverziju PICE 1 + OPREMA 6 u WebP
  - HSL recoloring logo PNG-a (prvi pokušaj — finalno zamenjeno mask
    pristupom u CSS-u, ali script ostavljamo za reproducibilnost asseta).

---

## Šta još ostaje

- [ ] Vizuelna provera u browseru (https://cigarshop.rs):
  - Logo monogram ide #d4af37 (boja CIGAR SHOP wordmark-a)
  - Humidor sekcija — Kuba/Novi svet 2 kartice umesto stat blok + "Po regiji"
  - Spirits — 6 kartica + nova prva slika slajdshov-a
  - Gear — 5 kartica (orphan red centriran) + nova prva slika
  - Klik na bilo koju karticu otvara `category.html#<key>` stranu
  - Godine tišine — 24 slike umesto 62
