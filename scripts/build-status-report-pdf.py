"""Builds a mid-project status report PDF — Cigar Shop Belgrade.

NOT the final handover. Snapshot stanja adresovan timu MyCase.

Focus: koliko je truda uloženo (99 izmena, 24 dana), šta je sve urađeno,
i šta još ostaje (klijent treba da dostavi slike, video i tekstove za
detaljniju podelu po sekcijama).

Output:
  Hosting_Setup/Cigar_Shop_Status_Report_2026-05-11.pdf
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
OUT = OUT_DIR / "Cigar_Shop_Status_Report_2026-05-11.pdf"
LOGO = ROOT / "public" / "assets" / "brand" / "logo-monogram-gold-512.png"

# -----------------------------------------------------------------------
# Fonts — Arial za pun srpski Latin set (š, ž, č, ć, đ)
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
# Colors — gold palette
# -----------------------------------------------------------------------
GOLD       = colors.HexColor("#d4af37")
GOLD_DEEP  = colors.HexColor("#b8935a")
GOLD_BG    = colors.HexColor("#fbf5e6")
DARK       = colors.HexColor("#1a1a1a")
GRAY       = colors.HexColor("#666666")
LIGHT_BG   = colors.HexColor("#f5f5f7")
BORDER     = colors.HexColor("#dddddd")
GREEN_OK   = colors.HexColor("#0a7b3a")
ORANGE_TODO = colors.HexColor("#c87000")

# -----------------------------------------------------------------------
# Styles
# -----------------------------------------------------------------------
sheet = getSampleStyleSheet()

S_COVER_TITLE = ParagraphStyle(
    "CoverTitle", parent=sheet["Normal"],
    fontName="Arial-B", fontSize=26, leading=32, alignment=1,
    textColor=DARK, spaceBefore=0, spaceAfter=6,
)
S_COVER_SUB = ParagraphStyle(
    "CoverSub", parent=sheet["Normal"],
    fontName="Arial", fontSize=14, leading=20, alignment=1,
    textColor=GOLD_DEEP, spaceAfter=30,
)
S_COVER_META = ParagraphStyle(
    "CoverMeta", parent=sheet["Normal"],
    fontName="Arial", fontSize=10, leading=14, alignment=1,
    textColor=GRAY,
)

S_H1 = ParagraphStyle(
    "H1", parent=sheet["Normal"],
    fontName="Arial-B", fontSize=17, leading=22,
    textColor=GOLD_DEEP, spaceBefore=14, spaceAfter=8,
)
S_H2 = ParagraphStyle(
    "H2", parent=sheet["Normal"],
    fontName="Arial-B", fontSize=12, leading=16,
    textColor=DARK, spaceBefore=10, spaceAfter=4,
)
S_BODY = ParagraphStyle(
    "Body", parent=sheet["Normal"],
    fontName="Arial", fontSize=10.5, leading=15,
    textColor=DARK, spaceAfter=6, alignment=4,
)
S_BODY_LEFT = ParagraphStyle(
    "BodyLeft", parent=S_BODY, alignment=0,
)
S_BULLET = ParagraphStyle(
    "Bullet", parent=S_BODY, leftIndent=14, bulletIndent=2,
    spaceAfter=2, alignment=0, fontSize=10, leading=13,
)
S_COMMIT_HASH = ParagraphStyle(
    "CommitHash", parent=sheet["Normal"],
    fontName="Courier", fontSize=8.5, leading=12,
    textColor=GOLD_DEEP, alignment=0,
)
S_PHASE_TITLE = ParagraphStyle(
    "PhaseTitle", parent=sheet["Normal"],
    fontName="Arial-B", fontSize=12.5, leading=16,
    textColor=GOLD_DEEP, spaceBefore=10, spaceAfter=2,
)
S_PHASE_META = ParagraphStyle(
    "PhaseMeta", parent=sheet["Normal"],
    fontName="Arial-I", fontSize=9.5, leading=13,
    textColor=GRAY, spaceAfter=6,
)
S_CELL_LABEL = ParagraphStyle(
    "CellLabel", parent=sheet["Normal"],
    fontName="Arial-B", fontSize=10, leading=13, textColor=DARK,
)
S_CELL_VALUE = ParagraphStyle(
    "CellValue", parent=sheet["Normal"],
    fontName="Arial", fontSize=10, leading=13, textColor=DARK,
)
S_STATUS_OK = ParagraphStyle(
    "StatusOK", parent=sheet["Normal"],
    fontName="Arial-B", fontSize=10, leading=14,
    textColor=GREEN_OK, alignment=0,
)
S_STATUS_TODO = ParagraphStyle(
    "StatusTodo", parent=sheet["Normal"],
    fontName="Arial-B", fontSize=10, leading=14,
    textColor=ORANGE_TODO, alignment=0,
)
S_SIGN = ParagraphStyle(
    "Sign", parent=sheet["Normal"],
    fontName="Arial-I", fontSize=11, leading=16,
    textColor=DARK, alignment=0, spaceBefore=12,
)


# -----------------------------------------------------------------------
# Helpers
# -----------------------------------------------------------------------
def rule(color=GOLD, thickness=1.0, space_before=2, space_after=6):
    return HRFlowable(
        width="100%", thickness=thickness, lineCap="round", color=color,
        spaceBefore=space_before, spaceAfter=space_after,
    )


def bullet(text):
    return Paragraph(f"• {text}", S_BULLET)


def change_line(num, text):
    """Single change row: sequential number (gold) + plain Serbian description."""
    return Paragraph(
        f"<font face='Arial-B' size='9' color='#b8935a'>{str(num).rjust(2)}.</font> &nbsp; {text}",
        S_BULLET,
    )


# -----------------------------------------------------------------------
# Page templates
# -----------------------------------------------------------------------
PAGE_W, PAGE_H = A4
MARGIN = 1.8 * cm


def draw_footer(canvas, doc):
    canvas.saveState()
    canvas.setFont("Arial", 8)
    canvas.setFillColor(GRAY)
    canvas.drawString(MARGIN, 1.0 * cm, "Cigar Shop — Status izvještaj 11.05.2026.")
    canvas.drawRightString(PAGE_W - MARGIN, 1.0 * cm, f"strana {doc.page}")
    canvas.setStrokeColor(GOLD)
    canvas.setLineWidth(0.5)
    canvas.line(MARGIN, 1.4 * cm, PAGE_W - MARGIN, 1.4 * cm)
    canvas.restoreState()


def draw_cover(canvas, doc):
    canvas.saveState()
    canvas.setStrokeColor(GOLD)
    canvas.setLineWidth(1.0)
    canvas.line(MARGIN, PAGE_H - MARGIN, MARGIN + 50, PAGE_H - MARGIN)
    canvas.line(MARGIN, PAGE_H - MARGIN, MARGIN, PAGE_H - MARGIN - 50)
    canvas.line(PAGE_W - MARGIN, MARGIN, PAGE_W - MARGIN - 50, MARGIN)
    canvas.line(PAGE_W - MARGIN, MARGIN, PAGE_W - MARGIN, MARGIN + 50)
    canvas.restoreState()


# -----------------------------------------------------------------------
# Phases data — sve 99 commit-a grupisano u 6 faza
# -----------------------------------------------------------------------
PHASES = [
    {
        "title": "Faza 1 — Tehnička osnova i prvi prototip",
        "date": "18. — 19. april 2026.   ·   32 izmene",
        "intro": (
            "Postavljanje sajta od nule: izgrađena svaka sekcija stranice, "
            "kreiran prvi interaktivan prototip uvodne sekcije (šibica koja se "
            "pali i pali cigaru pomeranjem prsta), i postavljeni svi tehnički "
            "preduslovi za pouzdano objavljivanje sajta."
        ),
        "commits": [
            "Postavljen kostur sajta — sve sekcije pripremljene (uvodna, o nama, biblioteka, oprema, galerija, kontakt).",
            "Pripremljeno automatsko objavljivanje sajta na hosting platformi.",
            "Postavljen rezervni kanal za objavljivanje (sekundarna ruta).",
            "Privremeno postavljen prikaz 9 lokacija (kasnije zamenjen realnim adresama vaših 5 radnji).",
            "Sređeni interni fajlovi koji su pravili problem na drugim sistemima.",
            "Popravka koja omogućava da sajt radi pouzdano nezavisno od operativnog sistema.",
            "Dodatna zaštita za rad sajta na bilo kojoj platformi.",
            "Optimizacija instalacije svih komponenti pre objavljivanja.",
            "Promena alata za pouzdaniji proces objavljivanja sajta.",
            "Sređena evidencija svih komponenti za stabilan ciklus rada.",
            "Reorganizovani jezici (srpski / engleski) za pouzdano učitavanje.",
            "Dodatna zaštita — sajt nastavlja da radi i kada nešto u jezicima zataji.",
            "Sklonjeno upozorenje „klikni za rotaciju\" sa interaktivnih elemenata.",
            "Zamena spoljnog 3D prikaza sopstvenim modelom + popravka efekta plamena.",
            "Sklanjanje preostalih elemenata sa 3D prikaza + cleanup ikonice u tabu pretraživača.",
            "Šibica i kutija: pomerite prst preko šibice da je zapalite; cigara se sama pali kad joj se približite.",
            "Polish prvog prikaza: sklonjen tag, šibica okrenuta na pravu stranu, progresivno paljenje uz zvuk.",
            "Šibica: bolja zona za hvatanje, jača svetlost, ispravljeno paljenje sa leve strane.",
            "Raspored uvodne sekcije: cigara i šibica pomerene od centra da ne pokrivaju natpis „CIGAR SHOP\".",
            "Cigara prati plamen pri približavanju; plamen se vidi i preko cigare.",
            "Životni ciklus cigare: nezapaljena → pali se od šibice → autonomno gori sama.",
            "Cigara se naginje ka plamenu — efekat fizike.",
            "Kucni-da-zapališ + popravka grešaka pri sporijem računaru.",
            "Cigara prati šibicu dok je vučete prstom.",
            "Dim se pojavljuje samo kad cigara stvarno gori.",
            "Cigara se postupno skraćuje kako gori; pepeo pada sa vrha.",
            "Cigara se zaustavlja blizu plamena, zvučni efekat trenja, pepeo vidljiv, sprečeno višestruko paljenje.",
            "Sporije sagorevanje cigare — sa 18 sekundi na 60 sekundi za pun ciklus.",
            "Zvuk se aktivira tek na prvi klik korisnika (čistija konzola pretraživača).",
            "Smanjeni efekti praćenja kursora (manje agresivni).",
            "Pun rebrand: integrisani vaš logo, uvodni video i brendovi.",
            "Klijentov feedback: veći logo, čitljivija uvodna sekcija, realne fotografije, spojene neke sekcije.",
        ],
    },
    {
        "title": "Faza 2 — Prvi materijali + krug feedback-a",
        "date": "21. — 22. april 2026.   ·   24 izmene",
        "intro": (
            "Stigla vam excel evidencija svih radnji + Instagram nalog. "
            "Veliki krug feedback-a iz vašeg tima: promenjen redosled sekcija, "
            "spojene neke sekcije, biblioteka brendova, izbor lokacije u kontaktu."
        ),
        "commits": [
            "Globus: 19 regiona sa pričama; isključen zoom mišem (stranica normalno klizi).",
            "Druga runda klijentskog feedback-a: zlatna kao osnovna boja, autentičan sadržaj brendova.",
            "Mapa: bliži zoom, manji pulsirajući indikatori, premium zlatne kontrole +/-.",
            "Logo u zaglavlju: samo monogram; uvodna sekcija sa tamnijim slojem za bolju čitljivost.",
            "Premium zlatne kontrole na globusu + realne fotografije pića.",
            "Uvodni video: izbačen klip sa upozorenjem; sekcija „o nama\" koristi fotografiju Juan Lopez cigare.",
            "Sekcija „o nama\": novi vizual + biblioteka brendova + kontakt kartice + mapa + moderniji donji deo stranice.",
            "Uvodni video: dodate snimke ulaza u radnju + 2 nova klipa enterijera.",
            "Zamena 9 privremenih lokacija sa 5 realnih adresa iz vaše excel evidencije.",
            "Kontakt: aktivan Instagram link (@cigarshopbelgrade); izbačeni Facebook/TikTok privremeni linkovi.",
            "Veliki krug klijentskog feedback-a: redosled sekcija, spajanje biblioteke i izbor lokacije u kontaktu.",
            "Završne izmene iz feedback-a: rotirajuća uvodna sekcija sa 3 slajda, blok o procesu proizvodnje, podela pića po vrstama, nova sekcija „Oprema\".",
            "Standalone „Lokacije\" sekcija sklonjena; naslovi svih sekcija centrirani.",
            "Biblioteka brendova: klik na brend menja prikaz na velikoj slici (umesto sitnih ispod).",
            "Veliki redizajn uvodne sekcije: animirana pozadina prvog slajda, drugi slajd sa premium video efektom, glatka tranzicija, video u visokoj rezoluciji.",
            "Izbor lokacije u kontaktu: prilagođen meni umesto plavog standardnog (kao u Windows-u).",
            "Pića: blok o procesu + klik na brend menja prikaz; promenjeni fontovi (Playfair + Lora).",
            "Polish uvodne sekcije: centriran logo, animirana pozadina, mekša 3-sekundna tranzicija.",
            "Tranzicija uvodne sekcije: glatkija 4.5s prelivanje.",
            "Tranzicija uvodne sekcije: levo-desno klizanje.",
            "Tehnička popravka tranzicije za sve pretraživače.",
            "Tranzicija slajda: vraćen najkompatibilniji pristup za sve uređaje.",
            "Sekcije „o nama\" i „humidor\": uži video okviri, šira tekst kolona.",
            "Sekcije „o nama\" i „humidor\": video okviri veći (do 600 piksela).",
        ],
    },
    {
        "title": "Faza 3 — Nove runde feedback-a + AI video materijali",
        "date": "23. — 24. april 2026.   ·   11 izmena",
        "intro": (
            "Tri runde feedback-a u istom danu: nova pozadina za prvi slajd uvodne "
            "sekcije, video za sekciju rituala, redizajn opreme, autorski tekst o "
            "procesu proizvodnje, novi naziv sekcije <i>„Godine tišine za trenutak uživanja\"</i>."
        ),
        "commits": [
            "Klijentov feedback: redosled sekcija, 3 slajda u uvodnoj sekciji, novi tekst u kontaktu, redizajn opreme, video za ritual.",
            "Prvi slajd uvodne sekcije: živi efekat zlatnog dima preko geometrijske pozadine.",
            "Prvi slajd uvodne sekcije: AI generisan premium video u petlji (umesto efekta dima).",
            "Sekcija rituala: AI generisan video „luksuzna tamna soba\", usporen 2× + glatka petlja (20 sekundi).",
            "Treći slajd uvodne sekcije: pun ekran sa videom; kursor postao monogram brenda.",
            "Logo kursor: tehnička popravka da se pravilno prikaže.",
            "Kursor: blagi nagib, sklonjen prsten, vrh kursora je tačka klika.",
            "Biblioteka: <b>preimenovana u „Godine tišine za trenutak uživanja\"</b> + 4 paragrafa autentičnog teksta o procesu proizvodnje.",
            "Blok o procesu: integrisani realni materijali — 4 fotografije + video plantaže.",
            "Drugi slajd + biblioteka: kompletna kompilacija od 4 klipa, veći video, dvokolonski tekst.",
            "Blok o procesu: vraćen layout tekst-levo / video-desno po klijentskom zahtevu.",
        ],
    },
    {
        "title": "Faza 4 — Veliki redizajn (27. april)",
        "date": "27. april 2026.   ·   13 izmena",
        "intro": (
            "Detaljan klijentski feedback rezultovao u skoro potpunom redizajnu: "
            "<b>pun zlatni logo</b>, zlatna tipografija, sklonjen ekran učitavanja, novi "
            "3-slajd uvodni deo, sekcija sa <b>10 originalnih blog tekstova</b>, "
            "interaktivan prikaz humidora, redizajn pića."
        ),
        "commits": [
            "Pića: realan video destilerije + 4 procesne fotografije, raspoređene po brendovima.",
            "Veliki update: zlatan logo, sklonjen ekran učitavanja, redosled sekcija, podela brendova na 2 grupe (Kuba i Novi svet), nova blog sekcija.",
            "Blog: horizontalan rotirajući prikaz + interaktivan humidor video + biblioteka video ispod teksta.",
            "Interaktivan humidor: prikaz po izboru korisnika (vučete prstom kroz video).",
            "Interaktivan humidor: video u visokoj rezoluciji + kompletne kontrole + zaključavanje skrolovanja.",
            "Interaktivan humidor: 16:9 odnos stranica, autostart, dugme za pauzu.",
            "Interaktivan humidor: kontrole ispod videa + automatska petlja unapred-unazad.",
            "Biblioteka „Godine tišine\": kompletna kompilacija celog puta proizvodnje.",
            "Tehnički cleanup privremenih fajlova.",
            "Tehnički cleanup istorije privremenih fajlova.",
            "Pića: novi naziv sekcije + kursor sa zlatnim monogramom.",
            "Drugi slajd uvodne sekcije: tekst „Posetite nas\" → „Pronađite nas na 5 lokacija\".",
            "Popravka pozicioniranja broja „5\" u uvodnom natpisu + manji kursor sa logom.",
        ],
    },
    {
        "title": "Faza 5 — Polish + UI optimizacija",
        "date": "6. — 7. maj 2026.   ·   10 izmena",
        "intro": (
            "Feedback od 02-05: preimenovanje sekcije u <b>„Godine tišine\"</b>, "
            "uklanjanje sekcije „Preseci. Zapali. Uživaj.\", nova podela slika po "
            "sekcijama, vitrine sa pićem. Plus opšta optimizacija prikaza — manje "
            "galerije i brže animacije."
        ),
        "commits": [
            "Update 02-05: novi videos u uvodnoj i „o nama\" sekciji, 6-foto galerija humidora, vitrine pića i opreme, preimenovanje u „Godine tišine\", sekcija rituala uklonjena.",
            "Tehnički cleanup hosting platforme — sirovi materijali se ne uplodaju nepotrebno.",
            "Opšta vizuelna optimizacija: kompaktnije sekcije, paginirane galerije, perf poboljšanja.",
            "Galerije ujednačene (sa stranicama) + originalan video humidora u portretu + popravka vidljivosti „Godine tišine\".",
            "Druga vizuelna optimizacija: manje galerije, blog prikazuje max 4 posta, čišća sekcija pića, novi tabovi Kuba/Novi svet u humidoru.",
            "„O nama\" sekcija: rotirajući prikaz cigara umesto videa + brži ciklus „Godine tišine\" (3.5s).",
            "Popravka — galerije se sada automatski pokreću pri ulasku u sekciju.",
            "Ujednačeni tabovi po sekcijama + kompilacijski video u „Godine tišine\" + brže animacije galerije.",
            "Sklonjen kompilacijski video iz „Godine tišine\" + boja logoa usklađena sa zlatnom bojom natpisa „CIGAR SHOP\".",
            "Tabovi: <b>centrirane kartice</b> (i red sa nepotpunim brojem kartica u dnu).",
        ],
    },
    {
        "title": "Faza 6 — Finalni feedback + Lansiranje",
        "date": "10. — 11. maj 2026.   ·   5 izmena",
        "intro": (
            "Finalna runda feedback-a: <b>posebne stranice za Kubu i Novi svet</b>, "
            "klikabilne kartice umesto starih tabova, glatki video unapred-unazad za "
            "drugi i treći slajd uvodne sekcije, finalna usklađenost boje logoa. "
            "<b>Domen cigarshop.rs konfigurisan, sajt zvanično live.</b>"
        ),
        "commits": [
            "Veliki paket: posebne stranice za Kubu i Novi svet, klikabilne kartice (6 vrsta pića + 5 vrsta opreme), zlatni gradijent logoa, povezivanje cigarshop.rs domena, predaja PDF dokumenta.",
            "Treći slajd uvodne sekcije: <b>nov video ambijent</b> (gospodin sa cigarom i viskijem pored zelene art-deco lampe).",
            "Treći slajd: glatka petlja unapred-unazad — bez vidljivog skoka na početak.",
            "Treći slajd: tehnička popravka petlje (single-pass enkoding).",
            "Drugi slajd uvodne sekcije: nov video ambijent (sparke + atmosfera) + petlja unapred-unazad.",
        ],
    },
]


# -----------------------------------------------------------------------
# Build content
# -----------------------------------------------------------------------
def build_story():
    story = []

    # --- COVER ------------------------------------------------------
    story.append(Spacer(1, 3.0 * cm))
    if LOGO.exists():
        logo_img = Image(str(LOGO), width=2.8 * cm, height=5.3 * cm, kind="proportional")
        logo_img.hAlign = "CENTER"
        story.append(logo_img)
    story.append(Spacer(1, 1.2 * cm))
    story.append(Paragraph("Cigar Shop", S_COVER_TITLE))
    story.append(Paragraph("Status izvještaj — kraj projekta", S_COVER_SUB))
    story.append(Spacer(1, 0.8 * cm))
    story.append(Paragraph("11. maj 2026.", S_COVER_META))
    story.append(Spacer(1, 0.3 * cm))
    story.append(Paragraph(
        "<i>Presek stanja: 99 izmena u 6 faza<br/>"
        "Adresovano timu MyCase</i>", S_COVER_META))
    story.append(PageBreak())

    # --- POZDRAV + REZIME -------------------------------------------
    story.append(Paragraph("Poštovani timu MyCase,", S_BODY_LEFT))
    story.append(Paragraph(
        "Sajt <b>https://cigarshop.rs</b> je <b>live od 10. maja 2026.</b> — domen je "
        "konfigurisan, SSL sertifikat aktivan, sve sekcije rade. Email "
        "preko Loopia servera nije dirnut — funkcioniše kao i pre.",
        S_BODY))
    story.append(Paragraph(
        "Ovaj dokument je <b>presek rada na sajtu</b> od 18. aprila do danas — "
        "<b>24 dana razvoja</b> i <b>99 odvojenih izmena</b> (svaka jedna nezavisna verzija "
        "u istoriji), grupisanih u 6 logičkih faza. Cilj: da pregledate šta je sve "
        "odrađeno i šta još preostaje.",
        S_BODY))
    story.append(Paragraph(
        "Ono što još očekujemo od vas — niže u dokumentu, sekcija „Šta još preostaje\".",
        S_BODY))

    # --- BROJKE U KRATKO --------------------------------------------
    story.append(Paragraph("Brojke u kratko", S_H1))
    story.append(rule())
    stats = [
        [Paragraph("<b>Period razvoja</b>", S_CELL_LABEL),
         Paragraph("<b>18. april — 11. maj 2026.</b> (24 dana)", S_CELL_VALUE)],
        [Paragraph("<b>Ukupan broj izmena</b>", S_CELL_LABEL),
         Paragraph("<b>99 commit-a</b> (svaka = jedna zaokružena izmena)", S_CELL_VALUE)],
        [Paragraph("<b>Krugova feedback-a</b>", S_CELL_LABEL),
         Paragraph("<b>6</b> — sve detaljno odrađeno", S_CELL_VALUE)],
        [Paragraph("<b>Sekcija na sajtu</b>", S_CELL_LABEL),
         Paragraph("9 (Hero, Manifest, Humidor, Spirits, Oprema, Godine tišine, Blog, Kontakt + Lokacije)", S_CELL_VALUE)],
        [Paragraph("<b>Detail strana (klikabilne kartice)</b>", S_CELL_LABEL),
         Paragraph("<b>13</b> (Kuba, Novi svet + 6 kategorija pića + 5 kategorija opreme)", S_CELL_VALUE)],
        [Paragraph("<b>Blog postova</b>", S_CELL_LABEL),
         Paragraph("<b>10</b> originalnih autorskih tekstova", S_CELL_VALUE)],
        [Paragraph("<b>Galerija „Godine tišine\"</b>", S_CELL_LABEL),
         Paragraph("24 ručno odabrane fotografije (od 62 originalnih)", S_CELL_VALUE)],
        [Paragraph("<b>Status sajta</b>", S_CELL_LABEL),
         Paragraph("<font color='#0a7b3a'><b>● LIVE</b></font> na https://cigarshop.rs (SSL aktivan)", S_CELL_VALUE)],
        [Paragraph("<b>Mesečni hosting trošak</b>", S_CELL_LABEL),
         Paragraph("<b>0 RSD</b> (Vercel Hobby plan)", S_CELL_VALUE)],
    ]
    t = Table(stats, colWidths=[5.2 * cm, 11.0 * cm])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (0, -1), LIGHT_BG),
        ("GRID",       (0, 0), (-1, -1), 0.5, BORDER),
        ("VALIGN",     (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING",(0, 0), (-1, -1), 7),
        ("RIGHTPADDING",(0, 0), (-1, -1), 7),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING",(0, 0), (-1, -1), 5),
    ]))
    story.append(t)
    story.append(PageBreak())

    # --- PHASES + COMMITS -------------------------------------------
    story.append(Paragraph("Detaljna istorija — 99 izmena, 6 faza", S_H1))
    story.append(rule())
    story.append(Paragraph(
        "Svaka izmena je jedna nezavisna verzija sajta. Levo je „šifra verzije\" "
        "(7 karaktera) koju koristimo za identifikaciju i rollback. Desno je "
        "kratka rečenica šta je promenjeno.",
        S_BODY))

    counter = 1  # global running number 1..99 across all phases
    for phase in PHASES:
        block = [
            Paragraph(phase["title"], S_PHASE_TITLE),
            Paragraph(phase["date"], S_PHASE_META),
            Paragraph(phase["intro"], S_BODY),
        ]
        for text in phase["commits"]:
            block.append(change_line(counter, text))
            counter += 1
        block.append(Spacer(1, 8))
        story.extend(block)

    story.append(PageBreak())

    # --- ŠTA STE DOBILI ---------------------------------------------
    story.append(Paragraph("Šta ste konkretno dobili", S_H1))
    story.append(rule())

    delivery = [
        [Paragraph("<b>Glavna stranica</b>", S_CELL_LABEL),
         Paragraph("3-slide hero rotator (palindrome video loop), Manifest, Humidor sa Kuba/Novi svet karticama, Spirits sa 6 kategorija, Oprema sa 5 kategorija, Godine tišine galerija (24 fotke), Blog (10 postova), Kontakt sa store-picker dropdown-om i mapom 5 lokacija.",
                   S_CELL_VALUE)],
        [Paragraph("<b>13 detail strana</b>", S_CELL_LABEL),
         Paragraph("Klikom na bilo koju karticu (Kuba, Novi svet, Viski, Burbon, Džin, Konjak, Rum, Rakija, Sekači, Upaljači, Humidori, Pepeljare, Futrole) otvara se zasebna strana sa autorskim tekstom (4-6 paragrafa) i galerijom slika.",
                   S_CELL_VALUE)],
        [Paragraph("<b>Dvojezičnost</b>", S_CELL_LABEL),
         Paragraph("Srpski (default) + Engleski. Korisnik bira preglašom u headeru. Sav novi sadržaj automatski ide u oba jezika.",
                   S_CELL_VALUE)],
        [Paragraph("<b>Mobilna verzija</b>", S_CELL_LABEL),
         Paragraph("Sajt radi isto lepo na telefonu kao na desktopu. Hero video se prikazuje i na mobilnom.",
                   S_CELL_VALUE)],
        [Paragraph("<b>SEO + share</b>", S_CELL_LABEL),
         Paragraph("Meta tag-ovi, OG image za WhatsApp/Instagram preview, sitemap, i dvojezični meta naslovi spremni.",
                   S_CELL_VALUE)],
        [Paragraph("<b>Domen + email</b>", S_CELL_LABEL),
         Paragraph("https://cigarshop.rs (SSL aktivan), email i dalje na Loopia kao i ranije — DNS migracija je odrađena tako da MX/SPF/DKIM zapisi nisu pomereni.",
                   S_CELL_VALUE)],
        [Paragraph("<b>Hosting</b>", S_CELL_LABEL),
         Paragraph("Vercel — globalna mreža servera, automatsko skaliranje, SSL automatski obnavljan svaka 3 meseca, bekap koda u GitHub-u sa istorijom svih 99 verzija.",
                   S_CELL_VALUE)],
    ]
    t = Table(delivery, colWidths=[4.0 * cm, 12.2 * cm])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (0, -1), LIGHT_BG),
        ("GRID",       (0, 0), (-1, -1), 0.5, BORDER),
        ("VALIGN",     (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING",(0, 0), (-1, -1), 7),
        ("RIGHTPADDING",(0, 0), (-1, -1), 7),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING",(0, 0), (-1, -1), 5),
    ]))
    story.append(t)

    # --- ŠTA JOŠ PREOSTAJE ------------------------------------------
    story.append(Paragraph("Šta još preostaje", S_H1))
    story.append(rule())
    story.append(Paragraph(
        "Sajt je u potpunosti funkcionalan i live. Sve što sledi je <b>finalna "
        "personalizacija sadržaja</b> — assets koje treba da nam dostavite da bi "
        "sve sekcije nosile vaš autentičan vizuelni i tekstualni identitet, "
        "umesto trenutnih placeholder-a.",
        S_BODY))

    story.append(Paragraph("Materijal koji odaberete i dostavite", S_H2))
    story.append(bullet("<b>Slike po sekcijama</b> — fotografije humidora, pića, opreme, atmosfere prodavnica. <b>Vi po dogovoru birate</b> koje slike idu u koju sekciju i na koju karticu."))
    story.append(bullet("<b>Video po sekcijama</b> — kratki klipovi iz radnji, humidora, atmosfere. <b>Vi po dogovoru birate</b> koji video ide u koju sekciju."))
    story.append(bullet("<b>Tekstovi za sekcije</b> — autentičan opis svake kategorije pića (Viski, Burbon, Džin...) i opreme (Sekači, Upaljači...) onako kako vi to predstavljate kupcima u radnji. Trenutni tekstovi su naša radna verzija — biće zamenjeni vašim."))

    story.append(Paragraph("Naš proces nakon dostave", S_H2))
    story.append(bullet("Pripremamo slike i video za sajt (optimizacija veličine i brzine učitavanja)."))
    story.append(bullet("Integrišemo sadržaj u dogovorene sekcije i kartice."))
    story.append(bullet("Vi pregledate sajt, javljate ako treba korekcija — i tako dok ne bude 100% kako želite."))

    # --- POSLEDNJA REC ----------------------------------------------
    story.append(Paragraph("Sledeći korak", S_H1))
    story.append(rule())
    story.append(Paragraph(
        "Pošaljite materijal kad vam odgovara — WhatsApp, email, WeTransfer, kako vam je "
        "najlakše. Nema rok ni gornju granicu — sve što stigne, biće obrađeno.",
        S_BODY))
    story.append(Paragraph(
        "Sa poštovanjem,<br/><b>Lazar Milićević</b><br/>"
        "<font size='9' color='#666666'>lamingsrb@gmail.com  ·  +381 64 121 32 92</font>",
        S_SIGN))

    return story


# -----------------------------------------------------------------------
# Assemble
# -----------------------------------------------------------------------
def main():
    doc = BaseDocTemplate(
        str(OUT),
        pagesize=A4,
        leftMargin=MARGIN, rightMargin=MARGIN,
        topMargin=MARGIN, bottomMargin=MARGIN,
        title="Cigar Shop — Status izvještaj",
        author="Lazar Milićević",
        subject="Mid-project status report",
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
