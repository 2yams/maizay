/* ============================================================
   THE THINGS WE LEFT BEHIND — audio.js
   Fully synthesized soundscape (no external files):
   wind, generative ambient music, sfx, character voices
   ============================================================ */
'use strict';
(function (TL) {

  var A = {};
  TL.audio = A;

  A.ready = false;
  A.ctx = null;
  A.master = null; A.musicG = null; A.sfxG = null; A.ambG = null;

  A.unlock = function () {
    if (A.ready) { if (A.ctx.state === 'suspended') A.ctx.resume(); return; }
    try {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      A.ctx = new AC();
      A.master = A.ctx.createGain();
      A.musicG = A.ctx.createGain();
      A.sfxG = A.ctx.createGain();
      A.ambG = A.ctx.createGain();
      A.musicG.connect(A.master); A.sfxG.connect(A.master); A.ambG.connect(A.master);
      A.master.connect(A.ctx.destination);
      A.ready = true;
      A.applySettings();
      A.startWind();
      A.startMusic();
    } catch (e) { }
  };

  A.applySettings = function () {
    if (!A.ready) return;
    var s = TL.S.settings;
    var m = s.mute ? 0 : s.vol;
    A.master.gain.value = m;
    A.musicG.gain.value = s.music;
    A.sfxG.gain.value = s.sfx;
    A.ambG.gain.value = 0.5;
  };

  /* ---------- helpers ---------- */
  function env(g, t0, a, peak, d, sustain) {
    g.gain.cancelScheduledValues(t0);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(Math.max(peak, 0.001), t0 + a);
    if (d) g.gain.exponentialRampToValueAtTime(Math.max(sustain || 0.0001, 0.0001), t0 + a + d);
  }

  /* ---------- wind ---------- */
  A.windLevel = 0.4;
  A.startWind = function () {
    var c = A.ctx, len = c.sampleRate * 3;
    var buf = c.createBuffer(1, len, c.sampleRate);
    var d = buf.getChannelData(0);
    for (var i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    var src = c.createBufferSource(); src.buffer = buf; src.loop = true;
    var f = c.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 320; f.Q.value = 0.6;
    var f2 = c.createBiquadFilter(); f2.type = 'lowpass'; f2.frequency.value = 900;
    var g = c.createGain(); g.gain.value = A.windLevel * 0.16;
    /* slow gust LFO */
    var lfo = c.createOscillator(); lfo.frequency.value = 0.07;
    var lg = c.createGain(); lg.gain.value = A.windLevel * 0.09;
    lfo.connect(lg); lg.connect(g.gain);
    var lfo2 = c.createOscillator(); lfo2.frequency.value = 0.13;
    var lg2 = c.createGain(); lg2.gain.value = 140;
    lfo2.connect(lg2); lg2.connect(f.frequency);
    src.connect(f); f.connect(f2); f2.connect(g); g.connect(A.ambG);
    src.start(); lfo.start(); lfo2.start();
    A.windGain = g;
  };
  A.setWind = function (v) { if (A.windGain) A.windGain.gain.value = v * 0.16; };

  /* ---------- generative music ---------- */
  A.mood = 'explore'; // explore | calm | finale | title
  A._beat = 0;
  A.startMusic = function () {
    A.nextBeat = A.ctx.currentTime + 0.2;
    setInterval(A.schedule, 120);
  };
  A.scales = {
    explore: [110, 130.81, 146.83, 174.61, 196, 220, 261.63, 293.66],
    calm: [98, 116.54, 146.83, 164.81, 196, 233.08],
    finale: [87.31, 110, 130.81, 146.83, 174.61, 220, 261.63],
    title: [110, 146.83, 164.81, 196, 220, 293.66]
  };
  A.padT = 0;
  A.schedule = function () {
    if (!A.ready || A.ctx.state !== 'running') return;
    var t = A.ctx.currentTime;
    /* pad chord every ~8 s */
    if (t > A.padT) {
      A.padT = t + 9 + Math.random() * 4;
      var roots = { explore: [55, 82.41], calm: [49, 73.42], finale: [43.65, 65.41], title: [55, 82.41] };
      var r = roots[A.mood];
      for (var i = 0; i < r.length; i++) {
        var o = A.ctx.createOscillator(), g = A.ctx.createGain();
        o.type = 'triangle'; o.frequency.value = r[i];
        var o2 = A.ctx.createOscillator(); o2.type = 'sine'; o2.frequency.value = r[i] * 1.503; // fifth
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(0.055, t + 3.5);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 10);
        o.connect(g); o2.connect(g); g.connect(A.musicG);
        o.start(t); o2.start(t); o.stop(t + 10.5); o2.stop(t + 10.5);
      }
    }
    /* sparse melody notes */
    var interval = { explore: 1.9, calm: 3.4, finale: 2.6, title: 2.2 }[A.mood];
    if (t >= A.nextBeat) {
      A.nextBeat = t + interval + Math.random() * interval;
      if (Math.random() < 0.85) {
        var sc = A.scales[A.mood];
        var f = sc[(Math.random() * sc.length) | 0] * (Math.random() < 0.3 ? 2 : 1);
        A.note(f, t, 0.05, 1.8, 'sine', true, Math.random() < 0.4 ? 1.002 : 1);
      }
    }
  };
  A.note = function (freq, t, vol, dur, type, echo, detune) {
    var c = A.ctx;
    var o = c.createOscillator(), g = c.createGain();
    o.type = type || 'sine'; o.frequency.value = freq * (detune || 1);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.03);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(A.musicG);
    if (echo) {
      var d = c.createDelay(); d.delayTime.value = 0.42;
      var dg = c.createGain(); dg.gain.value = 0.35;
      g.connect(d); d.connect(dg); dg.connect(d); dg.connect(A.musicG);
    }
    o.start(t); o.stop(t + dur + 0.1);
  };

  /* ---------- sfx ---------- */
  A.blip = function (freq, vol, dur, type) {
    if (!A.ready) return;
    var c = A.ctx, t = c.currentTime;
    var o = c.createOscillator(), g = c.createGain();
    o.type = type || 'square'; o.frequency.setValueAtTime(freq, t);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol || 0.12, t + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, t + (dur || 0.07));
    o.connect(g); g.connect(A.sfxG);
    o.start(t); o.stop(t + (dur || 0.07) + 0.02);
  };
  A.ui = function () { A.blip(880, 0.05, 0.05); };
  A.uiBack = function () { A.blip(440, 0.05, 0.06); };
  A.confirm = function () { A.blip(660, 0.08, 0.07); setTimeout(function () { A.blip(990, 0.08, 0.09); }, 70); };
  A.jump = function () {
    if (!A.ready) return; var c = A.ctx, t = c.currentTime;
    var o = c.createOscillator(), g = c.createGain();
    o.type = 'square'; o.frequency.setValueAtTime(300, t); o.frequency.exponentialRampToValueAtTime(620, t + 0.1);
    g.gain.setValueAtTime(0.06, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.12);
    o.connect(g); g.connect(A.sfxG); o.start(t); o.stop(t + 0.14);
  };
  A.land = function () {
    if (!A.ready) return; var c = A.ctx, t = c.currentTime;
    var buf = c.createBuffer(1, 2200, c.sampleRate), d = buf.getChannelData(0);
    for (var i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
    var s = c.createBufferSource(); s.buffer = buf;
    var f = c.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 380;
    var g = c.createGain(); g.gain.value = 0.12;
    s.connect(f); f.connect(g); g.connect(A.sfxG); s.start(t);
  };
  A.step = function () {
    if (!A.ready) return; var c = A.ctx, t = c.currentTime;
    var buf = c.createBuffer(1, 900, c.sampleRate), d = buf.getChannelData(0);
    for (var i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length) * 0.5;
    var s = c.createBufferSource(); s.buffer = buf;
    var f = c.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 500 + Math.random() * 240; f.Q.value = 1.4;
    var g = c.createGain(); g.gain.value = 0.1;
    s.connect(f); f.connect(g); g.connect(A.sfxG); s.start(t);
  };
  A.static = function (dur, vol) {
    if (!A.ready) return; var c = A.ctx, t = c.currentTime;
    dur = dur || 0.3;
    var buf = c.createBuffer(1, c.sampleRate * dur, c.sampleRate), d = buf.getChannelData(0);
    for (var i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1);
    var s = c.createBufferSource(); s.buffer = buf;
    var f = c.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = 1200;
    var g = c.createGain(); g.gain.value = vol || 0.05;
    g.gain.setValueAtTime(g.gain.value, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(f); f.connect(g); g.connect(A.sfxG); s.start(t);
  };
  A.chime = function (base) {
    if (!A.ready) return; var c = A.ctx, t = c.currentTime;
    var notes = [523.25, 659.26, 783.99, 1046.5];
    notes.forEach(function (f, i) {
      var o = c.createOscillator(), g = c.createGain();
      o.type = 'triangle'; o.frequency.value = f * (base || 1);
      g.gain.setValueAtTime(0.0001, t + i * 0.09);
      g.gain.exponentialRampToValueAtTime(0.09, t + i * 0.09 + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t + i * 0.09 + 0.5);
      o.connect(g); g.connect(A.sfxG); o.start(t + i * 0.09); o.stop(t + i * 0.09 + 0.55);
    });
  };
  A.sting = function () { /* discovery sting */
    A.chime(0.5); A.static(0.4, 0.04);
    setTimeout(function () { A.chime(1); }, 350);
  };
  A.deny = function () { A.blip(180, 0.08, 0.12, 'sawtooth'); };
  A.rumble = function (dur) {
    if (!A.ready) return; var c = A.ctx, t = c.currentTime;
    var buf = c.createBuffer(1, c.sampleRate * dur, c.sampleRate), d = buf.getChannelData(0);
    for (var i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1);
    var s = c.createBufferSource(); s.buffer = buf;
    var f = c.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 120;
    var g = c.createGain(); g.gain.value = 0.35;
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.3, t + 0.4);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(f); f.connect(g); g.connect(A.sfxG); s.start(t);
  };
  A.power = function () {
    if (!A.ready) return;
    var c = A.ctx, t = c.currentTime;
    var o = c.createOscillator(), g = c.createGain();
    o.type = 'sawtooth'; o.frequency.setValueAtTime(80, t); o.frequency.exponentialRampToValueAtTime(520, t + 0.5);
    g.gain.setValueAtTime(0.03, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.55);
    o.connect(g); g.connect(A.sfxG); o.start(t); o.stop(t + 0.6);
  };

  /* character voices: small chirp sequences, unique pitch/pattern */
  A.voice = function (charId, mood) {
    if (!A.ready) return;
    var specs = {
      player: [740, 0.09],
      sojourner: [1050, 0.07], pathfinder: [520, 0.09],
      spirit: [620, 0.08], opportunity: [820, 0.07],
      viking1: [380, 0.11], viking2: [420, 0.11],
      phoenix: [900, 0.06], insight: [300, 0.13],
      ingenuity: [1250, 0.05], perseverance: [700, 0.08], curiosity: [660, 0.08],
      relay: [240, 0.14]
    };
    var s = specs[charId] || [600, 0.08];
    var n = 2 + ((Math.random() * 3) | 0);
    for (var i = 0; i < n; i++) {
      (function (i) {
        setTimeout(function () {
          A.blip(s[0] * (0.92 + Math.random() * 0.16) * (mood === 'low' ? 0.8 : 1), 0.045, s[1], 'square');
        }, i * (60 + Math.random() * 70));
      })(i);
    }
  };

})(window.TL);
