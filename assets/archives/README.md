# MISSION ARCHIVE PHOTOS — drop your photos here

Every Mission Archive slideshow (opened by talking to a machine, or from
the MISSION ARCHIVE menu) accepts one real photo per slide. A photo, when
present, replaces that slide's drawn pixel scene — the archival frame,
labels, narration and hotspots still render on top.

## File names

One folder per archive (folder name = archive id), one image per slide:

    assets/archives/pathfinder/frame1.jpg   ...  frame5
    assets/archives/spirit/frame1.jpg       ...  frame5
    assets/archives/opportunity/frame1.jpg  ...  frame5
    assets/archives/viking1/frame1.jpg      ...  frame4
    assets/archives/viking2/frame1.jpg      ...  frame4
    assets/archives/dawn/frame1.jpg         ...  frame5
    assets/archives/near/frame1.jpg         ...  frame5
    assets/archives/p10/frame1.jpg          ...  frame5
    assets/archives/p11/frame1.jpg          ...  frame4
    assets/archives/ingenuity/frame1.jpg    ...  frame5
    assets/archives/kepler/frame1.jpg       ...  frame5
    assets/archives/phoenix/frame1.jpg      ...  frame4
    assets/archives/insight/frame1.jpg      ...  frame4
    assets/archives/perseverance/frame1.jpg ...  frame4
    assets/archives/curiosity/frame1.jpg    ...  frame4
    assets/archives/relay/frame1.jpg        ...  frame4

Extensions accepted per file, in order of preference:
`.jpg`, `.png`, `.jpeg`, `.webp`. You can mix — `frame1.jpg` + `frame2.png`
is fine. A missing frame falls back to that slide's drawn pixel scene.

## Slide-by-slide subjects (what photo belongs on each frame)

**pathfinder (5 frames)** — 1: Pathfinder spacecraft or launch; 2: the
bouncing airbag landing / lander on Ares Vallis; 3: Sojourner descending
the ramp / beside the lander; 4: Sojourner at a rock (APXS); 5: the two
machines on the plain, wide shot.

**spirit (5)** — 1: Gusev crater from orbit or Spirit's landing panorama;
2: Spirit's arm / instruments; 3: the silica discovery / Husband Hill view;
4: Spirit embedded at "Troy"; 5: Spirit's final panorama.

**opportunity (5)** — 1: parachute/landing at Meridiani; 2: "blueberries"
macro or Eagle Crater; 3: sedimentary rock layers (Endurance/Victoria);
4: dust storm or long traverse shot; 5: Perseverance Valley / final panorama.

**viking1 (4)** — 1: Viking 1 in orbit / on the pad; 2: first surface
panorama of Chryse Planitia; 3: sampler arm digging; 4: the biology lab
diagram or lander wide shot.

**viking2 (4)** — 1: Utopia Planitia touchdown; 2: meteorology boom /
surface shot; 3: winter frost on the rocks; 4: both Viking sites from orbit.

**dawn (5)** — 1: Dawn launch / cruise; 2: Vesta from orbit; 3: the ion
engine firing (blue glow); 4: Ceres + Occator bright spots; 5: mission map.

**near (5)** — 1: NEAR at Earth flyby / cruise; 2: first orbit of Eros;
3: Eros surface mapping close-ups; 4: the touchdown image from the surface;
5: Eros from orbit after landing.

**p10 (5)** — 1: Pioneer 10 spacecraft; 2: asteroid belt crossing art/plot;
3: first close-up of Jupiter / Great Red Spot; 4: THE GOLDEN PLAQUE
(scan or photo); 5: departing the solar system / antenna to the stars.

**p11 (4)** — 1: Pioneer 11 spacecraft; 2: Jupiter from the flyby;
3: Saturn + rings from 1979; 4: Saturn receding / mission path.

**ingenuity (5)** — 1: Ingenuity stowed under Perseverance; 2: FIRST FLIGHT
hover (Apr 19 2021); 3: aerial scouting / rotor in flight; 4: rotor + thin
air diagram; 5: the final resting place / snapped rotor, shadow on sand.

**kepler (5)** — 1: Kepler spacecraft; 2: starfield it watched; 3: a light
curve / transit diagram; 4: K2 mission diagram; 5: an exoplanet montage /
"thousands of worlds" art.

**phoenix (4)** — 1: Phoenix descending (parachute, Mars Reconnaissance
Orbiter shot!); 2: the trench with white ice; 3: winter frost/darkness;
4: lander wide shot with solar panels.

**insight (4)** — 1: InSight landing (first image) or spacecraft; 2: the
seismometer dome being placed by the arm; 3: a marsquake waveform readout;
4: dust-covered panels, final selfie.

**perseverance (4)** — 1: sky crane descent (MRO shot); 2: drilling /
sample tube; 3: the sample depot; 4: Ingenuity flying ahead of the rover.

**curiosity (4)** — 1: sky crane lowering Curiosity; 2: ChemCam laser
spark on a rock; 3: Mount Sharp layered slopes; 4: Curiosity selfie /
tracks.

**relay (4)** — 1: Mariner 4 spacecraft; 2: the first TV frame of Mars
(frame 11, craters); 3: the numbered 21-frame mosaic; 4: Mariner 4 in
solar orbit / artist impression drifting.

## Art direction

- 16:9-ish, at least 1200×675 px. Photos are drawn **cover-fit** (centred,
  cropped to fill) so exact aspect is forgiving.
- Real NASA images preferred — they are public domain (credit "NASA/JPL"
  is good practice; a small caption can live in the slide's narration).
- Keep the **top-left ~60 px and bottom ~70 px** of each image relatively
  simple: the archival header, hotspot markers and the narration caption
  overlay those bands.
- Slides with clickable hotspots (keep those regions visually clear of
  critical detail): `pathfinder frame2`, `pathfinder frame4`,
  `spirit frame3`, `opportunity frame3`, `viking1 frame3`, `dawn frame3`,
  `p10 frame4`, `ingenuity frame4`, `kepler frame3`.
- A photo is automatically graded: dark gradient top/bottom + scanlines,
  so bright photos still match the terminal look.

## Notes

- Drop files in, then run `node tools/genmanifest.js` once to index them.
  Refresh the page.
- Missing images fall back to the built-in pixel-art scenes.
- Served statically — works on GitHub Pages, Netlify, itch.io, etc.
