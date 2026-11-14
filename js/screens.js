/* ============================================================
   THE THINGS WE LEFT BEHIND — screens.js
   Title, cinematic intro, HUD, pause, map, archive,
   settings, epilogue, beyond-the-red-planet.
   ============================================================ */
'use strict';
(function (TL) {

  /* ================= TITLE ================= */
  var Title = { sel: 0, t: 0, items: [] };
  TL.Title = Title;

  Title.rebuild = function () {
    var hasSave = TL.S && (TL.S.seenIntro || TL.S.discoveries.length > 0 || TL.S.finaleDone);
    Title.items = [];
    if (hasSave) Title.items.push({ label: 'CONTINUE EXPEDITION', act: 'continue' });
    Title.items.push({ label: hasSave ? 'NEW EXPEDITION' : 'BEGIN EXPEDITION', act: 'new' });
    Title.items.push({ label: 'MISSION ARCHIVE', act: 'archive' });
    Title.items.push({ label: 'SETTINGS', act: 'settings' });
    Title.items.push({ label: 'ABOUT', act: 'about' });
  };

  Title.update = function (dt) {
    Title.t += dt;
    Title.rebuild();
    if (Title.confirmNew) { Title.confirmT += dt; return; }   /* hold menu input while the confirm dialog is open */
    if (TL.hit('arrowup') || TL.hit('w')) { Title.sel = (Title.sel + Title.items.length - 1) % Title.items.length; TL.audio.ui(); }
    if (TL.hit('arrowdown') || TL.hit('s')) { Title.sel = (Title.sel + 1) % Title.items.length; TL.audio.ui(); }
    for (var i = 0; i < Title.items.length; i++) {
      var y = 330 + i * 34;
      if (TL.mouse.x > 330 && TL.mouse.x < 630 && TL.mouse.y > y - 6 && TL.mouse.y < y + 20) {
        if (TL.mouse.clicked) { Title.sel = i; Title.choose(); }
      }
    }
    if (TL.hit('enter') || TL.hit('e') || TL.hit('space')) Title.choose();
  };
  Title.choose = function () {
    var it = Title.items[Title.sel];
    if (!it) return;
    TL.audio.confirm();
    if (it.act === 'continue') { TL.G.startGame(true); }
    else if (it.act === 'new') { Title.confirmNew = true; Title.confirmT = 0; }
    else if (it.act === 'archive') { TL.G.mode = 'archive'; TL.Archive.tab = 'hw'; }
    else if (it.act === 'settings') { TL.G.mode = 'settings'; TL.G.settingsBack = 'title'; }
    else if (it.act === 'about') { TL.G.mode = 'about'; }
  };

  Title.draw = function (ctx) {
    /* starfield */
    ctx.fillStyle = '#050810'; ctx.fillRect(0, 0, TL.W, TL.H);
    var rr = TL.RNG(5);
    for (var i = 0; i < 120; i++) {
      var sx = rr() * TL.W, sy = rr() * TL.H * 0.7;
      var tw = 0.3 + 0.7 * Math.abs(Math.sin(Title.t * 0.8 + i));
      ctx.globalAlpha = tw * 0.8; ctx.fillStyle = rr() > 0.85 ? '#e8d0a0' : '#c8d8e8';
      ctx.fillRect(sx | 0, sy | 0, 2, 2);
    }
    ctx.globalAlpha = 1;
    /* Mars panorama */
    var g = ctx.createLinearGradient(0, 300, 0, TL.H);
    g.addColorStop(0, '#3a1c14'); g.addColorStop(1, '#160a08');
    ctx.fillStyle = g; ctx.fillRect(0, 340, TL.W, TL.H - 340);
    /* mesas */
    ctx.fillStyle = '#57281c';
    for (i = 0; i < 8; i++) {
      var mx = i * 150 + Math.sin(i * 2.4) * 40;
      ctx.beginPath();
      ctx.moveTo(mx, 380); ctx.lineTo(mx + 30, 330 - (i % 3) * 22); ctx.lineTo(mx + 110, 326 - (i % 3) * 22); ctx.lineTo(mx + 150, 380);
      ctx.closePath(); ctx.fill();
    }
    ctx.fillStyle = '#6e3222'; ctx.fillRect(0, 380, TL.W, TL.H - 380);
    ctx.fillStyle = '#8a4228'; ctx.fillRect(0, 380, TL.W, 3);
    /* little robot silhouette */
    ctx.save();
    ctx.translate(700, 452);
    TL.drawRobot(ctx, 0, 0, -1, 'idle', Title.t * 0.4, {});
    ctx.restore();
    /* title */
    var title = 'THE THINGS WE LEFT BEHIND';
    ctx.font = TL.font(30);
    var tw = ctx.measureText(title).width;
    var pulse = 0.85 + 0.15 * Math.sin(Title.t * 2);
    ctx.save();
    ctx.shadowColor = 'rgba(126,240,200,0.6)'; ctx.shadowBlur = 18 * pulse;
    TL.text(ctx, title, TL.W / 2 - tw / 2 + 8, 118, 30, '#7ef0c8');
    ctx.restore();
    TL.text(ctx, title, TL.W / 2 - tw / 2 + 8, 118, 30, '#7ef0c8');
    TL.text(ctx, 'AN INTERACTIVE MARTIAN EXPLORATION · BY MAI TEAM', TL.W / 2, 168, 9, '#d8b25a', 'center');
    TL.text(ctx, '"You travelled millions of kilometres to discover', TL.W / 2, 196, 8, '#8a9aa8', 'center');
    TL.text(ctx, 'you were not the first one here."', TL.W / 2, 212, 8, '#8a9aa8', 'center');
    /* menu */
    for (i = 0; i < Title.items.length; i++) {
      var y = 330 + i * 34;
      var hov = TL.mouse.x > 330 && TL.mouse.x < 630 && TL.mouse.y > y - 6 && TL.mouse.y < y + 20;
      var selected = Title.sel === i || hov;
      if (selected) {
        TL.text(ctx, '▶', 300, y, 10, '#7ef0c8');
        TL.text(ctx, Title.items[i].label, 324, y, 10, '#aef0dd');
      } else {
        TL.text(ctx, Title.items[i].label, 324, y, 10, '#5a7a70');
      }
    }
    /* confirm new game */
    if (Title.confirmNew) {
      var cx5 = TL.W / 2;
      TL.panel(ctx, cx5 - 235, 240, 470, 104, { corner: '#f0a050' });
      TL.text(ctx, 'ERASE EXISTING EXPEDITION DATA?', cx5, 260, 9, '#f0c090', 'center');
      TL.text(ctx, 'THIS CANNOT BE UNDONE.', cx5, 282, 7, '#8a9aa8', 'center');
      /* arm the dialog briefly so a held ENTER / E / SPACE from the menu cannot fire twice */
      var armed = Title.confirmT > 0.45;
      var yes = button(cx5 - 220, 302, 150, 26, armed ? 'YES, ERASE [ENTER]' : 'YES, ERASE ...');
      var no = button(cx5 + 70, 302, 150, 26, 'CANCEL [ESC]');
      if (no || TL.hit('escape')) { Title.confirmNew = false; TL.audio.uiBack(); return; }
      if ((yes || TL.hit('enter') || TL.hit('e') || TL.hit('space')) && armed) {
        TL.wipeSave();
        Title.confirmNew = false;
        TL.G.startGame(false);
        return;
      }
      return;
    }
    TL.text(ctx, '↑↓ SELECT · ENTER CONFIRM · MOUSE OK', TL.W / 2, TL.H - 40, 7, '#3a5a52', 'center');
    TL.crt(ctx, Title.t);
    TL.staticOverlay(ctx, 0.05);
  };
  function button(x, y, w, h, label) {
    var hov = TL.mouse.x >= x && TL.mouse.x <= x + w && TL.mouse.y >= y && TL.mouse.y <= y + h;
    TL.panel(TL.ctx, x, y, w, h, { bg: 'rgba(20,40,44,0.9)', corner: hov ? '#7ef0c8' : '#3a7a6a' });
    TL.text(TL.ctx, label, x + w / 2, y + h / 2 - 5, 8, hov ? '#aef0dd' : '#7ab8a8', 'center');
    return hov && TL.mouse.clicked;
  }
  TL._button = button;

  /* ================= ABOUT ================= */
  TL.About = {
    draw: function (ctx) {
      ctx.fillStyle = '#050810'; ctx.fillRect(0, 0, TL.W, TL.H);
      TL.panel(ctx, 100, 60, TL.W - 200, TL.H - 120, {});
      TL.text(ctx, 'ABOUT THIS EXPEDITION', TL.W / 2, 84, 12, '#7ef0c8', 'center');
      var lines = [
        'THE THINGS WE LEFT BEHIND is a fictional story about real machines.',
        '',
        'Every spacecraft you meet in this game actually exists — Pathfinder and',
        'Sojourner, Spirit, Opportunity, Viking 1 and 2, Phoenix, InSight,',
        'Ingenuity, Perseverance and Curiosity are on Mars right now (or resting',
        'there, still holding every byte of their missions). Mariner 4 made the',
        'first flyby in 1965. The conversations are invented; the discoveries,',
        'dates and fates are historically accurate.',
        '',
        'BEYOND THE RED PLANET (unlocked after the finale) honours hardware left',
        'on asteroids, in orbit, and on the road out of the solar system.',
        '',
        'Built with vanilla JavaScript + Canvas. No engines, no libraries,',
        'no images — every pixel and every sound is generated by code.',
        '',
        'For the mission teams who never stopped listening.'
      ];
      for (var i = 0; i < lines.length; i++) {
        TL.text(ctx, lines[i], TL.W / 2, 120 + i * 19, 8, i === 0 ? '#d8b25a' : '#9fd8c8', 'center');
      }
      TL.text(ctx, 'ESC / E TO RETURN', TL.W / 2, TL.H - 90, 8, '#5a8a7a', 'center');
      if (TL.hit('escape') || TL.hit('e') || TL.mouse.clicked) { TL.G.mode = 'title'; TL.audio.uiBack(); }
    }
  };

  /* ================= CINEMATIC ================= */
  var Cin = { t: 0, scene: 0, sceneT: 0, done: false };
  TL.Cinematic = Cin;

  Cin.SCENES = [
    { dur: 12.5, lines: [
      { at: 0.8, text: 'There\'s a world out there we\'ve spent centuries looking at.' },
      { at: 4.6, text: 'Red skies. Endless deserts.' },
      { at: 7.6, text: 'A place we know surprisingly little about.' }
    ], draw: function (ctx, t, d) {
      /* stars */
      var rr = TL.RNG(11);
      for (var i = 0; i < 140; i++) {
        var sx = rr() * TL.W, sy = rr() * TL.H;
        ctx.globalAlpha = 0.2 + 0.8 * Math.abs(Math.sin(d * 1.3 + i * 2));
        ctx.fillStyle = i % 9 === 0 ? '#e8d0a0' : '#c8d8e8';
        ctx.fillRect(sx | 0, sy | 0, 2, 2);
      }
      ctx.globalAlpha = 1;
      /* sun flare */
      ctx.globalAlpha = 0.12; ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.arc(TL.W * 0.8, TL.H * 0.25, 90, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = 1;
      /* Earth */
      var ex = 300, ey = 300, er = 120 + Math.sin(d * 0.4) * 2;
      ctx.save();
      ctx.shadowColor = 'rgba(100,160,255,0.5)'; ctx.shadowBlur = 40;
      var eg = ctx.createRadialGradient(ex - 40, ey - 40, 10, ex, ey, er);
      eg.addColorStop(0, '#7ec8f8'); eg.addColorStop(0.6, '#2a72c8'); eg.addColorStop(1, '#0a2a5a');
      ctx.fillStyle = eg;
      ctx.beginPath(); ctx.arc(ex, ey, er, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
      /* continents */
      ctx.save();
      ctx.beginPath(); ctx.arc(ex, ey, er, 0, Math.PI * 2); ctx.clip();
      var rot = d * 6;
      ctx.fillStyle = '#3a9a5a';
      for (i = 0; i < 7; i++) {
        var ca = (i * 50 + rot) % 360 * Math.PI / 180;
        var cx2 = ex + Math.cos(ca) * er * 0.55;
        var cy2 = ey + Math.sin(i * 3.1) * er * 0.45;
        var cs = 16 + (i % 3) * 10;
        ctx.fillRect(cx2 - cs / 2, cy2 - cs / 3, cs, cs * 0.7);
        ctx.fillRect(cx2 - cs, cy2 - cs / 4, cs * 0.6, cs * 0.5);
      }
      /* clouds */
      ctx.globalAlpha = 0.35; ctx.fillStyle = '#e8f4ff';
      for (i = 0; i < 10; i++) {
        var ca2 = (i * 33 + rot * 1.4) % 360 * Math.PI / 180;
        var cx3 = ex + Math.cos(ca2) * er * 0.7;
        var cy3 = ey + Math.sin(i * 2.3 + 1) * er * 0.6;
        ctx.fillRect(cx3, cy3, 24, 6); ctx.fillRect(cx3 + 8, cy3 - 5, 16, 5);
      }
      ctx.globalAlpha = 1;
      ctx.restore();
      /* terminator shadow */
      ctx.globalAlpha = 0.4; ctx.fillStyle = '#000818';
      ctx.beginPath(); ctx.arc(ex + 30, ey + 10, er, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = 1;
      /* moon */
      var ma = d * 0.5;
      ctx.fillStyle = '#b8c4cc';
      ctx.beginPath(); ctx.arc(ex + Math.cos(ma) * 190, ey + Math.sin(ma) * 60, 14, 0, Math.PI * 2); ctx.fill();
      /* transmission rings */
      var p = (d * 0.5) % 1;
      ctx.globalAlpha = (1 - p) * 0.4; ctx.strokeStyle = '#7ef0c8'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(ex, ey, er + 20 + p * 50, 0, Math.PI * 2); ctx.stroke();
      ctx.globalAlpha = 1;
    } },
    { dur: 13, lines: [
      { at: 1.0, text: 'We built something that could go where we couldn\'t.' },
      { at: 5.2, text: 'Something small enough to fit inside a spacecraft —' },
      { at: 8.6, text: 'but brave enough to explore an entire planet.' }
    ], draw: function (ctx, t, d) {
      /* mission control room */
      ctx.fillStyle = '#060a10'; ctx.fillRect(0, 0, TL.W, TL.H);
      /* big wall screen with Mars */
      var mg = ctx.createLinearGradient(0, 60, 0, 240);
      mg.addColorStop(0, '#241a10'); mg.addColorStop(1, '#0c0c12');
      ctx.fillStyle = mg; ctx.fillRect(240, 60, 480, 180);
      ctx.strokeStyle = '#2a3a4a'; ctx.strokeRect(240, 60, 480, 180);
      /* Mars on screen — vivid and well lit */
      var mx = 480 + Math.sin(d * 0.3) * 8, my = 150, mr = 58;
      var mgrad = ctx.createRadialGradient(mx - 22, my - 22, 6, mx, my, mr);
      mgrad.addColorStop(0, '#ffb088'); mgrad.addColorStop(0.45, '#e08a50'); mgrad.addColorStop(0.78, '#c86a3c'); mgrad.addColorStop(1, '#8a4228');
      ctx.fillStyle = mgrad; ctx.beginPath(); ctx.arc(mx, my, mr, 0, Math.PI * 2); ctx.fill();
      /* surface features (clipped to the disc) */
      ctx.save();
      ctx.beginPath(); ctx.arc(mx, my, mr, 0, Math.PI * 2); ctx.clip();
      var fd = TL.RNG(9);
      ctx.fillStyle = 'rgba(140,64,40,0.5)';
      for (var f2 = 0; f2 < 8; f2++) {
        ctx.beginPath();
        ctx.ellipse(mx + (fd() - 0.5) * mr * 1.5, my + (fd() - 0.5) * mr * 1.4, mr * (0.1 + fd() * 0.22), mr * (0.05 + fd() * 0.1), fd() * 3, 0, Math.PI * 2);
        ctx.fill();
      }
      /* polar cap */
      ctx.fillStyle = '#f4ece4';
      ctx.beginPath(); ctx.ellipse(mx, my - mr * 0.8, mr * 0.42, mr * 0.14, 0, 0, Math.PI * 2); ctx.fill();
      /* dusk shadow band */
      ctx.fillStyle = 'rgba(20,10,26,0.3)'; ctx.fillRect(mx - mr, my + mr * 0.4, mr * 2, mr);
      ctx.restore();
      /* screen glow bleeding into the room */
      ctx.globalAlpha = 0.16; ctx.fillStyle = '#c86a3c'; ctx.fillRect(232, 52, 496, 8); ctx.globalAlpha = 1;
      /* targeting reticle */
      ctx.strokeStyle = '#7ef0c8'; ctx.globalAlpha = 0.7;
      ctx.strokeRect(mx - 70, my - 70, 140, 140);
      ctx.globalAlpha = 1;
      TL.text(ctx, 'TARGET: MARS', 250, 66, 8, '#7ef0c8');
      /* shelf of lost hardware — the machines this journey carries */
      var HW = [['pathfinder', 'PATHFINDER'], ['sojourner', 'SOJOURNER'], ['spirit', 'SPIRIT'], ['viking1', 'VIKING'], ['phoenix', 'PHOENIX'], ['insight', 'INSIGHT'], ['ingenuity', 'INGENUITY'], ['curiosity', 'MSL'], ['relay', 'MARINER 4']];
      for (var i2 = 0; i2 < HW.length; i2++) {
        var hx = 74 + i2 * 92, hy = 384;
        ctx.fillStyle = '#1a222c'; ctx.fillRect(hx - 34, hy, 68, 12);   /* pedestal */
        ctx.fillStyle = '#2a3642'; ctx.fillRect(hx - 34, hy, 68, 2);
        ctx.fillStyle = '#0c1218'; ctx.fillRect(hx - 30, hy + 12, 60, 3);
        ctx.save();
        ctx.translate(hx, hy);
        ctx.scale(0.9, 0.9);
        TL.CHAR_DRAW[HW[i2][0]](ctx, Cin.t, {});
        ctx.restore();
        TL.text(ctx, HW[i2][1], hx, hy + 18, 6, '#6a8a9a', 'center');
      }
      /* warm museum light over the shelf */
      ctx.globalAlpha = 0.08; ctx.fillStyle = '#d8b25a'; ctx.fillRect(20, 290, TL.W - 40, 120); ctx.globalAlpha = 1;
      /* blueprint section (later half) */
      if (d > 0.45) {
        var bp = Math.min(1, (d - 0.45) / 0.2);
        ctx.globalAlpha = bp;
        ctx.fillStyle = '#0a2030';
        ctx.fillRect(120, 420, 720, 100);
        ctx.strokeStyle = '#3a6a8a';
        ctx.strokeRect(120, 420, 720, 100);
        ctx.save();
        ctx.strokeStyle = '#6ac8f0'; ctx.lineWidth = 1;
        /* rocket diagram */
        ctx.beginPath();
        ctx.moveTo(500, 432); ctx.lineTo(500, 505); ctx.lineTo(516, 505); ctx.lineTo(516, 432);
        ctx.moveTo(492, 440); ctx.lineTo(500, 432); ctx.lineTo(508, 440);
        ctx.moveTo(496, 505); ctx.lineTo(500, 512); ctx.lineTo(504, 505);
        ctx.stroke();
        ctx.strokeRect(540, 450, 44, 30); /* rover bay */
        ctx.strokeRect(548, 458, 20, 14);
        ctx.strokeRect(610, 446, 26, 38); /* capsule */
        TL.text(ctx, 'ENTRY SYSTEM', 470, 512, 6, '#4a8aa8');
        TL.text(ctx, 'ROVER BAY', 540, 486, 6, '#4a8aa8');
        TL.text(ctx, 'EXPLORER UNIT "SEEKER"', 650, 470, 6, '#4a8aa8');
        ctx.restore();
        ctx.globalAlpha = 1;
      }
    } },
    { dur: 13, lines: [
      { at: 2.2, text: 'All systems nominal.' },
      { at: 6.4, text: 'Destination: Mars.' }
    ], draw: function (ctx, t, d) {
      if (d < 0.55) {
        /* launch pad */
        var lg = ctx.createLinearGradient(0, 0, 0, TL.H);
        lg.addColorStop(0, '#0a1226'); lg.addColorStop(0.7, '#1a2036'); lg.addColorStop(1, '#0c1018');
        ctx.fillStyle = lg; ctx.fillRect(0, 0, TL.W, TL.H);
        /* ground */
        ctx.fillStyle = '#0e141c'; ctx.fillRect(0, TL.H - 90, TL.W, 90);
        /* stars */
        var rr2 = TL.RNG(21);
        for (var i = 0; i < 60; i++) { ctx.globalAlpha = rr2() * 0.7; ctx.fillStyle = '#c8d8e8'; ctx.fillRect(rr2() * TL.W | 0, rr2() * 300 | 0, 2, 2); }
        ctx.globalAlpha = 1;
        /* tower */
        ctx.fillStyle = '#26303e';
        ctx.fillRect(360, 150, 14, TL.H - 240);
        for (i = 0; i < 6; i++) ctx.fillRect(374, 170 + i * 50, 30, 4);
        /* rocket */
        var liftoff = Math.max(0, (d - 0.22) / 0.78);
        var ry = TL.H - 150 - liftoff * liftoff * 700;
        var rx = 470;
        ctx.fillStyle = '#d8dce4';
        ctx.fillRect(rx - 12, ry, 24, 90);
        ctx.fillStyle = '#c8402a';
        ctx.fillRect(rx - 12, ry, 24, 18);
        ctx.beginPath(); ctx.moveTo(rx - 12, ry); ctx.lineTo(rx, ry - 26); ctx.lineTo(rx + 12, ry); ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#8a8e98';
        ctx.fillRect(rx - 18, ry + 60, 6, 22); ctx.fillRect(rx + 12, ry + 60, 6, 22);
        /* flame + smoke */
        if (d > 0.18) {
          var fs = 30 + Math.sin(d * 30) * 8 + liftoff * 30;
          ctx.fillStyle = '#ffd080';
          ctx.beginPath(); ctx.moveTo(rx - 10, ry + 92); ctx.lineTo(rx, ry + 92 + fs); ctx.lineTo(rx + 10, ry + 92); ctx.closePath(); ctx.fill();
          ctx.fillStyle = '#ff8040';
          ctx.beginPath(); ctx.moveTo(rx - 6, ry + 92); ctx.lineTo(rx, ry + 92 + fs * 0.6); ctx.lineTo(rx + 6, ry + 92); ctx.closePath(); ctx.fill();
          ctx.globalAlpha = 0.5; ctx.fillStyle = '#c8c4bc';
          for (i = 0; i < 8; i++) {
            var sy2 = ry + 95 + i * 18 + Math.sin(d * 10 + i) * 6;
            ctx.beginPath(); ctx.arc(rx + Math.sin(d * 6 + i * 2) * (14 + i * 8), sy2, 10 + i * 4, 0, Math.PI * 2); ctx.fill();
          }
          ctx.globalAlpha = 1;
        }
      } else {
        /* space cruise */
        ctx.fillStyle = '#04060e'; ctx.fillRect(0, 0, TL.W, TL.H);
        var rr3 = TL.RNG(31);
        for (i = 0; i < 90; i++) {
          var sx3 = ((rr3() * TL.W - (d - 0.55) * 60) % TL.W + TL.W) % TL.W;
          ctx.globalAlpha = 0.3 + rr3() * 0.7;
          ctx.fillStyle = '#c8d8e8';
          ctx.fillRect(sx3 | 0, (rr3() * TL.H) | 0, rr3() > 0.9 ? 3 : 2, 1);
        }
        ctx.globalAlpha = 1;
        /* spacecraft bus */
        var sx4 = 260, sy4 = 260;
        ctx.save();
        ctx.translate(sx4, sy4); ctx.rotate(Math.sin(d * 2) * 0.05);
        ctx.fillStyle = '#c8ccd4'; ctx.fillRect(-22, -14, 44, 28);
        ctx.fillStyle = '#26365c';
        ctx.fillRect(-58, -8, 30, 16); ctx.fillRect(28, -8, 30, 16);
        ctx.fillStyle = '#3c5484';
        ctx.fillRect(-58, -8, 30, 3); ctx.fillRect(28, -8, 30, 3);
        ctx.fillStyle = '#d8b25a'; ctx.fillRect(-4, -22, 8, 8);
        ctx.strokeStyle = '#8a8e98';
        ctx.beginPath(); ctx.moveTo(0, -14); ctx.lineTo(0, -22); ctx.stroke();
        ctx.restore();
        /* Mars approaching */
        var mg2 = (d - 0.55) / 0.45;
        var mrx = TL.W - 140 - (1 - mg2) * 300, mry = 300, mrr = 40 + mg2 * 60;
        var eg2 = ctx.createRadialGradient(mrx - mrr * 0.3, mry - mrr * 0.3, 5, mrx, mry, mrr);
        eg2.addColorStop(0, '#e8a070'); eg2.addColorStop(0.7, '#c86a3c'); eg2.addColorStop(1, '#5a2418');
        ctx.fillStyle = eg2;
        ctx.beginPath(); ctx.arc(mrx, mry, mrr, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#8a4228';
        ctx.beginPath(); ctx.arc(mrx + 14, mry + 10, mrr * 0.2, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(mrx - 16, mry - 14, mrr * 0.14, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#f0e0d0';
        ctx.globalAlpha = 0.8;
        ctx.beginPath(); ctx.ellipse(mrx, mry - mrr * 0.86, mrr * 0.5, mrr * 0.1, 0, 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = 1;
      }
    } },
    { dur: 14, lines: [
      { at: 1.2, text: 'Touchdown confirmed.' },
      { at: 5.4, text: 'Well... you\'re on your own now, little explorer.' }
    ], draw: function (ctx, t, d) {
      if (d < 0.62) {
        /* atmospheric descent */
        var hg = ctx.createLinearGradient(0, 0, 0, TL.H);
        hg.addColorStop(0, '#3a1c10'); hg.addColorStop(0.5, '#b85a2c'); hg.addColorStop(1, '#e8935a');
        ctx.fillStyle = hg; ctx.fillRect(0, 0, TL.W, TL.H);
        /* heat streaks */
        var spd = 1 + d * 3;
        for (var i = 0; i < 30; i++) {
          var sy5 = ((i * 37 + d * 900) % (TL.H + 60)) - 30;
          ctx.globalAlpha = 0.2 + (i % 5) * 0.1;
          ctx.fillStyle = '#ffd8b0';
          ctx.fillRect(60 + (i * 83) % (TL.W - 120), sy5, 2, 30 + spd * 20);
        }
        ctx.globalAlpha = 1;
        /* === THE LANDING OF OUR ROVER ===
           aeroshell -> parachute + heatshield drop -> sky crane
           lowering the actual explorer robot */
        var cy5 = 120 + d * 250;
        var rc = TL.W / 2;
        if (d < 0.26) {
          /* aeroshell: blunt cone glowing with entry heat */
          ctx.save();
          ctx.translate(rc, cy5);
          ctx.shadowColor = '#ffb060'; ctx.shadowBlur = 30 + d * 40;
          ctx.fillStyle = '#4a3428';
          ctx.beginPath(); ctx.arc(0, 6, 26, Math.PI, 0); ctx.closePath(); ctx.fill();  /* backshell dome */
          ctx.fillStyle = '#6a5038';
          ctx.fillRect(-26, 6, 52, 8);
          ctx.fillStyle = '#8a6a50';
          ctx.beginPath(); ctx.moveTo(-26, 14); ctx.lineTo(26, 14); ctx.lineTo(16, 30); ctx.lineTo(-16, 30); ctx.closePath(); ctx.fill();
          /* glowing rim */
          ctx.strokeStyle = 'rgba(255,180,100,0.9)'; ctx.lineWidth = 2;
          ctx.beginPath(); ctx.moveTo(-25, 29); ctx.quadraticCurveTo(0, 36, 25, 29); ctx.stroke();
          ctx.restore();
        } else {
          /* heatshield falls away, tumbling */
          var hs = Math.min(1, (d - 0.26) / 0.22);
          ctx.save();
          ctx.globalAlpha = Math.max(0, 1 - hs * 0.9);
          ctx.translate(rc + Math.sin(hs * 5) * 30, cy5 + 40 + hs * hs * 260);
          ctx.rotate(hs * 2.2);
          ctx.fillStyle = '#8a6a50';
          ctx.beginPath(); ctx.moveTo(-22, -8); ctx.lineTo(22, -8); ctx.lineTo(13, 8); ctx.lineTo(-13, 8); ctx.closePath(); ctx.fill();
          ctx.strokeStyle = '#ffb060'; ctx.lineWidth = 1.5;
          ctx.beginPath(); ctx.moveTo(-21, -7); ctx.lineTo(21, -7); ctx.stroke();
          ctx.restore();
          ctx.globalAlpha = 1;
          /* backshell + canopy descending slower */
          var cy6 = cy5 * 0.82 + 30;
          /* parachute */
          var pa = Math.min(1, (d - 0.28) / 0.12);
          var sway = Math.sin(d * 3) * 10;
          ctx.globalAlpha = pa;
          ctx.strokeStyle = '#d8dce4'; ctx.lineWidth = 1;
          for (i = 0; i < 4; i++) {
            ctx.beginPath(); ctx.moveTo(rc - 14 + i * 9, cy6 - 10);
            ctx.lineTo(rc + sway + (-30 + i * 20) * 1.6, cy6 - 118); ctx.stroke();
          }
          ctx.fillStyle = '#e8e4d8';
          ctx.beginPath(); ctx.arc(rc + sway, cy6 - 118, 54, Math.PI, 0); ctx.closePath(); ctx.fill();
          ctx.fillStyle = '#c8402a';
          ctx.beginPath(); ctx.arc(rc + sway, cy6 - 118, 54, Math.PI, 0); ctx.closePath(); ctx.fill();
          ctx.fillStyle = '#e8e4d8';
          ctx.beginPath(); ctx.arc(rc + sway, cy6 - 118, 54, Math.PI * 0.75, Math.PI * 1.25); ctx.closePath(); ctx.fill();
          ctx.globalAlpha = 1;
          /* backshell with rover legs peeking below */
          ctx.fillStyle = '#4a3428';
          ctx.beginPath(); ctx.arc(rc, cy6, 20, Math.PI, 0); ctx.closePath(); ctx.fill();
          ctx.fillStyle = '#6a5038'; ctx.fillRect(rc - 20, cy6, 40, 6);
          ctx.strokeStyle = '#c8ccd4'; ctx.lineWidth = 2;
          for (var lg3 = 0; lg3 < 3; lg3++) {
            ctx.beginPath(); ctx.moveTo(rc - 14 + lg3 * 14, cy6 + 6);
            ctx.lineTo(rc - 14 + lg3 * 14, cy6 + 12); ctx.stroke();
          }
          /* sky crane: rover on bridles, thrusters easing it down */
          if (d > 0.44) {
            var sk = Math.min(1, (d - 0.44) / 0.16);
            var bridle = 16 + sk * 46;
            var scy = cy6 - 26 - bridle;
            /* bridles */
            ctx.strokeStyle = '#d8dce4'; ctx.lineWidth = 1.5;
            ctx.beginPath(); ctx.moveTo(rc - 16, scy + 8); ctx.lineTo(rc - 12, scy + 8 + bridle); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(rc + 16, scy + 8); ctx.lineTo(rc + 12, scy + 8 + bridle); ctx.stroke();
            /* crane body */
            ctx.fillStyle = '#8a8e98'; ctx.fillRect(rc - 20, scy, 40, 14);
            ctx.fillStyle = '#b0b4bc'; ctx.fillRect(rc - 20, scy, 40, 4);
            ctx.fillStyle = '#c05a38'; ctx.fillRect(rc - 6, scy - 8, 12, 8);
            /* thruster puffs */
            for (i = 0; i < 2; i++) {
              var tx6 = rc - 14 + i * 28;
              ctx.fillStyle = 'rgba(255,208,128,0.7)';
              ctx.beginPath(); ctx.moveTo(tx6 - 4, scy + 14);
              ctx.lineTo(tx6 + Math.sin(Cin.t * 0.02 + i) * 3, scy + 24 + Math.random() * 4);
              ctx.lineTo(tx6 + 4, scy + 14); ctx.closePath(); ctx.fill();
            }
            /* the rover itself, hanging under the bridles */
            TL.drawRobot(ctx, rc, cy6 + 14 + bridle, 1, 'idle', 0, {});
          } else {
            /* folded rover silhouette inside the shell */
            ctx.fillStyle = '#b89068';
            ctx.fillRect(rc - 12, cy6 + 10, 24, 6);
          }
        }
        /* ground approaching */
        ctx.fillStyle = '#a05a30';
        ctx.globalAlpha = Math.max(0, (d - 0.5) * 2);
        ctx.fillRect(0, TL.H - 40, TL.W, 40);
        ctx.globalAlpha = 1;
      } else {
        /* landed: sky crane flies off, our rover stands alone */
        var d2 = (d - 0.62) / 0.38;
        var lg2 = ctx.createLinearGradient(0, 0, 0, TL.H);
        lg2.addColorStop(0, '#c86a3c'); lg2.addColorStop(1, '#8a3f28');
        ctx.fillStyle = lg2; ctx.fillRect(0, 0, TL.W, TL.H);
        /* ground */
        ctx.fillStyle = '#b56536'; ctx.fillRect(0, 400, TL.W, TL.H - 400);
        ctx.fillStyle = 'rgba(255,220,180,0.4)'; ctx.fillRect(0, 400, TL.W, 3);
        /* sky crane retreating + crash puff in the distance */
        if (d2 < 0.85) {
          var fly = d2 / 0.85;
          var scx = TL.W / 2 + fly * 260, scy2 = 120 - fly * 60;
          ctx.globalAlpha = Math.max(0, 1 - fly * 1.05);
          ctx.fillStyle = '#8a8e98'; ctx.fillRect(scx - 14, scy2, 28, 10);
          ctx.fillStyle = '#c05a38'; ctx.fillRect(scx - 4, scy2 - 6, 8, 6);
          ctx.fillStyle = 'rgba(255,208,128,0.6)';
          for (var ti = 0; ti < 2; ti++) {
            ctx.beginPath(); ctx.arc(scx - 8 + ti * 16, scy2 + 14, 4 + fly * 8, 0, Math.PI * 2); ctx.fill();
          }
          ctx.globalAlpha = 1;
        }
        /* crash puff far away */
        ctx.globalAlpha = Math.max(0, 0.4 - d2 * 0.4);
        ctx.fillStyle = '#e8a070';
        ctx.beginPath(); ctx.ellipse(830, 428, 40 + d2 * 60, 12 + d2 * 10, 0, 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = 1;
        /* our rover, on its own world for the first time */
        TL.drawRobot(ctx, 420, 448, 1, 'idle', Cin.t * 0.001, {});
        /* dust settling */
        ctx.globalAlpha = Math.max(0, 0.5 - d2 * 1.5);
        ctx.fillStyle = '#e8a070';
        ctx.fillRect(0, 380, TL.W, 60);
        ctx.globalAlpha = 1;
        /* robot perspective: our own shadow + arm */
        ctx.fillStyle = 'rgba(20,26,30,0.35)';
        ctx.beginPath(); ctx.ellipse(TL.W / 2, 452, 40, 9, 0, 0, Math.PI * 2); ctx.fill();
        /* boot text */
        if (d2 > 0.25) {
          var bp = Math.min(1, (d2 - 0.25) / 0.2);
          TL.BIG_TEXT = true;
          TL.panel(ctx, TL.W / 2 - 180, 150, 360, 120, { corner: '#7ef0c8' });
          var bootLines = ['SYSTEM INITIALIZED.', 'NAV ..... ONLINE', 'POWER ... 98%', 'MISSION .. BEGIN'];
          var n = Math.floor(bp * 8);
          for (var b2 = 0; b2 < Math.min(bootLines.length, Math.ceil(n / 2)); b2++) {
            TL.text(ctx, bootLines[b2], TL.W / 2 - 150, 170 + b2 * 24, 10, '#7ef0c8');
          }
          TL.BIG_TEXT = false;
        }
      }
    } }
  ];

  Cin.update = function (dt) {
    Cin.t += dt;
    Cin.sceneT += dt;
    var sc = Cin.SCENES[Cin.scene];
    if (Cin.sceneT >= sc.dur) {
      Cin.scene++;
      Cin.sceneT = 0;
      if (Cin.scene >= Cin.SCENES.length) { TL.G.finishIntro(); return; }
    }
    /* light typing ticks alongside the dialogue text */
    var shown2 = null;
    for (var i = 0; i < sc.lines.length; i++) if (Cin.sceneT >= sc.lines[i].at) shown2 = sc.lines[i];
    if (shown2) {
      if (Cin._typeLine !== shown2.at) { Cin._typeLine = shown2.at; Cin._typeN = 0; }
      var chars2 = Math.floor((Cin.sceneT - shown2.at) * 34);
      if (chars2 > Cin._typeN && chars2 < shown2.text.length && chars2 - Cin._typeN >= 2) {
        TL.audio.blip(1100 + Math.random() * 300, 0.016, 0.03, 'square');
        Cin._typeN = chars2;
      }
    }
    if (TL.hit('escape')) { TL.G.finishIntro(); }
  };
  Cin.draw = function (ctx) {
    var sc = Cin.SCENES[Cin.scene];
    var d = Cin.sceneT / sc.dur;
    /* user-imported scene backdrop replaces the drawn scene when present */
    var img = TL.Images ? TL.Images.scene(Cin.scene) : null;
    var hasImg = false;
    ctx.save();
    ctx.fillStyle = '#000'; ctx.fillRect(0, 0, TL.W, TL.H);
    if (img) hasImg = TL.Images.drawCover(ctx, img, 0, 0, TL.W, TL.H);
    if (!hasImg) sc.draw(ctx, Cin.sceneT, d);
    else { /* soft vignette keeps the photo cinematic */
      var vg = ctx.createRadialGradient(TL.W / 2, TL.H / 2, TL.H * 0.34, TL.W / 2, TL.H / 2, TL.H * 0.92);
      vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(4,8,14,0.5)');
      ctx.fillStyle = vg; ctx.fillRect(0, 0, TL.W, TL.H);
    }
    ctx.restore();
    /* letterbox */
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, TL.W, 34); ctx.fillRect(0, TL.H - 34, TL.W, 34);
    /* dialogue lines */
    var shown = null, shownIdx = -1;
    for (var i = 0; i < sc.lines.length; i++) {
      if (Cin.sceneT >= sc.lines[i].at) { shown = sc.lines[i]; shownIdx = i; }
    }
    if (shown) {
      var el = Cin.sceneT - shown.at;
      var chars = Math.floor(el * 34);
      var text = shown.text.slice(0, chars);
      /* placement: imported-image scenes use a bottom subtitle bar;
         mission control sits left; the launch scene alternates
         left -> right so the text frames the rocket;
         other scenes use a centred lower panel */
      var side = 'center';
      if (hasImg) side = 'bar';
      else if (Cin.scene === 1) side = 'left';
      else if (Cin.scene === 2) side = (shownIdx % 2 === 0) ? 'left' : 'right';
      var bx, bw2, py;
      if (side === 'bar') { bx = 60; bw2 = TL.W - 120; py = TL.H - 118; }
      else if (side === 'left') { bx = 18; bw2 = 430; py = 246; }
      else if (side === 'right') { bx = TL.W - 18 - 430; bw2 = 430; py = 246; }
      else { bx = TL.W / 2 - 380; bw2 = 760; py = TL.H - 140; }
      TL.BIG_TEXT = true;
      ctx.font = TL.font(11);
      var lines = TL.wrap(ctx, text, bw2 - 40, 11);
      var bh2 = 46 + lines.length * 18;
      TL.panel(ctx, bx, py, bw2, bh2, { bg: 'rgba(6,14,20,0.78)', corner: '#d8b25a' });
      var alignC = side === 'center' || side === 'bar';
      TL.text(ctx, 'MISSION CONTROL', alignC ? TL.W / 2 : (side === 'left' ? bx + 16 : bx + bw2 - 16), py + 10, 8, '#d8b25a', alignC ? 'center' : (side === 'left' ? 'left' : 'right'));
      var tx0 = alignC ? TL.W / 2 : (side === 'left' ? bx + 20 : bx + bw2 - 20);
      for (var L = 0; L < lines.length; L++) {
        TL.text(ctx, lines[L], tx0, py + 32 + L * 18, 11, '#e8e0d0', alignC ? 'center' : (side === 'left' ? 'left' : 'right'));
      }
      /* typing tick */
      if (chars < shown.text.length && Math.floor(el * 10) % 2 === 0) {
        ctx.font = TL.font(11);
        var wtxt = lines[lines.length - 1] || '';
        var tw = ctx.measureText(wtxt).width;
        var cxc = alignC ? TL.W / 2 + tw / 2 : (side === 'left' ? tx0 + tw : tx0 - tw);
        TL.text(ctx, '▌', cxc + 4, py + 32 + (lines.length - 1) * 18, 11, '#7ef0c8');
      }
      TL.BIG_TEXT = false;
    }
    TL.text(ctx, 'SCENE ' + (Cin.scene + 1) + '/4 · ESC TO SKIP', TL.W - 20, TL.H - 24, 7, '#4a5a66', 'right');
    /* static + CRT */
    TL.staticOverlay(ctx, 0.05);
    TL.crt(ctx, Cin.t);
  };

  /* ================= HUD ================= */
  TL.HUD = {
    card: null,   /* location introduction: { start, def } */
    collect: [],  /* artifact pickup cards: { title, name, t } */
    showCollect: function (title, name) {
      TL.HUD.collect.push({ title: title, name: name, t: 0 });
      if (TL.HUD.collect.length > 3) TL.HUD.collect.shift();
    },
    drawCollect: function (ctx) {
      for (var i = 0; i < TL.HUD.collect.length; i++) {
        var c = TL.HUD.collect[i];
        c.t += 0.016;
        if (c.t > 3.4) { TL.HUD.collect.splice(i, 1); i--; continue; }
        var slide = c.t < 0.4 ? 1 - Math.pow(1 - c.t / 0.4, 3) : c.t > 3.0 ? Math.max(0, 1 - (c.t - 3.0) / 0.4) : 1;
        var nameLines = TL.wrap(ctx, c.name, 176, 9);
        var h = 52 + nameLines.length * 13;
        var x = TL.W - 266 + (1 - slide) * 270;
        var y = 156 + i * (h + 8);
        ctx.save();
        ctx.globalAlpha = slide;
        TL.panel(ctx, x, y, 244, h, { bg: 'rgba(5,18,24,0.94)', corner: '#d8b25a' });
        /* artifact diamond */
        ctx.fillStyle = '#d8b25a';
        ctx.beginPath();
        ctx.moveTo(x + 26, y + 20);
        ctx.lineTo(x + 36, y + 30);
        ctx.lineTo(x + 26, y + 40);
        ctx.lineTo(x + 16, y + 30);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = 'rgba(255,240,210,0.55)';
        ctx.fillRect(x + 24, y + 26, 2, 2);
        TL.text(ctx, c.title, x + 48, y + 9, 6, '#8fc0b0');
        for (var L = 0; L < nameLines.length; L++) {
          TL.text(ctx, nameLines[L], x + 48, y + 20 + L * 13, 9, '#d8b25a');
        }
        TL.text(ctx, 'CHECK IT OUT IN THE MENU', x + 48, y + h - 12, 6, '#6a9a8a');
        ctx.restore();
      }
    },
    showLocation: function (def) {
      TL.HUD.card = { start: performance.now(), def: def };
    },
    drawCard: function (ctx) {
      var c = TL.HUD.card;
      if (!c) return;
      var t = (performance.now() - c.start) / 1000;
      if (t > 3.2) { TL.HUD.card = null; return; }
      var al = Math.min(1, t / 0.35) * (t > 2.5 ? Math.max(0, 1 - (t - 2.5) / 0.7) : 1);
      var y = 118 - Math.min(1, t / 3.2) * 8;
      ctx.save();
      ctx.globalAlpha = al;
      TL.panel(ctx, TL.W / 2 - 220, y, 440, 84, { bg: 'rgba(4,14,18,0.82)', corner: '#d8b25a' });
      /* expedition year */
      TL.text(ctx, c.def.year, TL.W / 2, y + 10, 16, '#d8b25a', 'center');
      TL.rect(ctx, TL.W / 2 - 60, y + 32, 120, 1, 'rgba(216,178,90,0.4)');
      TL.text(ctx, c.def.region, TL.W / 2, y + 40, 9, '#9fe8d8', 'center');
      TL.text(ctx, c.def.sub || '', TL.W / 2, y + 60, 7, '#7ab8a8', 'center', 0.85);
      ctx.restore();
    },
    draw: function (ctx, p) {
      var a = TL.World.area, def = a.def;
      var discovered = TL.discCount();
      /* top-left: expedition year plate */
      TL.panel(ctx, 10, 10, 178, 46, { bg: 'rgba(4,16,20,0.72)' });
      TL.text(ctx, def.year, 22, 15, 14, '#d8b25a');
      TL.text(ctx, def.region, 22, 40, 7, '#8fc0b0', 'left', 0.9);
      /* top-right: slim battery */
      TL.panel(ctx, TL.W - 152, 10, 142, 26, { bg: 'rgba(4,16,20,0.72)' });
      TL.text(ctx, 'PWR', TL.W - 144, 18, 6, '#6a9a8a');
      TL.bar(ctx, TL.W - 112, 17, 70, 11, p.battery / 100, p.battery < 20 ? '#f0a050' : '#7ef0c8');
      TL.text(ctx, Math.round(p.battery) + '', TL.W - 36, 18, 6, '#6a9a8a');
      /* hardware counter chip */
      /* hardware counter chip (drawn diamond — glyph may be missing from the font) */
      ctx.fillStyle = '#d8b25a';
      ctx.beginPath();
      ctx.moveTo(TL.W - 140, 48);
      ctx.lineTo(TL.W - 135, 43);
      ctx.lineTo(TL.W - 130, 48);
      ctx.lineTo(TL.W - 135, 53);
      ctx.closePath();
      ctx.fill();
      TL.text(ctx, String(discovered).padStart(2, '0') + '/' + TL.TOTAL_HW + ' HARDWARE', TL.W - 124, 45, 7, '#8fc0b0', 'left', 0.85);
      /* radar: small, translucent, out of the way */
      var rx = TL.W - 52, ry = 118, rr4 = 28;
      TL.panel(ctx, rx - rr4 - 6, ry - rr4 - 6, rr4 * 2 + 12, rr4 * 2 + 12, { bg: 'rgba(6,20,26,0.45)', corner: 'rgba(110,220,200,0.25)' });
      ctx.save();
      ctx.beginPath(); ctx.arc(rx, ry, rr4, 0, Math.PI * 2); ctx.clip();
      ctx.fillStyle = 'rgba(10,30,36,0.55)'; ctx.fillRect(rx - rr4, ry - rr4, rr4 * 2, rr4 * 2);
      var sweep = (a.t * 0.0012) % (Math.PI * 2);
      ctx.strokeStyle = 'rgba(126,240,200,0.35)';
      ctx.beginPath(); ctx.moveTo(rx, ry); ctx.lineTo(rx + Math.cos(sweep) * rr4, ry + Math.sin(sweep) * rr4); ctx.stroke();
      var blips = TL.World.radarBlips(p.x);
      for (var i = 0; i < blips.length; i++) {
        var b3 = blips[i];
        var dxx = b3.dx / 16;
        if (Math.abs(dxx) > rr4 - 4) dxx = Math.sign(dxx) * (rr4 - 4);
        var colors = { 'char': '#f0a050', 'char-done': '#d8b25a', 'station': '#7ef0c8', 'exit': '#59c8f0', 'item': '#3a8a7a' };
        ctx.fillStyle = colors[b3.kind] || '#7ef0c8';
        var bs = b3.kind === 'char' ? 3 : 2;
        ctx.fillRect(rx + dxx - bs / 2, ry - bs / 2 + Math.sin(a.t * 0.004 + i) * 2, bs, bs);
      }
      ctx.fillStyle = '#fff';
      ctx.fillRect(rx - 2, ry - 2, 4, 4);
      ctx.restore();
      ctx.strokeStyle = 'rgba(110,220,200,0.25)';
      ctx.beginPath(); ctx.arc(rx, ry, rr4, 0, Math.PI * 2); ctx.stroke();
      /* bottom-left: slim objective strip */
      var obj = TL.G.objective();
      TL.panel(ctx, 10, TL.H - 36, 470, 26, { bg: 'rgba(4,16,20,0.6)', corner: 'rgba(110,220,200,0.25)' });
      TL.text(ctx, 'OBJ', 22, TL.H - 29, 7, '#59c8f0');
      TL.text(ctx, obj, 56, TL.H - 29, 8, '#c8e8dc');
      /* faint systems hint, bottom-right */
      TL.text(ctx, 'ESC · SYSTEMS', TL.W - 16, TL.H - 28, 7, 'rgba(140,180,170,0.35)', 'right');
      /* location introduction card */
      TL.HUD.drawCard(ctx);
      /* low battery warning */
      if (p.battery < 18 && Math.sin(a.t * 0.006) > 0) {
        TL.text(ctx, '! LOW POWER — RECHARGE AT SOLAR STATION', TL.W / 2, 60, 8, '#f0a050', 'center');
      }
    }
  };

  /* ================= PAUSE ================= */
  TL.Pause = {
    sel: 0,
    items: ['RESUME', 'NAVIGATION MAP', 'MISSION ARCHIVE', 'SETTINGS', 'QUIT TO TITLE'],
    update: function (dt) {
      if (TL.hit('escape')) { TL.G.resume(); return; }
      if (TL.hit('arrowup') || TL.hit('w')) { TL.Pause.sel = (TL.Pause.sel + 4) % 5; TL.audio.ui(); }
      if (TL.hit('arrowdown') || TL.hit('s')) { TL.Pause.sel = (TL.Pause.sel + 1) % 5; TL.audio.ui(); }
      for (var i = 0; i < 5; i++) {
        var y = 220 + i * 40;
        if (TL.mouse.x > 380 && TL.mouse.x < 580 && TL.mouse.y > y - 8 && TL.mouse.y < y + 18) {
          if (TL.mouse.clicked) { TL.Pause.sel = i; TL.Pause.choose(); }
        }
      }
      if (TL.hit('enter') || TL.hit('e')) TL.Pause.choose();
    },
    choose: function () {
      TL.audio.confirm();
      switch (TL.Pause.sel) {
        case 0: TL.G.resume(); break;
        case 1: TL.G.mode = 'map'; break;
        case 2: TL.G.mode = 'archive'; TL.Archive.tab = 'hw'; break;
        case 3: TL.G.mode = 'settings'; TL.G.settingsBack = 'pause'; break;
        case 4:
          TL.save();
          TL.G.mode = 'title';
          TL.Title.sel = 0;
          break;
      }
    },
    draw: function (ctx) {
      TL.G.drawWorldFrame(ctx);
      ctx.fillStyle = 'rgba(3,8,12,0.72)';
      ctx.fillRect(0, 0, TL.W, TL.H);
      TL.panel(ctx, TL.W / 2 - 200, 150, 400, 300, { corner: '#7ef0c8' });
      TL.text(ctx, '— SYSTEMS PAUSED —', TL.W / 2, 175, 11, '#7ef0c8', 'center');
      for (var i = 0; i < 5; i++) {
        var y = 220 + i * 40;
        var sel = TL.Pause.sel === i;
        var hov = TL.mouse.x > 380 && TL.mouse.x < 580 && TL.mouse.y > y - 8 && TL.mouse.y < y + 18;
        if (sel || hov) {
          TL.text(ctx, '▶', 396, y, 10, '#7ef0c8');
          TL.text(ctx, TL.Pause.items[i], 420, y, 10, '#aef0dd');
        } else {
          TL.text(ctx, TL.Pause.items[i], 420, y, 10, '#5a7a70');
        }
      }
      TL.text(ctx, 'PROGRESS SAVED AUTOMATICALLY', TL.W / 2, 428, 7, '#4a6a60', 'center');
      TL.staticOverlay(ctx, 0.08);
    }
  };

  /* ================= MAP ================= */
  TL.Map = {
    update: function (dt) {
      if (TL.hit('escape') || TL.hit('e')) { TL.G.mode = 'pause'; TL.audio.uiBack(); }
      var a = TL.World.area;
      for (var i = 0; i < TL.D.AREAS.length; i++) {
        var ar = TL.D.AREAS[i];
        var pos = TL.Map.nodePos(i);
        if (TL.dist(TL.mouse.x, TL.mouse.y, pos.x, pos.y) < 26 && TL.mouse.clicked) {
          if (TL.has(TL.S.visited, ar.id) && ar.id !== a.def.id) {
            TL.audio.confirm();
            TL.G.travelTo(ar.id);
          } else if (ar.id !== a.def.id) {
            TL.audio.deny();
            TL.toast('REGION NOT YET CHARTED', '#f0a050');
          }
        }
      }
    },
    nodePos: function (i) {
      var ang = -Math.PI / 2 + i * (Math.PI * 2 / TL.D.AREAS.length) * 0.92;
      return { x: TL.W / 2 + Math.cos(ang) * 190, y: 290 + Math.sin(ang) * 150 };
    },
    draw: function (ctx) {
      ctx.fillStyle = '#04070c'; ctx.fillRect(0, 0, TL.W, TL.H);
      var rr5 = TL.RNG(9);
      for (var i = 0; i < 90; i++) { ctx.globalAlpha = rr5() * 0.6; ctx.fillStyle = '#c8d8e8'; ctx.fillRect(rr5() * TL.W | 0, rr5() * TL.H | 0, 2, 2); }
      ctx.globalAlpha = 1;
      /* Mars disc */
      ctx.fillStyle = '#8a3f28';
      ctx.beginPath(); ctx.arc(TL.W / 2, 290, 110, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#a85230';
      ctx.beginPath(); ctx.arc(TL.W / 2 - 20, 270, 40, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#6a2f20';
      ctx.beginPath(); ctx.arc(TL.W / 2 + 30, 320, 30, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#c87848';
      ctx.beginPath(); ctx.arc(TL.W / 2, 250, 12, 0, Math.PI * 2); ctx.fill();
      TL.text(ctx, 'MARS', TL.W / 2, 282, 10, 'rgba(20,10,8,0.7)', 'center');
      /* nodes */
      var a = TL.World.area;
      for (i = 0; i < TL.D.AREAS.length; i++) {
        var ar = TL.D.AREAS[i];
        var pos = TL.Map.nodePos(i);
        var visited = TL.has(TL.S.visited, ar.id);
        var current = ar.id === a.def.id;
        var hov = TL.dist(TL.mouse.x, TL.mouse.y, pos.x, pos.y) < 26;
        /* line to Mars */
        ctx.strokeStyle = visited ? 'rgba(126,240,200,0.3)' : 'rgba(126,240,200,0.08)';
        ctx.beginPath(); ctx.moveTo(TL.W / 2, 290); ctx.lineTo(pos.x, pos.y); ctx.stroke();
        var col = current ? '#7ef0c8' : visited ? '#59c8f0' : '#3a4a52';
        if (current) {
          var p2 = 0.5 + 0.5 * Math.sin(performance.now() * 0.005);
          ctx.strokeStyle = 'rgba(126,240,200,' + p2 * 0.8 + ')';
          ctx.beginPath(); ctx.arc(pos.x, pos.y, 14 + p2 * 6, 0, Math.PI * 2); ctx.stroke();
        }
        ctx.fillStyle = col;
        ctx.beginPath(); ctx.arc(pos.x, pos.y, hov ? 8 : 6, 0, Math.PI * 2); ctx.fill();
        TL.text(ctx, visited ? ar.region : 'UNCHARTED', pos.x, pos.y + 14, 7, visited ? '#9fd8c8' : '#3a4a52', 'center');
        TL.text(ctx, visited ? ar.year : '· · ·', pos.x, pos.y - 19, 8, visited ? '#d8b25a' : '#3a4a52', 'center');
      }
      TL.panel(ctx, 30, 30, TL.W - 60, 60, {});
      TL.text(ctx, 'NAVIGATION — CHARTED REGIONS', TL.W / 2, 44, 11, '#7ef0c8', 'center');
      TL.text(ctx, 'CLICK A CHARTED NODE TO TRAVEL · CURRENT: ' + a.def.region, TL.W / 2, 68, 8, '#9fd8c8', 'center');
      TL.text(ctx, 'ESC TO RETURN', TL.W / 2, TL.H - 30, 8, '#5a8a7a', 'center');
      TL.staticOverlay(ctx, 0.07);
      TL.crt(ctx, performance.now() * 0.001);
    }
  };

  /* ================= ARCHIVE ================= */
  TL.Archive = {
    tab: 'hw',
    sel: 0, itemSel: 0, beyondSel: 0,
    tabs: [['hw', 'HARDWARE'], ['items', 'RECOVERED'], ['beyond', 'DEEP SPACE']],
    update: function (dt) {
      if (TL.hit('escape')) {
        TL.audio.uiBack();
        TL.G.mode = (TL.G.prevMode === 'title' || !TL.World.area) ? 'title' : 'pause';
      }
      /* tabs */
      for (var t2 = 0; t2 < TL.Archive.tabs.length; t2++) {
        var tx = 40 + t2 * 180;
        if (TL.mouse.x > tx && TL.mouse.x < tx + 170 && TL.mouse.y > 24 && TL.mouse.y < 52 && TL.mouse.clicked) {
          if (TL.Archive.tabs[t2][0] === 'beyond' && !TL.S.finaleDone) { TL.audio.deny(); TL.toast('LOCKED — COMPLETE THE MAIN MISSION', '#f0a050'); }
          else { TL.Archive.tab = TL.Archive.tabs[t2][0]; TL.audio.ui(); }
        }
      }
      var entries = Object.keys(TL.D.ARCHIVE);
      if (TL.Archive.tab === 'hw') {
        /* arrows */
        var upDown = 0;
        if (TL.hit('arrowup') || TL.hit('w')) upDown = -1;
        if (TL.hit('arrowdown') || TL.hit('s')) upDown = 1;
        if (upDown) { TL.Archive.sel = TL.clamp(TL.Archive.sel + upDown, 0, entries.length - 1); TL.audio.ui(); }
        for (var e2 = 0; e2 < entries.length; e2++) {
          var y = 74 + e2 * 26;
          if (y > TL.H - 60) break;
          if (TL.mouse.x > 30 && TL.mouse.x < 250 && TL.mouse.y > y && TL.mouse.y < y + 24 && TL.mouse.clicked) { TL.Archive.sel = e2; TL.audio.ui(); }
        }
        /* ENTER opens the mission archive of the selected, discovered hardware */
        var hwId = entries[TL.Archive.sel];
        if (hwId && TL.discovered(hwId) && (TL.hit('enter') || TL.hit('e'))) {
          TL.audio.ui();
          TL.Slides.open(hwId, 'archive');
          return;
        }
      } else if (TL.Archive.tab === 'items') {
        var items = TL.S.items;
        for (var i3 = 0; i3 < items.length; i3++) {
          var col = i3 % 6, row = Math.floor(i3 / 6);
          var x = 60 + col * 140, y3 = 120 + row * 110;
          if (TL.mouse.x > x && TL.mouse.x < x + 120 && TL.mouse.y > y3 && TL.mouse.y < y3 + 90 && TL.mouse.clicked) { TL.Archive.itemSel = i3; TL.audio.ui(); }
        }
      } else {
        for (var b4 = 0; b4 < TL.D.BEYOND_ORDER.length; b4++) {
          var pos = { x: 200 + b4 * 150, y: 200 };
          if (TL.dist(TL.mouse.x, TL.mouse.y, pos.x, pos.y) < 34 && TL.mouse.clicked) {
            if (TL.Archive.beyondSel === b4) { TL.audio.ui(); TL.Slides.open(TL.D.BEYOND_ORDER[b4], 'archive'); return; }
            TL.Archive.beyondSel = b4; TL.audio.ui();
          }
        }
        /* ENTER opens the mission archive of the selected node */
        var bid = TL.D.BEYOND_ORDER[TL.Archive.beyondSel];
        if (bid && (TL.hit('enter') || TL.hit('e'))) {
          TL.audio.ui();
          TL.Slides.open(bid, 'archive');
          return;
        }
      }
    },
    draw: function (ctx) {
      ctx.fillStyle = '#04080c'; ctx.fillRect(0, 0, TL.W, TL.H);
      var rr6 = TL.RNG(3);
      for (var i = 0; i < 60; i++) { ctx.globalAlpha = rr6() * 0.4; ctx.fillStyle = '#c8d8e8'; ctx.fillRect(rr6() * TL.W | 0, rr6() * TL.H | 0, 2, 2); }
      ctx.globalAlpha = 1;
      /* tabs */
      for (var t3 = 0; t3 < TL.Archive.tabs.length; t3++) {
        var tx = 40 + t3 * 180;
        var active = TL.Archive.tab === TL.Archive.tabs[t3][0];
        var locked = TL.Archive.tabs[t3][0] === 'beyond' && !TL.S.finaleDone;
        TL.panel(ctx, tx, 24, 170, 30, { corner: active ? '#7ef0c8' : '#3a5a52' });
        TL.text(ctx, TL.Archive.tabs[t3][1] + (locked ? ' 🔒' : ''), tx + 12, 33, 8, active ? '#7ef0c8' : locked ? '#3a4a52' : '#6a8a7a');
      }
      if (TL.Archive.tab === 'hw') TL.Archive.drawHW(ctx);
      else if (TL.Archive.tab === 'items') TL.Archive.drawItems(ctx);
      else TL.Archive.drawBeyond(ctx);
      TL.staticOverlay(ctx, 0.07);
      TL.crt(ctx, performance.now() * 0.001);
    },
    drawHW: function (ctx) {
      var entries = Object.keys(TL.D.ARCHIVE);
      var selId = entries[TL.Archive.sel];
      var e = TL.D.ARCHIVE[selId];
      var found = TL.discovered(selId);
      /* list */
      for (var i2 = 0; i2 < entries.length; i2++) {
        var y = 74 + i2 * 26;
        if (y > TL.H - 40) break;
        var isSel = TL.Archive.sel === i2;
        var disc = TL.discovered(entries[i2]);
        TL.rect(ctx, 30, y, 240, 24, isSel ? 'rgba(20,50,46,0.9)' : 'rgba(10,20,26,0.7)');
        TL.text(ctx, (disc ? '' : '??? ') + (disc ? TL.D.ARCHIVE[entries[i2]].name : 'NO DATA'), 40, y + 8, 8, isSel ? '#aef0dd' : disc ? '#7ab8a8' : '#3a4a52');
      }
      /* detail */
      TL.panel(ctx, 290, 70, 640, TL.H - 120, { corner: found ? '#7ef0c8' : '#3a5a52' });
      if (!found) {
        TL.text(ctx, 'ENTRY LOCKED', TL.W / 2 + 80, 160, 12, '#3a5a52', 'center');
        TL.text(ctx, 'ESTABLISH CONTACT IN THE FIELD TO RECOVER THIS RECORD', TL.W / 2 + 80, 190, 8, '#2a3a44', 'center');
        return;
      }
      var px = 306, py = 86;
      TL.panel(ctx, px, py, 104, 104, { corner: '#59c8f0' });
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(TL.portrait(selId), px + 4, py + 4, 96, 96);
      TL.text(ctx, e.name, px + 120, py + 2, 13, '#d8b25a');
      TL.text(ctx, e.craft, px + 120, py + 24, 8, '#9fd8c8');
      TL.text(ctx, 'LAUNCHED: ' + e.launched, px + 120, py + 44, 7, '#6a9a8a');
      TL.text(ctx, 'ARRIVED: ' + e.landed, px + 120, py + 60, 7, '#6a9a8a');
      /* status */
      var active = e.status.indexOf('ACTIVE') === 0;
      TL.text(ctx, 'STATUS: ' + e.status, px + 120, py + 80, 7, active ? '#7ef0c8' : '#8a8a92');
      TL.text(ctx, 'CONVERSATION: LOGGED ✓', px + 120, py + 96, 7, '#7ef0c8');
      /* body */
      var by2 = py + 118;
      TL.text(ctx, 'MISSION PURPOSE', px + 4, by2, 8, '#59c8f0');
      var l1 = TL.wrap(ctx, e.purpose, 600, 8);
      for (var L = 0; L < l1.length; L++) TL.text(ctx, l1[L], px + 4, by2 + 14 + L * 13, 8, '#c8e8dc');
      var y4 = by2 + 14 + l1.length * 13 + 12;
      TL.text(ctx, 'KEY DISCOVERIES', px + 4, y4, 8, '#59c8f0');
      var l2 = TL.wrap(ctx, e.finds, 600, 8);
      for (L = 0; L < l2.length; L++) TL.text(ctx, l2[L], px + 4, y4 + 14 + L * 13, 8, '#c8e8dc');
      var y5 = y4 + 14 + l2.length * 13 + 12;
      var l3 = TL.wrap(ctx, '“' + e.quote + '”', 590, 8);
      for (L = 0; L < l3.length; L++) TL.text(ctx, l3[L], px + 4, y5 + L * 13, 8, '#d8b25a');
      /* open the full mission archive */
      TL._button(px + 4, 452, 260, 26, 'OPEN MISSION ARCHIVE [ENTER]');
      TL.text(ctx, 'THE FULL STORY: 4-5 RECOVERED FRAMES WITH NARRATION', px + 280, 460, 6, '#4a6a78');
    },
    drawItems: function (ctx) {
      var items = TL.S.items;
      TL.text(ctx, 'RECOVERED ITEMS: ' + items.length + ' / ' + Object.keys(TL.D.ITEMS).length, 40, 70, 10, '#7ef0c8');
      if (items.length === 0) {
        TL.text(ctx, 'NOTHING RECOVERED YET — LOOK FOR GLINTING OBJECTS IN EACH REGION', TL.W / 2, 200, 8, '#3a5a52', 'center');
        return;
      }
      for (var i = 0; i < items.length; i++) {
        var col = i % 6, row = Math.floor(i / 6);
        var x = 60 + col * 140, y = 100 + row * 110;
        var it = TL.D.ITEMS[items[i]];
        var sel = TL.Archive.itemSel === i;
        TL.panel(ctx, x, y, 120, 90, { corner: sel ? '#7ef0c8' : '#3a5a52' });
        ctx.save(); ctx.translate(x + 60, y + 34);
        var t = performance.now();
        ctx.scale(1.6, 1.6);
        TL.drawItem(ctx, it.type, 0, 0, t);
        ctx.restore();
        var lab = TL.wrap(ctx, it.label, 108, 6);
        for (var w = 0; w < Math.min(2, lab.length); w++) {
          TL.text(ctx, lab[w], x + 6, y + 62 + w * 9, 6, sel ? '#aef0dd' : '#7ab8a8');
        }
      }
      /* selected detail */
      if (items.length) {
        var it2 = TL.D.ITEMS[items[TL.clamp(TL.Archive.itemSel, 0, items.length - 1)]];
        var lines = TL.wrap(ctx, it2.text, TL.W - 120, 8);
        TL.text(ctx, '» ' + it2.label, 60, TL.H - 92, 8, '#d8b25a');
        for (var L2 = 0; L2 < lines.length; L2++) TL.text(ctx, lines[L2], 60, TL.H - 74 + L2 * 13, 8, '#9fd8c8');
      }
    },
    drawBeyond: function (ctx) {
      TL.text(ctx, 'BEYOND THE RED PLANET — THE WIDER RECORD', 40, 70, 11, '#7ef0c8');
      TL.text(ctx, 'HUMANITY DID NOT ONLY LEAVE THINGS ON MARS. SELECT A NODE.', 40, 92, 8, '#9fd8c8');
      TL.text(ctx, 'CLICK A NODE (AGAIN) OR PRESS ENTER — OPEN ITS MISSION ARCHIVE', 40, 110, 7, '#6a8a9a');
      var order = TL.D.BEYOND_ORDER;
      for (var b5 = 0; b5 < order.length; b5++) {
        var pos = { x: 200 + b5 * 150, y: 210 };
        var sel = TL.Archive.beyondSel === b5;
        var hov = TL.dist(TL.mouse.x, TL.mouse.y, pos.x, pos.y) < 34;
        var id = order[b5];
        var e = TL.D.BEYOND[id];
        /* orbit ring */
        ctx.strokeStyle = 'rgba(126,240,200,0.2)';
        ctx.beginPath(); ctx.arc(TL.W / 2, 380, 380 - b5 * 40, Math.PI * 1.15, Math.PI * 1.85); ctx.stroke();
        /* node */
        var col = sel ? '#f0a050' : hov ? '#7ef0c8' : '#59c8f0';
        if (id === 'dawn' || id === 'kepler') ctx.fillStyle = col;
        else if (id === 'near') ctx.fillStyle = col;
        else ctx.fillStyle = col;
        ctx.beginPath(); ctx.arc(pos.x, pos.y, 10, 0, Math.PI * 2); ctx.fill();
        /* small craft icon */
        ctx.save(); ctx.translate(pos.x, pos.y); ctx.rotate(Math.PI / 4);
        ctx.fillStyle = '#c8ccd4'; ctx.fillRect(-7, -4, 14, 8);
        ctx.fillStyle = '#26365c'; ctx.fillRect(-16, -3, 7, 6); ctx.fillRect(9, -3, 7, 6);
        ctx.restore();
        TL.text(ctx, e.name, pos.x, pos.y + 22, 8, col, 'center');
      }
      /* dossier */
      var eid = order[TL.Archive.beyondSel];
      var e2 = TL.D.BEYOND[eid];
      TL.panel(ctx, 40, 280, TL.W - 80, TL.H - 330, { corner: '#7ef0c8' });
      TL.text(ctx, e2.name + ' — ' + e2.craft, 60, 296, 11, '#d8b25a');
      TL.text(ctx, 'LAUNCHED: ' + e2.launched + '   ·   STATUS: ' + e2.status, 60, 320, 7, '#6a9a8a');
      var l1 = TL.wrap(ctx, 'PURPOSE: ' + e2.purpose, TL.W - 140, 8);
      for (var L = 0; L < l1.length; L++) TL.text(ctx, l1[L], 60, 344 + L * 13, 8, '#c8e8dc');
      var y6 = 344 + l1.length * 13 + 8;
      var l2 = TL.wrap(ctx, 'RECORD: ' + e2.finds, TL.W - 140, 8);
      for (L = 0; L < l2.length; L++) TL.text(ctx, l2[L], 60, y6 + L * 13, 8, '#9fd8c8');
      var y7 = y6 + l2.length * 13 + 8;
      TL.text(ctx, '“' + e2.quote + '”', 60, y7, 8, '#d8b25a');
    }
  };

  /* ================= SETTINGS ================= */
  TL.Settings = {
    drag: null,
    SLX: 420, SLW: 240,           /* slider track: x 420..660 */
    TX0: 414, TX1: 666,           /* generous hit zone for both control types */
    update: function (dt) {
      if (TL.hit('escape') || TL.hit('e')) {
        TL.save();
        TL.audio.uiBack();
        TL.G.mode = TL.G.settingsBack || 'pause';
      }
      if (TL.hit('m')) { TL.S.settings.mute = !TL.S.settings.mute; TL.audio.applySettings(); TL.toast(TL.S.settings.mute ? 'AUDIO MUTED' : 'AUDIO ON'); }
      var rows = TL.Settings.rows();
      for (var i = 0; i < rows.length; i++) {
        var r = rows[i];
        if (r.type === 'slider') {
          var hovering = TL.mouse.y > r.y - 14 && TL.mouse.y < r.y + 14 && TL.mouse.x > TL.Settings.TX0 && TL.mouse.x < TL.Settings.TX1;
          if (hovering && TL.mouse.down) TL.Settings.drag = i;
          if (TL.Settings.drag === i) {
            var v = TL.clamp((TL.mouse.x - TL.Settings.SLX) / TL.Settings.SLW, 0, 1);
            TL.S.settings[r.key] = Math.round(v * 100) / 100;
            TL.audio.applySettings();
          }
        } else {
          if (TL.mouse.x > TL.Settings.TX0 && TL.mouse.x < TL.Settings.TX1 && TL.mouse.y > r.y - 15 && TL.mouse.y < r.y + 15 && TL.mouse.clicked) {
            if (r.key === 'mute') TL.S.settings.mute = !TL.S.settings.mute;
            if (r.key === 'shake') TL.S.settings.shake = !TL.S.settings.shake;
            if (r.key === 'reset') {
              if (TL.Settings.resetArm) { TL.wipeSave(); TL.Settings.resetArm = false; TL.toast('SAVE ERASED'); TL.G.mode = 'title'; TL.Title.rebuild(); }
              else { TL.Settings.resetArm = true; TL.toast('CLICK AGAIN TO CONFIRM ERASE', '#f0a050'); }
            }
            TL.audio.applySettings();
            TL.audio.ui();
          }
        }
      }
      if (!TL.mouse.down) TL.Settings.drag = null;
    },
    rows: function () {
      return [
        { type: 'slider', label: 'MASTER VOLUME', key: 'vol', y: 176 },
        { type: 'slider', label: 'MUSIC', key: 'music', y: 226 },
        { type: 'slider', label: 'EFFECTS', key: 'sfx', y: 276 },
        { type: 'toggle', label: 'MUTE ALL AUDIO', key: 'mute', y: 330 },
        { type: 'toggle', label: 'SCREEN SHAKE', key: 'shake', y: 402 },
        { type: 'toggle', label: 'ERASE SAVE DATA', key: 'reset', y: 474 }
      ];
    },
    heading: function (ctx, txt, x, y) {
      TL.text(ctx, txt, x, y, 8, '#59c8f0');
      var w = ctx.measureText(txt).width;
      ctx.font = TL.font(8);
      TL.rect(ctx, x + w + 14, y + 6, 720 - x - w - 14, 1, 'rgba(89,200,240,0.25)');
    },
    draw: function (ctx) {
      ctx.fillStyle = '#04080c'; ctx.fillRect(0, 0, TL.W, TL.H);
      TL.panel(ctx, 200, 80, 560, 440, { corner: '#7ef0c8' });
      /* heading block */
      TL.text(ctx, 'SYSTEM SETTINGS', 240, 100, 12, '#7ef0c8');
      TL.text(ctx, 'ONBOARD CONFIGURATION TERMINAL', 720, 106, 6, '#4a6a60', 'right');
      TL.rect(ctx, 240, 126, 480, 1, 'rgba(126,240,200,0.25)');
      ctx.font = TL.font(8);
      /* sections */
      TL.Settings.heading(ctx, 'AUDIO', 240, 142);
      TL.Settings.heading(ctx, 'SYSTEM', 240, 368);
      TL.Settings.heading(ctx, 'DATA', 240, 440);
      /* rows */
      var rows = TL.Settings.rows();
      for (var i = 0; i < rows.length; i++) {
        var r = rows[i];
        TL.text(ctx, r.label, 240, r.y - 4, 8, '#9fd8c8');
        if (r.type === 'slider') {
          /* track */
          TL.rect(ctx, TL.Settings.SLX, r.y - 5, TL.Settings.SLW, 10, '#0a1a20');
          TL.rect(ctx, TL.Settings.SLX, r.y - 5, TL.Settings.SLW * TL.S.settings[r.key], 10, '#7ef0c8');
          /* quarter ticks */
          for (var q = 1; q < 4; q++) {
            TL.rect(ctx, TL.Settings.SLX + TL.Settings.SLW * q / 4 - 1, r.y - 5, 1, 10, 'rgba(4,16,20,0.9)');
          }
          /* handle */
          var hx = TL.Settings.SLX + TL.Settings.SLW * TL.S.settings[r.key];
          TL.rect(ctx, TL.clamp(hx - 3, TL.Settings.SLX, TL.Settings.SLX + TL.Settings.SLW - 6), r.y - 9, 6, 18, '#d8b25a');
          TL.rect(ctx, TL.clamp(hx - 1, TL.Settings.SLX, TL.Settings.SLX + TL.Settings.SLW - 2), r.y - 9, 1, 18, 'rgba(255,240,200,0.5)');
          /* value readout */
          TL.text(ctx, String(Math.round(TL.S.settings[r.key] * 100)).padStart(3, '0'), 668, r.y - 3, 7, '#8fc0b0');
        } else {
          var on = r.key === 'mute' ? TL.S.settings.mute : r.key === 'shake' ? TL.S.settings.shake : false;
          var armed = r.key === 'reset' && TL.Settings.resetArm;
          TL.rect(ctx, 420, r.y - 13, 120, 26, armed ? 'rgba(60,26,10,0.9)' : on ? 'rgba(10,40,34,0.9)' : 'rgba(10,26,32,0.9)');
          ctx.strokeStyle = armed ? '#f0a050' : on ? 'rgba(126,240,200,0.7)' : 'rgba(90,140,128,0.45)';
          ctx.lineWidth = 1;
          ctx.strokeRect(420.5, r.y - 12.5, 119, 25);
          var lab = r.key === 'reset' ? (armed ? 'CONFIRM?' : 'CLICK ×2') : (on ? 'ON' : 'OFF');
          TL.text(ctx, lab, 480, r.y - 4, 8, armed ? '#f0a050' : on ? '#7ef0c8' : '#5a7a70', 'center');
        }
      }
      TL.text(ctx, 'M TOGGLES MUTE ANYWHERE · ESC TO RETURN', TL.W / 2, 500, 7, '#4a6a60', 'center');
      TL.staticOverlay(ctx, 0.06);
    }
  };

  /* ================= EPILOGUE ================= */
  TL.Epilogue = {
    idx: 0, t: 0,
    start: function () { TL.Epilogue.idx = 0; TL.Epilogue.t = 0; },
    update: function (dt) {
      TL.Epilogue.t += dt;
      var advance = TL.actHit() || TL.hit('space') || TL.mouse.clicked;
      if (advance && TL.Epilogue.t > 1.2) {
        TL.Epilogue.idx++;
        TL.Epilogue.t = 0;
        TL.audio.blip(520, 0.05, 0.1);
        if (TL.Epilogue.idx >= TL.D.EPILOGUE.length + 1) {
          TL.G.finishFinale();
        }
      }
      if (TL.hit('escape')) TL.G.finishFinale();
    },
    draw: function (ctx) {
      ctx.fillStyle = '#02060a'; ctx.fillRect(0, 0, TL.W, TL.H);
      var rr7 = TL.RNG(41);
      for (var i = 0; i < 110; i++) {
        ctx.globalAlpha = 0.2 + 0.8 * Math.abs(Math.sin(TL.Epilogue.t + i));
        ctx.fillStyle = i % 7 === 0 ? '#e8d0a0' : '#c8d8e8';
        ctx.fillRect(rr7() * TL.W | 0, rr7() * TL.H | 0, 2, 2);
      }
      ctx.globalAlpha = 1;
      /* signal wave from Mars to Earth */
      var t = (TL.Epilogue.t * 0.3) % 1;
      ctx.globalAlpha = (1 - t) * 0.5;
      ctx.strokeStyle = '#7ef0c8'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(TL.W - 180, TL.H - 160, 20 + t * 300, 0, Math.PI * 2); ctx.stroke();
      ctx.globalAlpha = 1;
      /* Mars */
      var mg3 = ctx.createRadialGradient(TL.W - 190, TL.H - 170, 5, TL.W - 180, TL.H - 160, 40);
      mg3.addColorStop(0, '#e8a070'); mg3.addColorStop(1, '#8a3f28');
      ctx.fillStyle = mg3;
      ctx.beginPath(); ctx.arc(TL.W - 180, TL.H - 160, 36, 0, Math.PI * 2); ctx.fill();
      /* Earth far side */
      var eg3 = ctx.createRadialGradient(170, 140, 5, 180, 150, 30);
      eg3.addColorStop(0, '#7ec8f8'); eg3.addColorStop(1, '#0a2a5a');
      ctx.fillStyle = eg3;
      ctx.beginPath(); ctx.arc(180, 150, 26, 0, Math.PI * 2); ctx.fill();
      /* text */
      var n = TL.D.EPILOGUE.length;
      if (TL.Epilogue.idx < n) {
        var lines = TL.wrap(ctx, TL.D.EPILOGUE[TL.Epilogue.idx], 620, 10);
        var alpha = Math.min(1, TL.Epilogue.t / 0.8);
        for (var L = 0; L < lines.length; L++) {
          TL.text(ctx, lines[L], TL.W / 2, 200 + L * 20, 10, TL.Epilogue.idx === 0 ? '#d8b25a' : '#c8e8dc', 'center', alpha);
        }
      } else {
        TL.panel(ctx, TL.W / 2 - 260, 190, 520, 150, { corner: '#7ef0c8' });
        TL.text(ctx, 'MISSION COMPLETE', TL.W / 2, 216, 14, '#7ef0c8', 'center');
        TL.text(ctx, 'HARDWARE DISCOVERED 12/12', TL.W / 2, 248, 9, '#d8b25a', 'center');
        TL.text(ctx, 'BEYOND THE RED PLANET — UNLOCKED', TL.W / 2, 272, 9, '#59c8f0', 'center');
        TL.text(ctx, 'THE ARCHIVE REMAINS OPEN. THANK YOU FOR LISTENING.', TL.W / 2, 300, 7, '#9fd8c8', 'center');
      }
      TL.text(ctx, 'E / CLICK TO CONTINUE', TL.W / 2, TL.H - 60, 7, '#3a5a52', 'center');
      TL.crt(ctx, TL.Epilogue.t);
      TL.staticOverlay(ctx, 0.05);
    }
  };

})(window.TL);
