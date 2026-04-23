# Anin feedback — 23. april 2026. (runda 2, popodne)

Druga poruka od Ane, u vezi sa prvim hero slajdom.

---

## Zahtev

Prvi hero slajd trenutno ima statičnu crno-zlatnu geometrijsku pozadinu. Ana je poslala Pinterest pretragu sa referentnim live pozadinama koje joj se sviđaju:

- Pretraga: "black background with gold smoke video"
- Link: https://pin.it/2CkeqbD5A
- Screenshot dostavljen (CIGAR SHOP 23-04-2026 ana slika 2.jpg u ovom folderu)

### Ana poruka (rekonstrukcija iz čata)

- "probaj sa svim ovim pozadinama koje sam ti poslala"
- "ili ti pronađi neku"
- "ima jako lepih videa koji se mogu iskoristiti kao pozadine za naslovnu stranu"
- "ali ja ne mogu da skinem"

### Klijentska referenca

- Cilj: **live gold smoke / particle video** kao pozadina za prvi hero slajd (trenutno statična slika).
- Estetika: crna pozadina, zlatni dim / čestice / iskre, suptilno kretanje, premium feel.

---

## Izvršavanje (plan)

1. Pinterest video ne može direktno da se skine (copyright + no easy download). Koristiti alternative:
   - **Generativno** preko ffmpeg `life` filtera (cellular automaton + gold colorize + blur) — besplatno, no copyright issue.
   - **Canvas particle** — pure JS, bez asseta, live render.
2. Kombinacija: keep the new geometric image kao sekundarni sloj iza, + dodati live gold smoke canvas sloj iznad za pokret.

**Deliverable ove sesije:** Canvas-based gold smoke particle layer preko trenutne slide 1 pozadine, sa staticnim geometrijskim slojem kao pozadinska tekstura.
