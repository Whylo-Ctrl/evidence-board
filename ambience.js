// ambience.js: the sound of the 3D room, made live with Web Audio (no sound files).
// Each room has its own soundscape (rain, a crackling stove, fluorescent hum, a ticking clock, distant traffic),
// plus footsteps (yours and the other agents', placed left/right by where they are) and dice rattling in the tray.

const ROOMS = {
  office:     {tone: 0.5, rain: 0.35, clock: 1, hum: "lamp", traffic: 0.5},
  cabin:      {tone: 0.35, rain: 0.9, wind: 0.5, fire: 1, creak: 1},
  cozy:       {tone: 0.4, rain: 0.45, fire: 0.5, hum: "lamp"},
  workshop:   {tone: 0.6, hum: "bulb", drip: 1, wind: 0.25},
  industrial: {tone: 0.9, hum: "tube", drip: 1, wind: 0.45},
  brick:      {tone: 0.45, traffic: 0.8},
  garage:     {tone: 0.6, hum: "bulb", rain: 0.5, drip: 0.6},
  den:        {tone: 0.4, rain: 0.6, clock: 1, hum: "lamp"},
  archive:    {tone: 0.55, hum: "bulb", creak: 0.6},
  precinct:   {tone: 0.6, hum: "tube", clock: 1, traffic: 0.6},
  tabletop:   {tone: 0.4, rain: 1, wind: 0.7, creak: 1},
};

export function createAudio() {
  let ctx = null, master = null, bus = null, enabled = true, active = false, roomKey = "office", light = "lamp";
  let layers = [], timers = [], noise = null;
  const AC = typeof window !== "undefined" ? (window.AudioContext || window.webkitAudioContext) : null;

  function ensure() {
    if (!AC) return null;
    if (!ctx) {
      ctx = new AC();
      master = ctx.createGain(); master.gain.value = 0; master.connect(ctx.destination);
      bus = ctx.createGain(); bus.gain.value = 1; bus.connect(master);
      noise = makeNoise();
    }
    if (ctx.state === "suspended") ctx.resume().catch(() => {});
    return ctx;
  }
  // 3 seconds each of white, pink and brown noise to loop
  function makeNoise() {
    const len = ctx.sampleRate * 3, mk = fill => { const b = ctx.createBuffer(1, len, ctx.sampleRate), d = b.getChannelData(0); fill(d); return b; };
    const white = mk(d => { for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; });
    const pink = mk(d => { let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0; for (let i = 0; i < d.length; i++) { const w = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + w * 0.0555179; b1 = 0.99332 * b1 + w * 0.0750759; b2 = 0.969 * b2 + w * 0.153852; b3 = 0.8665 * b3 + w * 0.3104856; b4 = 0.55 * b4 + w * 0.5329522; b5 = -0.7616 * b5 - w * 0.016898;
      d[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * 0.5362) * 0.11; b6 = w * 0.115926; } });
    const brown = mk(d => { let l = 0; for (let i = 0; i < d.length; i++) { l = (l + 0.02 * (Math.random() * 2 - 1)) / 1.02; d[i] = l * 3.5; } });
    return {white, pink, brown};
  }
  const now = () => ctx.currentTime;
  // a looping noise bed through filters
  function bed(kind, gain, filters, lfo) {
    const src = ctx.createBufferSource(); src.buffer = noise[kind]; src.loop = true; src.loopStart = Math.random();
    let node = src;
    for (const [type, freq, q] of filters) { const f = ctx.createBiquadFilter(); f.type = type; f.frequency.value = freq; if (q) f.Q.value = q; node.connect(f); node = f; }
    const g = ctx.createGain(); g.gain.value = gain; node.connect(g); g.connect(bus);
    let osc = null;
    if (lfo) { osc = ctx.createOscillator(); osc.frequency.value = lfo[0]; const lg = ctx.createGain(); lg.gain.value = gain * lfo[1]; osc.connect(lg); lg.connect(g.gain); osc.start(); }
    src.start(0, Math.random() * 2);
    layers.push({stop() { try { src.stop(); osc?.stop(); } catch {} g.disconnect(); }});
  }
  function hum(freq, gain, harmonics = [1]) {
    const g = ctx.createGain(); g.gain.value = gain; g.connect(bus); const oscs = [];
    harmonics.forEach((h, i) => { const o = ctx.createOscillator(); o.type = i === 0 ? "sine" : "triangle"; o.frequency.value = freq * (i + 1); const og = ctx.createGain(); og.gain.value = h; o.connect(og); og.connect(g); o.start(); oscs.push(o); });
    layers.push({stop() { oscs.forEach(o => { try { o.stop(); } catch {} }); g.disconnect(); }});
  }
  // a short burst of filtered noise (clicks, ticks, crackles, steps)
  function burst({dur = 0.02, gain = 0.1, type = "bandpass", freq = 2000, q = 1, pan = 0, at = 0, kind = "white", decay = 0}) {
    if (!ctx) return;
    const t = now() + at, src = ctx.createBufferSource(); src.buffer = noise[kind];
    const f = ctx.createBiquadFilter(); f.type = type; f.frequency.value = freq; f.Q.value = q;
    const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(Math.max(0.0002, gain), t + 0.004); g.gain.exponentialRampToValueAtTime(0.0001, t + dur + decay);
    let out = g;
    if (pan && ctx.createStereoPanner) { const p = ctx.createStereoPanner(); p.pan.value = Math.max(-1, Math.min(1, pan)); g.connect(p); out = p; }
    src.connect(f); f.connect(g); out.connect(bus);
    src.start(t, Math.random() * 2.5); src.stop(t + dur + decay + 0.05);
  }
  function tone({freq = 800, to = null, dur = 0.08, gain = 0.05, type = "sine", at = 0}) {
    const t = now() + at, o = ctx.createOscillator(), g = ctx.createGain(); o.type = type; o.frequency.setValueAtTime(freq, t); if (to) o.frequency.exponentialRampToValueAtTime(to, t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(gain, t + 0.006); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(bus); o.start(t); o.stop(t + dur + 0.05);
  }
  // repeating random events (crackles, ticks, drips, creaks, passing cars)
  function every(minS, maxS, fn) {
    let id = 0; const tick = () => { if (!active || !enabled) return; fn(); id = setTimeout(tick, (minS + Math.random() * (maxS - minS)) * 1000); timers.push(id); };
    id = setTimeout(tick, Math.random() * maxS * 1000); timers.push(id);
  }
  function stopAll() { layers.forEach(l => l.stop()); layers = []; timers.forEach(clearTimeout); timers = []; }
  function build() {
    stopAll();
    if (!ctx || !active || !enabled) return;
    const R = ROOMS[roomKey] || ROOMS.office;
    bed("brown", 0.05 * R.tone, [["lowpass", 180]]);                                                    // room tone
    if (R.rain) { bed("pink", 0.05 * R.rain, [["highpass", 700], ["lowpass", 7000]], [0.07, 0.25]);      // rain on the roof / window
      every(0.05, 0.25, () => burst({dur: 0.012, gain: 0.02 * R.rain * Math.random(), freq: 2500 + Math.random() * 3000, q: 2, pan: Math.random() * 1.6 - 0.8})); }
    if (R.wind) bed("pink", 0.04 * R.wind, [["lowpass", 420], ["peaking", 300, 1]], [0.05, 0.7]);        // wind around the building
    if (R.fire) { bed("brown", 0.04 * R.fire, [["lowpass", 320]], [0.3, 0.3]);                           // stove roar + crackles
      every(0.04, 0.35, () => burst({dur: 0.006 + Math.random() * 0.02, gain: 0.05 * R.fire * (0.3 + Math.random()), type: "highpass", freq: 1200 + Math.random() * 2500, pan: -0.5 + Math.random() * 0.3})); }
    const h = light === "bright" && R.hum === "lamp" ? "bulb" : R.hum;
    if (h === "tube") hum(120, 0.011, [1, 0.35, 0.2, 0.08]);                                             // fluorescent tubes
    else if (h === "bulb") hum(60, 0.006, [1, 0.25]);
    else if (h === "lamp") hum(60, 0.0035, [1]);
    if (R.clock) { let tock = false; every(1, 1, () => { tock = !tock; burst({dur: 0.008, gain: 0.03, freq: tock ? 2200 : 2900, q: 6, pan: -0.35}); }); }
    if (R.drip) every(2.5, 7, () => { tone({freq: 1400 + Math.random() * 500, to: 600, dur: 0.07, gain: 0.025 * R.drip}); tone({freq: 1200, to: 500, dur: 0.06, gain: 0.008 * R.drip, at: 0.18}); });
    if (R.creak) every(12, 28, () => { const t = now(), o = ctx.createOscillator(), f = ctx.createBiquadFilter(), g = ctx.createGain(); o.type = "sawtooth"; o.frequency.setValueAtTime(110 + Math.random() * 60, t); o.frequency.linearRampToValueAtTime(70 + Math.random() * 40, t + 0.7); f.type = "bandpass"; f.frequency.value = 700; f.Q.value = 8; g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.012 * R.creak, t + 0.15); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.8); o.connect(f); f.connect(g); g.connect(bus); o.start(t); o.stop(t + 0.9); });
    if (R.traffic) { bed("brown", 0.03 * R.traffic, [["lowpass", 350]], [0.04, 0.5]);                    // the city outside
      every(14, 35, () => { const t = now(), src = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain(), p = ctx.createStereoPanner ? ctx.createStereoPanner() : null; src.buffer = noise.pink; f.type = "lowpass"; f.frequency.value = 600; g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.03 * R.traffic, t + 2); g.gain.exponentialRampToValueAtTime(0.0001, t + 4.5); src.connect(f); f.connect(g); if (p) { p.pan.setValueAtTime(-0.8, t); p.pan.linearRampToValueAtTime(0.8, t + 4.5); g.connect(p); p.connect(bus); } else g.connect(bus); src.start(t, Math.random()); src.stop(t + 4.6); }); }
  }
  function fade() { if (!ctx) return; const on = enabled && active; master.gain.cancelScheduledValues(now()); master.gain.setTargetAtTime(on ? 0.9 : 0, now(), on ? 0.6 : 0.15); }

  return {
    unlock() { if (enabled) ensure(); },
    setEnabled(v) { enabled = !!v; if (enabled && active) { ensure(); build(); } else stopAll(); fade(); },
    get enabled() { return enabled; },
    setActive(v) { const was = active; active = !!v; if (active && enabled) { ensure(); if (!was) build(); } else if (!active) setTimeout(() => { if (!active) stopAll(); }, 400); fade(); },
    setRoom(key, lightMode) { const changed = key !== roomKey || lightMode !== light; roomKey = key; light = lightMode || "lamp"; if (changed && ctx && active && enabled) build(); },
    // a footstep on a wooden floor; vol 0..1, pan -1 (left) .. 1 (right)
    step({vol = 0.6, pan = 0} = {}) {
      if (!ctx || !enabled || !active || vol < 0.02) return;
      const v = vol * (0.8 + Math.random() * 0.4);
      burst({dur: 0.05, gain: 0.22 * v, type: "lowpass", freq: 380 + Math.random() * 160, q: 0.8, pan, kind: "brown", decay: 0.06});
      burst({dur: 0.012, gain: 0.05 * v, type: "bandpass", freq: 1800 + Math.random() * 900, q: 1.5, pan, at: 0.006});
    },
    // dice tumbling into the felt tray
    dice(n = 1) {
      if (!ctx || !enabled || !active) return;
      for (let d = 0; d < Math.min(6, n); d++) { let t = d * 0.09; for (let i = 0; i < 7; i++) { t += 0.04 + Math.random() * 0.09 * (1 + i * 0.25); burst({at: t, dur: 0.01, gain: 0.07 * Math.pow(0.78, i), freq: 2200 + Math.random() * 1800, q: 3, pan: 0.25}); } }
    },
    dispose() { stopAll(); try { ctx?.close(); } catch {} ctx = null; },
  };
}
