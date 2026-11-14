/* ============================================================
   THE THINGS WE LEFT BEHIND — player.js
   Robot physics, animation, battery, interactions.
   ============================================================ */
'use strict';
(function (TL) {

  var Player = {};
  TL.Player = Player;

  Player.create = function (x) {
    return {
      x: x, y: TL.World.groundY(x) - 1,
      vx: 0, vy: 0,
      dir: 1, grounded: true,
      coyote: 0, jumpBuf: 0,
      anim: 'idle', animT: 0, phase: 0,
      blink: false, blinkT: 2,
      boostT: 0, boostV: 0,   /* rim-leap assist */
      battery: TL.S.battery || 100,
      stepT: 0,
      interact: null,       // nearby interactable
      interactT: 0,
      state: 'play',
      landT: 0,
      respawnT: 0,
      lowPowerT: 0,
      look: 0,
      waveT: 0
    };
  };

  TL.Player.createAt = function (y, x) {
    TL.Player.p = TL.Player.create(x);
    /* snap camera */
    var a = TL.World.area;
    TL.World.cam.x = TL.clamp(x - TL.W * 0.42, 0, a ? a.w - TL.W : 0);
    return TL.Player.p;
  };

  var MOVE = 152, ACCEL = 900, FRICT = 800, GRAV = 620, JUMPV = 305;

  Player.update = function (p, dt) {
    var W = TL.World, a = W.area;

    if (p.respawnT > 0) {
      p.respawnT -= dt;
      if (p.respawnT <= 0) Player.respawn(p);
      return;
    }

    var left = TL.left(), right = TL.right();
    var move = (right ? 1 : 0) - (left ? 1 : 0);
    var control = p.battery > 0 ? 1 : 0.4;   // low power = sluggish

    if (move !== 0) {
      p.vx += move * ACCEL * control * dt;
      p.dir = move;
    } else {
      var f = FRICT * dt * (p.grounded ? 1 : 0.35);
      if (p.vx > 0) p.vx = Math.max(0, p.vx - f); else p.vx = Math.min(0, p.vx + f);
    }
    p.vx = TL.clamp(p.vx, -MOVE * control, MOVE * control);

    /* jump */
    if (TL.jumpHit()) p.jumpBuf = 0.12;
    p.jumpBuf -= dt;
    p.coyote = p.grounded ? 0.1 : p.coyote - dt;
    if (p.jumpBuf > 0 && p.coyote > 0 && (p.battery > 5 || W.overPit(p.x))) {
      p.vy = -JUMPV;
      p.grounded = false;
      p.jumpBuf = 0; p.coyote = 0;
      TL.audio.jump();
      p.battery -= 0.6;
      /* rim leap assist: jumping beside a pit edge glides you across */
      for (var pi = 0; pi < a.pits.length; pi++) {
        var pt = a.pits[pi];
        var edge = p.dir > 0 ? pt.x : pt.x + pt.w;
        var d = (edge - p.x) * p.dir;
        if (d > -14 && d < 30 && W.groundY(p.x) < TL.FLOOR + 40) {
          p.boostT = 0.5;
          p.boostV = p.dir * 130;
          TL.audio.blip(560, 0.06, 0.09);
          break;
        }
      }
      /* inside a trench: hop with extra lift toward the nearest lip */
      if (W.overPit(p.x)) {
        p.vy = -(JUMPV + 30);
        for (pi = 0; pi < a.pits.length; pi++) {
          var pp = a.pits[pi];
          if (p.x > pp.x - 20 && p.x < pp.x + pp.w + 20) {
            var dl = p.x - pp.x, dr = (pp.x + pp.w) - p.x;
            var dir2 = dl < dr ? -1 : 1;
            var edge2 = dir2 > 0 ? pp.x + pp.w : pp.x;
            if ((edge2 - p.x) * dir2 < 40) {
              p.boostT = 0.5;
              p.boostV = dir2 * 140;
              TL.audio.blip(560, 0.06, 0.09);
            }
            break;
          }
        }
      }
    }
    if (!TL.keys['space'] && !TL.virt.jump && p.vy < -120) p.vy += GRAV * 0.9 * dt; // jump cut

    /* crater auto-jump: roll toward a crater edge and the rover leaps it
       on its own — you can no longer fall inside while driving */
    if (p.autoJ === undefined) p.autoJ = 0;
    p.autoJ -= dt;
    if (p.grounded && move !== 0 && p.autoJ <= 0) {
      for (var ai = 0; ai < a.pits.length; ai++) {
        var pt2 = a.pits[ai];
        var edge3 = p.dir > 0 ? pt2.x : pt2.x + pt2.w;
        var d3 = (edge3 - p.x) * p.dir;
        if (d3 > 4 && d3 < 38) {
          p.vy = -(JUMPV + 20);
          p.grounded = false;
          p.autoJ = 0.5;
          p.boostT = 0.5;
          p.boostV = p.dir * 130;
          TL.audio.jump();
          TL.audio.blip(560, 0.06, 0.09);
          break;
        }
      }
    }

    /* gravity */
    p.vy += GRAV * dt;
    p.vy = Math.min(p.vy, 560);

    /* horizontal move (rocks are scenery now — the rover simply passes
       behind them; no collision, they are drawn in front) */
    var prevX = p.x;
    var boost = 0;
    if (p.boostT > 0) { p.boostT -= dt; p.boostV *= Math.max(0, 1 - dt * 4); boost = p.boostV; }
    p.x += (p.vx + boost) * dt;
    /* trench walls: block horizontal movement into ground far above the feet */
    if (W.groundY(p.x) < p.y - 24) { p.x = prevX; p.vx = 0; }
    p.x = TL.clamp(p.x, 16, a.w - 16);

    /* vertical */
    var prevY = p.y;
    p.y += p.vy * dt;

    var wasGrounded = p.grounded;
    p.grounded = false;

    /* heightmap ground (snap only over small steps — walls must block, not teleport) */
    if (!p.grounded && p.vy >= 0) {
      var gy = W.groundY(p.x);
      if (gy < 600 && p.y >= gy && p.y - gy <= 12) {
        p.y = gy; p.vy = 0; p.grounded = true;
        if (!wasGrounded) {
          TL.audio.land();
          p.landT = 0.18;
          if (TL.S.settings.shake) TL.World.cam.shake = 3;
          p.battery -= 0.15;
        }
      }
    }
    /* fell into pit */
    if (p.y > 620) {
      p.respawnT = 0.7;
      TL.audio.deny();
      TL.audio.static(0.5, 0.08);
      TL.toast('NAVIGATION FAULT — RETURNING TO CHECKPOINT', '#f0a050');
      if (TL.S.settings.shake) TL.World.cam.shake = 6;
      return;
    }

    /* battery drain */
    var drain = 0;
    if (Math.abs(p.vx) > 4) drain += 0.55 * dt;
    drain += 0.06 * dt;
    /* charging at stations */
    var charging = false, chargeIdx = -1;
    var i;
    for (i = 0; i < a.stations.length; i++) {
      if (TL.dist(p.x, p.y, a.stations[i].x, W.groundY(a.stations[i].x)) < 52) {
        charging = true; chargeIdx = i;
        p.battery = Math.min(100, p.battery + 14 * dt);
        if (Math.floor(p.battery) % 10 === 0 && !p._chargeBeeped) { TL.audio.blip(980, 0.03, 0.05); p._chargeBeeped = true; }
        if (Math.floor(p.battery) % 10 !== 0) p._chargeBeeped = false;
      }
    }
    if (!charging) p._chargeBeeped = false;
    p.battery = Math.max(0, p.battery - drain);
    TL.S.battery = Math.round(p.battery);
    if (p.battery < 20) {
      p.lowPowerT += dt;
      if (p.lowPowerT > 6) { p.lowPowerT = 4.5; TL.toast('LOW POWER — FIND A SOLAR STATION', '#f0a050'); TL.audio.deny(); }
    } else p.lowPowerT = 0;

    /* battery fully depleted: return the rover to its last checkpoint */
    if (p.battery <= 0 && p.respawnT <= 0) {
      p.respawnT = 0.9;
      TL.toast('POWER DEPLETED — RETURNING TO CHECKPOINT', '#f0a050');
      TL.audio.deny();
      TL.audio.static(0.6, 0.1);
      if (TL.S.settings.shake) TL.World.cam.shake = 6;
      return;
    }

    /* animation state */
    if (!p.grounded) p.anim = 'jump';
    else if (p.landT > 0) { p.landT -= dt; p.anim = 'land'; }
    else if (p.interactT > 0) { p.interactT -= dt; p.anim = 'interact'; }
    else if (Math.abs(p.vx) > 12) p.anim = 'walk';
    else p.anim = 'idle';

    p.animT += dt;
    if (p.anim === 'walk') {
      p.phase = (p.phase + dt * (Math.abs(p.vx) / MOVE) * 2.4) % 1;
      p.stepT -= dt * Math.abs(p.vx) * 0.05;
      if (p.stepT <= 0) { TL.audio.step(); p.stepT = 2.2; }
    } else if (p.anim === 'idle') p.phase = (p.phase + dt * 0.4) % 1;
    else if (p.anim === 'interact') p.phase = (p.phase + dt * 2.2) % 1;

    /* blink */
    p.blinkT -= dt;
    if (p.blinkT <= 0) { p.blink = true; if (p.blinkT < -0.12) { p.blink = false; p.blinkT = 2 + Math.random() * 3; } }

    /* eye look */
    p.look = TL.lerp(p.look, move !== 0 ? move * 0.8 : p.dir * 0.5, dt * 6);

    /* interactions */
    p.interact = Player.findInteract(p);

    /* collectibles */
    for (i = 0; i < a.items.length; i++) {
      var it = a.items[i];
      if (Math.abs(p.x - it.x) < 26 && Math.abs(p.y - (W.groundY(it.x) - 10)) < 40) {
        TL.S.items.push(it.id);
        TL.toast('RECOVERED: ' + it.label, '#59c8f0', true);
        TL.toast(it.text, '#9fd8c8', true);
        TL.audio.chime(1.5);
        a.items.splice(i, 1);
        TL.save();
        break;
      }
    }

    /* checkpoints: nearest station or area entry */
    if (charging) { TL.S.spawnX = a.stations[chargeIdx].x; TL.S.current = a.def.id; }

    /* camera follow */
    var targetCam = TL.clamp(p.x - TL.W * 0.42 + p.dir * 40, 0, a.w - TL.W);
    W.cam.x = TL.lerp(W.cam.x, targetCam, Math.min(1, dt * 5));

    /* exits */
    for (i = 0; i < a.exits.length; i++) {
      var e = a.exits[i];
      if (Math.abs(p.x - e.x) < 26) {
        TL.G.travel(e.to, e.dir);
        return;
      }
    }
    TL.save();
  };

  Player.findInteract = function (p) {
    var a = TL.World.area;
    /* characters */
    for (var i = 0; i < a.chars.length; i++) {
      var c = a.chars[i];
      if (Math.abs(p.x - c.x) < 56) return { kind: 'char', ref: c, label: c.done ? 'TALK AGAIN [E]' : 'ESTABLISH CONTACT [E]' };
    }
    /* relay beacon special: after 12/12 not needed, relay char handles */
    return null;
  };

  Player.interact = function (p) {
    if (p.respawnT > 0) return;
    if (p.interact && p.interact.kind === 'char') {
      p.interactT = 1.2;
      TL.Dialogue.start(p.interact.ref.id);
    }
  };

  Player.respawn = function (p) {
    var a = TL.World.area;
    var sx = (TL.S.spawnX !== null && TL.S.current === a.def.id) ? TL.S.spawnX : (a.def.id === 'ares' ? 120 : 120);
    p.x = sx; p.y = TL.World.groundY(sx) - 1;
    p.vx = 0; p.vy = 0;
    p.battery = Math.max(p.battery, 30);
  };

  Player.draw = function (ctx, p, camX, camY) {
    var sx = p.x - camX, sy = p.y - camY;
    TL.drawRobot(ctx, sx, sy, p.dir, p.anim, p.phase, {
      look: p.look, blink: p.blink, lowPower: p.battery > 0 && p.battery < 18
    });
    /* interaction prompt */
    if (p.interact) {
      var ref = p.interact.ref;
      var bob = Math.sin(TL.World.area.t * 0.005) * 2;
      var bx = (p.interact.kind === 'char' ? ref.x : ref.x) - camX;
      var by = TL.World.groundY(ref.x) - 52 + bob;
      ctx.save();
      ctx.font = TL.font(9);
      var label = p.interact.label;
      var tw = ctx.measureText(label).width;
      TL.panel(ctx, bx - tw / 2 - 8, by - 6, tw + 16, 20, { corner: '#7ef0c8' });
      TL.text(ctx, label, bx, by, 9, '#7ef0c8', 'center');
      ctx.restore();
    }
    /* respawn static */
    if (p.respawnT > 0) TL.staticOverlay(ctx, 0.5);
  };

})(window.TL);
