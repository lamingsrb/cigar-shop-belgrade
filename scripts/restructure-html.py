"""
One-shot script: restructure index.html for 27-04-2026 update.
- Swap Humidor and Library section order (Humidor first now)
- Move brand-tabs/grid from end of Library to end of Humidor in `humidor__brands` wrapper
- Library becomes minimal: title + lead + full-bleed bg video
"""
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
HTML = ROOT / "index.html"

src = HTML.read_text(encoding="utf-8")

# 1) Locate the Library section start
lib_start_marker = '<!-- ==============  BIBLIOTEKA CIGARA (merge: Origins + Brands + Collection) ============== -->'
hum_start_marker = '<!-- =======================  HUMIDOR  ======================= -->'
spirits_start_marker = '<!-- =======================  SPIRITS  ======================= -->'

i_lib = src.index(lib_start_marker)
i_hum = src.index(hum_start_marker)
i_spirits = src.index(spirits_start_marker)

# Old block: lib_start..hum_start..spirits_start
old_library_block = src[i_lib:i_hum]
old_humidor_block = src[i_hum:i_spirits]

# Sanity
assert '<div class="brands__tabs"' in old_library_block, "brand-tabs not in library block"
assert 'humidor__copy' in old_humidor_block, "humidor copy not in humidor block"

# Build new humidor (inject `humidor__brands` wrapper before closing </section>)
humidor_close_idx = old_humidor_block.rindex('</section>')
new_humidor_brands = """
    <!-- Podela cigara: Kuba i Novi svet (premešteno iz Library sekcije) -->
    <div class="humidor__brands">
      <div class="origins__header">
        <p class="kicker" data-i18n="humidorBrands.kicker">Biblioteka cigara</p>
        <h3 class="heading-section" data-i18n="humidorBrands.title">Kuba i Novi svet.</h3>
        <p class="lead" data-i18n="humidorBrands.lead">Naša polica nosi dve velike priče. Klikni na regiju i pusti da slajdovi vode kroz brendove i njihove cigare.</p>
      </div>
      <div class="brands__tabs" id="brands-tabs" role="tablist"></div>
      <div class="brands__grid" id="brands-grid"></div>
    </div>
  """
new_humidor_block = (
    "  <!-- =======================  HUMIDOR (sada prvo)  ======================= -->\n"
    + old_humidor_block[old_humidor_block.index('<section id="humidor"'):humidor_close_idx]
    + new_humidor_brands
    + old_humidor_block[humidor_close_idx:]
)

# Build minimal Library
new_library_block = """  <!-- ==============  BIBLIOTEKA CIGARA — minimal (samo title + lead + full-bleed video) ============== -->
  <section id="origins" class="origins origins--minimal" aria-label="Biblioteka cigara">
    <video class="origins__bg-video"
           autoplay muted loop playsinline
           preload="metadata"
           poster="/assets/video/process-poster.webp"
           aria-hidden="true">
      <source src="/assets/video/process.mp4" type="video/mp4">
    </video>
    <div class="origins__bg-overlay" aria-hidden="true"></div>
    <div class="origins__header origins__header--over-video">
      <p class="kicker" data-i18n="library.kicker">Biblioteka cigara</p>
      <h2 class="heading-display" data-i18n="library.title">Godine tišine za trenutak uživanja.</h2>
      <p class="lead" data-i18n="library.lead">Od plantaže, kroz destileriju, do trenutka kada se žar prvi put uhvati za vrh cigare.</p>
    </div>
  </section>

"""

# Replace the old [library + humidor] block with [humidor + library] (swapped order)
combined_old = src[i_lib:i_spirits]
combined_new = new_humidor_block + "\n" + new_library_block

out = src.replace(combined_old, combined_new, 1)
assert out != src, "no replacement made"
assert out.count('id="brands-tabs"') == 1, "brands-tabs duplicated or missing"
assert out.count('id="origins"') == 1, "origins duplicated or missing"
assert out.count('id="humidor"') == 1, "humidor duplicated or missing"

HTML.write_text(out, encoding="utf-8")
print("OK — sections swapped, brand wrapper moved, Library minimal.")
