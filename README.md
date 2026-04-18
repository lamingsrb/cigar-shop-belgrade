# Cigar Shop Belgrade — Cinematic Brand Website

Premium cinematic showcase sajt za Cigar Shop lanac u Beogradu. 9 lokacija, 3D
animacije, Three.js scene, GSAP scroll, dvojezično (SR/EN).

## Stack

- **Vite 5** — build + dev server
- **Vanilla JS (ES modules)** — bez framework-a
- **Three.js 0.170** — hero cigara, globus porekla, humidor scena
- **GSAP 3.12 + ScrollTrigger** — cinematic scroll
- **Lenis** — smooth scroll
- **Leaflet + Carto Dark** — mapa prodavnica
- **Howler** — ambijentalni audio
- **Pure CSS** + varijable — bez Tailwind-a

## Pokretanje

```bash
npm install
npm run dev
```

Otvoriće se `http://localhost:5555`.

## Build

```bash
npm run build
npm run preview
```

`dist/` folder je spreman za statički hosting (Vercel, Netlify, GitHub Pages,
Cloudflare Pages).

## Struktura

```
├── index.html              # entry
├── css/
│   ├── style.css           # paleta, tipografija, sekcije
│   ├── animations.css      # keyframes
│   └── responsive.css      # mobile breakpoints
├── js/
│   ├── main.js             # bootstrap, Lenis, GSAP, init svih modula
│   ├── i18n.js             # SR/EN language switch
│   ├── loader.js           # match-strike intro
│   ├── cursor.js           # ember custom cursor
│   ├── audio.js            # Howler ambient toggle
│   ├── scroll-burn.js      # scroll progress bar
│   ├── render.js           # dynamic content (bento, spirits, locations)
│   ├── hero-cigar.js       # Three.js 3D cigara + žar + dim
│   ├── globe-origins.js    # Three.js globus sa 6 žar-tačaka
│   ├── humidor-scene.js    # Three.js humidor walkthrough
│   └── locations-map.js    # Leaflet mapa sa 9 prodavnica
├── locales/
│   ├── sr.json             # srpski tekstovi
│   └── en.json             # engleski tekstovi
├── public/assets/          # slike, video, audio, favicon (vidi ASSETS.md)
├── scripts/
│   └── generate-assets.md  # AI image prompt-ovi (MJ/SDXL)
├── package.json
└── vite.config.js
```

## Sadržaj (editovanje)

Sve kopije i adrese lokacija su u `locales/sr.json` i `locales/en.json`. Menjaj
tamo — `data-i18n` atributi u HTML-u automatski pokupe promenu.

Nove prodavnice dodaješ u `locations.stores` niz u oba locale fajla. Mapa i
kartice se automatski re-renderuju.

## Asset-i

Svi vizuelni materijali su za sada placeholder-i (gradijenti). Za produkciju
treba generisati/zameniti sledeće fajlove u `public/assets/`:

- `img/hero-bg.webp` — pozadina hero-a (opcionalno, 3D scena je dovoljna)
- `img/manifest-poster.jpg` — poster za ritual video
- `img/ritual-poster.jpg` — poster za ritual video
- `img/og-cover.jpg` — OpenGraph cover (1200×630)
- `img/origins/*.webp` — 6 slika po regiji (za panel ako zatrebaš)
- `img/products/*.webp` — cigare/viski beauty shot-ovi
- `img/stores/*.webp` — 9 fotografija eksterijera prodavnica
- `video/ritual.webm` + `video/ritual.mp4` — 10s loop: rez → paljenje → dim
- `video/smoke-loop.webm` — ambijentalni dim
- `audio/ambient.mp3` + `audio/ambient.webm` — lounge jazz loop
- `audio/match-strike.mp3` — 2s zvuk paljenja šibice
- `audio/crackle-loop.mp3` — pucketanje žara

Vidi `scripts/generate-assets.md` za Midjourney/SDXL prompt-ove.

## Performance

- Hero canvas pauzira kad nije u viewport-u
- Mapa i humidor scena se inicijalizuju lazy (tek kad skroluješ do njih)
- `prefers-reduced-motion` isključuje particles, auto-audio, custom cursor
- Fontovi preconnect-ovani, slike `loading="lazy"`
- Three.js chunk-ovi razdvojeni (`three`, `gsap`, `leaflet`)

## Deployment

### Vercel (preporuka)
```bash
vercel --prod
```
Framework preset: **Vite**. Output: `dist`.

### Netlify
```bash
netlify deploy --prod --dir=dist
```

### GitHub Pages
```bash
npm run build
# push dist/ na gh-pages granu
```

## 18+

Sajt poštuje zakonske restrikcije u Srbiji vezano za duvanske proizvode. Footer
sadrži `18+. Duvan šteti zdravlju.` disclaimer.

## Credits

**3D Model "Pouring Glass"** (hero scena)
- Autor: MysteryPancake
- Sketchfab URL: https://sketchfab.com/3d-models/glass-of-water-2-16f73c5b68fc4d1996e7602a813b0946
- Licenca: [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)
- Baked Blender fluid simulation — zamrznut trenutak sipanja iz boce u čašu sa ledom.
  289k triangles, 147k vertices.
- CSS `filter: sepia(0.65) saturate(1.8) hue-rotate(-18deg)` pretvara clear water
  u amber whisky ton. Ovo se primenjuje samo na iframe, ne menja sam model.
- Integrisan preko Sketchfab iframe embed-a. Attribution u footeru sajta.

**Earth teksture** (globus porekla duvana)
- Izvor: https://threejs.org/examples/textures/planets/
- Distribuirane sa Three.js repozitorijumom (MIT License)

**Ambijentalne slike**
- Izvor: https://kalimancaribe.com/ — placeholder za demo. Za produkciju klijent
  treba da obezbedi vlastite fotografije.
