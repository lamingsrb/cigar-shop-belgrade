# Taskovi — Anin feedback 28. maj 2026.

Tekstualni feedback (bez novih slika). Tema: prezentacija slika u svim
slideshow-ovima — slike treba da budu jasne (uramljene fotografije), a ne
zatamnjene pozadine sa tekstom preko.

## Anin feedback (Viber, 16:55–16:59)

1. "svaka slika u slideshowovima jasno vidi, a ne kao pozadina"
2. "slika bude jasna sa zlatnim ramom"
3. "tekst naziva slike koji je sad na sredini slike, staviti u levi donji ugao
   i lepo uklopiti"
4. "vazi za sve sekcije"

## Šta je urađeno (css/style.css — globalno, desktop + mobile)

- [x] **Zlatni ram** na `.media-slideshow` i `.region-card`:
  - `border: 2px solid rgba(228,200,138,0.55)` + inset tamni mat + spoljašnji
    suptilan gold glow → izgleda kao uramljena fotografija.

- [x] **Slike jasne (bez zatamnjivanja)**:
  - `.media-slideshow__slide img`: filter `saturate(0.96) contrast(1.05)
    brightness(0.96)` → `saturate(1.04) contrast(1.02)` (skinut brightness pad).
  - `.region-card__media img`: filter `saturate(0.95) brightness(0.78)` →
    `saturate(1.03) contrast(1.02)` (bilo jako zatamnjeno 0.78 → sad puna
    vidljivost).

- [x] **Gradient samo u donjem-levom uglu** (umesto preko cele slike):
  - `.media-slideshow__slide::after` i `.region-card__overlay`:
    `linear-gradient(to top right, rgba(10,6,5,0.82) 0%, ... transparent 56%)`
    → tamni samo donji-levi ugao gde stoji naziv; ostatak slike čist.

- [x] **Naziv u donji-levi ugao**:
  - `.region-card__body`: `align-items: center; justify-content: center` →
    `align-items: flex-start; justify-content: flex-end` + `text-align: left`.
  - `.region-card__title` + `.region-card__cta` left-aligned, title malo manji
    (clamp 1.3–2.1rem umesto 1.5–2.6rem) da lepo sedne u ugao.

## Sekcije koje su pogođene (sve sa slideshow/karticama)

- Spirits "Nastavi sa pićem" — 6 kategorija card-slideshow
- Gear "Alati rituala" — 5 kategorija card-slideshow
- Humidor — Stari/Novi svet region kartice (region-grid--2)
- Godine tišine — 50-image slideshow (gold ram, jasne slike; nema title teksta)

## Napomena

Ovaj feedback je dizajn-direktiva za izgled slika → primenjeno globalno
(desktop + mobile), jer Ana eksplicitno kaže "važi za sve sekcije". Nije
mobile-only.
