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
  const fz = y => -rAt(y) * 0.62 * bulk; // front surface
  const bz = y => rAt(y) * 0.62 * bulk;  // back surface

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
    box(0.375, 0.048, 0.24, solid(L.gear.includes("belt") ? (f === "mil" ? "#5c4f3a" : "#161616") : "#1b1410", 0.6), 0, 0.97, 0);
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
  cyl(0.05, 0.052, 0.1, bala ? solid(balaCol, 0.9) : skinM, 0, 1.54, 0);
  if (L.neck === "shemagh") { const sm = M({map: checkerTex(THREE, f === "mil" ? "#b9a77f" : "#2a2a2a", f === "mil" ? "#5a4a32" : "#d8d2c4"), roughness: 0.95}); cyl(0.095, 0.11, 0.085, sm, 0, 1.51, 0, null, [1, 1, 0.9]); add(new THREE.ConeGeometry(0.08, 0.14, 3), sm, 0, 1.4, fz(1.4) - 0.02, [Math.PI, 0, 0], [1, 1, 0.2]); }
  else if (L.neck === "gaiter") cyl(0.066, 0.066, 0.11, fabric(gearCol, 0.9), 0, 1.53, 0);
  else if (L.neck === "scarf") { const sm = solid(f === "cia" ? "#6b1e24" : "#4a4a4a", 0.95); cyl(0.08, 0.086, 0.06, sm, 0, 1.51, 0); box(0.05, 0.3, 0.012, sm, 0.05, 1.33, fz(1.33) - 0.012 - vestD); }

  const HY = 1.66; // centre of the head
  sph(0.115, skinM, 0, HY, 0, [1, 1.1, 1], null, 22);
  sph(0.02, L.cover === "balaclava" ? solid(f === "mil" ? "#2a2c22" : "#111214", 0.9) : skinM, 0, 1.652, -0.117, [0.8, 1, 1.1], null, 10); // nose
  if (L.cover !== "balaclava") for (const sx of [-1, 1]) sph(0.022, skinM, sx * 0.115, HY, 0, [0.5, 1, 1], null, 10); // ears
  const face = add(new THREE.SphereGeometry(0.1163, 32, 16, Math.PI, Math.PI, 0.25 * Math.PI, 0.5 * Math.PI), M({map: faceTex(THREE, L), transparent: true, alphaTest: 0.04, roughness: 0.6, polygonOffset: true, polygonOffsetFactor: -1}), 0, HY, 0, null, [1, 1.1, 1]);
  face.castShadow = false;
  if (bala) sph(0.1188, M({map: balaclavaTex(THREE, balaCol), transparent: true, alphaTest: 0.5, roughness: 0.95}), 0, HY, 0, [1, 1.1, 1], null, 26);
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
  if (L.patchShoulder) decal(textTex(THREE, L.patchShoulder, {w: 128, h: 128, ...ps, border: ps.fg, round: 40, scale: 0.42}), 0.075, 0.075, -0.284, 1.32, 0, -Math.PI / 2);
  if (L.flag !== "none") decal(flagTex(THREE, L.flag), 0.085, 0.045, 0.284, 1.34, 0, Math.PI / 2);

  return {group: g, trash, look: L};
}
