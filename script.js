'use strict';
const CONFIG = {
  friendName: 'My Online Friend',  
  memories: [
    {
      animation: 'meet',
      title: 'Where It All Began',
      message: 'Remember the day we first became friends? I had no idea how much my life was about to change.'
    },
    {
      animation: 'laugh',
      title: 'Laughing Until We Cried',
      message: 'Some of my happiest moments are just us laughing about nothing at all.'
    },
    {
      animation: 'seasons',
      title: 'Through Every Season',
      message: 'In the good days and the hard ones, you always showed up. Thank you for that.'
    }
  ],
  fireworksMessage: 'May every wish you make come true.',   
  giftTitle: 'A Special Message For You',
  giftMessage: 'Thank you for being the kind of friend who makes every day brighter. You deserve all the happiness in the world, today and always. This little gift is just a tiny piece of how much you mean to me.',
  senderName: 'Arceus',
  letterGreeting: 'Dear {name},',
  letterBody: "Happy Birthday! Today is all about you, and I wanted to make something as special as you are.\n\n"
            + "Thank you for every laugh, every late-night talk, and every moment you stood by me. You make my world brighter just by being in it.\n\n"
            + "I hope this year brings you endless joy, beautiful surprises, and every wish you have ever made. You deserve the very best.\n\n"
            + "I am so grateful to have you as my friend.",
  letterSignature: 'With all my love, technically i dont have but still just for fun,',
  letterTwist: [
    "I'm Soul Emperor, also known as Arceus, the destroyer of 9th dimension, the conqueror of the abyss, hereby officially announce the end of our friendship because you are too annoying, hmph!",
    "I hope we never ever meet again, hehehe... bye bye, good bye!"
  ],

  musicFile: 'assets/music/birthday.mp3',
  candleCount: 7,              // number of candles on the cake (Scene 3)
  heartEveryMs: 650,           // how often a floating heart appears (LOWER = more hearts)
  starDensity: 4500,           // LOWER number = MORE stars (1 star per N pixels)
  maxStars: 450,               // never draw more than this many
  minStars: 180                // never draw fewer than this many
};

const Sky = (() => {
  const canvas = document.getElementById('sky');
  const ctx = canvas.getContext('2d');

  let width = 0, height = 0;
  let stars = [];          // twinkling background stars
  let dust = [];           // slow floating golden particles
  let sparks = [];         // short-lived particles from clicks
  let shooting = null;     // the current shooting star (or null)
  let nextShootingAt = 0;  // time (ms) when the next one appears
  let lastTime = 0;
  let running = true;

  
  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2); // cap at 2 for performance
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    buildStars();
  }

  /* Create all the stars. More screen area = more stars. */
  function buildStars() {
    const count = Math.round(
      Math.min(CONFIG.maxStars, Math.max(CONFIG.minStars, (width * height) / CONFIG.starDensity))
    );

    stars = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 1.3 + 0.25,            // radius
      phase: Math.random() * Math.PI * 2,       // so stars don't twinkle in sync
      speed: 0.6 + Math.random() * 2.2,         // twinkle speed
      warm: Math.random() < 0.25                // 25% of stars are slightly golden
    }));

    const dustCount = width < 600 ? 28 : 55;
    dust = Array.from({ length: dustCount }, () => makeDust(true));
  }

  /* One floating golden particle. "anywhere" = start at a random height. */
  function makeDust(anywhere) {
    return {
      x: Math.random() * width,
      y: anywhere ? Math.random() * height : height + 10,
      r: Math.random() * 1.8 + 0.8,
      vy: 8 + Math.random() * 22,               // pixels per second, upward
      sway: 10 + Math.random() * 25,            // sideways wiggle
      swaySpeed: 0.4 + Math.random() * 0.8,
      phase: Math.random() * Math.PI * 2,
      baseX: 0
    };
  }

  /* Sparkle burst when the user clicks */
  function burst(x, y, amount = 40) {
    for (let i = 0; i < amount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 40 + Math.random() * 260;
      sparks.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0,
        maxLife: 0.8 + Math.random() * 1.0,
        r: Math.random() * 2 + 0.8
      });
    }
  }

  /* Launch a shooting star from the upper part of the sky */
  function spawnShootingStar() {
    const startX = Math.random() * width * 0.8 + width * 0.1;
    shooting = {
      x: startX,
      y: Math.random() * height * 0.35,
      vx: (Math.random() < 0.5 ? -1 : 1) * (500 + Math.random() * 300),
      vy: 250 + Math.random() * 200,
      life: 0,
      maxLife: 0.9
    };
  }

  /* Draw everything for one frame. t = time in ms, dt = seconds since last frame */
  function frame(t) {
    if (!running) return;
    const dt = Math.min((t - lastTime) / 1000, 0.05); // clamp so tab-switching doesn't cause jumps
    lastTime = t;
    const sec = t / 1000;

    ctx.clearRect(0, 0, width, height);

    // --- Twinkling stars ---
    for (const s of stars) {
      const tw = 0.5 + 0.5 * Math.sin(sec * s.speed + s.phase);  // 0..1
      const alpha = 0.2 + 0.8 * tw;
      ctx.fillStyle = s.warm
        ? `rgba(255, 228, 160, ${alpha})`
        : `rgba(255, 250, 240, ${alpha})`;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r * (0.8 + 0.4 * tw), 0, Math.PI * 2);
      ctx.fill();

      // soft halo around the bigger stars
      if (s.r > 1.1) {
        ctx.fillStyle = `rgba(255, 235, 190, ${alpha * 0.12})`;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r * 4, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // --- Floating golden dust ---
    for (let i = 0; i < dust.length; i++) {
      const d = dust[i];
      d.y -= d.vy * dt;
      const x = d.x + Math.sin(sec * d.swaySpeed + d.phase) * d.sway;
      if (d.y < -10) dust[i] = makeDust(false);   // recycle when it leaves the top

      const fade = Math.min(1, Math.max(0, d.y / (height * 0.2)));   // fade out near top
      const a = (0.35 + 0.35 * Math.sin(sec * 1.5 + d.phase)) * fade;
      ctx.fillStyle = `rgba(232, 201, 122, ${a * 0.25})`;
      ctx.beginPath(); ctx.arc(x, d.y, d.r * 4, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = `rgba(255, 224, 150, ${a + 0.2})`;
      ctx.beginPath(); ctx.arc(x, d.y, d.r, 0, Math.PI * 2); ctx.fill();
    }

    // --- Click sparkles ---
    for (let i = sparks.length - 1; i >= 0; i--) {
      const p = sparks[i];
      p.life += dt;
      if (p.life >= p.maxLife) { sparks.splice(i, 1); continue; }
      p.vx *= 0.97; p.vy = p.vy * 0.97 + 60 * dt;        // slow down + gentle gravity
      p.x += p.vx * dt; p.y += p.vy * dt;
      const a = 1 - p.life / p.maxLife;
      ctx.fillStyle = `rgba(255, 220, 140, ${a * 0.25})`;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r * 3.5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = `rgba(255, 244, 205, ${a})`;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
    }

    // --- Shooting star ---
    if (!shooting && t > nextShootingAt) spawnShootingStar();
    if (shooting) {
      shooting.life += dt;
      shooting.x += shooting.vx * dt;
      shooting.y += shooting.vy * dt;
      const k = 1 - shooting.life / shooting.maxLife;
      if (k <= 0) {
        shooting = null;
        nextShootingAt = t + 4000 + Math.random() * 6000;   // next one in 4-10 seconds
      } else {
        const tailX = shooting.x - shooting.vx * 0.12;
        const tailY = shooting.y - shooting.vy * 0.12;
        const g = ctx.createLinearGradient(shooting.x, shooting.y, tailX, tailY);
        g.addColorStop(0, `rgba(255, 245, 215, ${k})`);
        g.addColorStop(1, 'rgba(255, 245, 215, 0)');
        ctx.strokeStyle = g;
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(shooting.x, shooting.y);
        ctx.lineTo(tailX, tailY);
        ctx.stroke();
      }
    }

    requestAnimationFrame(frame);
  }

  /* Start the sky */
  function start() {
    resize();
    nextShootingAt = performance.now() + 3500;
    lastTime = performance.now();
    requestAnimationFrame(frame);

    window.addEventListener('resize', resize);

    // Pause drawing when the tab is hidden (saves battery)
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        running = false;
      } else {
        running = true;
        lastTime = performance.now();
        requestAnimationFrame(frame);
      }
    });
  }

  return { start, burst };
})();

const Scenes = (() => {
  let current = 'scene-intro';
  const enterHooks = {};   // functions to run when a scene appears
  const leaveHooks = {};   // functions to run when a scene is left

  /* Register code to run when a scene appears / disappears */
  function onEnter(id, fn) { enterHooks[id] = fn; }
  function onLeave(id, fn) { leaveHooks[id] = fn; }

  function go(id) {
    const next = document.getElementById(id);
    if (!next || id === current) return;

    const old = document.getElementById(current);
    old.classList.remove('active');

    if (leaveHooks[current]) leaveHooks[current]();

    // small pause so the old scene fades before the new one arrives
    setTimeout(() => {
      next.classList.add('active');
      next.focus({ preventScroll: true });
      if (enterHooks[id]) enterHooks[id]();
    }, 500);

    current = id;
  }

  function getCurrent() { return current; }

  return { go, getCurrent, onEnter, onLeave };
})();

const MemoryArt = (() => {
  const TAU = Math.PI * 2;
  const rand = (a, b) => a + Math.random() * (b - a);
  const clamp01 = (v) => Math.max(0, Math.min(1, v));
  const smooth = (v) => { v = clamp01(v); return v * v * (3 - 2 * v); };   // gentle ease in/out
  const lerp = (a, b, k) => a + (b - a) * k;
  const mix = (a, b, k) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];
  const rgba = (c, a) => `rgba(${Math.round(c[0])},${Math.round(c[1])},${Math.round(c[2])},${a})`;

  const GOLD = [232, 201, 122];
  const CREAM = [255, 240, 194];

  /* A soft round glow */
  function glow(ctx, x, y, r, color, alpha) {
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, rgba(color, alpha));
    g.addColorStop(1, rgba(color, 0));
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
  }

  /* Random twinkling stars for a background */
  function makeStars(W, H, n) {
    return Array.from({ length: n }, () => ({
      x: rand(0, W), y: rand(0, H), r: rand(0.4, 1.3), ph: rand(0, TAU), sp: rand(0.8, 2.4)
    }));
  }

  /* Night-sky background with twinkling stars */
  function backdrop(ctx, W, H, stars, t, top = [18, 30, 78], bot = [4, 7, 20], starAlpha = 1) {
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, rgba(top, 1));
    g.addColorStop(1, rgba(bot, 1));
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
    for (const s of stars) {
      const a = (0.25 + 0.75 * (0.5 + 0.5 * Math.sin(t * s.sp + s.ph))) * starAlpha;
      ctx.fillStyle = rgba(CREAM, a);
      ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, TAU); ctx.fill();
    }
  }

  /* Heart outline path (s = size) */
  function heartPath(ctx, x, y, s) {
    ctx.beginPath();
    ctx.moveTo(x, y + s * 0.9);
    ctx.bezierCurveTo(x - s * 1.3, y + s * 0.1, x - s * 0.7, y - s * 0.9, x, y - s * 0.35);
    ctx.bezierCurveTo(x + s * 0.7, y - s * 0.9, x + s * 1.3, y + s * 0.1, x, y + s * 0.9);
    ctx.closePath();
  }

  function meet(W, H) {
    const stars = makeStars(W, H, 45);
    const cx = W / 2, cy = H * 0.46;
    const CYCLE = 11;                                  // seconds per loop
    const colA = GOLD, colB = [190, 215, 255];
    let trailA = [], trailB = [], sparks = [], burst = false, lastCycle = -1;

    /* Where are the two lights at second p of the loop? */
    function positions(p) {
      if (p < 4.2) {                                   // phase 1: travelling toward each other
        const u = smooth(p / 4.2);
        const wob = Math.sin(u * Math.PI * 2) * W * 0.14 * (1 - u);   // curvy path
        return {
          a: { x: lerp(W * 0.12, cx, u) + wob, y: lerp(H * 0.82, cy, u) - wob * 0.5 },
          b: { x: lerp(W * 0.88, cx, u) - wob, y: lerp(H * 0.18, cy, u) + wob * 0.5 }
        };
      }
      const k = smooth((p - 4.2) / 1.2);               // phase 2: orbiting each other
      const ang = (p - 4.2) * 1.7;
      const r = W * 0.12 * k;
      return {
        a: { x: cx + Math.cos(ang) * r, y: cy + Math.sin(ang) * r },
        b: { x: cx - Math.cos(ang) * r, y: cy - Math.sin(ang) * r }
      };
    }

    return function draw(ctx, t, dt) {
      const cyc = Math.floor(t / CYCLE);
      const p = t - cyc * CYCLE;
      if (cyc !== lastCycle) { lastCycle = cyc; trailA = []; trailB = []; sparks = []; burst = false; }

      backdrop(ctx, W, H, stars, t);
      const fade = smooth(p / 0.8) * (1 - smooth((p - (CYCLE - 1)) / 1));
      const pos = positions(p);

      // glowing trails behind each light
      trailA.push({ x: pos.a.x, y: pos.a.y });
      trailB.push({ x: pos.b.x, y: pos.b.y });
      if (trailA.length > 42) { trailA.shift(); trailB.shift(); }
      for (const [trail, col] of [[trailA, colA], [trailB, colB]]) {
        trail.forEach((pt, i) => {
          const k = i / trail.length;
          ctx.fillStyle = rgba(col, k * 0.55 * fade);
          ctx.beginPath(); ctx.arc(pt.x, pt.y, 0.8 + k * 3.2, 0, TAU); ctx.fill();
        });
      }

      // the moment they meet: flash + sparkles
      if (!burst && p >= 4.2) {
        burst = true;
        for (let i = 0; i < 40; i++) {
          const a = rand(0, TAU), s = rand(30, 150);
          sparks.push({ x: cx, y: cy, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 0, max: rand(0.8, 1.6) });
        }
      }
      const flash = clamp01(1 - Math.abs(p - 4.2) / 0.7);
      if (flash > 0) glow(ctx, cx, cy, W * 0.5, CREAM, flash * 0.7);

      // glowing heart in the middle
      const hk = smooth((p - 5) / 1.5) * (1 - smooth((p - (CYCLE - 1.3)) / 1));
      if (hk > 0) {
        const pulse = 1 + Math.sin(t * 4) * 0.07;
        glow(ctx, cx, cy, W * 0.3, GOLD, 0.18 * hk);
        heartPath(ctx, cx, cy - 2, W * 0.06 * pulse);
        ctx.fillStyle = rgba(GOLD, 0.16 * hk); ctx.fill();
        ctx.strokeStyle = rgba(CREAM, 0.9 * hk); ctx.lineWidth = 2; ctx.stroke();
      }

      // the two lights
      for (const [pt, col] of [[pos.a, colA], [pos.b, colB]]) {
        glow(ctx, pt.x, pt.y, 26, col, 0.5 * fade);
        ctx.fillStyle = rgba(CREAM, fade);
        ctx.beginPath(); ctx.arc(pt.x, pt.y, 4.5, 0, TAU); ctx.fill();
      }

      // sparkles
      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i];
        s.life += dt;
        if (s.life >= s.max) { sparks.splice(i, 1); continue; }
        s.vx *= 0.97; s.vy *= 0.97;
        s.x += s.vx * dt; s.y += s.vy * dt;
        ctx.fillStyle = rgba(CREAM, 1 - s.life / s.max);
        ctx.beginPath(); ctx.arc(s.x, s.y, 1.7, 0, TAU); ctx.fill();
      }
    };
  }

  function laugh(W, H) {
    const stars = makeStars(W, H, 35);
    const faces = [
      { x: W * 0.3, y: H * 0.6, r: W * 0.16, ph: 0 },
      { x: W * 0.7, y: H * 0.5, r: W * 0.19, ph: 1.3 }
    ];
    const WORDS = ['ha', 'HA!', 'ha ha', 'hehe', 'HAHA'];
    let drops = [], pops = [], dropTimer = 0, popTimer = 0;

    const bounceOf = (f, t) => -Math.abs(Math.sin(t * 3.2 + f.ph)) * H * 0.045;

    /* One laughing face */
    function drawFace(ctx, f, t) {
      const r = f.r;
      ctx.save();
      ctx.translate(f.x, f.y + bounceOf(f, t));
      ctx.rotate(Math.sin(t * 7 + f.ph) * 0.09);               // shaking with laughter
      glow(ctx, 0, 0, r * 2.1, GOLD, 0.2);

      // head
      const g = ctx.createRadialGradient(-r * 0.3, -r * 0.3, r * 0.1, 0, 0, r);
      g.addColorStop(0, 'rgba(255,240,194,0.28)');
      g.addColorStop(1, 'rgba(232,201,122,0.08)');
      ctx.fillStyle = g;
      ctx.strokeStyle = rgba(GOLD, 1);
      ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.fill(); ctx.stroke();

      // blushing cheeks
      ctx.fillStyle = 'rgba(244,160,160,0.35)';
      ctx.beginPath(); ctx.arc(-r * 0.58, r * 0.2, r * 0.16, 0, TAU); ctx.fill();
      ctx.beginPath(); ctx.arc(r * 0.58, r * 0.2, r * 0.16, 0, TAU); ctx.fill();

      // happy closed eyes  ^ ^
      ctx.lineWidth = 3; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.arc(-r * 0.36, -r * 0.1, r * 0.15, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke();
      ctx.beginPath(); ctx.arc(r * 0.36, -r * 0.1, r * 0.15, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke();

      // big open laughing mouth (opens and closes quickly)
      const open = 0.55 + 0.45 * (0.5 + 0.5 * Math.sin(t * 11 + f.ph));
      const top = r * 0.1;
      const depth = r * (0.12 + 0.5 * open);
      ctx.beginPath();
      ctx.moveTo(-r * 0.5, top);
      ctx.quadraticCurveTo(0, top + r * 0.1, r * 0.5, top);
      ctx.quadraticCurveTo(r * 0.45, top + depth, 0, top + depth);
      ctx.quadraticCurveTo(-r * 0.45, top + depth, -r * 0.5, top);
      ctx.closePath();
      ctx.fillStyle = 'rgba(20,12,38,0.9)'; ctx.fill();
      ctx.lineWidth = 2.2; ctx.stroke();

      // tongue
      ctx.fillStyle = 'rgba(244,150,150,0.85)';
      ctx.beginPath(); ctx.ellipse(0, top + depth * 0.82, r * 0.2, depth * 0.22, 0, 0, TAU); ctx.fill();
      ctx.restore();
    }

    return function draw(ctx, t, dt) {
      backdrop(ctx, W, H, stars, t);
      glow(ctx, W / 2, H * 0.55, W * 0.7, GOLD, 0.08);         // warm spotlight

      // spawn tears of joy and "ha" words
      dropTimer += dt; popTimer += dt;
      if (dropTimer > 0.09) {
        dropTimer = 0;
        faces.forEach((f) => {
          const side = Math.random() < 0.5 ? -1 : 1;
          drops.push({
            x: f.x + side * f.r * 0.5, y: f.y + bounceOf(f, t) - f.r * 0.05,
            vx: side * rand(40, 110), vy: -rand(70, 150), life: 0, max: rand(0.8, 1.3)
          });
        });
      }
      if (popTimer > 0.5) {
        popTimer = 0;
        pops.push({
          x: rand(W * 0.18, W * 0.82), y: rand(H * 0.22, H * 0.4),
          text: WORDS[Math.floor(Math.random() * WORDS.length)],
          life: 0, max: 1.7, rot: rand(-0.25, 0.25), size: rand(W * 0.07, W * 0.1)
        });
      }

      faces.forEach((f) => drawFace(ctx, f, t));

      // tears
      for (let i = drops.length - 1; i >= 0; i--) {
        const d = drops[i];
        d.life += dt;
        if (d.life >= d.max) { drops.splice(i, 1); continue; }
        d.vy += 340 * dt;
        d.x += d.vx * dt; d.y += d.vy * dt;
        ctx.fillStyle = `rgba(190,227,255,${1 - d.life / d.max})`;
        ctx.beginPath(); ctx.ellipse(d.x, d.y, 2, 3, 0, 0, TAU); ctx.fill();
      }

      // "ha ha" words
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      for (let i = pops.length - 1; i >= 0; i--) {
        const p = pops[i];
        p.life += dt;
        if (p.life >= p.max) { pops.splice(i, 1); continue; }
        const k = p.life / p.max;
        const alpha = smooth(k * 6) * (1 - smooth((k - 0.6) / 0.4));
        ctx.save();
        ctx.translate(p.x, p.y - k * 40);
        ctx.rotate(p.rot);
        const sc = 0.6 + 0.4 * smooth(k * 4);
        ctx.scale(sc, sc);
        ctx.font = `italic 700 ${Math.round(p.size)}px Georgia, "Times New Roman", serif`;
        ctx.fillStyle = rgba(CREAM, alpha);
        ctx.fillText(p.text, 0, 0);
        ctx.restore();
      }
    };
  }

  const SEASONS = [
    { name: 'Spring', top: [30, 46, 112], bot: [170, 130, 175], canopy: [246, 184, 205], cAlpha: 0.92, ground: [48, 82, 72],   orb: [255, 230, 170], orbY: 0.22, stars: 0.3 },
    { name: 'Summer', top: [8, 24, 76],   bot: [34, 96, 140],   canopy: [72, 150, 96],   cAlpha: 0.95, ground: [30, 84, 60],   orb: [255, 242, 200], orbY: 0.16, stars: 0.7 },
    { name: 'Autumn', top: [44, 28, 62],  bot: [214, 120, 64],  canopy: [226, 142, 52],  cAlpha: 0.92, ground: [104, 66, 40],  orb: [255, 176, 96],  orbY: 0.3,  stars: 0.35 },
    { name: 'Winter', top: [8, 14, 42],   bot: [70, 92, 146],   canopy: [225, 234, 255], cAlpha: 0.12, ground: [226, 233, 250], orb: [226, 236, 255], orbY: 0.18, stars: 1 }
  ];
  const SEASON_PARTICLE = ['petal', 'fly', 'leaf', 'snow'];     // what falls/floats in each season
  const SPAWN_RATE = { petal: 7, fly: 3.5, leaf: 6, snow: 16 };  // per second

  function seasons(W, H) {
    const stars = makeStars(W, H, 40);
    const SEG = 4.5;                                   // seconds per season
    const cx = W / 2, canopyY = H * 0.37;
    const TRUNK = [84, 60, 44];

    // Fixed leaf-cluster positions (so the tree always looks the same)
    const blobs = Array.from({ length: 18 }, (_, i) => {
      const ang = i * 2.4, d = Math.sqrt(i / 18);
      return {
        x: cx + Math.cos(ang) * d * W * 0.25,
        y: canopyY + Math.sin(ang) * d * W * 0.17,
        r: W * (0.065 + 0.03 * ((i * 37) % 5) / 5),
        ph: i
      };
    });

    let parts = [], acc = 0;

    /* Create one falling petal / leaf / snowflake / firefly */
    function spawn(type) {
      if (parts.length > 90) return;
      const p = {
        type, x: rand(-5, W + 5), y: -8, vx: rand(-8, 8), vy: rand(25, 50),
        sway: rand(8, 22), ph: rand(0, TAU), rot: rand(0, TAU), spin: rand(-2, 2),
        size: 3, life: 0, max: 999, col: GOLD
      };
      if (type === 'petal') { p.vy = rand(22, 42); p.size = rand(2.6, 4); p.col = [250, 188, 206]; }
      if (type === 'leaf') {
        p.vy = rand(32, 62); p.size = rand(3.6, 5.5); p.spin = rand(-3, 3);
        p.col = [[226, 142, 52], [200, 90, 40], [240, 176, 70]][Math.floor(rand(0, 3))];
      }
      if (type === 'snow') { p.vy = rand(18, 42); p.size = rand(1, 2.6); p.sway = rand(4, 12); p.col = [240, 246, 255]; }
      if (type === 'fly') {
        p.y = rand(H * 0.45, H * 0.88); p.vy = rand(-10, -3); p.vx = rand(-6, 6);
        p.size = rand(1.6, 2.6); p.sway = rand(10, 24); p.max = rand(4, 7); p.col = [255, 226, 130];
      }
      parts.push(p);
    }

    return function draw(ctx, t, dt) {
      // which season are we in, and how far into the blend to the next one?
      const tt = t % (SEG * 4);
      const si = Math.floor(tt / SEG);
      const local = tt - si * SEG;
      const k = smooth((local - (SEG - 1.4)) / 1.4);
      const A = SEASONS[si], B = SEASONS[(si + 1) % 4];

      const top = mix(A.top, B.top, k), bot = mix(A.bot, B.bot, k);
      const canopy = mix(A.canopy, B.canopy, k), cAlpha = lerp(A.cAlpha, B.cAlpha, k);
      const ground = mix(A.ground, B.ground, k), orb = mix(A.orb, B.orb, k);
      const orbY = lerp(A.orbY, B.orbY, k), starA = lerp(A.stars, B.stars, k);

      backdrop(ctx, W, H, stars, t, top, bot, starA);

      // sun / moon
      glow(ctx, W * 0.82, H * orbY, W * 0.3, orb, 0.35);
      ctx.fillStyle = rgba(orb, 0.95);
      ctx.beginPath(); ctx.arc(W * 0.82, H * orbY, W * 0.04, 0, TAU); ctx.fill();

      // ground hill
      ctx.fillStyle = rgba(ground, 1);
      ctx.beginPath(); ctx.ellipse(cx, H * 1.03, W * 0.78, H * 0.2, 0, 0, TAU); ctx.fill();

      // trunk
      ctx.fillStyle = rgba(TRUNK, 1);
      ctx.beginPath();
      ctx.moveTo(cx - W * 0.035, H * 0.9);
      ctx.lineTo(cx - W * 0.018, H * 0.52);
      ctx.lineTo(cx + W * 0.018, H * 0.52);
      ctx.lineTo(cx + W * 0.035, H * 0.9);
      ctx.closePath(); ctx.fill();

      // branches
      ctx.strokeStyle = rgba(TRUNK, 1);
      ctx.lineCap = 'round';
      const branches = [
        [0.62, -0.20, 0.40, 4], [0.58, 0.20, 0.38, 4], [0.52, -0.08, 0.30, 3],
        [0.50, 0.10, 0.28, 3], [0.50, 0.00, 0.24, 3]
      ];
      for (const [fy, dx, ty, lw] of branches) {
        ctx.lineWidth = lw;
        ctx.beginPath(); ctx.moveTo(cx, H * fy); ctx.lineTo(cx + W * dx, H * ty); ctx.stroke();
      }

      // leafy canopy (fades almost away in winter)
      if (cAlpha > 0.02) {
        for (const b of blobs) {
          const sway = Math.sin(t * 0.9 + b.ph) * 1.6;
          ctx.fillStyle = rgba(canopy, cAlpha * 0.85);
          ctx.beginPath(); ctx.arc(b.x + sway, b.y, b.r, 0, TAU); ctx.fill();
          ctx.fillStyle = rgba(mix(canopy, CREAM, 0.35), cAlpha * 0.35);
          ctx.beginPath(); ctx.arc(b.x + sway - b.r * 0.25, b.y - b.r * 0.25, b.r * 0.55, 0, TAU); ctx.fill();
        }
      }

      // falling petals / leaves / snow, floating fireflies
      const dominant = k > 0.5 ? (si + 1) % 4 : si;
      const type = SEASON_PARTICLE[dominant];
      acc += SPAWN_RATE[type] * dt;
      while (acc >= 1) { acc -= 1; spawn(type); }

      for (let i = parts.length - 1; i >= 0; i--) {
        const p = parts[i];
        p.life += dt;
        p.x += (p.vx + Math.sin(t * 1.6 + p.ph) * p.sway) * dt;
        p.y += p.vy * dt;
        p.rot += p.spin * dt;
        if (p.y > H + 10 || p.life > p.max || p.x < -20 || p.x > W + 20) { parts.splice(i, 1); continue; }

        if (p.type === 'fly') {
          const a = Math.sin(clamp01(p.life / p.max) * Math.PI) * (0.6 + 0.4 * Math.sin(t * 5 + p.ph));
          glow(ctx, p.x, p.y, p.size * 5, p.col, a * 0.6);
          ctx.fillStyle = rgba(CREAM, a);
          ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, TAU); ctx.fill();
        } else if (p.type === 'snow') {
          ctx.fillStyle = rgba(p.col, 0.9);
          ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, TAU); ctx.fill();
        } else {
          ctx.save();
          ctx.translate(p.x, p.y); ctx.rotate(p.rot);
          ctx.fillStyle = rgba(p.col, 0.95);
          ctx.beginPath(); ctx.ellipse(0, 0, p.size, p.size * 0.55, 0, 0, TAU); ctx.fill();
          ctx.restore();
        }
      }

      // season name at the top (cross-fades while the season changes)
      const showNext = k > 0.5;
      const name = (showNext ? B : A).name;
      const labelAlpha = showNext ? clamp01(k * 2 - 1) : clamp01(1 - k * 2);
      ctx.font = `italic 600 ${Math.round(W * 0.07)}px Georgia, "Times New Roman", serif`;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillStyle = rgba(CREAM, labelAlpha * 0.95);
      ctx.fillText(name.toUpperCase().split('').join(' '), W * 0.42, H * 0.07);
    };
  }

  return { meet, laugh, seasons };
})();

const Memories = (() => {
  const list = CONFIG.memories;
  let index = 0;            // which memory is showing now
  let busy = false;         // true while a transition is playing
  let heartTimer = null;
  let frame, canvas, ctx, title, message, dots, prevBtn, nextBtn, contBtn, heartsLayer;

  // animation engine state
  let artW = 0, artH = 0, artDraw = null, artStart = 0, lastNow = 0, rafId = null;

  /* Make the canvas the right size (and sharp on high-resolution screens) */
  function sizeCanvas() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    artW = canvas.clientWidth;
    artH = canvas.clientHeight;
    canvas.width = Math.round(artW * dpr);
    canvas.height = Math.round(artH * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  /* Start the animation of the current memory (after delaySec seconds) */
  function startArt(delaySec) {
    const make = MemoryArt[list[index].animation];
    artDraw = make ? make(artW, artH) : null;
    artStart = performance.now() + delaySec * 1000;
  }

  /* Runs every frame: clears the canvas and draws the current animation */
  function loop(now) {
    rafId = requestAnimationFrame(loop);
    const dt = Math.min((now - lastNow) / 1000, 0.05);
    lastNow = now;
    if (!artDraw) return;
    const t = (now - artStart) / 1000;
    ctx.clearRect(0, 0, artW, artH);
    if (t < 0) return;                       // still waiting for its start delay
    ctx.save();
    artDraw(ctx, t, dt);
    ctx.restore();
  }

  /* Put memory number "index" on screen.
     wordDelay = seconds before the message starts, artDelay = seconds before the animation starts */
  function render(wordDelay, artDelay) {
    const m = list[index];

    canvas.setAttribute('aria-label', m.title);
    startArt(artDelay);

    title.textContent = m.title;
    frame.style.setProperty('--tilt', index % 2 === 0 ? '-1.5deg' : '1.5deg');

    // Message: every word is its own <span> so the words can appear one by one
    message.textContent = '';
    m.message.split(' ').forEach((word, i) => {
      const span = document.createElement('span');
      span.className = 'word';
      span.textContent = word;
      span.style.animationDelay = (wordDelay + i * 0.09) + 's';
      message.appendChild(span);
    });
    message.classList.remove('hide');

    // Dots, arrows and the Continue button
    [...dots.children].forEach((d, i) => d.classList.toggle('active', i === index));
    prevBtn.disabled = index === 0;
    nextBtn.disabled = index === list.length - 1;
    if (index === list.length - 1) contBtn.classList.add('show');
  }

  /* Change to another memory with a slide transition */
  function show(target) {
    if (busy || target < 0 || target >= list.length || target === index) return;
    busy = true;
    const dir = target > index ? 1 : -1;

    frame.style.setProperty('--dir', dir);
    frame.classList.add('out');          // slide + fade the old frame away
    message.classList.add('hide');

    setTimeout(() => {
      index = target;
      render(0.35, 0);
      frame.classList.remove('out');
      frame.classList.add('pre');        // jump to the opposite side (no animation)...
      void frame.offsetWidth;            // ...force the browser to notice...
      frame.classList.remove('pre');     // ...then slide in to the middle
      setTimeout(() => { busy = false; }, 450);
    }, 450);
  }

  /* One floating heart (or little star) rising from the bottom */
  function spawnHeart() {
    if (heartsLayer.childElementCount > 40) return;
    const h = document.createElement('span');
    const colors = ['#e8c97a', '#fff0c2', '#f4b6b6', '#ffd9a0'];
    h.className = 'heart';
    h.textContent = Math.random() < 0.7 ? '♥' : '✦';
    h.style.left = Math.random() * 100 + '%';
    h.style.fontSize = (10 + Math.random() * 18) + 'px';
    h.style.setProperty('--dur', (7 + Math.random() * 6) + 's');
    h.style.setProperty('--drift', (Math.random() * 80 - 40) + 'px');
    h.style.setProperty('--c', colors[Math.floor(Math.random() * colors.length)]);
    h.addEventListener('animationend', () => h.remove());
    heartsLayer.appendChild(h);
  }

  /* Connect buttons, keys and swipes (runs once when the page loads) */
  function init() {
    const $ = (id) => document.getElementById(id);
    frame = $('memory-frame'); canvas = $('memory-canvas'); ctx = canvas.getContext('2d');
    title = $('memory-title'); message = $('memory-message'); dots = $('memory-dots');
    prevBtn = $('mem-prev'); nextBtn = $('mem-next'); contBtn = $('mem-continue');
    heartsLayer = $('hearts-layer');

    // One dot per memory (clickable)
    list.forEach((m, i) => {
      const dot = document.createElement('button');
      dot.className = 'dot';
      dot.setAttribute('aria-label', 'Memory ' + (i + 1));
      dot.addEventListener('click', () => show(i));
      dots.appendChild(dot);
    });

    prevBtn.addEventListener('click', () => show(index - 1));
    nextBtn.addEventListener('click', () => show(index + 1));
    contBtn.addEventListener('click', () => Scenes.go('scene-cake'));

    // Tapping the frame makes golden sparkles
    frame.addEventListener('click', (e) => Sky.burst(e.clientX, e.clientY, 30));

    // Keyboard arrows
    document.addEventListener('keydown', (e) => {
      if (Scenes.getCurrent() !== 'scene-memories') return;
      if (e.key === 'ArrowRight') show(index + 1);
      if (e.key === 'ArrowLeft')  show(index - 1);
    });

    // Swipe left/right on phones
    let startX = null;
    const stage = document.querySelector('.memory-stage');
    stage.addEventListener('touchstart', (e) => { startX = e.touches[0].clientX; }, { passive: true });
    stage.addEventListener('touchend', (e) => {
      if (startX === null) return;
      const dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 40) show(dx < 0 ? index + 1 : index - 1);
      startX = null;
    });

    // If the window changes size, resize the animation too
    window.addEventListener('resize', () => {
      if (Scenes.getCurrent() !== 'scene-memories') return;
      sizeCanvas();
      startArt(0);
    });
  }

  /* Called when the scene appears: start from the first memory */
  function enter() {
    index = 0;
    busy = false;
    contBtn.classList.remove('show');
    frame.classList.remove('out', 'pre');
    sizeCanvas();
    render(1.6, 1.0);                              // wait for the frame to fade in first
    clearInterval(heartTimer);
    heartTimer = setInterval(spawnHeart, CONFIG.heartEveryMs);
    if (rafId) cancelAnimationFrame(rafId);
    lastNow = performance.now();
    rafId = requestAnimationFrame(loop);
  }

  /* Called when the scene is left: stop hearts and animation (after the fade-out) */
  function leave() {
    clearInterval(heartTimer);
    setTimeout(() => {
      if (Scenes.getCurrent() === 'scene-memories') return;   // came back already
      if (rafId) cancelAnimationFrame(rafId);
      rafId = null;
      heartsLayer.textContent = '';
    }, 1200);
  }

  return { init, enter, leave };
})();

const Cake = (() => {
  const TAU = Math.PI * 2;
  const rand = (a, b) => a + Math.random() * (b - a);
  const clamp01 = (v) => Math.max(0, Math.min(1, v));
  const smooth = (v) => { v = clamp01(v); return v * v * (3 - 2 * v); };
  // Repeatable "random" number from a seed (so the cream drips never change between frames)
  const hash = (n) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
  const rgba = (c, a) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;

  let canvas, ctx, W = 0, H = 0;
  let rafId = null, start = 0, lastNow = 0;
  let blown = false, blowAt = 0;
  let candles = [], smoke = [], dust = [], sparks = [];
  let layout = {}, candleH = 0, candleW = 0;
  let blowBtn, wishBlock, contBtn;
  let timers = [];

  /* A soft round glow (drawn with whatever blend mode is active) */
  function glow(x, y, r, color, alpha) {
    if (alpha <= 0.002) return;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, rgba(color, alpha));
    g.addColorStop(1, rgba(color, 0));
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
  }

  /* Make the canvas the right size (and sharp on high-resolution screens) */
  function sizeCanvas() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = canvas.clientWidth;
    H = canvas.clientHeight;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  /* Work out where every layer and candle goes (all sizes are relative to the canvas) */
  function computeLayout() {
    const L = {
      cx: W / 2, plateY: H * 0.875,
      wB: W * 0.80, hB: H * 0.19,       // bottom layer
      wM: W * 0.60, hM: H * 0.17,       // middle layer
      wT: W * 0.41, hT: H * 0.15        // top layer
    };
    L.yB = L.plateY - L.hB - H * 0.005;
    L.yM = L.yB - L.hM + H * 0.012;
    L.yT = L.yM - L.hT + H * 0.012;
    L.rxT = L.wT / 2;
    L.ryT = L.rxT * 0.17;

    candleH = H * 0.115;
    candleW = Math.max(5, W * 0.017);

    // Spread the candles along the top of the cake in a gentle arc
    const n = candles.length;
    candles.forEach((c, i) => {
      const u = n === 1 ? 0 : (i - (n - 1) / 2) / ((n - 1) / 2);   // -1 (left) ... +1 (right)
      c.x = L.cx + u * L.rxT * 0.74;
      c.y = L.yT + L.ryT * 0.5 * (1 - u * u * 0.8);
      c.dir = u === 0 ? 0.6 : Math.sign(u);                         // which way the flame leans when blown
    });
    layout = L;
  }

  /* ---------- Drawing the cake ---------- */

  /* The golden plate under the cake */
  function drawPlate() {
    const { cx, plateY, wB } = layout;
    const rx = W * 0.47, ry = (wB / 2) * 0.17 * 1.3;
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.beginPath(); ctx.ellipse(cx, plateY + ry * 0.45, rx * 1.02, ry * 1.1, 0, 0, TAU); ctx.fill();

    const g = ctx.createLinearGradient(cx - rx, 0, cx + rx, 0);
    g.addColorStop(0, 'rgb(140,98,36)');
    g.addColorStop(0.25, 'rgb(255,236,170)');
    g.addColorStop(0.55, 'rgb(232,201,122)');
    g.addColorStop(0.8, 'rgb(255,240,190)');
    g.addColorStop(1, 'rgb(130,90,32)');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.ellipse(cx, plateY, rx, ry, 0, 0, TAU); ctx.fill();

    ctx.fillStyle = 'rgba(255,244,205,0.25)';
    ctx.beginPath(); ctx.ellipse(cx, plateY - 1, rx * 0.9, ry * 0.8, 0, 0, TAU); ctx.fill();
    ctx.strokeStyle = 'rgba(255,248,220,0.6)'; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.ellipse(cx, plateY, rx, ry, 0, 0, TAU); ctx.stroke();
  }

  /* One cake layer: white body, golden band with pearls, cream top with drips */
  function drawLayer(cx, top, w, h, seed, sprinkles) {
    const rx = w / 2, ry = rx * 0.17, bot = top + h;

    // --- body (cylinder) with side shading ---
    const body = ctx.createLinearGradient(cx - rx, 0, cx + rx, 0);
    body.addColorStop(0, 'rgb(205,196,190)');
    body.addColorStop(0.22, 'rgb(255,252,246)');
    body.addColorStop(0.6, 'rgb(250,244,232)');
    body.addColorStop(1, 'rgb(196,188,184)');

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(cx - rx, top);
    ctx.lineTo(cx - rx, bot);
    ctx.ellipse(cx, bot, rx, ry, 0, Math.PI, 0, true);   // curved bottom edge
    ctx.lineTo(cx + rx, top);
    ctx.closePath();
    ctx.fillStyle = body;
    ctx.fill();
    ctx.clip();                                          // everything below stays inside the body

    // --- golden band that follows the curve ---
    const b1 = top + h * 0.66, b2 = top + h * 0.82;
    const gold = ctx.createLinearGradient(cx - rx, 0, cx + rx, 0);
    gold.addColorStop(0, 'rgb(150,108,40)');
    gold.addColorStop(0.2, 'rgb(255,236,170)');
    gold.addColorStop(0.5, 'rgb(232,201,122)');
    gold.addColorStop(0.75, 'rgb(255,240,190)');
    gold.addColorStop(1, 'rgb(140,98,36)');
    ctx.beginPath();
    ctx.ellipse(cx, b1, rx, ry, 0, Math.PI, 0, true);
    ctx.lineTo(cx + rx, b2);
    ctx.ellipse(cx, b2, rx, ry, 0, 0, Math.PI, false);
    ctx.closePath();
    ctx.fillStyle = gold;
    ctx.fill();
    ctx.restore();

    // --- golden pearls along the bottom of the band ---
    const pearls = Math.max(8, Math.round(w / 22));
    const pr = 2.4 + W * 0.0022;
    for (let k = 0; k < pearls; k++) {
      const ang = Math.PI * (k + 0.5) / pearls;
      const x = cx - rx * Math.cos(ang);
      const y = b2 + ry * Math.sin(ang);
      const pg = ctx.createRadialGradient(x - pr * 0.3, y - pr * 0.3, 0.5, x, y, pr);
      pg.addColorStop(0, 'rgb(255,252,235)');
      pg.addColorStop(1, 'rgb(214,172,84)');
      ctx.fillStyle = pg;
      ctx.beginPath(); ctx.arc(x, y, pr, 0, TAU); ctx.fill();
    }

    // --- top surface (cream) ---
    const tg = ctx.createRadialGradient(cx, top - ry * 0.3, 2, cx, top, rx);
    tg.addColorStop(0, 'rgb(255,255,252)');
    tg.addColorStop(1, 'rgb(244,236,222)');
    ctx.fillStyle = tg;
    ctx.beginPath(); ctx.ellipse(cx, top, rx, ry, 0, 0, TAU); ctx.fill();
    ctx.strokeStyle = 'rgba(190,175,150,0.35)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.ellipse(cx, top, rx, ry, 0, 0, TAU); ctx.stroke();

    // --- golden sprinkles on the visible ring ---
    if (sprinkles) {
      ctx.fillStyle = 'rgb(222,178,84)';
      for (let j = 0; j < 22; j++) {
        const a = 0.05 * Math.PI + hash(j + seed * 7) * 0.9 * Math.PI;
        const f = 0.86 + hash(j * 3 + seed) * 0.11;
        ctx.beginPath();
        ctx.arc(cx + rx * f * Math.cos(a), top + ry * f * Math.sin(a), 1.7, 0, TAU);
        ctx.fill();
      }
    }

    // --- white cream drips along the front edge ---
    const drips = Math.round(w / 26);
    ctx.lineCap = 'round';
    for (let i = 0; i < drips; i++) {
      const u = 0.05 + 0.9 * (i + 0.5) / drips;
      const x = cx - rx + u * w;
      const yFront = top + ry * Math.sqrt(Math.max(0, 1 - Math.pow((x - cx) / rx, 2)));
      const len = h * (0.10 + 0.20 * hash(i + seed));
      const dw = Math.max(7, (w / drips) * (0.38 + 0.12 * hash(i * 3 + seed)));
      ctx.lineWidth = dw;
      ctx.strokeStyle = 'rgba(175,160,145,0.35)';          // soft shadow
      ctx.beginPath(); ctx.moveTo(x + 1.5, yFront); ctx.lineTo(x + 1.5, yFront + len + 2); ctx.stroke();
      ctx.strokeStyle = 'rgb(253,249,242)';                // the cream itself
      ctx.beginPath(); ctx.moveTo(x, yFront); ctx.lineTo(x, yFront + len); ctx.stroke();
    }
    // bright cream rim on the front of the top edge
    ctx.lineWidth = 3;
    ctx.strokeStyle = 'rgba(255,255,255,0.9)';
    ctx.beginPath(); ctx.ellipse(cx, top, rx, ry, 0, 0.04 * Math.PI, 0.96 * Math.PI, false); ctx.stroke();
  }

  /* One candle (striped body + wick). Flames are drawn separately. */
  function drawCandle(c, i) {
    const w = candleW, x = c.x, yb = c.y, yt = yb - candleH;
    const gold = i % 2 === 0;

    ctx.fillStyle = 'rgba(0,0,0,0.16)';                   // little shadow on the cream
    ctx.beginPath(); ctx.ellipse(x + 1, yb, w * 0.9, w * 0.32, 0, 0, TAU); ctx.fill();

    const g = ctx.createLinearGradient(x - w / 2, 0, x + w / 2, 0);
    if (gold) { g.addColorStop(0, '#b8893a'); g.addColorStop(0.45, '#fff0c2'); g.addColorStop(1, '#a37a30'); }
    else      { g.addColorStop(0, '#c9bfb0'); g.addColorStop(0.45, '#ffffff'); g.addColorStop(1, '#b5ab9c'); }
    ctx.save();
    ctx.beginPath(); ctx.rect(x - w / 2, yt, w, candleH); ctx.clip();
    ctx.fillStyle = g; ctx.fillRect(x - w / 2, yt, w, candleH);
    ctx.strokeStyle = gold ? 'rgba(255,255,255,0.75)' : 'rgba(222,178,84,0.95)';
    ctx.lineWidth = w * 0.34;
    for (let y = yt - w; y < yb + w; y += w * 1.7) {       // diagonal stripes
      ctx.beginPath(); ctx.moveTo(x - w, y); ctx.lineTo(x + w, y + w * 0.9); ctx.stroke();
    }
    ctx.restore();

    ctx.fillStyle = 'rgba(255,248,225,0.9)';               // top rim of the candle
    ctx.beginPath(); ctx.ellipse(x, yt, w / 2, w * 0.2, 0, 0, TAU); ctx.fill();

    ctx.strokeStyle = '#2a1c10'; ctx.lineWidth = 1.6; ctx.lineCap = 'round';   // wick
    ctx.beginPath(); ctx.moveTo(x, yt); ctx.lineTo(x, yt - w * 0.8); ctx.stroke();
  }

  /* A teardrop flame shape pointing up */
  function flamePath(x, y, fw, fh, sway) {
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.bezierCurveTo(x - fw, y - fh * 0.25, x - fw * 0.7, y - fh * 0.7, x + sway, y - fh);
    ctx.bezierCurveTo(x + fw * 0.7, y - fh * 0.7, x + fw, y - fh * 0.25, x, y);
    ctx.closePath();
  }

  /* A realistic flickering flame (c.v = 0..1 says how "lit" it is) */
  function drawFlame(c, i, t) {
    const v = c.v;
    if (v <= 0.01) return;
    const flick = 1 + 0.12 * Math.sin(t * 13 + i * 1.7) + 0.07 * Math.sin(t * 23 + i * 2.9);
    const fh = H * 0.062 * v * flick, fw = fh * 0.36;
    const lean = (c.outAt !== null ? smooth((t - c.outAt) / 0.3) : 0) * fh * 0.5 * c.dir;   // bends when blown
    const sway = Math.sin(t * 4.2 + i * 1.3) * fh * 0.06 + lean;
    const x = c.x, y = c.y - candleH - candleW * 0.6;

    // light glow around the flame
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    glow(x, y - fh * 0.5, fh * 3.4, [255, 170, 70], 0.34 * v * flick);
    ctx.restore();

    // outer orange flame
    const og = ctx.createLinearGradient(0, y - fh, 0, y);
    og.addColorStop(0, 'rgba(255,140,30,0.85)');
    og.addColorStop(0.6, 'rgba(255,190,60,0.95)');
    og.addColorStop(1, 'rgba(255,225,130,1)');
    ctx.fillStyle = og;
    flamePath(x, y, fw, fh, sway);
    ctx.fill();

    // bright inner flame
    ctx.fillStyle = 'rgba(255,250,215,0.95)';
    flamePath(x + sway * 0.3, y - fh * 0.04, fw * 0.55, fh * 0.62, sway * 0.4);
    ctx.fill();

    // blue base
    ctx.fillStyle = 'rgba(110,160,255,0.55)';
    ctx.beginPath(); ctx.ellipse(x, y - fh * 0.06, fw * 0.42, fh * 0.12, 0, 0, TAU); ctx.fill();
  }

  /* ---------- Main loop ---------- */
  function frame(now) {
    rafId = requestAnimationFrame(frame);
    const dt = Math.min((now - lastNow) / 1000, 0.05);
    lastNow = now;
    const t = (now - start) / 1000;
    ctx.clearRect(0, 0, W, H);

    // How lit is each candle right now?  (also starts the smoke when one goes out)
    let sum = 0;
    for (const c of candles) {
      const lit = smooth((t - c.litAt) / 0.5);
      let v = lit;
      if (c.outAt !== null) {
        v = lit * (1 - smooth((t - c.outAt) / 0.35));
        if (!c.smoked && t >= c.outAt + 0.1) {
          c.smoked = true; c.smokeUntil = t + 2.4; c.ember = t;
          for (let k = 0; k < 4; k++) addSmoke(c);
        }
      }
      c.v = v;
      sum += v;
    }
    const L = sum / candles.length;                       // 0 = all out, 1 = all lit
    const after = blown ? smooth((t - blowAt - 1) / 1.5) : 0;

    // --- soft light behind and around the cake ---
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    // radius is kept small enough that the glow fades out BEFORE the canvas edge (no visible box)
    const gy = layout.yT - candleH * 0.5;
    glow(layout.cx, gy, Math.min(W * 0.5, gy), [255, 160, 60], 0.2 * L);
    glow(layout.cx, H * 0.5, Math.min(W * 0.5, H * 0.5), [232, 201, 122], 0.12 * after);
    ctx.restore();

    // --- the cake ---
    drawPlate();
    drawLayer(layout.cx, layout.yB, layout.wB, layout.hB, 1, true);
    drawLayer(layout.cx, layout.yM, layout.wM, layout.hM, 2, true);
    drawLayer(layout.cx, layout.yT, layout.wT, layout.hT, 3, false);

    // warm candlelight on the cream
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    glow(layout.cx, layout.yT, layout.rxT * 1.5, [255, 170, 80], 0.2 * L);
    glow(layout.cx, layout.yM, layout.wM * 0.6, [255, 170, 80], 0.08 * L);
    ctx.restore();

    // --- candles and flames ---
    candles.forEach((c, i) => drawCandle(c, i));
    candles.forEach((c, i) => drawFlame(c, i, t));

    // glowing red embers on the wicks right after blowing out
    for (const c of candles) {
      if (!c.smoked) continue;
      const e = clamp01(1 - (t - c.ember) / 1.6);
      if (e <= 0) continue;
      const x = c.x, y = c.y - candleH - candleW * 0.8;
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      glow(x, y, 7, [255, 110, 50], e * 0.6);
      ctx.restore();
      ctx.fillStyle = `rgba(255,150,80,${e})`;
      ctx.beginPath(); ctx.arc(x, y, 1.6, 0, TAU); ctx.fill();
    }

    updateSmoke(t, dt);
    updateSparks(dt);
    updateDust(t, dt);
  }

  /* ---------- Smoke ---------- */
  function addSmoke(c) {
    if (smoke.length > 150) return;
    smoke.push({
      x: c.x + rand(-1, 1), y: c.y - candleH - candleW * 0.8,
      vx: rand(-5, 5), vy: rand(26, 52), r: rand(2, 4), grow: rand(7, 13),
      life: 0, max: rand(2.2, 3.4), ph: rand(0, TAU)
    });
  }

  function updateSmoke(t, dt) {
    // keep puffing from candles that just went out
    for (const c of candles) {
      if (c.smoked && t < c.smokeUntil) {
        c.acc = (c.acc || 0) + 20 * dt;
        while (c.acc >= 1) { c.acc -= 1; addSmoke(c); }
      }
    }
    for (let i = smoke.length - 1; i >= 0; i--) {
      const p = smoke[i];
      p.life += dt;
      if (p.life >= p.max) { smoke.splice(i, 1); continue; }
      p.y -= p.vy * dt;
      p.x += (Math.sin(t * 1.8 + p.ph) * 14 + p.vx) * dt;
      p.r += p.grow * dt;
      const k = p.life / p.max;
      const a = 0.3 * Math.pow(1 - k, 1.5) * smooth(k * 8);
      const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
      g.addColorStop(0, `rgba(222,227,240,${a})`);
      g.addColorStop(1, 'rgba(222,227,240,0)');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, TAU); ctx.fill();
    }
  }

  /* ---------- Golden sparkles that fly up when the candles go out ---------- */
  function updateSparks(dt) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (let i = sparks.length - 1; i >= 0; i--) {
      const p = sparks[i];
      p.life += dt;
      if (p.life >= p.max) { sparks.splice(i, 1); continue; }
      p.vx *= 0.985; p.vy += 40 * dt;
      p.x += p.vx * dt; p.y += p.vy * dt;
      const a = 1 - p.life / p.max;
      glow(p.x, p.y, 7, [232, 201, 122], a * 0.5);
      ctx.fillStyle = `rgba(255,244,205,${a})`;
      ctx.beginPath(); ctx.arc(p.x, p.y, 1.5, 0, TAU); ctx.fill();
    }
    ctx.restore();
  }

  /* ---------- Small golden particles floating up around the cake ---------- */
  function makeDust() {
    const n = W < 450 ? 26 : 40;
    dust = Array.from({ length: n }, () => ({
      x: rand(0, W), y: rand(0, H), vy: rand(10, 28), r: rand(0.8, 2.2),
      ph: rand(0, TAU), tw: rand(1.5, 3.5)
    }));
  }

  function updateDust(t, dt) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (const d of dust) {
      d.y -= d.vy * dt;
      if (d.y < -12) { d.y = H + 12; d.x = rand(0, W); }
      const x = d.x + Math.sin(t * 0.8 + d.ph) * 10;
      const a = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(t * d.tw + d.ph));
      glow(x, d.y, d.r * 5, [232, 201, 122], a * 0.28);
      ctx.fillStyle = `rgba(255,240,194,${a})`;
      ctx.beginPath(); ctx.arc(x, d.y, d.r, 0, TAU); ctx.fill();
      if (d.r > 1.7) {                                     // bigger ones twinkle like little stars
        ctx.strokeStyle = `rgba(255,240,194,${a * 0.8})`; ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(x - d.r * 3, d.y); ctx.lineTo(x + d.r * 3, d.y);
        ctx.moveTo(x, d.y - d.r * 3); ctx.lineTo(x, d.y + d.r * 3);
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  /* ---------- Blowing out the candles ---------- */
  function blow() {
    if (blown || !candles.length) return;
    blown = true;
    Cake.onBlow && Cake.onBlow();
    const t = (performance.now() - start) / 1000;
    blowAt = t;

    // The candles go out in a wave, starting from the middle
    const mid = (candles.length - 1) / 2;
    candles.forEach((c, i) => {
      c.outAt = t + 0.05 + Math.abs(i - mid) * 0.12 + rand(0, 0.05);
      for (let k = 0; k < 7; k++) {                        // golden sparkles shooting up
        const a = rand(-Math.PI * 0.85, -Math.PI * 0.15);
        const s = rand(40, 170);
        sparks.push({
          x: c.x, y: c.y - candleH, vx: Math.cos(a) * s, vy: Math.sin(a) * s,
          life: -(c.outAt - t), max: rand(0.9, 1.6)          // starts when that candle goes out
        });
      }
    });

    // Sparkles from the button too
    const r = blowBtn.getBoundingClientRect();
    Sky.burst(r.left + r.width / 2, r.top + r.height / 2, 45);

    blowBtn.classList.add('gone');
    timers.push(setTimeout(() => wishBlock.classList.add('show'), 1800));
    timers.push(setTimeout(() => contBtn.classList.add('show'), 4300));
  }

  /* ---------- Setup ---------- */
  function init() {
    canvas = document.getElementById('cake-canvas');
    ctx = canvas.getContext('2d');
    blowBtn = document.getElementById('blow-btn');
    wishBlock = document.getElementById('wish-block');
    contBtn = document.getElementById('cake-continue');

    blowBtn.addEventListener('click', blow);
    contBtn.addEventListener('click', () => Scenes.go('scene-fireworks'));

    window.addEventListener('resize', () => {
      if (Scenes.getCurrent() !== 'scene-cake') return;
      sizeCanvas();
      computeLayout();
      makeDust();
    });
  }

  /* Called when the scene appears: a fresh cake with unlit candles */
  function enter() {
    timers.forEach(clearTimeout); timers = [];
    blown = false; smoke = []; sparks = [];
    blowBtn.classList.remove('gone');
    wishBlock.classList.remove('show');
    contBtn.classList.remove('show');

    sizeCanvas();
    candles = Array.from({ length: CONFIG.candleCount }, (_, i) => ({
      x: 0, y: 0, dir: 1, v: 0,
      litAt: 2.0 + i * 0.25,                // lights up one after another
      outAt: null, smoked: false, smokeUntil: 0, ember: 0, acc: 0
    }));
    computeLayout();
    makeDust();

    start = performance.now();
    lastNow = start;
    if (rafId) cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(frame);
  }

  /* Called when the scene is left: stop drawing after the fade-out */
  function leave() {
    timers.forEach(clearTimeout); timers = [];
    setTimeout(() => {
      if (Scenes.getCurrent() === 'scene-cake') return;     // came back already
      if (rafId) cancelAnimationFrame(rafId);
      rafId = null;
    }, 1200);
  }

  return { init, enter, leave };
})();

const Fireworks = (() => {
  const TAU = Math.PI * 2;
  const rand = (a, b) => a + Math.random() * (b - a);
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const easeOut = (p) => 1 - Math.pow(1 - p, 3);
  const rgba = (c, a) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;

  // Firework colors. Each palette is one "color scheme" (1 or 2 colors).
  const PALETTES = [
    [[255, 215, 120]], [[255, 246, 220]], [[255, 120, 170]], [[110, 200, 255]],
    [[255, 95, 95]], [[190, 140, 255]], [[120, 255, 190]],
    [[255, 215, 120], [255, 255, 255]], [[255, 120, 170], [255, 215, 120]],
    [[110, 200, 255], [190, 140, 255]], [[255, 150, 60], [255, 225, 130]]
  ];
  const GOLD = [[255, 205, 100], [255, 232, 160]];
  const CONFETTI_COLORS = [[232, 201, 122], [255, 240, 194], [253, 249, 240], [244, 160, 190], [140, 200, 255], [190, 150, 255]];

  let fwCanvas, fwCtx, cfCanvas, cfCtx, scene, lightEl, textEl, contBtn, hintEl;
  let W = 0, H = 0, S = 1, Q = 1;             // S = size scale, Q = quality (fewer particles on phones)
  let rockets = [], parts = [], confetti = [];
  let rafId = null, start = 0, lastNow = 0, frameN = 0;
  let events = [], nextAuto = 0, confettiAcc = 0, timers = [];
  const AUTO_FROM = 3.6;                      // seconds after which fireworks keep launching by themselves
  const flash = { a: 0, x: 0, y: 0, c: [255, 200, 120] };   // soft colored light that fills the sky at each explosion

  /* Make both canvases the right size */
  function sizeCanvases() {
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);   // 1.5 keeps it smooth on phones
    W = fwCanvas.clientWidth;
    H = fwCanvas.clientHeight;
    for (const c of [fwCanvas, cfCanvas]) {
      c.width = Math.round(W * dpr);
      c.height = Math.round(H * dpr);
    }
    fwCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    cfCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    S = clamp(Math.min(W, H * 1.15) / 760, 0.55, 1.25);
    Q = W < 600 ? 0.65 : 1;
  }

  /* ---------- Particles (the sparks of an explosion) ---------- */
  function addPart(x, y, vx, vy, col, max, o = {}) {
    if (parts.length > 1700) return;
    parts.push({
      x, y, vx, vy, col, life: 0, max,
      r: o.r || 1.8, drag: o.drag || 0.985, g: o.g === undefined ? 70 * S : o.g,
      crackle: !!o.crackle, ph: rand(0, TAU)
    });
  }

  /* Spread particles along a shape (heart, star). points = [[x,y], ...] each between -1 and 1 */
  function shapeBurst(x, y, points, speed, pal) {
    for (const [px, py] of points) {
      addPart(x, y, px * speed, py * speed, pick(pal), rand(1.5, 2.1), { drag: 0.965, g: 30 * S, r: 2 });
    }
  }

  function heartPoints(n) {
    const pts = [];
    for (let i = 0; i < n; i++) {
      const t = (i / n) * TAU;
      const x = 16 * Math.pow(Math.sin(t), 3) / 16;
      const y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) / 16;
      pts.push([x, y - 0.1]);
    }
    return pts;
  }

  function starPoints(n) {
    const verts = [];
    for (let j = 0; j < 10; j++) {                         // 10 corners: outer, inner, outer, inner...
      const a = -Math.PI / 2 + j * Math.PI / 5, r = j % 2 === 0 ? 1 : 0.42;
      verts.push([Math.cos(a) * r, Math.sin(a) * r]);
    }
    const pts = [], per = Math.max(2, Math.round(n / 10));
    for (let j = 0; j < 10; j++) {
      const a = verts[j], b = verts[(j + 1) % 10];
      for (let k = 0; k < per; k++) pts.push([a[0] + (b[0] - a[0]) * k / per, a[1] + (b[1] - a[1]) * k / per]);
    }
    return pts;
  }

  /* Create an explosion at (x, y). type decides the shape. */
  function explode(x, y, type, pal) {
    const speed = rand(190, 250) * S;
    switch (type) {
      case 'ring': {                                        // a tilted ring
        const n = Math.round(66 * Q), squish = rand(0.3, 0.9), rot = rand(0, TAU);
        for (let i = 0; i < n; i++) {
          const a = (i / n) * TAU, vx = Math.cos(a) * speed, vy = Math.sin(a) * speed * squish;
          addPart(x, y, vx * Math.cos(rot) - vy * Math.sin(rot), vx * Math.sin(rot) + vy * Math.cos(rot),
                  pick(pal), rand(1.5, 2), { drag: 0.97, g: 35 * S });
        }
        break;
      }
      case 'heart': shapeBurst(x, y, heartPoints(Math.round(72 * Q)), speed * 1.25, pal); break;
      case 'star':  shapeBurst(x, y, starPoints(Math.round(80 * Q)), speed * 1.3, pal); break;
      case 'willow': {                                      // slow golden drooping streams
        const n = Math.round(80 * Q);
        for (let i = 0; i < n; i++) {
          const a = rand(0, TAU), s = rand(60, 210) * S;
          addPart(x, y, Math.cos(a) * s, Math.sin(a) * s, pick(GOLD), rand(2.4, 3.6), { drag: 0.978, g: 55 * S, r: 1.6 });
        }
        break;
      }
      case 'crackle': {                                     // sparks that crackle into smaller sparks
        const n = Math.round(60 * Q);
        for (let i = 0; i < n; i++) {
          const a = rand(0, TAU), s = speed * Math.sqrt(rand(0.2, 1));
          addPart(x, y, Math.cos(a) * s, Math.sin(a) * s, pick(pal), rand(1.1, 1.6), { crackle: true });
        }
        break;
      }
      case 'double': {                                      // big burst with a different colored core
        const n1 = Math.round(80 * Q), n2 = Math.round(40 * Q), inner = pick(PALETTES);
        for (let i = 0; i < n1; i++) {
          const a = rand(0, TAU), s = speed * Math.sqrt(rand(0.45, 1));
          addPart(x, y, Math.cos(a) * s, Math.sin(a) * s, pick(pal), rand(1.5, 2.1));
        }
        for (let i = 0; i < n2; i++) {
          const a = (i / n2) * TAU, s = speed * 0.45;
          addPart(x, y, Math.cos(a) * s, Math.sin(a) * s, pick(inner), rand(1.3, 1.8), { r: 2.1 });
        }
        break;
      }
      default: {                                            // "peony": classic round burst
        const n = Math.round(95 * Q);
        for (let i = 0; i < n; i++) {
          const a = rand(0, TAU), s = speed * Math.sqrt(rand(0.12, 1));
          addPart(x, y, Math.cos(a) * s, Math.sin(a) * s, pick(pal), rand(1.5, 2.2));
        }
      }
    }
    // light up the sky with the firework's color
    flash.a = Math.min(1, flash.a + 0.55);
    flash.x = x; flash.y = y; flash.c = pal[0];
    Fireworks.onBurst && Fireworks.onBurst(type, x / W);
  }

  /* ---------- Rockets (the glowing dots that fly up first) ---------- */
  function randomType(tx) {
    const center = 1 - Math.abs(tx / W - 0.5) * 2;           // 1 in the middle, 0 at the sides
    const bag = ['peony', 'peony', 'ring', 'willow', 'willow', 'crackle', 'crackle', 'double', 'double', 'star'];
    if (center > 0.4) bag.push('heart', 'heart');
    return pick(bag);
  }

  function launch(tx, ty, type, pal) {
    tx = tx === undefined ? rand(W * 0.12, W * 0.88) : tx;
    ty = ty === undefined ? rand(H * 0.12, H * 0.46) : ty;
    rockets.push({
      x0: clamp(tx + rand(-80, 80), 20, W - 20), y0: H + 10, tx, ty, p: 0,
      dur: rand(0.9, 1.25), ph: rand(0, TAU),
      type: type || randomType(tx), pal: pal || pick(PALETTES)
    });
    Fireworks.onLaunch && Fireworks.onLaunch(tx / W);
  }

  /* Several rockets in a row, spread across the sky */
  function volley(count) {
    for (let i = 0; i < count; i++) {
      const tx = W * (0.1 + 0.8 * (count === 1 ? 0.5 : i / (count - 1)));
      timers.push(setTimeout(() => launch(tx, rand(H * 0.14, H * 0.4)), i * 140));
    }
  }

  function updateRockets(dt) {
    for (let i = rockets.length - 1; i >= 0; i--) {
      const r = rockets[i];
      r.p += dt / r.dur;
      const p = Math.min(r.p, 1);
      const x = r.x0 + (r.tx - r.x0) * p + Math.sin(p * 9 + r.ph) * 6 * (1 - p);
      const y = r.y0 + (r.ty - r.y0) * easeOut(p);

      // little sparks falling behind the rocket
      for (let k = 0; k < 2; k++) addPart(x, y, rand(-18, 18), rand(10, 55), [255, 205, 120], rand(0.3, 0.65), { r: 1.1, g: 60, drag: 0.95 });

      // the rocket itself
      fwCtx.fillStyle = 'rgba(255,215,140,0.25)';
      fwCtx.beginPath(); fwCtx.arc(x, y, 7, 0, TAU); fwCtx.fill();
      fwCtx.fillStyle = 'rgb(255,250,235)';
      fwCtx.beginPath(); fwCtx.arc(x, y, 2.3, 0, TAU); fwCtx.fill();

      if (r.p >= 1) { explode(r.tx, r.ty, r.type, r.pal); rockets.splice(i, 1); }
    }
  }

  function updateParts(dt) {
    const f60 = dt * 60;
    for (let i = parts.length - 1; i >= 0; i--) {
      const p = parts[i];
      p.life += dt;
      const k = p.life / p.max;
      if (k >= 1) {
        if (p.crackle) {                                    // tiny "pop pop pop" sparks
          for (let j = 0; j < 4; j++) {
            const a = rand(0, TAU), s = rand(25, 90) * S;
            addPart(p.x, p.y, Math.cos(a) * s, Math.sin(a) * s, [255, 240, 200], rand(0.25, 0.5), { r: 1.2, g: 30 });
          }
        }
        parts.splice(i, 1);
        continue;
      }
      const d = Math.pow(p.drag, f60);
      p.vx *= d; p.vy = p.vy * d + p.g * dt;
      p.x += p.vx * dt; p.y += p.vy * dt;

      let a = Math.pow(1 - k, 0.8);
      if (k > 0.65) a *= 0.55 + 0.45 * Math.sin(p.life * 45 + p.ph);   // twinkle while fading
      const r = p.r * (1 - k * 0.35);
      fwCtx.fillStyle = rgba(p.col, a * 0.2);
      fwCtx.beginPath(); fwCtx.arc(p.x, p.y, r * 2.8, 0, TAU); fwCtx.fill();
      fwCtx.fillStyle = rgba(p.col, a);
      fwCtx.beginPath(); fwCtx.arc(p.x, p.y, r, 0, TAU); fwCtx.fill();
    }
  }

  /* ---------- Confetti ---------- */
  function addConfetti(x, y, vx, vy) {
    if (confetti.length > 340) return;
    confetti.push({
      x, y, vx, vy, w: rand(6, 11), h: rand(3, 6), rot: rand(0, TAU), vr: rand(-5, 5),
      tp: rand(0, TAU), ts: rand(3, 8), ph: rand(0, TAU), col: pick(CONFETTI_COLORS)
    });
  }

  /* Two confetti cannons shooting from the bottom corners */
  function cannons() {
    const n = Math.round(70 * Q);
    for (let side = 0; side < 2; side++) {
      for (let i = 0; i < n; i++) {
        const a = rand(0.15, 0.6), sp = rand(500, 1000) * Math.max(0.7, S);
        const dir = side === 0 ? 1 : -1;
        addConfetti(side === 0 ? 8 : W - 8, H + 5, dir * sp * Math.sin(a), -sp * Math.cos(a));
      }
    }
  }

  function updateConfetti(t, dt) {
    // a slow, endless rain of confetti from the top
    confettiAcc += 10 * Q * dt;
    while (confettiAcc >= 1) { confettiAcc -= 1; addConfetti(rand(0, W), -12, rand(-15, 15), rand(30, 80)); }

    cfCtx.clearRect(0, 0, W, H);
    const f60 = dt * 60, d = Math.pow(0.975, f60);
    for (let i = confetti.length - 1; i >= 0; i--) {
      const c = confetti[i];
      c.vx *= d; c.vy = c.vy * d + 140 * dt;                // gravity vs air drag = gentle floating
      c.x += (c.vx + Math.sin(t * 1.3 + c.ph) * 28) * dt;
      c.y += c.vy * dt;
      c.rot += c.vr * dt;
      if (c.y > H + 30) { confetti.splice(i, 1); continue; }
      const flip = Math.max(0.15, Math.abs(Math.cos(c.tp + t * c.ts)));   // paper flipping in the air
      cfCtx.save();
      cfCtx.translate(c.x, c.y);
      cfCtx.rotate(c.rot);
      cfCtx.scale(1, flip);
      cfCtx.fillStyle = rgba(c.col, 0.95);
      cfCtx.fillRect(-c.w / 2, -c.h / 2, c.w, c.h);
      cfCtx.restore();
    }
  }

  /* ---------- Colored light that fills the sky at each explosion ---------- */
  function updateLight(dt) {
    if (flash.a > 0.01) {
      lightEl.style.setProperty('--fa', flash.a.toFixed(3));
      lightEl.style.setProperty('--fx', (flash.x / W * 100).toFixed(1) + '%');
      lightEl.style.setProperty('--fy', (flash.y / H * 100).toFixed(1) + '%');
      lightEl.style.setProperty('--fc', rgba(flash.c, 0.5));
      flash.a -= dt * 1.8;
    } else if (flash.a !== 0) {
      flash.a = 0;
      lightEl.style.setProperty('--fa', 0);
    }
  }

  /* ---------- The big moment: text appears, huge golden burst, confetti cannons ---------- */
  function bigMoment() {
    textEl.classList.add('go');
    explode(W / 2, H * 0.38, 'double', [[255, 215, 120], [255, 246, 220]]);
    explode(W * 0.22, H * 0.3, 'willow', GOLD);
    explode(W * 0.78, H * 0.3, 'willow', GOLD);
    cannons();
    Fireworks.onCelebrate && Fireworks.onCelebrate();
  }

  /* ---------- Main loop ---------- */
  function frame(now) {
    rafId = requestAnimationFrame(frame);
    const dt = Math.min((now - lastNow) / 1000, 0.05);
    lastNow = now;
    const t = (now - start) / 1000;
    frameN++;

    // timeline of things that happen at fixed times
    while (events.length && events[0].at <= t) events.shift().fn();

    // after the intro, keep launching fireworks automatically
    if (t >= AUTO_FROM && t >= nextAuto) {
      launch();
      if (Math.random() < 0.3) launch();
      nextAuto = t + rand(0.7, 1.4);
    }

    // fade the previous frame a little: this is what makes the glowing trails
    fwCtx.globalCompositeOperation = 'destination-out';
    fwCtx.fillStyle = `rgba(0,0,0,${frameN % 30 === 0 ? 0.5 : 0.2})`;   // (a stronger fade now and then cleans leftovers)
    fwCtx.fillRect(0, 0, W, H);
    fwCtx.globalCompositeOperation = 'lighter';

    updateRockets(dt);
    updateParts(dt);
    updateConfetti(t, dt);
    updateLight(dt);
  }

  /* ---------- Setup ---------- */
  function init() {
    fwCanvas = document.getElementById('fw-canvas');
    cfCanvas = document.getElementById('confetti-canvas');
    fwCtx = fwCanvas.getContext('2d');
    cfCtx = cfCanvas.getContext('2d');
    scene = document.getElementById('scene-fireworks');
    lightEl = document.getElementById('fw-light');
    textEl = document.getElementById('fw-text');
    contBtn = document.getElementById('fw-continue');
    hintEl = document.getElementById('fw-hint');

    // Split the big title into letters so each letter can pop in one by one
    const title = document.getElementById('fw-title');
    title.setAttribute('aria-label', [...title.querySelectorAll('.fw-line')].map(l => l.textContent).join(' '));
    title.querySelectorAll('.fw-line').forEach((line, li) => {
      const text = line.textContent;
      line.textContent = '';
      line.setAttribute('aria-hidden', 'true');
      [...text].forEach((ch, i) => {
        const span = document.createElement('span');
        span.className = 'ch';
        span.textContent = ch;
        span.style.setProperty('--ld', (li * 0.55 + i * 0.07).toFixed(2) + 's');
        line.appendChild(span);
      });
    });

    // Name and message come from CONFIG
    document.getElementById('fw-name').textContent = CONFIG.friendName;
    document.getElementById('fw-sub').textContent = CONFIG.fireworksMessage;

    contBtn.addEventListener('click', () => Scenes.go('scene-gift'));

    // Tap anywhere to launch your own firework
    scene.addEventListener('click', (e) => {
      if (e.target.closest('button')) return;
      launch(e.clientX, e.clientY);
    });

    window.addEventListener('resize', () => {
      if (Scenes.getCurrent() === 'scene-fireworks') sizeCanvases();
    });
  }

  /* Called when the scene appears */
  function enter() {
    timers.forEach(clearTimeout); timers = [];
    rockets = []; parts = []; confetti = [];
    flash.a = 0; frameN = 0; nextAuto = 0; confettiAcc = 0;
    textEl.classList.remove('go');
    contBtn.classList.remove('show');
    hintEl.classList.remove('show');
    lightEl.style.setProperty('--fa', 0);

    sizeCanvases();
    fwCtx.clearRect(0, 0, W, H);

    // The show's timeline (seconds after the scene starts)
    events = [
      { at: 0.9, fn: () => launch(W * 0.32, H * 0.3, 'peony') },
      { at: 1.7, fn: () => launch(W * 0.7, H * 0.26, 'ring') },
      { at: 2.4, fn: () => launch(W * 0.5, H * 0.2, 'crackle') },
      { at: 2.8, fn: () => volley(3) },
      { at: 3.4, fn: bigMoment },                               // HAPPY BIRTHDAY! appears
      { at: 9.0, fn: () => volley(5) },
      { at: 15.0, fn: () => volley(6) }
    ];
    // repeat a volley every 12 seconds afterwards
    for (let k = 1; k < 40; k++) events.push({ at: 15 + k * 12, fn: () => volley(5) });

    timers.push(setTimeout(() => hintEl.classList.add('show'), 7000));
    timers.push(setTimeout(() => contBtn.classList.add('show'), 10500));

    start = performance.now();
    lastNow = start;
    if (rafId) cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(frame);
  }

  /* Called when the scene is left: stop everything after the fade-out */
  function leave() {
    timers.forEach(clearTimeout); timers = [];
    setTimeout(() => {
      if (Scenes.getCurrent() === 'scene-fireworks') return;   // came back already
      if (rafId) cancelAnimationFrame(rafId);
      rafId = null;
    }, 1200);
  }

  /* Other parts of the project (like sound) can plug into these later */
  return { init, enter, leave, onLaunch: null, onBurst: null, onCelebrate: null };
})();

const Gift = (() => {
  const TAU = Math.PI * 2;
  const rand = (a, b) => a + Math.random() * (b - a);
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const rgba = (c, a) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;
  const GOLDS = [[255, 205, 100], [255, 232, 160], [255, 246, 220], [232, 201, 122]];

  let scene, stage, anchor, canvas, ctx, msgEl, titleEl, textEl, contBtn, hintEl, flashEl;
  let W = 0, H = 0;
  let parts = [], rings = [];
  let rafId = null, start = 0, lastNow = 0;
  let opened = false, busy = false;
  let leakUntil = 0, fountainUntil = 0, idleAcc = 0, leakAcc = 0, fountainAcc = 0;
  let timers = [];

  /* Make the particle canvas the right size */
  function sizeCanvas() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = canvas.clientWidth;
    H = canvas.clientHeight;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  /* Where is the box (and its opening) on the canvas right now? It floats, so we measure every frame. */
  function measure() {
    const c = canvas.getBoundingClientRect();
    const s = stage.getBoundingClientRect();
    const a = anchor.getBoundingClientRect();
    return {
      cx: s.left + s.width / 2 - c.left, cy: s.top + s.height / 2 - c.top, size: s.width,
      mx: a.left + a.width / 2 - c.left, my: a.top + a.height / 2 - c.top,         // the box opening
      sx: a.left + a.width / 2, sy: a.top + a.height / 2                           // same, in screen coordinates
    };
  }

  /* Add one particle. orb = a big soft floating light. */
  function addPart(o) {
    if (parts.length > 900) return;
    parts.push(Object.assign({ life: 0, max: 2, r: 1.5, g: 0, drag: 1, col: pick(GOLDS), orb: false, ph: rand(0, TAU) }, o));
  }

  /* The big explosion of golden light when the lid comes off */
  function burst() {
    const m = measure();
    for (let i = 0; i < 170; i++) {                          // sparks shooting up in a wide cone
      const a = -Math.PI / 2 + rand(-1.15, 1.15), s = rand(160, 560);
      addPart({ x: m.mx, y: m.my, vx: Math.cos(a) * s, vy: Math.sin(a) * s, g: 320, drag: 0.985, max: rand(1.2, 2.6), r: rand(1, 2.6) });
    }
    for (let i = 0; i < 26; i++) {                           // big soft lights floating upward
      addPart({ x: m.mx + rand(-40, 40), y: m.my, vx: rand(-40, 40), vy: -rand(30, 90), max: rand(3, 5), r: rand(3, 6.5), orb: true });
    }
    rings.push({ x: m.mx, y: m.my, r: 10, life: 0 });        // expanding shockwave ring
    rings.push({ x: m.mx, y: m.my, r: 4, life: -0.15 });
    Sky.burst(m.sx, m.sy, 60);                               // sparkles in the night sky behind
  }

  /* ---------- Main loop ---------- */
  function frame(now) {
    rafId = requestAnimationFrame(frame);
    const dt = Math.min((now - lastNow) / 1000, 0.05);
    lastNow = now;
    const t = (now - start) / 1000;
    const f60 = dt * 60;
    const m = measure();

    // gentle sparkles drifting around the box all the time
    idleAcc += (opened ? 12 : 6) * dt;
    while (idleAcc >= 1) {
      idleAcc -= 1;
      const a = rand(0, TAU), rr = m.size * rand(0.55, 0.9);
      addPart({ x: m.cx + Math.cos(a) * rr, y: m.cy + Math.sin(a) * rr * 0.8, vx: rand(-8, 8), vy: -rand(10, 28), max: rand(1.6, 3), r: rand(0.8, 1.9) });
    }

    // light leaking out of the box while it shakes
    if (t < leakUntil) {
      leakAcc += 80 * dt;
      while (leakAcc >= 1) {
        leakAcc -= 1;
        addPart({ x: m.mx + rand(-m.size * 0.35, m.size * 0.35), y: m.my + rand(0, 8), vx: rand(-30, 30), vy: -rand(60, 200), g: 120, max: rand(0.6, 1.2), r: rand(1, 2) });
      }
    }

    // a fountain of gold for a few seconds after opening
    if (opened && t < fountainUntil) {
      fountainAcc += 90 * dt;
      while (fountainAcc >= 1) {
        fountainAcc -= 1;
        addPart({ x: m.mx + rand(-m.size * 0.3, m.size * 0.3), y: m.my, vx: rand(-120, 120), vy: -rand(220, 520), g: 300, drag: 0.99, max: rand(1.2, 2.2), r: rand(1, 2.3) });
      }
    }

    ctx.clearRect(0, 0, W, H);
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';

    // shockwave rings
    for (let i = rings.length - 1; i >= 0; i--) {
      const r = rings[i];
      r.life += dt;
      if (r.life < 0) continue;
      const k = r.life / 0.9;
      if (k >= 1) { rings.splice(i, 1); continue; }
      r.r += 620 * dt * (1 - k * 0.6);
      ctx.strokeStyle = `rgba(255,236,170,${(1 - k) * 0.8})`;
      ctx.lineWidth = 3 * (1 - k) + 0.5;
      ctx.beginPath(); ctx.arc(r.x, r.y, r.r, 0, TAU); ctx.stroke();
    }

    // particles
    for (let i = parts.length - 1; i >= 0; i--) {
      const p = parts[i];
      p.life += dt;
      const k = p.life / p.max;
      if (k >= 1) { parts.splice(i, 1); continue; }
      const d = Math.pow(p.drag, f60);
      p.vx *= d; p.vy = p.vy * d + p.g * dt;
      p.x += p.vx * dt; p.y += p.vy * dt;
      let a = Math.sin(Math.min(1, k * 1.0) * Math.PI) ;       // fade in and out
      a = Math.pow(a, 0.6);
      if (p.orb) {
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 5);
        g.addColorStop(0, rgba(p.col, a * 0.5));
        g.addColorStop(1, rgba(p.col, 0));
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r * 5, 0, TAU); ctx.fill();
      } else {
        const tw = 0.7 + 0.3 * Math.sin(p.life * 30 + p.ph);
        ctx.fillStyle = rgba(p.col, a * 0.22);
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r * 3.5, 0, TAU); ctx.fill();
        ctx.fillStyle = rgba(p.col, a * tw);
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, TAU); ctx.fill();
      }
    }
    ctx.restore();
  }

  /* ---------- The message ---------- */
  function showMessage() {
    // {name} in the text is replaced with the friend's name from CONFIG
    const fill = (s) => s.replace(/\{name\}/gi, CONFIG.friendName);
    titleEl.textContent = '✦  ' + fill(CONFIG.giftTitle) + '  ✦';
    textEl.textContent = '';
    fill(CONFIG.giftMessage).split(' ').forEach((word, i) => {   // words appear one by one
      const span = document.createElement('span');
      span.className = 'word';
      span.textContent = word;
      span.style.animationDelay = (0.9 + i * 0.09) + 's';
      textEl.appendChild(span);
    });
    msgEl.classList.add('show');
  }

  /* ---------- Opening the gift ---------- */
  function open() {
    if (busy || opened) return;
    busy = true;
    const now = (performance.now() - start) / 1000;

    stage.classList.add('shaking');
    Gift.onShake && Gift.onShake();                         // 1) the box shakes...
    hintEl.classList.add('gone');
    leakUntil = now + 0.9;

    timers.push(setTimeout(() => {                          // 2) ...the lid flies off and light bursts out
      opened = true;
      scene.classList.add('opened');
      fountainUntil = (performance.now() - start) / 1000 + 4.5;
      burst();
      flashEl.classList.add('go');
      Gift.onOpen && Gift.onOpen();
    }, 900));

    timers.push(setTimeout(showMessage, 1900));             // 3) the message appears
    timers.push(setTimeout(() => contBtn.classList.add('show'), 7000));
  }

  /* ---------- Setup ---------- */
  function init() {
    scene = document.getElementById('scene-gift');
    stage = document.getElementById('gift-stage');
    anchor = document.getElementById('gift-anchor');
    canvas = document.getElementById('gift-canvas');
    ctx = canvas.getContext('2d');
    msgEl = document.getElementById('gift-message');
    titleEl = document.getElementById('gift-title');
    textEl = document.getElementById('gift-text');
    contBtn = document.getElementById('gift-continue');
    hintEl = document.getElementById('gift-hint');
    flashEl = document.getElementById('gift-flash');

    stage.addEventListener('click', open);
    hintEl.parentElement.addEventListener('click', open);
    contBtn.addEventListener('click', () => Scenes.go('scene-letter'));

    // Keyboard: Enter / Space opens the gift
    document.addEventListener('keydown', (e) => {
      if (Scenes.getCurrent() !== 'scene-gift' || opened || busy) return;
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); }
    });

    window.addEventListener('resize', () => {
      if (Scenes.getCurrent() === 'scene-gift') sizeCanvas();
    });
  }

  /* Called when the scene appears: a fresh, closed gift */
  function enter() {
    timers.forEach(clearTimeout); timers = [];
    opened = false; busy = false;
    parts = []; rings = [];
    leakUntil = 0; fountainUntil = 0; idleAcc = 0; leakAcc = 0; fountainAcc = 0;

    scene.classList.remove('opened');
    stage.classList.remove('shaking');
    hintEl.classList.remove('gone');
    msgEl.classList.remove('show');
    contBtn.classList.remove('show');
    flashEl.classList.remove('go');
    titleEl.textContent = '';
    textEl.textContent = '';

    sizeCanvas();
    start = performance.now();
    lastNow = start;
    if (rafId) cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(frame);
  }

  /* Called when the scene is left: stop drawing after the fade-out */
  function leave() {
    timers.forEach(clearTimeout); timers = [];
    setTimeout(() => {
      if (Scenes.getCurrent() === 'scene-gift') return;       // came back already
      if (rafId) cancelAnimationFrame(rafId);
      rafId = null;
    }, 1200);
  }

  /* Sound can plug into onOpen later */
  return { init, enter, leave, onOpen: null };
})();

const Sound = (() => {
  const rand = (a, b) => a + Math.random() * (b - a);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const STORE_KEY = 'birthday-surprise-sound';

  let ac = null;                                     // the audio engine (created on the first click)
  let master, comp, analyser, sfxGain, musicGain, reverb, reverbWet, noiseBuf;
  let prefs = { music: true, sfx: true, volume: 0.7 };
  let started = false;                               // true after the viewer clicked "begin"
  let musicEl = null;                                // <audio> element, only used if a music file exists
  let musicMode = 'pending';                         // 'pending' | 'file' | 'generated'
  let genTimer = null, nextBar = 0, barIdx = 0;      // generated-music scheduler
  const recentBursts = [];
  let btn, panel, musicSw, sfxSw, slider;

  /* Volume slider (0-1) -> a more natural loudness curve */
  const level = () => Math.pow(prefs.volume, 1.6);

  /* ---------- Saved settings ---------- */
  function loadPrefs() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORE_KEY));
      if (saved) {
        if (typeof saved.music === 'boolean') prefs.music = saved.music;
        if (typeof saved.sfx === 'boolean') prefs.sfx = saved.sfx;
        if (typeof saved.volume === 'number') prefs.volume = clamp(saved.volume, 0, 1);
      }
    } catch (e) { /* storage not available: fine */ }
  }
  function savePrefs() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(prefs)); } catch (e) { /* ignore */ }
  }

  /* ---------- The audio engine ---------- */
  function ensure() {
    if (ac) return ac;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ac = new AC();

    // master -> compressor (stops loud overlaps from distorting) -> speakers
    comp = ac.createDynamicsCompressor();
    comp.threshold.value = -14; comp.ratio.value = 6;
    master = ac.createGain();
    master.gain.value = level();
    master.connect(comp);
    comp.connect(ac.destination);
    analyser = ac.createAnalyser();                  // (only used by status() for testing)
    comp.connect(analyser);

    sfxGain = ac.createGain();   sfxGain.gain.value = prefs.sfx ? 0.9 : 0;   sfxGain.connect(master);
    musicGain = ac.createGain(); musicGain.gain.value = 0;                    musicGain.connect(master);

    // a little "room echo" so booms and bells sound big
    reverb = ac.createConvolver();
    const len = Math.floor(ac.sampleRate * 1.8);
    const ir = ac.createBuffer(2, len, ac.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const d = ir.getChannelData(ch);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.6);
    }
    reverb.buffer = ir;
    reverbWet = ac.createGain(); reverbWet.gain.value = 0.5;
    reverb.connect(reverbWet); reverbWet.connect(sfxGain);

    // one second of white noise, reused by every "whoosh", "boom" and "crackle"
    noiseBuf = ac.createBuffer(1, ac.sampleRate * 2, ac.sampleRate);
    const nd = noiseBuf.getChannelData(0);
    for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;
    return ac;
  }

  /* Browsers only allow sound after a click/tap, so we "unlock" it on user actions */
  function unlock() {
    ensure();
    if (ac && ac.state === 'suspended') ac.resume().catch(() => {});
  }

  /* Send a sound to the speakers: x = left/right position (0..1), wet = amount of echo */
  function route(node, x, dest, wet) {
    let out = node;
    if (x !== undefined && ac.createStereoPanner) {
      const p = ac.createStereoPanner();
      p.pan.value = clamp((x - 0.5) * 1.6, -1, 1);
      node.connect(p);
      out = p;
    }
    out.connect(dest || sfxGain);
    if (wet) {
      const send = ac.createGain();
      send.gain.value = wet;
      out.connect(send);
      send.connect(reverb);
    }
  }

  /* A musical tone. o: type, to (slide to this pitch), gain, attack, pan, wet, dest */
  function tone(freq, t0, dur, o = {}) {
    const osc = ac.createOscillator(), g = ac.createGain();
    osc.type = o.type || 'sine';
    osc.frequency.setValueAtTime(freq, t0);
    if (o.to) osc.frequency.exponentialRampToValueAtTime(o.to, t0 + dur);
    const attack = o.attack || 0.005;
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(o.gain || 0.2, t0 + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(g);
    route(g, o.pan, o.dest, o.wet);
    osc.start(t0);
    osc.stop(t0 + dur + 0.05);
  }

  /* A burst of filtered noise (booms, whooshes, crackles, claps) */
  function noise(t0, dur, o = {}) {
    const src = ac.createBufferSource();
    src.buffer = noiseBuf;
    const flt = ac.createBiquadFilter();
    flt.type = o.type || 'lowpass';
    flt.Q.value = o.q || 0.7;
    flt.frequency.setValueAtTime(o.f0 || 2000, t0);
    if (o.f1) flt.frequency.exponentialRampToValueAtTime(o.f1, t0 + dur);
    const g = ac.createGain();
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(o.gain || 0.3, t0 + (o.attack || 0.003));
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    src.connect(flt); flt.connect(g);
    route(g, o.pan, o.dest, o.wet);
    src.start(t0, Math.random() * 1.5);
    src.stop(t0 + dur + 0.05);
  }

  /* A bell / chime: a sine plus two higher "overtones" that die away faster */
  function bell(freq, t0, o = {}) {
    const dur = o.dur || 1.6, gain = o.gain || 0.1, wet = o.wet === undefined ? 0.6 : o.wet;
    tone(freq, t0, dur, { gain, wet, pan: o.pan, dest: o.dest });
    tone(freq * 2.76, t0, dur * 0.5, { gain: gain * 0.35, wet, pan: o.pan, dest: o.dest });
    tone(freq * 5.4, t0, dur * 0.25, { gain: gain * 0.15, wet, pan: o.pan, dest: o.dest });
  }

  /* Only play effects if audio is on and the viewer has started the experience */
  const canPlay = () => ac && started && prefs.sfx && ac.state === 'running';

  /* ---------- The sound effects ---------- */

  /* Rocket whistle rising into the sky (x = 0..1 position on screen) */
  function launch(x) {
    if (!canPlay()) return;
    const t = ac.currentTime + 0.01;
    tone(550, t, 0.95, { to: 2100, gain: 0.08, pan: x });
    noise(t, 0.95, { type: 'highpass', f0: 3000, gain: 0.015, pan: x });
  }

  /* Firework explosion: deep boom + noise, then crackles or sparkles */
  function burst(type, x) {
    if (!canPlay()) return;
    const nowMs = performance.now();
    while (recentBursts.length && nowMs - recentBursts[0] > 120) recentBursts.shift();
    if (recentBursts.length >= 3) return;            // too many at once: skip so it never gets muddy
    recentBursts.push(nowMs);

    const t = ac.currentTime + 0.01;
    tone(rand(105, 170), t, 0.7, { to: 36, gain: 0.55, pan: x, wet: 0.25 });
    noise(t, 0.7, { f0: 3200, f1: 250, gain: 0.38, pan: x, wet: 0.35 });

    if (type === 'crackle' || type === 'willow' || type === 'double') {
      const n = Math.round(rand(8, 16));             // crackling sparks
      for (let i = 0; i < n; i++) {
        noise(t + 0.12 + Math.random() * 1.1, 0.03, {
          type: 'bandpass', f0: rand(2500, 6500), q: 1.2, gain: rand(0.03, 0.09),
          pan: clamp((x === undefined ? 0.5 : x) + rand(-0.15, 0.15), 0, 1)
        });
      }
    } else {
      for (let i = 0; i < 3; i++) {                  // glittering pings
        tone(rand(1800, 3600), t + 0.04 + i * 0.07, 0.4, { gain: 0.04, pan: x, wet: 0.4 });
      }
    }
  }

  /* The big "HAPPY BIRTHDAY!" moment: boom, bright fanfare and applause */
  function celebrate() {
    if (!canPlay()) return;
    const t = ac.currentTime + 0.05;
    tone(90, t, 1.2, { to: 30, gain: 0.6, wet: 0.3 });
    noise(t, 1.2, { f0: 2800, f1: 200, gain: 0.4, wet: 0.5 });
    [523.25, 659.25, 783.99, 1046.5, 1318.5, 1568].forEach((f, i) => bell(f, t + 0.15 + i * 0.1, { gain: 0.13, dur: 1.8, wet: 0.7 }));
    [523.25, 659.25, 783.99, 1046.5].forEach((f) => tone(f, t + 0.7, 2.6, { type: 'triangle', attack: 0.5, gain: 0.05, wet: 0.6 }));
    for (let i = 0; i < 110; i++) {                  // applause: lots of tiny claps
      const tt = t + 0.5 + Math.pow(Math.random(), 0.8) * 4.5;
      noise(tt, 0.035, {
        type: 'bandpass', f0: rand(1200, 3200), q: 0.9,
        gain: rand(0.03, 0.1) * (1 - (tt - t) / 6), pan: Math.random()
      });
    }
  }

  /* Blowing out the candles: a whoosh, then a magical little chime for the wish */
  function blowOut() {
    if (!canPlay()) return;
    const t = ac.currentTime + 0.02;
    noise(t, 0.8, { type: 'bandpass', f0: 1400, f1: 300, q: 0.8, gain: 0.35, attack: 0.05 });
    [659.25, 783.99, 987.77, 1318.5].forEach((f, i) => bell(f, t + 1.7 + i * 0.14, { gain: 0.1, dur: 1.8, wet: 0.8 }));
  }

  /* Gift box rattling */
  function giftShake() {
    if (!canPlay()) return;
    const t = ac.currentTime + 0.02;
    for (let i = 0; i < 16; i++) {
      const tt = t + i * 0.052;
      noise(tt, 0.03, { type: 'bandpass', f0: rand(900, 2200), q: 1.5, gain: 0.07 + i * 0.004 });
      tone(rand(180, 260), tt, 0.05, { type: 'square', gain: 0.015 });
    }
  }

  /* Gift box opening: pop, sparkling chimes and a warm glowing chord */
  function giftOpen() {
    if (!canPlay()) return;
    const t = ac.currentTime + 0.02;
    noise(t, 0.3, { type: 'highpass', f0: 800, f1: 6000, gain: 0.3 });
    tone(280, t, 0.2, { to: 900, gain: 0.3 });
    [1046.5, 1318.5, 1568, 2093, 2637, 3136, 2637, 3136, 4186].forEach((f, i) => bell(f, t + 0.1 + i * 0.07, { gain: 0.09, dur: 1.4, wet: 0.7 }));
    [523.25, 659.25, 783.99, 1046.5].forEach((f) => tone(f, t + 0.1, 3, { type: 'triangle', attack: 0.4, gain: 0.045, wet: 0.6 }));
  }

  /* Envelope opening: seal snaps, paper rustles, a soft chime */
  function paperOpen() {
    if (!canPlay()) return;
    const t = ac.currentTime + 0.02;
    tone(1400, t, 0.06, { type: 'triangle', gain: 0.05 });
    noise(t + 0.45, 0.6, { type: 'bandpass', f0: 2500, f1: 5200, q: 0.7, gain: 0.12, attack: 0.12 });
    noise(t + 1.3, 0.8, { type: 'highpass', f0: 1800, f1: 4500, gain: 0.1, attack: 0.2 });
    bell(1046.5, t + 1.0, { gain: 0.06, dur: 1.4 });
  }

  /* One soft typewriter key click */
  function typeTick() {
    if (!canPlay()) return;
    noise(ac.currentTime, 0.014, { type: 'bandpass', f0: rand(2200, 3600), q: 2, gain: 0.022 });
  }

  /* The letter is finished: a gentle ending melody */
  function letterDone() {
    if (!canPlay()) return;
    const t = ac.currentTime + 0.05;
    [659.25, 783.99, 987.77, 1318.5, 1568].forEach((f, i) => bell(f, t + i * 0.16, { gain: 0.08, dur: 2, wet: 0.8 }));
    [523.25, 659.25, 783.99].forEach((f) => tone(f, t, 3, { type: 'triangle', attack: 0.6, gain: 0.04, wet: 0.6 }));
  }

  /* The funny twist: a record scratch, then a sad "wah wah wah waaah" */
  function twistSting() {
    if (!canPlay()) return;
    const t = ac.currentTime + 0.02;
    noise(t, 0.4, { type: 'highpass', f0: 4200, f1: 900, gain: 0.3, attack: 0.01 });
    tone(1100, t, 0.35, { type: 'sawtooth', to: 180, gain: 0.06 });
    [[233.1, 0.55], [220, 1.05], [207.7, 1.55]].forEach(([f, dt]) => tone(f, t + dt, 0.42, { type: 'sawtooth', gain: 0.055, wet: 0.2 }));
    tone(196, t + 2.05, 1.1, { type: 'sawtooth', to: 150, gain: 0.055, wet: 0.2 });
  }

  /* The red stamp hitting the paper: THUD */
  function stampThud() {
    if (!canPlay()) return;
    const t = ac.currentTime + 0.02;
    tone(120, t, 0.35, { to: 45, gain: 0.7, wet: 0.2 });
    noise(t, 0.18, { f0: 1800, f1: 150, gain: 0.45 });
  }

  /* A tiny "ding" when the experience begins */
  function ding() {
    if (!canPlay()) return;
    const t = ac.currentTime + 0.02;
    bell(1318.5, t, { gain: 0.1, dur: 1.2 });
    bell(1975.5, t + 0.09, { gain: 0.08, dur: 1.2 });
  }

  /* ---------- Background music ---------- */
  // Generated fallback: a slow, soft loop (C - Am - F - G) with a music-box melody
  const CHORDS = [
    [130.81, 164.81, 196.0, 261.63],
    [110.0, 130.81, 164.81, 220.0],
    [87.31, 130.81, 174.61, 220.0],
    [98.0, 123.47, 146.83, 196.0]
  ];
  const BEAT = 60 / 68, BAR = BEAT * 4;

  function scheduleBar(t0, idx) {
    const c = CHORDS[idx % 4];
    c.forEach((f) => tone(f, t0, BAR + 0.8, { type: 'triangle', attack: 1.1, gain: 0.035, dest: musicGain }));   // soft pad
    const notes = [c[0] * 4, c[1] * 4, c[2] * 4, c[3] * 2];
    [0, 1, 2, 3, 2, 1, 2, 1].forEach((n, i) => {                                                                  // music-box notes
      const t = t0 + i * BEAT / 2;
      tone(notes[n], t, 1.1, { gain: 0.05, dest: musicGain });
      tone(notes[n] * 2, t, 0.5, { gain: 0.012, dest: musicGain });
    });
  }

  function genStart() {
    if (genTimer || !ac) return;
    nextBar = ac.currentTime + 0.15;
    barIdx = 0;
    const tick = () => {                             // keeps scheduling a little bit ahead of time
      while (nextBar < ac.currentTime + 1.5) { scheduleBar(nextBar, barIdx++); nextBar += BAR; }
    };
    tick();
    genTimer = setInterval(tick, 400);
  }
  function genStop() { clearInterval(genTimer); genTimer = null; }

  /* Use the viewer's music file if it exists, otherwise the generated music */
  function setupMusicFile() {
    if (!CONFIG.musicFile) { musicMode = 'generated'; return; }
    const a = new Audio();
    a.loop = true;
    a.preload = 'auto';
    a.addEventListener('canplay', () => { if (musicMode === 'pending') { musicMode = 'file'; applyMusic(); } }, { once: true });
    a.addEventListener('error', () => { if (musicMode === 'pending') { musicMode = 'generated'; applyMusic(); } }, { once: true });
    a.src = CONFIG.musicFile;
    musicEl = a;
  }

  /* Start or stop the music depending on the settings */
  function applyMusic() {
    if (!ac) return;
    const want = started && prefs.music;
    musicGain.gain.setTargetAtTime(want ? 1.1 : 0, ac.currentTime, 0.25);   // smooth fade
    if (musicMode === 'file') {
      genStop();
      if (want) { musicEl.volume = clamp(level() * 0.6, 0, 1); musicEl.play().catch(() => {}); }
      else musicEl.pause();
    } else if (musicMode === 'generated') {
      if (want) genStart();
      else setTimeout(() => { if (!(started && prefs.music)) genStop(); }, 800);
    }
  }

  /* ---------- The speaker button and settings panel ---------- */
  function renderUI() {
    musicSw.setAttribute('aria-checked', String(prefs.music));
    sfxSw.setAttribute('aria-checked', String(prefs.sfx));
    slider.value = Math.round(prefs.volume * 100);
    btn.classList.toggle('muted', (!prefs.music && !prefs.sfx) || prefs.volume === 0);
  }

  function setVolume(v) {
    prefs.volume = clamp(v, 0, 1);
    if (ac) master.gain.setTargetAtTime(level(), ac.currentTime, 0.05);     // smooth change
    if (musicEl) musicEl.volume = clamp(level() * 0.6, 0, 1);
    savePrefs();
    renderUI();
  }

  function init() {
    loadPrefs();
    btn = document.getElementById('audio-btn');
    panel = document.getElementById('audio-panel');
    musicSw = document.getElementById('music-toggle');
    sfxSw = document.getElementById('sfx-toggle');
    slider = document.getElementById('volume-slider');
    renderUI();
    setupMusicFile();

    // open / close the panel
    const setOpen = (open) => { panel.hidden = !open; btn.setAttribute('aria-expanded', String(open)); };
    btn.addEventListener('click', (e) => { e.stopPropagation(); unlock(); setOpen(panel.hidden); });
    document.addEventListener('click', (e) => { if (!panel.hidden && !panel.contains(e.target) && !btn.contains(e.target)) setOpen(false); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setOpen(false); });

    musicSw.addEventListener('click', () => {
      prefs.music = !prefs.music; savePrefs(); renderUI(); unlock(); applyMusic();
    });
    sfxSw.addEventListener('click', () => {
      prefs.sfx = !prefs.sfx; savePrefs(); renderUI(); unlock();
      if (ac) sfxGain.gain.setTargetAtTime(prefs.sfx ? 0.9 : 0, ac.currentTime, 0.05);
    });
    slider.addEventListener('input', () => setVolume(slider.value / 100));

    // any tap/click unlocks sound (browsers require this)
    document.addEventListener('pointerdown', () => { if (started) unlock(); }, { passive: true });

    // pause everything while the tab is hidden
    document.addEventListener('visibilitychange', () => {
      if (!ac) return;
      if (document.hidden) { ac.suspend(); if (musicEl) musicEl.pause(); }
      else if (started) { ac.resume(); applyMusic(); }
    });
  }

  /* Called on the very first click ("click to begin") */
  function start() {
    started = true;
    unlock();
    applyMusic();
    ding();
  }

  /* For testing: is audio running, and how loud is it right now? */
  function status() {
    let peak = 0;
    if (analyser) {
      const d = new Uint8Array(analyser.fftSize);
      analyser.getByteTimeDomainData(d);
      for (const v of d) peak = Math.max(peak, Math.abs(v - 128) / 128);
    }
    return { state: ac && ac.state, musicMode, started, peak };
  }

  return { init, start, launch, burst, celebrate, blowOut, giftShake, giftOpen, paperOpen, typeTick, letterDone, twistSting, stampThud, ding, status };
})();

const Letter = (() => {
  const rand = (a, b) => a + Math.random() * (b - a);

  let scene, envelope, seal, toEl, paper, inner, actions, replayBtn, hintEl, stampEl, caret;
  let opened = false, reading = false, done = false, twistFired = false;
  let chars = [], idx = 0, typeTimer = null, timers = [];

  /* {name} becomes the friend's name, {from} becomes your name (both set in CONFIG) */
  const fill = (s) => String(s).replace(/\{name\}/gi, CONFIG.friendName).replace(/\{from\}/gi, CONFIG.senderName);

  /* Build the letter text. Every letter gets its own <span>, hidden at first, so that the
     paper already has its final size and nothing jumps around while typing. */
  function build() {
    inner.textContent = '';
    chars = [];
    const blocks = [{ cls: 'l-greet', text: fill(CONFIG.letterGreeting) }];
    fill(CONFIG.letterBody).split(/\n\s*\n/).forEach((t) => blocks.push({ cls: 'l-p', text: t.replace(/\s*\n\s*/g, ' ').trim() }));
    (CONFIG.letterTwist || []).forEach((t) => blocks.push({ cls: 'l-twist', text: fill(t), twist: true }));   // the funny ending
    blocks.push({ cls: 'l-sign', text: fill(CONFIG.letterSignature) });
    blocks.push({ cls: 'l-name', text: fill(CONFIG.senderName) });

    let twistMarked = false;
    blocks.forEach((b) => {
      const p = document.createElement('p');
      p.className = b.cls;
      const startIdx = chars.length;
      const words = b.text.split(' ');
      words.forEach((word, wi) => {
        const w = document.createElement('span');              // words never break in the middle
        w.className = 'w';
        [...word].forEach((ch) => {
          const s = document.createElement('span');
          s.className = 'c';
          s.textContent = ch;
          w.appendChild(s);
          chars.push({ el: s, ch, endPara: false, twistStart: false });
        });
        p.appendChild(w);
        if (wi < words.length - 1) p.appendChild(document.createTextNode(' '));
      });
      if (chars.length) chars[chars.length - 1].endPara = true;
      if (b.twist && !twistMarked && chars.length > startIdx) { chars[startIdx].twistStart = true; twistMarked = true; }
      inner.appendChild(p);
    });

    caret = document.createElement('span');                     // the blinking pen cursor
    caret.className = 'caret';
  }

  /* Type one character, then schedule the next one */
  function step() {
    if (idx >= chars.length) { finish(); return; }
    // The funny twist: the typing stops, the paper shakes and a sad "wah wah" plays
    if (chars[idx].twistStart && !twistFired) {
      twistFired = true;
      caret.remove();
      paper.classList.add('shake');
      Letter.onTwist && Letter.onTwist();
      timers.push(setTimeout(() => paper.classList.remove('shake'), 700));
      typeTimer = setTimeout(step, 2300);
      return;
    }
    const c = chars[idx++];
    c.el.classList.add('on');
    c.el.after(caret);                                           // cursor follows the text
    Letter.onType && Letter.onType(c.ch);

    // keep the cursor in view if the letter is longer than the paper
    const bottom = caret.offsetTop + caret.offsetHeight;
    if (bottom > inner.scrollTop + inner.clientHeight - 24) inner.scrollTop = bottom - inner.clientHeight + 48;

    // typing rhythm: a little pause after commas, a longer one after sentences
    let d = rand(22, 42);
    if (',;:'.includes(c.ch)) d += 170;
    else if ('.!?'.includes(c.ch)) d += 380;
    if (c.endPara) d += 600;
    typeTimer = setTimeout(step, d);
  }

  /* The letter is complete */
  function finish() {
    if (done) return;
    done = true;
    clearTimeout(typeTimer);
    chars.forEach((c) => c.el.classList.add('on'));
    caret.remove();
    inner.scrollTo({ top: inner.scrollHeight, behavior: 'smooth' });      // show the end of the letter
    const hasTwist = (CONFIG.letterTwist || []).length > 0;
    if (!hasTwist) Letter.onDone && Letter.onDone();           // sweet ending melody (only for a normal letter)
    else {                                                      // funny ending: slam the red stamp
      timers.push(setTimeout(() => stampEl.classList.add('slam'), 700));
      timers.push(setTimeout(() => { paper.classList.add('shake'); Letter.onStamp && Letter.onStamp(); }, 1030));
      timers.push(setTimeout(() => paper.classList.remove('shake'), 1700));
    }

    const r = paper.getBoundingClientRect();                     // a few golden sparkles around the paper
    Sky.burst(r.left, r.top + 20, 40);
    timers.push(setTimeout(() => Sky.burst(r.right, r.top + 20, 40), 250));
    timers.push(setTimeout(() => Sky.burst(r.left + r.width / 2, r.bottom, 50), 500));
    timers.push(setTimeout(() => actions.classList.add('show'), hasTwist ? 2600 : 900));
  }

  /* Tapping the paper shows the whole letter immediately */
  function skip() {
    if (!reading || done) return;
    finish();
  }

  /* Opening the envelope */
  function open() {
    if (opened) return;
    opened = true;
    hintEl.classList.add('gone');
    Letter.onOpen && Letter.onOpen();

    const r = seal.getBoundingClientRect();
    Sky.burst(r.left + r.width / 2, r.top + r.height / 2, 50);   // sparkles where the seal breaks
    envelope.classList.add('opening');                           // CSS: seal pops, flap opens, letter rises

    timers.push(setTimeout(() => scene.classList.add('reading'), 3300));   // envelope fades, paper appears
    timers.push(setTimeout(() => { reading = true; step(); }, 4500));      // typing starts
  }

  /* ---------- Setup ---------- */
  function init() {
    scene = document.getElementById('scene-letter');
    envelope = document.getElementById('envelope');
    seal = document.getElementById('env-seal');
    toEl = document.getElementById('env-to');
    paper = document.getElementById('paper');
    inner = document.getElementById('paper-inner');
    actions = document.getElementById('letter-actions');
    replayBtn = document.getElementById('letter-replay');
    hintEl = document.getElementById('letter-hint');
    stampEl = document.getElementById('stamp');

    envelope.addEventListener('click', open);
    hintEl.parentElement.addEventListener('click', open);
    paper.addEventListener('click', skip);
    replayBtn.addEventListener('click', () => Scenes.go('scene-intro'));   // start the whole surprise again

    document.addEventListener('keydown', (e) => {
      if (Scenes.getCurrent() !== 'scene-letter') return;
      if (e.target.closest && e.target.closest('button')) return;
      if (e.key !== 'Enter' && e.key !== ' ') return;
      e.preventDefault();
      if (!opened) open(); else skip();
    });
  }

  /* Called when the scene appears: a fresh, closed envelope */
  function enter() {
    timers.forEach(clearTimeout); timers = [];
    clearTimeout(typeTimer);
    opened = false; reading = false; done = false; twistFired = false; idx = 0;
    scene.classList.remove('reading');
    envelope.classList.remove('opening');
    actions.classList.remove('show');
    stampEl.classList.remove('slam');
    paper.classList.remove('shake');
    hintEl.classList.remove('gone');
    toEl.textContent = 'For ' + CONFIG.friendName;
    inner.scrollTop = 0;
    build();
  }

  function leave() {
    timers.forEach(clearTimeout); timers = [];
    clearTimeout(typeTimer);
  }

  /* Sound can plug into these */
  return { init, enter, leave, onOpen: null, onType: null, onDone: null, onTwist: null, onStamp: null };
})();

function setupFullscreen() {
  const btn = document.getElementById('fullscreen-btn');
  const root = document.documentElement;

  // Some phones (e.g. iPhone Safari) don't support fullscreen: hide the button there.
  const supported = root.requestFullscreen || root.webkitRequestFullscreen;
  if (!supported) { btn.hidden = true; document.body.classList.add('no-fullscreen'); return; }

  btn.addEventListener('click', (e) => {
    e.stopPropagation();                       // don't also trigger "click to begin"
    const isFull = document.fullscreenElement || document.webkitFullscreenElement;
    if (isFull) {
      (document.exitFullscreen || document.webkitExitFullscreen).call(document);
    } else {
      (root.requestFullscreen || root.webkitRequestFullscreen).call(root);
    }
  });
}

function beginExperience(x, y) {
  if (Scenes.getCurrent() !== 'scene-intro') return;
  Sound.start();                               // unlock audio + start music (allowed because of the click)
  Sky.burst(x, y, 60);                         // golden sparkle burst where they clicked
  Scenes.go('scene-memories');                 // Scene 2
}

window.addEventListener('DOMContentLoaded', () => {
  Sky.start();
  setupFullscreen();

  // Scene 2 setup
  Memories.init();
  Scenes.onEnter('scene-memories', Memories.enter);
  Scenes.onLeave('scene-memories', Memories.leave);

  // Scene 3 setup
  Cake.init();
  Scenes.onEnter('scene-cake', Cake.enter);
  Scenes.onLeave('scene-cake', Cake.leave);

  // Scene 4 setup
  Fireworks.init();
  Scenes.onEnter('scene-fireworks', Fireworks.enter);
  Scenes.onLeave('scene-fireworks', Fireworks.leave);

  // Scene 5 setup
  Gift.init();
  Scenes.onEnter('scene-gift', Gift.enter);
  Scenes.onLeave('scene-gift', Gift.leave);

  // Scene 6 setup
  Letter.init();
  Scenes.onEnter('scene-letter', Letter.enter);
  Scenes.onLeave('scene-letter', Letter.leave);

  // Sound: connect the sound effects to the scenes
  Sound.init();
  Fireworks.onLaunch    = (x) => Sound.launch(x);
  Fireworks.onBurst     = (type, x) => Sound.burst(type, x);
  Fireworks.onCelebrate = () => Sound.celebrate();
  Cake.onBlow           = () => Sound.blowOut();
  Gift.onShake          = () => Sound.giftShake();
  Gift.onOpen           = () => Sound.giftOpen();
  Letter.onOpen         = () => Sound.paperOpen();
  Letter.onType         = () => Sound.typeTick();
  Letter.onDone         = () => Sound.letterDone();
  Letter.onTwist        = () => Sound.twistSting();
  Letter.onStamp        = () => Sound.stampThud();

  const intro = document.getElementById('scene-intro');

  // Click / tap anywhere on the opening screen
  intro.addEventListener('click', (e) => beginExperience(e.clientX, e.clientY));

  // Keyboard: Enter or Space also begins
  document.addEventListener('keydown', (e) => {
    if ((e.key === 'Enter' || e.key === ' ') && Scenes.getCurrent() === 'scene-intro') {
      e.preventDefault();
      beginExperience(window.innerWidth / 2, window.innerHeight / 2);
    }
  });

  intro.focus({ preventScroll: true });
});
