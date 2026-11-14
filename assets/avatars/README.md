# EQUIPMENT AVATARS — drop your photos here

This folder holds the **portrait face** shown in every dialogue box and in
the character shelf. Any picture you put here is **auto-cropped to a
square** by the game (`js/images.js`), so framing does not need to be exact.

## File names (exactly as written, one per character)

| File name       | Character                          |
|-----------------|------------------------------------|
| `pathfinder`    | Mars Pathfinder lander             |
| `sojourner`     | Sojourner rover                    |
| `spirit`        | Spirit rover                       |
| `opportunity`   | Opportunity rover                  |
| `viking1`       | Viking 1 lander                    |
| `viking2`       | Viking 2 lander                    |
| `phoenix`       | Phoenix lander                     |
| `insight`       | InSight lander                     |
| `ingenuity`     | Ingenuity helicopter               |
| `perseverance`  | Perseverance rover                 |
| `curiosity`     | Curiosity rover                    |
| `relay`         | Mariner 4 / the Relay Node         |
| `dawn`          | Dawn spacecraft (archive only)     |
| `near`          | NEAR Shoemaker (archive only)      |
| `p10`           | Pioneer 10 (archive only)          |
| `p11`           | Pioneer 11 (archive only)          |
| `kepler`        | Kepler telescope (archive only)    |

Extensions accepted, in this order of preference:
`pathfinder.jpg`, `pathfinder.png`, `pathfinder.jpeg`, `pathfinder.webp`

## Art direction

- **A clean "face" of the machine** — the camera/instrument deck, the dish,
  the rotor hub, the wheel deck. Real NASA photos work great.
- Dark or plain backgrounds crop best (the auto-cropper trims to the
  subject and then centre-squares it).
- Minimum ~400×400 px. Square-ish input looks best but is not required.
- The game draws it at 96×96 in the dialogue box and labels it with the
  machine's name, so a close-up reads better than a wide shot.

## Notes

- Drop the file in, then run `node tools/genmanifest.js` once so the game
  indexes it (keeps the console clean). Refresh the page.
- Missing avatars fall back to the built-in pixel portraits.
- Files here are served statically, so they work on GitHub Pages,
  Netlify, itch.io, any static host.
