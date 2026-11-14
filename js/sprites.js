/* ============================================================
   THE THINGS WE LEFT BEHIND — sprites.js
   Procedural pixel-art: player robot, 12 machines, items,
   props, portraits. All drawing is hand-crafted vector-pixel.
   ============================================================ */
'use strict';
(function (TL) {

  function P(ctx, x, y, w, h, c) { ctx.fillStyle = c; ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); }

  /* ================= PLAYER ROBOT ================= */
  var RB = {
    body: '#c9d4cd', bodyD: '#93a39b', bodyDD: '#5c6a64',
    visor: '#0a1e26', eye: '#5df0d0', accent: '#f0a050',
    wheel: '#3a4448', leg: '#8fa098'
  };

  /* state: idle|walk|jump|land|interact  phase 0..1  o:{look,blink,lowPower} */
  TL.drawRobot = function (ctx, x, y, dir, state, phase, o) {
    o = o || {};
    ctx.save();
    ctx.translate(Math.round(x), Math.round(y));
    ctx.scale(dir < 0 ? -1 : 1, 1);
    var s = 2; // pixel unit
    function px(u, v, w, h, c) { P(ctx, u * s, v * s, w * s, h * s, c); }
    var bob = 0;
    if (state === 'idle') bob = Math.sin(phase * Math.PI * 2) * 0.5;
    if (state === 'walk') bob = Math.abs(Math.sin(phase * Math.PI * 2)) * 0.8;
    if (state === 'interact') bob = Math.sin(phase * Math.PI * 2) * 0.4;

    var baseY = 17; // feet row (units, from ground 0 down is +)
    var bodyTop = baseY - 17 + bob * -1; // top of body in units above ground

    /* shadow */
    ctx.globalAlpha = 0.25;
    ctx.fillStyle = '#000';
    ctx.beginPath(); ctx.ellipse(0, 1, 13, 3.5, 0, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 1;

    /* legs */
    var legA = 0, legB = 0;
    if (state === 'walk') { legA = Math.sin(phase * Math.PI * 2) * 2.4; legB = -legA; }
    if (state === 'jump') { legA = 1.4; legB = -1.0; }
    if (state === 'land') { legA = 0.8; legB = -0.8; }
    function leg(hx, off) {
      var fx = hx + off;
      px(fx - 1.4, -6.5, 3, 5, RB.leg);
      px(fx - 2.2, -2.4, 4.6, 2.4, RB.wheel); // foot pad
      px(fx - 2.2, -2.4, 4.6, 0.8, '#545e5a');
    }
    leg(-4.5, legB); leg(3.5, legA);

    /* main body */
    var bt = -17 + bob;
    px(-7, bt, 14, 9.5, RB.body);
    px(-7, bt, 14, 1.6, '#e2ebe6');           // top highlight
    px(-7, bt + 8.3, 14, 1.2, RB.bodyD);      // lower shade
    px(5.6, bt + 1.6, 1.4, 6.7, RB.bodyD);    // side shade
    px(-7, bt + 3.2, 14, 0.7, RB.bodyDD);     // seam
    /* chest light */
    var blinkT = (performance.now() * 0.0016) % 1;
    px(-1.2, bt + 5.4, 2.6, 2, blinkT < 0.5 ? '#7ef0c8' : '#2a5a52');

    /* head */
    var hy = bt - 6.4;
    px(-6.4, hy, 12.8, 6.6, RB.body);
    px(-6.4, hy, 12.8, 1.4, '#e2ebe6');
    px(-6.4, hy + 5.4, 12.8, 1.2, RB.bodyD);
    /* visor */
    px(-4.8, hy + 1.4, 9.6, 3.6, RB.visor);
    var look = o.look || 0; /* -1..1 */
    var eyeX = -4.8 + 3 + look * 2.4;
    if (o.blink) {
      px(eyeX - 2, hy + 2.9, 4, 0.9, '#123028');
    } else {
      px(eyeX - 2, hy + 1.9, 4, 2.6, RB.eye);
      px(eyeX - 2, hy + 1.9, 4, 0.8, '#c8fff0');
    }
    /* antenna */
    px(3.6, hy - 4.4, 1.2, 4.6, RB.bodyD);
    var tip = Math.sin(performance.now() * 0.004) > 0 ? '#f0a050' : '#7a4a20';
    px(3.1, hy - 6.2, 2.2, 2, tip);

    /* arm / scanner */
    if (state === 'interact') {
      var sw = Math.sin(phase * Math.PI * 2) * 2;
      px(6.4, bt + 1 + sw, 2.4, 5.5, RB.leg);
      px(6.4, bt - 1.4 + sw, 3, 2.4, RB.eye);
    } else if (state === 'scan') {
      px(6.4, bt + 0.5, 2.4, 6, RB.leg);
      px(6.9, bt - 2.6, 1.4, 3.2, RB.eye);
    } else {
      px(6.4, bt + 1.6, 2.4, 5.2, RB.leg);
      px(6.4, bt + 5.6, 2.8, 1.6, RB.wheel);
    }
    /* low power tint */
    if (o.lowPower) { ctx.globalAlpha = 0.25; P(ctx, -16, 0, 34, -40, '#f0c060'); ctx.globalAlpha = 1; }
    ctx.restore();
  };

  /* ================= CHARACTERS ================= */
  /* each fn draws with ground origin at (0,0), ctx already translated/scaled */
  var C = {};

  C.pathfinder = function (ctx, t, o) {
    o = o || {};
    var s = 2;
    function px(u, v, w, h, c) { P(ctx, u * s, v * s, w * s, h * s, c); }
    ctx.globalAlpha = 0.25; ctx.fillStyle = '#000';
    ctx.beginPath(); ctx.ellipse(0, 1, 26, 5, 0, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1;
    /* petals */
    px(-22, -3, 14, 3, '#b0a890'); px(-22, -6, 14, 3, '#e8e0d0');
    px(8, -3, 14, 3, '#b0a890'); px(8, -6, 14, 3, '#e8e0d0');
    px(-6, -2, 12, 2, '#b0a890'); px(-6, -5, 12, 3, '#e8e0d0');
    /* body */
    px(-8, -16, 16, 11, '#d8d0c0');
    px(-8, -16, 16, 2, '#f2ece0');
    px(-8, -7, 16, 2, '#a89c84');
    px(-6, -12, 5, 3, '#d8b25a'); // gold foil
    px(3, -12, 3, 3, '#40485a');  // base station box
    /* airbag remnant */
    ctx.globalAlpha = 0.85;
    px(-24, -2, 5, 2, '#c8ccc4'); px(-23, -3, 3, 1, '#e8ece4');
    ctx.globalAlpha = 1;
    /* mast */
    px(5, -32, 1.6, 16, '#8a8a92');
    px(2.5, -38, 7, 7, '#c8c4ba');
    px(3.5, -37, 5, 3.2, '#0a1e26');
    var look = Math.sin(t * 0.0011) * 1.2;
    px(4.2 + look, -36.2, 1.6, 2.2, '#5df0d0');
    /* high-gain dish */
    px(10, -30, 1.4, 10, '#8a8a92');
    ctx.fillStyle = '#e8e4da';
    ctx.beginPath(); ctx.ellipse(11.5, -34, 5, 3.4, -0.5, 0, Math.PI * 2); ctx.fill();
    px(11.5, -34.5, 1.4, 1.4, '#7a6a3a');
    /* blinking beacon if undiscovered */
    if (o.beacon) {
      var bl = Math.sin(t * 0.004) > 0;
      px(5.8, -40.5, 2.4, 2, bl ? '#7ef0c8' : '#2a5a52');
    }
  };

  C.sojourner = function (ctx, t, o) {
    var s = 2;
    function px(u, v, w, h, c) { P(ctx, u * s, v * s, w * s, h * s, c); }
    ctx.globalAlpha = 0.25; ctx.fillStyle = '#000';
    ctx.beginPath(); ctx.ellipse(0, 1, 14, 3, 0, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1;
    var wob = Math.sin(t * 0.003) * 0.4;
    /* body wedge */
    px(-7, -8 + wob, 14, 4, '#3a3a40');
    px(-6, -10 + wob, 12, 2.4, '#d8b060');
    px(-6, -8 + wob, 12, 1, '#f0d090');
    /* 6 wheels */
    for (var i = 0; i < 3; i++) {
      px(-7 + i * 5.2, -4, 3.4, 4, '#22262c');
      px(-7 + i * 5.2, -2.4, 3.4, 0.9, '#4a545c');
    }
    /* tiny mast */
    px(-1, -14 + wob, 1.2, 4, '#8a8a92');
    px(-2.2, -16 + wob, 3.6, 2.4, '#c8c4ba');
    var look = Math.sin(t * 0.002) * 0.8;
    px(-1.6 + look, -15.4 + wob, 1.2, 1.4, '#5df0d0');
    /* antenna */
    px(4, -13 + wob, 0.8, 5, '#8a8a92');
    var bl = Math.sin(t * 0.005) > 0;
    px(3.6, -14.6 + wob, 1.6, 1.6, bl ? '#f0a050' : '#7a4a20');
    if (o && o.beacon) {
      var b2 = Math.sin(t * 0.004) > 0;
      px(-0.4, -17.5 + wob, 2, 1.6, b2 ? '#7ef0c8' : '#2a5a52');
    }
  };

  function drawMER(ctx, t, o, dusty) {
    var s = 2;
    function px(u, v, w, h, c) { P(ctx, u * s, v * s, w * s, h * s, c); }
    ctx.globalAlpha = 0.25; ctx.fillStyle = '#000';
    ctx.beginPath(); ctx.ellipse(0, 1, 24, 4.5, 0, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1;
    var sway = Math.sin(t * 0.0016) * 0.35;
    /* solar wings */
    var panel = dusty ? '#3a3540' : '#26365c';
    var panelHi = dusty ? '#54494e' : '#3c5484';
    px(-21, -10 + sway, 13, 5, panel);
    px(-21, -10 + sway, 13, 1, panelHi);
    for (var g = 0; g < 3; g++) px(-19 + g * 4.4, -9 + sway, 0.7, 3, panelHi);
    px(8, -10 + sway, 13, 5, panel);
    px(8, -10 + sway, 13, 1, panelHi);
    for (g = 0; g < 3; g++) px(9.6 + g * 4.4, -9 + sway, 0.7, 3, panelHi);
    /* body */
    px(-9, -13 + sway, 18, 6.5, '#b8b4ac');
    px(-9, -13 + sway, 18, 1.4, dusty ? '#c8b8a8' : '#e8e4dc');
    px(-9, -8 + sway, 18, 1.4, '#8a847c');
    /* deck boxes */
    px(-5, -15 + sway, 4, 2.4, '#8a8a92');
    px(4, -15 + sway, 3, 2.4, '#8a8a92');
    /* mast */
    px(1, -26 + sway, 1.6, 13, '#9a9a a2'.replace(' ', ''));
    px(1, -26 + sway, 1.6, 13, '#9a9aa2');
    px(-3.4, -31 + sway, 10, 6, '#c4c0b8');
    px(-2.4, -30 + sway, 3.4, 3.4, '#0a1e26');
    var look = Math.sin(t * 0.0013 + (dusty ? 2 : 0)) * 1.4;
    px(-1.8 + look, -29.2 + sway, 1.6, 2, '#5df0d0');
    px(2.6, -30 + sway, 3, 3.4, '#0a1e26');
    px(3.4 + look * 0.6, -29.2 + sway, 1.4, 2, '#5df0d0');
    /* wheels */
    var wx = [-19, -9.5, 0, 5.5, 15];
    for (var i = 0; i < wx.length; i++) {
      px(wx[i], -6.5, 5, 6.5, '#2c3238');
      px(wx[i], -2.5, 5, 1, '#4e585e');
    }
    if (dusty) { ctx.globalAlpha = 0.14; P(ctx, -24, -34, 48, 34, '#d8a060'); ctx.globalAlpha = 1; }
    if (o && o.beacon) {
      var bl = Math.sin(t * 0.004) > 0;
      px(-0.6, -34 + sway, 2, 1.6, bl ? '#7ef0c8' : '#2a5a52');
    }
  }
  C.spirit = function (ctx, t, o) { drawMER(ctx, t, o, true); };
  C.opportunity = function (ctx, t, o) { drawMER(ctx, t, o, false); };

  C.viking1 = C.viking2 = function (ctx, t, o) {
    var s = 2;
    function px(u, v, w, h, c) { P(ctx, u * s, v * s, w * s, h * s, c); }
    ctx.globalAlpha = 0.25; ctx.fillStyle = '#000';
    ctx.beginPath(); ctx.ellipse(0, 1, 24, 4.5, 0, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1;
    /* legs */
    px(-13, -6, 2.2, 6, '#6a6a72'); px(11, -6, 2.2, 6, '#6a6a72');
    px(-16, -2, 5, 2, '#565660'); px(12, -2, 5, 2, '#565660');
    px(-3, -6, 2.2, 6, '#6a6a72');
    /* body */
    px(-12, -18, 24, 12, '#8e8e98');
    px(-12, -18, 24, 1.8, '#c8c8d0');
    px(-12, -7.4, 24, 1.4, '#5e5e68');
    px(-9, -16, 6, 3, '#d8b25a');           // gold foil
    px(4, -15, 5, 4, '#3a404c');            // biology box
    /* top engine + bioshield */
    px(-5, -21, 10, 3, '#b06a38');
    px(-5, -21, 10, 1, '#d88a48');
    /* sampling arm */
    px(-19, -13, 6, 1.4, '#7a7a84');
    px(-21, -11, 3, 2, '#9a9aa4');
    /* S-band dish mast */
    px(9, -34, 1.6, 16, '#8a8a92');
    ctx.fillStyle = '#dcd8cc';
    ctx.beginPath(); ctx.ellipse(10, -38, 6.5, 4.4, -0.35, 0, Math.PI * 2); ctx.fill();
    px(10.5, -38.8, 1.4, 1.4, '#7a6a3a');
    if (o && o.beacon) {
      var bl = Math.sin(t * 0.004) > 0;
      px(8.5, -40.5, 2, 1.6, bl ? '#7ef0c8' : '#2a5a52');
    }
  };

  C.phoenix = function (ctx, t, o) {
    var s = 2;
    function px(u, v, w, h, c) { P(ctx, u * s, v * s, w * s, h * s, c); }
    ctx.globalAlpha = 0.25; ctx.fillStyle = '#000';
    ctx.beginPath(); ctx.ellipse(0, 1, 30, 5, 0, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1;
    /* frost patches */
    ctx.globalAlpha = 0.5;
    px(-26, -1.4, 10, 1.6, '#d8ecf4'); px(18, -1.4, 12, 1.6, '#d8ecf4');
    ctx.globalAlpha = 1;
    /* solar panels */
    px(-30, -9, 18, 4.4, '#26365c');
    px(-30, -9, 18, 1, '#3c5484');
    px(12, -9, 18, 4.4, '#26365c');
    px(12, -9, 18, 1, '#3c5484');
    /* body */
    px(-10, -13, 20, 6, '#e4e0d6');
    px(-10, -13, 20, 1.4, '#f6f2ea');
    px(-10, -8.4, 20, 1.4, '#a8a49a');
    /* instruments on deck */
    px(-7, -15, 4, 2.4, '#d8b25a');
    px(4, -15, 4, 2.4, '#8a8a92');
    /* met mast */
    px(6, -30, 1.2, 17, '#9a9aa4');
    px(4.6, -30, 4, 1.6, '#c8c4ba');
    /* robotic arm with scoop */
    px(-16, -11, 5, 1.4, '#b0aca2');
    px(-20, -9.6, 4, 2.4, '#8a8e96');
    px(-20, -7.4, 4, 1.4, '#d8b25a');
    if (o && o.beacon) {
      var bl = Math.sin(t * 0.004) > 0;
      px(5.4, -32.5, 2, 1.6, bl ? '#7ef0c8' : '#2a5a52');
    }
  };

  C.insight = function (ctx, t, o) {
    var s = 2;
    function px(u, v, w, h, c) { P(ctx, u * s, v * s, w * s, h * s, c); }
    ctx.globalAlpha = 0.25; ctx.fillStyle = '#000';
    ctx.beginPath(); ctx.ellipse(0, 1, 26, 5, 0, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1;
    /* panels */
    px(-26, -9, 16, 4.4, '#26365c');
    px(-26, -9, 16, 1, '#3c5484');
    px(10, -9, 16, 4.4, '#26365c');
    px(10, -9, 16, 1, '#3c5484');
    /* copper-gold body */
    px(-9, -15, 18, 7, '#c8813c');
    px(-9, -15, 18, 1.4, '#e8a858');
    px(-9, -9.4, 18, 1.4, '#8a5628');
    px(-6, -17, 4, 2.4, '#d8b25a');
    px(3, -17, 4, 2.4, '#8a8a92');
    /* SEIS dome on ground beside */
    px(18, -6, 8, 5, '#e4e0d6');
    px(18, -6, 8, 1.4, '#f6f2ea');
    px(19, -5, 6, 1, '#c8b090');
    /* tether */
    px(9, -3.2, 9, 0.9, '#5a4a38');
    /* arm */
    px(-15, -12, 5, 1.4, '#b0aca2');
    px(-18, -10.6, 3.4, 2, '#8a8e96');
    if (o && o.beacon) {
      var bl = Math.sin(t * 0.004) > 0;
      px(-1, -19, 2, 1.6, bl ? '#7ef0c8' : '#2a5a52');
    }
  };

  C.ingenuity = function (ctx, t, o) {
    var s = 2;
    function px(u, v, w, h, c) { P(ctx, u * s, v * s, w * s, h * s, c); }
    ctx.globalAlpha = 0.2; ctx.fillStyle = '#000';
    ctx.beginPath(); ctx.ellipse(0, 1, 10, 2.5, 0, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1;
    /* legs */
    px(-6, -7, 1.4, 7, '#3a4048'); px(5, -7, 1.4, 7, '#3a4048');
    px(-8, -2, 3, 2, '#4a545c'); px(6, -2, 3, 2, '#4a545c');
    /* fuselage */
    px(-5, -14, 10, 7, '#3a3f47');
    px(-5, -14, 10, 1.4, '#565e68');
    px(-4, -11, 8, 1.6, '#d8b25a');
    /* solar panel up top */
    px(-4, -18, 8, 1.6, '#26365c');
    px(-4, -18, 8, 0.7, '#3c5484');
    /* mast */
    px(-0.6, -20, 1.2, 2.6, '#565e68');
    /* spinning rotors */
    var ang = (t * 0.02) % (Math.PI * 2);
    var flying = o && o.flying;
    ctx.strokeStyle = 'rgba(180,220,230,0.85)';
    ctx.lineWidth = 1;
    var ry = -21.5 * s, rx = 0;
    var r = flying ? 11 * s : 9.5 * s;
    for (var i = 0; i < 2; i++) {
      var a2 = ang + i * Math.PI / 2;
      ctx.beginPath();
      ctx.moveTo(rx - Math.cos(a2) * r, ry - Math.sin(a2) * r * 0.28);
      ctx.lineTo(rx + Math.cos(a2) * r, ry + Math.sin(a2) * r * 0.28);
      ctx.stroke();
    }
    /* hub */
    px(-1, -22.6, 2, 2.2, '#c8ccd4');
    if (o && o.beacon) {
      var bl = Math.sin(t * 0.004) > 0;
      px(-0.9, -25, 1.8, 1.4, bl ? '#7ef0c8' : '#2a5a52');
    }
  };

  function drawMSL(ctx, t, o, persev) {
    var s = 2;
    function px(u, v, w, h, c) { P(ctx, u * s, v * s, w * s, h * s, c); }
    ctx.globalAlpha = 0.25; ctx.fillStyle = '#000';
    ctx.beginPath(); ctx.ellipse(0, 1, 28, 5, 0, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1;
    var body = persev ? '#e8e2d8' : '#b0aa9a';
    var bodyHi = persev ? '#f8f4ec' : '#d0caba';
    var sway = Math.sin(t * 0.0012) * 0.3;
    /* RTG fin rear */
    px(-21, -12 + sway, 5, 10, '#6a6a72');
    px(-21, -12 + sway, 5, 1.4, '#8a8a92');
    /* body */
    px(-15, -14 + sway, 30, 8, body);
    px(-15, -14 + sway, 30, 1.6, bodyHi);
    px(-15, -7.2 + sway, 30, 1.4, persev ? '#b8b0a4' : '#847e70');
    /* deck gear */
    px(-10, -16.4 + sway, 5, 2.6, '#8a8a92');
    px(2, -16.4 + sway, 6, 2.6, persev ? '#c8a858' : '#8a8a92');
    /* mast */
    px(6, -30 + sway, 1.8, 16, '#8a8a92');
    px(1.6, -36 + sway, 11, 7, body);
    px(1.6, -36 + sway, 11, 1.4, bodyHi);
    /* head cameras */
    px(3, -34.6 + sway, 4, 4, '#0a1e26');
    var look = Math.sin(t * 0.001 + (persev ? 1 : 0)) * 1.2;
    px(3.8 + look, -33.6 + sway, 2, 2.2, '#5df0d0');
    px(9, -34.2 + sway, 2.6, 3, '#0a1e26');
    px(9.6 + look * 0.5, -33.4 + sway, 1.2, 1.8, '#f0a050'); // laser
    /* arm + turret */
    px(-18, -10 + sway, 4, 1.4, '#8a8a92');
    px(-21, -9 + sway, 4, 3.4, '#6a6a72');
    /* wheels */
    var wx = [-22, -13, -4, 5, 14, 21];
    for (var i = 0; i < wx.length; i++) {
      px(wx[i], -7.5, 7, 7.5, '#2c3238');
      px(wx[i], -2.5, 7, 1.2, '#4e585e');
      px(wx[i] + 2.6, -7, 1.2, 6.5, '#424a52');
    }
    if (o && o.beacon) {
      var bl = Math.sin(t * 0.004) > 0;
      px(6.4, -38 + sway, 2, 1.6, bl ? '#7ef0c8' : '#2a5a52');
    }
  }
  C.perseverance = function (ctx, t, o) { drawMSL(ctx, t, o, true); };
  C.curiosity = function (ctx, t, o) { drawMSL(ctx, t, o, false); };

  C.relay = function (ctx, t, o) {
    var s = 2;
    function px(u, v, w, h, c) { P(ctx, u * s, v * s, w * s, h * s, c); }
    ctx.globalAlpha = 0.25; ctx.fillStyle = '#000';
    ctx.beginPath(); ctx.ellipse(0, 1, 18, 4, 0, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1;
    /* tripod dish node */
    px(-8, -5, 2, 5, '#5a5a64'); px(6, -5, 2, 5, '#5a5a64'); px(-1, -5, 2, 5, '#5a5a64');
    px(-10, -2, 4, 2, '#46464e'); px(7, -2, 4, 2, '#46464e');
    px(-6, -18, 12, 13, '#2e3440');
    px(-6, -18, 12, 2, '#4a5568');
    ctx.fillStyle = '#c8d4e0';
    ctx.beginPath(); ctx.ellipse(0, -22, 7, 4.6, -0.4, 0, Math.PI * 2); ctx.fill();
    px(0.5, -22.8, 1.4, 1.4, '#d8b25a');
    /* blinking light */
    var bl = Math.sin(t * 0.006) > 0;
    px(-1, -26, 2, 2, bl ? '#7ef0c8' : '#1a3a34');
    /* holographic Mariner 4 hovering above */
    var hy = -48 + Math.sin(t * 0.0021) * 3;
    var flick = 0.55 + 0.25 * Math.sin(t * 0.02) + 0.12 * Math.sin(t * 0.047);
    ctx.save();
    ctx.globalAlpha = TL.clamp(flick, 0.25, 0.85);
    var hb = '#9ad0e8', hd = '#5a9ab8';
    /* octagonal bus */
    px(-5, hy, 10, 6, hd); px(-4, hy - 1, 8, 1, hb);
    px(-3, hy + 6, 6, 1, hd);
    /* 4 solar vanes */
    px(-14, hy + 1, 7, 3, hb); px(7, hy + 1, 7, 3, hb);
    px(-3.4, hy - 7, 1, 6, hd); px(2.4, hy - 7, 1, 6, hd);
    px(-6, hy - 9, 4.4, 2.4, hb); px(1.6, hy - 9, 4.4, 2.4, hb);
    /* scanline texture on hologram */
    ctx.globalAlpha = TL.clamp(flick, 0.25, 0.85) * 0.5;
    for (var sl = 0; sl < 6; sl++) px(-14, hy - 9 + sl * 2.6, 28, 0.6, '#0a1a24');
    ctx.restore();
    /* transmission particles */
    ctx.globalAlpha = 0.7;
    for (var i = 0; i < 5; i++) {
      var pt = (t * 0.0016 + i * 0.2) % 1;
      px(-2 + Math.sin(i * 2.1) * 3, hy + 10 - pt * 14, 1, 1, '#9ad0e8');
    }
    ctx.globalAlpha = 1;
  };

  TL.CHAR_DRAW = C;

  /* ================= ITEMS ================= */
  TL.drawItem = function (ctx, type, x, y, t) {
    ctx.save();
    ctx.translate(x, y + Math.sin(t * 0.003) * 2);
    ctx.globalAlpha = 0.3;
    ctx.fillStyle = '#000';
    ctx.beginPath(); ctx.ellipse(0, 4 - Math.sin(t * 0.003) * 2, 7, 2, 0, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 1;
    if (type === 'patch') {
      P(ctx, -5, -7, 10, 10, '#2a3a4c'); P(ctx, -4, -6, 8, 8, '#d8b25a');
      P(ctx, -2, -4, 4, 4, '#c05a38'); P(ctx, -1, -3, 2, 2, '#f0e8d0');
    } else if (type === 'photo') {
      P(ctx, -6, -6, 12, 10, '#d8d4c8'); P(ctx, -5, -5, 10, 6, '#4a6a8a');
      P(ctx, -5, -3, 10, 2, '#c05a38'); P(ctx, -3, -5, 2, 2, '#f0e0a0');
    } else if (type === 'note') {
      P(ctx, -5, -7, 10, 11, '#e8e4d4');
      for (var i = 0; i < 4; i++) P(ctx, -3, -5 + i * 2.4, 6 - (i % 2) * 2, 0.8, '#8a8474');
      P(ctx, 2, -8, 3, 3, '#c8c4b8');
    } else if (type === 'shard') {
      P(ctx, -4, -6, 8, 9, '#3a5a6a');
      P(ctx, -3, -5, 6, 7, '#5a8a9a');
      P(ctx, -1, -3, 2, 4, '#7ef0c8');
      P(ctx, 0, 1, 1, 2, '#7ef0c8');
    }
    /* sparkle */
    var sp = Math.sin(t * 0.005 + x) ;
    if (sp > 0.6) {
      ctx.fillStyle = '#ffffff'; ctx.globalAlpha = (sp - 0.6) * 2;
      ctx.fillRect(-1, -9, 2, 2); ctx.fillRect(-6, 2, 2, 2);
      ctx.globalAlpha = 1;
    }
    ctx.restore();
  };

  /* signal ring over undiscovered chars */
  TL.drawBeaconRing = function (ctx, x, y, t) {
    var p = (t * 0.0012) % 1;
    ctx.save();
    ctx.globalAlpha = (1 - p) * 0.6;
    ctx.strokeStyle = '#7ef0c8';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(x, y, 8 + p * 26, 0, Math.PI * 2); ctx.stroke();
    ctx.globalAlpha = (1 - p) * 0.25;
    ctx.beginPath(); ctx.arc(x, y, 8 + p * 40, 0, Math.PI * 2); ctx.stroke();
    ctx.restore();
  };

  /* landing capsule prop (start of game) */
  TL.drawCapsule = function (ctx, x, y) {
    ctx.save(); ctx.translate(x, y);
    ctx.globalAlpha = 0.3; ctx.fillStyle = '#000';
    ctx.beginPath(); ctx.ellipse(0, 2, 34, 7, 0, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 1;
    P(ctx, -30, -22, 60, 22, '#8a8478');
    P(ctx, -30, -22, 60, 4, '#b8b0a0');
    P(ctx, -24, -28, 48, 7, '#6e6860');
    P(ctx, -6, -34, 12, 7, '#5a544c');
    P(ctx, -18, -18, 36, 3, '#4a443e');
    /* scorch */
    P(ctx, -28, -6, 12, 5, '#3a342e'); P(ctx, 18, -8, 10, 6, '#3a342e');
    /* solar panel deployed */
    P(ctx, -58, -30, 26, 3, '#26365c'); P(ctx, -58, -30, 26, 1, '#3c5484');
    P(ctx, 32, -30, 26, 3, '#26365c'); P(ctx, 32, -30, 26, 1, '#3c5484');
    ctx.restore();
  };

  /* ================= PORTRAITS ================= */
  var _portraits = {};
  TL.portrait = function (charId) {
    if (_portraits[charId]) return _portraits[charId];
    var cv = document.createElement('canvas'); cv.width = 96; cv.height = 96;
    var c2 = cv.getContext('2d');
    c2.imageSmoothingEnabled = false;
    /* bg */
    var g = c2.createLinearGradient(0, 0, 0, 96);
    g.addColorStop(0, '#0c2028'); g.addColorStop(1, '#06141a');
    c2.fillStyle = g; c2.fillRect(0, 0, 96, 96);
    /* grid */
    c2.globalAlpha = 0.15; c2.fillStyle = '#7ef0c8';
    for (var i = 0; i < 96; i += 12) { c2.fillRect(0, i, 96, 1); c2.fillRect(i, 0, 1, 96); }
    c2.globalAlpha = 1;
    var meta = TL.CHAR_META[charId] || {};
    var scale = meta.portraitScale || 2.6;
    c2.save();
    c2.translate(48 - (meta.headX || 0) * scale * 2, 62 - (meta.headY || -30) * scale * 2);
    c2.scale(scale, scale);
    var fn = TL.CHAR_DRAW[charId];
    if (fn) fn(c2, 1234, {});
    c2.restore();
    /* frame corners */
    c2.fillStyle = '#6ee6c8';
    c2.fillRect(0, 0, 12, 2); c2.fillRect(0, 0, 2, 12);
    c2.fillRect(84, 0, 12, 2); c2.fillRect(94, 0, 2, 12);
    c2.fillRect(0, 94, 12, 2); c2.fillRect(0, 84, 2, 12);
    c2.fillRect(84, 94, 12, 2); c2.fillRect(94, 84, 2, 12);
    _portraits[charId] = cv;
    return cv;
  };

  TL.CHAR_META = {
    player: { headX: 2, headY: -24, portraitScale: 3.2 },
    pathfinder: { headX: 4, headY: -36, portraitScale: 3.4 },
    sojourner: { headX: -0.5, headY: -15, portraitScale: 4.2 },
    spirit: { headX: 0, headY: -30, portraitScale: 3.4 },
    opportunity: { headX: 0, headY: -30, portraitScale: 3.4 },
    viking1: { headX: 9, headY: -38, portraitScale: 3.2 },
    viking2: { headX: 9, headY: -38, portraitScale: 3.2 },
    phoenix: { headX: 0, headY: -13, portraitScale: 4.0 },
    insight: { headX: 0, headY: -15, portraitScale: 4.0 },
    ingenuity: { headX: 0, headY: -19, portraitScale: 5.0 },
    perseverance: { headX: 6, headY: -34, portraitScale: 3.4 },
    curiosity: { headX: 6, headY: -34, portraitScale: 3.4 },
    relay: { headX: 0, headY: -52, portraitScale: 2.6 }
  };

})(window.TL);
