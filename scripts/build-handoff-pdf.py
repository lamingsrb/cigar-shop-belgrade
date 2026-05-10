"""Builds the client handoff PDF — Cigar Shop Belgrade.

Produces a single A4 PDF at:
  Hosting_Setup/Cigar_Shop_Predaja_2026-05-10.pdf

Contents (in order):
  1. Cover page (logo + title + date)
  2. Thank-you letter
  3. "Your site is live" overview
  4. Access credentials (Vercel, Loopia, Email)
  5. Project history — 5 phases
  6. How to request future changes
  7. What runs automatically
  8. Security do's and don'ts
  9. Support contacts + closing note

Non-tech Serbian audience. Serbian Latin dijakritike (š, ž, č, ć, đ) via
registered Arial TTFs. Champagne gold #d4af37 brand accent, white paper.

Adapted from Predator Laser Tag handoff (build-handoff-pdf.py).
"""
from __future__ import annotations
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import cm, mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    BaseDocTemplate, Frame, PageTemplate, Paragraph, Spacer, PageBreak,
    Image, Table, TableStyle, KeepTogether,
)
from reportlab.platypus.flowables import HRFlowable

# -----------------------------------------------------------------------
# Paths
# -----------------------------------------------------------------------
ROOT = Path(__file__).resolve().parent.parent
OUT_DIR = ROOT / "Hosting_Setup"
OUT_DIR.mkdir(parents=True, exist_ok=True)
OUT = OUT_DIR / "Cigar_Shop_Predaja_2026-05-10.pdf"
LOGO = ROOT / "public" / "assets" / "brand" / "logo-monogram-gold-512.png"  # transparent monogram

# -----------------------------------------------------------------------
# Fonts — Arial for full Serbian Latin support (š, ž, č, ć, đ)
# -----------------------------------------------------------------------
WIN_FONTS = Path("C:/Windows/Fonts")
pdfmetrics.registerFont(TTFont("Arial",    str(WIN_FONTS / "arial.ttf")))
pdfmetrics.registerFont(TTFont("Arial-B",  str(WIN_FONTS / "arialbd.ttf")))
pdfmetrics.registerFont(TTFont("Arial-I",  str(WIN_FONTS / "ariali.ttf")))
pdfmetrics.registerFont(TTFont("Arial-BI", str(WIN_FONTS / "arialbi.ttf")))
pdfmetrics.registerFontFamily(
    "Arial", normal="Arial", bold="Arial-B", italic="Arial-I", boldItalic="Arial-BI",
)

# -----------------------------------------------------------------------
# Colors — champagne gold palette (matches Cigar Shop brand)
# -----------------------------------------------------------------------
GOLD       = colors.HexColor("#d4af37")  # champagne (hero wordmark + logo)
GOLD_DEEP  = colors.HexColor("#b8935a")  # ember-deep
GOLD_SOFT  = colors.HexColor("#fbeecd")  # vellum / cream
GOLD_BG    = colors.HexColor("#fbf5e6")  # light wash for table headers
DARK       = colors.HexColor("#1a1a1a")
GRAY       = colors.HexColor("#666666")
LIGHT_BG   = colors.HexColor("#f5f5f7")
BORDER     = colors.HexColor("#dddddd")
LINK       = colors.HexColor("#0b63ce")
WARN_BG    = colors.HexColor("#fff4d6")
WARN_TXT   = colors.HexColor("#8a5a00")

# -----------------------------------------------------------------------
# Styles
# -----------------------------------------------------------------------
sheet = getSampleStyleSheet()

S_COVER_TITLE = ParagraphStyle(
    "CoverTitle", parent=sheet["Normal"],
    fontName="Arial-B", fontSize=30, leading=36, alignment=1,
    textColor=DARK, spaceBefore=0, spaceAfter=6,
)
S_COVER_SUB = ParagraphStyle(
    "CoverSub", parent=sheet["Normal"],
    fontName="Arial", fontSize=15, leading=22, alignment=1,
    textColor=GOLD_DEEP, spaceAfter=30,
)
S_COVER_META = ParagraphStyle(
    "CoverMeta", parent=sheet["Normal"],
    fontName="Arial", fontSize=10, leading=14, alignment=1,
    textColor=GRAY,
)

S_H1 = ParagraphStyle(
    "H1", parent=sheet["Normal"],
    fontName="Arial-B", fontSize=18, leading=24,
    textColor=GOLD_DEEP, spaceBefore=18, spaceAfter=10,
)
S_H2 = ParagraphStyle(
    "H2", parent=sheet["Normal"],
    fontName="Arial-B", fontSize=13, leading=18,
    textColor=DARK, spaceBefore=12, spaceAfter=6,
)
S_BODY = ParagraphStyle(
    "Body", parent=sheet["Normal"],
    fontName="Arial", fontSize=11, leading=17,
    textColor=DARK, spaceAfter=8, alignment=4,  # justify
)
S_BODY_LEFT = ParagraphStyle(
    "BodyLeft", parent=S_BODY, alignment=0,
)
S_BULLET = ParagraphStyle(
    "Bullet", parent=S_BODY, leftIndent=16, bulletIndent=4,
    spaceAfter=4, alignment=0,
)
S_CELL_LABEL = ParagraphStyle(
    "CellLabel", parent=sheet["Normal"],
    fontName="Arial-B", fontSize=10, leading=13, textColor=DARK,
)
S_CELL_VALUE = ParagraphStyle(
    "CellValue", parent=sheet["Normal"],
    fontName="Arial", fontSize=10, leading=13, textColor=DARK,
)
S_WARN = ParagraphStyle(
    "Warn", parent=sheet["Normal"],
    fontName="Arial-B", fontSize=10, leading=14,
    textColor=WARN_TXT, alignment=0,
    backColor=WARN_BG, borderPadding=8, borderColor=WARN_BG, borderWidth=0,
    spaceBefore=6, spaceAfter=10,
)
S_SIGN = ParagraphStyle(
    "Sign", parent=sheet["Normal"],
    fontName="Arial-I", fontSize=11, leading=16,
    textColor=DARK, alignment=0, spaceBefore=16,
)
S_PHASE_TITLE = ParagraphStyle(
    "PhaseTitle", parent=sheet["Normal"],
    fontName="Arial-B", fontSize=12, leading=16,
    textColor=GOLD_DEEP, spaceBefore=12, spaceAfter=4,
)
S_PHASE_DATE = ParagraphStyle(
    "PhaseDate", parent=sheet["Normal"],
    fontName="Arial-I", fontSize=10, leading=13,
    textColor=GRAY, spaceAfter=6,
)


# -----------------------------------------------------------------------
# Utility: colored rule separator
# -----------------------------------------------------------------------
def rule(color=GOLD, thickness=1.2, space_before=4, space_after=8):
    return HRFlowable(
        width="100%", thickness=thickness, lineCap="round", color=color,
        spaceBefore=space_before, spaceAfter=space_after,
    )


def bullet(text):
    return Paragraph(f"• {text}", S_BULLET)


def kv_table(rows, col1=4.5*cm, col2=11.5*cm):
    """Helper — 2-column key/value table with left column highlighted."""
    t = Table(rows, colWidths=[col1, col2])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (0, -1), LIGHT_BG),
        ("GRID",       (0, 0), (-1, -1), 0.5, BORDER),
        ("VALIGN",     (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING",(0, 0), (-1, -1), 8),
        ("RIGHTPADDING",(0, 0), (-1, -1), 8),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING",(0, 0), (-1, -1), 6),
    ]))
    return t


# -----------------------------------------------------------------------
# Page frame / footer
# -----------------------------------------------------------------------
PAGE_W, PAGE_H = A4
MARGIN = 2.0 * cm


def draw_footer(canvas, doc):
    canvas.saveState()
    canvas.setFont("Arial", 8)
    canvas.setFillColor(GRAY)
    canvas.drawString(MARGIN, 1.0 * cm, "Cigar Shop — Predaja sajta")
    canvas.drawRightString(PAGE_W - MARGIN, 1.0 * cm, f"strana {doc.page}")
    # gold hairline above footer
    canvas.setStrokeColor(GOLD)
    canvas.setLineWidth(0.6)
    canvas.line(MARGIN, 1.4 * cm, PAGE_W - MARGIN, 1.4 * cm)
    canvas.restoreState()


def draw_cover(canvas, doc):
    # No footer on cover page; decorative gold corners
    canvas.saveState()
    canvas.setStrokeColor(GOLD)
    canvas.setLineWidth(1.2)
    # decorative L-corner top-left
    canvas.line(MARGIN, PAGE_H - MARGIN, MARGIN + 60, PAGE_H - MARGIN)
    canvas.line(MARGIN, PAGE_H - MARGIN, MARGIN, PAGE_H - MARGIN - 60)
    # decorative L-corner bottom-right
    canvas.line(PAGE_W - MARGIN, MARGIN, PAGE_W - MARGIN - 60, MARGIN)
    canvas.line(PAGE_W - MARGIN, MARGIN, PAGE_W - MARGIN, MARGIN + 60)
    canvas.restoreState()


# -----------------------------------------------------------------------
# Build content
# -----------------------------------------------------------------------
def build_story():
    story = []

    # --- COVER ------------------------------------------------------
    story.append(Spacer(1, 3.5 * cm))
    if LOGO.exists():
        # Transparent monogram (~136×256 ratio); fit by height
        logo_img = Image(str(LOGO), width=3.4 * cm, height=6.4 * cm, kind="proportional")
        logo_img.hAlign = "CENTER"
        story.append(logo_img)
    story.append(Spacer(1, 1.5 * cm))
    story.append(Paragraph("Cigar Shop", S_COVER_TITLE))
    story.append(Paragraph("Predaja sajta", S_COVER_SUB))
    story.append(Spacer(1, 1.0 * cm))
    story.append(Paragraph("10. maj 2026.", S_COVER_META))
    story.append(Spacer(1, 0.3 * cm))
    story.append(Paragraph(
        "<i>Poverljiv dokument — sadrži šifre za pristup.<br/>"
        "Čuvati na sigurnom mestu.</i>", S_COVER_META))
    story.append(PageBreak())

    # --- ZAHVALNICA -------------------------------------------------
    story.append(Paragraph("Hvala Vam", S_H1))
    story.append(rule())
    story.append(Paragraph("Poštovani Vojine, poštovana Ana,", S_BODY_LEFT))
    story.append(Paragraph(
        "Kroz <b>šest krugova feedback-a</b>, dvadesetak dana fokusiranog rada "
        "i mnogo zajedničkih pregleda fotografija, video materijala i Excel "
        "tabela sa preko <b>500 cigara</b> i <b>260 boca</b>, zajedno smo "
        "napravili sajt koji danas preuzimate. Svaka kategorija u humidoru, "
        "svaki brend u biblioteci, svaka adresa među pet lokacija — provereno "
        "sa Vama pre nego što je ušlo u finalnu verziju.",
        S_BODY))
    story.append(Paragraph(
        "Hvala Vam na poverenju, na strpljenju i na tome što ste mi poslali "
        "kompletnu Excel evidenciju asortimana iz pet radnji baš u pravom "
        "trenutku, kao i kvalitetan video materijal i fotografije Horacio i "
        "kubanskih kolekcija. Sajt koji danas preuzimate — premium, savremen, "
        "brz i potpuno Vaš — nije mogao da postoji bez tog materijala i Vaše "
        "jasne vizije šta želite da klijent oseti kada otvori cigarshop.rs: "
        "<b>tišinu, strpljenje i ritual</b>.",
        S_BODY))
    story.append(Paragraph(
        "Sad je na red došao najlepši deo priče: da Vam sajt donosi nove "
        "klijente, da ljubitelji premium cigara i pića pronađu put do Vaših "
        "humidora od Ušća do Kosovske, i da svaka novootvorena Cohiba "
        "kutija nađe pravog vlasnika.",
        S_BODY))
    story.append(Paragraph(
        "Od srca,<br/><b>Lazar Milićević</b><br/>"
        "<font size='9' color='#666666'>lamingsrb@gmail.com</font>",
        S_SIGN))
    story.append(PageBreak())

    # --- SAJT JE LIVE -----------------------------------------------
    story.append(Paragraph("Vaš sajt je live", S_H1))
    story.append(rule())
    story.append(Paragraph(
        "Od <b>10. maja 2026.</b> sajt <b>https://cigarshop.rs</b> je javan "
        "i dostupan svima.",
        S_BODY))
    info_data = [
        [Paragraph("<b>Glavni URL</b>", S_CELL_LABEL),
         Paragraph("<b>https://cigarshop.rs</b>", S_CELL_VALUE)],
        [Paragraph("<b>www verzija</b>", S_CELL_LABEL),
         Paragraph("https://www.cigarshop.rs — automatski preusmerava na glavni URL", S_CELL_VALUE)],
        [Paragraph("<b>Hosting</b>", S_CELL_LABEL),
         Paragraph("<b>Vercel</b> (globalna mreža servera, automatsko skaliranje)", S_CELL_VALUE)],
        [Paragraph("<b>SSL sertifikat</b>", S_CELL_LABEL),
         Paragraph("aktivan (ikona katanca u browser-u) — automatski se obnavlja", S_CELL_VALUE)],
        [Paragraph("<b>Mesečni trošak hostinga</b>", S_CELL_LABEL),
         Paragraph("<b>0 RSD</b> (Vercel Hobby plan, besplatan za ovaj obim posete)", S_CELL_VALUE)],
        [Paragraph("<b>Email</b>", S_CELL_LABEL),
         Paragraph("Vaš postojeći Loopia Mail (mailcluster.loopia.se) <b>nije diran</b> — radi kao i pre", S_CELL_VALUE)],
    ]
    story.append(kv_table(info_data, col1=4.8 * cm, col2=11.2 * cm))
    story.append(Spacer(1, 10))
    story.append(Paragraph(
        "<b>Šta ovo u praksi znači za Vas:</b> sajt se učitava brzo iz bilo "
        "koje zemlje (Vercel ima servere širom sveta — korisnik iz Beograda "
        "dobija sadržaj sa evropskog servera, korisnik iz Moskve sa moskovskog). "
        "Ne morate da brinete o SSL sertifikatu, bekapu, održavanju — sve to "
        "radi Vercel automatski u pozadini. <b>Email i dalje radi preko Loopia "
        "servera</b> — DNS migracija je odrađena pažljivo da se MX zapisi i "
        "SPF/DKIM ne pomere.",
        S_BODY))
    story.append(PageBreak())

    # --- PRISTUPI ---------------------------------------------------
    story.append(Paragraph("Vaši pristupi", S_H1))
    story.append(rule())

    # --- Vercel
    story.append(Paragraph("Vercel — gde Vaš sajt živi", S_H2))
    story.append(Paragraph(
        "Trenutno je projekat u <b>mom Vercel timu</b> (lazar-milicevics-projects). "
        "Razlog: ovako mogu da deploy-ujem izmene koje tražite za <b>30 sekundi</b>, "
        "bez Vašeg uključivanja. <b>Domen cigarshop.rs i dalje pripada Vama</b> — "
        "registrovan je u Vašem Loopia nalogu, što znači da u svakom trenutku "
        "možete preusmeriti sajt na drugi hosting ili drugog developera.",
        S_BODY))
    story.append(Paragraph(
        "<b>Ako želite full kontrolu nad Vercel projektom:</b> Vi otvorite "
        "Vercel nalog (besplatno, na Vaš email), pa se uradi <b>Transfer "
        "Project</b> u mojoj dashboard-u — projekat prelazi pod Vaš tim za "
        "5 minuta. Javite mi kad budete spremni.",
        S_BODY))
    vercel = [
        [Paragraph("<b>Dashboard URL</b>", S_CELL_LABEL),
         Paragraph("<b>https://vercel.com/lazar-milicevics-projects/cigar-shop-belgrade</b>", S_CELL_VALUE)],
        [Paragraph("<b>Trenutni vlasnik tima</b>", S_CELL_LABEL),
         Paragraph("Lazar Milićević (developer)", S_CELL_VALUE)],
        [Paragraph("<b>Ime projekta</b>", S_CELL_LABEL),
         Paragraph("<font face='Courier'>cigar-shop-belgrade</font>", S_CELL_VALUE)],
        [Paragraph("<b>GitHub repo</b>", S_CELL_LABEL),
         Paragraph("https://github.com/lamingsrb/cigar-shop-belgrade", S_CELL_VALUE)],
        [Paragraph("<b>Vaš pristup danas</b>", S_CELL_LABEL),
         Paragraph("Indirektno — javite mi šta želite da promenite, ja deploy-ujem.", S_CELL_VALUE)],
    ]
    story.append(kv_table(vercel, col1=4.8 * cm, col2=11.2 * cm))

    # --- Loopia
    story.append(Paragraph("Loopia — Vaš domen i email", S_H2))
    story.append(Paragraph(
        "Domen <b>cigarshop.rs</b> je u Vašem Loopia nalogu — Vi ga posedujete "
        "i Vi ga obnavljate godišnje. Loopia takođe servira Vaš email "
        "(mailcluster.loopia.se), DNS server-i ostaju kod njih (ns1/ns2.loopia.se).",
        S_BODY))
    loopia = [
        [Paragraph("<b>Kontrol panel</b>", S_CELL_LABEL),
         Paragraph("<b>https://customerzone.loopia.rs</b>", S_CELL_VALUE)],
        [Paragraph("<b>Korisničko ime</b>", S_CELL_LABEL),
         Paragraph("<b><font face='Courier'>cigarshop.rs</font></b>", S_CELL_VALUE)],
        [Paragraph("<b>Lozinka</b>", S_CELL_LABEL),
         Paragraph("<i>Vaša postojeća lozinka iz Loopia welcome email-a (Vojin@yahoo).</i><br/>"
                   "<font size='8' color='#666'>Ako je zaboravite — klik na 'Zaboravljena lozinka' na login stranici.</font>",
                   S_CELL_VALUE)],
        [Paragraph("<b>Korisnički broj</b>", S_CELL_LABEL),
         Paragraph("<font face='Courier'>FA76-52-57-4553</font> (sigurnosni podatak)", S_CELL_VALUE)],
        [Paragraph("<b>Datum isteka domena</b>", S_CELL_LABEL),
         Paragraph("<b>26. jun 2026.</b> — račun za obnovu Vam stiže od Loopia ~mesec dana pre", S_CELL_VALUE)],
    ]
    story.append(kv_table(loopia, col1=4.8 * cm, col2=11.2 * cm))

    story.append(Paragraph(
        "<b>Šta smete u Loopia panelu:</b>",
        S_CELL_LABEL))
    story.append(bullet("Da obnovite domen kad istekne (jednom godišnje, ~1.500 RSD za .rs)."))
    story.append(bullet("Da menjate email naloge (dodajete nove adresa@cigarshop.rs ako trebate)."))
    story.append(bullet("Da vidite spisak DNS zapisa (samo pregled je bezbedan)."))
    story.append(Paragraph(
        "<b>VAŽNO — ne dirati u Loopia panelu:</b> DNS zapise (A, MX, TXT). "
        "Ako se promeni A zapis ili MX zapis, sajt prestaje da radi ili Vam "
        "ne stižu emailovi. <b>Pre bilo kakve DNS izmene me pozovite.</b>",
        S_WARN))
    story.append(PageBreak())

    # --- ŠTA JE URAĐENO ---------------------------------------------
    story.append(Paragraph("Šta je urađeno — put do sajta", S_H1))
    story.append(rule())
    story.append(Paragraph(
        "Projekat je trajao od <b>22. aprila do 10. maja 2026</b> i prošao "
        "kroz <b>šest velikih krugova feedback-a</b> (3 od Vojina, 3 od Ane) "
        "i preko <b>50 commit verzija</b> u Git istoriji dok nismo stigli do "
        "finalne. Svaka izmena je proverena sa Vama pre nego što je ušla u "
        "produkciju.",
        S_BODY))
    story.append(Paragraph(
        "<b>Ovo je jedini ispravan put do odličnog sajta.</b> Bez Vaše Excel "
        "evidencije sa <b>500+ cigara</b> i <b>260+ pića</b>, bez Aninih "
        "fotografija humidora i Horacio kolekcija, bez Vojinovih jasnih "
        "instrukcija šta želi da klijent vidi prvo — sajt koji danas "
        "preuzimate ne bi imao ovu dubinu.",
        S_BODY))
    story.append(Paragraph(
        "Sve izmene grupisane u <b>5 faza</b>:",
        S_BODY))

    phases = [
        ("Faza 1 — Temelj sajta i prvi materijali", "22. april 2026.", [
            "Prvi skelet sajta i arhitektura sekcija (Hero, Manifest, Humidor, Pića, Oprema, Galerija, Kontakt).",
            "Učitan Vaš Excel <b>CIGAR SHOP LOKACIJE.xlsx</b> sa 5 realnih adresa, telefonima i radnim vremenima.",
            "Kompletan brend katalog parsiran iz Vaše Excel evidencije: <b>500+ cigara</b> iz 7 zemalja "
            "(Kuba, Dominikana, Nikaragva, Honduras, Kostarika, Meksiko, Italija) i <b>260+ pića</b> u 8 kategorija.",
            "Hero video iz prvih materijala (storefront + interior + humidor pregled).",
            "Instagram handle <b>@cigarshopbelgrade</b> integrisan u footer i kontakt.",
            "Mobilna responsivnost — sajt radi isto lepo na telefonu kao na desktopu.",
            "Kompletan favicon set generisan iz Vašeg logoa.",
        ]),
        ("Faza 2 — Tri-slide hero + Anin tekst o procesu", "23 — 24. april 2026.", [
            "Hero proširen na <b>3 slajda</b>: brand wordmark, 5 lokacija, live video.",
            "Slajd 1 — premium tamna pozadina sa zlatnim naglascima (PixVerse generisana).",
            "Slajd 2 — \"Sedam regija, jedna strast\" sa kompilacijom proizvoda.",
            "Slajd 3 — live video kompilacija (ulaz + interiori + humidor).",
            "Sekcije zamenjene mestima: <b>Humidor pre Biblioteke cigara</b>.",
            "Anin finalan tekst o <b>procesu proizvodnje cigare</b> — ručna izrada, fermentacija, "
            "torcedori, odležavanje. <b>4 paragrafa, srpski + engleski prevod</b>.",
            "Kontakt sekcija: dodata rečenica o <b>5 lokacija + dropdown picker</b> za pojedinačnu radnju.",
            "Logo redizajn — moderan, čitljiv, sa subwordmark-om \"Tobacco and Drinks\".",
        ]),
        ("Faza 3 — Veliki redizajn (Ana, audio feedback)", "27. april 2026.", [
            "Loader pojednostavljen — sajt se učitava odmah, bez šibice i bez teksta.",
            "<b>\"CIGAR SHOP\" tipografija u punu zlatnu boju</b> (#d4af37 champagne) — "
            "vertikalni gradient od krem do bronze.",
            "Hero — uklonjeno \"Zapali iskustvo\" dugme.",
            "Slajd 2 → \"Pronađite nas na 5 lokacija\" sa adresama svih 5 prodavnica.",
            "Slajd 3 → samo video, bez teksta (modern man + cigara, PixVerse generisan).",
            "Library: ceo deo zamenjen full-bleed video kompilacijom (\"Godine tišine za trenutak uživanja\").",
            "Cigar brand division premešten na kraj Humidor sekcije, podeljen na <b>2 grupe: Kuba i Novi svet</b>.",
            "Brand UX: slajd-galerija logoa + slajd-galerija proizvoda po brendu (auto-advance).",
            "Spirits redizajn — preimenovano u <b>\"Nastavi sa pićem\"</b>, podele: Viski / Burbon / Džin / Konjak / Rum / Rakija.",
            "Gear preimenovanja: <b>\"Rezači\" → \"Sekači\"</b>, <b>\"Putni etui\" → \"Futrole\"</b>.",
            "<b>10 blog postova</b> — autorski tekstovi: Kolumbo i prvi dim Evrope, Cohiba i Castro, Churchill i Romeo y Julieta, "
            "embargo i bekstvo dinastija, torcedori, humidor nauka 70%, vitole, Vuelta Abajo, 47 koraka...",
            "Galerija prebačena na <b>6 vidljivih pločica</b> sa auto-advance carousel-om.",
        ]),
        ("Faza 4 — Anin polish (Godine tišine + sekcije)", "2. maj 2026.", [
            "Sekcija \"Ritual u kadru\" preimenovana u <b>\"Godine tišine\"</b> — galerija postaje samostalna.",
            "Spirits — sklonjene slike iz destilerije iz nastavi-sa-pićem sekcije.",
            "Spirits & Gear: zadržana podela po grupama, ali kategorije sada otvaraju detaljnije podstranice.",
            "Sekcija \"Preseci. Zapali. Uživaj.\" — kompletno uklonjena (Anina odluka).",
            "Hero slajd 2 → planirana zamena pozadinom u stilu slajd 1 (asset još u izradi).",
            "Galerija \"Godine tišine\" učitana sa Vašim novim kompletom slika cigara, plantaža, fabrike.",
        ]),
        ("Faza 5 — Vojinov final + Lansiranje", "9 — 10. maj 2026.", [
            "Humidor: stat blok (70% / 20°C / 5 humidora) i \"Po regiji\" tab-showcase <b>uklonjeni</b>.",
            "Umesto njih — <b>2 velike klikabilne kartice (Kuba / Novi svet)</b> koje vode na detaljne podstranice "
            "sa originalnim tekstom i galerijom slika.",
            "Spirits sekcija: tab-showcase zamenjen <b>6 klikabilnih kartica</b> (Viski / Burbon / Džin / Konjak / Rum / Rakija). "
            "Prva slika slajdshov-a → premium kadar pića sa cigaramа.",
            "Gear sekcija: tab-showcase zamenjen <b>5 klikabilnih kartica</b> (Sekači / Upaljači / Humidori / Pepeljare / Futrole). "
            "Prva slika slajdshov-a → atmosferski kadar viski + cigara + sekač + upaljač.",
            "<b>13 originalnih detail strana</b> kreirano: 2 humidor regije + 6 kategorija pića + 5 kategorija opreme. "
            "Svaka sa hero slikom, autorskim tekstom u 4-6 paragrafa i galerijom.",
            "Galerija \"Godine tišine\" filtrirana na <b>24 hand-picked slike</b> (uklonjeno 38 duplikata i mutnih).",
            "<b>Logo monogram usklađen sa hero \"CIGAR SHOP\" wordmark-om</b> — isti vertikalni gold gradient.",
            "Domen <b>cigarshop.rs</b> dodat u Vercel projekat (apex + www).",
            "DNS na Loopia auto-konfigurisan preko XML-RPC API skripte: stari Shopify (23.227.38.65) zamenjen Vercel-om "
            "(76.76.21.21), <b>email infra (MX, SPF, DKIM) nedirnuta</b>.",
            "SSL sertifikat automatski izdat od <b>Let's Encrypt</b> preko Vercel-a posle DNSSEC sinhronizacije.",
            "<b>Sajt je live na https://cigarshop.rs.</b>",
        ]),
    ]

    for title, date, items in phases:
        block = [
            Paragraph(title, S_PHASE_TITLE),
            Paragraph(date, S_PHASE_DATE),
        ] + [bullet(it) for it in items]
        story.append(KeepTogether(block))
    story.append(PageBreak())

    # --- KAKO SE TRAZE IZMENE ---------------------------------------
    story.append(Paragraph("Kako se traže izmene u budućnosti", S_H1))
    story.append(rule())
    story.append(Paragraph(
        "Jednostavno — <b>pišete mi</b>. Email, WhatsApp ili telefon. Kažete šta "
        "želite da se promeni: novi brend u biblioteci, izmena cene, nova "
        "fotografija humidora, novi blog post, dodavanje šeste lokacije…",
        S_BODY))
    story.append(Paragraph("Tok izmene:", S_CELL_LABEL))
    story.append(bullet("Vi pošaljete opis promene (ili foto / Excel ako se radi o asortimanu)."))
    story.append(bullet("Ja uradim izmenu u kodu i pošaljem je na GitHub."))
    story.append(bullet("Vercel automatski detektuje promenu i deploy-uje novu verziju za <b>~30 sekundi</b>."))
    story.append(bullet("Vi osvežite sajt u browseru — nova verzija je tamo."))
    story.append(Spacer(1, 6))
    story.append(Paragraph(
        "<b>Tipične izmene koje očekujem:</b>",
        S_CELL_LABEL))
    story.append(bullet("Novi brendovi cigara ili pića (kad proširite asortiman)."))
    story.append(bullet("Sezonske promocije ili novi blog post (npr. \"Cohiba Behike — kratka istorija\")."))
    story.append(bullet("Promena radnog vremena ili kontakt podataka neke radnje."))
    story.append(bullet("Nova lokacija (otvarate šestu radnju)."))
    story.append(bullet("Sezonska tema sajta (Božić, Nova godina, dan zaljubljenih…)."))
    story.append(PageBreak())

    # --- AUTOMATIZMI ------------------------------------------------
    story.append(Paragraph("Šta radi samo, bez Vas", S_H1))
    story.append(rule())
    story.append(Paragraph(
        "Sajt u pozadini ima nekoliko stvari koje se odvijaju automatski — "
        "niste ih Vi postavili, ne morate ih održavati:",
        S_BODY))
    auto = [
        [Paragraph("<b>SSL sertifikat</b>", S_CELL_LABEL),
         Paragraph("Vercel ga automatski obnavlja <b>svaka 3 meseca</b> (Let's Encrypt). Nikad ne ističe.",
                   S_CELL_VALUE)],
        [Paragraph("<b>Bekap koda</b>", S_CELL_LABEL),
         Paragraph("GitHub čuva celu istoriju — svih 50+ commit verzija u kojima je projekat prošao. "
                   "Ako je potrebno, sajt se vraća na bilo koju prethodnu verziju za 30 sekundi.",
                   S_CELL_VALUE)],
        [Paragraph("<b>Bekap DNS-a</b>", S_CELL_LABEL),
         Paragraph("Loopia automatski čuva DNS backup — ako se nešto pokvari u DNS zapisima, "
                   "vraća se preko panela za par klikova.",
                   S_CELL_VALUE)],
        [Paragraph("<b>Skaliranje</b>", S_CELL_LABEL),
         Paragraph("Ako za vikend dobijete 10× više poseta (npr. holiday traffic), sajt to "
                   "preživljava bez usporavanja. Vercel ima globalnu mrežu servera koja "
                   "dinamički skalira.",
                   S_CELL_VALUE)],
        [Paragraph("<b>Dvojezičnost</b>", S_CELL_LABEL),
         Paragraph("Sajt ima srpski i engleski prevod. Korisnik bira u headeru (SR / EN). "
                   "Sav novi sadržaj koji dodajem ide u oba jezika.",
                   S_CELL_VALUE)],
        [Paragraph("<b>Email isporuka</b>", S_CELL_LABEL),
         Paragraph("Vaš email cigarshop.rs (Loopia Mail) je nedirnut tokom DNS migracije. "
                   "MX, SPF, DKIM zapisi su sačuvani.",
                   S_CELL_VALUE)],
    ]
    story.append(kv_table(auto, col1=4.5 * cm, col2=11.5 * cm))

    # --- SIGURNOST --------------------------------------------------
    story.append(Paragraph("Sigurnost — par pravila", S_H1))
    story.append(rule())
    story.append(Paragraph("<b>Uradite:</b>", S_CELL_LABEL))
    story.append(bullet("<b>Ako primite mejl da je Vaš nalog \"hakovan\" ili \"suspendovan\"</b> — ne klikćite linkove. Prvo me pozovite."))
    story.append(bullet("Šifre iz ovog dokumenta čuvajte kao tajnu. Ne deliti preko običnog emaila neznancima."))
    story.append(bullet("Loopia račun za obnovu domena plaćajte uvek na vreme — ako istekne, sajt prestaje da radi."))
    story.append(Paragraph("<b>Ne dirajte:</b>", S_CELL_LABEL))
    story.append(bullet("DNS zapise u Loopia panelu — ako se A, MX ili TXT zapis promeni, ili sajt prestaje da radi, ili Vam ne stižu emailovi."))
    story.append(bullet("Promenu nameservera (ns1/ns2.loopia.se) — to je delikatna stvar, samo pitajte mene pre."))
    story.append(bullet("Brisanje email naloga ako su povezani sa autodiscover/DKIM zapisima."))
    story.append(Paragraph(
        "Ako nešto deluje čudno (sajt ne radi, ne stiže email, mapa ne učitava lokacije, "
        "fotografije nestale, bilo šta) — <b>prvi potez je da me pozovete</b>. Ne trošite "
        "sat vremena u panici — 80% stvari se reši za 10 minuta sa moje strane.",
        S_BODY))
    story.append(PageBreak())

    # --- KONTAKT ----------------------------------------------------
    story.append(Paragraph("Podrška i kontakti", S_H1))
    story.append(rule())
    kontakt = [
        [Paragraph("<b>Developer (ja)</b>", S_CELL_LABEL),
         Paragraph("<b>Lazar Milićević</b><br/>"
                   "Email: <b><font face='Courier'>lamingsrb@gmail.com</font></b><br/>"
                   "GSM: <b><font face='Courier'>+381 64 121 32 92</font></b>",
                   S_CELL_VALUE)],
        [Paragraph("<b>Vercel podrška</b>", S_CELL_LABEL),
         Paragraph("https://vercel.com/help<br/>"
                   "<font size='8' color='#666'>Za tehnička pitanja oko Vercel platforme. Najbolje je prvo da pitate mene.</font>",
                   S_CELL_VALUE)],
        [Paragraph("<b>Loopia podrška (domen + email)</b>", S_CELL_LABEL),
         Paragraph("https://www.loopia.rs/podrska/<br/>"
                   "Email: <font face='Courier'>info@loopia.rs</font><br/>"
                   "<font size='8' color='#666'>Za pitanja oko obnove domena, email naloga, fakture.</font>",
                   S_CELL_VALUE)],
    ]
    story.append(kv_table(kontakt, col1=5.2 * cm, col2=10.8 * cm))

    # --- POSLEDNJA REC ----------------------------------------------
    story.append(Spacer(1, 16))
    story.append(Paragraph("Poslednja reč", S_H1))
    story.append(rule())
    story.append(Paragraph(
        "Ovaj sajt je sada živ i Vaš. Domen, sadržaj, vizuelni identitet, "
        "fotografije, blog, baza brendova — sve na jednom mestu, u Vašim rukama. "
        "Ja sam ovde kad god Vam nešto zatreba — od dodavanja nove Cohibe "
        "u biblioteku do sezonske promocije.",
        S_BODY))
    story.append(Paragraph(
        "Srećno sa svakim sledećim klijentom koji otvori vrata. Nek` ih bude "
        "što više — onih koji znaju zašto je cigara <i>godina tišine</i> i "
        "ko cene <i>trenutak uživanja</i>.",
        S_BODY))
    story.append(Paragraph("— Lazar", S_SIGN))

    return story


# -----------------------------------------------------------------------
# Assemble document
# -----------------------------------------------------------------------
def main():
    doc = BaseDocTemplate(
        str(OUT),
        pagesize=A4,
        leftMargin=MARGIN, rightMargin=MARGIN,
        topMargin=MARGIN, bottomMargin=MARGIN,
        title="Cigar Shop — Predaja sajta",
        author="Lazar Milićević",
        subject="Klijentska predaja sajta",
    )
    frame = Frame(
        MARGIN, MARGIN, PAGE_W - 2 * MARGIN, PAGE_H - 2 * MARGIN,
        leftPadding=0, rightPadding=0, topPadding=0, bottomPadding=0,
        id="normal",
    )
    cover_template = PageTemplate(id="cover", frames=frame, onPage=draw_cover)
    main_template  = PageTemplate(id="main",  frames=frame, onPage=draw_footer)
    doc.addPageTemplates([cover_template, main_template])

    story = build_story()
    from reportlab.platypus import NextPageTemplate
    injected = []
    inserted = False
    for fl in story:
        if not inserted and isinstance(fl, PageBreak):
            injected.append(NextPageTemplate("main"))
            injected.append(fl)
            inserted = True
        else:
            injected.append(fl)

    doc.build(injected)
    size_kb = OUT.stat().st_size / 1024
    print(f"[done] {OUT}  ({size_kb:.1f} KB)")


if __name__ == "__main__":
    main()
