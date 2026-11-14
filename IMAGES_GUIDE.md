# THE THINGS WE LEFT BEHIND — Image Import Guide

This game plays perfectly with zero images (everything is drawn
programmatically). But it **loves your photos**: drop real NASA pictures
into the `assets/` folders and they appear automatically.

**After adding any files, run once:**

```
node tools/genmanifest.js
```

then refresh the page. That regenerates `assets/manifest.json`, which the
game uses to find your images instantly and keep the console clean.

Uploads can also be given to the assistant in chat — it will place and
index them for you.

---

## 1 · Where each kind of image goes

| You want to replace…                  | Folder                        | File names |
|---------------------------------------|-------------------------------|------------|
| **Character faces** (dialogue boxes, the hardware shelf labels) | `assets/avatars/` | one per machine, e.g. `spirit.jpg` |
| **Intro cinematic scenes** (SCENE 1–4) | `assets/cinematic/` | `scene1` … `scene4` |
| **Mission Archive slide photos**      | `assets/archives/<archive>/`  | `frame1` … `frame5` per archive |

Accepted extensions (first match wins): `.jpg`, `.png`, `.jpeg`, `.webp`.

---

## 2 · Avatars — `assets/avatars/`

The face shown in every dialogue. **Auto-cropped**: the code finds the
subject against a plain background, trims to it, and centre-squares it —
so don't worry about exact framing.

**File names (all 12 talking machines + 5 archive-only):**
`pathfinder`, `sojourner`, `spirit`, `opportunity`, `viking1`, `viking2`,
`phoenix`, `insight`, `ingenuity`, `perseverance`, `curiosity`, `relay`,
plus `dawn`, `near`, `p10`, `p11`, `kepler` (archive portraits).

**Look:** a clean "face" of the machine — the camera mast head, the dish,
the rotor hub. Close-up beats wide. ≥400×400 px. Dark/plain backgrounds
crop best.

---

## 3 · Cinematic — `assets/cinematic/`

| File      | Scene | Ideal photo |
|-----------|-------|-------------|
| `scene1`  | SCENE 1/4 — the look back | Earth from space / starfield |
| `scene2`  | SCENE 2/4 — mission control | control room, clean room, screens |
| `scene3`  | SCENE 3/4 — launch & cruise | rocket on the pad / craft at stars |
| `scene4`  | SCENE 4/4 — the landing | lander descending / rover on red soil |

16:9, ≥960×540. The game adds vignette, letterbox and scanlines.
Keep the **bottom ~130 px** calm — that's where the dialogue subtitle
bar sits when your image is in use.

---

## 4 · Mission Archives — `assets/archives/<archive>/`

Full slide-by-slide subjects, sizes and hotspot notes are in
[`assets/archives/README.md`](assets/archives/README.md). Summary of the
archive ids: `pathfinder`, `spirit`, `opportunity`, `viking1`, `viking2`,
`dawn`, `near`, `p10`, `p11`, `ingenuity`, `kepler`, `phoenix`, `insight`,
`perseverance`, `curiosity`, `relay`.

**Look:** real NASA/JPL photography (public domain), 16:9-ish, ≥1200×675.
Keep top-left (archival label) and bottom (narration caption) bands simple.
Photos get an automatic terminal-grade dark gradient + scanlines so they
sit inside the archival frame coherently.

Slides with clickable hotspots — keep those rectangles visually clear:
`pathfinder` f2 & f4, `spirit` f3, `opportunity` f3, `viking1` f3,
`dawn` f3, `p10` f4, `ingenuity` f4, `kepler` f3.

---

## 5 · What the game does with (and without) your images

- **With** your image: photo fills the frame/slide; the archival labels,
  narration, hotspot markers and progress UI render on top.
- **Without**: the built-in pixel-art scene draws — the game never breaks.
- Avatars load lazily: the pixel portrait shows for a few frames first.
- Everything works identically on GitHub Pages / Netlify / itch.io —
  the folders are plain static files.

## 6 · Suggested NASA source starting points

- mars.nasa.gov / mars.jpl.nasa.gov mission galleries
- photojournal.jpl.nasa.gov (search by mission)
- nasa.gov "Image of the Day" archive
- commons.wikimedia.org category "Category:NASA images" (per mission)
