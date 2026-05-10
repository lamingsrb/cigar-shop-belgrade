# Cigar Shop — Deploy & Domain Setup

Status: 2026-05-09. **Sajt je live na https://cigarshop.rs.** DNS je
auto-konfigurisan preko Loopia API user-a. Stari Shopify hosting (23.227.38.65)
isključen, www CNAME na shops.myshopify.com obrisan, AAAA isključen — sve
zamenjeno A → 76.76.21.21 (Vercel). Email infra (MX, SPF, DKIM, autoconfig)
nedirnuta — Loopia Mail i dalje radi normalno.

---

## Trenutno stanje

| Sta | Gde | Vlasnik |
|---|---|---|
| Source code | github.com/lamingsrb/cigar-shop-belgrade | lamingsrb (Lazar) |
| Vercel project | `lazar-milicevics-projects/cigar-shop-belgrade` | Lazar |
| Production deploy | https://cigar-shop-belgrade.vercel.app | Lazar |
| Live URL | https://cigarshop.rs | Lazar (Vercel) |
| Domen registracija | Loopia (cigarshop.rs) | Klijent (Vojin) |
| Domen u Vercel projektu | `cigarshop.rs` + `www.cigarshop.rs` | Lazar's tim |
| DNS | Loopia name servere; A @ + A www na 76.76.21.21 (Vercel) | Konfigurisano 09-05-2026 |
| Email | Loopia Mail (MX, SPF, DKIM netaknuti) | Klijent (Vojin) |

---

## DNS na Loopia — kako je odradjeno

Auto-konfigurisano 09-05-2026 preko Loopia XML-RPC API-ja
(`scripts/loopia-dns-setup.mjs`). API user `lazarm@loopiaapi` kreiran u
Loopia kontrol panelu (Account → API → Kreiraj API korisnika), sa svim
privilegijama (addZoneRecord, getZoneRecords, removeZoneRecord, ...).

**WAŽNO:** Loopia Srbija (`.rs` domeni) koristi `https://api.loopia.rs/RPCSERV`
endpoint, NE `https://api.loopia.se/RPCSERV` (švedski endpoint vraća `Wrong
username or password` za `.rs` domene). Ovo je dokumentovano u skripti.

### Šta je skripta uradila (surgical, idempotent)

**Obrisano:**
- `A @ 23.227.38.65` — stari Shopify hosting (Edge IP)
- `AAAA @ 2620:0127:f00f:5::` — stari Loopia IPv6 hosting
- `CNAME www → shops.myshopify.com` — stari Shopify www

**Dodato:**
- `A @ 76.76.21.21` — Vercel apex
- `A www 76.76.21.21` — Vercel www

**Sačuvano (NE dirano):**
- `MX 10 mailcluster.loopia.se`
- `MX 20 mail2.loopia.se`
- `TXT "v=spf1 include:spf.loopia.se -all"` (SPF za email)
- `TXT loopiadkim..._domainkey ...` (DKIM)
- `SRV _autodiscover._tcp` (Outlook autoconfig)
- `CNAME autoconfig → autoconfig.loopia.com` (mail client autoconfig)
- `NS ns1/ns2.loopia.se`

Email-safety check je deo skripte — ako bilo koji od MX/SPF record-a nije
preživeo izmenu, skripta exit-uje sa kodom 3 i upozorenjem.

### Re-pokretanje skripte (idempotent — sigurno više puta)

```powershell
cd Z:\IT_Projects\AI_Assistant\AI_Assistant_Projects\CigarShop
node scripts/loopia-dns-setup.mjs
```

Skripta prvo proverava postojeće record-e i preskače ono što već postoji.

---

## Predator-style transfer (vlasnistvo Vercel projekta)

Ovo je pitanje sa 09-05-2026 ("transfer kao za Predator"). Provera Vercel-a
pokazala je sledece za **Predator Laser Tag**:

| Sta | Stvarno stanje |
|---|---|
| GitHub repo | `github.com/lamingsrb/predator_laser_tag` (lamingsrb, ne klijent) |
| Vercel projekat | `lazar-milicevics-projects/predator_laser_tag` (Lazar's tim) |
| Domen `lasertagpredator.rs` | NIJE u Lazar's Vercel domains list |

Znaci za Predator **nije** odradjen klasican Vercel transfer (gde projekat
prelazi u potpuno drugi Vercel tim/account). Pravo stanje:
- Code i Vercel projekat su ostali kod Lazara.
- Domen `lasertagpredator.rs` je registrovan na klijenta (kod njegovog
  registrara, najverovatnije sa SixPack-om).
- DNS na klijentovom registraru pokazuje na Vercel deployment (CNAME na
  `cigar-shop-belgrade.vercel.app` ili A na 76.76.21.21).
- Za buduce updateove deploy-uje Lazar (cd Z drive → `npx vercel --prod`).

**Zakljucak za Cigar Shop:** vec smo u istom modelu kao Predator. Domen je
registrovan kod klijenta na Loopia, a Vercel projekat zivi kod Lazara.

Ako bismo zaista hteli **pravi transfer** Vercel projekta klijentu (tako da
klijent moze sam da deploy-uje, faktura ide klijentu, itd.), koraci bi bili:

1. **Klijent kreira Vercel nalog** (free hobby tier ili pro) na svoj email
2. **Klijent forkuje** GitHub repo na svoj GitHub nalog (ili da dobije pristup
   Lazar's repou)
3. **Vercel dashboard** → naš `cigar-shop-belgrade` projekat → `Settings` →
   `Transfer Project` → unesemo email klijenta
4. Klijent prihvata transfer u svojoj Vercel inboxu
5. Posle transfera projekat nestaje iz Lazar's tima i pojavljuje se kod
   klijenta. Lazar gubi kontrolu (osim ako klijent doda Lazar's email kao
   member-a tima).
6. Domeni i DNS settings ostaju nepromenjeni — domen sad pokazuje na novi
   tim's Vercel deployment.

**Preporuka:** za sad ostavi kao je (Predator-style). Klijent placa Loopia za
domen, Lazar drzi Vercel projekat i deployment. Ako klijent jednog dana zatrazi
da preuzme kontrolu, transfer mozemo da izvedemo za 5 minuta po koracima gore.

---

## Build & deploy workflow (lokalno)

```powershell
# Sync iz Z: (SMB) na C: (lokalno) — brze build vreme
robocopy "Z:\IT_Projects\AI_Assistant\AI_Assistant_Projects\CigarShop" `
         "C:\temp\cigarshop-build" /E /XD node_modules .next dist .git "Media RAW" Feedback_loop /XF "*.log"

# Build na C:
Set-Location C:\temp\cigarshop-build
$env:NEXT_TELEMETRY_DISABLED='1'
npm install   # samo prvi put ili posle package-lock izmene
npm run build # 1-2 sec, dist u dist/

# Deploy na Vercel (radi iz Z: jer je tamo .vercel/project.json)
Set-Location Z:\IT_Projects\AI_Assistant\AI_Assistant_Projects\CigarShop
npx vercel --prod --yes
```

`vercel.json` definise da Vercel sam radi build na cloud-u (iz uploadovanog
source-a, ne uploaduje dist), pa nas lokalni build sluzi samo kao QA.
`vite.config.js` define-uje 3 entry pointa: `index.html`, `blog.html`,
`category.html`.

---

## Provera posle DNS propagacije

```powershell
# DNS lookup
nslookup cigarshop.rs                # treba 76.76.21.21
nslookup www.cigarshop.rs            # treba 76.76.21.21

# HTTP/HTTPS
curl -I https://cigarshop.rs         # 200 OK + Server: Vercel
curl -I https://www.cigarshop.rs     # 200 OK ili 308 → apex
```

U Vercel dashboard-u (`Project Settings → Domains`) status menja iz
`Invalid Configuration` u `Valid Configuration` za par minuta posle DNS
propagacije.
