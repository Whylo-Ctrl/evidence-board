// A walk-around 3D room for the evidence board, drawn with three.js.
// The board on the back wall shows a live picture of the real board (painted by index.html).
// Click / tap the board and the camera walks up to it, then index.html swaps to the normal board view for editing.

const ROOM = {w: 6, h: 3, d: 6};               // metres: x -3..3, y 0..3, z -3..3
const BOARD_POS = {x: 0, y: 1.55, z: -2.965};  // centre of the board face
const TEX_W = 2.8, TEX_H = 1.9;                // the painted board picture, including a margin for items hanging off the edges
const ROOM_POSE = {x: 0, y: 1.62, z: 1.35, yaw: 0, pitch: -0.03};
const DOOR_POSE = {x: 0.35, y: 1.5, z: 2.7, yaw: 0.16, pitch: -0.02};

// per-room materials: textures cut from the room photos, tinted to taste
const STYLES = {
  office:     {wall: ["assets/wall-plaster.webp", 0x9aa4ad, 1.2], floor: ["assets/desk-wood.webp", 0x8a7060, 1.4], ceil: ["assets/wall-plaster.webp", 0x55595e, 1.5]},
  den:        {wall: ["assets/t-wall-cabin.webp", 0x8a6040, 1.6], floor: ["assets/desk-wood.webp", 0x9a7a60, 1.4], ceil: ["assets/t-wall-cabin.webp", 0x5a4030, 1.8]},
  archive:    {wall: ["assets/t-wall-cabin.webp", 0x5a4535, 1.6], floor: ["assets/desk-wood.webp", 0x705545, 1.4], ceil: ["assets/t-wall-cabin.webp", 0x3a2c22, 1.8]},
  precinct:   {wall: ["assets/t-wall-brick.webp", 0x8a6248, 1.3], floor: ["assets/t-floor-concrete.webp", 0x6a625a, 2], ceil: ["assets/t-ceil-beams.webp", 0x4a4038, 2], bulbs: 3},
  tabletop:   {wall: ["assets/wall-plaster.webp", 0x6a5a4a, 1.2], floor: ["assets/desk-wood.webp", 0x8a6a50, 1.4], ceil: ["assets/wall-plaster.webp", 0x40362e, 1.5]},
  cabin:      {wall: ["assets/t-wall-cabin.webp", 0xffffff, 1.6], floor: ["assets/t-floor-cabin.webp", 0xd8c8b8, 1.6], ceil: ["assets/t-wall-cabin.webp", 0xa09080, 1.8]},
  cozy:       {wall: ["assets/t-wall-cozy.webp", 0xffffff, 1.4], floor: ["assets/desk-wood.webp", 0xc8a888, 1.4], ceil: ["assets/t-wall-cozy.webp", 0xc0b0a0, 1.6]},
  workshop:   {wall: ["assets/t-wall-workshop.webp", 0xd8d8d8, 1.4], floor: ["assets/t-floor-concrete.webp", 0x6a6660, 2], ceil: ["assets/t-ceil-beams.webp", 0x55504a, 2]},
  industrial: {wall: ["assets/t-wall-industrial.webp", 0xffffff, 1.6], floor: ["assets/t-floor-concrete.webp", 0x9a9690, 2], ceil: ["assets/t-ceil-beams.webp", 0x8a8a8a, 2]},
  brick:      {wall: ["assets/t-wall-brick.webp", 0xffffff, 1.3], floor: ["assets/t-floor-concrete.webp", 0xc8c4be, 2], ceil: ["assets/t-ceil-beams.webp", 0xe0e0e0, 2]},
  garage:     {wall: ["assets/t-wall-garage.webp", 0xffffff, 1.5], floor: ["assets/t-floor-garage.webp", 0xd0c8c0, 1.6], ceil: ["assets/t-ceil-beams.webp", 0x8a8070, 2]},
};

export function createRoom(THREE, opts) {
  const {canvas, boardCanvas, mobile, onFocused, reducedMotion} = opts;
  const renderer = new THREE.WebGLRenderer({canvas, antialias: !mobile, powerPreference: mobile ? "low-power" : "high-performance"});
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, mobile ? 1.5 : 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = !mobile;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, 1, 0.05, 40);
  camera.rotation.order = "YXZ";
  const loader = new THREE.TextureLoader();
  const texCache = new Map(), disposables = [];
  const maxAniso = renderer.capabilities.getMaxAnisotropy();
  const tex = (url, rx = 1, ry = 1) => {
    const key = url + rx + "x" + ry;
    if (texCache.has(key)) return texCache.get(key);
    const t = loader.load(url);
    t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.MirroredRepeatWrapping; t.repeat.set(rx, ry); t.anisotropy = Math.min(8, maxAniso);
    texCache.set(key, t); return t;
  };
  const mat = (o) => { const m = new THREE.MeshStandardMaterial(o); disposables.push(m); return m; };
  const box = (w, h, d, material, x, y, z, parent = scene) => {
    const g = new THREE.BoxGeometry(w, h, d); disposables.push(g);
    const m = new THREE.Mesh(g, material); m.position.set(x, y, z); m.castShadow = m.receiveShadow = !mobile; parent.add(m); return m;
  };
  const plane = (w, h, material) => { const g = new THREE.PlaneGeometry(w, h); disposables.push(g); const m = new THREE.Mesh(g, material); m.receiveShadow = !mobile; return m; };

  // ---------- room shell (rebuilt when the room style changes) ----------
  const shell = new THREE.Group(); scene.add(shell);
  let styleKey = "";
  function buildShell(key) {
    if (key === styleKey) return; styleKey = key;
    shell.clear();
    const st = STYLES[key] || STYLES.office;
    const surf = ([url, tint, tile], w, h, rough = 0.92) => mat({map: tex(url, w / tile, h / tile), color: tint, roughness: rough});
    const wallM = surf(st.wall, ROOM.w, ROOM.h), sideM = surf(st.wall, ROOM.d, ROOM.h), floorM = surf(st.floor, ROOM.w, ROOM.d, 0.8), ceilM = surf(st.ceil, ROOM.w, ROOM.d);
    const back = plane(ROOM.w, ROOM.h, wallM); back.position.set(0, ROOM.h / 2, -ROOM.d / 2); shell.add(back);
    const front = plane(ROOM.w, ROOM.h, wallM); front.position.set(0, ROOM.h / 2, ROOM.d / 2); front.rotation.y = Math.PI; shell.add(front);
    const left = plane(ROOM.d, ROOM.h, sideM); left.position.set(-ROOM.w / 2, ROOM.h / 2, 0); left.rotation.y = Math.PI / 2; shell.add(left);
    const right = plane(ROOM.d, ROOM.h, sideM); right.position.set(ROOM.w / 2, ROOM.h / 2, 0); right.rotation.y = -Math.PI / 2; shell.add(right);
    const floor = plane(ROOM.w, ROOM.d, floorM); floor.rotation.x = -Math.PI / 2; shell.add(floor);
    const ceil = plane(ROOM.w, ROOM.d, ceilM); ceil.position.y = ROOM.h; ceil.rotation.x = Math.PI / 2; shell.add(ceil);
    // skirting boards and a door behind you (the way you came in)
    const trim = mat({color: 0x2a1c12, roughness: 0.7});
    box(ROOM.w, 0.12, 0.03, trim, 0, 0.06, -ROOM.d / 2 + 0.015, shell); box(ROOM.w, 0.12, 0.03, trim, 0, 0.06, ROOM.d / 2 - 0.015, shell);
    box(0.03, 0.12, ROOM.d, trim, -ROOM.w / 2 + 0.015, 0.06, 0, shell); box(0.03, 0.12, ROOM.d, trim, ROOM.w / 2 - 0.015, 0.06, 0, shell);
    const doorM = mat({map: tex("assets/desk-wood.webp", 1, 2), color: 0x6a4a34, roughness: 0.6});
    box(0.95, 2.1, 0.05, doorM, 0.35, 1.05, ROOM.d / 2 - 0.03, shell);
    box(1.08, 0.08, 0.07, trim, 0.35, 2.14, ROOM.d / 2 - 0.035, shell); box(0.07, 2.18, 0.07, trim, -0.16, 1.09, ROOM.d / 2 - 0.035, shell); box(0.07, 2.18, 0.07, trim, 0.86, 1.09, ROOM.d / 2 - 0.035, shell);
    const knob = new THREE.Mesh(new THREE.SphereGeometry(0.035, 16, 12), mat({color: 0xb08a48, metalness: 0.8, roughness: 0.3})); knob.position.set(0.72, 1.0, ROOM.d / 2 - 0.08); shell.add(knob);
    buildLights(st.bulbs || 1);
  }

  // ---------- furniture: desk, chair, filing cabinet, props from the photos ----------
  const wood = mat({map: tex("assets/desk-wood.webp", 1, 1), color: 0x7a5a42, roughness: 0.55});
  const deskTopY = 0.76, deskZ = -2.62;
  box(2.1, 0.05, 0.72, wood, 0, deskTopY - 0.025, deskZ);
  for (const [lx, lz] of [[-1, -0.32], [1, -0.32], [-1, 0.32], [1, 0.32]]) box(0.05, deskTopY - 0.05, 0.05, wood, lx, (deskTopY - 0.05) / 2, deskZ + lz);
  box(2.0, 0.16, 0.02, wood, 0, deskTopY - 0.13, deskZ + 0.35);
  const metal = mat({color: 0x4c544a, metalness: 0.45, roughness: 0.55});
  const cab = box(0.52, 1.32, 0.62, metal, 2.42, 0.66, -2.62);
  for (let i = 0; i < 4; i++) { box(0.46, 0.005, 0.01, mat({color: 0x2a2e28}), 2.42, 0.33 * i + 0.17, -2.30); box(0.12, 0.025, 0.03, mat({color: 0xb0b4ae, metalness: 0.9, roughness: 0.25}), 2.42, 0.33 * i + 0.27, -2.29); }
  void cab;
  const chair = new THREE.Group(); scene.add(chair);
  const chairM = mat({color: 0x3a2618, roughness: 0.6});
  box(0.46, 0.04, 0.44, chairM, 0, 0.46, 0, chair); box(0.46, 0.5, 0.04, chairM, 0, 0.75, 0.21, chair);
  for (const [cx, cz] of [[-0.2, -0.19], [0.2, -0.19], [-0.2, 0.19], [0.2, 0.19]]) box(0.035, 0.46, 0.035, chairM, cx, 0.23, cz, chair);
  chair.position.set(1.05, 0, -1.95); chair.rotation.y = -0.75;
  // left wall: a night window with blinds, letting in a little blue light
  {
    const c = document.createElement("canvas"); c.width = 256; c.height = 280;
    const x = c.getContext("2d"), g = x.createLinearGradient(0, 0, 0, 280);
    g.addColorStop(0, "#1b2a44"); g.addColorStop(1, "#4a5e7a"); x.fillStyle = g; x.fillRect(0, 0, 256, 280);
    for (let i = 0; i < 18; i++) { x.fillStyle = "rgba(10,8,6,.82)"; x.fillRect(0, i * 15.5, 256, 9); x.fillStyle = "rgba(255,255,255,.05)"; x.fillRect(0, i * 15.5, 256, 1.5); }
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; disposables.push(t);
    const win = plane(1.15, 1.3, new THREE.MeshBasicMaterial({map: t})); disposables.push(win.material);
    win.position.set(-ROOM.w / 2 + 0.012, 1.7, -0.7); win.rotation.y = Math.PI / 2; scene.add(win);
    const fr = mat({color: 0x24180f, roughness: 0.7});
    box(0.06, 1.42, 0.06, fr, -ROOM.w / 2 + 0.03, 1.7, -1.3); box(0.06, 1.42, 0.06, fr, -ROOM.w / 2 + 0.03, 1.7, -0.1);
    box(0.06, 0.06, 1.26, fr, -ROOM.w / 2 + 0.03, 2.38, -0.7); box(0.14, 0.05, 1.3, fr, -ROOM.w / 2 + 0.07, 1.03, -0.7);
    const moon = new THREE.PointLight(0x7f9cff, 2.2, 0, 1.6); moon.position.set(-ROOM.w / 2 + 0.6, 1.8, -0.7); scene.add(moon);
  }
  // right wall: a bookshelf and a framed photo from one of the rooms
  {
    const sx = ROOM.w / 2 - 0.2, sz = 0.6, shelfM = mat({map: tex("assets/desk-wood.webp", 1, 2), color: 0x5a3e2a, roughness: 0.7});
    box(0.36, 1.9, 0.04, shelfM, sx, 0.95, sz - 0.5); box(0.36, 1.9, 0.04, shelfM, sx, 0.95, sz + 0.5); box(0.02, 1.9, 1.0, shelfM, sx + 0.17, 0.95, sz);
    const colors = [0x6b2a20, 0x2c3a4e, 0x5a4a2a, 0x3b3a34, 0x7a5a32, 0x2f4a36, 0x4a2a3a, 0x8a7652];
    let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    for (let i = 0; i < 5; i++) {
      const y = 0.08 + i * 0.44; box(0.36, 0.025, 1.0, shelfM, sx, y, sz);
      if (i === 4) break;
      let z = sz - 0.46;
      while (z < sz + 0.42) { const bw = 0.03 + rnd() * 0.04, bh = 0.24 + rnd() * 0.12; box(0.24, bh, bw, mat({color: colors[Math.floor(rnd() * colors.length)], roughness: 0.8}), sx - 0.02, y + 0.012 + bh / 2, z + bw / 2); z += bw + 0.004; if (rnd() < 0.08) z += 0.08; }
    }
    const photo = plane(0.78, 0.52, mat({map: tex("assets/room-garage.webp"), roughness: 0.5}));
    photo.position.set(ROOM.w / 2 - 0.025, 1.72, -1.35); photo.rotation.y = -Math.PI / 2; scene.add(photo);
    const pf = mat({color: 0x14100c, roughness: 0.4});
    box(0.03, 0.62, 0.05, pf, ROOM.w / 2 - 0.02, 1.72, -1.77); box(0.03, 0.62, 0.05, pf, ROOM.w / 2 - 0.02, 1.72, -0.93);
    box(0.03, 0.05, 0.89, pf, ROOM.w / 2 - 0.02, 2.03, -1.35); box(0.03, 0.05, 0.89, pf, ROOM.w / 2 - 0.02, 1.41, -1.35);
  }
  // flat cut-out props standing on the desk (they face you, like stage props)
  const prop = (url, w, h, x, z, rotY = 0) => {
    const m = mat({map: tex(url), transparent: true, alphaTest: 0.45, roughness: 0.6, side: THREE.DoubleSide});
    const p = plane(w, h, m); p.position.set(x, deskTopY + h / 2, z); p.rotation.y = rotY; p.castShadow = !mobile; scene.add(p); return p;
  };
  prop("assets/prop-lamp.webp", 0.62, 0.51, -0.62, deskZ - 0.06, 0.12);
  prop("assets/prop-phone.webp", 0.3, 0.19, -0.05, deskZ + 0.05, 0.05);
  prop("assets/prop-typewriter.webp", 0.42, 0.275, 0.62, deskZ + 0.02, -0.12);

  // ---------- the board: a thin backing plus the live picture of the board ----------
  const boardTex = new THREE.CanvasTexture(boardCanvas);
  boardTex.colorSpace = THREE.SRGBColorSpace; boardTex.anisotropy = Math.min(8, maxAniso);
  const boardMesh = plane(TEX_W, TEX_H, mat({map: boardTex, transparent: true, alphaTest: 0.04, roughness: 0.85}));
  boardMesh.position.set(BOARD_POS.x, BOARD_POS.y, BOARD_POS.z); scene.add(boardMesh);
  const backing = box(2.42, 1.52, 0.03, mat({color: 0x1a120c, roughness: 0.8}), BOARD_POS.x, BOARD_POS.y, BOARD_POS.z - 0.02);
  const pickables = [boardMesh, backing];

  // ---------- lights ----------
  const lights = new THREE.Group(); scene.add(lights);
  const ambient = new THREE.HemisphereLight(0xffe2c0, 0x1a120c, 0.5); scene.add(ambient);
  const lamp = new THREE.SpotLight(0xffc27a, 5, 0, 1.0, 0.95, 1.6);
  lamp.position.set(-0.5, deskTopY + 0.4, deskZ + 0.18); lamp.target.position.set(0.1, 1.7, -3); scene.add(lamp, lamp.target);
  lamp.castShadow = !mobile; lamp.shadow.mapSize.set(1024, 1024); lamp.shadow.bias = -0.0008;
  function buildLights(n) {
    lights.clear();
    for (let i = 0; i < n; i++) {
      const x = n === 1 ? 0 : (i - (n - 1) / 2) * 1.2, y = 2.5, z = n === 1 ? -1.2 : -2.2;
      const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.045, 16, 12), new THREE.MeshBasicMaterial({color: 0xfff1d0}));
      bulb.position.set(x, y, z); lights.add(bulb);
      const cord = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, ROOM.h - y), new THREE.MeshBasicMaterial({color: 0x111111}));
      cord.position.set(x, (ROOM.h + y) / 2, z); lights.add(cord);
      const pl = new THREE.PointLight(0xffc887, n === 1 ? 16 : 8, 0, 1.7); pl.position.set(x, y - 0.06, z); lights.add(pl);
    }
  }
  let lightMode = "lamp";
  function setLight(mode) {
    lightMode = mode;
    ambient.intensity = mode === "lamp" ? 0.75 : 1.8;
    scene.fog = mode === "lamp" ? new THREE.Fog(0x080604, 6, 15) : null;
    renderer.toneMappingExposure = mode === "lamp" ? 1.3 : 1.25;
  }

  // ---------- camera: pose, look, walk ----------
  const pose = {...ROOM_POSE};
  let fovBase = 60, anim = null, running = false;
  const applyPose = (bob = 0) => { camera.position.set(pose.x, pose.y + bob, pose.z); camera.rotation.set(pose.pitch, pose.yaw, 0); };
  function resize() {
    const w = canvas.clientWidth || innerWidth, h = canvas.clientHeight || innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    fovBase = camera.aspect < 0.8 ? 74 : 60; // taller field of view on portrait phones
    if (!anim) camera.fov = fovBase;
    camera.updateProjectionMatrix();
  }
  // where to stand so the board (plus a little margin) fills the screen, straight on
  function focusPose() {
    const vf = THREE.MathUtils.degToRad(fovBase) / 2, t = Math.tan(vf);
    const dist = Math.max((1.5 / 2 + 0.28) / t, (2.4 / 2 + 0.22) / (t * camera.aspect));
    return {x: BOARD_POS.x, y: BOARD_POS.y, z: BOARD_POS.z + dist, yaw: 0, pitch: 0};
  }
  const ease = k => k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
  function moveTo(target, ms, {bob = false, done} = {}) {
    if (reducedMotion) { Object.assign(pose, target); applyPose(); done?.(); return; }
    const from = {...pose}, dyaw = ((target.yaw - from.yaw + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
    anim = {t0: performance.now(), ms, step(k, now) {
      const e = ease(k);
      for (const key of ["x", "y", "z", "pitch"]) pose[key] = from[key] + (target[key] - from[key]) * e;
      pose.yaw = from.yaw + dyaw * e;
      const stride = Math.sin(Math.PI * k), sec = (now - this.t0) / 1000;
      applyPose(bob ? Math.abs(Math.sin(sec * Math.PI * 1.9)) * 0.035 * stride : 0);
      if (k >= 1) { anim = null; done?.(); }
    }};
  }

  // controls: drag to look, pinch / wheel to zoom, WASD / arrows to walk, click the board to focus
  const pointers = new Map();
  let drag = null, pinch0 = null;
  const keys = new Set();
  const onDown = e => {
    if (!running || anim) return;
    canvas.setPointerCapture?.(e.pointerId);
    pointers.set(e.pointerId, {x: e.clientX, y: e.clientY});
    if (pointers.size === 2) { const [a, b] = [...pointers.values()]; pinch0 = {d: Math.hypot(a.x - b.x, a.y - b.y), fov: camera.fov}; drag = null; return; }
    drag = {x: e.clientX, y: e.clientY, yaw: pose.yaw, pitch: pose.pitch, moved: false};
  };
  const onMove = e => {
    if (!running) return;
    if (pointers.has(e.pointerId)) pointers.set(e.pointerId, {x: e.clientX, y: e.clientY});
    if (pinch0 && pointers.size === 2) { const [a, b] = [...pointers.values()]; camera.fov = THREE.MathUtils.clamp(pinch0.fov * pinch0.d / Math.max(1, Math.hypot(a.x - b.x, a.y - b.y)), 30, 85); camera.updateProjectionMatrix(); return; }
    if (drag) {
      const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
      if (Math.hypot(dx, dy) > 6) drag.moved = true;
      const k = (camera.fov / 60) * 0.0042;
      pose.yaw = drag.yaw + dx * k; pose.pitch = THREE.MathUtils.clamp(drag.pitch + dy * k, -1.2, 1.2);
      applyPose();
    } else if (e.pointerType === "mouse") canvas.style.cursor = hitBoard(e) ? "pointer" : "grab";
  };
  const onUp = e => {
    pointers.delete(e.pointerId);
    if (pointers.size < 2) pinch0 = null;
    if (drag && !drag.moved && e.type === "pointerup" && hitBoard(e)) focusBoard();
    if (!pointers.size) drag = null;
  };
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
  function hitBoard(e) {
    const r = canvas.getBoundingClientRect();
    ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ndc, camera);
    return ray.intersectObjects(pickables, false).length > 0;
  }
  const onWheel = e => { if (!running) return; e.preventDefault(); camera.fov = THREE.MathUtils.clamp(camera.fov * Math.exp(e.deltaY * 0.0012), 30, 85); camera.updateProjectionMatrix(); };
  const typing = () => /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName || "") || !document.getElementById("modal")?.hidden;
  const onKey = e => { if (!running || typing()) return; const k = e.key.toLowerCase(); if (["w", "a", "s", "d", "arrowup", "arrowdown", "arrowleft", "arrowright"].includes(k)) { e.preventDefault(); e.type === "keydown" ? keys.add(k) : keys.delete(k); } };
  canvas.addEventListener("pointerdown", onDown); addEventListener("pointermove", onMove); addEventListener("pointerup", onUp); addEventListener("pointercancel", onUp);
  canvas.addEventListener("wheel", onWheel, {passive: false}); addEventListener("keydown", onKey); addEventListener("keyup", onKey); addEventListener("resize", resize);

  let last = performance.now();
  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    if (anim) anim.step(Math.min(1, (now - anim.t0) / anim.ms), now);
    else if (keys.size) {
      const sp = 1.6 * dt, f = (keys.has("w") || keys.has("arrowup") ? 1 : 0) - (keys.has("s") || keys.has("arrowdown") ? 1 : 0);
      const turn = (keys.has("arrowleft") ? 1 : 0) - (keys.has("arrowright") ? 1 : 0), side = (keys.has("d") ? 1 : 0) - (keys.has("a") ? 1 : 0);
      pose.yaw += turn * 1.6 * dt;
      pose.x += (-Math.sin(pose.yaw) * f + Math.cos(pose.yaw) * side) * sp;
      pose.z += (-Math.cos(pose.yaw) * f - Math.sin(pose.yaw) * side) * sp;
      pose.x = THREE.MathUtils.clamp(pose.x, -2.5, 2.5); pose.z = THREE.MathUtils.clamp(pose.z, -1.75, 2.5);
      applyPose();
    }
    renderer.render(scene, camera);
  }

  // ---------- public API ----------
  function focusBoard() {
    if (anim) return;
    moveTo(focusPose(), 1100, {done: () => onFocused?.()});
  }
  return {
    setScene(sc) { buildShell(sc.room); setLight(sc.light); },
    refreshBoard() { boardTex.needsUpdate = true; },
    walkIn() { Object.assign(pose, DOOR_POSE); applyPose(); moveTo(ROOM_POSE, 2600, {bob: true}); },
    toRoom() { moveTo(ROOM_POSE, 900); },
    fromBoard() { resize(); Object.assign(pose, focusPose()); applyPose(); moveTo(ROOM_POSE, 1100); },
    focusBoard,
    start() { if (running) return; running = true; resize(); applyPose(); last = performance.now(); renderer.setAnimationLoop(frame); },
    stop() { running = false; keys.clear(); renderer.setAnimationLoop(null); },
    get busy() { return !!anim; },
    dispose() {
      this.stop();
      canvas.removeEventListener("pointerdown", onDown); removeEventListener("pointermove", onMove); removeEventListener("pointerup", onUp); removeEventListener("pointercancel", onUp);
      canvas.removeEventListener("wheel", onWheel); removeEventListener("keydown", onKey); removeEventListener("keyup", onKey); removeEventListener("resize", resize);
      for (const t of texCache.values()) t.dispose();
      boardTex.dispose();
      for (const d of disposables) d.dispose?.();
      scene.traverse(o => { o.geometry?.dispose?.(); });
      renderer.dispose();
    },
  };
}
