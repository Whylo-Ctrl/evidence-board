// agent3d.js: the agent figure (Feds, CIA or Military) built from a "look".
// Used by the 3D room (other agents) and by the character creator preview.
// Everything is generated: simple shapes, plus canvas-drawn faces, camouflage and patches.
// The figure faces -z, stands on y = 0 and is about 1.8 m tall; its right hand is at +x.

export const FACTIONS = [["fed", "Feds"], ["cia", "CIA"], ["mil", "Military"]];
const C = {navy: "#1c2638", black: "#151618", charcoal: "#2b2c2f", grey: "#5c6166", khaki: "#8c7c5d", tan: "#a38c63", od: "#4d5435", ranger: "#3e4535",
  coyote: "#7e6a4e", sage: "#7d8768", white: "#e9e6de", denim: "#3b4f6e", leather: "#3d2b20", olive: "#3a3f33", police: "#24315a"};
const P = id => "pat:" + id;

// tops (each faction has its own list); kind decides the cut
export const TOPS = [
  {id: "fbi_suit", fac: "fed", name: "FBI suit", kind: "suit", body: C.navy, shirt: C.white, tie: "pin", pants: "match", boots: "dress"},
  {id: "fbi_tac", fac: "fed", name: "FBI tactical", kind: "shirt", body: "#1f2a40", tuck: true, pants: "tac_navy", boots: "tactical"},
  {id: "swat", fac: "fed", name: "Black SWAT", kind: "shirt", body: C.black, tuck: true, pants: "tac_black", boots: "combat"},
  {id: "navy_uni", fac: "fed", name: "Navy uniform", kind: "shirt", body: C.police, tuck: true, pants: "match", boots: "tactical"},
  {id: "grey_tac", fac: "fed", name: "Grey tactical", kind: "shirt", body: C.grey, tuck: true, pants: "tac_black", boots: "tactical"},
  {id: "plain", fac: "fed", name: "Plainclothes", kind: "suit", body: "#5a4838", shirt: "#9db4cc", tie: false, pants: "chinos", boots: "dress"},
  {id: "raid", fac: "fed", name: "Raid jacket", kind: "jacket", body: "#161d2c", nylon: true, back: "FBI", pants: "chinos", boots: "tactical"},
  {id: "hoodie", fac: "fed", name: "Tactical hoodie", kind: "hoodie", body: "#2e3136", pants: "tac_black", boots: "tactical"},
  {id: "combat_fed", fac: "fed", name: "Combat shirt", kind: "shirt", body: C.grey, sleeves: C.navy, tuck: true, pants: "tac_navy", boots: "combat"},
  {id: "cia_suit", fac: "cia", name: "Business suit", kind: "suit", body: C.charcoal, shirt: C.white, tie: "pin", pants: "match", boots: "dress"},
  {id: "cia_blackshirt", fac: "cia", name: "Black dress shirt", kind: "suit", body: C.black, shirt: "#1d1d20", tie: false, pants: "match", boots: "dress"},
  {id: "cia_greyshirt", fac: "cia", name: "Grey dress shirt", kind: "suit", body: C.charcoal, shirt: "#8a8e93", tie: "#151618", pants: "match", boots: "dress"},
  {id: "cia_trench", fac: "cia", name: "Trench coat", kind: "trench", body: C.tan, shirt: C.white, tie: "pin", pants: "slacks", boots: "dress"},
  {id: "cia_tacblack", fac: "cia", name: "Tactical black", kind: "shirt", body: C.black, tuck: true, pants: "tac_black", boots: "tactical"},
  {id: "cia_covert", fac: "cia", name: "Covert ops", kind: "jacket", body: C.olive, pants: "tac_black", boots: "tactical"},
  {id: "cia_street", fac: "cia", name: "Streetwear", kind: "open", body: C.leather, shirt: "#7a7f85", pants: "jeans", boots: "tactical"},
  {id: "cia_fatigues", fac: "cia", name: "Fatigues", kind: "shirt", body: P("multicam"), hem: true, pants: "match", boots: "desert"},
  {id: "cia_darkjacket", fac: "cia", name: "Dark tactical jacket", kind: "jacket", body: "#1a1b1e", pants: "tac_black", boots: "tactical"},
  {id: "cia_lightcombat", fac: "cia", name: "Light combat shirt", kind: "shirt", body: C.coyote, sleeves: C.ranger, tuck: true, pants: "tac_coyote", boots: "desert"},
  {id: "ocp", fac: "mil", name: "Army OCP", kind: "shirt", body: P("ocp"), hem: true, pants: "match", boots: "desert"},
  {id: "woodland", fac: "mil", name: "Woodland", kind: "shirt", body: P("woodland"), hem: true, pants: "match", boots: "combat"},
  {id: "desert", fac: "mil", name: "Desert", kind: "shirt", body: P("desert"), hem: true, pants: "match", boots: "desert"},
  {id: "multicam", fac: "mil", name: "Multicam", kind: "shirt", body: P("multicam"), hem: true, pants: "match", boots: "desert"},
  {id: "marpat", fac: "mil", name: "Marine MARPAT", kind: "shirt", body: P("marpat"), hem: true, pants: "match", boots: "desert"},
  {id: "nwu", fac: "mil", name: "Navy uniform", kind: "shirt", body: P("nwu"), hem: true, pants: "match", boots: "combat"},
  {id: "mil_black", fac: "mil", name: "Black tactical", kind: "shirt", body: C.black, tuck: true, pants: "match", boots: "combat"},
  {id: "ranger_green", fac: "mil", name: "Ranger green", kind: "shirt", body: C.ranger, hem: true, pants: "match", boots: "combat"},
  {id: "coyote_uni", fac: "mil", name: "Coyote brown", kind: "shirt", body: C.coyote, hem: true, pants: "match", boots: "desert"},
  {id: "fatigues", fac: "mil", name: "Combat fatigues", kind: "shirt", body: C.od, hem: true, pants: "match", boots: "combat"},
  {id: "ghillie", fac: "mil", name: "Ghillie suit", kind: "ghillie", body: P("woodland"), hem: true, pants: "match", boots: "combat"},
  {id: "tank", fac: "mil", name: "Tank crew", kind: "coverall", body: "#5f5e40", pants: "match", boots: "combat"},
  {id: "flight", fac: "mil", name: "Flight suit", kind: "coverall", body: C.sage, pants: "match", boots: "combat"},
  {id: "dress", fac: "mil", name: "Dress uniform", kind: "suit", body: "#3b4330", shirt: "#b9aa8a", tie: "#3a2a1e", brass: true, pants: "dress_tan", boots: "dress"},
];
export const PANTS = [
  ["auto", "Goes with top"], ["slacks", "Dark slacks", {c: C.charcoal}], ["chinos", "Chinos", {c: C.khaki}], ["jeans", "Jeans", {c: C.denim}],
  ["tac_khaki", "Tactical khaki", {c: C.khaki, cargo: 1}], ["tac_black", "Tactical black", {c: C.black, cargo: 1}], ["tac_navy", "Tactical navy", {c: "#1f2a40", cargo: 1}],
  ["tac_grey", "Tactical grey", {c: C.grey, cargo: 1}], ["tac_coyote", "Tactical coyote", {c: C.coyote, cargo: 1}], ["tac_ranger", "Ranger green", {c: C.ranger, cargo: 1}],
  ["woodland", "Woodland", {c: P("woodland"), cargo: 1}], ["desert", "Desert", {c: P("desert"), cargo: 1}], ["multicam", "Multicam", {c: P("multicam"), cargo: 1}],
  ["ocp", "OCP", {c: P("ocp"), cargo: 1}], ["marpat", "MARPAT", {c: P("marpat"), cargo: 1}], ["dress_tan", "Dress trousers", {c: "#9a8a70"}],
];
export const BOOTS = [["auto", "Goes with top"], ["dress", "Dress shoes"], ["combat", "Combat"], ["desert", "Desert"], ["tactical", "Black tactical"]];
export const COLORS = ["#1c2638", "#151618", "#5c6166", "#3e4535", "#7e6a4e", "#4d5435", "#5a2a2a", "#2e4a5e", "#6b5a7a", "#a38c63"];
export const VESTS = [["none", "None"], ["soft", "Ballistic vest"], ["badge", "Badge vest"], ["heavy", "SWAT heavy"], ["plate", "Plate carrier"], ["lowpro", "Low-profile"], ["iotv", "IOTV armor"], ["rig", "Chest rig"], ["concealed", "Concealed"]];
export const GEAR_COLORS = [["auto", "Auto"], ["black", "Black", "#17181a"], ["navy", "Navy", "#1d2639"], ["coyote", "Coyote", "#7e6a4e"], ["ranger", "Ranger green", "#3e4535"], ["od", "Olive drab", "#4d5435"], ["tan", "Tan", "#a38c63"], ["grey", "Grey", "#55595e"], ["multicam", "Multicam", P("multicam")]];
export const HEAD_COLORS = [...GEAR_COLORS, ["maroon", "Maroon", "#5e1a22"], ["green", "Beret green", "#2f4a2b"]];
export const GEAR = [["belt", "Utility belt"], ["holster", "Shoulder holster"], ["legholster", "Drop-leg holster"], ["radio", "Radio harness"], ["ammo", "Ammo pouches"], ["med", "Medical pouch"], ["light", "Flashlight"], ["badge", "Belt badge"], ["kneepads", "Knee pads"]];
export const WATCHES = [["none", "None"], ["digital", "Digital"], ["analog", "Analog"], ["tactical", "Tactical"]];
export const PACKS = [["none", "None"], ["small", "Small"], ["medium", "Medium"], ["assault", "Assault"], ["radio", "Radio pack"]];
export const HEADS = [["none", "None"], ["fedora", "Fedora"], ["cap", "Baseball cap"], ["beanie", "Beanie"], ["boonie", "Boonie hat"], ["patrol", "Patrol cap"], ["beret", "Beret"], ["fast", "FAST helmet"], ["ach", "ACH helmet"], ["pilot", "Pilot helmet"]];
export const HELMETS = ["fast", "ach", "pilot"];
export const HELMET_ADDS = [["nvg", "Night vision"], ["camera", "Camera"], ["hlight", "Light"]];
export const EARS = [["none", "None"], ["earpiece", "Earpiece"], ["headset", "Headset"]];
export const COVERS = [["none", "None"], ["balaclava", "Balaclava"]];
export const EYEWEAR = [["none", "None"], ["sun", "Sunglasses"], ["aviator", "Aviators"], ["goggles", "Clear goggles"], ["disguise", "Disguise glasses"], ["glasses", "Glasses"]];
export const NECKS = [["none", "None"], ["shemagh", "Shemagh"], ["gaiter", "Neck gaiter"], ["scarf", "Scarf"]];
export const GLOVES = [["none", "None"], ["leather", "Leather"], ["tactical", "Tactical"], ["fingerless", "Fingerless"]];
export const FACIAL = [["none", "Clean"], ["stubble", "Stubble"], ["mustache", "Mustache"], ["goatee", "Goatee"], ["beard", "Full beard"]];
export const PAINT = [["none", "None"], ["eyeblack", "Eye black"], ["camo", "Camo paint"]];
export const EYE_COLORS = ["#4a2e1a", "#3f6f9c", "#4f7a45", "#7a6234", "#7d8790"];
export const HAIR = [["crew", "Crew cut"], ["buzz", "Buzz cut"], ["fade", "Fade"], ["short", "Short"], ["slick", "Slicked"], ["long", "Long"], ["bald", "Bald"]];
export const SKINS = ["#f3d7bd", "#e0b48f", "#c48e66", "#9c6744", "#74482d", "#4e3020"];
export const HAIRS = ["#1d1814", "#3b2618", "#6b3d22", "#a2763f", "#d2b27a", "#8f8c88"];
export const PATCHES = {
  fed: ["FBI", "FEDERAL AGENT", "SWAT", "HRT", "POLICE", "DEA", "ATF", "US MARSHALS", "HOMELAND SECURITY"],
  cia: ["CIA", "SPECIAL ACTIVITIES CENTER", "INTELLIGENCE", "OPERATIONS", "FIELD OFFICER", "UNDERCOVER", "CLASSIFIED"],
  mil: ["US ARMY", "USMC", "SPECIAL FORCES", "RANGERS", "AIRBORNE", "AIR ASSAULT", "MEDIC", "SNIPER", "RECON", "MILITARY POLICE"],
};
export const FLAGS = [["none", "None"], ["full", "Full colour"], ["subdued", "Subdued"]];
export const RANKS = ["Recruit", "Officer", "Agent", "Special Agent", "Commander", "Director"];
export const UNITS = {
  fed: ["FBI HRT", "FBI SWAT", "FBI Field Office", "DEA", "ATF", "US Marshals", "Homeland Security"],
  cia: ["CIA SAC", "CIA Ground Branch", "CIA Field Station", "CIA Analysts"],
  mil: ["Army Rangers", "Green Berets", "Marines", "Airborne", "Military Police", "Army Medics"],
};

const COMMON = {color: null, pants: "auto", boots: "auto", vest: "none", vestColor: "auto", gear: [], watch: "none", pack: "none", head: "none", headColor: "auto",
  capText: "", helmetAdd: [], ears: "none", cover: "none", eyewear: "none", neck: "none", gloves: "none", facial: "none", scar: false, freckles: false, paint: "none",
  eyeColor: 0, hair: "short", hairColor: 1, skin: 1, patchChest: "", patchBack: "", patchShoulder: "", flag: "none", nametape: false, rank: "", unit: "", callsign: ""};
export const PRESETS = {
  fed: {...COMMON, faction: "fed", top: "fbi_suit", ears: "earpiece", watch: "analog", capText: "FBI", rank: "Special Agent"},
  cia: {...COMMON, faction: "cia", top: "cia_suit", ears: "earpiece", eyewear: "sun", watch: "analog", capText: "CIA", rank: "Officer"},
  mil: {...COMMON, faction: "mil", top: "ocp", head: "patrol", gear: ["belt"], watch: "tactical", hair: "crew", capText: "US ARMY", patchShoulder: "US ARMY", flag: "subdued", nametape: true},
};
// features that belong to the person, kept when switching faction
export const PERSONAL = ["skin", "hair", "hairColor", "eyeColor", "facial", "scar", "freckles", "callsign"];

const has = (list, v) => list.some(x => (Array.isArray(x) ? x[0] : x) === v);
const arr = v => Array.isArray(v) ? v : v && typeof v === "object" ? Object.values(v) : [];
const idx = (v, n, d) => Number.isInteger(+v) && +v >= 0 && +v < n ? +v : d;
function legacy(l) { // the first version of looks (kit + style)
  const top = {fed: {suit: "fbi_suit", windbreaker: "raid"}, cia: {suit: "cia_suit", trench: "cia_trench"}, mil: {fatigues: "woodland", dress: "dress"}}[l.kit]?.[l.style];
  return {faction: l.kit, top, skin: l.skin, hair: l.hair === "none" ? "bald" : l.hair, hairColor: l.hairColor, head: l.hat, eyewear: l.shades ? "sun" : "none"};
}
export function cleanLook(raw) {
  let l = raw && typeof raw === "object" ? {...raw} : {};
  if (l.kit && !l.faction) l = legacy(l);
  const f = has(FACTIONS, l.faction) ? l.faction : "fed", d = PRESETS[f];
  for (const k of Object.keys(l)) if (l[k] === undefined) delete l[k];
  l = {...d, ...l, faction: f};
  if (!TOPS.some(t => t.id === l.top && t.fac === f)) l.top = d.top;
  l.color = /^#[0-9a-f]{6}$/i.test(l.color || "") ? l.color : null;
  const pickL = (k, list) => { if (!has(list, l[k])) l[k] = d[k]; };
  pickL("pants", PANTS); pickL("boots", BOOTS); pickL("vest", VESTS); pickL("vestColor", GEAR_COLORS); pickL("watch", WATCHES); pickL("pack", PACKS);
  pickL("head", HEADS); pickL("headColor", HEAD_COLORS); pickL("ears", EARS); pickL("cover", COVERS); pickL("eyewear", EYEWEAR); pickL("neck", NECKS);
  pickL("gloves", GLOVES); pickL("facial", FACIAL); pickL("paint", PAINT); pickL("hair", HAIR); pickL("flag", FLAGS);
  l.gear = [...new Set(arr(l.gear).filter(g => has(GEAR, g)))];
  l.helmetAdd = [...new Set(arr(l.helmetAdd).filter(g => has(HELMET_ADDS, g)))];
  l.skin = idx(l.skin, SKINS.length, 1); l.hairColor = idx(l.hairColor, HAIRS.length, 1); l.eyeColor = idx(l.eyeColor, EYE_COLORS.length, 0);
  for (const k of ["patchChest", "patchBack", "patchShoulder", "capText"]) if (l[k] && !PATCHES[f].includes(l[k])) l[k] = "";
  l.rank = RANKS.includes(l.rank) ? l.rank : "";
  l.unit = UNITS[f].includes(l.unit) ? l.unit : "";
  l.callsign = String(l.callsign || "").replace(/[^\p{L}\p{N} .'-]/gu, "").slice(0, 14).trim();
  l.scar = !!l.scar; l.freckles = !!l.freckles; l.nametape = !!l.nametape;
  const out = {}; for (const k of Object.keys(PRESETS.fed)) out[k] = l[k]; out.faction = f;
  return out;
}
export function switchFaction(l, f) { const keep = {}; for (const k of PERSONAL) keep[k] = l[k]; return cleanLook({...PRESETS[f], ...keep, rank: l.rank && RANKS.includes(l.rank) ? l.rank : PRESETS[f].rank}); }
export function randomLook(base) {
  const r = a => a[Math.floor(Math.random() * a.length)], k = l => r(l)[0], maybe = (p, v, n) => Math.random() < p ? v : n;
  const f = base?.faction || r(FACTIONS)[0], mil = f === "mil";
  return cleanLook({
    faction: f, top: r(TOPS.filter(t => t.fac === f)).id, color: maybe(0.2, r(COLORS), null), pants: maybe(0.75, "auto", k(PANTS)), boots: "auto",
    vest: maybe(mil ? 0.7 : 0.4, k(VESTS.slice(1)), "none"), vestColor: maybe(0.7, "auto", k(GEAR_COLORS)), gear: GEAR.filter(() => Math.random() < 0.3).map(g => g[0]),
    watch: k(WATCHES), pack: maybe(mil ? 0.5 : 0.15, k(PACKS.slice(1)), "none"), head: maybe(mil ? 0.85 : 0.45, k(HEADS.slice(1)), "none"), headColor: maybe(0.7, "auto", k(HEAD_COLORS)),
    capText: maybe(0.7, r(PATCHES[f]), ""), helmetAdd: HELMET_ADDS.filter(() => Math.random() < 0.35).map(g => g[0]), ears: k(EARS), cover: maybe(0.12, "balaclava", "none"),
    eyewear: maybe(0.45, k(EYEWEAR.slice(1)), "none"), neck: maybe(0.25, k(NECKS.slice(1)), "none"), gloves: maybe(0.4, k(GLOVES.slice(1)), "none"),
    facial: maybe(0.45, k(FACIAL.slice(1)), "none"), scar: Math.random() < 0.15, freckles: Math.random() < 0.15, paint: mil ? maybe(0.3, k(PAINT.slice(1)), "none") : "none",
    eyeColor: Math.floor(Math.random() * EYE_COLORS.length), hair: k(HAIR), hairColor: Math.floor(Math.random() * HAIRS.length), skin: Math.floor(Math.random() * SKINS.length),
    patchChest: maybe(0.5, r(PATCHES[f]), ""), patchBack: maybe(0.5, r(PATCHES[f]), ""), patchShoulder: maybe(0.6, r(PATCHES[f]), ""), flag: k(FLAGS), nametape: Math.random() < (mil ? 0.8 : 0.3),
    rank: base?.rank ?? r(RANKS), unit: base?.unit ?? maybe(0.6, r(UNITS[f]), ""), callsign: base?.callsign || "",
  });
}
export function labelLines(look, name) {
  const l = cleanLook(look);
  return [(l.rank ? l.rank + " " : "") + name, [l.callsign ? `"${l.callsign}"` : "", l.unit].filter(Boolean).join(" · ")].filter(Boolean);
}
export const isHelmet = id => HELMETS.includes(id);
export const topOf = l => TOPS.find(t => t.id === l.top) || TOPS[0];
// limbs that can swing: pivots at the hips and shoulders (and the neck), driven by the room's walk cycle
function makeRig(legs, arms, head, sign = 1, eyes = null, extra = null) {
  return {
    set(st) {
      if (legs) { legs[0].rotation.x = sign * st.legL; legs[1].rotation.x = sign * st.legR; }
      if (arms) { arms[0].rotation.x = sign * st.armL; arms[1].rotation.x = sign * st.armR; }
      if (head) head.rotation.y = st.head || 0;
      extra?.(st);
    },
    blink(v) { if (eyes) for (const e of eyes) e.scale.y = Math.max(0.08, 1 - v); },
  };
}
// sort a flat figure's parts onto hip / shoulder / neck pivots by where they sit
function rigFlat(THREE, g, P) {
  const mk = (x, y, z) => { const p = new THREE.Group(); p.position.set(x, y, z); g.add(p); return p; };
  const legs = [mk(-P.hipX, P.hipY, 0), mk(P.hipX, P.hipY, 0)], arms = [mk(-P.shX, P.shY, P.shZ || 0), mk(P.shX, P.shY, P.shZ || 0)], head = P.neckY ? mk(0, P.neckY, 0) : null;
  for (const m of [...g.children]) {
    if (!m.isMesh || m.isInstancedMesh) continue;
    const {x, y} = m.position, ax = Math.abs(x); let to = null;
    if (head && y > 1.545) to = head;
    else if (y < 0.86 && ax > 0.02) to = legs[x < 0 ? 0 : 1];
    else if (ax > P.armX && (y > 1.0 || ax > 0.23) && y < 1.5) to = arms[x < 0 ? 0 : 1];
    if (to) { m.position.sub(to.position); to.add(m); }
  }
  return {legs, arms, head};
}

// ---------- canvas textures (shared, small) ----------
const texCache = new Map();
function canvasTex(THREE, key, w, h, draw, repeat = 1) {
  if (texCache.has(key)) return texCache.get(key);
  const c = document.createElement("canvas"); c.width = w; c.height = h; draw(c.getContext("2d"), w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  if (repeat !== 1) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(repeat, repeat); }
  texCache.set(key, t); return t;
}
function seeded(seed) { let s = seed; return () => (s = (s * 16807) % 2147483647) / 2147483647; }
const PATS = {
  woodland: ["#5b5f3e", ["#3e4a2c", "#6e6146", "#262a1c", "#7c7a52"], "blob"],
  desert: ["#c9b48a", ["#a88f63", "#8a7552", "#d8c7a0"], "blob"],
  multicam: ["#a39a77", ["#7f7a55", "#5d6142", "#8b7a5c", "#c2b593", "#3d3a2c"], "soft"],
  ocp: ["#a8a07c", ["#6f7353", "#8c7b5f", "#cfc5a2", "#4b4a38"], "soft"],
  marpat: ["#6a6a4b", ["#3f4630", "#7a6a4c", "#272a1d", "#5f6145"], "pixel"],
  nwu: ["#2c3a5a", ["#1e2638", "#4a5a78", "#151a26"], "pixel"],
};
function patTex(THREE, id) {
  const [base, cols, kind] = PATS[id] || PATS.woodland;
  return canvasTex(THREE, "pat:" + id, 256, 256, (c, w, h) => {
    const rnd = seeded(id.length * 977 + 13);
    c.fillStyle = base; c.fillRect(0, 0, w, h);
    if (kind === "pixel") {
      for (const col of cols) for (let i = 0; i < 70; i++) { c.fillStyle = col; const x = Math.floor(rnd() * 64) * 4, y = Math.floor(rnd() * 64) * 4; for (let k = 0; k < 9; k++) c.fillRect(x + Math.floor(rnd() * 5 - 2) * 4, y + Math.floor(rnd() * 5 - 2) * 4, 4, 4); }
      return;
    }
    for (const col of cols) for (let i = 0; i < (kind === "soft" ? 34 : 26); i++) {
      c.fillStyle = col; c.globalAlpha = kind === "soft" ? 0.75 : 1; c.beginPath();
      const x = rnd() * w, y = rnd() * h, r = (kind === "soft" ? 6 : 8) + rnd() * 18;
      for (let k = 0; k < 8; k++) { const a = k / 8 * Math.PI * 2, rr = r * (0.55 + rnd() * 0.6); c.lineTo(x + Math.cos(a) * rr * 1.5, y + Math.sin(a) * rr); }
      c.fill();
    }
    c.globalAlpha = 1;
  }, 2);
}
function textTex(THREE, text, o = {}) {
  const w = o.w || 256, h = o.h || 72, key = ["txt", text, w, h, o.bg, o.fg, o.border, o.round].join("|");
  return canvasTex(THREE, key, w, h, (c) => {
    if (o.bg) { c.fillStyle = o.bg; c.beginPath(); c.roundRect(2, 2, w - 4, h - 4, o.round ?? 10); c.fill(); }
    if (o.border) { c.strokeStyle = o.border; c.lineWidth = 4; c.beginPath(); c.roundRect(5, 5, w - 10, h - 10, Math.max(0, (o.round ?? 10) - 3)); c.stroke(); }
    c.fillStyle = o.fg || "#fff"; c.textAlign = "center"; c.textBaseline = "middle";
    const fit = (s, max) => { let fs = h * (o.scale || 0.66); do { c.font = `bold ${fs}px Arial, Helvetica, sans-serif`; fs -= 2; } while (c.measureText(s).width > max && fs > 8); return fs; };
    const words = String(text).split(" ");
    if (words.length > 1 && fit(text, w * 0.86) < h * 0.36) {
      const mid = Math.ceil(words.length / 2), a = words.slice(0, mid).join(" "), b = words.slice(mid).join(" ");
      let fs = h * 0.4; c.font = `bold ${fs}px Arial, sans-serif`;
      while ((c.measureText(a).width > w * 0.86 || c.measureText(b).width > w * 0.86) && fs > 8) { fs -= 2; c.font = `bold ${fs}px Arial, sans-serif`; }
      c.fillText(a, w / 2, h * 0.33); c.fillText(b, w / 2, h * 0.7);
    } else { fit(text, w * 0.86); c.fillText(text, w / 2, h / 2 + 2); }
  });
}
function flagTex(THREE, kind) {
  return canvasTex(THREE, "flag:" + kind, 190, 100, (c, w, h) => {
    const sub = kind === "subdued", red = sub ? "#3e3f2c" : "#b22234", white = sub ? "#7a7656" : "#f2f0ea", blue = sub ? "#3e3f2c" : "#3c3b6e";
    c.fillStyle = sub ? "#55553f" : "#222"; c.fillRect(0, 0, w, h);
    for (let i = 0; i < 13; i++) { c.fillStyle = i % 2 ? white : red; c.fillRect(4, 4 + i * (h - 8) / 13, w - 8, (h - 8) / 13 + 0.5); }
    c.fillStyle = blue; c.fillRect(4, 4, (w - 8) * 0.4, (h - 8) * 7 / 13);
    c.fillStyle = white; for (let y = 0; y < 5; y++) for (let x = 0; x < 6; x++) { c.beginPath(); c.arc(12 + x * 11.5 + (y % 2) * 5, 11 + y * 9.5, 2, 0, Math.PI * 2); c.fill(); }
  });
}
// the face is painted on a thin shell over the front half of the head:
// canvas x 0 is the agent's right cheek, 128 the middle of the face; y 0 is the forehead, 160 the chin
function faceTex(THREE, l) {
  const key = ["face", l.eyeColor, l.hairColor, l.facial, l.scar, l.freckles, l.paint, l.skin].join("|");
  return canvasTex(THREE, key, 256, 160, (c) => {
    const hair = HAIRS[l.hairColor], rnd = seeded(7 + l.skin);
    if (l.paint === "camo") {
      c.save(); c.globalAlpha = 0.85;
      const bands = ["#2c3a22", "#16180f", "#4f5a32", "#16180f", "#2c3a22", "#5b4a2e"];
      bands.forEach((col, i) => { c.fillStyle = col; c.beginPath(); c.moveTo(-40 + i * 52, 0); c.lineTo(10 + i * 52, 0); c.lineTo(-30 + i * 52, 160); c.lineTo(-80 + i * 52, 160); c.fill(); });
      c.restore();
    }
    if (l.freckles) { c.fillStyle = "rgba(120,60,30,.45)"; for (let i = 0; i < 46; i++) { const side = rnd() < 0.5 ? -1 : 1; c.beginPath(); c.arc(128 + side * (8 + rnd() * 34), 72 + rnd() * 22, 0.9 + rnd() * 1.1, 0, 7); c.fill(); } }
    if (l.facial === "stubble" || l.facial === "beard") {
      c.fillStyle = l.facial === "beard" ? hair : "rgba(0,0,0,0)";
      if (l.facial === "beard") { c.beginPath(); c.moveTo(48, 70); c.quadraticCurveTo(54, 150, 128, 160); c.quadraticCurveTo(202, 150, 208, 70); c.lineTo(196, 72); c.quadraticCurveTo(186, 98, 160, 102); c.lineTo(96, 102); c.quadraticCurveTo(70, 98, 60, 72); c.fill(); }
      else { for (let i = 0; i < 1400; i++) { const x = 52 + rnd() * 152, y = 92 + rnd() * 68; const dx = (x - 128) / 80, dy = (y - 160) / 70; if (dx * dx + dy * dy > 1.05) continue; c.fillStyle = `rgba(30,22,16,${0.12 + rnd() * 0.18})`; c.fillRect(x, y, 1.4, 1.4); } }
    }
    if (l.facial === "mustache" || l.facial === "goatee" || l.facial === "beard") { c.fillStyle = hair; c.beginPath(); c.ellipse(128, 108, 25, 6.5, 0, 0, Math.PI * 2); c.fill(); }
    if (l.facial === "goatee") { c.fillStyle = hair; c.beginPath(); c.ellipse(128, 139, 15, 15, 0, 0, Math.PI * 2); c.fill(); c.fillRect(104, 106, 6, 26); c.fillRect(146, 106, 6, 26); }
    if (l.paint === "eyeblack") { c.fillStyle = "rgba(15,15,15,.88)"; c.fillRect(84, 74, 26, 8); c.fillRect(146, 74, 26, 8); }
    if (l.scar) { c.strokeStyle = "rgba(150,70,70,.85)"; c.lineWidth = 2.5; c.beginPath(); c.moveTo(168, 50); c.lineTo(182, 96); c.stroke(); c.lineWidth = 1.3; for (let t = 0.15; t < 1; t += 0.2) { const x = 168 + 14 * t, y = 50 + 46 * t; c.beginPath(); c.moveTo(x - 5, y + 1); c.lineTo(x + 5, y - 1); c.stroke(); } }
    // eyes
    for (const sx of [-1, 1]) {
      const x = 128 + sx * 29, y = 64;
      c.fillStyle = "#f4efe6"; c.beginPath(); c.ellipse(x, y, 8.5, 5, 0, 0, Math.PI * 2); c.fill();
      c.fillStyle = EYE_COLORS[l.eyeColor]; c.beginPath(); c.arc(x, y, 4.3, 0, Math.PI * 2); c.fill();
      c.fillStyle = "#0c0a08"; c.beginPath(); c.arc(x, y, 2, 0, Math.PI * 2); c.fill();
      c.fillStyle = "rgba(255,255,255,.8)"; c.fillRect(x + 1, y - 2.5, 1.6, 1.6);
      c.strokeStyle = "rgba(40,24,16,.7)"; c.lineWidth = 1.6; c.beginPath(); c.ellipse(x, y, 8.8, 5.3, 0, Math.PI * 1.05, Math.PI * 1.95); c.stroke();
      c.strokeStyle = hair; c.lineWidth = 3.6; c.lineCap = "round"; c.beginPath(); c.moveTo(x - 10, y - 10); c.quadraticCurveTo(x, y - 15, x + 10, y - 10); c.stroke();
    }
    c.strokeStyle = "rgba(120,50,45,.85)"; c.lineWidth = 2.2; c.beginPath(); c.moveTo(114, 118); c.quadraticCurveTo(128, 122, 142, 118); c.stroke();
  });
}
function balaclavaTex(THREE, col) {
  return canvasTex(THREE, "bala:" + col, 256, 128, (c, w, h) => { c.fillStyle = col; c.fillRect(0, 0, w, h); c.clearRect(166, 50, 52, 16); });
}
function medTex(THREE) { return canvasTex(THREE, "medcross", 64, 64, c => { c.fillStyle = "#7e6a4e"; c.fillRect(0, 0, 64, 64); c.fillStyle = "#c62828"; c.fillRect(24, 10, 16, 44); c.fillRect(10, 24, 44, 16); }); }
function checkerTex(THREE, a, b) { return canvasTex(THREE, "chk:" + a + b, 64, 64, c => { c.fillStyle = a; c.fillRect(0, 0, 64, 64); c.fillStyle = b; for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) if ((x + y) % 2) c.fillRect(x * 8, y * 8, 8, 8); }, 3); }

const lum = hex => { const n = parseInt(hex.slice(1), 16); return ((n >> 16) * 0.3 + ((n >> 8) & 255) * 0.59 + (n & 255) * 0.11) / 255; };
const PATCH_STYLE = {fed: {bg: "#1d2742", fg: "#e8c22c"}, cia: {bg: "#141414", fg: "#d9d4c5"}, mil: {bg: "#5b5c45", fg: "#151510"}};

// ---------- the figure ----------
export function buildAgent(THREE, look, o = {}) {
  if (o.style === "blocky") return buildBlocky(THREE, look, o);
  if (o.style === "athletic" && ATH) return buildAthletic(THREE, look, o);
  const L = cleanLook(look), f = L.faction, top = topOf(L), mobile = !!o.mobile, pin = o.color || "#c0392b";
  const g = new THREE.Group(), trash = [], mats = new Map();
  const M = p => { const m = new THREE.MeshStandardMaterial({envMapIntensity: 0.35, ...p}); trash.push(m); return m; };
  const solid = (c, r = 0.8, extra = {}) => { const k = c + "|" + r + JSON.stringify(extra); if (!mats.has(k)) mats.set(k, M({color: c, roughness: r, ...extra})); return mats.get(k); };
  const fabric = (v, r = 0.85) => typeof v === "string" && v.startsWith("pat:") ? (mats.get(v) || (mats.set(v, M({map: patTex(THREE, v.slice(4)), roughness: 0.92})), mats.get(v))) : solid(v, r);
  const add = (geo, m, x, y, z, rot, scl, parent = g) => { trash.push(geo); const me = new THREE.Mesh(geo, m); me.position.set(x, y, z); if (rot) me.rotation.set(rot[0] || 0, rot[1] || 0, rot[2] || 0); if (scl) me.scale.set(scl[0], scl[1], scl[2]); me.castShadow = !mobile; parent.add(me); return me; };
  const box = (w, h, d, m, x, y, z, rot, scl) => add(new THREE.BoxGeometry(w, h, d), m, x, y, z, rot, scl);
  const cyl = (rt, rb, h, m, x, y, z, rot, scl, seg = 14, open = false) => add(new THREE.CylinderGeometry(rt, rb, h, seg, 1, open), m, x, y, z, rot, scl);
  const sph = (r, m, x, y, z, scl, rot, seg = 14, part) => add(part ? new THREE.SphereGeometry(r, seg, Math.max(6, seg * 0.7 | 0), ...part) : new THREE.SphereGeometry(r, seg, Math.max(6, seg * 0.7 | 0)), m, x, y, z, rot, scl);
  const decal = (tex, w, h, x, y, z, ry = 0) => { const p = add(new THREE.PlaneGeometry(w, h), M({map: tex, transparent: true, alphaTest: 0.05, roughness: 0.75, polygonOffset: true, polygonOffsetFactor: -2}), x, y, z, [0, ry, 0]); p.castShadow = false; return p; };
  const FRONT = Math.PI; // decals facing the front (-z)

  // colours
  const body = L.color && !top.body.startsWith("pat:") ? L.color : top.body;
  const bodyM = fabric(body, top.nylon ? 0.45 : 0.85), sleeveM = top.sleeves ? fabric(top.sleeves) : bodyM;
  const skin = SKINS[L.skin], skinM = solid(skin, 0.62), hairM = solid(HAIRS[L.hairColor], 0.85), darkM = solid("#15130f", 0.35);
  const shirtM = solid(top.shirt || body, 0.7);
  const isPat = v => typeof v === "string" && v.startsWith("pat:");
  const gearAuto = () => f === "fed" ? (L.vest === "heavy" ? "#17181a" : "#1d2639") : f === "cia" ? "#17181a" : (["ocp", "multicam", "cia_fatigues"].includes(top.id) ? P("multicam") : "#7e6a4e");
  const gearCol = L.vestColor === "auto" ? gearAuto() : GEAR_COLORS.find(x => x[0] === L.vestColor)[2];
  const gearM = fabric(gearCol, 0.75);

  // torso shape: tapered, flattened cylinder from y .95 to 1.49
  const bulk = L.vest === "concealed" ? 1.07 : 1;
  const rAt = y => 0.175 + 0.03 * Math.min(1, Math.max(0, (y - 0.95) / 0.54));
  const fz = o.fz || (y => -rAt(y) * 0.62 * bulk); // front surface
  const bz = o.bz || (y => rAt(y) * 0.62 * bulk);  // back surface
  const G = !!o.gearOnly; // only the clothes-on-top layer (for the athletic body)

  if (!G) {
  // ----- legs and feet -----
  const pantsId = L.pants === "auto" ? (top.pants || "match") : L.pants;
  const pSpec = pantsId === "match" ? {c: body, cargo: !["suit", "trench", "open"].includes(top.kind)} : (PANTS.find(p => p[0] === pantsId)?.[2] || {c: C.charcoal});
  const pantsM = top.kind === "coverall" ? bodyM : fabric(pSpec.c, 0.8);
  const bootsId = L.boots === "auto" ? top.boots : L.boots;
  for (const sx of [-1, 1]) {
    const x = sx * 0.09;
    if (bootsId === "dress") box(0.1, 0.07, 0.25, solid("#0f0d0b", 0.3), x, 0.035, -0.035);
    else if (bootsId === "tactical") { box(0.106, 0.09, 0.255, solid("#141414", 0.6), x, 0.045, -0.035); cyl(0.07, 0.072, 0.09, solid("#141414", 0.6), x, 0.13, 0); }
    else { const bm = solid(bootsId === "desert" ? "#a88d63" : "#121212", 0.7); box(0.112, 0.09, 0.26, bm, x, 0.045, -0.035); cyl(0.071, 0.073, 0.2, bm, x, 0.18, 0); box(0.114, 0.02, 0.262, solid("#1a1714", 0.9), x, 0.01, -0.035); }
    cyl(0.078, 0.066, 0.84, pantsM, x, 0.49, 0, null, null, 12);
    if (pSpec.cargo) box(0.035, 0.13, 0.1, pantsM, sx * 0.165, 0.6, 0);
    if (L.gear.includes("kneepads")) box(0.1, 0.11, 0.04, solid("#1a1a1a", 0.6), x, 0.45, -0.085);
  }
  cyl(0.178, 0.17, 0.17, pantsM, 0, 0.93, 0, null, [1, 1, 0.64], 18);

  // ----- torso and arms -----
  cyl(0.205, 0.175, 0.54, bodyM, 0, 1.22, 0, null, [1, 1, 0.62 * bulk], 22);
  for (const sx of [-1, 1]) {
    sph(0.083, sleeveM, sx * 0.19, 1.44, 0);
    cyl(0.062, 0.052, 0.62, sleeveM, sx * 0.235, 1.13, 0, [0, 0, sx * 0.07], null, 12);
  }
  // hands and gloves
  const gloveCol = L.gloves === "leather" ? "#2f1e14" : f === "mil" ? "#6e5d45" : "#161616";
  for (const sx of [-1, 1]) {
    const hx = sx * 0.258;
    if (L.gloves === "none") sph(0.046, skinM, hx, 0.79, 0);
    else if (L.gloves === "fingerless") { sph(0.044, skinM, hx, 0.785, 0); sph(0.047, solid(gloveCol, 0.7), hx, 0.8, 0, [1, 0.6, 1]); }
    else { sph(0.048, solid(gloveCol, L.gloves === "leather" ? 0.45 : 0.75), hx, 0.79, 0); if (L.gloves === "tactical") box(0.04, 0.025, 0.05, solid("#0c0c0c", 0.6), hx + sx * 0.03, 0.79, -0.01); }
  }
  // watch on the left wrist
  if (L.watch !== "none") {
    const wx = -0.256;
    cyl(0.053, 0.053, 0.026, solid(L.watch === "analog" ? "#4a3626" : "#111", 0.6), wx, 0.85, 0);
    if (L.watch === "digital") box(0.008, 0.032, 0.036, solid("#222", 0.3), wx - 0.054, 0.85, 0);
    else if (L.watch === "analog") { cyl(0.022, 0.022, 0.008, solid("#c9c9c9", 0.25, {metalness: 0.8}), wx - 0.054, 0.85, 0, [0, 0, Math.PI / 2], null, 16); cyl(0.018, 0.018, 0.009, solid("#f4f1e8", 0.4), wx - 0.055, 0.85, 0, [0, 0, Math.PI / 2], null, 16); }
    else cyl(0.026, 0.026, 0.014, solid("#0d0d0d", 0.5), wx - 0.056, 0.85, 0, [0, 0, Math.PI / 2], null, 16);
  }

  // ----- the cut of the top -----
  const k = top.kind;
  if (k === "suit" || k === "trench" || k === "open") {
    cyl(0.178, 0.19, 0.13, bodyM, 0, 0.885, 0, null, [1, 1, 0.66]); // jacket hem over the hips
    cyl(0.064, 0.064, 0.05, k === "open" ? shirtM : shirtM, 0, 1.5, 0);
    if (k === "open") { box(0.085, 0.5, 0.008, shirtM, 0, 1.22, fz(1.22) - 0.002); }
    else {
      add(new THREE.ConeGeometry(0.075, 0.24, 3), shirtM, 0, 1.37, fz(1.37) + 0.004, [Math.PI, 0, 0], [1, 1, 0.12]);
      const lapM = top.body.startsWith("pat:") ? bodyM : solid(body, 0.6);
      const lw = k === "trench" ? 0.05 : 0.03;
      for (const sx of [-1, 1]) box(lw, 0.25, 0.012, lapM, sx * (0.05 + lw / 3), 1.37, fz(1.37) - 0.004, [0, 0, sx * 0.32]);
      if (top.tie) { const tieM = solid(top.tie === "pin" ? pin : top.tie, 0.5); box(0.034, 0.21, 0.012, tieM, 0, 1.3, fz(1.3) - 0.006, [0.08, 0, 0]); box(0.03, 0.03, 0.02, tieM, 0, 1.43, fz(1.43) - 0.004); }
      for (const y of [1.12, 1.02]) sph(0.009, darkM, 0.0, y, fz(y) - 0.004, null, null, 8);
    }
    if (k === "trench") {
      add(new THREE.CylinderGeometry(0.2, 0.27, 0.78, 22, 1, true), M({color: body, roughness: 0.8, side: THREE.DoubleSide}), 0, 0.88, 0, null, [1, 1, 0.68]);
      box(0.39, 0.05, 0.27, solid(body, 0.6), 0, 1.04, 0);
      for (const sx of [-1, 1]) box(0.09, 0.015, 0.05, solid(body, 0.6), sx * 0.18, 1.5, 0, [0, 0, sx * -0.25]);
    }
    if (top.brass) {
      const brass = solid("#c9a24a", 0.3, {metalness: 0.8});
      for (const y of [1.3, 1.21, 1.12]) sph(0.011, brass, 0.04, y, fz(y) - 0.008, null, null, 8);
      ["#9c1f24", "#1f3f8a", "#d6b23a"].forEach((c, i) => box(0.026, 0.016, 0.008, solid(c, 0.5), -0.11 + i * 0.027, 1.36, fz(1.36) - 0.002));
    }
  } else if (k === "shirt" || k === "ghillie") {
    cyl(0.067, 0.066, 0.045, bodyM, 0, 1.49, 0);
    for (const sx of [-1, 1]) {
      box(0.055, 0.035, 0.012, bodyM, sx * 0.032, 1.47, fz(1.47) - 0.006, [0, 0, sx * 0.6]);
      box(0.075, 0.085, 0.012, bodyM, sx * 0.085, 1.3, fz(1.3) - 0.005);
      box(0.078, 0.025, 0.016, bodyM, sx * 0.085, 1.345, fz(1.345) - 0.007);
    }
    box(0.022, 0.46, 0.006, M({color: "#000", transparent: true, opacity: 0.18}), 0, 1.22, fz(1.22) - 0.003);
    if (top.hem) cyl(0.18, 0.186, 0.1, bodyM, 0, 0.9, 0, null, [1, 1, 0.66]);
    if (k === "ghillie") {
      const n = mobile ? 110 : 260, cone = new THREE.ConeGeometry(0.022, 0.1, 4); trash.push(cone);
      const tm = M({roughness: 1}); const im = new THREE.InstancedMesh(cone, tm, n); im.castShadow = !mobile;
      const dmy = new THREE.Object3D(), col = new THREE.Color(), pal = ["#4b5a2c", "#6b6a3a", "#3a3f22", "#7a6a42", "#5a4a2c", "#2f3a1e"], rnd = seeded(99);
      for (let i = 0; i < n; i++) {
        const part = rnd(); let x, y, z;
        if (part < 0.45) { const a = rnd() * Math.PI * 2; y = 0.95 + rnd() * 0.55; x = Math.cos(a) * rAt(y); z = Math.sin(a) * rAt(y) * 0.62; }
        else if (part < 0.65) { const sx = rnd() < 0.5 ? -1 : 1, a = rnd() * Math.PI * 2; y = 0.85 + rnd() * 0.6; x = sx * 0.24 + Math.cos(a) * 0.06; z = Math.sin(a) * 0.06; }
        else if (part < 0.9) { const sx = rnd() < 0.5 ? -1 : 1, a = rnd() * Math.PI * 2; y = 0.2 + rnd() * 0.7; x = sx * 0.09 + Math.cos(a) * 0.075; z = Math.sin(a) * 0.075; }
        else { const a = rnd() * Math.PI * 2, t = rnd() * 0.9; y = 1.66 + Math.cos(t) * 0.13; x = Math.cos(a) * Math.sin(t) * 0.13; z = Math.sin(a) * Math.sin(t) * 0.13 + 0.02; if (z < -0.04 && y < 1.76) z = 0.06; }
        dmy.position.set(x, y, z); dmy.rotation.set(Math.PI + (rnd() - 0.5) * 1.2, rnd() * 6.28, (rnd() - 0.5) * 1.2); dmy.scale.setScalar(0.7 + rnd() * 0.8); dmy.updateMatrix();
        im.setMatrixAt(i, dmy.matrix); im.setColorAt(i, col.set(pal[Math.floor(rnd() * pal.length)]));
      }
      g.add(im);
    }
  } else if (k === "jacket" || k === "hoodie" || k === "coverall") {
    const zipM = solid("#8a8a8a", 0.4, {metalness: 0.6});
    box(0.008, k === "coverall" ? 0.6 : 0.5, 0.006, zipM, 0, k === "coverall" ? 1.18 : 1.22, fz(1.22) - 0.004);
    cyl(0.18, 0.183, 0.05, solid(body.startsWith("pat:") ? "#333" : body, 0.7), 0, 0.93, 0, null, [1, 1, 0.66]);
    if (k === "hoodie") {
      sph(0.12, bodyM, 0, 1.5, 0.11, [1.1, 0.7, 0.8]);
      cyl(0.085, 0.08, 0.04, bodyM, 0, 1.5, 0);
      box(0.2, 0.1, 0.015, bodyM, 0, 1.03, fz(1.03) - 0.006);
      for (const sx of [-1, 1]) cyl(0.004, 0.004, 0.12, solid("#ddd", 0.7), sx * 0.03, 1.4, fz(1.4) - 0.008, null, null, 6);
    } else {
      cyl(0.072, 0.075, 0.07, bodyM, 0, 1.5, 0);
      for (const sx of [-1, 1]) box(0.012, 0.09, 0.006, zipM, sx * 0.1, k === "coverall" ? 1.3 : 1.06, fz(1.1) - 0.006, [0, 0, sx * -0.3]);
      if (k === "coverall") for (const sx of [-1, 1]) box(0.05, 0.035, 0.012, bodyM, sx * 0.032, 1.47, fz(1.47) - 0.006, [0, 0, sx * 0.6]);
    }
  }

  } // end of the body parts

  // ----- vests -----
  const V = L.vest, hardVest = ["soft", "badge", "heavy", "plate", "lowpro", "iotv"].includes(V);
  let chestZ = fz(1.32) - 0.004, backZ = bz(1.3) + 0.004, vestD = 0;
  if (hardVest) {
    const S = {soft: [0.36, 0.4, 0.025, 1.23], badge: [0.36, 0.4, 0.025, 1.23], heavy: [0.4, 0.46, 0.06, 1.2], plate: [0.3, 0.32, 0.045, 1.25], lowpro: [0.28, 0.3, 0.03, 1.26], iotv: [0.42, 0.5, 0.055, 1.2]}[V];
    const [w, h, d, yc] = S; vestD = d;
    box(w, h, d, gearM, 0, yc, fz(yc) - d / 2 + 0.006, [-0.035, 0, 0]);
    box(w, h, d, gearM, 0, yc, bz(yc) + d / 2 - 0.006, [0.035, 0, 0]);
    add(new THREE.CylinderGeometry(0.205, 0.205, V === "heavy" || V === "iotv" ? 0.26 : 0.13, 22, 1, true), M({color: isPat(gearCol) ? "#7e6a4e" : gearCol, map: isPat(gearCol) ? patTex(THREE, gearCol.slice(4)) : null, roughness: 0.8, side: THREE.DoubleSide}), 0, V === "heavy" || V === "iotv" ? 1.12 : 1.07, 0, null, [1, 1, 0.72]);
    for (const sx of [-1, 1]) box(0.07, 0.03, 0.26, gearM, sx * 0.12, 1.49, 0);
    chestZ = fz(1.32) - d + 0.002; backZ = bz(1.3) + d - 0.002;
    if (V === "heavy" || V === "iotv") {
      add(new THREE.CylinderGeometry(0.1, 0.115, 0.075, 18, 1, true), M({color: isPat(gearCol) ? "#7e6a4e" : gearCol, roughness: 0.8, side: THREE.DoubleSide}), 0, 1.5, 0, null, [1, 1, 0.9]);
      for (const sx of [-1, 1]) box(0.1, 0.05, 0.18, gearM, sx * 0.22, 1.42, 0, [0, 0, sx * -0.45]);
      box(0.16, 0.14, 0.03, gearM, 0, 0.87, fz(1) - 0.03);
      if (V === "iotv") for (const sx of [-1, 1]) cyl(0.075, 0.07, 0.14, gearM, sx * 0.226, 1.33, 0, [0, 0, sx * 0.07]);
    }
    if (V === "plate") { for (const x of [-0.07, 0, 0.07]) box(0.06, 0.1, 0.04, gearM, x, 1.16, fz(1.16) - d - 0.015); box(0.13, 0.06, 0.02, gearM, 0, 1.3, fz(1.3) - d - 0.006); }
    if (V === "badge") box(0.035, 0.045, 0.006, solid("#d4af37", 0.3, {metalness: 0.85}), -0.09, 1.35, chestZ - 0.003);
  } else if (V === "rig") {
    box(0.34, 0.14, 0.05, gearM, 0, 1.12, fz(1.12) - 0.025);
    for (const x of [-0.12, -0.04, 0.04, 0.12]) box(0.065, 0.11, 0.035, gearM, x, 1.17, fz(1.12) - 0.065);
    for (const sx of [-1, 1]) { box(0.04, 0.3, 0.012, gearM, sx * 0.1, 1.33, fz(1.33) - 0.008, [-0.035, 0, 0]); box(0.04, 0.03, 0.26, gearM, sx * 0.11, 1.49, 0); }
    for (const sx of [-1, 1]) box(0.04, 0.42, 0.012, gearM, 0, 1.26, bz(1.26) + 0.008, [0, 0, sx * 0.55]);
  }

  // ----- belt and gear -----
  const belt = top.tuck || L.gear.some(x => ["belt", "ammo", "med", "light", "badge", "legholster"].includes(x));
  if (belt) {
    if (!G) box(0.375, 0.048, 0.24, solid(L.gear.includes("belt") ? (f === "mil" ? "#5c4f3a" : "#161616") : "#1b1410", 0.6), 0, 0.97, 0);
    box(0.045, 0.035, 0.01, solid("#9a9a9a", 0.3, {metalness: 0.7}), 0, 0.97, -0.125);
  }
  if (L.gear.includes("ammo")) for (const x of [-0.07, -0.125]) box(0.048, 0.08, 0.035, gearM, x, 0.95, -0.13);
  if (L.gear.includes("med")) { box(0.08, 0.08, 0.05, solid("#7e6a4e", 0.8), 0.15, 0.95, 0.07); decal(medTex(THREE), 0.06, 0.06, 0.15, 0.95, 0.097); }
  if (L.gear.includes("light")) cyl(0.016, 0.016, 0.11, solid("#111", 0.4), -0.19, 0.94, 0.0);
  if (L.gear.includes("badge")) box(0.035, 0.045, 0.006, solid("#d4af37", 0.3, {metalness: 0.85}), 0.09, 0.975, -0.126);
  if (L.gear.includes("holster")) {
    const strap = solid("#2a1d14", 0.6);
    for (const sx of [-1, 1]) box(0.03, 0.42, 0.008, strap, 0, 1.28, bz(1.28) + 0.006 + vestD, [0, 0, sx * 0.6]);
    box(0.045, 0.14, 0.06, strap, -0.17, 1.2, -0.01); box(0.03, 0.05, 0.035, darkM, -0.17, 1.29, -0.02);
  }
  if (L.gear.includes("legholster")) { box(0.05, 0.16, 0.1, solid("#111", 0.6), 0.17, 0.7, -0.01); box(0.04, 0.06, 0.035, darkM, 0.17, 0.8, -0.03); for (const y of [0.66, 0.76]) cyl(0.084, 0.084, 0.02, solid("#111", 0.6), 0.09, y, 0, null, null, 12, true); }
  if (L.gear.includes("radio")) {
    box(0.045, 0.09, 0.03, solid("#111", 0.5), -0.11, 1.33, chestZ - 0.018); cyl(0.004, 0.004, 0.11, darkM, -0.12, 1.43, chestZ - 0.018, null, null, 6);
    if (!hardVest && V !== "rig") box(0.03, 0.62, 0.008, solid("#1a1a1a", 0.6), 0, 1.24, fz(1.24) - 0.006, [0, 0, 0.55]);
  }

  // ----- backpack -----
  if (L.pack !== "none") {
    const [w, h, d] = {small: [0.26, 0.3, 0.12], medium: [0.3, 0.38, 0.16], assault: [0.32, 0.46, 0.18], radio: [0.26, 0.34, 0.15]}[L.pack];
    const pm = fabric(gearCol === P("multicam") ? gearCol : (L.vestColor === "auto" && f !== "mil" ? "#1d1d1f" : gearCol), 0.8);
    const z = bz(1.22) + vestD + d / 2;
    box(w, h, d, pm, 0, 1.25 - (h - 0.3) / 3, z);
    box(w * 0.8, h * 0.35, 0.04, pm, 0, 1.18, z + d / 2 + 0.015);
    if (L.pack === "assault") box(w * 0.9, 0.06, d * 0.9, pm, 0, 1.25 + h / 2 - 0.05, z);
    if (L.pack === "radio") { box(0.1, 0.05, 0.04, solid("#222", 0.5), 0.05, 1.2 + h / 2, z); cyl(0.004, 0.004, 0.6, darkM, 0.08, 1.5 + h / 2, z, [0, 0, -0.08], null, 6); }
    for (const sx of [-1, 1]) box(0.04, 0.3, 0.012, pm, sx * 0.095, 1.33, fz(1.33) - vestD - 0.012, [-0.035, 0, 0]);
  }

  // ----- neck and head -----
  const bala = L.cover === "balaclava", balaCol = f === "mil" ? "#2a2c22" : "#111214";
  if (!G) cyl(0.05, 0.052, 0.1, bala ? solid(balaCol, 0.9) : skinM, 0, 1.54, 0);
  if (L.neck === "shemagh") { const sm = M({map: checkerTex(THREE, f === "mil" ? "#b9a77f" : "#2a2a2a", f === "mil" ? "#5a4a32" : "#d8d2c4"), roughness: 0.95}); cyl(0.095, 0.11, 0.085, sm, 0, 1.51, 0, null, [1, 1, 0.9]); add(new THREE.ConeGeometry(0.08, 0.14, 3), sm, 0, 1.4, fz(1.4) - 0.02, [Math.PI, 0, 0], [1, 1, 0.2]); }
  else if (L.neck === "gaiter") cyl(0.066, 0.066, 0.11, fabric(gearCol, 0.9), 0, 1.53, 0);
  else if (L.neck === "scarf") { const sm = solid(f === "cia" ? "#6b1e24" : "#4a4a4a", 0.95); cyl(0.08, 0.086, 0.06, sm, 0, 1.51, 0); box(0.05, 0.3, 0.012, sm, 0.05, 1.33, fz(1.33) - 0.012 - vestD); }

  const HY = 1.66; // centre of the head
  if (!G) {
  sph(0.115, skinM, 0, HY, 0, [1, 1.1, 1], null, 22);
  sph(0.02, L.cover === "balaclava" ? solid(f === "mil" ? "#2a2c22" : "#111214", 0.9) : skinM, 0, 1.652, -0.117, [0.8, 1, 1.1], null, 10); // nose
  if (L.cover !== "balaclava") for (const sx of [-1, 1]) sph(0.022, skinM, sx * 0.115, HY, 0, [0.5, 1, 1], null, 10); // ears
  const face = add(new THREE.SphereGeometry(0.1163, 32, 16, Math.PI, Math.PI, 0.25 * Math.PI, 0.5 * Math.PI), M({map: faceTex(THREE, L), transparent: true, alphaTest: 0.04, roughness: 0.6, polygonOffset: true, polygonOffsetFactor: -1}), 0, HY, 0, null, [1, 1.1, 1]);
  face.castShadow = false;
  if (bala) sph(0.1188, M({map: balaclavaTex(THREE, balaCol), transparent: true, alphaTest: 0.5, roughness: 0.95}), 0, HY, 0, [1, 1.1, 1], null, 26);
  }
  // hair
  const helmet = isHelmet(L.head), hatOn = L.head !== "none";
  if (!bala && L.hair !== "bald") {
    const capHair = (r, len, m = hairM, rx = 0.32) => sph(r, m, 0, HY + 0.005, 0.004, [1, 1.08, 1], [rx, 0, 0], 20, [0, Math.PI * 2, 0, Math.PI * len]);
    const H = L.hair;
    if (H === "crew") capHair(0.121, 0.44);
    else if (H === "buzz") capHair(0.1175, 0.46, M({color: HAIRS[L.hairColor], roughness: 0.95, transparent: true, opacity: 0.8}));
    else if (H === "fade") { capHair(0.1225, 0.3, hairM, 0.15); capHair(0.117, 0.5, M({color: HAIRS[L.hairColor], roughness: 0.95, transparent: true, opacity: 0.45})); }
    else if (H === "short") capHair(0.122, 0.5);
    else if (H === "slick") { capHair(0.121, 0.46); if (!hatOn) box(0.2, 0.04, 0.03, hairM, 0, 1.755, -0.075, [-0.5, 0, 0]); }
    else if (H === "long") { capHair(0.124, 0.52); box(0.23, 0.24, 0.07, hairM, 0, 1.56, 0.075); }
  }
  // eyewear (eyes are at y 1.68)
  const EY = 1.68, EZ = -0.121;
  if (L.eyewear === "sun" || L.eyewear === "aviator") {
    const lens = L.eyewear === "sun" ? solid("#0b0b0b", 0.1, {metalness: 0.5}) : solid("#2d3b31", 0.08, {metalness: 0.7});
    const gold = solid("#c9a24a", 0.3, {metalness: 0.8});
    for (const sx of [-1, 1]) { if (L.eyewear === "sun") box(0.052, 0.028, 0.01, lens, sx * 0.042, EY, EZ); else { sph(0.024, lens, sx * 0.041, EY - 0.005, EZ + 0.001, [1.05, 0.9, 0.18]); add(new THREE.TorusGeometry(0.024, 0.0022, 5, 18), gold, sx * 0.041, EY - 0.005, EZ - 0.002, null, [1.05, 0.9, 1]); } }
    box(0.03, 0.005, 0.008, L.eyewear === "aviator" ? solid("#c9a24a", 0.3, {metalness: 0.8}) : lens, 0, EY + 0.008, EZ);
    for (const sx of [-1, 1]) box(0.006, 0.006, 0.12, lens, sx * 0.112, EY + 0.004, -0.06);
  } else if (L.eyewear === "goggles") {
    add(new THREE.CylinderGeometry(0.124, 0.124, 0.028, 22, 1, true), solid("#151515", 0.7, {side: THREE.DoubleSide}), 0, EY, 0, null, [1, 1, 1.05]);
    box(0.13, 0.046, 0.022, M({color: "#cfe3ea", transparent: true, opacity: 0.32, roughness: 0.05, metalness: 0.2}), 0, EY, EZ - 0.004);
  } else if (L.eyewear === "disguise" || L.eyewear === "glasses") {
    const t = L.eyewear === "disguise" ? 0.009 : 0.004, fm = solid(L.eyewear === "disguise" ? "#0d0d0d" : "#5a4632", 0.4);
    for (const sx of [-1, 1]) { const x = sx * 0.042; box(0.05, t, 0.006, fm, x, EY + 0.018, EZ); box(0.05, t, 0.006, fm, x, EY - 0.018, EZ); box(t, 0.036, 0.006, fm, x - 0.025, EY, EZ); box(t, 0.036, 0.006, fm, x + 0.025, EY, EZ); box(0.006, 0.006, 0.12, fm, sx * 0.112, EY + 0.012, -0.06); }
    box(0.018, t, 0.006, fm, 0, EY + 0.008, EZ);
  }
  // ear gear
  if (L.ears === "earpiece") { sph(0.012, solid("#d8d0c4", 0.4, {transparent: true, opacity: 0.85}), 0.118, 1.656, -0.008, null, null, 8); cyl(0.003, 0.003, 0.13, solid("#d8d0c4", 0.4, {transparent: true, opacity: 0.7}), 0.105, 1.58, 0.01, [0.15, 0, 0.1], null, 6); }
  if (L.ears === "headset") {
    const hm = solid("#1a1a1a", 0.5);
    for (const sx of [-1, 1]) cyl(0.04, 0.04, 0.035, hm, sx * 0.127, HY, 0, [0, 0, Math.PI / 2], null, 16);
    if (!helmet) add(new THREE.TorusGeometry(0.127, 0.008, 6, 20, Math.PI), hm, 0, HY, 0);
    cyl(0.004, 0.004, 0.11, hm, 0.1, 1.615, -0.065, [0, -0.9, Math.PI / 2], null, 6);
  }
  // headgear
  const hc = L.headColor === "auto" ? null : HEAD_COLORS.find(x => x[0] === L.headColor)[2];
  const topIsPat = top.body.startsWith("pat:");
  const autoHat = {fedora: "#15130f", cap: f === "fed" ? "#1c2638" : f === "cia" ? "#151515" : (topIsPat ? top.body : "#4d5435"), beanie: f === "mil" ? "#3e4535" : "#1a1a1c",
    boonie: topIsPat ? top.body : f === "mil" ? "#7e6a4e" : "#3e4535", patrol: topIsPat ? top.body : f === "mil" ? "#4d5435" : "#1c2638", beret: f === "mil" ? "#2f4a2b" : pin,
    fast: f === "mil" ? (["ocp", "multicam"].includes(top.id) ? "#8a7a5a" : "#7e6a4e") : "#1b1c1e", ach: f === "mil" ? "#7a6b4e" : "#1b1c1e", pilot: "#c9ccd0"}[L.head];
  const hatM = L.head === "none" ? null : fabric(hc || autoHat, helmet ? 0.6 : 0.85);
  const band = solid(pin, 0.6);
  switch (L.head) {
    case "fedora": cyl(0.21, 0.21, 0.014, hatM, 0, 1.758, 0, null, null, 24); cyl(0.11, 0.128, 0.11, hatM, 0, 1.818, 0, null, null, 20); cyl(0.13, 0.13, 0.024, band, 0, 1.778, 0, null, null, 20); break;
    case "cap": cyl(0.115, 0.127, 0.085, hatM, 0, 1.78, 0.005, null, null, 20); box(0.17, 0.012, 0.09, hatM, 0, 1.745, -0.15, [-0.12, 0, 0]); if (L.capText) decal(textTex(THREE, L.capText, {w: 192, h: 64, fg: f === "fed" ? "#e8c22c" : "#e9e5da"}), 0.1, 0.033, 0, 1.785, -0.126, FRONT); break;
    case "beanie": sph(0.126, hatM, 0, 1.685, 0, [1, 1.22, 1], null, 18, [0, Math.PI * 2, 0, Math.PI * 0.5]); cyl(0.128, 0.128, 0.045, hatM, 0, 1.705, 0, null, null, 20); break;
    case "boonie": cyl(0.112, 0.122, 0.085, hatM, 0, 1.79, 0, null, null, 18); cyl(0.205, 0.205, 0.008, hatM, 0, 1.752, 0, null, null, 24); cyl(0.124, 0.124, 0.02, solid("#3a3426", 0.8), 0, 1.765, 0, null, null, 18); break;
    case "patrol": cyl(0.125, 0.12, 0.09, hatM, 0, 1.795, 0, null, null, 18); box(0.15, 0.01, 0.075, hatM, 0, 1.752, -0.15, [-0.15, 0, 0]); break;
    case "beret": sph(0.135, hc ? hatM : solid(autoHat, 0.9), 0.025, 1.77, 0.005, [1, 0.33, 1], [0, 0, -0.18], 20); break;
    case "fast": case "ach": {
      const r = L.head === "fast" ? 0.138 : 0.145;
      sph(r, hatM, 0, HY + 0.01, 0.005, [1, 0.94, 1.06], null, 22, [0, Math.PI * 2, 0, Math.PI * (L.head === "fast" ? 0.52 : 0.56)]);
      if (L.head === "fast") { for (const sx of [-1, 1]) box(0.015, 0.03, 0.12, solid("#222", 0.5), sx * 0.137, 1.7, 0); box(0.045, 0.03, 0.015, solid("#222", 0.5), 0, 1.765, -0.138); }
      else { const strap = solid("#2a2a22", 0.8); for (const sx of [-1, 1]) box(0.008, 0.11, 0.012, strap, sx * 0.108, 1.6, -0.02, [0, 0, sx * -0.12]); }
      break;
    }
    case "pilot":
      sph(0.15, hatM, 0, HY + 0.005, 0.005, [1, 1, 1.05], null, 22, [0, Math.PI * 2, 0, Math.PI * 0.62]);
      sph(0.153, M({color: "#20262c", roughness: 0.05, metalness: 0.6, transparent: true, opacity: 0.82, side: THREE.DoubleSide}), 0, HY + 0.005, 0.005, [1, 1, 1.05], null, 22, [Math.PI * 1.15, Math.PI * 0.7, Math.PI * 0.36, Math.PI * 0.2]);
      break;
  }
  if (helmet) {
    const am = solid("#1c1c1c", 0.5);
    if (L.helmetAdd.includes("nvg")) { box(0.03, 0.05, 0.02, am, 0, 1.75, -0.15); for (const sx of [-1, 1]) cyl(0.017, 0.017, 0.065, am, sx * 0.026, 1.705, -0.17, [Math.PI / 2, 0, 0], null, 12); box(0.07, 0.02, 0.03, am, 0, 1.712, -0.155); }
    if (L.helmetAdd.includes("camera")) box(0.03, 0.026, 0.045, am, -0.15, 1.72, -0.02);
    if (L.helmetAdd.includes("hlight")) { cyl(0.013, 0.013, 0.055, am, 0.15, 1.71, -0.04, [Math.PI / 2, 0, 0], null, 10); sph(0.011, solid("#fff7d6", 0.2, {emissive: "#fff2c0", emissiveIntensity: 0.6}), 0.15, 1.71, -0.07, null, null, 8); }
  }

  // ----- patches and identification -----
  const ps = PATCH_STYLE[f];
  const vestTextCol = isPat(gearCol) || lum(gearCol) > 0.35 ? "#16160f" : f === "fed" ? "#e8c22c" : "#e9e5da";
  const chestText = L.patchChest || (f === "fed" && (V === "soft" || V === "heavy") ? "FBI" : "");
  if (chestText) {
    if (hardVest) decal(textTex(THREE, chestText, {w: 320, h: 88, fg: vestTextCol}), 0.25, 0.07, 0, V === "plate" ? 1.38 : 1.33, chestZ - 0.002, FRONT);
    else decal(textTex(THREE, chestText, {w: 160, h: 80, ...ps, border: ps.fg, round: 8}), 0.08, 0.04, -0.085, 1.37, fz(1.37) - 0.012, FRONT);
  }
  if (L.nametape && o.name) {
    const nt = textTex(THREE, String(o.name).toUpperCase().slice(0, 14), {w: 256, h: 56, bg: f === "mil" ? (isPat(body) ? "#8a8466" : "#5b5c45") : "#1b1b1b", fg: f === "mil" ? "#141410" : "#e9e5da", round: 4, scale: 0.6});
    if (hardVest) decal(nt, 0.12, 0.026, 0, V === "plate" ? 1.43 : 1.42, chestZ - 0.003, FRONT);
    else decal(nt, 0.1, 0.022, 0.085, 1.37, fz(1.37) - 0.012, FRONT);
  }
  const backText = L.patchBack || (top.back && !hardVest ? top.back : "") || (f === "fed" && (V === "soft" || V === "heavy") ? "FBI" : "");
  if (backText && L.pack === "none") decal(textTex(THREE, backText, {w: 320, h: 100, fg: hardVest ? vestTextCol : "#e8c22c"}), 0.27, 0.085, 0, 1.3, backZ + 0.002, 0);
  if (L.patchShoulder) decal(textTex(THREE, L.patchShoulder, {w: 128, h: 128, ...ps, border: ps.fg, round: 40, scale: 0.42}), 0.075, 0.075, -(o.armX || 0.284), o.armY || 1.32, 0, -Math.PI / 2);
  if (L.flag !== "none") decal(flagTex(THREE, L.flag), 0.085, 0.045, o.armX || 0.284, (o.armY || 1.32) + 0.02, 0, Math.PI / 2);

  // fit everything worn on the head onto a different head (centre, scale per axis)
  let rigParts;
  if (G && o.head) {
    const {c, k} = o.head;
    for (const m of [...g.children]) if (m.position.y > 1.545) {
      m.position.set(c[0] + m.position.x * k[0], c[1] + (m.position.y - HY) * k[1], c[2] + m.position.z * k[2]);
      m.scale.multiply(new THREE.Vector3(k[0], k[1], k[2]));
    }
  }
  rigParts = G ? rigFlat(THREE, g, {hipX: 0.1, hipY: 0.92, shX: 0.19, shY: 1.4, shZ: 0.04, armX: 0.2}) : rigFlat(THREE, g, {hipX: 0.09, hipY: 0.92, shX: 0.19, shY: 1.44, armX: 0.175, neckY: 1.5});
  const rig = makeRig(rigParts.legs, rigParts.arms, rigParts.head, 1);
  return {group: g, trash, look: L, rig, rigParts};
}

// ---------- blocky style: a chunky toy figure with the outfit painted onto the blocks ----------
export const STYLES = [["real", "Realistic"], ["athletic", "Athletic"], ["blocky", "Blocky"]];
// The blocky figure from Whylo's Casino, rebuilt in three.js: the same sizes, rounded plastic blocks, glossy eyes,
// eyebrows, smile, chunky hair pieces, elbowed arms and toy hands, with the outfit printed on the front of the body.
// Built facing +z like the casino, then turned to face -z like the other styles.
const rbCache = new Map();
function roundBoxGeo(THREE, w, h, d, r, seg = 3) {
  const key = [w, h, d, r, seg].map(v => +(+v).toFixed(4)).join("_");
  if (rbCache.has(key)) return rbCache.get(key);
  const H = [w / 2, h / 2, d / 2]; r = Math.min(r, H[0], H[1], H[2]);
  const samp = hs => { if (r <= 0) return [-hs, hs]; const a = []; for (let k = seg; k >= 0; k--) a.push(-(hs - r + r * Math.tan(k / seg * Math.PI / 4))); for (let k = 0; k <= seg; k++) a.push(hs - r + r * Math.tan(k / seg * Math.PI / 4)); return a; };
  const pos = [], nor = [], uv = [], idx = [];
  for (const [ax, ua, va, s] of [[0, 1, 2, 1], [0, 1, 2, -1], [1, 2, 0, 1], [1, 2, 0, -1], [2, 0, 1, 1], [2, 0, 1, -1]]) {
    const U = samp(H[ua]), Vv = samp(H[va]), base = pos.length / 3;
    for (let j = 0; j < Vv.length; j++) for (let i = 0; i < U.length; i++) {
      const p = [0, 0, 0]; p[ax] = s * H[ax]; p[ua] = U[i]; p[va] = Vv[j];
      let n = [0, 0, 0]; n[ax] = s; let fp = p;
      if (r > 0) { const inner = p.map((c, k) => Math.max(-(H[k] - r), Math.min(H[k] - r, c))); const dv = p.map((c, k) => c - inner[k]); const l = Math.hypot(...dv); if (l > 1e-9) { n = dv.map(c => c / l); fp = inner.map((c, k) => c + n[k] * r); } }
      pos.push(...fp); nor.push(...n); uv.push(i / (U.length - 1), 1 - j / (Vv.length - 1));
    }
    const nu = U.length - 1, nv = Vv.length - 1;
    for (let j = 0; j < nv; j++) for (let i = 0; i < nu; i++) {
      const a = base + j * (nu + 1) + i, b = a + 1, c = a + nu + 2, dd = a + nu + 1;
      const P = k => pos.slice(k * 3, k * 3 + 3), pa = P(a), pb = P(b), pd = P(dd), nn = nor.slice(a * 3, a * 3 + 3);
      const u1 = pb.map((v, k) => v - pa[k]), u2 = pd.map((v, k) => v - pa[k]);
      const cr = [u1[1] * u2[2] - u1[2] * u2[1], u1[2] * u2[0] - u1[0] * u2[2], u1[0] * u2[1] - u1[1] * u2[0]];
      if (cr[0] * nn[0] + cr[1] * nn[1] + cr[2] * nn[2] >= 0) idx.push(a, b, c, a, c, dd); else idx.push(a, dd, c, a, c, b);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute("normal", new THREE.Float32BufferAttribute(nor, 3)); g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx);
  g.userData.shared = true; rbCache.set(key, g); return g;
}
const shadeHex = (hex, f) => { const n = parseInt(hex.slice(1), 16); const c = [n >> 16 & 255, n >> 8 & 255, n & 255].map(v => Math.max(0, Math.min(255, Math.round(f > 0 ? v + (255 - v) * f : v * (1 + f))))); return "#" + c.map(v => v.toString(16).padStart(2, "0")).join(""); };
// the casino's mouth decal (a simple smile; lips for the "lashes" face)
function mouthTexture(THREE) {
  return canvasTex(THREE, "casino:mouth", 128, 72, (x, W) => { const cx = W / 2; x.lineCap = "round"; x.strokeStyle = "#2a1210"; x.lineWidth = 7; x.beginPath(); x.moveTo(cx - 30, 26); x.quadraticCurveTo(cx, 54, cx + 30, 26); x.stroke(); });
}
function stubbleTexture(THREE) {
  return canvasTex(THREE, "casino:stubble", 128, 96, (x, W, H) => { const r = seeded(17);
    for (let k = 0; k < 900; k++) { const px = r() * W, py = H * 0.15 + r() * H * 0.85, edge = Math.min(px, W - px) / (W * 0.5); if (r() > Math.min(1, edge * 2.2)) continue; x.fillStyle = `rgba(40,30,25,${0.25 + r() * 0.3})`; x.fillRect(px, py, 2, 2); }
    x.clearRect(W * 0.26, H * 0.28, W * 0.48, H * 0.3); });
}
function buildBlocky(THREE, look, o = {}) {
  const L = cleanLook(look), f = L.faction, top = topOf(L), mobile = !!o.mobile, pin = o.color || "#c0392b";
  const outer = new THREE.Group(), root = new THREE.Group(); outer.add(root); root.rotation.y = Math.PI; root.scale.setScalar(1.15);
  const trash = [], mats = new Map();
  const isPat = v => typeof v === "string" && v.startsWith("pat:");
  // smooth toy plastic (clearcoat like the casino's "coat")
  const plastic = (hex, p = {}) => { const k = hex + JSON.stringify(p); if (!mats.has(k)) { const m = new THREE.MeshPhysicalMaterial({color: hex, roughness: 0.45, clearcoat: 0.2, clearcoatRoughness: 0.4, envMapIntensity: 0.45, ...p}); trash.push(m); mats.set(k, m); } return mats.get(k); };
  const cloth = v => { if (isPat(v)) { const k = "pat" + v; if (!mats.has(k)) { const t = patTex(THREE, v.slice(4)).clone(); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(1.2, 1.2); t.needsUpdate = true; trash.push(t); const m = new THREE.MeshPhysicalMaterial({map: t, roughness: 0.62, clearcoat: 0.08, envMapIntensity: 0.3}); trash.push(m); mats.set(k, m); } return mats.get(k); } return plastic(v, {roughness: 0.62, clearcoat: 0.08, envMapIntensity: 0.3}); };
  const skinMat = hex => { const c = new THREE.Color(hex).multiplyScalar(0.78); return plastic("#" + c.getHexString(), {roughness: 0.55, clearcoat: 0.08, envMapIntensity: 0.3}); };
  const add = (parent, geo, m, pos, rot, scl) => { const n = new THREE.Mesh(geo, m); if (pos) n.position.set(...pos); if (rot) n.rotation.set(...rot); if (scl) n.scale.set(...scl); n.castShadow = !mobile; parent.add(n); return n; };
  const RB = (w, h, d, r, s = 3) => roundBoxGeo(THREE, w, h, d, r, s);
  const quad = (w, h) => { const g = new THREE.PlaneGeometry(w, h); trash.push(g); return g; };
  const decalMat = tex => { const m = new THREE.MeshStandardMaterial({map: tex, transparent: true, depthWrite: false, roughness: 0.6, polygonOffset: true, polygonOffsetFactor: -2}); trash.push(m); return m; };
  const paint = (w, h, draw) => { const c = document.createElement("canvas"); c.width = w; c.height = h; draw(c.getContext("2d"), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; trash.push(t); return t; };

  // sizes (metres) from the casino: a big toy head on a chunky body
  const HW = 0.27, HH = 0.25, HD = 0.25, FZ = HD / 2, TW = 0.36, TH = 0.4, TD = 0.2, AW = 0.1, LW = 0.15, baseY = 0.8;
  const skinHex = SKINS[L.skin], skin = skinMat(skinHex), hairHex = HAIRS[L.hairColor];
  const body0 = L.color && !isPat(top.body) ? L.color : top.body, solidBody = isPat(body0) ? (PATS[body0.slice(4)] || PATS.woodland)[0] : body0;
  const topM = cloth(body0), sleeveM = top.sleeves ? cloth(top.sleeves) : topM;
  const V = L.vest, hardVest = ["soft", "badge", "heavy", "plate", "lowpro", "iotv"].includes(V);
  const gearAuto = f === "fed" ? (V === "heavy" ? "#17181a" : "#1d2639") : f === "cia" ? "#17181a" : (["ocp", "multicam", "cia_fatigues"].includes(top.id) ? P("multicam") : "#7e6a4e");
  const gearCol = L.vestColor === "auto" ? gearAuto : GEAR_COLORS.find(x => x[0] === L.vestColor)[2];
  const gearM = cloth(gearCol), gearSolid = isPat(gearCol) ? "#7e6a4e" : gearCol;
  const ps = PATCH_STYLE[f], vestText = isPat(gearCol) || lum(gearSolid) > 0.35 ? "#16160f" : f === "fed" ? "#e8c22c" : "#e9e5da";
  const chestText = L.patchChest || (f === "fed" && (V === "soft" || V === "heavy") ? "FBI" : "");
  const backText = L.patchBack || (top.back && !hardVest ? top.back : "") || (f === "fed" && (V === "soft" || V === "heavy") ? "FBI" : "");
  const textOn = (x, s, cx, cy, w, h, col, bg) => { if (bg) { x.fillStyle = bg; x.fillRect(cx - w / 2, cy - h / 2, w, h); } x.fillStyle = col; x.textAlign = "center"; x.textBaseline = "middle"; let fs = h * 0.8; do { x.font = `bold ${fs}px Arial, sans-serif`; fs -= 1; } while (x.measureText(s).width > w * 0.92 && fs > 6); x.fillText(s, cx, cy + 1); };

  const body = new THREE.Group(); body.position.set(0, baseY, 0); root.add(body);
  // body block + the printed front of the outfit (the casino's drawShirt, with the agency outfits)
  add(body, RB(TW, TH, TD, 0.045), topM, [0, TH / 2 - 0.01, 0]);
  const shirtTex = paint(240, 274, (x, W, H) => {
    const c = solidBody, C = W / 2, dk = shadeHex(c, -0.32), lt = shadeHex(c, 0.3);
    if (isPat(body0)) { x.fillStyle = x.createPattern(patTex(THREE, body0.slice(4)).image, "repeat"); x.fillRect(0, 0, W, H); } else { x.fillStyle = c; x.fillRect(0, 0, W, H); }
    const k = top.kind;
    if (k === "suit" || k === "trench" || k === "open") {
      const shirt = top.shirt || "#f4f1ea";
      if (k === "open") { x.fillStyle = shirt; x.fillRect(C - 34, 0, 68, H); x.strokeStyle = dk; x.lineWidth = 9; x.beginPath(); x.moveTo(C - 38, 0); x.lineTo(C - 38, H); x.moveTo(C + 38, 0); x.lineTo(C + 38, H); x.stroke(); }
      else {
        x.fillStyle = shirt; x.beginPath(); x.moveTo(C - 52, 0); x.lineTo(C + 52, 0); x.lineTo(C, H * 0.66); x.closePath(); x.fill();
        if (top.tie) { x.fillStyle = top.tie === "pin" ? pin : top.tie; x.beginPath(); x.moveTo(C - 11, 6); x.lineTo(C + 11, 6); x.lineTo(C + 15, H * 0.52); x.lineTo(C, H * 0.6); x.lineTo(C - 15, H * 0.52); x.closePath(); x.fill(); }
        else { x.fillStyle = skinHex; x.beginPath(); x.moveTo(C - 24, 0); x.lineTo(C + 24, 0); x.lineTo(C, H * 0.22); x.closePath(); x.fill(); }
        x.strokeStyle = dk; x.lineWidth = 9; x.beginPath(); x.moveTo(C - 56, 0); x.lineTo(C - 4, H * 0.72); x.moveTo(C + 56, 0); x.lineTo(C + 4, H * 0.72); x.stroke();
        x.fillStyle = top.brass ? "#e2b956" : "#1c1c1c"; for (const yy of top.brass ? [0.78, 0.9] : [0.8]) { x.beginPath(); x.arc(C, H * yy, 7, 0, Math.PI * 2); x.fill(); }
        if (top.brass) ["#9c1f24", "#1f3f8a", "#d6b23a"].forEach((cc, i) => { x.fillStyle = cc; x.fillRect(150 + i * 18, 70, 17, 11); });
      }
    } else if (k === "hoodie") {
      x.fillStyle = dk; x.beginPath(); x.ellipse(C, 0, 58, 40, 0, 0, Math.PI); x.fill();
      x.fillStyle = shadeHex(c, -0.15); x.beginPath(); x.ellipse(C, 0, 40, 24, 0, 0, Math.PI); x.fill();
      x.strokeStyle = "#f2f2f2"; x.lineWidth = 6; x.beginPath(); x.moveTo(C - 16, 30); x.lineTo(C - 18, 96); x.moveTo(C + 16, 30); x.lineTo(C + 18, 96); x.stroke();
      x.fillStyle = dk; x.beginPath(); x.moveTo(C - 70, H * 0.66); x.lineTo(C + 70, H * 0.66); x.lineTo(C + 86, H); x.lineTo(C - 86, H); x.closePath(); x.fill();
      x.fillStyle = c; x.beginPath(); x.moveTo(C - 64, H * 0.68); x.lineTo(C + 64, H * 0.68); x.lineTo(C + 80, H); x.lineTo(C - 80, H); x.closePath(); x.fill();
    } else if (k === "jacket" || k === "coverall") {
      x.fillStyle = dk; x.beginPath(); x.ellipse(C, 0, 50, 26, 0, 0, Math.PI); x.fill();
      x.strokeStyle = "#cfcfcf"; x.lineWidth = 4; x.beginPath(); x.moveTo(C, 0); x.lineTo(C, H); x.stroke();
      x.strokeStyle = dk; x.lineWidth = 5; for (const s of [-1, 1]) { x.beginPath(); x.moveTo(C + s * 40, H * 0.55); x.lineTo(C + s * 64, H * 0.78); x.stroke(); }
    } else { // button-up / field shirt (the casino's "shirt")
      x.fillStyle = isPat(body0) ? "rgba(0,0,0,.18)" : lt; x.beginPath(); x.moveTo(C - 44, 0); x.lineTo(C, 40); x.lineTo(C + 44, 0); x.closePath(); x.fill();
      x.fillStyle = skinHex; x.beginPath(); x.moveTo(C - 16, 0); x.lineTo(C, 20); x.lineTo(C + 16, 0); x.closePath(); x.fill();
      x.strokeStyle = isPat(body0) ? "rgba(0,0,0,.4)" : dk; x.lineWidth = 3; x.beginPath(); x.moveTo(C, 38); x.lineTo(C, H); x.stroke();
      x.fillStyle = isPat(body0) ? "rgba(0,0,0,.35)" : "#f4f1ea"; for (let i = 0; i < 4; i++) { x.beginPath(); x.arc(C + 8, 62 + i * 52, 5, 0, Math.PI * 2); x.fill(); }
      x.fillStyle = isPat(body0) ? "rgba(0,0,0,.22)" : dk; x.fillRect(C - 82, H * 0.3, 46, 40); x.fillRect(C + 36, H * 0.3, 46, 40);
    }
    if (!hardVest && V !== "rig") {
      if (chestText) { textOn(x, chestText, C + 58, H * 0.22, 74, 26, ps.fg, ps.bg); x.strokeStyle = ps.fg; x.lineWidth = 2; x.strokeRect(C + 21, H * 0.22 - 13, 74, 26); }
      if (L.nametape && o.name) textOn(x, String(o.name).toUpperCase().slice(0, 12), C - 58, H * 0.22, 80, 20, f === "mil" ? "#141410" : "#e9e5da", f === "mil" ? "#8a8466" : "#1b1b1b");
    }
  });
  const front = add(body, quad(TW - 0.08, TH - 0.09), new THREE.MeshPhysicalMaterial({map: shirtTex, roughness: top.kind === "open" ? 0.3 : 0.62, clearcoat: 0.08, envMapIntensity: 0.22}), [0, TH / 2 - 0.01, TD / 2 + 0.0003]);
  trash.push(front.material); front.castShadow = false;
  if (backText && !hardVest && L.pack === "none") { const bt = add(body, quad(TW - 0.08, 0.12), decalMat(textTex(THREE, backText, {w: 320, h: 100, fg: "#e8c22c"})), [0, TH * 0.62, -TD / 2 - 0.0005], [0, Math.PI, 0]); bt.castShadow = false; }
  if (top.kind === "hoodie") add(body, RB(0.27, 0.1, 0.07, 0.028), cloth(shadeHex(solidBody, -0.18)), [0, TH - 0.04, -TD / 2 - 0.012]);
  // belt + buckle, like the casino people
  add(body, RB(TW + 0.004, 0.032, TD + 0.004, 0.012), plastic(L.gear.includes("belt") && f === "mil" ? "#5c4f3a" : "#1a1210", {roughness: 0.4, clearcoat: 0.4}), [0, 0, 0]);
  add(body, RB(0.04, 0.026, 0.01, 0.005), plastic("#c9b07a", {roughness: 0.25, metalness: 1}), [0, 0, TD / 2 + 0.004]);
  if (L.gear.includes("badge")) add(body, RB(0.03, 0.036, 0.008, 0.004), plastic("#d4af37", {roughness: 0.25, metalness: 1}), [-0.09, 0.002, TD / 2 + 0.006]);

  // neck + head
  const bala = L.cover === "balaclava", balaCol = f === "mil" ? "#2a2c22" : "#111214";
  add(body, RB(0.12, 0.05, 0.11, 0.02), bala ? plastic(balaCol, {roughness: 0.9, clearcoat: 0}) : skin, [0, TH - 0.01, 0]);
  const head = new THREE.Group(); head.position.set(0, TH + 0.005 + HH / 2 + 0.012, 0); body.add(head);
  add(head, RB(HW, HH, HD, 0.06, 4), bala ? plastic(balaCol, {roughness: 0.9, clearcoat: 0}) : skin);
  if (bala) { const band = add(head, quad(0.2, 0.06), skin, [0, 0.016, FZ + 0.0004]); band.castShadow = false; }
  // eyes: glossy dark ovals with a white glint
  const eyeM = plastic(shadeHex(EYE_COLORS[L.eyeColor], -0.5), {roughness: 0.2, clearcoat: 0.5, envMapIntensity: 0.45}), glintM = new THREE.MeshBasicMaterial({color: "#ffffff"}); trash.push(glintM);
  const sphG = new THREE.SphereGeometry(1, 16, 12), glintG = new THREE.SphereGeometry(0.0048, 8, 6); trash.push(sphG, glintG);
  const eyeGroups = [];
  for (const s of [-1, 1]) { const grp = new THREE.Group(); grp.position.set(s * 0.05, 0.014, FZ); head.add(grp); eyeGroups.push(grp); add(grp, sphG, eyeM, null, null, [0.017, 0.026, 0.007]); add(grp, glintG, glintM, [-0.0052, 0.0095, 0.0052]).castShadow = false; }
  // eyebrows in the hair colour (darker when bald or very light)
  const browHex = L.hair === "bald" || ["#d2b27a", "#8f8c88"].includes(hairHex) ? shadeHex("#5a3a22", -0.1) : shadeHex(hairHex, -0.15);
  for (const s of [-1, 1]) add(head, RB(0.042, 0.011, 0.007, 0.004), plastic(browHex, {roughness: 0.5}), [s * 0.05, 0.054, FZ + 0.001]).castShadow = false;
  if (!bala) { const mq = add(head, quad(0.092, 0.052), decalMat(mouthTexture(THREE)), [0, -0.054, FZ + 0.0012]); mq.castShadow = false; }
  // face extras painted on a clear decal: face paint, scar, freckles
  if (!bala && (L.paint !== "none" || L.scar || L.freckles)) {
    const ft = paint(256, 240, (x, W, H) => { const r = seeded(9);
      if (L.paint === "camo") { x.globalAlpha = 0.85; ["#2c3a22", "#16180f", "#4f5a32", "#16180f", "#2c3a22"].forEach((cc, i) => { x.fillStyle = cc; x.beginPath(); x.moveTo(-60 + i * 64, 0); x.lineTo(-20 + i * 64, 0); x.lineTo(-60 + i * 64, H); x.lineTo(-100 + i * 64, H); x.fill(); }); x.globalAlpha = 1; }
      if (L.paint === "eyeblack") { x.fillStyle = "rgba(12,12,12,.9)"; x.fillRect(W / 2 - 74, H * 0.53, 46, 12); x.fillRect(W / 2 + 28, H * 0.53, 46, 12); }
      if (L.freckles) { x.fillStyle = "rgba(120,60,30,.55)"; for (let i = 0; i < 40; i++) { const s = r() < 0.5 ? -1 : 1; x.beginPath(); x.arc(W / 2 + s * (20 + r() * 60), H * 0.56 + r() * 30, 2 + r() * 1.5, 0, 7); x.fill(); } }
      if (L.scar) { x.strokeStyle = "rgba(160,70,70,.9)"; x.lineWidth = 5; x.beginPath(); x.moveTo(W / 2 - 70, H * 0.3); x.lineTo(W / 2 - 50, H * 0.62); x.stroke(); x.lineWidth = 3; for (let t = 0.15; t < 1; t += 0.22) { const px = W / 2 - 70 + 20 * t, py = H * (0.3 + 0.32 * t); x.beginPath(); x.moveTo(px - 8, py + 2); x.lineTo(px + 8, py - 2); x.stroke(); } }
    });
    add(head, quad(HW - 0.02, HH - 0.02), decalMat(ft), [0, 0, FZ + 0.0008]).castShadow = false;
  }
  // facial hair (casino pieces)
  if (!bala && L.facial !== "none") {
    if (L.facial === "stubble") add(head, quad(0.17, 0.11), decalMat(stubbleTexture(THREE)), [0, -0.052, FZ + 0.0006]).castShadow = false;
    else { const m = plastic(hairHex, {roughness: 0.5, clearcoat: 0.25});
      add(head, RB(0.09, 0.016, 0.02, 0.007), m, [0, -0.02, FZ + 0.004]);
      if (L.facial === "goatee") add(head, RB(0.06, 0.042, 0.024, 0.01), m, [0, -0.09, FZ - 0.002]);
      if (L.facial === "beard") { add(head, RB(HW - 0.012, 0.05, 0.03, 0.014), m, [0, -0.09, FZ - 0.004]); for (const s of [-1, 1]) add(head, RB(0.03, 0.1, 0.13, 0.012), m, [s * (HW / 2 - 0.002), -0.05, 0.03]); } }
  }
  // hair (casino styles: short, buzz, long, swept)
  const helmet = isHelmet(L.head), hatCovers = helmet || ["beanie", "fedora", "boonie", "patrol"].includes(L.head);
  if (!bala && L.hair !== "bald") {
    const c = new THREE.Color(hairHex), light = (c.r + c.g + c.b) / 3 > 0.45;
    const hm = plastic(light ? shadeHex(hairHex, -0.16) : hairHex, {roughness: light ? 0.55 : 0.4, clearcoat: light ? 0.12 : 0.28, envMapIntensity: light ? 0.25 : 0.4});
    const part = (w, h, d, r, pos, rot) => add(head, RB(w, h, d, r), hm, pos, rot);
    const cap = (h = 0.062) => { if (!hatCovers) part(HW + 0.018, h, HD + 0.018, 0.045, [0, HH / 2 + 0.012 - h / 2 + 0.02, -0.003]); };
    const back = to => { const t = HH / 2 + 0.01, h = t - to; part(HW + 0.018, h, 0.045, 0.02, [0, t - h / 2, -FZ + 0.012]); };
    const sides = (to, depth = 0.13, z = -0.03) => { const t = HH / 2 - 0.005, h = t - to; for (const s of [-1, 1]) part(0.026, h, depth, 0.011, [s * (HW / 2 + 0.01), t - h / 2, z]); };
    const fringe = () => { if (!hatCovers) part(0.17, 0.034, 0.03, 0.012, [0.022, HH / 2 - 0.012, FZ + 0.004], [0, 0, -0.12]); };
    const H2 = L.hair;
    if (H2 === "short" || H2 === "crew") { cap(); back(-0.02); sides(0.03, 0.11, -0.04); fringe(); }
    else if (H2 === "buzz" || H2 === "fade") { if (!hatCovers) part(HW + 0.008, 0.07, HD + 0.008, 0.05, [0, HH / 2 - 0.027, -0.002]); part(HW + 0.008, 0.11, 0.03, 0.014, [0, 0, -FZ + 0.01]); }
    else if (H2 === "long") { cap(); back(-0.27); sides(-0.2, 0.15, -0.025); fringe(); }
    else if (H2 === "slick") { cap(0.07); back(-0.06); sides(-0.03, 0.15, -0.025); if (!hatCovers) part(0.2, 0.055, 0.05, 0.022, [0.03, HH / 2 - 0.005, FZ + 0.006], [0.15, 0, -0.32]); part(0.032, 0.17, 0.12, 0.014, [-(HW / 2 + 0.018), -0.005, 0.035], [0, 0, 0.06]); }
  }
  // headgear, in the casino's rounded-block style
  const hc = L.headColor === "auto" ? null : HEAD_COLORS.find(x => x[0] === L.headColor)[2];
  const topIsPat = isPat(top.body);
  const autoHat = {fedora: "#15130f", cap: f === "fed" ? "#1c2638" : f === "cia" ? "#151515" : (topIsPat ? top.body : "#4d5435"), beanie: f === "mil" ? "#3e4535" : "#1a1a1c",
    boonie: topIsPat ? top.body : f === "mil" ? "#7e6a4e" : "#3e4535", patrol: topIsPat ? top.body : f === "mil" ? "#4d5435" : "#1c2638", beret: f === "mil" ? "#2f4a2b" : pin,
    fast: f === "mil" ? "#7e6a4e" : "#1b1c1e", ach: f === "mil" ? "#7a6b4e" : "#1b1c1e", pilot: "#c9ccd0"}[L.head];
  const hcol = hc || autoHat, hatM = L.head === "none" ? null : cloth(hcol), hatSolid = hcol && isPat(hcol) ? "#4d5435" : hcol;
  const T = HH / 2 + (["long", "slick"].includes(L.hair) ? 0.01 : 0);
  switch (L.head) {
    case "cap": add(head, RB(HW + 0.034, 0.075, HD + 0.03, 0.04), hatM, [0, T + 0.02, -0.004]); add(head, RB(0.19, 0.016, 0.11, 0.008), hatM, [0, T - 0.008, FZ + 0.06], [-0.12, 0, 0]);
      if (L.capText) add(head, quad(0.2, 0.05), decalMat(textTex(THREE, L.capText, {w: 256, h: 64, fg: f === "fed" ? "#e8c22c" : "#e9e5da"})), [0, T + 0.022, FZ + 0.013]).castShadow = false; break;
    case "beanie": add(head, RB(HW + 0.03, 0.1, HD + 0.03, 0.05), hatM, [0, T + 0.02, -0.004]); add(head, RB(HW + 0.04, 0.034, HD + 0.04, 0.015), cloth(shadeHex(hatSolid, -0.2)), [0, T - 0.03, -0.004]); break;
    case "fedora": add(head, RB(0.4, 0.016, 0.36, 0.05), hatM, [0, T + 0.004, -0.004]); add(head, RB(0.2, 0.1, 0.19, 0.04), hatM, [0, T + 0.06, -0.004]); add(head, RB(0.206, 0.022, 0.196, 0.01), plastic(pin), [0, T + 0.024, -0.004]); break;
    case "boonie": add(head, RB(0.42, 0.014, 0.4, 0.06), hatM, [0, T + 0.004, -0.004]); add(head, RB(HW + 0.03, 0.09, HD + 0.03, 0.04), hatM, [0, T + 0.045, -0.004]); break;
    case "patrol": add(head, RB(HW + 0.036, 0.09, HD + 0.03, 0.025), hatM, [0, T + 0.03, -0.004]); add(head, RB(0.19, 0.016, 0.1, 0.008), hatM, [0, T - 0.006, FZ + 0.055], [-0.1, 0, 0]); break;
    case "beret": add(head, RB(HW + 0.05, 0.05, HD + 0.04, 0.025), hc ? hatM : plastic(autoHat, {roughness: 0.85, clearcoat: 0}), [0.02, T + 0.018, -0.004], [0, 0, -0.18]); break;
    case "fast": case "ach": case "pilot": {
      add(head, RB(HW + 0.05, 0.13, HD + 0.05, 0.06, 4), hatM, [0, T + 0.0, -0.004]);
      for (const s of [-1, 1]) add(head, RB(0.03, 0.09, HD * 0.7, 0.012), hatM, [s * (HW / 2 + 0.018), T - 0.08, -0.01]);
      if (L.head === "fast") for (const s of [-1, 1]) add(head, RB(0.012, 0.03, 0.14, 0.004), plastic("#222"), [s * (HW / 2 + 0.035), T - 0.03, 0]);
      if (L.head === "pilot") add(head, RB(HW + 0.03, 0.07, 0.02, 0.012), plastic("#20262c", {roughness: 0.05, metalness: 0.6, clearcoat: 1, transparent: true, opacity: 0.85}), [0, 0.03, FZ + 0.03]);
      break;
    }
  }
  if (helmet) { const am = plastic("#1c1c1c", {roughness: 0.35});
    if (L.helmetAdd.includes("nvg")) { add(head, RB(0.04, 0.05, 0.03, 0.01), am, [0, T + 0.02, FZ + 0.04]); for (const s of [-1, 1]) add(head, RB(0.035, 0.035, 0.07, 0.012), am, [s * 0.03, 0.04, FZ + 0.06]); }
    if (L.helmetAdd.includes("camera")) add(head, RB(0.04, 0.035, 0.06, 0.01), am, [HW / 2 + 0.05, T - 0.02, 0]);
    if (L.helmetAdd.includes("hlight")) add(head, RB(0.03, 0.03, 0.07, 0.012), am, [-(HW / 2 + 0.05), T - 0.03, 0.02]); }
  // eyewear (the casino's glasses and shades, plus goggles and aviators)
  const E = L.eyewear;
  if (E !== "none") {
    const z = FZ + 0.012;
    if (E === "goggles") { add(head, RB(HW + 0.02, 0.03, HD + 0.02, 0.012), plastic("#151515", {roughness: 0.6}), [0, 0.014, 0]); add(head, RB(0.19, 0.055, 0.02, 0.012), plastic("#cfe3ea", {roughness: 0.05, transparent: true, opacity: 0.4, clearcoat: 1}), [0, 0.014, z + 0.004]); }
    else {
      const shades = E === "sun" || E === "aviator", frame = plastic(E === "aviator" ? "#c9a24a" : shades ? "#111111" : E === "disguise" ? "#0b0b0b" : "#2a2a2a", {roughness: 0.3, clearcoat: 0.6, metalness: E === "aviator" ? 0.8 : 0});
      const lens = shades ? plastic(E === "aviator" ? "#22302a" : "#060606", {roughness: 0.05, clearcoat: 1, envMapIntensity: 1.4}) : plastic("#bfe0ff", {roughness: 0.05, transparent: true, opacity: 0.35, depthWrite: false});
      const fw = E === "disguise" ? 0.07 : 0.064, fh = E === "disguise" ? 0.054 : 0.048;
      for (const s of [-1, 1]) { add(head, RB(fw, fh, 0.008, 0.012), frame, [s * 0.047, 0.012, z - 0.002]); add(head, RB(0.052, 0.036, 0.004, 0.009), lens, [s * 0.047, 0.012, z + 0.003]).castShadow = false; add(head, RB(0.008, 0.008, 0.12, 0.003), frame, [s * (HW / 2 + 0.002), 0.02, z - 0.06]); }
      add(head, RB(0.03, 0.008, 0.008, 0.003), frame, [0, 0.02, z]);
    }
  }
  // headset / earpiece (the casino's headphones)
  if (L.ears === "headset") { const m = plastic("#1a1a1a", {roughness: 0.35, clearcoat: 0.5});
    if (!helmet) add(head, RB(HW + 0.07, 0.022, 0.04, 0.01), m, [0, T + 0.03, 0]);
    for (const s of [-1, 1]) { if (!helmet) add(head, RB(0.022, 0.1, 0.04, 0.008), m, [s * (HW / 2 + 0.03), T - 0.035, 0]); add(head, RB(0.04, 0.085, 0.08, 0.016), m, [s * (HW / 2 + 0.022), -0.005, 0]); }
    add(head, RB(0.008, 0.008, 0.12, 0.003), m, [-(HW / 2 + 0.01), -0.06, 0.08], [0, 0.4, 0]); }
  if (L.ears === "earpiece") add(head, RB(0.016, 0.03, 0.016, 0.006), plastic("#d8d0c4"), [-(HW / 2 + 0.008), -0.01, 0.01]);
  // neck wear
  if (L.neck !== "none") {
    const nm = L.neck === "shemagh" ? new THREE.MeshPhysicalMaterial({map: checkerTex(THREE, f === "mil" ? "#b9a77f" : "#2a2a2a", f === "mil" ? "#5a4a32" : "#d8d2c4"), roughness: 0.8}) : cloth(L.neck === "scarf" ? (f === "cia" ? "#6b1e24" : "#4a4a4a") : gearSolid);
    if (L.neck === "shemagh") trash.push(nm);
    add(body, RB(0.2, 0.06, 0.18, 0.025), nm, [0, TH + 0.005, 0]);
    if (L.neck === "scarf") add(body, RB(0.05, 0.22, 0.02, 0.008), nm, [-0.06, TH - 0.12, TD / 2 + 0.012]);
  }

  // vests: rounded shells over the body, with the patch printed across the front
  if (hardVest || V === "rig") {
    const heavy = V === "heavy" || V === "iotv", thin = V === "soft" || V === "badge" || V === "lowpro";
    if (V === "rig") { add(body, RB(TW - 0.04, 0.14, 0.05, 0.015), gearM, [0, 0.12, TD / 2 + 0.025]); for (const x of [-0.11, -0.037, 0.037, 0.11]) add(body, RB(0.06, 0.09, 0.03, 0.01), gearM, [x, 0.16, TD / 2 + 0.06]); for (const s of [-1, 1]) add(body, RB(0.04, 0.2, 0.012, 0.005), gearM, [s * 0.1, 0.3, TD / 2 + 0.006]); }
    else {
      const vw = TW + (heavy ? 0.05 : 0.025), vh = heavy ? TH - 0.02 : TH - 0.08, vd = TD + (heavy ? 0.07 : thin ? 0.03 : 0.05), vy = heavy ? TH / 2 - 0.01 : TH / 2 + 0.02;
      add(body, RB(vw, vh, vd, 0.035), gearM, [0, vy, 0]);
      const vt = paint(256, 200, (x, W, H) => {
        if (isPat(gearCol)) { x.fillStyle = x.createPattern(patTex(THREE, gearCol.slice(4)).image, "repeat"); x.fillRect(0, 0, W, H); } else { x.fillStyle = gearSolid; x.fillRect(0, 0, W, H); }
        if (V === "plate") for (const cx of [70, 128, 186]) { x.fillStyle = "rgba(0,0,0,.25)"; x.fillRect(cx - 24, H - 92, 48, 80); }
        if (V === "badge") { x.fillStyle = "#d4af37"; x.fillRect(184, 28, 30, 38); }
        if (chestText) textOn(x, chestText, W / 2, V === "plate" ? 50 : 80, 220, 48, vestText);
        if (L.nametape && o.name) textOn(x, String(o.name).toUpperCase().slice(0, 12), W / 2, 16, 130, 20, f === "mil" ? "#141410" : "#e9e5da", f === "mil" ? "#8a8466" : "#1b1b1b");
      });
      add(body, quad(vw - 0.05, vh - 0.05), new THREE.MeshPhysicalMaterial({map: vt, roughness: 0.62, clearcoat: 0.08}), [0, vy, vd / 2 + 0.0004]).castShadow = false;
      if (backText && L.pack === "none") add(body, quad(vw - 0.06, 0.1), decalMat(textTex(THREE, backText, {w: 320, h: 100, fg: vestText})), [0, vy + 0.05, -vd / 2 - 0.0004], [0, Math.PI, 0]).castShadow = false;
      if (heavy) { for (const s of [-1, 1]) add(body, RB(0.13, 0.05, 0.16, 0.02), gearM, [s * (TW / 2 + 0.03), TH - 0.02, 0]); add(body, RB(0.17, 0.12, 0.04, 0.015), gearM, [0, -0.07, TD / 2 + 0.03]); }
    }
  }
  if (L.gear.includes("radio")) add(body, RB(0.045, 0.09, 0.03, 0.01), plastic("#111"), [0.11, TH - 0.1, TD / 2 + (hardVest ? 0.05 : 0.02)]);
  if (L.gear.includes("holster")) add(body, RB(0.045, 0.13, 0.06, 0.012), plastic("#2a1d14", {roughness: 0.6}), [-(TW / 2 + 0.01), TH / 2, 0.0]);
  if (L.gear.includes("ammo")) for (const x of [0.07, 0.125]) add(body, RB(0.048, 0.07, 0.035, 0.01), gearM, [x, -0.04, TD / 2 + 0.02]);
  if (L.gear.includes("med")) add(body, RB(0.08, 0.07, 0.05, 0.012), plastic("#b23a3a"), [-0.12, -0.02, -TD / 2 - 0.025]);
  if (L.gear.includes("light")) add(body, RB(0.03, 0.1, 0.03, 0.012), plastic("#111"), [TW / 2 + 0.01, -0.03, 0.03]);
  if (L.pack !== "none") {
    const [w, h, d] = {small: [0.26, 0.28, 0.1], medium: [0.3, 0.34, 0.13], assault: [0.32, 0.4, 0.15], radio: [0.26, 0.32, 0.13]}[L.pack];
    const pm = isPat(gearCol) ? gearM : plastic(L.vestColor === "auto" && f !== "mil" ? "#1d1d1f" : gearSolid, {roughness: 0.62, clearcoat: 0.08});
    add(body, RB(w, h, d, 0.03), pm, [0, TH / 2 + 0.02, -TD / 2 - (hardVest ? 0.035 : 0) - d / 2]);
    if (L.pack === "radio") add(body, RB(0.01, 0.5, 0.01, 0.004), plastic("#111"), [-0.08, TH / 2 + 0.02 + h / 2 + 0.25, -TD / 2 - d / 2]);
  }

  // hips + legs + shoes (standing)
  const pantsId = L.pants === "auto" ? (top.pants || "match") : L.pants;
  const pSpec = pantsId === "match" ? {c: body0} : (PANTS.find(p => p[0] === pantsId)?.[2] || {c: C.charcoal});
  const pantsM = cloth(top.kind === "coverall" ? body0 : pSpec.c);
  const bootsId = L.boots === "auto" ? top.boots : L.boots, shoeM = plastic(bootsId === "desert" ? "#a88d63" : "#111111", {roughness: 0.4, clearcoat: 0.35});
  add(root, RB(TW - 0.02, 0.12, TD - 0.01, 0.03), pantsM, [0, baseY - 0.04, 0]);
  const HIPY = baseY - 0.05, legPiv = {};
  for (const s of [-1, 1]) { // s = -1 is the avatar's right leg (the casino figure faces +z)
    const hp = new THREE.Group(); hp.position.set(s * 0.085, HIPY, 0); root.add(hp); legPiv[s] = hp;
    add(hp, RB(LW, baseY - 0.05, LW, 0.035), pantsM, [0, (baseY - 0.05) / 2 + 0.05 - HIPY, 0]);
    add(hp, RB(LW + 0.008, 0.08, 0.23, 0.032), shoeM, [0, 0.04 - HIPY, 0.035]);
    if (bootsId === "combat" || bootsId === "desert") add(hp, RB(LW + 0.012, 0.12, LW + 0.012, 0.03), shoeM, [0, 0.13 - HIPY, 0]);
    if (L.gear.includes("kneepads")) add(hp, RB(LW - 0.02, 0.09, 0.03, 0.012), plastic("#1a1a1a"), [0, 0.42 - HIPY, LW / 2 + 0.01]);
  }
  if (L.gear.includes("legholster")) add(legPiv[-1], RB(0.045, 0.16, 0.09, 0.015), plastic("#111"), [-(LW / 2 + 0.02), 0.55 - HIPY, 0]);
  if (top.kind === "trench") add(root, RB(TW + 0.04, 0.36, TD + 0.05, 0.05), cloth(body0), [0, baseY - 0.12, 0]);

  // arms: upper block, rounded elbow, forearm, cuff and a toy hand (palm, index finger, mitten, thumb), hanging relaxed
  const longSleeve = true, cuffM = top.kind === "suit" || top.kind === "trench" ? plastic(top.shirt || "#f4f1ea", {roughness: 0.6}) : null;
  const gloveHex = L.gloves === "none" ? null : L.gloves === "leather" ? "#2f1e14" : f === "mil" ? "#6e5d45" : "#161616";
  const handM = gloveHex ? plastic(gloveHex, {roughness: L.gloves === "leather" ? 0.4 : 0.7}) : skin;
  const fingerM = gloveHex && L.gloves !== "fingerless" ? handM : skin;
  const seg = (w, len, d, r) => { const g = RB(w, len, d, r); return {g, off: len / 2}; };
  const segMesh = (parent, w, len, d, r, m) => { const s = seg(w, len, d, r); return add(parent, s.g, m, [0, s.off, 0]); };
  const L1 = 0.29, L2 = 0.27, W = AW;
  const shoulders = {};
  for (const side of [1, -1]) { // 1 = right (at -x in casino space)
    const shoulder = new THREE.Group(); shoulder.position.set(-side * (TW / 2 + AW / 2 + 0.003), TH - 0.06, 0); body.add(shoulder); shoulders[side] = shoulder;
    // point the arm down, back of the hand outward
    const upper = new THREE.Group(); shoulder.add(upper);
    const X = new THREE.Vector3(0, 0, -side), Y = new THREE.Vector3(0, -1, 0), Z = new THREE.Vector3(-side, 0, 0);
    upper.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(X, Y, Z));
    upper.rotateZ(side * 0.06); // a little away from the body
    add(upper, RB(W, L1 + 0.035, W, 0.022), L.patchShoulder || L.flag !== "none" ? sleeveM : sleeveM, [0, (L1 - 0.035) / 2, 0]);
    // shoulder patch (left arm) / flag (right arm) on the outer face
    const outerX = W / 2 + 0.0006;
    if (side === -1 && L.patchShoulder) add(upper, quad(0.07, 0.07), decalMat(textTex(THREE, L.patchShoulder, {w: 128, h: 128, ...ps, border: ps.fg, round: 40, scale: 0.42})), [0, 0.07, outerX], null).castShadow = false;
    if (side === 1 && L.flag !== "none") add(upper, quad(0.08, 0.045), decalMat(flagTex(THREE, L.flag)), [0, 0.07, outerX]).castShadow = false;
    const fore = new THREE.Group(); fore.position.set(0, L1, 0); upper.add(fore); fore.rotateZ(side * 0.32);
    add(fore, RB(W * 1.02, W * 1.02, W * 1.02, W * 0.4), sleeveM);
    add(fore, RB(W * 0.94, L2 - 0.004, W * 0.94, 0.02), longSleeve ? sleeveM : skin, [0, (L2 - 0.004) / 2, 0]);
    if (cuffM) add(fore, RB(W * 0.98, 0.024, W * 0.98, 0.008), cuffM, [0, L2 - 0.024, 0]);
    if (L.watch !== "none" && side === -1) add(fore, RB(W * 0.98, 0.022, W * 0.98, 0.006), plastic(L.watch === "analog" ? "#4a3626" : "#111"), [0, L2 - 0.05, 0]);
    const hand = new THREE.Group(); hand.position.set(0, L2, 0); hand.scale.setScalar(1.15); fore.add(hand);
    segMesh(hand, 0.074, 0.074, 0.034, 0.012, handM);
    const finger = (x, w, lens, d, curls) => { let parent = new THREE.Group(); parent.position.set(x, 0.066, 0.002); hand.add(parent);
      lens.forEach((len, i) => { const j = new THREE.Group(); if (i > 0) j.position.set(0, lens[i - 1] - 0.004, 0); j.rotation.x = -curls[i]; parent.add(j); segMesh(j, w, len, d * (i ? 0.92 : 1), 0.007, fingerM); parent = j; }); };
    finger(-side * 0.025, 0.022, [0.032, 0.026], 0.024, [0.22, 0.4]);
    finger(side * 0.011, 0.05, [0.032, 0.024], 0.026, [0.35, 0.5]);
    const tb = new THREE.Group(); tb.position.set(-side * 0.03, 0.016, -0.006); hand.add(tb);
    const ty = new THREE.Vector3(-side * 0.62, 0.74, -0.26).normalize(); let tz = new THREE.Vector3(-side * 0.62, 0.1, 0.78).normalize(); tz.sub(ty.clone().multiplyScalar(tz.dot(ty))).normalize();
    tb.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(new THREE.Vector3().crossVectors(ty, tz), ty, tz));
    const meta = new THREE.Group(); meta.rotation.x = -0.15; tb.add(meta); segMesh(meta, 0.024, 0.034, 0.024, 0.008, fingerM);
    const prox = new THREE.Group(); prox.position.set(0, 0.03, 0); prox.rotation.x = -0.2; meta.add(prox); segMesh(prox, 0.022, 0.026, 0.022, 0.008, fingerM);
  }
  // shared rounded-box geometries are cached for everyone; only per-figure things go in trash
  // casino space faces +z, so a forward swing is a negative turn about x
  const rig = makeRig([legPiv[1], legPiv[-1]], [shoulders[-1], shoulders[1]], head, -1, eyeGroups);
  return {group: outer, trash, look: L, rig};
}

// ---------- athletic style: a sculpted human body (assets/agent/man.fbx) with the uniform painted on ----------
// The model stands in an A-pose with no skeleton, so the arms are bent down here once, after loading.
let ATH = null, athPromise = null;
export const athleticReady = () => !!ATH;
const BLANK = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
export function loadAthletic(THREE, FBXLoader, {mobile = false, base = "assets/agent/"} = {}) {
  if (athPromise) return athPromise;
  athPromise = new Promise((ok, bad) => {
    const mgr = new THREE.LoadingManager(); mgr.setURLModifier(u => /\.(jpe?g|png|tga|tiff?|bmp)$/i.test(u) ? BLANK : u); // skip the textures named inside the FBX
    new FBXLoader(mgr).load(base + "man.fbx", g => {
      const img = new Image(); img.crossOrigin = "anonymous";
      img.onload = () => { try { ATH = prepAthletic(THREE, g, img, mobile ? null : base + "skin-nrm.jpg"); ok(); } catch (e) { bad(e); } };
      img.onerror = bad; img.src = base + (mobile ? "skin-1k.jpg" : "skin-2k.jpg");
    }, undefined, bad);
  });
  athPromise.catch(() => { athPromise = null; });
  return athPromise;
}
function prepAthletic(THREE, root, skinImg, nrmUrl) {
  let man = null; root.updateMatrixWorld(true);
  root.traverse(o => { if (o.isMesh && (o.name === "Man" || (!man && o.geometry.attributes.position.count > 5000))) man = o; });
  const src = man.geometry.clone(); src.applyMatrix4(man.matrixWorld);
  const geo = src.index ? src.toNonIndexed() : src;
  geo.computeBoundingBox();
  const bb = geo.boundingBox, k = 1.8 / (bb.max.y - bb.min.y), cx = (bb.max.x + bb.min.x) / 2, cz = (bb.max.z + bb.min.z) / 2;
  const pos = geo.attributes.position, nor = geo.attributes.normal, n = pos.count;
  // scale to 1.8 m, stand on y = 0, turn to face -z
  const ox = new Float32Array(n), oy = new Float32Array(n), oz = new Float32Array(n);
  for (let i = 0; i < n; i++) { ox[i] = -(pos.getX(i) - cx) * k; oy[i] = (pos.getY(i) - bb.min.y) * k; oz[i] = -(pos.getZ(i) - cz) * k; }
  // bend the arms down from about 42 degrees to about 10 degrees, pivoting at the shoulder
  const PX = 0.19, PY = 1.4, BEND = 32 * Math.PI / 180, D = [Math.sin(42 * Math.PI / 180), -Math.cos(42 * Math.PI / 180)];
  const sm = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
  const armW = new Float32Array(n), armT = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const ax = Math.abs(ox[i]), dx = ax - PX, dy = oy[i] - PY, r = Math.hypot(dx, dy);
    const phi = Math.atan2(dx, -dy) * 180 / Math.PI; // 0 = straight down, 42 = along the arm
    let w = sm(14, 28, phi) * sm(0.1, 0.16, ax) * sm(0.02, 0.12, r);
    if (oy[i] < 0.85) w = 0;
    armW[i] = w; armT[i] = dx * D[0] + dy * D[1];
    const s = Math.sign(ox[i]) || 1, a = -s * BEND * w, ca = Math.cos(a), sa = Math.sin(a);
    const rx = ox[i] - s * PX, ry = oy[i] - PY;
    pos.setXYZ(i, s * PX + rx * ca - ry * sa, PY + rx * sa + ry * ca, oz[i]);
    if (nor) { const nx = -nor.getX(i), ny = nor.getY(i), nz = -nor.getZ(i); nor.setXYZ(i, nx * ca - ny * sa, nx * sa + ny * ca, nz); }
  }
  pos.needsUpdate = true; if (nor) nor.needsUpdate = true; else geo.computeVertexNormals();
  // which limb each vertex belongs to (1 left leg, 2 right leg, 3 left arm, 4 right arm) and how strongly, for the walk cycle
  const limb = new Float32Array(n * 2);
  for (let i = 0; i < n; i++) {
    if (armW[i] > 0.02) { limb[i * 2] = ox[i] < 0 ? 3 : 4; limb[i * 2 + 1] = armW[i]; }
    else if (oy[i] < 0.95) { limb[i * 2] = ox[i] < 0 ? 1 : 2; limb[i * 2 + 1] = sm(0.95, 0.8, oy[i]); }
  }
  geo.setAttribute("aLimb", new THREE.BufferAttribute(limb, 2));
  geo.computeBoundingBox(); geo.computeBoundingSphere();
  // per triangle: where it was on the original body (used to decide what clothing covers it)
  const T = n / 3, tri = new Float32Array(T * 6); // x, y, z, armWeight, armT, side
  for (let t = 0; t < T; t++) {
    let sx = 0, sy = 0, sz = 0, sw = 0, st = 0; for (let j = 0; j < 3; j++) { const i = t * 3 + j; sx += ox[i]; sy += oy[i]; sz += oz[i]; sw += armW[i]; st += armT[i]; }
    tri.set([sx / 3, sy / 3, sz / 3, sw / 3, st / 3, Math.sign(sx) || 1], t * 6);
  }
  // skin: keep the detail, drop the original colour, so any skin tone can be chosen
  const c = document.createElement("canvas"); c.width = skinImg.width; c.height = skinImg.height;
  const x = c.getContext("2d"); x.drawImage(skinImg, 0, 0);
  const d = x.getImageData(0, 0, c.width, c.height), px = d.data; let sum = 0, cnt = 0;
  for (let i = 0; i < px.length; i += 64) { const l = px[i] * 0.3 + px[i + 1] * 0.59 + px[i + 2] * 0.11; if (l > 20) { sum += l; cnt++; } }
  const avg = sum / Math.max(1, cnt);
  for (let i = 0; i < px.length; i += 4) { const l = px[i] * 0.3 + px[i + 1] * 0.59 + px[i + 2] * 0.11, v = Math.min(255, (l / avg) * 205); const red = Math.max(0, px[i] - px[i + 1]) * 0.35; px[i] = Math.min(255, v + red); px[i + 1] = v; px[i + 2] = Math.min(255, v * 0.97); }
  x.putImageData(d, 0, 0);
  const skinTex = new THREE.CanvasTexture(c); skinTex.colorSpace = THREE.SRGBColorSpace; skinTex.anisotropy = 4;
  let nrmTex = null; if (nrmUrl) nrmTex = new THREE.TextureLoader().load(nrmUrl);
  return {geo, tri, T, skinTex, nrmTex};
}
// the athletic body measured after loading: where the gear layer has to sit
const ATH_FRONT = [[0.9, -0.1], [1.0, -0.108], [1.1, -0.12], [1.2, -0.13], [1.3, -0.13], [1.4, -0.118], [1.45, -0.1], [1.52, -0.075]];
const ATH_BACK = [[0.9, 0.125], [1.1, 0.125], [1.3, 0.132], [1.45, 0.142], [1.52, 0.115]];
const lerpTable = tb => y => { if (y <= tb[0][0]) return tb[0][1]; for (let i = 1; i < tb.length; i++) if (y <= tb[i][0]) { const [a, va] = tb[i - 1], [b, vb] = tb[i]; return va + (vb - va) * (y - a) / (b - a); } return tb[tb.length - 1][1]; };
function buildAthletic(THREE, look, o = {}) {
  const L = cleanLook(look), f = L.faction, top = topOf(L), mobile = !!o.mobile, pin = o.color || "#c0392b";
  const g = new THREE.Group(), trash = [];
  const isPat = v => typeof v === "string" && v.startsWith("pat:");
  const cloth = (v, r = 0.85, rx = 7, ry = 7) => {
    if (isPat(v)) { const t = patTex(THREE, v.slice(4)).clone(); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rx, ry); t.needsUpdate = true; trash.push(t); const m = new THREE.MeshStandardMaterial({map: t, roughness: 0.9, envMapIntensity: 0.35}); trash.push(m); return m; }
    const m = new THREE.MeshStandardMaterial({color: v, roughness: r, envMapIntensity: 0.35}); trash.push(m); return m;
  };
  const body = L.color && !isPat(top.body) ? L.color : top.body;
  const pantsId = L.pants === "auto" ? (top.pants || "match") : L.pants;
  const pSpec = pantsId === "match" ? {c: body} : (PANTS.find(p => p[0] === pantsId)?.[2] || {c: C.charcoal});
  const pantsC = top.kind === "coverall" ? body : pSpec.c;
  const bootsId = L.boots === "auto" ? top.boots : L.boots;
  const bootH = bootsId === "dress" ? 0.1 : bootsId === "tactical" ? 0.15 : 0.23;
  const bala = L.cover === "balaclava", balaCol = f === "mil" ? "#2a2c22" : "#111214";
  const gloveCol = L.gloves === "none" ? null : L.gloves === "leather" ? "#2f1e14" : f === "mil" ? "#6e5d45" : "#161616";
  const belt = top.tuck || L.gear.some(x => ["belt", "ammo", "med", "light", "badge", "legholster"].includes(x));
  const skinM = new THREE.MeshStandardMaterial({map: ATH.skinTex, normalMap: ATH.nrmTex || null, color: SKINS[L.skin], roughness: 0.55, envMapIntensity: 0.3}); trash.push(skinM);
  // material slots
  const MAT = [skinM, cloth(body, top.nylon ? 0.45 : 0.85), cloth(top.sleeves || body), cloth(pantsC, 0.8), cloth(bootsId === "desert" ? "#7a6446" : "#121212", bootsId === "dress" ? 0.3 : 0.7),
    cloth(top.shirt || body, 0.7), cloth(top.tie === "pin" ? pin : (top.tie || body), 0.5), cloth(L.gear.includes("belt") && f === "mil" ? "#5c4f3a" : "#161616", 0.6), cloth("#1a1a1a", 0.6),
    cloth(L.watch === "analog" ? "#4a3626" : "#111", 0.5), cloth(balaCol, 0.95), cloth(gloveCol || "#000", L.gloves === "leather" ? 0.45 : 0.75)];
  const SKIN = 0, TOP = 1, SLEEVE = 2, PANTS_ = 3, BOOT = 4, SHIRT = 5, TIE = 6, BELT = 7, PAD = 8, WATCH = 9, BALA = 10, GLOVE = 11;
  // swing the legs and arms of the body in the vertex shader (the model has no skeleton)
  const swingU = {value: new THREE.Vector4()};
  for (const m of MAT) {
    m.onBeforeCompile = sh => {
      sh.uniforms.uSwing = swingU;
      sh.vertexShader = sh.vertexShader
        .replace("#include <common>", "#include <common>\nattribute vec2 aLimb;\nuniform vec4 uSwing;\nvec4 limbRot(){ float a = 0.0; vec2 p = vec2(0.0); if (aLimb.x > 0.5) { if (aLimb.x < 1.5) { a = uSwing.x; p = vec2(0.92, 0.01); } else if (aLimb.x < 2.5) { a = uSwing.y; p = vec2(0.92, 0.01); } else if (aLimb.x < 3.5) { a = uSwing.z; p = vec2(1.4, 0.04); } else { a = uSwing.w; p = vec2(1.4, 0.04); } } a *= aLimb.y; return vec4(cos(a), sin(a), p); }")
        .replace("#include <beginnormal_vertex>", "#include <beginnormal_vertex>\nvec4 lr = limbRot(); objectNormal.yz = vec2(lr.x * objectNormal.y - lr.y * objectNormal.z, lr.y * objectNormal.y + lr.x * objectNormal.z);")
        .replace("#include <begin_vertex>", "#include <begin_vertex>\n{ vec2 q = transformed.yz - lr.zw; transformed.yz = lr.zw + vec2(lr.x * q.x - lr.y * q.y, lr.y * q.x + lr.x * q.y); }");
    };
    m.customProgramCacheKey = () => "athletic-limbs";
  }
  const k = top.kind, suit = k === "suit" || k === "trench", tri = ATH.tri, lists = MAT.map(() => []);
  for (let t = 0; t < ATH.T; t++) {
    const x = tri[t * 6], y = tri[t * 6 + 1], z = tri[t * 6 + 2], w = tri[t * 6 + 3], at = tri[t * 6 + 4], side = tri[t * 6 + 5], ax = Math.abs(x);
    let m;
    if (w > 0.5) { // arm
      if (at > 0.5) m = gloveCol ? (L.gloves === "fingerless" && at > 0.57 ? SKIN : GLOVE) : SKIN;
      else if (side < 0 && L.watch !== "none" && at > 0.46) m = WATCH;
      else if (suit && at > 0.475) m = SHIRT;
      else m = SLEEVE;
    } else if (y > 1.555) { // head and neck
      m = SKIN;
      if (bala && !(z < -0.07 && y > 1.69 && y < 1.735 && ax < 0.07)) m = BALA;
      else if (y < 1.585 && (suit || k === "shirt" || k === "coverall" || k === "jacket" || k === "hoodie") && !bala) m = k === "jacket" || k === "hoodie" ? TOP : SHIRT;
    } else if (y >= 1.0 || (k === "trench" && y > 0.55) || (top.hem && !top.tuck && y > 0.9)) { // torso
      m = TOP;
      if (belt && y >= 0.97 && y < 1.02) m = BELT;
      else if (suit && z < -0.05 && y > 1.28 && ax < (y - 1.28) * 0.24 + 0.006) m = top.tie && ax < 0.016 + (1.5 - y) * 0.02 && y < 1.53 ? TIE : SHIRT;
      else if (k === "open" && z < -0.05 && ax < 0.045 && y > 1.0) m = SHIRT;
    } else { // legs
      m = PANTS_;
      if (y < bootH) m = BOOT;
      else if (L.gear.includes("kneepads") && z < -0.03 && y > 0.43 && y < 0.53) m = PAD;
    }
    lists[m].push(t * 3, t * 3 + 1, t * 3 + 2);
  }
  const geo = new THREE.BufferGeometry();
  for (const name of Object.keys(ATH.geo.attributes)) geo.setAttribute(name, ATH.geo.attributes[name]);
  const index = []; let start = 0;
  lists.forEach((l, i) => { if (!l.length) return; for (const v of l) index.push(v); geo.addGroup(start, l.length, i); start += l.length; });
  geo.setIndex(index); geo.boundingSphere = ATH.geo.boundingSphere; geo.boundingBox = ATH.geo.boundingBox;
  trash.push(geo);
  const mesh = new THREE.Mesh(geo, MAT); mesh.castShadow = !mobile; mesh.receiveShadow = !mobile; g.add(mesh);
  // real cloth shapes around the hips, so clothes read as clothes: trouser seat, jacket hem, coat skirt
  const ring = (rt, rb, h, m, y, open) => { const cg = new THREE.CylinderGeometry(rt, rb, h, 32, 1, !!open); trash.push(cg); const me = new THREE.Mesh(cg, m); me.position.set(0, y, 0.01); me.scale.z = 0.68; me.castShadow = !mobile; g.add(me); return me; };
  const ringM = (v, r) => isPat(v) ? cloth(v, r, 3, 0.5) : null;
  ring(0.182, 0.186, 0.2, ringM(pantsC) || MAT[PANTS_], 0.895);
  if (suit || k === "open" || (top.hem && !top.tuck) || k === "jacket" || k === "hoodie") ring(0.192, 0.197, 0.13, ringM(body) || MAT[TOP], 0.96);
  if (k === "trench") {
    const coatM = isPat(body) ? MAT[TOP] : new THREE.MeshStandardMaterial({color: body, roughness: 0.8, side: THREE.DoubleSide, envMapIntensity: 0.35}); if (coatM !== MAT[TOP]) trash.push(coatM);
    ring(0.2, 0.27, 0.56, coatM, 0.76, true);
    ring(0.196, 0.196, 0.05, cloth(body, 0.6), 1.04);
  }
  if (belt) ring(0.188, 0.188, 0.045, MAT[BELT], 0.995);
  // boots and shoes over the feet (the model's feet are bare)
  for (const sx of [-1, 1]) {
    const bm = MAT[BOOT], dress = bootsId === "dress";
    const bg = new THREE.BoxGeometry(0.112, dress ? 0.08 : 0.095, 0.28); trash.push(bg);
    const b = new THREE.Mesh(bg, bm); b.position.set(sx * 0.135, dress ? 0.04 : 0.048, -0.01); b.rotation.y = -sx * 0.18; b.castShadow = !mobile; g.add(b);
    if (!dress) { const h = bootsId === "tactical" ? 0.1 : 0.2, cg = new THREE.CylinderGeometry(0.064, 0.068, h, 18); trash.push(cg); const c = new THREE.Mesh(cg, bm); c.position.set(sx * 0.108, 0.07 + h / 2, 0.07); c.castShadow = !mobile; g.add(c); }
    const sg = new THREE.BoxGeometry(0.116, 0.02, 0.285); trash.push(sg); const so = new THREE.Mesh(sg, MAT[PAD]); so.position.set(sx * 0.135, 0.011, -0.01); so.rotation.y = -sx * 0.18; g.add(so);
  }
  // the gear layer from the realistic style, fitted to this body
  const gear = buildAgent(THREE, look, {...o, style: "real", gearOnly: true, fz: lerpTable(ATH_FRONT), bz: lerpTable(ATH_BACK), armX: 0.262, armY: 1.3, head: {c: [0, 1.7, -0.022], k: [0.8, 0.86, 0.93]}});
  g.add(gear.group); trash.push(...gear.trash);
  // boots go with the legs
  for (const b of [...g.children]) if (b.isMesh && b !== mesh && b.position.y < 0.3) { const leg = gear.rigParts.legs[b.position.x < 0 ? 0 : 1]; b.position.sub(leg.position); leg.add(b); }
  const rig = {set(st) { gear.rig.set({...st, head: 0}); swingU.value.set(st.legL, st.legR, st.armL, st.armR); }, blink() {}};
  return {group: g, trash, look: L, rig};
}
