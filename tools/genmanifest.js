/* Generates assets/manifest.json — an exact index of every image you
   have dropped into assets/. Run it after adding files:

       node tools/genmanifest.js

   With a manifest present, the game loads your images directly
   (no 404 probing in the console). Missing files still fall back
   to the built-in pixel art. */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const ASSETS = path.join(ROOT, 'assets');

function walk(dir, out) {
  let entries;
  try { entries = fs.readdirSync(dir, { withFileTypes: true }); }
  catch (e) { return; }
  for (const ent of entries) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(full, out);
    else out.push(full);
  }
}

const files = [];
walk(ASSETS, files);

const man = {};
const IMG = /\.(jpg|jpeg|png|webp)$/i;

for (const f of files) {
  const rel = path.relative(ROOT, f).replace(/\\/g, '/');
  const dir = path.relative(ASSETS, path.dirname(f)).replace(/\\/g, '/');
  const base = path.basename(f, path.extname(f));
  if (dir === 'avatars' && IMG.test(f)) {
    man['av:' + base] = rel;
  } else if (dir === 'cinematic' && /^scene([1-4])$/.test(base) && IMG.test(f)) {
    man['sc:' + (parseInt(base.slice(5), 10) - 1)] = rel;
  } else if (dir.startsWith('archives') && /^frame([1-9])$/.test(base) && IMG.test(f)) {
    const id = dir.split('/')[1];
    if (id) man['sl:' + id + ':' + (parseInt(base.slice(5), 10) - 1)] = rel;
  }
}

fs.writeFileSync(path.join(ASSETS, 'manifest.json'), JSON.stringify(man, null, 2));
console.log('manifest.json written with ' + Object.keys(man).length + ' image(s).');
