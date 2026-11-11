// ambience.js: sound effects for the 3D room, made live with Web Audio (no sound files):
// footsteps (yours and the other agents', placed left/right by where they are) and dice rattling in the tray.
// There is no background soundscape.

export function createAudio() {
  let ctx = null, master = null, enabled = true, active = false, noise = null;
  const AC = typeof window !== "undefined" ? (window.AudioContext || window.webkitAudioContext) : null;

  function ensure() {
    if (!AC) return null;
    if (!ctx) {
      ctx = new AC();
      master = ctx.createGain(); master.gain.value = 0; master.connect(ctx.destination);
      const len = ctx.sampleRate * 3, mk = fill => { const b = ctx.createBuffer(1, len, ctx.sampleRate), d = b.getChannelData(0); fill(d); return b; };
      noise = {
        white: mk(d => { for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; }),
        brown: mk(d => { let l = 0; for (let i = 0; i < d.length; i++) { l = (l + 0.02 * (Math.random() * 2 - 1)) / 1.02; d[i] = l * 3.5; } }),
      };
    }
    if (ctx.state === "suspended") ctx.resume().catch(() => {});
    return ctx;
  }
  // a short burst of filtered noise (clicks, steps)
  function burst({dur = 0.02, gain = 0.1, type = "bandpass", freq = 2000, q = 1, pan = 0, at = 0, kind = "white", decay = 0}) {
    if (!ctx) return;
    const t = ctx.currentTime + at, src = ctx.createBufferSource(); src.buffer = noise[kind];
    const f = ctx.createBiquadFilter(); f.type = type; f.frequency.value = freq; f.Q.value = q;
    const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(Math.max(0.0002, gain), t + 0.004); g.gain.exponentialRampToValueAtTime(0.0001, t + dur + decay);
    let out = g;
    if (pan && ctx.createStereoPanner) { const p = ctx.createStereoPanner(); p.pan.value = Math.max(-1, Math.min(1, pan)); g.connect(p); out = p; }
    src.connect(f); f.connect(g); out.connect(master);
    src.start(t, Math.random() * 2.5); src.stop(t + dur + decay + 0.05);
  }
  function fade() { if (!ctx) return; const on = enabled && active; master.gain.cancelScheduledValues(ctx.currentTime); master.gain.setTargetAtTime(on ? 0.9 : 0, ctx.currentTime, on ? 0.3 : 0.1); }

  return {
    unlock() { if (enabled) ensure(); },
    setEnabled(v) { enabled = !!v; if (enabled && active) ensure(); fade(); },
    get enabled() { return enabled; },
    setActive(v) { active = !!v; if (active && enabled) ensure(); fade(); },
    setRoom() {},
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
    dispose() { try { ctx?.close(); } catch {} ctx = null; },
  };
}
