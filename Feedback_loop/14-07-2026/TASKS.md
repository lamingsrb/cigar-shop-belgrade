# Taskovi — Anin media feedback 14-07-2026 (mejlovi od 06.07.2026)

Feedback je isporuka NOVIH SLIKA bez propratnog teksta — 3 mejla ("cs",
"slike radnje", "naslovna slika"). Zadatak: pažljivo preuzeti, organizovati
u dnevni folder, i uklopiti na sajt tako da bude lepo i na desktopu i na
telefonu. Mapiranje slika na sekcije izvedeno je poređenjem sa postojećim
asset-ima (nove slike su profesionalne verzije istih kadrova) i sa otvorenim
stavkama iz `29-05-2026/TASKS.md` (slideshow-ovi koji su čekali "prave" slike).

> Status: `[x]` urađeno · `[ ]` čeka · `[~]` delimično / blokirano

---

## 0. Preuzimanje i organizacija medija

- [x] `Media RAW\14.07.2026\cs.zip` + `naslovnaslika.zip` (Gmail attachmenti,
  preuzeo Lazar) → raspakovano u `Feedback_loop\14-07-2026\Media\CS\` (21) i
  `...\Media\Naslovna slika\` (13).
- [~] **"slike radnje" — 75 × SRGxxxxx.jpg na Google Drive-u: BLOKIRANO.**
  Fajlovi nisu javni (traže Google login), a claude.ai Google Drive konektoru
  je istekao token. **Rešenje:** re-autorizuj Google Drive konektor u claude.ai
  podešavanjima, ILI ručno Drive → select all → Download → zip u
  `Media RAW\14.07.2026\`. Lista svih 75 linkova je u `FEEDBACK-ANA.md`.
- [ ] **Video fajlovi NE POSTOJE ni u jednom mejlu** (svi prilozi su webp/jpg
  slike). Ako su videi poslati drugim kanalom (Viber?), ubaciti ih ručno u
  `Media RAW\14.07.2026\`.

## 1. Spirits — "Vitrina sa pićima" slideshow (mobile) — PRAVE slike

- [x] Zameniti 3 vertikalna Viber snimka (`/assets/spirits/vitrine-01..03.webp`)
  profesionalnim fotkama vitrina pića: `CS/1_1`, `CS/2_1`, `CS/3_1`.
  Ista imena fajlova → bez HTML izmena (srcset deskriptori ažurirani).

## 2. Manifest — "Ambijent radnji" slideshow — PRAVE slike

- [x] Slideshow je od 29-05 imao privremene slike iz glavne galerije
  (`gallery/main/01,08,14` — kadrovi proizvoda, ne ambijent). Zamenjeno sa 5
  profesionalnih fotki enterijera radnje: `CS/4_1` (walk-in humidor prostorija),
  `CS/7_1` + `CS/8_1` (vitrine opreme), `CS/5_1` + `CS/6_1` (police humidora)
  → novi asseti `/assets/gallery/ambijent/01..05.webp`.
  Kad stignu SRG "slike radnje", ovaj slideshow dopuniti/zameniti najboljim kadrovima.

## 3. Spirits kartice — Džin i Rum dobijaju prave naslovne

- [x] **Džin** je koristio placeholder (destilacija): kartica na index-u +
  `categories.json` (image + gallery[0]) → nova `Naslovna slika/e.webp`
  (džin sa limunom u ambijentu radnje) = `/assets/spirits/gin.webp`.
- [x] **Rum** je koristio placeholder (burad): → nova `Naslovna slika/a.webp`
  (Bumbu rum kompozicija) = `/assets/spirits/rum.webp`.

## 4. Gear kartice — kvadratne "glavna 1x1" naslovne

- [x] 5 kartica u "Alati rituala" slideshow-u prelazi na Anine kvadratne 1x1
  verzije (tešnji kadar na proizvod, bolje pune 4:3 okvir kartice od starih
  16:9 verzija koje su sekle bokove):
  `sekaci→cutters-cover`, `Upaljaci→lighters-cover`, `Humidori→humidors-cover`,
  `Piksle→ashtrays-cover`, `Futrole→cases-cover` (novi fajlovi, stari `-card`
  ostaju za hero banere detail strana).

## 5. Pepeljare — galerija na detail strani (+12 slika)

- [x] `category.html#ashtrays` je imala samo 3 slike (druge kategorije 11-16).
  Dodato 12 profesionalnih product fotki pepeljara (`CS/1..12`) →
  `/assets/gear/ashtrays/03..14.webp` + upis u `categories.json`.

## 6. Neiskorišćeno — arhivirano u Media folderu (sa razlogom)

- `b, c1, d, f` (1x1 verzije viskija/rakije/konjaka/pour kompozicije) — postojeće
  wide verzije (1600×1200) SAVRŠENO pune 4:3 okvire kartica i 16:10 mobile hero;
  kvadratne bi unele nepotrebno sečenje. Čuvaju se kao alternativa.
- `c` (rakija + espresso) — nova kompozicija, nijedan slot je trenutno ne traži.
- `Oprema glavna slika 1x1` — mobile "glavna slika opreme" je 16:10
  (`gear-ritual.webp` wide verzija ostaje).
- `Piksle glavna` (1920×1080) — wide verzija ashtrays naslovne, praktično ista
  kao postojeća `ashtrays-card.webp`.
- **Pitanje za Anu/Lazara:** da li je neka od a–f slika zamišljena kao NASLOVNA
  hero sekcije (subject mejla "naslovna slika")? Hero trenutno ima AI-generisani
  video — zamena videa statičnom fotkom je odluka koju treba potvrditi.

## 7. Deploy

- [x] `npm run build` prolazi.
- [x] Vizuelna verifikacija desktop + mobile (screenshotovi).
- [x] `git commit`.
- [ ] `git push` (→ Vercel auto-deploy na live) — **čeka Lazarevu potvrdu**
  (gvozdeno pravilo: push na live traži potvrdu).
