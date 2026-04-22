# Client Feedback — 22. april 2026.

Izvor: direktna poruka klijenta, veče 22-04-2026.

---

## Novi asseti koji su stigli

- `Video/` — 3 nova MP4 klipa (ulazni storefront, interior CIGAR SHOP sign + humidor, whisky shelves). Integrisano u hero (commit `74fbaea`).
- `CIGAR SHOP LOKACIJE.xlsx` — 5 realnih adresa sa telefonima. Integrisano (commit `fbdff87`).
- `https://www.instagram.com/cigarshopbelgrade` — pravi IG handle. Integrisano (commit `25957e5`).

---

## Zahtevi koji čekaju rad

### 1. Hero sekcija

- **Slajd A (postojeći):** trenutni video — ostaje, ali treba live slideshow-dojam sa animativnim smenjivanjem scena unutar kompilacije (ne samo cross-fade).
- **"CIGAR SHOP" natpis:** slabo vidljiv na trenutnoj pozadini — rekreirati (veći, kontrast, moderan tretman).
- **Logo layout:**
  - Levo: monogram (bez "Cigar Shop" teksta)
  - Desno: "CIGAR SHOP" wordmark
  - Ispod: "lanac Beograd"
- **Slajd B (novi):** kompilacija slika proizvoda, animirana, moderna, premium.
- **Rotacija:** posle 5s Slajd A → Slajd B, pa u loop.

### 2. O nama

- Ukloniti statičnu sliku sa desne strane.
- Staviti hero video (onaj sa sveobuhvatnim scenama prodavnica i proizvoda).

### 3. Od polja do humidora

- Zadržati naslov i uvodni tekst.
- **Ukloniti 3D globus.**
- Ispod: novi blok — tekst o procesu proizvodnje duvana + video o proizvodnji cigara + showcase slike (umesto globusa).

### 4. Biblioteka cigara

- **Uklanja se** kao zasebna sekcija.
- **Spaja se** sa dosadašnjim brands delom iz "Od polja do humidora".
- Novi spojeni naziv: **"Biblioteka cigara"**.
- Svaki brand-tab prikazuje **po 10 slika najpoznatijih cigara** tog brenda (auto-lista).

### 5. Uđi u humidor

- Zadržati.
- **Left:** video humidora (zasad onaj koji imamo; klijent će poslati pravi).
- **Right:** tekst.

### 6. Tečni prijatelji dima (Spirits)

- Redizajn po uzoru na novu "Biblioteka cigara":
  - Vrste pića → brendovi → opis / po čemu je poznat
  - Grupacija (kategorija → brendovi → 10 slika po brendu)

### 7. Nova sekcija: Oprema

- Rezači, upaljači, humidori, pepeljare, putni etui.
- Grupacija po vrsti opreme.
- Realne slike + podaci iz Excela (klijent šalje slike kasnije; za sada placeholder).
- Dizajn u skladu sa ostalim sekcijama.

### 8. Kontakt — Stupi u kontakt

- **Mapa:** svih 5 lokacija na mapi.
- **Info kartice:** glavni kontakti su Ušće (flagship).
- **Store selector:** dropdown za izbor druge radnje — kartice se ažuriraju (telefon, adresa, radno vreme).

### 9. Redosled sekcija

- **Pre:** Origins → Collection → Humidor → Spirits → Gallery → Locations → Contact
- **Posle:** Origins (Biblioteka cigara merge-ovan) → **Humidor** → Biblioteka cigara → Spirits → Oprema (NOVO) → Gallery → Locations → Contact

(Humidor ide pre Biblioteke cigara.)

---

## Izvršavanje (plan rada)

1. Feedback MD fajl (ovo) ✓
2. Section reorder: Humidor pre Biblioteke
3. Merge Collection → Brands (Biblioteka cigara) + 10 slika po brendu
4. Hero redizajn: 2-slide rotacija + logo layout + CIGAR SHOP tekst
5. "Od polja do humidora" — ukloniti globus, dodati production story
6. O nama — video umesto slike
7. Humidor — video levo / text desno
8. Spirits redizajn sa grupacijama
9. Nova sekcija Oprema
10. Contact dropdown + svih 5 na mapi
