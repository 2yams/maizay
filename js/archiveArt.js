/* ============================================================
   THE THINGS WE LEFT BEHIND — archiveArt.js
   Programmatic pixel-art scenes for the Mission Archives.
   Every painter draws into a 16:9 viewport (w x h) with a fixed
   seed, palette and composition. Reuses TL.CHAR_DRAW sprites.
   No external images; a designed archival placeholder is drawn
   if a slide has no painter (hook ready for external art).
   ============================================================ */
'use strict';
(function (TL) {

  var A = {};
  TL.ArchiveArt = A;

  /* ---------- primitives ---------- */
  function P(ctx, x, y, w, h, c) { ctx.fillStyle = c; ctx.fillRect(x, y, w, h); }
  function poly(ctx, pts, c) {
    ctx.fillStyle = c; ctx.beginPath();
    ctx.moveTo(pts[0][0], pts[0][1]);
    for (var i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
    ctx.closePath(); ctx.fill();
  }

  /* ---------- shared scene helpers (viewport-local coords) ---------- */
  A.sky = function (ctx, w, h, a, b) {
    var g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, a); g.addColorStop(1, b);
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
  };

  A.stars = function (ctx, w, h, seed, n, a) {
    var r = TL.RNG(seed); ctx.fillStyle = '#d8e4f0';
    for (var i = 0; i < (n || 70); i++) {
      ctx.globalAlpha = a * (0.2 + 0.8 * r());
      var s = r() > 0.88 ? 3 : 2;
      ctx.fillRect((r() * w) | 0, (r() * h) | 0, s, s);
    }
    ctx.globalAlpha = 1;
  };

  A.glow = function (ctx, x, y, r, c, a) {
    ctx.save();
    ctx.globalAlpha = a;
    var g = ctx.createRadialGradient(x, y, 1, x, y, r);
    g.addColorStop(0, c); g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  };

  A.dust = function (ctx, w, h, t, seed, a) {
    var r = TL.RNG(seed + 77);
    ctx.fillStyle = '#f0c8a0';
    for (var i = 0; i < 16; i++) {
      var x = (r() * w + Math.sin(t * 0.02 + i * 2) * 8) % w;
      var y = (r() * h + Math.cos(t * 0.015 + i) * 6) % h;
      ctx.globalAlpha = a * (0.3 + 0.7 * Math.abs(Math.sin(t * 0.01 + i)));
      ctx.fillRect(x | 0, y | 0, 2, 2);
    }
    ctx.globalAlpha = 1;
  };

  /* layered martian terrain: far ridge, mid ridge, ground */
  A.terrain = function (ctx, w, h, horizon, seed, c1, c2, c3) {
    function ridge(y0, amp, col, sn) {
      var nz = TL.noise1(seed + sn * 7);
      ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(0, h);
      for (var x = 0; x <= w; x += 8) ctx.lineTo(x, y0 - nz(x * 0.02) * amp);
      ctx.lineTo(w, h); ctx.closePath(); ctx.fill();
    }
    ridge(horizon, 34, c1, 1);
    ridge(horizon + 24, 18, c2, 2);
    P(ctx, 0, horizon + 40, w, h - horizon - 40, c3);
    ctx.fillStyle = 'rgba(255,220,180,0.22)';
    ctx.fillRect(0, horizon + 40, w, 2);
  };

  A.rock = function (ctx, x, y, s, base, hi) {
    poly(ctx, [[x - 14 * s, y], [x - 10 * s, y - 9 * s], [x - 3 * s, y - 12 * s], [x + 6 * s, y - 8 * s], [x + 13 * s, y]], base);
    poly(ctx, [[x - 10 * s, y - 9 * s], [x - 3 * s, y - 12 * s], [x + 2 * s, y - 6 * s], [x - 6 * s, y - 4 * s]], hi);
  };

  /* round rocky planet with terminator + polar cap */
  A.planet = function (ctx, x, y, r, o) {
    o = o || {};
    if (o.halo) A.glow(ctx, x, y, r * 1.35, o.halo, 0.25);
    var g = ctx.createRadialGradient(x - r * 0.35, y - r * 0.35, r * 0.1, x, y, r);
    g.addColorStop(0, o.hi || '#f0b080'); g.addColorStop(0.55, o.mid || '#c86a3c'); g.addColorStop(1, o.lo || '#5a2418');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
    var rr = TL.RNG(o.seed || 4);
    ctx.save();
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.clip();
    ctx.fillStyle = o.spot || 'rgba(122,58,36,0.5)';
    for (var i = 0; i < 7; i++) {
      ctx.beginPath();
      ctx.ellipse(x + (rr() - 0.5) * r * 1.4, y + (rr() - 0.5) * r * 1.3, r * (0.08 + rr() * 0.2), r * (0.05 + rr() * 0.11), rr() * 3, 0, Math.PI * 2);
      ctx.fill();
    }
    if (o.cap) {
      ctx.fillStyle = o.cap;
      ctx.beginPath(); ctx.ellipse(x, y - r * 0.82, r * 0.42, r * 0.14, 0, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
    ctx.save();
    ctx.globalAlpha = 0.45; ctx.fillStyle = '#000410';
    ctx.beginPath(); ctx.arc(x + r * 0.55, y + r * 0.25, r, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  };

  /* banded gas giant, optional rings */
  A.gasPlanet = function (ctx, x, y, r, o) {
    o = o || {};
    if (o.rings) {
      ctx.save();
      ctx.strokeStyle = o.ringC || 'rgba(230,214,170,0.75)'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.ellipse(x, y, r * 1.7, r * 0.42, o.ringTilt === undefined ? -0.25 : o.ringTilt, 0, Math.PI * 2); ctx.stroke();
      ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.ellipse(x, y, r * 1.9, r * 0.48, (o.ringTilt === undefined ? -0.25 : o.ringTilt), 0, Math.PI * 2); ctx.stroke();
      ctx.restore();
    }
    var g = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, r * 0.1, x, y, r);
    g.addColorStop(0, o.hi || '#e8c8a0'); g.addColorStop(1, o.lo || '#8a5a34');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
    var rr = TL.RNG(o.seed || 8);
    ctx.save();
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.clip();
    var bands = o.bands || ['#d8b088', '#b88858', '#e0c4a0', '#a87048', '#d0a878', '#986840', '#dcb890'];
    for (var i = 0; i < bands.length; i++) {
      var by = y - r + (i + rr() * 0.4) * (2 * r / bands.length);
      P(ctx, x - r, by, r * 2, (2 * r / bands.length) * (0.5 + rr() * 0.5), bands[i]);
    }
    if (o.spotCol) {
      ctx.fillStyle = o.spotCol;
      ctx.beginPath(); ctx.ellipse(x + r * 0.3, y + r * 0.28, r * 0.18, r * 0.11, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = 'rgba(255,230,200,0.35)';
      ctx.beginPath(); ctx.ellipse(x + r * 0.3, y + r * 0.25, r * 0.12, r * 0.06, 0, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
    ctx.save();
    ctx.globalAlpha = 0.4; ctx.fillStyle = '#000410';
    ctx.beginPath(); ctx.arc(x + r * 0.55, y + r * 0.2, r, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
    if (o.rings && o.ringsFront !== false) {
      ctx.save();
      ctx.strokeStyle = o.ringC || 'rgba(230,214,170,0.75)'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.ellipse(x, y, r * 1.7, r * 0.42, o.ringTilt === undefined ? -0.25 : o.ringTilt, Math.PI * 0.03, Math.PI * 0.97); ctx.stroke();
      ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.ellipse(x, y, r * 1.9, r * 0.48, (o.ringTilt === undefined ? -0.25 : o.ringTilt), Math.PI * 0.03, Math.PI * 0.97); ctx.stroke();
      ctx.restore();
    }
  };

  /* irregular asteroid body with craters */
  A.asteroid = function (ctx, x, y, rx, ry, o) {
    o = o || {};
    var rr = TL.RNG(o.seed || 6);
    var pts = [], n = 11;
    for (var i = 0; i < n; i++) {
      var ang = (i / n) * Math.PI * 2;
      var wob = 0.75 + rr() * 0.45;
      pts.push([x + Math.cos(ang) * rx * wob, y + Math.sin(ang) * ry * wob]);
    }
    poly(ctx, pts, o.base || '#8a7a64');
    poly(ctx, pts.slice(0, 7), o.hi || '#a8987c');
    ctx.fillStyle = o.dk || 'rgba(60,48,38,0.5)';
    for (i = 0; i < (o.craters || 5); i++) {
      ctx.beginPath();
      ctx.ellipse(x + (rr() - 0.5) * rx, y + (rr() - 0.5) * ry, rx * (0.05 + rr() * 0.13), ry * (0.05 + rr() * 0.13), 0, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  /* scanlines + vignette inside a viewport */
  A.scan = function (ctx, w, h) {
    ctx.save();
    ctx.globalAlpha = 0.1;
    ctx.fillStyle = '#04101a';
    for (var y = 0; y < h; y += 3) ctx.fillRect(0, y, w, 1);
    ctx.restore();
    var g = ctx.createRadialGradient(w / 2, h / 2, h * 0.35, w / 2, h / 2, w * 0.62);
    g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(2,8,16,0.4)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
  };

  /* small archival label */
  A.tag = function (ctx, x, y, txt, c) {
    ctx.save();
    ctx.font = TL.font(6);
    var w = ctx.measureText(txt).width;
    ctx.strokeStyle = c || 'rgba(126,240,200,0.4)'; ctx.lineWidth = 1;
    ctx.strokeRect(x - 3, y - 3, w + 10, 13);
    P(ctx, x - 1, y - 1, 2, 2, c || '#7ef0c8');
    TL.text(ctx, txt, x + 4, y, 6, c || '#9fe8d8');
    ctx.restore();
  };

  /* dashed line */
  A.dash = function (ctx, pts, c, seg) {
    ctx.save();
    ctx.strokeStyle = c; ctx.lineWidth = 1; ctx.setLineDash([seg || 4, seg || 4]);
    ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]);
    for (var i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
    ctx.stroke(); ctx.setLineDash([]); ctx.restore();
  };

  /* box-frame annotation (science interface feel) */
  A.frame = function (ctx, x, y, w, h, c, label) {
    ctx.save();
    ctx.strokeStyle = c; ctx.lineWidth = 1; ctx.setLineDash([5, 4]);
    ctx.strokeRect(x, y, w, h); ctx.setLineDash([]);
    P(ctx, x - 1, y - 1, 7, 2, c); P(ctx, x - 1, y - 1, 2, 7, c);
    P(ctx, x + w - 6, y - 1, 7, 2, c); P(ctx, x + w - 1, y - 1, 2, 7, c);
    P(ctx, x - 1, y + h - 1, 7, 2, c); P(ctx, x - 1, y + h - 6, 2, 7, c);
    P(ctx, x + w - 6, y + h - 1, 7, 2, c); P(ctx, x + w - 1, y + h - 6, 2, 7, c);
    if (label) TL.text(ctx, label, x, y - 11, 6, c);
    ctx.restore();
  };

  /* scientific readout graph with optional repeating dips */
  A.graph = function (ctx, x, y, w, h, o) {
    o = o || {};
    P(ctx, x, y, w, h, 'rgba(6,20,30,0.85)');
    ctx.strokeStyle = o.c || '#59c8f0'; ctx.lineWidth = 1;
    ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
    ctx.save();
    ctx.globalAlpha = 0.25;
    for (var gx = 1; gx < 6; gx++) P(ctx, x + gx * w / 6, y, 1, h, o.c || '#59c8f0');
    for (var gy = 1; gy < 4; gy++) P(ctx, x, y + gy * h / 4, w, 1, o.c || '#59c8f0');
    ctx.restore();
    var rr = TL.RNG(o.seed || 3);
    var dips = o.dips || 0;
    ctx.strokeStyle = o.lineC || '#7ef0c8';
    ctx.beginPath();
    var n = 48;
    for (var i = 0; i <= n; i++) {
      var fx = i / n;
      var base = y + h * 0.3 + (rr() - 0.5) * h * 0.08;
      if (dips) {
        var phase = (fx * dips) % 1;
        var depth = phase < 0.14 ? Math.sin(phase / 0.14 * Math.PI) : 0;
        base += depth * h * (o.depth || 0.42);
      }
      if (i === 0) ctx.moveTo(x + fx * w, base); else ctx.lineTo(x + fx * w, base);
    }
    ctx.stroke();
    if (o.label) TL.text(ctx, o.label, x + 5, y + 4, 6, o.c || '#59c8f0');
    if (o.axis) TL.text(ctx, o.axis, x + 5, y + h - 11, 6, 'rgba(160,200,220,0.7)');
  };

  /* gold Pioneer plaque */
  A.plaque = function (ctx, x, y, s) {
    ctx.save();
    ctx.translate(x, y); ctx.scale(s, s);
    P(ctx, -40, -55, 80, 110, '#b8943c');
    P(ctx, -40, -55, 80, 4, '#e0c470');
    P(ctx, -40, 51, 80, 4, '#8a6c28');
    P(ctx, 36, -55, 4, 110, '#8a6c28');
    /* hydrogen symbol top-left */
    ctx.strokeStyle = '#3a2e12'; ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.arc(-28, -40, 6, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-34, -40); ctx.lineTo(-22, -40); ctx.stroke();
    /* radial pulsar map lines */
    ctx.strokeStyle = '#3a2e12'; ctx.lineWidth = 1;
    for (var i = 0; i < 9; i++) {
      var ang = -Math.PI * 0.9 + i * 0.22;
      ctx.beginPath();
      ctx.moveTo(-16, 18);
      ctx.lineTo(-16 + Math.cos(ang) * 34, 18 + Math.sin(ang) * 30);
      ctx.stroke();
      ctx.fillStyle = '#3a2e12';
      ctx.beginPath(); ctx.arc(-16 + Math.cos(ang) * 36, 18 + Math.sin(ang) * 32, 1.4, 0, Math.PI * 2); ctx.fill();
    }
    /* figures */
    ctx.strokeStyle = '#3a2e12'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(6, -14, 4, 0, Math.PI * 2); ctx.stroke();          /* man head */
    ctx.beginPath(); ctx.moveTo(6, -10); ctx.lineTo(6, 8); ctx.stroke();        /* torso */
    ctx.beginPath(); ctx.moveTo(6, -4); ctx.lineTo(0, 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(6, -4); ctx.lineTo(12, 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(6, 8); ctx.lineTo(1, 18); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(6, 8); ctx.lineTo(11, 18); ctx.stroke();
    ctx.beginPath(); ctx.arc(17, -9, 3.4, 0, Math.PI * 2); ctx.stroke();        /* woman head */
    ctx.beginPath(); ctx.moveTo(17, -5); ctx.lineTo(17, 8); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(17, -1); ctx.lineTo(11, 4); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(17, -1); ctx.lineTo(22, 4); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(17, 8); ctx.lineTo(13, 18); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(17, 8); ctx.lineTo(21, 18); ctx.stroke();
    /* scale marker between figures */
    ctx.beginPath(); ctx.moveTo(10, -18); ctx.lineTo(13, -18); ctx.stroke();
    /* spacecraft silhouette bottom-right */
    ctx.strokeStyle = '#3a2e12';
    ctx.beginPath(); ctx.arc(26, 36, 7, Math.PI * 0.15, Math.PI * 1.35); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(26, 43); ctx.lineTo(26, 33); ctx.stroke();
    ctx.restore();
  };

  /* inflated airbag cluster */
  A.airbags = function (ctx, x, y, r, c1, c2) {
    var off = [[-1.4, 0.1, 1], [1.35, 0.05, 0.95], [-0.7, -0.75, 0.8], [0.8, -0.7, 0.85], [0, 0.75, 0.9]];
    for (var i = 0; i < off.length; i++) {
      ctx.fillStyle = c2;
      ctx.beginPath(); ctx.arc(x + off[i][0] * r, y + off[i][1] * r, r * off[i][2], 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = c1;
      ctx.beginPath(); ctx.arc(x + off[i][0] * r - r * 0.2, y + off[i][1] * r - r * 0.2, r * off[i][2] * 0.62, 0, Math.PI * 2); ctx.fill();
    }
  };

  /* ---------- floating spacecraft painters (centered at origin) ---------- */
  A.bus = function (ctx, t) {
    ctx.save();
    ctx.rotate(Math.sin(t * 0.0006) * 0.05);
    P(ctx, -22, -14, 44, 28, '#c8ccd4');
    P(ctx, -22, -14, 44, 5, '#e8ecf0');
    P(ctx, -22, 8, 44, 6, '#8a8e98');
    P(ctx, -58, -8, 30, 16, '#26365c');
    P(ctx, -58, -8, 30, 4, '#3c5484');
    P(ctx, 28, -8, 30, 16, '#26365c');
    P(ctx, 28, -8, 30, 4, '#3c5484');
    P(ctx, -4, -24, 8, 10, '#d8b25a');
    P(ctx, -2, -27, 4, 4, '#f0e0a0');
    ctx.restore();
  };

  A.pioneer = function (ctx, t, o) {
    ctx.save();
    ctx.rotate(Math.sin(t * 0.0005) * 0.04);
    /* dish ring + ribs */
    ctx.strokeStyle = '#d8dce4'; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.arc(0, -12, 20, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = '#8a8e98'; ctx.lineWidth = 1.4;
    for (var i = 0; i < 6; i++) {
      var ang = (i / 6) * Math.PI * 2;
      ctx.beginPath(); ctx.moveTo(Math.cos(ang) * 4, -12 + Math.sin(ang) * 4);
      ctx.lineTo(Math.cos(ang) * 20, -12 + Math.sin(ang) * 20); ctx.stroke();
    }
    /* feed */
    ctx.strokeStyle = '#c8ccd4'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(0, -12); ctx.lineTo(0, -26); ctx.stroke();
    P(ctx, -3, -30, 6, 4, '#e8ecf0');
    /* bus */
    P(ctx, -8, 2, 16, 12, '#b8bcc4');
    P(ctx, -8, 2, 16, 4, '#d8dce4');
    /* RTG boom */
    ctx.strokeStyle = '#8a8e98'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(8, 10); ctx.lineTo(24, 16); ctx.stroke();
    P(ctx, 22, 12, 8, 8, '#4a5240');
    ctx.restore();
  };

  A.dawnCraft = function (ctx, t, o) {
    ctx.save();
    ctx.rotate(Math.sin(t * 0.0005) * 0.04);
    poly(ctx, [[-46, -6], [-6, -10], [-6, 10], [-46, 6]], '#2a4a6a');
    poly(ctx, [[-44, -5], [-10, -8], [-10, 8], [-44, 5]], '#3c6484');
    poly(ctx, [[46, -6], [6, -10], [6, 10], [46, 6]], '#2a4a6a');
    poly(ctx, [[44, -5], [10, -8], [10, 8], [44, 5]], '#3c6484');
    ctx.strokeStyle = '#8a8e98'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(-6, 0); ctx.lineTo(6, 0); ctx.stroke();
    P(ctx, -5, -7, 10, 14, '#b8bcc4');
    P(ctx, -5, -7, 10, 4, '#d8dce4');
    if (o && o.ion) {
      A.glow(ctx, -14, 0, 12, '#7ec8f8', 0.8);
      ctx.fillStyle = 'rgba(126,200,248,0.8)';
      ctx.fillRect(-22, -1.5, 16, 3);
    }
    ctx.restore();
  };

  A.nearCraft = function (ctx, t, o) {
    ctx.save();
    ctx.rotate(Math.sin(t * 0.0006) * 0.05);
    P(ctx, -58, -10, 34, 8, '#2a4a6a'); P(ctx, -58, -10, 34, 3, '#3c6484');
    P(ctx, 24, -10, 34, 8, '#2a4a6a'); P(ctx, 24, -10, 34, 3, '#3c6484');
    P(ctx, -12, -12, 24, 20, '#a8acb4');
    P(ctx, -12, -12, 24, 5, '#c8ccd4');
    P(ctx, -6, -6, 8, 6, '#4a5a66');
    ctx.strokeStyle = '#d8dce4'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(0, 18, 7, Math.PI, 0); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, 8); ctx.lineTo(0, 15); ctx.stroke();
    ctx.restore();
  };

  A.keplerCraft = function (ctx, t, o) {
    ctx.save();
    ctx.rotate(Math.sin(t * 0.0005) * 0.04);
    /* sunshade aperture ring */
    ctx.fillStyle = '#c8a040';
    ctx.beginPath(); ctx.ellipse(16, 0, 6, 13, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#3a3428';
    ctx.beginPath(); ctx.ellipse(16, 0, 3.4, 9.5, 0, 0, Math.PI * 2); ctx.fill();
    /* photometer tube */
    poly(ctx, [[-22, -9], [10, -13], [10, 13], [-22, 9]], '#b0b4bc');
    poly(ctx, [[-20, -8], [8, -11], [8, 11], [-20, 8]], '#8a8e98');
    /* trailing solar array ring */
    P(ctx, -34, -3, 14, 6, '#2a4a6a');
    P(ctx, -34, -3, 14, 2.5, '#3c6484');
    P(ctx, -46, -2, 10, 4, '#2a4a6a');
    ctx.restore();
  };

  /* draw a TL.CHAR_DRAW sprite (ground origin) at fraction coords */
  A.sprite = function (ctx, id, x, y, s, t, o, flip) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(s, s);
    if (flip) ctx.scale(-1, 1);
    var fn = TL.CHAR_DRAW[id];
    if (fn) fn(ctx, t, o || {});
    ctx.restore();
  };

  /* ---------- scene builders ---------- */
  /* surface scene: o = {sky, sun, sunC, stars, hz, seed, far, mid, ground, rock, rockHi, rocks, ents, extra, tags, dustA} */
  A.surfaceScene = function (o) {
    return function (ctx, w, h, t) {
      A.sky(ctx, w, h, o.sky[0], o.sky[1]);
      if (o.stars) A.stars(ctx, w, h * 0.55, o.seed, 26, 0.45);
      var sunX = (o.sun ? o.sun[0] : 0.84) * w, sunY = (o.sun ? o.sun[1] : 0.15) * h;
      A.glow(ctx, sunX, sunY, w * 0.15, o.sunC || '#ffd9a0', 0.3);
      ctx.fillStyle = o.sunC || '#ffd9a0';
      ctx.beginPath(); ctx.arc(sunX, sunY, o.sunR || 9, 0, Math.PI * 2); ctx.fill();
      var hz = (o.hz || 0.55) * h;
      A.terrain(ctx, w, h, hz, o.seed, o.far, o.mid, o.ground);
      var rr = TL.RNG(o.seed + 5);
      for (var i = 0; i < (o.rocks === undefined ? 5 : o.rocks); i++) {
        A.rock(ctx, rr() * w, hz + 42 + rr() * (h - hz - 56), 0.5 + rr() * 1.3, o.rock, o.rockHi);
      }
      var ents = o.ents || [];
      for (i = 0; i < ents.length; i++) {
        var e = ents[i];
        ctx.save();
        ctx.translate(e.x * w, e.y * h);
        if (e.rot) ctx.rotate(e.rot);
        ctx.scale(e.s || 2, e.s || 2);
        if (e.flip) ctx.scale(-1, 1);
        var fn = TL.CHAR_DRAW[e.id];
        if (fn) fn(ctx, t, e.o || {});
        ctx.restore();
      }
      if (o.extra) o.extra(ctx, w, h, t, o);
      if (o.tags) for (i = 0; i < o.tags.length; i++) A.tag(ctx, o.tags[i][0] * w, o.tags[i][1] * h, o.tags[i][2], o.tags[i][3]);
      A.dust(ctx, w, h, t, o.seed, o.dustA === undefined ? 0.1 : o.dustA);
      A.scan(ctx, w, h);
    };
  };

  /* deep space scene: o = {skyA, skyB, seed, nStars, body(renamed draw), ents, extra, tags} */
  A.spaceScene = function (o) {
    return function (ctx, w, h, t) {
      A.sky(ctx, w, h, o.skyA || '#04060e', o.skyB || '#0a1220');
      A.stars(ctx, w, h, o.seed, o.nStars || 90, 0.8);
      if (o.deco) o.deco(ctx, w, h, t, o);
      var ents = o.ents || [];
      for (var i = 0; i < ents.length; i++) {
        var e = ents[i];
        ctx.save();
        ctx.translate(e.x * w, e.y * h);
        if (e.rot) ctx.rotate(e.rot);
        ctx.scale(e.s || 1, e.s || 1);
        if (e.flip) ctx.scale(-1, 1);
        (e.craft || A.bus)(ctx, t, e.o || {});
        ctx.restore();
      }
      if (o.extra) o.extra(ctx, w, h, t, o);
      if (o.tags) for (i = 0; i < o.tags.length; i++) A.tag(ctx, o.tags[i][0] * w, o.tags[i][1] * h, o.tags[i][2], o.tags[i][3]);
      A.scan(ctx, w, h);
    };
  };

  /* ==== SLIDE PAINTERS (inserted below) ==== */

  /* designed archival placeholder for slides without a painter */
  A.placeholder = function (ctx, w, h, id, n) {
    A.sky(ctx, w, h, '#0a1826', '#061018');
    ctx.save();
    ctx.globalAlpha = 0.15; ctx.strokeStyle = '#59c8f0'; ctx.lineWidth = 1;
    for (var x = 0; x < w; x += 30) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
    for (var y = 0; y < h; y += 30) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }
    ctx.restore();
    TL.text(ctx, 'SIGNAL RECONSTRUCTION PENDING', w / 2, h / 2 - 22, 9, '#59c8f0', 'center');
    TL.text(ctx, id.toUpperCase() + ' · FRAME ' + (n + 1), w / 2, h / 2 + 4, 7, '#4a8aa8', 'center');
    A.frame(ctx, w * 0.3, h * 0.3, w * 0.4, h * 0.4, 'rgba(89,200,240,0.5)');
    A.scan(ctx, w, h);
  };

  var PT = {};  /* painter table, keyed 'archive:n' */

  A.paint = function (id, n, ctx, w, h, t) {
    var fn = PT[id + ':' + n];
    if (fn) { fn(ctx, w, h, t); return; }
    A.placeholder(ctx, w, h, id, n);
  };

  /* ==== SLIDES ==== */

  /* ---------- palettes & builders ---------- */
  var PAL = {
    ares:      { sky: ['#c86a3c', '#8a3f28'], far: '#6d2f22', mid: '#93472f', ground: '#b56536', rock: '#8a4a30', rockHi: '#c07a4a' },
    gusev:     { sky: ['#d47a44', '#8c4227'], far: '#5d2b20', mid: '#8a432c', ground: '#a85830', rock: '#7d442c', rockHi: '#b87a48' },
    meridiani: { sky: ['#d08148', '#9a5230'], far: '#6e3a26', mid: '#964f2e', ground: '#a8623a', rock: '#7d442c', rockHi: '#bb7648' },
    chryse:    { sky: ['#c07a50', '#7d442c'], far: '#5e3424', mid: '#8a4e30', ground: '#9a5a34', rock: '#7a4630', rockHi: '#b08050' },
    utopia:    { sky: ['#c08a68', '#6e4a38'], far: '#54383a', mid: '#7c5848', ground: '#a06848', rock: '#6e5044', rockHi: '#a88a74' },
    boreal:    { sky: ['#c09878', '#6a5240'], far: '#54403a', mid: '#7c6250', ground: '#a87a5a', rock: '#6e5648', rockHi: '#c8a888' },
    elysium:   { sky: ['#c88a58', '#7d4e38'], far: '#5e3a2c', mid: '#8a5a3c', ground: '#9a6238', rock: '#7a503a', rockHi: '#ae7a52' },
    jezero:    { sky: ['#d4814a', '#8c472c'], far: '#663224', mid: '#94492e', ground: '#b26238', rock: '#84482e', rockHi: '#bb7648' },
    gale:      { sky: ['#c97e4e', '#86462e'], far: '#643428', mid: '#904c30', ground: '#a85e36', rock: '#7e4a30', rockHi: '#b2724a' },
    night:     { sky: ['#5a2c22', '#2e1410'], far: '#2a1410', mid: '#40201a', ground: '#6e3a26', rock: '#4a2418', rockHi: '#8a4e34' },
    relay:     { sky: ['#6a4a58', '#2e2438'], far: '#3a2c44', mid: '#5a4054', ground: '#7c5a5c', rock: '#5c4650', rockHi: '#8a6a74' }
  };
  function SS(pal, o) { var m = {}; for (var k in PAL[pal]) m[k] = PAL[pal][k]; for (var k2 in o) m[k2] = o[k2]; return A.surfaceScene(m); }

  /* parachute + capsule in the sky */
  function chute(fx, fy, s) {
    return function (ctx, w, h, t) {
      var sx = fx * w + Math.sin(t * 0.001) * 7, sy = fy * h;
      ctx.save(); ctx.translate(sx, sy); ctx.scale(s, s);
      ctx.fillStyle = '#e8e4d8';
      ctx.beginPath(); ctx.arc(0, -30, 22, Math.PI, 0); ctx.closePath(); ctx.fill();
      P(ctx, -22, -33, 9, 4, '#c8402a'); P(ctx, -4, -33, 9, 4, '#c8402a'); P(ctx, 13, -33, 9, 4, '#c8402a');
      ctx.strokeStyle = '#d8dce4'; ctx.lineWidth = 1;
      for (var i = 0; i < 4; i++) { ctx.beginPath(); ctx.moveTo(-18 + i * 12, -30); ctx.lineTo(-8 + i * 5, 4); ctx.stroke(); }
      P(ctx, -9, 4, 18, 14, '#8a6a50');
      P(ctx, -9, 4, 18, 4, '#a88468');
      ctx.restore();
    };
  }

  /* ---------- 01 · PATHFINDER / SOJOURNER ---------- */
  PT['pathfinder:0'] = A.spaceScene({
    seed: 11,
    deco: function (ctx, w, h, t) {
      A.planet(ctx, w * 0.76, h * 0.52, h * 0.4, { hi: '#f0b080', mid: '#c86a3c', lo: '#5a2418', cap: '#f0e8e0', halo: '#ffb070', seed: 4 });
      A.dash(ctx, [[w * 0.3, h * 0.42], [w * 0.55, h * 0.46], [w * 0.66, h * 0.5]], 'rgba(126,240,200,0.4)');
    },
    ents: [{ x: 0.24, y: 0.42, s: 1.15, craft: A.bus }],
    tags: [[0.04, 0.06, 'LAUNCH · DEC 4 1996'], [0.04, 0.13, 'DESTINATION · MARS']]
  });
  PT['pathfinder:1'] = SS('ares', {
    seed: 21, hz: 0.42, sun: [0.16, 0.2], sunC: '#ffdfae', sunR: 11, rocks: 3,
    ents: [{ id: 'pathfinder', x: 0.5, y: 0.82, s: 3 }],
    extra: function (ctx, w, h) {
      A.airbags(ctx, w * 0.5, h * 0.93, h * 0.12, '#d8dcd4', '#b0b4ac');
    },
    tags: [[0.04, 0.06, 'ARES VALLIS · JUL 4 1997'], [0.04, 0.13, 'TOUCHDOWN · FIFTEEN BOUNCES']]
  });
  PT['pathfinder:2'] = SS('ares', {
    seed: 22, hz: 0.5, rocks: 4,
    ents: [{ id: 'pathfinder', x: 0.3, y: 0.72, s: 2.6 }, { id: 'sojourner', x: 0.52, y: 0.94, s: 2.2 }],
    extra: function (ctx, w, h) {
      A.dash(ctx, [[w * 0.34, h * 0.72], [w * 0.45, h * 0.88], [w * 0.52, h * 0.92]], 'rgba(126,240,200,0.5)');
      TL.text(ctx, 'RAMP DEPLOYED', w * 0.37, h * 0.78, 6, '#7ef0c8');
    },
    tags: [[0.04, 0.06, 'SOJOURNER EXITS THE LANDER'], [0.04, 0.13, 'FIRST ROVER TRACKS ON MARS']]
  });
  PT['pathfinder:3'] = SS('ares', {
    seed: 23, hz: 0.46, rocks: 3,
    ents: [{ id: 'sojourner', x: 0.32, y: 0.9, s: 3.2, flip: true }],
    extra: function (ctx, w, h) {
      A.rock(ctx, w * 0.66, h * 0.9, 3.2, '#8a4a30', '#c07a4a');
      A.frame(ctx, w * 0.58, h * 0.5, w * 0.22, h * 0.34, 'rgba(126,240,200,0.7)', 'APXS SCAN');
      A.graph(ctx, w * 0.62, h * 0.58, w * 0.14, h * 0.13, { c: '#7ef0c8', seed: 5, label: 'SPECTRUM' });
    },
    tags: [[0.04, 0.06, 'ROCK & SOIL ANALYSIS'], [0.04, 0.13, 'BARNACLE BILL · YOGI · GERALD']]
  });
  PT['pathfinder:4'] = SS('ares', {
    seed: 24, hz: 0.6, rocks: 7,
    ents: [{ id: 'sojourner', x: 0.26, y: 0.96, s: 3.4, flip: true }, { id: 'pathfinder', x: 0.8, y: 0.63, s: 1.2 }],
    tags: [[0.04, 0.06, '83 SOLS · ~100 METRES ROVED'], [0.04, 0.13, 'A NEW WAY TO EXPLORE MARS']]
  });

  /* ---------- 02 · SPIRIT ---------- */
  PT['spirit:0'] = SS('gusev', {
    seed: 31, hz: 0.5, sun: [0.2, 0.16], rocks: 5,
    ents: [{ id: 'spirit', x: 0.46, y: 0.88, s: 2.6, flip: true }],
    extra: function (ctx, w, h) {
      ctx.fillStyle = '#6e3a20';
      ctx.beginPath(); ctx.moveTo(0, h); ctx.lineTo(0, h * 0.92);
      ctx.quadraticCurveTo(w * 0.25, h * 0.8, w * 0.52, h * 0.94);
      ctx.lineTo(w * 0.52, h); ctx.closePath(); ctx.fill();
    },
    tags: [[0.04, 0.06, 'GUSEV CRATER · JAN 4 2004'], [0.04, 0.13, 'THE TERRAIN LOOKED EASIER FROM ORBIT']]
  });
  PT['spirit:1'] = SS('gusev', {
    seed: 32, hz: 0.48, rocks: 6,
    ents: [{ id: 'spirit', x: 0.4, y: 0.9, s: 2.8 }],
    extra: function (ctx, w, h) {
      A.frame(ctx, w * 0.52, h * 0.54, w * 0.18, h * 0.28, 'rgba(126,240,200,0.6)', 'INSTRUMENT DEPLOYMENT');
    },
    tags: [[0.04, 0.06, 'ROCKS ARE EXCELLENT STORYTELLERS']]
  });
  PT['spirit:2'] = SS('gusev', {
    seed: 33, hz: 0.64, rocks: 2,
    ents: [{ id: 'spirit', x: 0.14, y: 0.94, s: 2 }],
    extra: function (ctx, w, h) {
      A.rock(ctx, w * 0.64, h * 0.92, 5, '#7d442c', '#b87a48');
      A.frame(ctx, w * 0.44, h * 0.28, w * 0.36, h * 0.54, 'rgba(89,200,240,0.7)', 'GEOLOGICAL SAMPLE');
      A.tag(ctx, w * 0.47, h * 0.36, 'SILICA TRACES');
      A.tag(ctx, w * 0.47, h * 0.48, 'CARBONATES');
      A.tag(ctx, w * 0.47, h * 0.6, 'SHAPED BY HOT WATER');
    },
    tags: [[0.04, 0.06, 'EVIDENCE OF ANCIENT WATER']]
  });
  PT['spirit:3'] = SS('gusev', {
    seed: 34, hz: 0.5, sun: [0.8, 0.2], rocks: 3,
    ents: [{ id: 'spirit', x: 0.5, y: 0.9, s: 2.8, rot: 0.12 }],
    extra: function (ctx, w, h) {
      ctx.fillStyle = 'rgba(240,200,160,0.35)';
      for (var i = 0; i < 6; i++) {
        ctx.beginPath();
        ctx.ellipse(w * (0.3 + i * 0.07), h * (0.9 + (i % 2) * 0.02), 26, 6, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      A.tag(ctx, w * 0.28, h * 0.66, 'EMBEDDED AT "TROY"', '#f0a050');
    },
    tags: [[0.04, 0.06, 'SOFT SOIL · WHEELS SUNK'], [0.04, 0.13, 'SCIENCE CONTINUED FROM ONE SPOT']]
  });
  PT['spirit:4'] = SS('night', {
    seed: 35, hz: 0.52, stars: true, sun: [0.24, 0.12], sunC: '#f0c090', sunR: 6, rocks: 4,
    ents: [{ id: 'spirit', x: 0.5, y: 0.9, s: 2.6 }],
    extra: function (ctx, w, h) {
      A.tag(ctx, w * 0.68, h * 0.28, 'SILICA · HOT SPRINGS');
      A.tag(ctx, w * 0.68, h * 0.36, 'CARBONATES');
      A.tag(ctx, w * 0.68, h * 0.44, 'HUSBAND HILL');
      A.tag(ctx, w * 0.68, h * 0.52, '2210 SOLS OF WORK');
    },
    tags: [[0.04, 0.06, 'LAST SIGNAL · MAR 22 2010']]
  });

  /* ---------- 03 · OPPORTUNITY ---------- */
  PT['opportunity:0'] = SS('meridiani', {
    seed: 41, hz: 0.72, rocks: 3,
    extra: chute(0.5, 0.28, 1.6),
    tags: [[0.04, 0.06, 'MERIDIANI PLANUM · JAN 25 2004'], [0.04, 0.13, 'JOINING ITS TWIN, SPIRIT']]
  });
  PT['opportunity:1'] = SS('meridiani', {
    seed: 42, hz: 0.55, rocks: 8,
    ents: [{ id: 'opportunity', x: 0.44, y: 0.92, s: 2.8, flip: true }],
    extra: function (ctx, w, h) {
      ctx.fillStyle = '#4a6a8a';
      for (var i = 0; i < 40; i++) ctx.fillRect(w * (0.08 + (i * 0.61 % 0.84)), h * (0.66 + (i * 0.37 % 0.24)), 3, 3);
    },
    tags: [[0.04, 0.06, 'HEMATITE "BLUEBERRIES" EVERYWHERE']]
  });
  PT['opportunity:2'] = SS('meridiani', {
    seed: 43, hz: 0.64, rocks: 2,
    ents: [{ id: 'opportunity', x: 0.12, y: 0.94, s: 2 }],
    extra: function (ctx, w, h) {
      A.rock(ctx, w * 0.66, h * 0.9, 5, '#7d442c', '#bb7648');
      A.frame(ctx, w * 0.46, h * 0.24, w * 0.34, h * 0.56, 'rgba(89,200,240,0.7)', 'ROCK FORMATION');
      A.tag(ctx, w * 0.49, h * 0.34, 'SULPHATE SALTS');
      A.tag(ctx, w * 0.49, h * 0.46, 'HEMATITE');
      A.tag(ctx, w * 0.49, h * 0.58, 'LONG-LIVED SALTY WATER');
    },
    tags: [[0.04, 0.06, 'CLUES FROM ANCIENT WATER']]
  });
  PT['opportunity:3'] = SS('meridiani', {
    seed: 44, hz: 0.6, rocks: 4,
    ents: [{ id: 'opportunity', x: 0.5, y: 0.92, s: 2.4, flip: true }],
    extra: function (ctx, w, h) {
      var cols = [['rgba(255,220,160,0.25)', 'SOL 1'], ['rgba(200,120,80,0.28)', 'SOL 1000'], ['rgba(120,70,50,0.3)', 'SOL 5000']];
      for (var i = 0; i < 3; i++) {
        ctx.fillStyle = cols[i][0];
        ctx.fillRect(w * (i / 3), 0, w / 3, h * 0.6);
        TL.text(ctx, cols[i][1], w * (i / 3) + 8, h * 0.06, 6, 'rgba(255,240,220,0.8)');
      }
    },
    tags: [[0.04, 0.06, 'DESIGNED FOR 90 SOLS · DROVE 45 KM OVER ~15 YEARS']]
  });
  PT['opportunity:4'] = SS('meridiani', {
    seed: 45, hz: 0.6, rocks: 4, dustA: 0.35,
    sky: ['#a05a30', '#c07a4a'], sun: [0.5, 0.2], sunC: '#e0a878', sunR: 7,
    ents: [{ id: 'opportunity', x: 0.5, y: 0.92, s: 2.4 }],
    tags: [[0.04, 0.06, 'JUNE 2018 — THE SKY WENT DARK'], [0.04, 0.13, 'A STORM IT COULD NOT OUTDRIVE']]
  });

  /* ---------- 04 · VIKING 1 ---------- */
  PT['viking1:0'] = SS('chryse', {
    seed: 51, hz: 0.7, rocks: 3,
    extra: chute(0.5, 0.3, 1.7),
    tags: [[0.04, 0.06, 'CHRYSE PLANITIA · JUL 20 1976'], [0.04, 0.13, 'FIRST SUCCESSFUL US MARS LANDING']]
  });
  PT['viking1:1'] = SS('chryse', {
    seed: 52, hz: 0.44, rocks: 5, sun: [0.3, 0.14],
    extra: function (ctx, w, h) {
      /* lander-camera POV: frame + soil foreground */
      A.frame(ctx, w * 0.06, h * 0.08, w * 0.88, h * 0.78, 'rgba(126,240,200,0.55)');
      TL.text(ctx, 'LANDER CAMERA 1', w * 0.38, h * 0.03, 6, '#7ef0c8');
      ctx.fillStyle = 'rgba(60,32,20,0.4)';
      for (var i = 0; i < 26; i++) {
        ctx.beginPath();
        ctx.ellipse(w * (0.04 + (i * 0.37 % 0.92)), h * (0.82 + (i * 0.23 % 0.15)), 8 + (i % 4) * 4, 3 + (i % 3), 0, 0, Math.PI * 2);
        ctx.fill();
      }
    },
    tags: [[0.04, 0.85, 'FIRST CLOSE-UP VIEW FROM THE GROUND']]
  });
  PT['viking1:2'] = SS('chryse', {
    seed: 53, hz: 0.5, rocks: 3,
    ents: [{ id: 'viking1', x: 0.44, y: 0.9, s: 3 }],
    extra: function (ctx, w, h) {
      /* sampler arm reach + trenched soil */
      ctx.fillStyle = 'rgba(50,28,18,0.5)';
      ctx.beginPath(); ctx.ellipse(w * 0.62, h * 0.9, 34, 8, 0, 0, Math.PI * 2); ctx.fill();
      A.frame(ctx, w * 0.56, h * 0.66, w * 0.14, h * 0.2, 'rgba(126,240,200,0.7)', 'SAMPLER HEAD');
    },
    tags: [[0.04, 0.06, 'SOIL COLLECTED FOR THE BIOLOGY LABS']]
  });
  PT['viking1:3'] = SS('chryse', {
    seed: 54, hz: 0.56, rocks: 4, sun: [0.24, 0.18],
    ents: [{ id: 'viking1', x: 0.3, y: 0.9, s: 2.4 }],
    extra: function (ctx, w, h) {
      var labs = [['GCMS', 0.56], ['LR', 0.68], ['PR', 0.8]];
      for (var i = 0; i < labs.length; i++) {
        A.graph(ctx, w * labs[i][1], h * 0.2, w * 0.11, h * 0.14, { c: '#59c8f0', seed: i + 2, label: labs[i][0] });
      }
      TL.text(ctx, 'BIOLOGY EXPERIMENT READOUTS', w * 0.54, h * 0.12, 6, '#59c8f0');
    },
    tags: [[0.04, 0.06, 'REACTIVE SOIL · NO CONCLUSIVE LIFE DETECTION'], [0.04, 0.13, 'SIX YEARS OF EXPERIMENTS']]
  });

  /* ---------- 05 · VIKING 2 ---------- */
  PT['viking2:0'] = SS('utopia', {
    seed: 61, hz: 0.52, rocks: 4,
    ents: [{ id: 'viking2', x: 0.45, y: 0.9, s: 3 }],
    extra: function (ctx, w, h) {
      ctx.fillStyle = 'rgba(240,248,255,0.25)';
      for (var i = 0; i < 10; i++) {
        ctx.beginPath();
        ctx.ellipse(w * (0.1 + (i * 0.41 % 0.8)), h * (0.72 + (i * 0.29 % 0.2)), 22, 5, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    },
    tags: [[0.04, 0.06, 'UTOPIA PLANITIA · SEP 3 1976'], [0.04, 0.13, 'A DIFFERENT LANDING SITE']]
  });
  PT['viking2:1'] = SS('utopia', {
    seed: 62, hz: 0.5, rocks: 4, sun: [0.26, 0.14],
    ents: [{ id: 'viking2', x: 0.4, y: 0.9, s: 3 }],
    extra: function (ctx, w, h) {
      /* meteorology boom */
      ctx.strokeStyle = '#c8ccc4'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(w * 0.52, h * 0.88); ctx.lineTo(w * 0.52, h * 0.5); ctx.lineTo(w * 0.6, h * 0.46); ctx.stroke();
      P(ctx, w * 0.585, h * 0.44, 6, 6, '#e8ece4'); P(ctx, w * 0.555, h * 0.48, 6, 6, '#e8ece4');
      A.frame(ctx, w * 0.5, h * 0.4, w * 0.16, h * 0.5, 'rgba(126,240,200,0.45)', 'METEOROLOGY BOOM');
    },
    tags: [[0.04, 0.06, 'SURFACE & ATMOSPHERE OBSERVATIONS']]
  });
  PT['viking2:2'] = SS('utopia', {
    seed: 63, hz: 0.54, rocks: 4,
    ents: [{ id: 'viking2', x: 0.48, y: 0.9, s: 2.6 }],
    extra: function (ctx, w, h) {
      /* two moods: warm sols vs winter frost */
      ctx.fillStyle = 'rgba(200,120,70,0.16)';
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(w * 0.5, 0); ctx.lineTo(w * 0.38, h); ctx.lineTo(0, h); ctx.closePath(); ctx.fill();
      ctx.fillStyle = 'rgba(210,235,250,0.3)';
      ctx.beginPath(); ctx.moveTo(w, 0); ctx.lineTo(w * 0.52, 0); ctx.lineTo(w * 0.64, h); ctx.lineTo(w, h); ctx.closePath(); ctx.fill();
      ctx.fillStyle = 'rgba(240,248,255,0.3)';
      for (var i = 0; i < 8; i++) {
        ctx.beginPath();
        ctx.ellipse(w * (0.68 + (i * 0.23 % 0.28)), h * (0.7 + (i * 0.31 % 0.22)), 20, 5, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      TL.text(ctx, 'WARM SOLS', w * 0.08, h * 0.1, 6, '#f0d0a0');
      TL.text(ctx, 'WINTER FROST', w * 0.72, h * 0.1, 6, '#c8e8f8');
    },
    tags: [[0.04, 0.06, 'EVEN A QUIET LANDSCAPE CHANGES WITH TIME']]
  });
  PT['viking2:3'] = A.spaceScene({
    seed: 64,
    deco: function (ctx, w, h) {
      A.planet(ctx, w * 0.5, h * 0.5, h * 0.38, { hi: '#e8a070', mid: '#c06038', lo: '#6a2a1a', cap: '#f0f4f8', seed: 9 });
      /* two landing sites */
      ctx.fillStyle = '#7ef0c8';
      ctx.beginPath(); ctx.arc(w * 0.44, h * 0.62, 3, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(w * 0.56, h * 0.34, 3, 0, Math.PI * 2); ctx.fill();
      A.dash(ctx, [[w * 0.44, h * 0.62], [w * 0.56, h * 0.34]], 'rgba(126,240,200,0.5)');
      TL.text(ctx, 'VIKING 1 · CHRYSE', w * 0.2, h * 0.74, 7, '#7ef0c8');
      TL.text(ctx, 'VIKING 2 · UTOPIA', w * 0.56, h * 0.2, 7, '#7ef0c8');
    },
    tags: [[0.04, 0.06, 'TWO SITES · ONE BROADER PICTURE']]
  });

  /* ---------- 06 · DAWN ---------- */
  PT['dawn:0'] = A.spaceScene({
    seed: 71,
    deco: function (ctx, w, h) {
      A.planet(ctx, w * 0.12, h * 0.4, h * 0.14, { hi: '#7ec8f8', mid: '#2a72c8', lo: '#0a2a5a', spot: 'rgba(60,160,90,0.6)', seed: 3 });
      /* belt far ahead */
      var rr = TL.RNG(70);
      ctx.fillStyle = '#9a8a74';
      for (var i = 0; i < 14; i++) ctx.fillRect(w * (0.72 + rr() * 0.24), h * (0.08 + rr() * 0.84), 3 + rr() * 3, 2 + rr() * 2);
      A.dash(ctx, [[w * 0.2, h * 0.42], [w * 0.55, h * 0.5], [w * 0.72, h * 0.5]], 'rgba(126,240,200,0.35)');
    },
    ents: [{ x: 0.4, y: 0.46, s: 1.2, craft: A.dawnCraft }],
    tags: [[0.04, 0.06, 'LAUNCHED · SEP 27 2007'], [0.04, 0.13, 'DESTINATION · THE ASTEROID BELT']]
  });
  PT['dawn:1'] = A.spaceScene({
    seed: 72,
    deco: function (ctx, w, h) {
      A.asteroid(ctx, w * 0.66, h * 0.48, h * 0.34, h * 0.27, { seed: 6, base: '#9a8868', hi: '#b8a480', dk: 'rgba(70,58,44,0.55)', craters: 7 });
      ctx.save();
      ctx.strokeStyle = 'rgba(126,240,200,0.5)'; ctx.lineWidth = 1; ctx.setLineDash([4, 4]);
      ctx.beginPath(); ctx.ellipse(w * 0.6, h * 0.48, w * 0.3, h * 0.32, -0.3, 0, Math.PI * 2); ctx.stroke();
      ctx.setLineDash([]); ctx.restore();
    },
    ents: [{ x: 0.32, y: 0.26, s: 0.75, craft: A.dawnCraft }],
    tags: [[0.04, 0.06, 'VESTA · ORBIT 2011-2012'], [0.04, 0.13, 'A WORLD FULL OF GEOLOGICAL HISTORY']]
  });
  PT['dawn:2'] = A.spaceScene({
    seed: 73,
    deco: function (ctx, w, h) {
      var rr = TL.RNG(74);
      ctx.fillStyle = '#9a8a74';
      for (var i = 0; i < 16; i++) A.rock(ctx, w * (0.06 + rr() * 0.88), h * (0.06 + rr() * 0.88), 0.3 + rr() * 0.5, '#7a6c58', '#a89a80');
    },
    ents: [{ x: 0.45, y: 0.42, s: 1.35, craft: A.dawnCraft, o: { ion: true } }],
    extra: function (ctx, w, h) {
      /* propulsion display */
      A.frame(ctx, w * 0.66, h * 0.6, w * 0.26, h * 0.3, 'rgba(89,200,240,0.7)', 'ION PROPULSION');
      P(ctx, w * 0.7, h * 0.68, w * 0.03, h * 0.08, '#3c6484');
      ctx.fillStyle = 'rgba(126,200,248,0.85)';
      for (var i = 0; i < 4; i++) {
        ctx.beginPath();
        ctx.moveTo(w * 0.7 - i * 10, h * 0.72);
        ctx.lineTo(w * 0.7 - i * 10 - 8, h * 0.72);
        ctx.lineTo(w * 0.7 - i * 10 - 4, h * 0.72 - 4);
        ctx.closePath(); ctx.fill();
        ctx.beginPath();
        ctx.moveTo(w * 0.7 - i * 10, h * 0.72);
        ctx.lineTo(w * 0.7 - i * 10 - 8, h * 0.72);
        ctx.lineTo(w * 0.7 - i * 10 - 4, h * 0.72 + 4);
        ctx.closePath(); ctx.fill();
      }
      TL.text(ctx, 'XENON IONS · GENTLE CONSTANT THRUST', w * 0.67, h * 0.78, 6, '#8ad8f8');
    },
    tags: [[0.04, 0.06, 'THE LONG JOURNEY TO CERES']]
  });
  PT['dawn:3'] = A.spaceScene({
    seed: 75,
    deco: function (ctx, w, h) {
      A.planet(ctx, w * 0.6, h * 0.48, h * 0.32, { hi: '#c8bcac', mid: '#9a8e7e', lo: '#54483c', spot: 'rgba(60,52,44,0.4)', seed: 12 });
      /* bright spots in Occator crater */
      A.glow(ctx, w * 0.56, h * 0.4, 9, '#ffffff', 0.9);
      ctx.fillStyle = '#ffffff';
      ctx.beginPath(); ctx.arc(w * 0.56, h * 0.4, 2.2, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(w * 0.585, h * 0.43, 1.4, 0, Math.PI * 2); ctx.fill();
    },
    ents: [{ x: 0.2, y: 0.6, s: 0.6, craft: A.dawnCraft }],
    tags: [[0.04, 0.06, 'CERES · 2015'], [0.04, 0.13, 'FIRST ORBIT OF A DWARF PLANET']]
  });
  PT['dawn:4'] = A.spaceScene({
    seed: 76,
    deco: function (ctx, w, h) {
      A.asteroid(ctx, w * 0.18, h * 0.34, h * 0.12, h * 0.09, { seed: 6, base: '#9a8868', hi: '#b8a480', craters: 4 });
      A.planet(ctx, w * 0.85, h * 0.62, h * 0.2, { hi: '#c8bcac', mid: '#9a8e7e', lo: '#54483c', seed: 12 });
      A.dash(ctx, [[w * 0.28, h * 0.36], [w * 0.5, h * 0.52], [w * 0.78, h * 0.6]], 'rgba(126,240,200,0.5)');
      TL.text(ctx, 'VESTA', w * 0.12, h * 0.2, 7, '#c8b890');
      TL.text(ctx, 'CERES', w * 0.82, h * 0.32, 7, '#c8b890');
    },
    ents: [{ x: 0.46, y: 0.56, s: 0.7, craft: A.dawnCraft, o: { ion: true } }],
    tags: [[0.04, 0.06, 'FIRST MISSION TO ORBIT TWO WORLDS BEYOND EARTH']]
  });

  /* ---------- 07 · NEAR SHOEMAKER ---------- */
  PT['near:0'] = A.spaceScene({
    seed: 81,
    deco: function (ctx, w, h) {
      A.planet(ctx, w * 0.1, h * 0.3, h * 0.12, { hi: '#7ec8f8', mid: '#2a72c8', lo: '#0a2a5a', spot: 'rgba(60,160,90,0.6)', seed: 3 });
      A.asteroid(ctx, w * 0.78, h * 0.5, h * 0.3, h * 0.14, { seed: 8, base: '#8a7a64', hi: '#a8987c', craters: 6 });
      A.dash(ctx, [[w * 0.3, h * 0.44], [w * 0.52, h * 0.48], [w * 0.66, h * 0.5]], 'rgba(126,240,200,0.4)');
    },
    ents: [{ x: 0.3, y: 0.44, s: 1, craft: A.nearCraft }],
    tags: [[0.04, 0.06, 'LAUNCHED · FEB 17 1996'], [0.04, 0.13, 'TARGET · ASTEROID 433 EROS']]
  });
  PT['near:1'] = A.spaceScene({
    seed: 82,
    deco: function (ctx, w, h) {
      A.asteroid(ctx, w * 0.52, h * 0.5, h * 0.38, h * 0.16, { seed: 8, base: '#8a7a64', hi: '#a8987c', craters: 8 });
      ctx.save();
      ctx.strokeStyle = 'rgba(126,240,200,0.5)'; ctx.lineWidth = 1; ctx.setLineDash([4, 4]);
      ctx.beginPath(); ctx.ellipse(w * 0.5, h * 0.52, w * 0.36, h * 0.3, 0.15, 0, Math.PI * 2); ctx.stroke();
      ctx.setLineDash([]); ctx.restore();
    },
    ents: [{ x: 0.2, y: 0.34, s: 0.7, craft: A.nearCraft }],
    tags: [[0.04, 0.06, '2000 — FIRST SPACECRAFT TO ORBIT AN ASTEROID'], [0.04, 0.13, 'QUITE A PECULIAR PLACE']]
  });
  PT['near:2'] = A.spaceScene({
    seed: 83,
    deco: function (ctx, w, h) {
      /* Eros surface fills the bottom: cratered ridge */
      var rr = TL.RNG(84);
      ctx.fillStyle = '#8a7a64';
      ctx.beginPath(); ctx.moveTo(0, h);
      for (var x = 0; x <= w; x += 12) ctx.lineTo(x, h * 0.62 - TL.noise1(84)(x * 0.015) * 60);
      ctx.lineTo(w, h); ctx.closePath(); ctx.fill();
      ctx.fillStyle = 'rgba(70,58,44,0.5)';
      for (var i = 0; i < 9; i++) {
        ctx.beginPath();
        ctx.ellipse(w * rr(), h * (0.7 + rr() * 0.24), 14 + rr() * 20, 5 + rr() * 6, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      /* orbital scanning grid */
      A.frame(ctx, w * 0.3, h * 0.1, w * 0.42, h * 0.62, 'rgba(126,240,200,0.6)', 'SURFACE SCAN');
      ctx.save();
      ctx.globalAlpha = 0.25; ctx.strokeStyle = '#7ef0c8'; ctx.lineWidth = 1;
      for (var gx = 0; gx < 7; gx++) { ctx.beginPath(); ctx.moveTo(w * 0.3 + gx * w * 0.07, h * 0.1); ctx.lineTo(w * 0.3 + gx * w * 0.07, h * 0.72); ctx.stroke(); }
      ctx.restore();
    },
    ents: [{ x: 0.2, y: 0.24, s: 0.6, craft: A.nearCraft }],
    tags: [[0.04, 0.06, 'MAPPING A SMALL WORLD']]
  });
  PT['near:3'] = A.spaceScene({
    seed: 85,
    deco: function (ctx, w, h) {
      /* asteroid ground low, gray-brown */
      var nz = TL.noise1(86);
      ctx.fillStyle = '#8a7a64';
      ctx.beginPath(); ctx.moveTo(0, h);
      for (var x = 0; x <= w; x += 10) ctx.lineTo(x, h * 0.72 - nz(x * 0.02) * 26);
      ctx.lineTo(w, h); ctx.closePath(); ctx.fill();
      ctx.fillStyle = 'rgba(70,58,44,0.5)';
      for (var i = 0; i < 8; i++) {
        var rr = TL.RNG(87);
        ctx.beginPath();
        ctx.ellipse(w * (0.06 + i * 0.13), h * (0.8 + (i % 3) * 0.05), 16 + (i % 4) * 6, 5 + (i % 2) * 3, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      /* descent line + thruster glow */
      A.dash(ctx, [[w * 0.5, h * 0.06], [w * 0.5, h * 0.6]], 'rgba(126,240,200,0.5)');
    },
    ents: [{ x: 0.5, y: 0.52, s: 1, craft: A.nearCraft }],
    extra: function (ctx, w, h, t) {
      A.glow(ctx, w * 0.5, h * 0.66, 14, '#ffd080', 0.6 + Math.sin(t * 0.02) * 0.2);
    },
    tags: [[0.04, 0.06, 'FEB 12 2001 — TOUCHDOWN'], [0.04, 0.13, 'NEVER DESIGNED TO LAND. IT DID ANYWAY.']]
  });
  PT['near:4'] = A.spaceScene({
    seed: 88,
    deco: function (ctx, w, h) {
      var nz = TL.noise1(89);
      ctx.fillStyle = '#8a7a64';
      ctx.beginPath(); ctx.moveTo(0, h);
      for (var x = 0; x <= w; x += 10) ctx.lineTo(x, h * 0.68 - nz(x * 0.015) * 30);
      ctx.lineTo(w, h); ctx.closePath(); ctx.fill();
      ctx.fillStyle = 'rgba(70,58,44,0.5)';
      for (var i = 0; i < 6; i++) {
        ctx.beginPath();
        ctx.ellipse(w * (0.1 + i * 0.16), h * (0.78 + (i % 3) * 0.06), 18 + (i % 3) * 8, 6, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    },
    ents: [{ x: 0.5, y: 0.7, s: 0.95, craft: A.nearCraft }],
    tags: [[0.04, 0.06, 'DATA CONTINUED FROM THE SURFACE'], [0.04, 0.13, 'AN UNEXPECTED ENDING, ONE MORE ACHIEVEMENT']]
  });

  /* ---------- 08 · PIONEER 10 ---------- */
  PT['p10:0'] = A.spaceScene({
    seed: 91, nStars: 110,
    deco: function (ctx, w, h) {
      A.planet(ctx, w * 0.12, h * 0.32, h * 0.13, { hi: '#7ec8f8', mid: '#2a72c8', lo: '#0a2a5a', spot: 'rgba(60,160,90,0.6)', seed: 3 });
      A.dash(ctx, [[w * 0.28, h * 0.4], [w * 0.55, h * 0.46], [w * 0.8, h * 0.5]], 'rgba(126,240,200,0.35)');
    },
    ents: [{ x: 0.38, y: 0.42, s: 1, craft: A.pioneer }],
    tags: [[0.04, 0.06, 'LAUNCHED · MAR 2 1972'], [0.04, 0.13, 'THE FIRST STEP INTO THE OUTER SOLAR SYSTEM']]
  });
  PT['p10:1'] = A.spaceScene({
    seed: 92, nStars: 60,
    deco: function (ctx, w, h) {
      var rr = TL.RNG(93);
      ctx.fillStyle = '#9a8a74';
      for (var i = 0; i < 18; i++) A.rock(ctx, w * (0.05 + rr() * 0.9), h * (0.08 + rr() * 0.84), 0.35 + rr() * 0.7, '#7a6c58', '#a89a80');
      A.dash(ctx, [[w * 0.1, h * 0.55], [w * 0.35, h * 0.4], [w * 0.6, h * 0.55], [w * 0.85, h * 0.45]], 'rgba(126,240,200,0.4)');
    },
    ents: [{ x: 0.42, y: 0.48, s: 0.95, craft: A.pioneer }],
    tags: [[0.04, 0.06, 'FIRST SPACECRAFT THROUGH THE ASTEROID BELT']]
  });
  PT['p10:2'] = A.spaceScene({
    seed: 94, nStars: 70,
    deco: function (ctx, w, h) {
      A.gasPlanet(ctx, w * 0.34, h * 0.5, h * 0.4, {
        hi: '#e8c8a0', lo: '#8a5a34', seed: 8,
        bands: ['#d8b088', '#b88858', '#e0c4a0', '#a87048', '#d0a878', '#986840', '#dcb890', '#c89868'],
        spotCol: '#b0502a'
      });
    },
    ents: [{ x: 0.78, y: 0.66, s: 0.8, craft: A.pioneer }],
    tags: [[0.04, 0.06, 'JUPITER · FIRST FLYBY · 1973'], [0.04, 0.13, 'THE FIRST CLOSE ENCOUNTER']]
  });
  PT['p10:3'] = A.spaceScene({
    seed: 95, nStars: 60,
    ents: [],
    extra: function (ctx, w, h, t) {
      A.plaque(ctx, w * 0.5, h * 0.52, 2);
      A.glow(ctx, w * 0.5, h * 0.52, h * 0.42, '#e0c470', 0.14);
    },
    tags: [[0.04, 0.06, 'A MESSAGE FROM EARTH'], [0.04, 0.13, 'CLICK THE PLAQUE TO INSPECT ITS SYMBOLS']]
  });
  PT['p10:4'] = A.spaceScene({
    seed: 96, nStars: 150,
    ents: [{ x: 0.4, y: 0.46, s: 0.55, craft: A.pioneer }],
    extra: function (ctx, w, h) {
      ctx.save();
      ctx.globalAlpha = 0.5;
      A.dash(ctx, [[w * 0.46, h * 0.47], [w * 0.62, h * 0.49], [w * 0.78, h * 0.51]], 'rgba(216,220,228,0.6)', 2);
      ctx.restore();
      TL.text(ctx, 'LAST SIGNAL · JAN 23 2003', w * 0.56, h * 0.6, 6, 'rgba(216,220,228,0.75)');
      TL.text(ctx, '12 BILLION KM FROM HOME', w * 0.56, h * 0.68, 6, 'rgba(216,220,228,0.55)');
    },
    tags: [[0.04, 0.06, 'INTO THE DISTANCE']]
  });

  /* ---------- 09 · PIONEER 11 ---------- */
  PT['p11:0'] = A.spaceScene({
    seed: 101, nStars: 110,
    deco: function (ctx, w, h, t) {
      /* the path already opened: a ghost of Pioneer 10 ahead */
      ctx.save();
      ctx.globalAlpha = 0.22;
      ctx.translate(w * 0.72, h * 0.42);
      ctx.scale(0.6, 0.6);
      A.pioneer(ctx, t);
      ctx.restore();
      A.dash(ctx, [[w * 0.3, h * 0.44], [w * 0.5, h * 0.43], [w * 0.66, h * 0.42]], 'rgba(126,240,200,0.4)');
      TL.text(ctx, 'PIONEER 10 · THE PATH', w * 0.62, h * 0.56, 6, 'rgba(216,220,228,0.6)');
    },
    ents: [{ x: 0.28, y: 0.44, s: 1, craft: A.pioneer }],
    tags: [[0.04, 0.06, 'LAUNCHED · APR 6 1973'], [0.04, 0.13, 'A PATH HAD BEEN OPENED']]
  });
  PT['p11:1'] = A.spaceScene({
    seed: 102, nStars: 70,
    deco: function (ctx, w, h) {
      A.gasPlanet(ctx, w * 0.76, h * 0.44, h * 0.34, {
        hi: '#e8c8a0', lo: '#8a5a34', seed: 8,
        bands: ['#d8b088', '#b88858', '#e0c4a0', '#a87048', '#d0a878', '#986840', '#dcb890', '#c89868'],
        spotCol: '#b0502a'
      });
      A.dash(ctx, [[w * 0.3, h * 0.56], [w * 0.52, h * 0.52], [w * 0.66, h * 0.48]], 'rgba(126,240,200,0.4)');
    },
    ents: [{ x: 0.24, y: 0.56, s: 0.9, craft: A.pioneer }],
    tags: [[0.04, 0.06, 'JUPITER · ADDITIONAL OBSERVATIONS']]
  });
  PT['p11:2'] = A.spaceScene({
    seed: 103, nStars: 80,
    deco: function (ctx, w, h) {
      A.gasPlanet(ctx, w * 0.7, h * 0.42, h * 0.3, {
        hi: '#e8d0a8', lo: '#a07040', seed: 10,
        bands: ['#dcc49c', '#c0a070', '#e4d2b0', '#b08c5c', '#d0b488'],
        rings: true, ringTilt: -0.22
      });
    },
    ents: [{ x: 0.24, y: 0.74, s: 0.75, craft: A.pioneer }],
    tags: [[0.04, 0.06, '1979 — FIRST SPACECRAFT AT SATURN'], [0.04, 0.13, 'A RATHER REMARKABLE VIEW']]
  });
  PT['p11:3'] = A.spaceScene({
    seed: 104, nStars: 130,
    deco: function (ctx, w, h, t) {
      ctx.save();
      ctx.globalAlpha = 0.35;
      A.gasPlanet(ctx, w * 0.2, h * 0.3, h * 0.13, {
        hi: '#e8d0a8', lo: '#a07040', seed: 10,
        bands: ['#dcc49c', '#c0a070', '#e4d2b0', '#b08c5c'],
        rings: true, ringTilt: -0.22
      });
      ctx.restore();
      TL.text(ctx, 'SATURN · RECEDING', w * 0.1, h * 0.52, 6, 'rgba(216,220,228,0.6)');
      A.dash(ctx, [[w * 0.5, h * 0.5], [w * 0.68, h * 0.52], [w * 0.86, h * 0.54]], 'rgba(126,240,200,0.35)', 3);
    },
    ents: [{ x: 0.48, y: 0.5, s: 0.7, craft: A.pioneer }],
    tags: [[0.04, 0.06, 'THE WAY FORWARD FOR THE OUTER PLANETS'], [0.04, 0.13, 'LAST SIGNAL · NOV 30 1995']]
  });

  /* ---------- 10 · INGENUITY ---------- */
  PT['ingenuity:0'] = SS('jezero', {
    seed: 111, hz: 0.52, rocks: 4,
    ents: [{ id: 'perseverance', x: 0.3, y: 0.9, s: 2.6 }, { id: 'ingenuity', x: 0.58, y: 0.94, s: 1.7 }],
    tags: [[0.04, 0.06, 'JEZERO CRATER · 2021'], [0.04, 0.13, 'I WASN\'T BUILT TO DRIVE']]
  });
  PT['ingenuity:1'] = SS('jezero', {
    seed: 112, hz: 0.5, rocks: 3,
    ents: [{ id: 'ingenuity', x: 0.5, y: 0.62, s: 2.4, o: { flying: true } }],
    extra: function (ctx, w, h, t) {
      /* small shadow + dust ring below */
      ctx.save();
      ctx.globalAlpha = 0.3; ctx.fillStyle = '#3a1c10';
      ctx.beginPath(); ctx.ellipse(w * 0.5, h * 0.88, 26, 6, 0, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = 0.25; ctx.strokeStyle = '#e8a070'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.ellipse(w * 0.5, h * 0.88, 40 + Math.sin(t * 0.004) * 4, 9, 0, 0, Math.PI * 2); ctx.stroke();
      ctx.restore();
    },
    tags: [[0.04, 0.06, 'APR 19 2021 — FIRST POWERED FLIGHT ON ANOTHER PLANET']]
  });
  PT['ingenuity:2'] = SS('jezero', {
    seed: 113, hz: 0.6, rocks: 5,
    ents: [{ id: 'ingenuity', x: 0.5, y: 0.78, s: 1.4, o: { flying: true } }],
    extra: function (ctx, w, h) {
      A.dash(ctx, [[w * 0.12, h * 0.5], [w * 0.3, h * 0.3], [w * 0.55, h * 0.36], [w * 0.75, h * 0.24], [w * 0.88, h * 0.4], [w * 0.7, h * 0.52], [w * 0.4, h * 0.48], [w * 0.12, h * 0.5]], 'rgba(126,240,200,0.55)', 3);
      ctx.fillStyle = '#7ef0c8';
      var wp = [0.12, 0.3, 0.55, 0.75, 0.88, 0.7, 0.4];
      var hp = [0.5, 0.3, 0.36, 0.24, 0.4, 0.52, 0.48];
      for (var i = 0; i < wp.length; i++) ctx.fillRect(w * wp[i] - 2, h * hp[i] - 2, 4, 4);
      TL.text(ctx, 'FLIGHT PATHS · SOL 10 — SOL 700', w * 0.14, h * 0.16, 6, '#7ef0c8');
    },
    tags: [[0.04, 0.06, '5 FLIGHTS PLANNED · 72 COMPLETED · 17 KM FLOWN']]
  });
  PT['ingenuity:3'] = SS('jezero', {
    seed: 114, hz: 0.78, rocks: 2, dustA: 0.06,
    ents: [{ id: 'ingenuity', x: 0.4, y: 0.9, s: 2.6 }],
    extra: function (ctx, w, h, t) {
      /* rotor + thin-atmosphere diagram */
      ctx.save();
      ctx.globalAlpha = 0.5;
      ctx.strokeStyle = '#7ef0c8'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.ellipse(w * 0.4, h * 0.62, 52, 10, 0, 0, Math.PI * 2); ctx.stroke();
      ctx.globalAlpha = 0.8;
      for (var i = 0; i < 3; i++) {
        var a = t * 0.02 + i * 2.1;
        ctx.beginPath();
        ctx.moveTo(w * 0.4, h * 0.62);
        ctx.lineTo(w * 0.4 + Math.cos(a) * 52, h * 0.62 + Math.sin(a) * 10);
        ctx.stroke();
      }
      ctx.restore();
      A.frame(ctx, w * 0.62, h * 0.16, w * 0.3, h * 0.34, 'rgba(126,240,200,0.7)', 'THIN-AIR FLIGHT');
      TL.text(ctx, 'AIR ~1% OF EARTH\'S', w * 0.64, h * 0.24, 6, '#9fe8d8');
      TL.text(ctx, 'BLADES: 2,400 RPM', w * 0.64, h * 0.31, 6, '#9fe8d8');
      TL.text(ctx, 'CARBON-FIBRE', w * 0.64, h * 0.38, 6, '#9fe8d8');
    },
    tags: [[0.04, 0.06, 'CLICK THE ROTOR TO LEARN THE CHALLENGE']]
  });
  PT['ingenuity:4'] = SS('night', {
    seed: 115, hz: 0.6, stars: true, sun: [0.3, 0.14], sunC: '#f0c090', sunR: 6, rocks: 3,
    ents: [{ id: 'ingenuity', x: 0.46, y: 0.92, s: 2.2 }],
    extra: function (ctx, w, h) {
      /* snapped blade resting on the sand */
      ctx.strokeStyle = '#d8dce4'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(w * 0.52, h * 0.95); ctx.lineTo(w * 0.62, h * 0.92); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(w * 0.52, h * 0.95); ctx.lineTo(w * 0.47, h * 0.985); ctx.stroke();
      A.tag(ctx, w * 0.6, h * 0.8, 'ROTOR DAMAGE · JAN 18 2024', '#f0a050');
    },
    tags: [[0.04, 0.06, '72 FLIGHTS · RETIRED WITH HONOUR']]
  });

  /* ---------- 11 · KEPLER ---------- */
  PT['kepler:0'] = A.spaceScene({
    seed: 121, nStars: 160,
    ents: [{ x: 0.5, y: 0.48, s: 1.6, craft: A.keplerCraft }],
    tags: [[0.04, 0.06, 'LAUNCHED · 2009'], [0.04, 0.13, 'THERE WAS SO MUCH OUT THERE']]
  });
  PT['kepler:1'] = A.spaceScene({
    seed: 122, nStars: 120,
    deco: function (ctx, w, h) {
      A.glow(ctx, w * 0.78, h * 0.34, 16, '#fff2d0', 0.9);
      ctx.fillStyle = '#fff2d0';
      ctx.beginPath(); ctx.arc(w * 0.78, h * 0.34, 5, 0, Math.PI * 2); ctx.fill();
      A.dash(ctx, [[w * 0.62, h * 0.4], [w * 0.74, h * 0.36]], 'rgba(255,242,208,0.5)');
      A.graph(ctx, w * 0.68, h * 0.5, w * 0.24, h * 0.16, { c: '#59c8f0', seed: 6, label: 'BRIGHTNESS OVER TIME' });
    },
    ents: [{ x: 0.28, y: 0.36, s: 1.4, craft: A.keplerCraft }],
    tags: [[0.04, 0.06, 'WATCHING STARLIGHT']]
  });
  PT['kepler:2'] = A.spaceScene({
    seed: 123, nStars: 90,
    deco: function (ctx, w, h, t) {
      /* star with planet crossing */
      A.glow(ctx, w * 0.3, h * 0.32, 26, '#fff2d0', 0.85);
      ctx.fillStyle = '#fff2d0';
      ctx.beginPath(); ctx.arc(w * 0.3, h * 0.32, 11, 0, Math.PI * 2); ctx.fill();
      var px2 = w * 0.3 - 26 + ((t * 0.02) % 52);
      ctx.fillStyle = '#3a4a5a';
      ctx.beginPath(); ctx.arc(px2, h * 0.32, 5, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = 'rgba(89,200,240,0.4)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(w * 0.3, h * 0.32); ctx.lineTo(w * 0.3 - 40, h * 0.32); ctx.stroke();
      TL.text(ctx, 'TRANSIT', w * 0.16, h * 0.18, 6, '#59c8f0');
      /* the light curve */
      A.graph(ctx, w * 0.52, h * 0.5, w * 0.4, h * 0.3, { c: '#59c8f0', dips: 3, seed: 6, label: 'LIGHT CURVE', depth: 0.5 });
      A.dash(ctx, [[w * 0.3, h * 0.4], [w * 0.56, h * 0.52]], 'rgba(89,200,240,0.4)');
    },
    tags: [[0.04, 0.06, 'CLICK THE GRAPH · A TINY DIP REVEALS A WORLD']]
  });
  PT['kepler:3'] = A.spaceScene({
    seed: 124, nStars: 100,
    ents: [{ x: 0.34, y: 0.44, s: 1.5, craft: A.keplerCraft }],
    extra: function (ctx, w, h) {
      /* reaction wheel diagnostic + K2 field */
      A.frame(ctx, w * 0.58, h * 0.14, w * 0.3, h * 0.3, 'rgba(240,160,80,0.7)', 'DIAGNOSTIC · REACTION WHEELS');
      ctx.strokeStyle = '#f0a050'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(w * 0.64, h * 0.28, 9, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(w * 0.64 - 6, h * 0.28 - 6); ctx.lineTo(w * 0.64 + 6, h * 0.28 + 6); ctx.stroke();
      ctx.beginPath(); ctx.arc(w * 0.8, h * 0.28, 9, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(w * 0.8 - 6, h * 0.28 + 6); ctx.lineTo(w * 0.8 + 6, h * 0.28 - 6); ctx.stroke();
      TL.text(ctx, '2 WHEELS FAILED', w * 0.62, h * 0.4, 6, '#f0a050');
      A.frame(ctx, w * 0.58, h * 0.52, w * 0.3, h * 0.24, 'rgba(126,240,200,0.7)', 'K2 · NEW OBSERVING FIELD');
      TL.text(ctx, 'BALANCED ON SUNLIGHT', w * 0.62, h * 0.66, 6, '#9fe8d8');
    },
    tags: [[0.04, 0.06, 'A DIFFERENT APPROACH · THE SAME CURIOSITY']]
  });
  PT['kepler:4'] = A.spaceScene({
    seed: 125, nStars: 190,
    extra: function (ctx, w, h) {
      var rr = TL.RNG(126);
      ctx.strokeStyle = 'rgba(126,240,200,0.6)'; ctx.lineWidth = 1;
      for (var i = 0; i < 9; i++) {
        var x = w * (0.08 + rr() * 0.84), y = h * (0.1 + rr() * 0.76);
        ctx.beginPath(); ctx.arc(x, y, 9, 0, Math.PI * 2); ctx.stroke();
        ctx.fillStyle = '#7ef0c8';
        ctx.fillRect(x - 1, y - 1, 2, 2);
      }
      TL.text(ctx, 'THOUSANDS OF CONFIRMED EXOPLANETS', w * 0.24, h * 0.92, 6, '#9fe8d8');
    },
    tags: [[0.04, 0.06, 'MISSION ENDED · 2018'], [0.04, 0.13, 'THE UNIVERSE WAS NEVER AS EMPTY AS IT LOOKED']]
  });

  /* ---------- 12 · PHOENIX (from TL.D.ARCHIVE facts) ---------- */
  PT['phoenix:0'] = SS('boreal', {
    seed: 131, hz: 0.7, rocks: 2, sun: [0.24, 0.18], sunC: '#e8d8c0',
    extra: chute(0.5, 0.28, 1.6),
    tags: [[0.04, 0.06, 'VASTITAS BOREALIS · MAY 25 2008'], [0.04, 0.13, 'BORN FROM SPARE PARTS OF TWO FAILED MISSIONS']]
  });
  PT['phoenix:1'] = SS('boreal', {
    seed: 132, hz: 0.52, rocks: 3, sun: [0.24, 0.18], sunC: '#e8d8c0',
    ents: [{ id: 'phoenix', x: 0.42, y: 0.9, s: 2.8 }],
    extra: function (ctx, w, h) {
      /* robotic arm trench with exposed ice */
      ctx.strokeStyle = '#c8ccc4'; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.moveTo(w * 0.52, h * 0.84); ctx.lineTo(w * 0.68, h * 0.88); ctx.stroke();
      ctx.fillStyle = 'rgba(50,30,20,0.5)';
      ctx.beginPath(); ctx.ellipse(w * 0.72, h * 0.88, 26, 7, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#eef4f8';
      ctx.beginPath(); ctx.ellipse(w * 0.72, h * 0.88, 18, 4, 0, 0, Math.PI * 2); ctx.fill();
      A.frame(ctx, w * 0.64, h * 0.74, w * 0.16, h * 0.2, 'rgba(126,240,200,0.7)', 'WATER ICE');
    },
    tags: [[0.04, 0.06, 'ICE — CENTIMETRES BELOW THE SOIL']]
  });
  PT['phoenix:2'] = SS('boreal', {
    seed: 133, hz: 0.54, rocks: 3,
    sky: ['#4a3a48', '#241a28'], sun: [0.3, 0.14], sunC: '#c8b8a8', sunR: 5,
    ents: [{ id: 'phoenix', x: 0.5, y: 0.9, s: 2.6 }],
    extra: function (ctx, w, h) {
      ctx.fillStyle = 'rgba(220,235,250,0.3)';
      for (var i = 0; i < 9; i++) {
        ctx.beginPath();
        ctx.ellipse(w * (0.08 + (i * 0.43 % 0.84)), h * (0.7 + (i * 0.31 % 0.22)), 22, 5, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      A.tag(ctx, w * 0.6, h * 0.7, 'DARKNESS + WINTER', '#8a9ab8');
    },
    tags: [[0.04, 0.06, 'LAST SIGNAL · NOV 2 2008']]
  });
  PT['phoenix:3'] = SS('boreal', {
    seed: 134, hz: 0.58, rocks: 4, sun: [0.24, 0.18], sunC: '#e8d8c0',
    ents: [{ id: 'phoenix', x: 0.3, y: 0.92, s: 2 }],
    extra: function (ctx, w, h) {
      A.tag(ctx, w * 0.56, h * 0.24, 'WATER ICE CONFIRMED');
      A.tag(ctx, w * 0.56, h * 0.34, 'PERCHLORATES FOUND');
      A.tag(ctx, w * 0.56, h * 0.44, 'SOIL SURPRISINGLY EARTH-LIKE');
      A.tag(ctx, w * 0.56, h * 0.54, 'FIRST TO TOUCH MARTIAN WATER');
    },
    tags: [[0.04, 0.06, 'WHAT PHOENIX FOUND']]
  });

  /* ---------- 13 · INSIGHT (from TL.D.ARCHIVE facts) ---------- */
  PT['insight:0'] = SS('elysium', {
    seed: 141, hz: 0.74, rocks: 2,
    extra: chute(0.5, 0.28, 1.6),
    tags: [[0.04, 0.06, 'ELYSIUM PLANITIA · NOV 26 2018'], [0.04, 0.13, 'BUILT TO STUDY THE INSIDE OF MARS']]
  });
  PT['insight:1'] = SS('elysium', {
    seed: 142, hz: 0.52, rocks: 3, sun: [0.22, 0.16],
    ents: [{ id: 'insight', x: 0.44, y: 0.9, s: 2.8 }],
    tags: [[0.04, 0.06, 'SEISMOMETER ON THE GROUND — LISTENING']]
  });
  PT['insight:2'] = SS('elysium', {
    seed: 143, hz: 0.56, rocks: 3, sun: [0.22, 0.16],
    ents: [{ id: 'insight', x: 0.26, y: 0.92, s: 2.2 }],
    extra: function (ctx, w, h) {
      A.graph(ctx, w * 0.52, h * 0.14, w * 0.38, h * 0.22, { c: '#59c8f0', seed: 9, label: 'MARQUAKE WAVEFORM' });
      TL.text(ctx, '1,300+ MARSQUAKES DETECTED', w * 0.53, h * 0.42, 6, '#59c8f0');
      TL.text(ctx, 'INCL. A MAGNITUDE-5', w * 0.53, h * 0.5, 6, '#8ab8d8');
      TL.text(ctx, 'CRUST · MANTLE · LIQUID CORE — MEASURED', w * 0.53, h * 0.6, 6, '#8ab8d8');
    },
    tags: [[0.04, 0.06, 'FOUR EARTH YEARS OF LISTENING']]
  });
  PT['insight:3'] = SS('night', {
    seed: 144, hz: 0.56, stars: true, sun: [0.28, 0.14], sunC: '#f0c090', sunR: 5, rocks: 3,
    ents: [{ id: 'insight', x: 0.5, y: 0.92, s: 2.4 }],
    extra: function (ctx, w, h) {
      ctx.fillStyle = 'rgba(220,180,140,0.3)';
      for (var i = 0; i < 7; i++) {
        ctx.beginPath();
        ctx.ellipse(w * (0.36 + i * 0.05), h * (0.9 + (i % 2) * 0.015), 14, 3, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      A.tag(ctx, w * 0.62, h * 0.72, 'DUST ON THE SOLAR PANELS', '#f0a050');
    },
    tags: [[0.04, 0.06, 'DEC 2022 — POWER DEPLETED · SILENT']]
  });

  /* ---------- 14 · PERSEVERANCE (from TL.D.ARCHIVE facts) ---------- */
  PT['perseverance:0'] = SS('jezero', {
    seed: 151, hz: 0.7, rocks: 3,
    extra: function (ctx, w, h, t) {
      /* sky crane + bridle */
      var sx = w * 0.5 + Math.sin(t * 0.001) * 6;
      ctx.save();
      ctx.translate(sx, h * 0.3);
      P(ctx, -16, -10, 32, 18, '#8a8e98');
      P(ctx, -16, -10, 32, 5, '#b0b4bc');
      P(ctx, -6, -20, 12, 10, '#c05a38');
      ctx.strokeStyle = '#d8dce4'; ctx.lineWidth = 1.5;
      for (var i = 0; i < 3; i++) { ctx.beginPath(); ctx.moveTo(-12 + i * 12, 8); ctx.lineTo(-6 + i * 6, 34); ctx.stroke(); }
      P(ctx, -14, 34, 28, 16, '#b07038');
      P(ctx, -14, 34, 28, 4, '#d8924e');
      ctx.restore();
      A.tag(ctx, w * 0.6, h * 0.2, 'SKY CRANE · TETHERED LOWERING', '#7ef0c8');
    },
    tags: [[0.04, 0.06, 'JEZERO CRATER · FEB 18 2021']]
  });
  PT['perseverance:1'] = SS('jezero', {
    seed: 152, hz: 0.52, rocks: 5,
    ents: [{ id: 'perseverance', x: 0.44, y: 0.9, s: 2.8 }],
    extra: function (ctx, w, h) {
      A.frame(ctx, w * 0.56, h * 0.5, w * 0.16, h * 0.26, 'rgba(126,240,200,0.6)', 'DRILLING · DELTA ROCK');
    },
    tags: [[0.04, 0.06, '25+ SAMPLE TUBES SEALED'], [0.04, 0.13, 'A 3.5-BILLION-YEAR-OLD LAKEBED']]
  });
  PT['perseverance:2'] = SS('jezero', {
    seed: 153, hz: 0.6, rocks: 3,
    ents: [{ id: 'perseverance', x: 0.72, y: 0.92, s: 2 }],
    extra: function (ctx, w, h) {
      /* sample tube depot */
      for (var i = 0; i < 5; i++) {
        var tx = w * (0.12 + i * 0.09);
        P(ctx, tx, h * 0.86, 4, 12, '#c8ccd4');
        P(ctx, tx, h * 0.84, 4, 3, '#f0e8d0');
        ctx.fillStyle = 'rgba(30,16,10,0.4)';
        ctx.beginPath(); ctx.ellipse(tx + 2, h * 0.985, 6, 2, 0, 0, Math.PI * 2); ctx.fill();
      }
      A.frame(ctx, w * 0.08, h * 0.66, w * 0.42, h * 0.3, 'rgba(89,200,240,0.6)', 'SAMPLE DEPOT');
      TL.text(ctx, 'ORGANICS IN "WILDCAT RIDGE"', w * 0.1, h * 0.16, 6, '#59c8f0');
      TL.text(ctx, 'MOXIE MADE OXYGEN FROM CO2', w * 0.1, h * 0.24, 6, '#8ab8d8');
    },
    tags: [[0.04, 0.06, 'WAITING FOR THE DAY ITS TUBES COME HOME']]
  });
  PT['perseverance:3'] = SS('jezero', {
    seed: 154, hz: 0.54, rocks: 4,
    ents: [{ id: 'perseverance', x: 0.34, y: 0.9, s: 2.6 }, { id: 'ingenuity', x: 0.68, y: 0.6, s: 1.4, o: { flying: true } }],
    extra: function (ctx, w, h) {
      ctx.save();
      ctx.globalAlpha = 0.3; ctx.fillStyle = '#3a1c10';
      ctx.beginPath(); ctx.ellipse(w * 0.68, h * 0.82, 16, 4, 0, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
      A.dash(ctx, [[w * 0.44, h * 0.6], [w * 0.6, h * 0.6]], 'rgba(126,240,200,0.4)');
    },
    tags: [[0.04, 0.06, 'DEPLOYED INGENUITY — THEN WATCHED IT FLY'], [0.04, 0.13, 'ACTIVE — STILL EXPLORING']]
  });

  /* ---------- 15 · CURIOSITY (from TL.D.ARCHIVE facts) ---------- */
  PT['curiosity:0'] = SS('gale', {
    seed: 161, hz: 0.68, rocks: 2,
    extra: function (ctx, w, h, t) {
      /* Mount Sharp layered mound on the horizon */
      ctx.fillStyle = '#5e3428';
      ctx.beginPath();
      ctx.moveTo(w * 0.52, h * 0.66);
      ctx.lineTo(w * 0.62, h * 0.24);
      ctx.lineTo(w * 0.7, h * 0.34);
      ctx.lineTo(w * 0.78, h * 0.28);
      ctx.lineTo(w * 0.9, h * 0.66);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = 'rgba(240,200,160,0.14)';
      for (var i = 0; i < 4; i++) P(ctx, w * 0.6, h * (0.3 + i * 0.08), w * 0.28, 2);
      /* sky crane */
      var sx = w * 0.32 + Math.sin(t * 0.001) * 6;
      ctx.save();
      ctx.translate(sx, h * 0.32);
      P(ctx, -14, -8, 28, 16, '#8a8e98');
      P(ctx, -14, -8, 28, 5, '#b0b4bc');
      P(ctx, -5, -18, 10, 10, '#c05a38');
      ctx.strokeStyle = '#d8dce4'; ctx.lineWidth = 1.5;
      for (var j = 0; j < 3; j++) { ctx.beginPath(); ctx.moveTo(-10 + j * 10, 8); ctx.lineTo(-5 + j * 5, 32); ctx.stroke(); }
      P(ctx, -12, 32, 24, 14, '#b07038');
      ctx.restore();
    },
    tags: [[0.04, 0.06, 'GALE CRATER · AUG 6 2012'], [0.04, 0.13, 'SKY-CRANE TOUCHDOWN · MOUNT SHARP AHEAD']]
  });
  PT['curiosity:1'] = SS('gale', {
    seed: 162, hz: 0.5, rocks: 4,
    ents: [{ id: 'curiosity', x: 0.4, y: 0.9, s: 2.8 }],
    extra: function (ctx, w, h, t) {
      /* laser zap */
      var fl = Math.abs(Math.sin(t * 0.01));
      ctx.strokeStyle = 'rgba(255,120,80,' + (0.4 + fl * 0.5) + ')';
      ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(w * 0.46, h * 0.68); ctx.lineTo(w * 0.66, h * 0.78); ctx.stroke();
      A.glow(ctx, w * 0.66, h * 0.78, 8 + fl * 5, '#ffb060', 0.8);
      A.frame(ctx, w * 0.58, h * 0.62, w * 0.16, h * 0.24, 'rgba(240,160,80,0.6)', 'LASER TARGET');
      TL.text(ctx, '3,000+ TARGETS · CHEMISTRY FROM 7 M', w * 0.55, h * 0.5, 6, '#f0a050');
    },
    tags: [[0.04, 0.06, 'READING ROCKS WITH LIGHT']]
  });
  PT['curiosity:2'] = SS('gale', {
    seed: 163, hz: 0.62, rocks: 2,
    ents: [{ id: 'curiosity', x: 0.16, y: 0.94, s: 1.8 }],
    extra: function (ctx, w, h) {
      /* layered strata of Mount Sharp */
      var strata = ['#7e4a30', '#9a5c3a', '#b06c44', '#8a5234', '#a86440', '#c07a50'];
      for (var i = 0; i < strata.length; i++) {
        P(ctx, w * 0.46, h * (0.24 + i * 0.09), w * 0.4, h * 0.085, strata[i]);
        P(ctx, w * 0.46, h * (0.24 + i * 0.09), w * 0.4, 1.5, 'rgba(255,230,200,0.25)');
      }
      A.frame(ctx, w * 0.44, h * 0.2, w * 0.44, h * 0.62, 'rgba(89,200,240,0.6)', 'MOUNT SHARP · 5 KM OF LAYERED ROCK');
      TL.text(ctx, 'A LONG-LIVED FRESHWATER LAKE', w * 0.48, h * 0.86, 6, '#59c8f0');
      TL.text(ctx, 'ORGANICS · SEASONAL METHANE', w * 0.48, h * 0.93, 6, '#8ab8d8');
    },
    tags: [[0.04, 0.06, 'A HISTORY BOOK, WRITTEN IN STONE']]
  });
  PT['curiosity:3'] = SS('gale', {
    seed: 164, hz: 0.56, rocks: 4, sun: [0.22, 0.16],
    ents: [{ id: 'curiosity', x: 0.55, y: 0.88, s: 2.4, rot: -0.08, flip: true }],
    extra: function (ctx, w, h) {
      /* wheel tracks behind */
      ctx.strokeStyle = 'rgba(240,220,190,0.35)'; ctx.lineWidth = 2;
      ctx.setLineDash([6, 5]);
      ctx.beginPath(); ctx.moveTo(w * 0.5, h * 0.9); ctx.quadraticCurveTo(w * 0.3, h * 0.96, w * 0.08, h * 0.92); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(w * 0.52, h * 0.88); ctx.quadraticCurveTo(w * 0.32, h * 0.93, w * 0.1, h * 0.89); ctx.stroke();
      ctx.setLineDash([]);
      A.tag(ctx, w * 0.14, h * 0.24, 'CLIMBING MOUNT SHARP', '#7ef0c8');
    },
    tags: [[0.04, 0.06, 'ACTIVE — STILL SINGING HAPPY BIRTHDAY TO ITSELF']]
  });

  /* ---------- 16 · MARINER 4 · THE RELAY (from TL.D.ARCHIVE facts) ---------- */
  PT['relay:0'] = A.spaceScene({
    seed: 171, nStars: 110, skyA: '#060614', skyB: '#0c0a1c',
    deco: function (ctx, w, h) {
      A.planet(ctx, w * 0.8, h * 0.5, h * 0.22, { hi: '#c08a68', mid: '#8a5038', lo: '#4a2418', seed: 5 });
      A.dash(ctx, [[w * 0.3, h * 0.44], [w * 0.56, h * 0.48], [w * 0.68, h * 0.5]], 'rgba(176,168,216,0.45)');
    },
    ents: [{ x: 0.26, y: 0.44, s: 1.1, craft: function (ctx, t, o) { TL.CHAR_DRAW.relay(ctx, t, o); } }],
    tags: [[0.04, 0.06, 'MARINER 4 · LAUNCHED NOV 28 1964'], [0.04, 0.13, 'DESTINATION · MARS']]
  });
  PT['relay:1'] = A.spaceScene({
    seed: 172, nStars: 60, skyA: '#060614', skyB: '#0c0a1c',
    deco: function (ctx, w, h, t) {
      /* camera frame with grainy Mars crescent */
      A.frame(ctx, w * 0.26, h * 0.12, w * 0.48, h * 0.68, 'rgba(176,168,216,0.7)', 'TAPE RECORDER · FRAME 11/21');
      ctx.save();
      ctx.beginPath(); ctx.rect(w * 0.26, h * 0.12, w * 0.48, h * 0.68); ctx.clip();
      A.planet(ctx, w * 0.5, h * 0.46, h * 0.3, { hi: '#c08a68', mid: '#8a5038', lo: '#4a2418', seed: 5 });
      ctx.globalAlpha = 0.3; ctx.fillStyle = '#b0a8d8';
      var rr = TL.RNG(173);
      for (var i = 0; i < 220; i++) ctx.fillRect(w * 0.26 + rr() * w * 0.48, h * 0.12 + rr() * h * 0.68, 2, 1);
      ctx.restore();
      A.glow(ctx, w * 0.5, h * 0.46, 30, '#c08a68', 0.12 + Math.abs(Math.sin(t * 0.004)) * 0.1);
    },
    tags: [[0.04, 0.06, 'JUL 14-15 1965 — MARS FLYBY'], [0.04, 0.13, 'THE FIRST CLOSE-UP PHOTOGRAPHS OF ANOTHER PLANET']]
  });
  PT['relay:2'] = A.spaceScene({
    seed: 174, nStars: 70, skyA: '#060614', skyB: '#0c0a1c',
    extra: function (ctx, w, h) {
      /* the famous grainy frames */
      A.frame(ctx, w * 0.08, h * 0.16, w * 0.38, h * 0.56, 'rgba(176,168,216,0.7)', 'FRAME 7 · CRATERS');
      ctx.save();
      ctx.beginPath(); ctx.rect(w * 0.08, h * 0.16, w * 0.38, h * 0.56); ctx.clip();
      ctx.fillStyle = '#4a4054'; ctx.fillRect(w * 0.08, h * 0.16, w * 0.38, h * 0.56);
      ctx.fillStyle = '#8a7a8c';
      ctx.beginPath(); ctx.arc(w * 0.27, h * 0.5, h * 0.16, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#5c4e60';
      for (var i = 0; i < 7; i++) {
        var rr = TL.RNG(175 + i);
        ctx.beginPath();
        ctx.ellipse(w * (0.12 + rr() * 0.3), h * (0.2 + rr() * 0.44), 8 + rr() * 12, 6 + rr() * 8, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 0.35; ctx.fillStyle = '#b0a8d8';
      var rn = TL.RNG(176);
      for (i = 0; i < 160; i++) ctx.fillRect(w * 0.08 + rn() * w * 0.38, h * 0.16 + rn() * h * 0.56, 2, 1);
      ctx.restore();
      TL.text(ctx, '21 FRAMES RETURNED', w * 0.52, h * 0.24, 7, '#b0a8d8');
      TL.text(ctx, 'NO CANALS · NO CITIES', w * 0.52, h * 0.36, 6, '#8a80a8');
      TL.text(ctx, 'ATMOSPHERE: 5-10 MILLIBARS', w * 0.52, h * 0.44, 6, '#8a80a8');
      TL.text(ctx, 'EVERY BOOK REWRITTEN OVERNIGHT', w * 0.52, h * 0.54, 6, '#8a80a8');
      A.graph(ctx, w * 0.52, h * 0.62, w * 0.36, h * 0.16, { c: '#8a80c8', seed: 4, label: 'SIGNAL STRENGTH', lineC: '#b0a8d8' });
    },
    tags: [[0.04, 0.06, 'HUMANITY\'S FIRST HELLO FROM MARS']]
  });
  PT['relay:3'] = A.spaceScene({
    seed: 177, nStars: 170, skyA: '#060614', skyB: '#0c0a1c',
    ents: [{ x: 0.44, y: 0.5, s: 0.9, craft: function (ctx, t, o) { TL.CHAR_DRAW.relay(ctx, t, o); } }],
    extra: function (ctx, w, h) {
      ctx.save();
      ctx.globalAlpha = 0.4;
      A.dash(ctx, [[w * 0.5, h * 0.52], [w * 0.66, h * 0.55], [w * 0.82, h * 0.58]], 'rgba(176,168,216,0.5)', 2);
      ctx.restore();
      TL.text(ctx, 'STILL DRIFTING IN SOLAR ORBIT', w * 0.56, h * 0.68, 6, 'rgba(176,168,216,0.7)');
    },
    tags: [[0.04, 0.06, 'THE ECHO OF THE FIRST HELLO'], [0.04, 0.13, 'THE SIGNAL SOURCE THAT STARTED EVERYTHING']]
  });

  /* ==== SLIDES-E ==== */

})(window.TL);
