/* ============================================================
   THE THINGS WE LEFT BEHIND — archives.js
   Mission Archives: interactive backstory slideshows for every
   piece of discoverable hardware. Data + renderer (mode 'slides').
   Historical facts come from TL.D.ARCHIVE / TL.D.BEYOND;
   character dialogue is fiction, presented as the machine's
   personality — never as a historical recording.
   ============================================================ */
'use strict';
(function (TL) {

  /* ================= ARCHIVE DATA ================= */
  TL.D.ARCHIVES = {
    /* 01 — MARS PATHFINDER / SOJOURNER (spec Character 01) */
    pathfinder: {
      name: 'MARS PATHFINDER & SOJOURNER',
      dates: '1996 – 1997',
      persona: 'CURIOUS · CHEERFUL · PROUD PIONEER',
      accent: '#d8b25a',
      closing: 'Some of the biggest journeys begin with the smallest steps.',
      slides: [
        { t: 'A JOURNEY TO ANOTHER WORLD', art: 'pathfinder:0',
          n: 'In 1996, NASA launched Mars Pathfinder. Its destination was Mars, a world humanity had spent decades trying to understand.',
          d: 'SOJOURNER: "Quite a journey for something so small, isn\'t it?"' },
        { t: 'THE LANDING', art: 'pathfinder:1',
          n: 'In 1997, Pathfinder reached Mars. Protected by airbags, the lander bounced across the Martian surface before coming to rest.',
          d: 'SOJOURNER: "I hear the landing was a little bumpy."',
          hs: [{ x: 0.3, y: 0.72, w: 0.4, h: 0.24, label: 'AIRBAG LANDING SYSTEM', text: 'The lander was wrapped in inflated airbags and dropped onto Mars — no engines, no legs. It bounced about fifteen times, then stopped and opened like a flower.' }] },
        { t: 'THE LITTLE ROVER', art: 'pathfinder:2',
          n: 'From Pathfinder came Sojourner, a small robotic rover built to investigate nearby rocks and soil.',
          d: 'SOJOURNER: "I wasn\'t very big. But I had a whole planet to explore."' },
        { t: 'THE FIRST STEPS', art: 'pathfinder:3',
          n: 'Sojourner examined Martian rocks and soil, helping scientists learn more about the planet\'s surface.',
          hs: [
            { x: 0.24, y: 0.72, w: 0.18, h: 0.24, label: 'APXS SPECTROMETER', text: 'The alpha-proton X-ray spectrometer "tasted" what rocks were made of — including ones named Barnacle Bill and Yogi.' },
            { x: 0.58, y: 0.5, w: 0.22, h: 0.34, label: 'THE ROCKS', text: 'Fifteen rocks analysed. Some showed signatures shaped by water — the clue that kept the rover hunting.' }
          ] },
        { t: 'A SMALL BEGINNING', art: 'pathfinder:4',
          n: 'Pathfinder and Sojourner helped demonstrate a new way of exploring Mars: sending mobile robots to investigate the surface directly.',
          d: 'SOJOURNER: "Not bad for a little rover, huh?"' }
      ]
    },

    /* 02 — SPIRIT (spec Character 02) */
    spirit: {
      name: 'SPIRIT — MER-A',
      dates: '2003 – 2010',
      persona: 'STUBBORN · DETERMINED · QUIETLY PROUD',
      accent: '#c07840',
      closing: 'Progress isn\'t always measured by how far you travel.',
      slides: [
        { t: 'ARRIVING AT MARS', art: 'spirit:0',
          n: 'Spirit arrived on Mars in January 2004, beginning an exploration of Gusev Crater.',
          d: 'SPIRIT: "The terrain looked easier from orbit."' },
        { t: 'A PLANET OF CLUES', art: 'spirit:1',
          n: 'Spirit was sent to study Martian rocks and soil, searching for clues about the planet\'s past.',
          d: 'SPIRIT: "Rocks are excellent storytellers. You just have to know what to look for."' },
        { t: 'EVIDENCE OF WATER', art: 'spirit:2',
          n: 'Spirit found geological evidence that water had affected rocks on Mars in the past.',
          d: 'SPIRIT: "This place wasn\'t always the dry landscape you see today."',
          hs: [{ x: 0.44, y: 0.28, w: 0.36, h: 0.56, label: 'THE SAMPLE', text: 'Silica and carbonate traces, shaped by hot water — evidence of an ancient, habitable environment hiding further than anyone first looked.' }] },
        { t: 'THE DIFFICULT TERRAIN', art: 'spirit:3',
          n: 'Later in its mission, Spirit became stuck in soft Martian soil and could no longer continue driving.',
          d: 'SPIRIT: "I suppose even the best explorers get stuck sometimes."' },
        { t: 'WHAT REMAINS', art: 'spirit:4',
          n: 'Spirit\'s mobility mission ended, but the discoveries it made remained part of humanity\'s understanding of Mars.' }
      ]
    },

    /* 03 — OPPORTUNITY (spec Character 03) */
    opportunity: {
      name: 'OPPORTUNITY — MER-B',
      dates: '2003 – 2018',
      persona: 'OPTIMISTIC · FRIENDLY · ADVENTUROUS',
      accent: '#d88a50',
      closing: 'An unexpected amount of time can create an extraordinary amount of discovery.',
      slides: [
        { t: 'ANOTHER EXPLORER', art: 'opportunity:0',
          n: 'Opportunity arrived on Mars in January 2004, joining its twin rover Spirit in exploring the planet.',
          d: 'OPPORTUNITY: "Well, hello there! Lovely place, isn\'t it?"' },
        { t: 'EXPLORING MERIDIANI PLANUM', art: 'opportunity:1',
          n: 'Opportunity explored Meridiani Planum, examining rocks and geological formations.',
          d: 'OPPORTUNITY: "There\'s always something interesting around the next rock."' },
        { t: 'CLUES FROM ANCIENT WATER', art: 'opportunity:2',
          n: 'Opportunity discovered evidence that liquid water had once affected the Martian environment.',
          hs: [{ x: 0.46, y: 0.24, w: 0.34, h: 0.58, label: 'THE DISCOVERY', text: 'Hematite "blueberries" and sulphate salts — proof that long-lived salty water once covered this plain.' }] },
        { t: 'MUCH LONGER THAN EXPECTED', art: 'opportunity:3',
          n: 'Opportunity was originally designed for a mission lasting around 90 Martian days. It continued operating for nearly 15 years.',
          d: 'OPPORTUNITY: "Ninety days? I think I got a little carried away."' },
        { t: 'THE FINAL SIGNAL', art: 'opportunity:4',
          n: 'Opportunity\'s mission ended in 2018 after a planet-wide dust storm prevented it from restoring sufficient power.',
          d: 'OPPORTUNITY: "I had a wonderful view while it lasted."' }
      ]
    },

    /* 04 — VIKING 1 (spec Character 04) */
    viking1: {
      name: 'VIKING 1',
      dates: '1975 – 1982',
      persona: 'FORMAL · COMPOSED · SCIENTIFIC',
      accent: '#9fd8c8',
      closing: 'Science advances not only through answers, but through better questions.',
      slides: [
        { t: 'THE FIRST ARRIVAL', art: 'viking1:0',
          n: 'In July 1976, Viking 1 became the first US spacecraft to successfully land on Mars.',
          d: 'VIKING 1: "A historic arrival, if I may say so."' },
        { t: 'A NEW VIEW OF MARS', art: 'viking1:1',
          n: 'Viking 1 sent back images of its surroundings, giving humanity a close-up view of the Martian surface.',
          d: 'VIKING 1: "For the first time, we could examine this place from the ground."' },
        { t: 'EXPERIMENTS ON ANOTHER PLANET', art: 'viking1:2',
          n: 'Viking carried instruments designed to study Martian soil and investigate whether signs of life might be present.',
          hs: [{ x: 0.56, y: 0.62, w: 0.14, h: 0.26, label: 'SAMPLER ARM', text: 'A trenching scoop dug into the soil and delivered samples inside the lander, where three biology experiments waited.' }] },
        { t: 'AN UNANSWERED QUESTION', art: 'viking1:3',
          n: 'The life-detection experiments produced interesting results, but did not establish definitive evidence of life on Mars.',
          d: 'VIKING 1: "Not every experiment produces a simple answer."' }
      ]
    },

    /* 05 — VIKING 2 (spec Character 05) */
    viking2: {
      name: 'VIKING 2',
      dates: '1975 – 1980',
      persona: 'PATIENT · OBSERVANT · QUIETLY WRY',
      accent: '#a8d8e0',
      closing: 'Sometimes understanding a world means looking at it from more than one place.',
      slides: [
        { t: 'A SECOND LANDING', art: 'viking2:0',
          n: 'Viking 2 followed Viking 1, landing at Utopia Planitia in September 1976.',
          d: 'VIKING 2: "A different landing site. A different perspective."' },
        { t: 'OBSERVING THE ENVIRONMENT', art: 'viking2:1',
          n: 'Viking 2 studied its surroundings using instruments designed to investigate the Martian surface and atmosphere.' },
        { t: 'WEATHER AND SEASONS', art: 'viking2:2',
          n: 'Long-term observations helped scientists study Martian weather and environmental conditions.',
          d: 'VIKING 2: "Even a quiet landscape changes with time."' },
        { t: 'TWO LANDERS, A BROADER PICTURE', art: 'viking2:3',
          n: 'Together, the Viking missions provided scientists with observations from two different locations on Mars.' }
      ]
    },

    /* 06 — DAWN (spec Character 06) */
    dawn: {
      name: 'DAWN',
      dates: '2007 – 2018',
      persona: 'PATIENT · REFLECTIVE · QUIETLY AMBITIOUS',
      accent: '#8ab8f0',
      closing: 'Sometimes the greatest journeys are the ones that teach us to keep going.',
      slides: [
        { t: 'LEAVING EARTH', art: 'dawn:0',
          n: 'Dawn launched in 2007 on a journey into the asteroid belt.' },
        { t: 'VESTA', art: 'dawn:1',
          n: 'Dawn reached Vesta in 2011 and studied the large asteroid-like body from orbit.',
          d: 'DAWN: "My first destination. A world full of geological history."' },
        { t: 'THE LONG JOURNEY', art: 'dawn:2',
          n: 'After studying Vesta, Dawn continued its journey towards Ceres using ion propulsion.',
          hs: [{ x: 0.66, y: 0.56, w: 0.26, h: 0.34, label: 'ION PROPULSION', text: 'Xenon ions, accelerated by electricity, made a faint blue thrust — gentle as a sheet of paper on your hand, but it never stopped pushing.' }] },
        { t: 'CERES', art: 'dawn:3',
          n: 'Dawn reached Ceres in 2015, becoming the first spacecraft to orbit a dwarf planet.',
          d: 'DAWN: "A second destination. Another world to understand."' },
        { t: 'A JOURNEY OF TWO WORLDS', art: 'dawn:4',
          n: 'Dawn became the first mission to orbit two extraterrestrial destinations beyond Earth.' }
      ]
    },

    /* 07 — NEAR SHOEMAKER (spec Character 07) */
    near: {
      name: 'NEAR SHOEMAKER',
      dates: '1996 – 2001',
      persona: 'ADVENTUROUS · WITTY · RESOURCEFUL',
      accent: '#c8b090',
      closing: 'Sometimes an unexpected ending can become one more achievement.',
      slides: [
        { t: 'TOWARDS EROS', art: 'near:0',
          n: 'NEAR Shoemaker launched in 1996 to study the near-Earth asteroid Eros.' },
        { t: 'AN ASTEROID UP CLOSE', art: 'near:1',
          n: 'In 2000, NEAR Shoemaker became the first spacecraft to orbit an asteroid.',
          d: 'NEAR: "Quite a peculiar place, isn\'t it?"' },
        { t: 'MAPPING A SMALL WORLD', art: 'near:2',
          n: 'From orbit, NEAR Shoemaker studied Eros and gathered information about its surface and composition.' },
        { t: 'AN UNEXPECTED LANDING', art: 'near:3',
          n: 'In February 2001, the spacecraft descended onto Eros. It survived the landing and continued returning data.',
          d: 'NEAR: "Well, that wasn\'t exactly in the original plan."' },
        { t: 'ONE LAST DISCOVERY', art: 'near:4',
          n: 'Even after its landing, NEAR Shoemaker continued to provide valuable observations before communication ended.' }
      ]
    },

    /* 08 — PIONEER 10 (spec Character 08) */
    p10: {
      name: 'PIONEER 10',
      dates: '1972 – 2003',
      persona: 'BOLD · CONFIDENT · NOSTALGIC',
      accent: '#e0c090',
      closing: 'Even a small message can carry the hopes of an entire world.',
      slides: [
        { t: 'THE FIRST DEPARTURE', art: 'p10:0',
          n: 'In 1972, Pioneer 10 began its journey towards the outer solar system.' },
        { t: 'CROSSING THE ASTEROID BELT', art: 'p10:1',
          n: 'Pioneer 10 became the first spacecraft to traverse the asteroid belt.' },
        { t: 'JUPITER', art: 'p10:2',
          n: 'In 1973, Pioneer 10 became the first spacecraft to fly past Jupiter.',
          d: 'PIONEER 10: "The first close encounter. What a sight."' },
        { t: 'A MESSAGE FROM EARTH', art: 'p10:3',
          n: 'Pioneer 10 carried a plaque intended to communicate basic information about humanity and Earth to anyone who might encounter it.',
          hs: [
            { x: 0.4, y: 0.24, w: 0.16, h: 0.4, label: 'THE FIGURES', text: 'A man and a woman, drawn to scale against a schematic of the spacecraft behind them — so anyone finding it could judge our size.' },
            { x: 0.24, y: 0.28, w: 0.2, h: 0.36, label: 'THE PULSAR MAP', text: 'Lines radiating from a point in space, each keyed to a pulsar\'s period: a map that points home, and a date in binary.' },
            { x: 0.38, y: 0.62, w: 0.22, h: 0.2, label: 'THE SILENCE', text: 'No language. Just hydrogen, geometry and light — the only alphabet the universe shares with everyone.' }
          ] },
        { t: 'INTO THE DISTANCE', art: 'p10:4',
          n: 'Pioneer 10 continued outward beyond the planets. Its final signal was received in 2003.',
          d: 'PIONEER 10: "We wanted to say hello."' }
      ]
    },

    /* 09 — PIONEER 11 (spec Character 09) */
    p11: {
      name: 'PIONEER 11',
      dates: '1973 – 1995',
      persona: 'RESERVED · ANALYTICAL · QUIETLY COMPETITIVE',
      accent: '#b8d0c0',
      closing: 'Being the next explorer can be just as important as being the first.',
      slides: [
        { t: 'FOLLOWING A PATH', art: 'p11:0',
          n: 'Pioneer 11 launched in 1973, following its predecessor into the outer solar system.',
          d: 'PIONEER 11: "A path had been opened. There was more to discover."' },
        { t: 'JUPITER AGAIN', art: 'p11:1',
          n: 'Pioneer 11 flew past Jupiter, gathering additional observations of the giant planet.' },
        { t: 'THE FIRST VISIT TO SATURN', art: 'p11:2',
          n: 'In 1979, Pioneer 11 became the first spacecraft to fly past Saturn.',
          d: 'PIONEER 11: "A rather remarkable view, even by my standards."' },
        { t: 'THE WAY FORWARD', art: 'p11:3',
          n: 'Pioneer 11\'s observations helped prepare the way for later exploration of the outer planets.' }
      ]
    },

    /* 10 — INGENUITY (spec Character 10) */
    ingenuity: {
      name: 'INGENUITY',
      dates: '2021 – 2024',
      persona: 'ENERGETIC · PLAYFUL · SLIGHTLY BOASTFUL',
      accent: '#f0a050',
      closing: 'Some of the most important achievements begin as experiments.',
      slides: [
        { t: 'A DIFFERENT KIND OF EXPLORER', art: 'ingenuity:0',
          n: 'Ingenuity travelled to Mars with the Perseverance rover as a small experimental helicopter.',
          d: 'INGENUITY: "I wasn\'t built to drive. I had a different idea."' },
        { t: 'THE FIRST FLIGHT', art: 'ingenuity:1',
          n: 'On April 19, 2021, Ingenuity completed the first powered, controlled flight on another planet.',
          d: 'INGENUITY: "And up we went!"' },
        { t: 'BEYOND THE ORIGINAL PLAN', art: 'ingenuity:2',
          n: 'Originally designed for five flights, Ingenuity eventually completed 72.',
          d: 'INGENUITY: "Five flights were planned. Seventy-two completed. Not bad!"' },
        { t: 'FLYING ON MARS', art: 'ingenuity:3',
          n: 'Mars has a very thin atmosphere, so Ingenuity needed rapidly spinning rotors to generate enough lift.',
          hs: [{ x: 0.6, y: 0.14, w: 0.32, h: 0.38, label: 'THE CHALLENGE', text: 'Mars air is about 1% as dense as Earth\'s. Ingenuity\'s carbon-fibre blades spun at 2,400 rpm to lift its 1.8 kg off the ground.' }] },
        { t: 'THE FINAL FLIGHT', art: 'ingenuity:4',
          n: 'Ingenuity\'s final flight took place in January 2024. Damage to its rotor blades meant it could not fly again.',
          d: 'INGENUITY: "I suppose seventy-two flights is quite a lot for a little helicopter."' }
      ]
    },

    /* 11 — KEPLER (spec Character 11) */
    kepler: {
      name: 'KEPLER SPACE TELESCOPE',
      dates: '2009 – 2018',
      persona: 'GENTLE · DREAMY · FASCINATED BY DISTANT WORLDS',
      accent: '#a0c8f0',
      closing: 'Sometimes a tiny change in light can reveal an entire world.',
      slides: [
        { t: 'LOOKING INTO THE STARS', art: 'kepler:0',
          n: 'In 2009, NASA launched the Kepler Space Telescope to search for planets orbiting distant stars.',
          d: 'KEPLER: "There was so much out there. I just had to look."' },
        { t: 'WATCHING STARLIGHT', art: 'kepler:1',
          n: 'Kepler observed the brightness of stars over time, searching for tiny changes in their light.' },
        { t: 'FINDING DISTANT WORLDS', art: 'kepler:2',
          n: 'When a planet passes in front of its star, it can cause a small dip in the star\'s brightness. Kepler used this transit method to identify possible planets.',
          hs: [{ x: 0.52, y: 0.5, w: 0.4, h: 0.32, label: 'THE LIGHT CURVE', text: 'Each regular dip is a planet crossing its star. Time the repeats and you can size the world and measure its year — from light alone.' }] },
        { t: 'A NEW WAY FORWARD', art: 'kepler:3',
          n: 'After problems with its reaction wheels affected its original pointing ability, Kepler continued observing through the K2 mission.',
          d: 'KEPLER: "A different approach. The same curiosity."' },
        { t: 'THE LAST OBSERVATIONS', art: 'kepler:4',
          n: 'Kepler\'s mission ended in 2018 after it ran out of fuel. Its observations helped reveal thousands of confirmed exoplanets.',
          d: 'KEPLER: "The universe was never as empty as it looked."' }
      ]
    },

    /* ==== DATA-DERIVED ARCHIVES ==== */

    /* 12 — PHOENIX (facts from TL.D.ARCHIVE) */
    phoenix: {
      name: 'PHOENIX',
      dates: '2007 – 2008',
      persona: 'QUIETLY TRIUMPHANT · CURIOUS · GENTLE',
      accent: '#bfe8f0',
      closing: 'It rose from spare parts of two failed missions, and became the first to touch water on another world.',
      slides: [
        { t: 'A POLAR ARRIVAL', art: 'phoenix:0',
          n: 'In May 2008, Phoenix landed in Vastitas Borealis, the northern plains of Mars, on a mission to dig into the polar soil.' },
        { t: 'TOUCHING THE ICE', art: 'phoenix:1',
          n: 'Phoenix confirmed water ice just centimetres below the soil, and found perchlorates — soil chemistry surprisingly Earth-like. The first mission to touch Martian water.',
          hs: [{ x: 0.64, y: 0.74, w: 0.16, h: 0.2, label: 'THE TRENCH', text: 'Bright white material dug up by the arm slowly faded over the following days — it was ice, turning to vapour in the thin air.' }] },
        { t: 'THE LONG DARK', art: 'phoenix:2',
          n: 'As Martian winter came, ice and darkness drained its solar power. The last signal was received on November 2, 2008.' },
        { t: 'WHAT IT LEFT BEHIND', art: 'phoenix:3',
          n: 'The soil record Phoenix returned reshaped ideas about where habitable chemistry can survive on Mars.' }
      ]
    },

    /* 13 — INSIGHT (facts from TL.D.ARCHIVE) */
    insight: {
      name: 'INSIGHT',
      dates: '2018 – 2022',
      persona: 'CALM · ATTENTIVE · SOFT-SPOKEN',
      accent: '#f0c060',
      closing: 'It laid its ear on the ground and listened for four Earth years.',
      slides: [
        { t: 'A QUIET ARRIVAL', art: 'insight:0',
          n: 'InSight landed in Elysium Planitia in November 2018, built to study the interior of Mars — quakes, heat, and wobble.' },
        { t: 'LISTENING TO THE PLANET', art: 'insight:1',
          n: 'Its seismometer sat directly on the ground, listening for the faint tremors of a planet we had never heard before.' },
        { t: 'WHAT THE GROUND SAID', art: 'insight:2',
          n: 'Over 1,300 marsquakes were detected, including a magnitude-5 — enough to measure the crust, mantle and liquid core, and to reveal a thinner crust than expected.' },
        { t: 'A DIMMING VOICE', art: 'insight:3',
          n: 'Dust slowly covered its solar panels. When the power ran out in December 2022, InSight fell silent.' }
      ]
    },

    /* 14 — PERSEVERANCE (facts from TL.D.ARCHIVE) */
    perseverance: {
      name: 'PERSEVERANCE',
      dates: '2021 – PRESENT',
      persona: 'FOCUSED · DILIGENT · STEADFAST',
      accent: '#c0e0a0',
      closing: 'Not left behind — still out there, drilling, breathing, waiting for the day its tubes come home.',
      slides: [
        { t: 'DOWN IN JEZERO', art: 'perseverance:0',
          n: 'Perseverance landed in Jezero Crater in February 2021 — the site of a 3.5-billion-year-old lakebed with an ancient river delta.' },
        { t: 'COLLECTING THE PAST', art: 'perseverance:1',
          n: 'It has sealed more than 25 sample tubes from the delta and found organic molecules in "Wildcat Ridge". Its MOXIE experiment even made oxygen from Martian CO2.' },
        { t: 'A COMPANION IN THE SKY', art: 'perseverance:2',
          n: 'Perseverance deployed the small helicopter Ingenuity, then watched it fly.' },
        { t: 'STILL EXPLORING', art: 'perseverance:3',
          n: 'Perseverance remains active — caching samples for a future return to Earth, one careful drill at a time.' }
      ]
    },

    /* 15 — CURIOSITY (facts from TL.D.ARCHIVE) */
    curiosity: {
      name: 'CURIOSITY — MSL',
      dates: '2011 – PRESENT',
      persona: 'CHEERFUL · MUSICAL · EVER-CURIOUS',
      accent: '#f0d080',
      closing: 'It landed on sky-crane tethers and has been singing itself Happy Birthday ever since.',
      slides: [
        { t: 'SEVEN MINUTES OF SKY CRANE', art: 'curiosity:0',
          n: 'Curiosity landed in Gale Crater in August 2012, lowered on sky-crane tethers to begin reading Mount Sharp — 5 km of layered rock like a history book.' },
        { t: 'READING THE ROCKS', art: 'curiosity:1',
          n: 'Its laser has fired at more than 3,000 rock targets, reading their chemistry from 7 metres away.' },
        { t: 'AN ANCIENT LAKE', art: 'curiosity:2',
          n: 'Curiosity proved Gale Crater once held a long-lived lake of fresh water, and found organic molecules and seasonal methane.' },
        { t: 'STILL CLIMBING', art: 'curiosity:3',
          n: 'Years past its plan, Curiosity keeps climbing the slopes of Mount Sharp, logging every layer.' }
      ]
    },

    /* 16 — MARINER 4 · THE RELAY (facts from TL.D.ARCHIVE) */
    relay: {
      name: 'MARINER 4 (ECHO)',
      dates: '1964 – 1965',
      persona: 'FAINT · ANCIENT · STILL LISTENING',
      accent: '#b0a8d8',
      closing: 'Humanity\'s first hello from Mars arrived as 21 frames of static and wonder.',
      slides: [
        { t: 'THE FIRST HELLO', art: 'relay:0',
          n: 'Mariner 4 launched in November 1964. In July 1965 it performed the first successful flyby of Mars — the first close-up photographs of another planet.' },
        { t: 'TWENTY-ONE FRAMES', art: 'relay:1',
          n: 'It returned 21 grainy frames: craters, no canals, no cities — an air-thin, moonlike Mars.' },
        { t: 'REWRITING THE BOOKS', art: 'relay:2',
          n: 'Its readings put the atmosphere at 5-10 millibars. Every book about the red planet was rewritten overnight.' },
        { t: 'STILL DRIFTING', art: 'relay:3',
          n: 'Mariner 4 is now drifting in solar orbit — the archived signal that led every later explorer here.' }
      ]
    }
  };

  /* ================= CHARACTER -> ARCHIVE MAP ================= */
  TL.D.ARCHIVE_OF = {
    pathfinder: 'pathfinder', sojourner: 'pathfinder', spirit: 'spirit', opportunity: 'opportunity',
    viking1: 'viking1', viking2: 'viking2', phoenix: 'phoenix', insight: 'insight',
    ingenuity: 'ingenuity', perseverance: 'perseverance', curiosity: 'curiosity', relay: 'relay'
  };

  /* ================= SLIDESHOW RENDERER ================= */
  /* A recovered-memory interface: warm mechanical casing around a
     deep-navy display, terminal-green indicators, scanlines. */
  var SL = TL.Slides = {
    id: null, slide: 0, ret: 'play', t: 0, trans: 0, info: null
  };

  /* layout constants (TL 960x540) */
  var V = { x: 20, y: 76, w: 600, h: 338 };     /* 16:9-ish scene viewport */
  var RC = { x: 636, w: 304 };                  /* right column */
  var CAP = { y: 420, h: 54 };                  /* caption bar */
  var FTR = { y: 492, h: 32 };                  /* footer buttons */

  function inRect(m, x, y, w, h) { return m.x >= x && m.x <= x + w && m.y >= y && m.y <= y + h; }
  function pad2(n2) { return (n2 < 10 ? '0' : '') + n2; }

  SL.a = function () { return TL.D.ARCHIVES[SL.id]; };

  SL.open = function (id, ret) {
    if (!TL.D.ARCHIVES[id]) return;
    SL.id = id;
    var n = TL.D.ARCHIVES[id].slides.length;
    SL.slide = TL.clamp(TL.S.archPos[id] || 0, 0, n - 1);
    SL.ret = ret || 'play';
    SL.info = null;
    SL.trans = 0.4;
    SL.t = 0;
    TL.audio.static(0.3, 0.05);
    TL.audio.ui();
    if (TL.G.setMode) TL.G.setMode('slides'); else TL.G.mode = 'slides';
  };

  SL.change = function (dir) {
    var n = SL.a().slides.length;
    var s2 = TL.clamp(SL.slide + dir, 0, n - 1);
    if (s2 === SL.slide) return;
    SL.slide = s2;
    SL.info = null;
    SL.trans = 0.32;
    TL.S.archPos[SL.id] = s2;
    TL.save();
    TL.audio.static(0.18, 0.045);
    TL.audio.blip(700, 0.04, 0.06);
  };

  SL.close = function () {
    if (!SL.id) return;
    TL.S.archPos[SL.id] = SL.slide;
    TL.save();
    var r = SL.ret;
    SL.id = null;
    TL.audio.uiBack();
    var m2 = r === 'archive' ? 'archive' : 'play';
    if (TL.G.setMode) TL.G.setMode(m2); else TL.G.mode = m2;
  };

  SL.update = function (dt) {
    if (!SL.id) return;
    SL.t += dt;
    if (SL.trans > 0) { SL.trans = Math.max(0, SL.trans - dt); return; }
    var a = SL.a(), n = a.slides.length, last = SL.slide >= n - 1;
    /* keyboard / touch buttons */
    if (SL.slide > 0 && (TL.hit('arrowleft') || TL.jumpHit())) { SL.change(-1); return; }
    if (TL.hit('arrowright') || TL.actHit()) {
      if (last) SL.close(); else SL.change(1);
      return;
    }
    if (TL.hit('escape')) { SL.close(); return; }
    /* mouse / touch taps */
    var m = TL.mouse;
    if (m.clicked) {
      if (inRect(m, 908, 14, 34, 34)) { SL.close(); return; }                     /* close */
      if (inRect(m, 20, FTR.y, 130, FTR.h)) {                                     /* prev */
        if (SL.slide > 0) { SL.change(-1); return; }
        TL.audio.deny(); return;
      }
      if (inRect(m, 690, FTR.y, 250, FTR.h)) {                                    /* next / return */
        if (last) SL.close(); else SL.change(1);
        return;
      }
      /* hotspots */
      var s2 = a.slides[SL.slide];
      if (s2.hs) {
        for (var i = 0; i < s2.hs.length; i++) {
          var h = s2.hs[i];
          if (m.x > V.x + h.x * V.w && m.x < V.x + (h.x + h.w) * V.w &&
              m.y > V.y + h.y * V.h && m.y < V.y + (h.y + h.h) * V.h) {
            SL.info = (SL.info === h) ? null : h;
            TL.audio.ui();
            return;
          }
        }
      }
    }
  };

  SL.draw = function (ctx) {
    if (!SL.id) return;
    TL.BIG_TEXT = true;   /* the archive is a book page: keep its text readable */
    var a = SL.a(), s2 = a.slides[SL.slide], n = a.slides.length, last = SL.slide >= n - 1;
    var ac = a.accent;

    /* warm mechanical casing */
    var cg = ctx.createLinearGradient(0, 0, 0, TL.H);
    cg.addColorStop(0, '#1c1610'); cg.addColorStop(0.55, '#14100c'); cg.addColorStop(1, '#0d0a08');
    ctx.fillStyle = cg; ctx.fillRect(0, 0, TL.W, TL.H);
    ctx.strokeStyle = '#3e2f20'; ctx.lineWidth = 3;
    ctx.strokeRect(5, 5, TL.W - 10, TL.H - 10);
    ctx.strokeStyle = 'rgba(240,200,140,0.12)'; ctx.lineWidth = 1;
    ctx.strokeRect(9, 9, TL.W - 18, TL.H - 18);
    /* rivets */
    ctx.fillStyle = '#4e3c28';
    for (var rv = 0; rv < 12; rv++) {
      ctx.fillRect(14 + rv * 78, 11, 3, 3);
      ctx.fillRect(14 + rv * 78, TL.H - 14, 3, 3);
    }

    /* header */
    TL.text(ctx, 'MISSION ARCHIVE // ' + SL.id.toUpperCase(), 24, 16, 7, '#7ef0c8');
    TL.text(ctx, a.name, 24, 30, 14, ac);
    TL.text(ctx, 'MISSION DATES: ' + a.dates, 24, 54, 7, '#8a9aa8');
    TL.text(ctx, 'PERSONALITY PROFILE: ' + a.persona, 900, 54, 7, '#6a8a9a', 'right');
    /* terminal LEDs */
    for (var i = 0; i < 5; i++) {
      var on = Math.sin(SL.t * (2 + i) + i * 1.3) > -0.2;
      ctx.fillStyle = on ? '#7ef0c8' : '#1e4a3e';
      ctx.fillRect(700 + i * 16, 34, 8, 8);
    }
    /* close button */
    TL.panel(ctx, 908, 14, 34, 34, { bg: 'rgba(48,20,14,0.9)', corner: '#f0a050' });
    TL.text(ctx, 'X', 925, 24, 10, '#f0a050', 'center');

    /* scene viewport */
    TL.panel(ctx, V.x - 6, V.y - 6, V.w + 12, V.h + 12, { bg: 'rgba(6,16,28,0.94)', border: 'rgba(90,140,170,0.45)', corner: ac });
    ctx.save();
    ctx.beginPath(); ctx.rect(V.x, V.y, V.w, V.h); ctx.clip();
    ctx.translate(V.x, V.y);
    var simg = TL.Images ? TL.Images.slide(SL.id, SL.slide) : null;
    if (simg) {
      /* user-imported photo replaces the drawn scene, archival grade-in on top */
      TL.rect(ctx, 0, 0, V.w, V.h, '#04080e');
      TL.Images.drawCover(ctx, simg, 0, 0, V.w, V.h);
      var gph = ctx.createLinearGradient(0, 0, 0, V.h);
      gph.addColorStop(0, 'rgba(4,10,16,0.6)'); gph.addColorStop(0.45, 'rgba(4,10,16,0)'); gph.addColorStop(1, 'rgba(4,10,16,0.65)');
      ctx.fillStyle = gph; ctx.fillRect(0, 0, V.w, V.h);
      TL.ArchiveArt.scan(ctx, V.w, V.h);
    } else {
      TL.ArchiveArt.paint(SL.id, SL.slide, ctx, V.w, V.h, SL.t);
    }
    /* archival frame labels */
    TL.text(ctx, 'ARCHIVE ' + SL.id.toUpperCase() + ' · FRAME ' + (SL.slide + 1) + '/' + n, 10, 8, 6, 'rgba(126,240,200,0.75)');
    if (Math.sin(SL.t * 5) > 0) TL.text(ctx, '\u25CF REC', V.w - 46, 8, 6, '#f0a050');
    /* hotspot markers */
    if (s2.hs) {
      for (i = 0; i < s2.hs.length; i++) {
        var h = s2.hs[i];
        var hx = h.x * V.w + h.w * V.w / 2, hy = h.y * V.h + h.h * V.h / 2;
        var pulse = 0.6 + 0.4 * Math.sin(SL.t * 4 + i * 2);
        ctx.strokeStyle = SL.info === h ? '#7ef0c8' : 'rgba(126,240,200,' + (0.4 + pulse * 0.5) + ')';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(h.x * V.w, h.y * V.h, h.w * V.w, h.h * V.h);
        ctx.fillStyle = SL.info === h ? '#7ef0c8' : 'rgba(126,240,200,' + (0.55 + pulse * 0.35) + ')';
        ctx.beginPath();
        ctx.moveTo(hx, hy - 5 - pulse * 2); ctx.lineTo(hx + 5 + pulse * 2, hy);
        ctx.lineTo(hx, hy + 5 + pulse * 2); ctx.lineTo(hx - 5 - pulse * 2, hy);
        ctx.closePath(); ctx.fill();
      }
    }
    /* retrieval transition */
    if (SL.trans > 0) {
      var tp = SL.trans / 0.4;
      ctx.fillStyle = 'rgba(6,14,24,' + (0.75 - tp * 0.25) + ')';
      ctx.fillRect(0, 0, V.w, V.h);
      var r = TL.RNG((performance.now() * 0.05) | 0);
      ctx.globalAlpha = 0.4;
      for (var st = 0; st < 60; st++) {
        ctx.fillStyle = r() > 0.5 ? '#8fffe0' : '#1b4a44';
        ctx.fillRect(r() * V.w, r() * V.h, 30 + r() * 100, 1 + r() * 2);
      }
      ctx.globalAlpha = 1;
      var bar = (1 - tp) * V.w;
      ctx.fillStyle = 'rgba(126,240,200,0.35)';
      ctx.fillRect(0, bar - 2, V.w, 4);
      TL.text(ctx, 'RETRIEVING ARCHIVED MEMORY', V.w / 2, V.h / 2 - 8, 8, '#7ef0c8', 'center');
      ctx.fillStyle = 'rgba(6,14,24,0.6)';
      ctx.fillRect(V.w / 2 - 110, V.h / 2 + 12, 220, 10);
      ctx.fillStyle = '#7ef0c8';
      ctx.fillRect(V.w / 2 - 108, V.h / 2 + 14, 216 * (1 - tp), 6);
    }
    ctx.restore();

    /* caption bar: dialogue or hotspot info */
    var cap = SL.info ? ('\u25C8 ' + SL.info.label + ' — ' + SL.info.text) : (s2.d || '');
    if (cap) {
      TL.panel(ctx, V.x - 6, CAP.y, V.w + 12, CAP.h, { bg: 'rgba(6,16,28,0.92)', border: 'rgba(90,140,170,0.3)', corner: SL.info ? '#7ef0c8' : ac });
      var cl = TL.wrap(ctx, cap, V.w - 28, 7);
      for (i = 0; i < Math.min(cl.length, 4); i++) {
        TL.text(ctx, cl[i], V.x + 10, CAP.y + 7 + i * 12, 7, SL.info ? '#c8f0e0' : '#e8e0d0');
      }
    }

    /* right column */
    TL.panel(ctx, RC.x - 6, V.y - 6, RC.w + 12, V.h + CAP.h + 16, { bg: 'rgba(10,16,22,0.88)', border: 'rgba(90,140,170,0.3)', corner: ac });
    TL.text(ctx, 'FRAME ' + (SL.slide + 1) + ' OF ' + n, RC.x, V.y + 2, 6, '#6a8a9a');
    var tl2 = TL.wrap(ctx, s2.t, RC.w, 10);
    for (i = 0; i < tl2.length; i++) TL.text(ctx, tl2[i], RC.x, V.y + 18 + i * 15, 10, ac);
    var ty = V.y + 18 + tl2.length * 15 + 12;
    ctx.fillStyle = 'rgba(126,240,200,0.25)'; ctx.fillRect(RC.x, ty, RC.w, 1);
    TL.text(ctx, 'NARRATION LOG', RC.x, ty + 8, 6, '#59c8f0');
    var nl = TL.wrap(ctx, s2.n, RC.w, 7);
    for (i = 0; i < nl.length; i++) TL.text(ctx, nl[i], RC.x, ty + 22 + i * 12, 7, '#c8d8dc');
    /* hotspot hint */
    if (s2.hs) TL.text(ctx, '\u25C8 CLICK MARKED POINTS TO INSPECT', RC.x, V.y + V.h - 60, 6, '#6ad8b0');
    /* closing thought (last slide) */
    if (last) {
      var cy = V.y + V.h - 26;
      var cll = TL.wrap(ctx, '"' + a.closing + '"', RC.w - 8, 7);
      for (i = 0; i < cll.length; i++) TL.text(ctx, cll[i], RC.x, cy - (cll.length - 1 - i) * 12, 7, ac);
    }

    /* footer: prev / counter / next-return */
    var prevOn = SL.slide > 0;
    TL.panel(ctx, 20, FTR.y, 130, FTR.h, { bg: 'rgba(10,20,26,0.92)', corner: prevOn ? ac : '#3a3230' });
    TL.text(ctx, '\u25C4 PREV', 85, FTR.y + 11, 8, prevOn ? ac : '#5a4a44', 'center');
    /* counter + progress ticks */
    TL.text(ctx, pad2(SL.slide + 1) + ' / ' + pad2(n), TL.W / 2, FTR.y + 2, 9, '#e8e0d0', 'center');
    var tickW = 9, total = n * tickW, tx0 = TL.W / 2 - total / 2;
    for (i = 0; i < n; i++) {
      ctx.fillStyle = i <= SL.slide ? ac : 'rgba(90,110,120,0.35)';
      ctx.fillRect(tx0 + i * tickW, FTR.y + 18, tickW - 2, 7);
    }
    var retLabel = last ? (SL.ret === 'archive' ? 'BACK TO ARCHIVE' : 'RETURN TO EXPLORATION') : 'NEXT \u25BA';
    TL.panel(ctx, 690, FTR.y, 250, FTR.h, { bg: last ? 'rgba(20,44,34,0.92)' : 'rgba(10,20,26,0.92)', corner: ac });
    TL.text(ctx, retLabel, 815, FTR.y + 11, 8, ac, 'center');

    /* screen scanlines + gentle static */
    ctx.save();
    ctx.globalAlpha = 0.06;
    ctx.fillStyle = '#04101a';
    for (var sy = 0; sy < TL.H; sy += 3) ctx.fillRect(0, sy, TL.W, 1);
    ctx.restore();
    TL.staticOverlay(ctx, 0.04);
    TL.crt(ctx, SL.t);
    TL.BIG_TEXT = false;
  };

})(window.TL);
