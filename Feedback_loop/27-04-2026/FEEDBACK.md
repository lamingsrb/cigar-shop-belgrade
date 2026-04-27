# Feedback — 27. april 2026.

Veliki update sa 13 stavki. Plan: izvršiti planski od početka do kraja.

---

## 1. Loader — bez šibice i bez teksta

- Trenutni loader prikazuje match strike animaciju + "Strike a match." / "Zapali šibicu." tagline.
- **Novo:** stranica se učitava odmah, bez šibice i bez teksta ispod.

## 2. "CIGAR SHOP" tipografija i boja

- Trenutno: gradijentni tekst (varijacije zlatne svetlije/tamnije).
- **Novo:** **puna zlatna boja** (bez svetlih nijansi/gradijenta), font čitljiviji ali još uvek lep, usklađen sa logoom.
- Isto važi i za "Tobacco and Drinks" subtitle — pun zlatan, čitljiv font.

## 3. Logo redizajn

- **Pun zlatan**, bez svetlih nijansi. Trenutni logo ima više tonova (champagne / gold / bronze gradijent).
- Treba: jedna boja kroz ceo monogram.

## 4. Hero — ukloniti "Zapali iskustvo"

- Scroll link "Zapali iskustvo" se briše.

## 5. Hero slajdovi 2 i 3

- **Slajd 2:** umesto "Sedam regija, jedna strast" → naslov "**Posetite nas na 5 lokacija**", ispod adrese 5 prodavnica.
- **Slajd 3:** ukloniti sav tekst — samo video (live shop footage).

## 6. Hero — modern man video

- Generisati / pribaviti video: moderni čovek u odelu, **cigara u ruci (NE zapaljena, BEZ dima)**, čaša pića. Loop, primarno vidljiv, **bez crnog overlay-a**, bez teksta.

## 7. O nama

- Ostaje isto za sada.

## 8. Section reorder — Humidor ↔ Godine tišine

- Trenutni redosled: Library ("Godine tišine za trenutak uživanja") → Humidor.
- **Novo:** Humidor prvo, pa "Godine tišine".

## 9. Cigar brand division → Humidor section

- Iz Library sekcije premestiti brand-tabs + grid (podela cigara) na **kraj Humidor sekcije**.
- Tu podeliti samo na **2 grupe**: **Kuba** i **Novi svet**.
- Klik na Kubu → umesto trenutnog teksta i opisa brendova, prikazati **brand logoe** u slajd-galeriji (auto-advance), pa onda slajdovi galerije fotografija kubanskih cigara.
- Isto za Novi svet.
- Slajdovi se sami pomeraju, moderno i lepo dizajnirano.

## 10. Spirits redizajn

- Rename sekcije iz "Pića" / "Tečni prijatelji dima" → "**Nastavi u piće**".
- Podele: **Viski / Burbon / Džin / Konjak / Rum / Rakija** (6 grupa).
- Klik na Viski → kratka rečenica šta je viski + koje vrste postoje, pa **slajd sa slikama vrsta viskija**.
- Isto za svih 6 podela.

## 11. Library ("Godine tišine") — minimalno

- **Brisanje sveg teksta** osim **naslova i podnaslova**.
- Cela površina sekcije pokrivena **video kompilacijom**: video plantaže, cigara, proizvodnja + animativni slajdovi slika koje imamo (proces proizvodnje cigara + proces proizvodnje pića + trenutak uživanja).
- Cilj: predstavljanje cele priče — od proizvodnje cigare → proizvodnje pića → trenutka uživanja.

## 12. Nova sekcija — Blogovi

- Sekcija sa prikazom 10 blog postova o **istorijskim činjenicama o cigarama**.
- Postavlja se **pre Contact sekcije**.
- Showcase na glavnoj stranici sa lepim animativnim slajd prikazom.
- Same priče u **posebnoj stranici** (route) sa zanimljivim nazivom, linkovana u **glavnom meniju** kao blog.
- Pišem 10 originalnih, istorijski tačnih blog postova sa lepim narrativom.

## 13. Galerija (Ritual zatvoren u kadru)

- Sa 9 slika prikazanih → **6 slika** odjednom (slike veće).

## 14. Gear (Alati rituala) — rename

- "Rezači" → "**Sekači**"
- "Putni etui" → "**Futrole**"
- Ostali nazivi ostaju (Upaljači / Humidori / Pepeljare).

---

## Plan izvršavanja (po fazama)

### Faza A — Hero, loader, kursor, copy

1. Loader bez šibice + tagline-a
2. Hero brand lockup: pun zlatan font, bez gradijenta
3. Logo redizajn — pun zlatan monogram
4. Ukloniti "Zapali iskustvo"
5. Slide 2 → "Posetite nas na 5 lokacija" + adrese
6. Slide 3 → samo video, bez teksta

### Faza B — Section reorder + Library minimal

7. Humidor ↔ Library swap
8. Library: ukloniti tekst, full-bleed video kompilacija
9. Cigar brand split (Kuba / Novi svet) → premestiti na kraj Humidor sekcije
10. Brand UX: slajd-galerija logoa + slajd-galerija proizvoda

### Faza C — Spirits + Gear redesign

11. Spirits → "Nastavi u piće", 6 podgrupa, slajd UX (sa kratkim opisom + galerijom)
12. Gear: rename "Sekači" + "Futrole"

### Faza D — Blogovi

13. 10 blog postova — pisanje original copy
14. Blog showcase sekcija pre Contact
15. Blog stranica (route)
16. Nav link

### Faza E — Galerija + finalni build

17. Galerija 9 → 6 vidljivih
18. Build + deploy

---

## Asseti koje čekam od Ane

- **Modern man video** — cigara u ruci (nezapaljena, bez dima) + čaša pića. Bilo da Ana pošalje stock, bilo da generišemo preko PixVerse/Kling-a.
- **Brand logoi** za Kubu i Novi svet (Cohiba, Romeo y Julieta, Davidoff, Joya, Padron, ...) — ako klijent ima pakete, idealno; u međuvremenu tekstualne placeholder kartice ili pretrage javnih logoa.
- **Single-color full-gold logo monogram** — ili da klijent dostavi novi PNG/SVG, ili rastavljam trenutni i prebojavam u jednu boju.
