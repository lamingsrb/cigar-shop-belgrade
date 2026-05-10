# Vojinov feedback — 9. maj 2026.

Izvor: poruka 09-05-2026 u toku Claude Code sesije, plus dodatne ispravke
tokom rada (logo nijansa, orphan red u gear gridu, Predator-style transfer
pitanje, checklist task).

---

## Originalni tekst (verbatim)

> Ok legendo, imamo novi feedback, novi dan, znas sta trebas d akreiras sve.
>
> Ovo je feedback:
>
> 1. Hero sekciju ne diraj za sada.
> 2. Sekciju tvoj izbor nas svet, ne diraj za sada.
> 3. Sekcija udji u himidior, tu izbrisi deo na dnu texta sa procentima i
>    brojevima, oznacio sma ti na prvoj slici, zatim ceo ovaj deo na dnu te
>    sekcije, od po regiji do kraja sekcije, oznacio sam ti na drugoj slici,
>    i to obrisi. Umesto tog dela, postavices jednostavno prikazanu podelu
>    Kuba i Novi svet, tako da se vide dve klikabilne slike, sirinom cele te
>    sekcije, lepo uskladjene i animativne na prelazak misem, na sredini da
>    imaju takodje naziv Kuba, i druga Novi svet. Klikom na svaku od te dve
>    slicice, zelim da se otvori zasebna stranica o toj sekciji, gde cemo
>    ubaciti text i slike te grupe. Stranica treba da izgleda kao sto je
>    odradjeno kad se klikne na blog sta se otvori, tako da se otvara i kad
>    se klikne na te dve slike.
>
> 4. U sekciji nastavi sa picem, zadrzavamo slajdshov koji je sa desne
>    strane texta, ali za prvu i pocetnu sliku stavljamo sliku pica odavde,
>    pronadji je i stavi: Z:\IT_Projects\AI_Assistant\AI_Assistant_Projects\CigarShop\Feedback_loop\09-05-2026\Media
>    - Zatim u istoj sekciji, podelu brisemo takodje kao i u prethodnoj
>      sekciji, i stavljamo grupaciju s aklikabilnim slikama, poput onoga sto
>      radimo i sa sekcijom iznad vec.
>
> 5. Sto se tice sekcije alati rituala, sliku koj astoji sa desne strane
>    texta, menjamo sa slikom alata odavde takodje nadji je: Z:\IT_Projects\AI_Assistant\AI_Assistant_Projects\CigarShop\Feedback_loop\09-05-2026\Media
>    - Zatim u istoj sekciji, podelu brisemo takodje kao i u prethodnoj
>      sekciji, i stavljamo grupaciju s aklikabilnim slikama, poput onoga
>      sto radimo i sa sekcijom iznad vec.
>
> 6. Godine tisine sekcija ostaje, ali je potrebno pazljivo odabrati slike,
>    i izbaciti gomilu duplikata i ruznih slika, vec samo nekolicina prelepih
>    da se uklope.
>
> 7. I poslednje, ali ne manje bitno, boja logoa mora da se uskladi, da bude
>    indenticna nijansa i boja boji texta Cigar shop na prvom slajdu hero
>    sekcije. Menjaj generalno boju logoa, gde god se logo na stranici
>    nalazi.
>
> 8. I sad poslednje, obecavam, potrebno je publisovati sajt s apravim
>    domenom. Podaci za pristup su ovo:
>    Domen cigarshop.rs
>    [Loopia kredencijali — sacuvani u CREDENTIALS.local.md, gitignored]

## Naknadne ispravke u toku sesije

> jos ova sitnica, centralizuj donji red

(Slika sa 5 kartica u Gear sekciji gde je orphan red od 2 kartice ostao
levo-poravnan; treba ih centrirati.)

> takodje nijansa boje logoa nije ista kao i nijansa bolje ext cigar shop
> na prvom hero slajdu i dlaje, resi to jednom za svagda

(Prvi pokušaj recolor PNG nije bio dovoljan — nijansa logo monogram-a
ostala je tamnija/manje saturirana od `--champagne #d4af37` koja se koristi
za hero wordmark.)

> Zelim da transver sajta uradimo kao sto smo to uradii z apredator sajt,
> pogledaj predator projekat na vercelu, nekako smo ostavili d akod zivi na
> mom githubu, otvorili smo klijentu novi vercel nalog, i nekako u njega
> ubacili sajt, proveri tacne korake, mozda smo negde i zapisali za ubuduce

(Verifikacija Predator setup-a — videti DEPLOY.md za nalaze.)

> Takodje, treba a kreiras listu cjhcecklist taskova oje nam je ana dala da
> odradimo u feedbacku i koje smo odradili, to si zaboravio ovde :
> Z:\IT_Projects\AI_Assistant\AI_Assistant_Projects\CigarShop\Feedback_loop\09-05-2026\
> kao i za ostale dane sto imamo

(Razlog postojanja ovog FEEDBACK-VOJIN.md i TASKS.md za današnji dan; takođe
backfill TASKS.md za prethodne dane gde nije postojao.)

---

## Asseti (priloženo u Media/)

- `KUBA 9.jpg` — hero slika za Kuba region kartice (ima "Not All Cigars Are
  Created Equal" tekst gore i "BL4 CiGAR Co." watermark dole — moramo da
  ih iskropujemo).
- `PICE 1.jpg` — slika sipanja konjaka u čašu sa kubanskim cigarama, prva
  slika slajdshov-a u "Nastavi sa pićem" sekciji.
- `OPREMA 6.jpg` — atmosferski kadar viski + cigara + sekač + upaljač, za
  "Alati rituala" desnu sliku.
