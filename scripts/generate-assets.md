# Asset generation guide

Placeholder-i u sajtu su CSS gradijenti. Pre produkcije zameniti sa realnim ili
AI-generisanim slikama/videima.

Svi fajlovi idu u `public/assets/`.

## Midjourney / SDXL prompt-ovi

### Hero background (opcionalno)
> luxury cigar lounge interior, deep mahogany wood, dim amber lighting, rows of
> cedar humidors, velvet armchair, smoke drifting, cinematic, volumetric light,
> 8k, shot on 35mm film, shallow depth of field, warm tones, chiaroscuro
> lighting `--ar 16:9 --style raw`

### Origins — 6 slika (po regiji)
1. **Cuba**: "vuelta abajo tobacco field at sunset, red soil, drying barn, cuban
   farmer in white shirt, misty mountains, cinematic, 35mm"
2. **Dominican**: "cibao valley tobacco plantation, green leaves, workers sorting
   leaves, wooden drying shed, humid tropical afternoon"
3. **Nicaragua**: "volcanic mountain landscape, Estelí tobacco field, dark
   volcanic soil, mist, dramatic sky"
4. **Honduras**: "Jamastran valley tobacco, mountainous terrain, warm dusk
   light, wooden curing barn"
5. **Costa Rica**: "Turrialba tobacco farm, coffee-and-tobacco co-cultivation,
   lush tropical, morning mist"
6. **Mexico**: "San Andrés tobacco leaves being sun-cured, rustic wooden racks,
   warm afternoon sun, Veracruz coast"

Export: **1024×768 WebP**, save to `img/origins/{key}.webp` (key = cuba, dominican,
nicaragua, honduras, costa, mexico).

### Products — cigar beauty shots (3–5)
> single cuban cigar with glowing ember tip on black velvet, macro photography,
> shallow DOF, golden band reflection, cinematic lighting, product photography
> `--ar 3:4`

### Humidor interior
> luxury cigar humidor interior, spanish cedar shelves filled with cigars in
> organized rows, warm amber LED strips, moody lighting, product photography
> `--ar 16:9`

### Spirits — lineup
> premium whisky bottle on dark wood bar, soft rim light, single malt scotch,
> amber liquid, moody atmosphere, product photography `--ar 3:4`

(ponovi za: Japanese whisky, Irish, Bourbon, Cognac, Rakija)

### Accessories
- **Rezači**: "luxury cigar cutter on black velvet, gold-plated guillotine,
  macro product shot"
- **Upaljači**: "vintage Zippo-style cigar lighter with triple flame, luxury
  product shot"
- **Humidori**: "spanish cedar humidor box open, cigars inside, warm lighting"
- **Pepeljare**: "marble cigar ashtray with rest notches, minimal styling"

### Stores (9 eksterijera)
Generički luksuzni cigar-shop eksterijer — NE vezivati za specifične adrese
dok klijent ne potvrdi. Preporuka: promeniti nijansu/lokaciju za svaku.

> upscale cigar shop storefront at dusk, warm interior glow spilling onto
> sidewalk, gold lettering, leather armchair visible through window, elegant
> signage, Belgrade European street, cinematic `--ar 4:3`

## Video

### `video/ritual.webm` + `video/ritual.mp4`
10-sekundni loop. Tri mikro-scene spojene:
1. Rezač preseca kraj cigare (close-up, 3s)
2. Plamen butana pali cigaru (close-up, 3s)
3. Dim se diže u kontra-svetlu (wide, 4s)

Encoding (nakon što imaš raw video):
```bash
ffmpeg -i ritual-raw.mp4 -c:v libvpx-vp9 -crf 30 -b:v 0 -an ritual.webm
ffmpeg -i ritual-raw.mp4 -c:v libx264 -crf 22 -preset slow -an -movflags +faststart ritual.mp4
```

Veličina cilj: **<2.5 MB** za WebM, **<4 MB** za MP4.

### `video/smoke-loop.webm`
8-sekundni loop ambientalnog dima u kontra-svetlu (nije obavezno — particle
sistem u hero-u dovoljan je).

## Audio

Izvori (royalty-free):
- **Pixabay Music** (bez atribucije): https://pixabay.com/music/
- **Freesound** (uglavnom CC-BY): https://freesound.org/
- **Artlist / Epidemic Sound** (plaćeno, profi kvalitet)

Potrebno:
- `audio/ambient.mp3` — lounge jazz, slow, smoky sax, **loop-ovano**, 3–5 min
- `audio/ambient.webm` — ista stvar u Opus formatu (manje bajtova)
- `audio/match-strike.mp3` — 2s šum paljenja šibice + mikro flame whoosh
- `audio/crackle-loop.mp3` — 5–10s pucketanja žara, loop

Encoding:
```bash
ffmpeg -i ambient-raw.wav -c:a libmp3lame -b:a 128k ambient.mp3
ffmpeg -i ambient-raw.wav -c:a libopus -b:a 96k ambient.webm
```

## Favicon

Generiši preko: https://realfavicongenerator.net/
- Osnova: SVG ikonica cigare sa žar-crvenim kraja (32×32 min)
- Tema: #ff6b1a (ember)
- Pozadina: #0a0605 (obsidian)

Izlaz u `public/assets/favicon/`.

## Checklist pre go-live

- [ ] Sve slike u WebP (+ JPG fallback ako je nužno)
- [ ] Svi videi WebM + MP4 dual, pod 3 MB
- [ ] `og-cover.jpg` 1200×630
- [ ] Favicon multi-size + manifest
- [ ] Audio pod 5 MB za ambient loop
- [ ] 18+ disclaimer vidljiv u footeru ✓ (već ugrađeno)
- [ ] Test na 3G mrežnoj throttle
- [ ] Lighthouse score ≥ 85 performance
