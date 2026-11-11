import {buildAgent, labelLines} from "./agent3d.js";
// A walk-around 3D room for the evidence board, drawn with three.js.
// The board on the back wall shows a live picture of the real board (painted by index.html).
// Click / tap the board and the camera walks up to it, then index.html swaps to the normal board view for editing.

const ROOM = {w: 6, h: 3, d: 6};               // metres: x -3..3, y 0..3, z -3..3
const BOARD_POS = {x: 0, y: 1.55, z: -2.965};  // centre of the board face
const TEX_W = 2.8, TEX_H = 1.9;                // the painted board picture, including a margin for items hanging off the edges
const ROOM_POSE = {x: 0, y: 1.62, z: 1.35, yaw: 0, pitch: -0.03};
const DOOR_POSE = {x: 0.35, y: 1.5, z: 2.7, yaw: 0.16, pitch: -0.02};

// per-room materials: textures cut from the room photos, tinted to taste
// per-room surfaces: real tileable materials (CC0, Poly Haven) as [material, tint, metres per tile]
const STYLES = {
  office:     {wall: ["grey_plaster_02", 0x8a929a, 2.0], floor: ["dark_wooden_planks", 0xffffff, 2.0], ceil: ["grey_plaster", 0x6a6e72, 2.5]},
  den:        {wall: ["dark_paneled_wood", 0xffffff, 2.0], floor: ["herringbone_parquet", 0xffffff, 1.6], ceil: ["grey_plaster", 0x8a8070, 2.5]},
  archive:    {wall: ["concrete_wall_004", 0xb0aaa0, 2.5], floor: ["linoleum_brown", 0xffffff, 2.0], ceil: ["grey_plaster", 0x707070, 2.5]},
  precinct:   {wall: ["brick_wall_13", 0xffffff, 1.6], floor: ["linoleum_brown", 0xffffff, 2.0], ceil: ["grey_plaster", 0x6a6058, 2.5]},
  tabletop:   {wall: ["brown_planks_07", 0xb0a090, 2.0], floor: ["dark_wooden_planks", 0xffffff, 2.0], ceil: ["brown_planks_07", 0x806a58, 2.0]},
  cabin:      {wall: ["distressed_painted_planks", 0xffffff, 2.0], floor: ["dark_wooden_planks", 0xffffff, 2.0], ceil: ["brown_planks_07", 0xa08a78, 2.0]},
  cozy:       {wall: ["beige_wall_001", 0xffffff, 2.5], floor: ["herringbone_parquet", 0xffffff, 1.6], ceil: ["beige_wall_001", 0xd8d0c8, 2.5]},
  workshop:   {wall: ["concrete_block_wall", 0xb8b4ae, 2.4], floor: ["garage_floor", 0xffffff, 2.5], ceil: ["concrete_wall_004", 0x8a8680, 2.5]},
  industrial: {wall: ["blue_plaster_weathered", 0xffffff, 2.5], floor: ["concrete_floor_worn_001", 0xffffff, 2.5], ceil: ["corrugated_iron", 0x9a9a9a, 1.5]},
  brick:      {wall: ["castle_brick_02_white", 0xffffff, 2.0], floor: ["concrete_floor_worn_001", 0xd8d8d8, 2.5], ceil: ["grey_plaster", 0xf0f0f0, 2.5]},
  garage:     {wall: ["concrete_wall_004", 0xd0ccc4, 2.5], floor: ["garage_floor", 0xffffff, 2.5], ceil: ["corrugated_iron", 0x8a8070, 1.5]},
};

export function createRoom(THREE, opts) {
  const {canvas, boardCanvas, mobile, onFocused, onTray, reducedMotion, addons = {}} = opts;
  const renderer = new THREE.WebGLRenderer({canvas, antialias: !mobile, powerPreference: mobile ? "low-power" : "high-performance"});
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, mobile ? 1.5 : addons.EffectComposer ? 1.5 : 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = !mobile;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, 1, 0.05, 40);
  // soft reflections for metal, glass and polished wood
  if (addons.RoomEnvironment) { const pm = new THREE.PMREMGenerator(renderer); scene.environment = pm.fromScene(new addons.RoomEnvironment(), 0.04).texture; pm.dispose(); }
  // computers: ambient occlusion (contact shadows), bloom around lights, film grain and vignette
  let composer = null, grainPass = null;
  if (!mobile && addons.EffectComposer && addons.RenderPass) {
    composer = new addons.EffectComposer(renderer);
    composer.addPass(new addons.RenderPass(scene, camera));
    if (addons.GTAOPass) { const ao = new addons.GTAOPass(scene, camera, 1, 1); ao.blendIntensity = 1; ao.updateGtaoMaterial?.({radius: 0.4, distanceExponent: 1.4, thickness: 1.2, scale: 1.1}); composer.addPass(ao);
      // cut-out photos are flat rectangles to this effect, so leave them out of it
      const hideBase = ao.overrideVisibility?.bind(ao); if (hideBase) ao.overrideVisibility = () => { hideBase(); scene.traverse(o => { if (o.userData.noAO) o.visible = false; }); }; }
    if (addons.UnrealBloomPass) composer.addPass(new addons.UnrealBloomPass(new THREE.Vector2(256, 256), 0.18, 0.4, 0.97));
    if (addons.OutputPass) composer.addPass(new addons.OutputPass());
    if (addons.ShaderPass) {
      grainPass = new addons.ShaderPass({
        uniforms: {tDiffuse: {value: null}, time: {value: 0}, amount: {value: 0.04}, vig: {value: 0.38}},
        vertexShader: "varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",
        fragmentShader: "uniform sampler2D tDiffuse; uniform float time, amount, vig; varying vec2 vUv;\n" +
          "float rnd(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233)) + time) * 43758.5453); }\n" +
          "void main(){ vec4 c = texture2D(tDiffuse, vUv); c.rgb += (rnd(vUv * 1000.0) - 0.5) * amount; float d = distance(vUv, vec2(0.5)); c.rgb *= 1.0 - vig * smoothstep(0.35, 0.85, d); gl_FragColor = c; }",
      });
      composer.addPass(grainPass);
    }
  }
  camera.rotation.order = "YXZ";
  const loader = new THREE.TextureLoader();
  const texCache = new Map(), disposables = [];
  const maxAniso = renderer.capabilities.getMaxAnisotropy();
  const tex = (url, rx = 1, ry = 1, opt = {}) => {
    const key = url + rx + "x" + ry + (opt.data ? "d" : "") + (opt.repeat ? "r" : "");
    if (texCache.has(key)) return texCache.get(key);
    const t = loader.load(url);
    t.colorSpace = opt.data ? THREE.NoColorSpace : THREE.SRGBColorSpace; t.wrapS = t.wrapT = opt.repeat ? THREE.RepeatWrapping : THREE.MirroredRepeatWrapping; t.repeat.set(rx, ry); t.anisotropy = Math.min(8, maxAniso);
    texCache.set(key, t); return t;
  };
  const mat = (o) => { const m = new THREE.MeshStandardMaterial({envMapIntensity: 0.35, ...o}); disposables.push(m); return m; };
  const box = (w, h, d, material, x, y, z, parent = scene) => {
    const r = Math.min(w, h, d), g = addons.RoundedBoxGeometry && r > 0.035 ? new addons.RoundedBoxGeometry(w, h, d, 2, Math.min(0.012, r * 0.2)) : new THREE.BoxGeometry(w, h, d); disposables.push(g);
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
    // colour + (computers) normal and roughness maps for real surface depth
    const surf = ([id, tint, tile], w, h) => {
      const rx = w / tile, ry = h / tile, base = `assets/pbr/${id}`;
      const o = {map: tex(`${base}_diff.jpg`, rx, ry, {repeat: true}), color: tint, roughness: 1};
      if (!mobile) { o.normalMap = tex(`${base}_nor.jpg`, rx, ry, {repeat: true, data: true}); o.roughnessMap = tex(`${base}_rough.jpg`, rx, ry, {repeat: true, data: true}); }
      return mat(o);
    };
    const wallM = surf(st.wall, ROOM.w, ROOM.h), sideM = surf(st.wall, ROOM.d, ROOM.h), floorM = surf(st.floor, ROOM.w, ROOM.d), ceilM = surf(st.ceil, ROOM.w, ROOM.d);
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
    furnish(key);
  }

  // ---------- the board: a thin backing plus the live picture of the board ----------
  const boardTex = new THREE.CanvasTexture(boardCanvas);
  boardTex.colorSpace = THREE.SRGBColorSpace; boardTex.anisotropy = Math.min(8, maxAniso);
  const boardMesh = plane(TEX_W, TEX_H, mat({map: boardTex, transparent: true, alphaTest: 0.04, roughness: 0.85}));
  boardMesh.position.set(BOARD_POS.x, BOARD_POS.y, BOARD_POS.z); scene.add(boardMesh);
  const backing = box(2.42, 1.52, 0.03, mat({color: 0x1a120c, roughness: 0.8}), BOARD_POS.x, BOARD_POS.y, BOARD_POS.z - 0.02);
  const pickables = [boardMesh, backing];

  // ---------- lights that every room has: soft fill plus a light on the board ----------
  const ambient = new THREE.HemisphereLight(0xffe2c0, 0x1a120c, 0.5); scene.add(ambient);
  const boardLight = new THREE.SpotLight(0xffc27a, 5, 0, 1.0, 0.95, 1.6);
  boardLight.target.position.set(0.1, 1.7, -3); scene.add(boardLight, boardLight.target);
  boardLight.castShadow = !mobile; boardLight.shadow.mapSize.set(1024, 1024); boardLight.shadow.bias = -0.0008;
  let ambientK = 1, lightMode = "lamp";
  function setLight(mode) {
    lightMode = mode;
    ambient.intensity = (mode === "lamp" ? 0.75 : 1.8) * ambientK;
    scene.fog = mode === "lamp" ? new THREE.Fog(0x080604, 6, 15) : null;
    renderer.toneMappingExposure = mode === "lamp" ? 1.3 : 1.25;
  }

  // ---------- furniture kit ----------
  const furn = new THREE.Group(); scene.add(furn);
  const flickers = [], facers = [];
  let shadowBulb = null;
  // dust drifting in the light
  const DUST = mobile ? 90 : 200, dustBase = new Float32Array(DUST * 3), dustPos = new Float32Array(DUST * 3);
  for (let i = 0; i < DUST; i++) { dustBase[i * 3] = (Math.random() - 0.5) * 4.4; dustBase[i * 3 + 1] = 0.4 + Math.random() * 2.3; dustBase[i * 3 + 2] = -2.85 + Math.random() * 3.3; }
  const dustGeo = new THREE.BufferGeometry(); dustGeo.setAttribute("position", new THREE.BufferAttribute(dustPos, 3)); disposables.push(dustGeo);
  const dustMat = new THREE.PointsMaterial({color: 0xffe6c0, size: 0.005, transparent: true, opacity: 0.22, depthWrite: false, blending: THREE.AdditiveBlending}); disposables.push(dustMat);
  const dust = new THREE.Points(dustGeo, dustMat); dust.frustumCulled = false; scene.add(dust);
  const W2 = ROOM.w / 2, D2 = ROOM.d / 2;
  let seed = 7;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const M = {
    wood: () => { const t = tex("assets/desk-wood.webp", 1, 1); return mat({map: t, bumpMap: t, bumpScale: 0.5, color: 0x7a5a42, roughness: 0.5}); },
    darkWood: () => { const t = tex("assets/desk-wood.webp", 1, 1); return mat({map: t, bumpMap: t, bumpScale: 0.5, color: 0x4a3222, roughness: 0.5}); },
    rough: () => { const t = tex("assets/t-floor-cabin.webp", 1, 1); return mat({map: t, bumpMap: t, bumpScale: 1.2, color: 0xb09a84, roughness: 0.9}); },
    metal: (c = 0x4c544a) => mat({color: c, metalness: 0.45, roughness: 0.55}),
    paint: (c, r = 0.7) => mat({color: c, roughness: r}),
    glow: (c) => { const m = new THREE.MeshBasicMaterial({color: c}); disposables.push(m); return m; },
    card: () => mat({map: tex("assets/card-strip.webp", 1, 1), color: 0xc9a070, roughness: 0.9}),
  };
  const B = {
    box(w, h, d, m, x, y, z, ry = 0) { const b = box(w, h, d, m, x, y, z, furn); b.rotation.y = ry; return b; },
    cyl(rt, rb, h, m, x, y, z, seg = 18) { const g = new THREE.CylinderGeometry(rt, rb, h, seg); disposables.push(g); const c = new THREE.Mesh(g, m); c.position.set(x, y, z); c.castShadow = c.receiveShadow = !mobile; furn.add(c); return c; },
    canvasTex(w, h, draw) { const c = document.createElement("canvas"); c.width = w; c.height = h; draw(c.getContext("2d"), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; disposables.push(t); return t; },
    // a flat cut-out photo standing up (props), or lying down on a surface
    stand(url, w, h, x, yBottom, z, ry = 0) { const p = plane(w, h, mat({map: tex(url), transparent: true, alphaTest: 0.45, roughness: 0.6, side: THREE.DoubleSide})); p.position.set(x, yBottom + h / 2, z); p.rotation.y = ry; p.castShadow = !mobile; p.userData.noAO = true; furn.add(p); facers.push(p); return p; },
    lay(map, w, h, x, y, z, rz = 0, transparent = true) { const p = plane(w, h, mat({map, transparent, alphaTest: transparent ? 0.3 : 0, roughness: 0.85, side: THREE.DoubleSide})); p.position.set(x, y, z); p.rotation.set(-Math.PI / 2, 0, rz); furn.add(p); return p; },
    onWall(map, wall, z, y, w, h, opts = {}) {
      const m = opts.basic ? new THREE.MeshBasicMaterial({map}) : mat({map, roughness: 0.6}); if (opts.basic) disposables.push(m);
      const p = plane(w, h, m), off = 0.012;
      if (wall === "left") { p.position.set(-W2 + off, y, z); p.rotation.y = Math.PI / 2; } else if (wall === "right") { p.position.set(W2 - off, y, z); p.rotation.y = -Math.PI / 2; } else { p.position.set(z, y, -D2 + off); }
      furn.add(p); return p;
    },
    desk(x, z, w, d, m, top = 0.76, legsM = m) {
      B.box(w, 0.05, d, m, x, top - 0.025, z);
      for (const [lx, lz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) B.box(0.05, top - 0.05, 0.05, legsM, x + lx * (w / 2 - 0.06), (top - 0.05) / 2, z + lz * (d / 2 - 0.05));
      return top;
    },
    deskProps(z, top, which) {
      if (which.includes("lamp")) B.stand("assets/prop-lamp.webp", 0.62, 0.51, -0.62, top, z - 0.06, 0.12);
      if (which.includes("phone")) B.stand("assets/prop-phone.webp", 0.3, 0.19, -0.05, top, z + 0.05, 0.05);
      if (which.includes("typewriter")) B.stand("assets/prop-typewriter.webp", 0.42, 0.275, 0.62, top, z + 0.02, -0.12);
    },
    filing(x, z, ry = 0, color = 0x4c544a, drawers = 4) {
      const g = new THREE.Group(); furn.add(g); g.position.set(x, 0, z); g.rotation.y = ry;
      const h = drawers * 0.33 + 0.02, body = box(0.5, h, 0.62, M.metal(color), 0, h / 2, 0, g); void body;
      const line = M.paint(0x22251f), handle = mat({color: 0xb0b4ae, metalness: 0.9, roughness: 0.25});
      for (let i = 0; i < drawers; i++) { box(0.46, 0.006, 0.01, line, 0, 0.33 * i + 0.02, 0.312, g); box(0.12, 0.025, 0.03, handle, 0, 0.33 * i + 0.24, 0.32, g); box(0.08, 0.04, 0.005, M.paint(0xe8e0c8), 0, 0.33 * i + 0.29, 0.314, g); }
      return g;
    },
    shelf(x, z, ry, books = true, m = null) {
      const g = new THREE.Group(); furn.add(g); g.position.set(x, 0, z); g.rotation.y = ry;
      const sm = m || mat({map: tex("assets/desk-wood.webp", 1, 2), color: 0x5a3e2a, roughness: 0.7});
      box(0.04, 1.9, 0.36, sm, -0.5, 0.95, 0, g); box(0.04, 1.9, 0.36, sm, 0.5, 0.95, 0, g); box(1.0, 1.9, 0.02, sm, 0, 0.95, -0.17, g);
      const colors = [0x6b2a20, 0x2c3a4e, 0x5a4a2a, 0x3b3a34, 0x7a5a32, 0x2f4a36, 0x4a2a3a, 0x8a7652];
      for (let i = 0; i < 5; i++) {
        const y = 0.08 + i * 0.44; box(1.0, 0.025, 0.36, sm, 0, y, 0, g);
        if (i === 4 || !books) continue;
        let bx = -0.46;
        while (bx < 0.42) { const bw = 0.03 + rnd() * 0.04, bh = 0.24 + rnd() * 0.12; box(bw, bh, 0.24, mat({color: colors[Math.floor(rnd() * colors.length)], roughness: 0.8}), bx + bw / 2, y + 0.012 + bh / 2, 0.02, g); bx += bw + 0.004; if (rnd() < 0.08) bx += 0.08; }
      }
      return g;
    },
    chair(x, z, ry, color = 0x3a2618) {
      const g = new THREE.Group(); furn.add(g); g.position.set(x, 0, z); g.rotation.y = ry; const m = M.paint(color, 0.6);
      box(0.46, 0.04, 0.44, m, 0, 0.46, 0, g); box(0.46, 0.5, 0.04, m, 0, 0.75, 0.21, g);
      for (const [cx, cz] of [[-0.2, -0.19], [0.2, -0.19], [-0.2, 0.19], [0.2, 0.19]]) box(0.035, 0.46, 0.035, m, cx, 0.23, cz, g);
      return g;
    },
    stool(x, z, m) { B.cyl(0.18, 0.18, 0.05, m, x, 0.62, z); for (let i = 0; i < 3; i++) { const a = i * 2.1, l = B.cyl(0.018, 0.018, 0.62, m, x + Math.cos(a) * 0.12, 0.31, z + Math.sin(a) * 0.12, 8); l.rotation.z = Math.cos(a) * 0.12; l.rotation.x = -Math.sin(a) * 0.12; } },
    armchair(x, z, ry, color) {
      const g = new THREE.Group(); furn.add(g); g.position.set(x, 0, z); g.rotation.y = ry; const m = M.paint(color, 0.85);
      box(0.8, 0.42, 0.8, m, 0, 0.21, 0, g); box(0.8, 0.55, 0.18, m, 0, 0.7, 0.31, g); box(0.16, 0.28, 0.8, m, -0.36, 0.52, 0, g); box(0.16, 0.28, 0.8, m, 0.36, 0.52, 0, g);
      box(0.6, 0.1, 0.6, M.paint(color - 0x101010, 0.9), 0, 0.47, -0.04, g);
      return g;
    },
    rug(x, z, w, d, base, edge) {
      const t = B.canvasTex(256, 180, (c, cw, ch) => { c.fillStyle = edge; c.fillRect(0, 0, cw, ch); c.fillStyle = base; c.fillRect(14, 14, cw - 28, ch - 28); c.strokeStyle = edge; c.lineWidth = 4; c.strokeRect(30, 30, cw - 60, ch - 60); c.beginPath(); c.ellipse(cw / 2, ch / 2, cw / 5, ch / 5, 0, 0, Math.PI * 2); c.stroke(); for (let i = 0; i < 400; i++) { c.fillStyle = `rgba(0,0,0,${Math.random() * 0.08})`; c.fillRect(Math.random() * cw, Math.random() * ch, 2, 2); } });
      const r = B.lay(t, w, d, x, 0.006, z, 0, false); r.receiveShadow = !mobile; return r;
    },
    window(wall, z, kind = "night", w = 1.15, h = 1.3, y = 1.7) {
      const t = B.canvasTex(256, 280, (c, cw, ch) => {
        const g = c.createLinearGradient(0, 0, 0, ch);
        if (kind === "day") { g.addColorStop(0, "#cfe3f5"); g.addColorStop(1, "#f6efe0"); } else { g.addColorStop(0, "#1b2a44"); g.addColorStop(1, "#4a5e7a"); }
        c.fillStyle = g; c.fillRect(0, 0, cw, ch);
        if (kind === "day") { c.fillStyle = "rgba(60,60,60,.85)"; c.fillRect(cw / 2 - 4, 0, 8, ch); c.fillRect(0, ch / 2 - 4, cw, 8); }
        else for (let i = 0; i < 18; i++) { c.fillStyle = "rgba(10,8,6,.82)"; c.fillRect(0, i * 15.5, cw, 9); }
      });
      B.onWall(t, wall, z, y, w, h, {basic: true});
      const fr = M.paint(kind === "day" ? 0x2a2a2a : 0x24180f), sx = wall === "left" ? -W2 + 0.03 : W2 - 0.03;
      B.box(0.06, h + 0.12, 0.06, fr, sx, y, z - w / 2 - 0.03); B.box(0.06, h + 0.12, 0.06, fr, sx, y, z + w / 2 + 0.03);
      B.box(0.06, 0.06, w + 0.12, fr, sx, y + h / 2 + 0.03, z); B.box(0.14, 0.05, w + 0.16, fr, wall === "left" ? sx + 0.04 : sx - 0.04, y - h / 2 - 0.02, z);
      const l = new THREE.PointLight(kind === "day" ? 0xfff4e0 : 0x7f9cff, kind === "day" ? 10 : 2.2, 0, 1.4); l.position.set(wall === "left" ? -W2 + 0.7 : W2 - 0.7, y, z); furn.add(l);
    },
    frame(url, wall, z, y, w, h) {
      B.onWall(tex(url), wall, z, y, w, h);
      const pf = M.paint(0x14100c, 0.4), sx = wall === "left" ? -W2 + 0.02 : W2 - 0.02;
      B.box(0.03, h + 0.1, 0.05, pf, sx, y, z - w / 2 - 0.025); B.box(0.03, h + 0.1, 0.05, pf, sx, y, z + w / 2 + 0.025);
      B.box(0.03, 0.05, w + 0.1, pf, sx, y + h / 2 + 0.025, z); B.box(0.03, 0.05, w + 0.1, pf, sx, y - h / 2 - 0.025, z);
    },
    bulb(x, z, y = 2.5, power = 16, color = 0xffc887, cage = false) {
      const s = new THREE.Mesh(new THREE.SphereGeometry(0.045, 16, 12), M.glow(0xfff1d0)); s.position.set(x, y, z); furn.add(s);
      const cord = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, ROOM.h - y), M.glow(0x111111)); cord.position.set(x, (ROOM.h + y) / 2, z); furn.add(cord);
      if (cage) { const cm = M.metal(0x222222); for (let i = 0; i < 4; i++) { const r = B.cyl(0.004, 0.004, 0.16, cm, x + Math.cos(i * Math.PI / 2) * 0.07, y, z + Math.sin(i * Math.PI / 2) * 0.07, 6); void r; } B.cyl(0.08, 0.06, 0.02, cm, x, y + 0.08, z); }
      const l = new THREE.PointLight(color, power, 0, 1.7); l.position.set(x, y - 0.06, z); furn.add(l);
      if (!mobile && !shadowBulb) { shadowBulb = l; l.castShadow = true; l.shadow.mapSize.set(512, 512); l.shadow.bias = -0.003; l.shadow.radius = 4; l.shadow.camera.near = 0.1; }
      return l;
    },
    tube(x, z, power = 9) { B.box(1.2, 0.04, 0.08, M.glow(0xeef6ff), x, ROOM.h - 0.08, z); B.box(1.24, 0.03, 0.12, M.metal(0x555555), x, ROOM.h - 0.04, z); const l = new THREE.PointLight(0xdfeeff, power, 0, 1.6); l.position.set(x, ROOM.h - 0.3, z); furn.add(l); flickers.push({l, base: power, kind: "tube"}); },
    floorLamp(x, z, power = 9) { const m = M.metal(0x2a2622); B.cyl(0.14, 0.16, 0.03, m, x, 0.015, z); B.cyl(0.012, 0.012, 1.5, m, x, 0.76, z, 8); B.cyl(0.13, 0.22, 0.26, mat({color: 0xe8d2a8, emissive: 0x8a6030, emissiveIntensity: 0.6, roughness: 0.8, side: THREE.DoubleSide}), x, 1.58, z); const l = new THREE.PointLight(0xffc27a, power, 0, 1.7); l.position.set(x, 1.5, z); furn.add(l); },
    plant(x, z) { B.cyl(0.16, 0.12, 0.3, M.paint(0x8a4a2a), x, 0.15, z); for (let i = 0; i < 9; i++) { const g = new THREE.Mesh(new THREE.SphereGeometry(0.12 + rnd() * 0.08, 10, 8), M.paint(0x2f5a2a + Math.floor(rnd() * 3) * 0x020400, 0.9)); disposables.push(g.geometry); g.position.set(x + (rnd() - 0.5) * 0.3, 0.45 + rnd() * 0.45, z + (rnd() - 0.5) * 0.3); g.scale.y = 1.4; furn.add(g); } },
    crate(x, y, z, s = 0.5, ry = 0) { const c = B.box(s, s, s, mat({map: tex("assets/t-floor-cabin.webp", 1, 1), color: 0xb08a60, roughness: 0.9}), x, y + s / 2, z, ry); return c; },
    barrel(x, z, color = 0x3a5a7a) { const m = M.metal(color); B.cyl(0.29, 0.29, 0.88, m, x, 0.44, z); for (const y of [0.1, 0.44, 0.78]) B.cyl(0.3, 0.3, 0.025, M.metal(color - 0x101010), x, y, z); },
    stove(x, z) {
      const m = M.metal(0x1a1a1a); B.box(0.62, 0.78, 0.52, m, x, 0.39, z); B.cyl(0.07, 0.07, ROOM.h - 0.78, m, x, (ROOM.h + 0.78) / 2, z - 0.1, 12);
      B.box(0.3, 0.2, 0.01, M.glow(0xff7a20), x, 0.36, z + 0.265);
      const l = new THREE.PointLight(0xff8a30, 6, 0, 1.8); l.position.set(x, 0.4, z + 0.5); furn.add(l); flickers.push({l, base: 6, kind: "fire"});
    },
    logs(x, z) { const m = mat({color: 0x6a4a2e, roughness: 0.95}); for (let r = 0; r < 3; r++) for (let i = 0; i < 4 - r; i++) { const c = B.cyl(0.08, 0.08, 0.55, m, x, 0.08 + r * 0.15, z + (i - (3 - r) / 2) * 0.17, 10); c.rotation.x = Math.PI / 2; } },
    hooks(wall, z) { const sx = wall === "left" ? -W2 + 0.04 : W2 - 0.04; B.box(0.04, 0.06, 0.9, M.darkWood(), sx, 1.75, z); B.box(0.12, 0.85, 0.42, M.paint(0x2a2a30, 0.95), wall === "left" ? sx + 0.08 : sx - 0.08, 1.3, z - 0.18); B.box(0.1, 0.25, 0.3, M.paint(0x4a3a2a, 0.9), wall === "left" ? sx + 0.07 : sx - 0.07, 1.62, z + 0.25); },
    lantern(x, y, z) { B.cyl(0.07, 0.07, 0.02, M.metal(0x2a2a2a), x, y + 0.01, z); B.cyl(0.055, 0.055, 0.16, mat({color: 0xffd7a0, emissive: 0xffa040, emissiveIntensity: 1.2, transparent: true, opacity: 0.85}), x, y + 0.1, z); B.cyl(0.06, 0.07, 0.04, M.metal(0x2a2a2a), x, y + 0.2, z); const l = new THREE.PointLight(0xffa850, 4, 0, 1.8); l.position.set(x, y + 0.12, z + 0.05); furn.add(l); flickers.push({l, base: 4, kind: "fire"}); },
    workbench(x, z, w = 2.1) { const top = 0.86, m = mat({map: tex("assets/desk-wood.webp", 2, 1), color: 0x8a6a48, roughness: 0.8}), lm = M.metal(0x3a3a3a); B.box(w, 0.07, 0.7, m, x, top - 0.035, z); for (const s of [-1, 1]) { B.box(0.06, top - 0.07, 0.06, lm, x + s * (w / 2 - 0.08), (top - 0.07) / 2, z - 0.28); B.box(0.06, top - 0.07, 0.06, lm, x + s * (w / 2 - 0.08), (top - 0.07) / 2, z + 0.28); } B.box(w - 0.1, 0.03, 0.6, m, x, 0.18, z); return top; },
    vise(x, y, z) { const m = M.metal(0x2a4a7a); B.box(0.16, 0.1, 0.12, m, x, y + 0.05, z); B.box(0.04, 0.12, 0.14, m, x - 0.1, y + 0.08, z); B.cyl(0.01, 0.01, 0.22, M.metal(0x999999), x + 0.05, y + 0.06, z + 0.1, 8).rotation.x = Math.PI / 2; },
    pegboard(wall, z, w = 1.6) {
      const t = B.canvasTex(256, 160, (c, cw, ch) => { c.fillStyle = "#b8956a"; c.fillRect(0, 0, cw, ch); c.fillStyle = "#6a5236"; for (let yy = 6; yy < ch; yy += 10) for (let xx = 6; xx < cw; xx += 10) c.fillRect(xx, yy, 2, 2); c.strokeStyle = "#2a2a2a"; c.lineWidth = 5; c.lineCap = "round"; const tools = [[30, 30, 30, 120], [60, 30, 75, 110], [100, 40, 100, 130], [140, 30, 160, 100], [190, 40, 190, 120], [220, 30, 230, 90]]; for (const [a, b2, cc, d] of tools) { c.beginPath(); c.moveTo(a, b2); c.lineTo(cc, d); c.stroke(); } c.fillStyle = "#8a1a1a"; c.fillRect(56, 26, 22, 14); c.fillRect(136, 26, 30, 12); });
      B.onWall(t, wall, z, 1.55, w, 1.0);
    },
    toolchest(x, z, ry = 0) { const g = new THREE.Group(); furn.add(g); g.position.set(x, 0, z); g.rotation.y = ry; const m = M.metal(0x9a1a14); box(0.7, 1.0, 0.45, m, 0, 0.55, 0, g); for (let i = 0; i < 6; i++) { box(0.64, 0.005, 0.01, M.paint(0x3a0a08), 0, 0.15 + i * 0.15, 0.226, g); box(0.4, 0.02, 0.03, M.metal(0xcccccc), 0, 0.2 + i * 0.15, 0.235, g); } for (const s of [-1, 1]) B.cyl(0.04, 0.04, 0.04, M.paint(0x111111), x + s * 0.28, 0.04, z + 0.15); return g; },
    tires(x, z, n = 4) { const m = M.paint(0x151515, 0.95); for (let i = 0; i < n; i++) { const t = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.11, 10, 24), m); disposables.push(t.geometry); t.rotation.x = Math.PI / 2; t.position.set(x + (rnd() - 0.5) * 0.04, 0.11 + i * 0.22, z); t.castShadow = !mobile; furn.add(t); } },
    pipes() { const m = M.metal(0x6a6a62); for (const [y, z, r] of [[2.75, -2.7, 0.09], [2.55, -2.55, 0.06], [2.82, -1.0, 0.12]]) { const p = B.cyl(r, r, ROOM.w, m, 0, y, z, 14); p.rotation.z = Math.PI / 2; } const v = B.cyl(0.07, 0.07, ROOM.h, M.metal(0x7a2a1a), 2.75, ROOM.h / 2, -2.8, 12); void v; },
    metalShelf(x, z, ry) { const g = new THREE.Group(); furn.add(g); g.position.set(x, 0, z); g.rotation.y = ry; const m = M.metal(0x6a6e6a); for (const [px, pz] of [[-0.55, -0.22], [0.55, -0.22], [-0.55, 0.22], [0.55, 0.22]]) box(0.03, 1.9, 0.03, m, px, 0.95, pz, g); for (let i = 0; i < 4; i++) { box(1.14, 0.02, 0.46, m, 0, 0.1 + i * 0.6, 0, g); if (i < 3) { box(0.4, 0.28, 0.32, M.card(), -0.28, 0.25 + i * 0.6, 0, g); box(0.3, 0.22, 0.3, M.card(), 0.3, 0.22 + i * 0.6, 0.02, g); } } return g; },
    boxes(x, z, n = 3, label = "") { const lab = label ? B.canvasTex(128, 64, (c, cw, ch) => { c.fillStyle = "#c9a070"; c.fillRect(0, 0, cw, ch); c.fillStyle = "#1a1410"; c.font = "bold 20px sans-serif"; c.textAlign = "center"; c.fillText(label, cw / 2, 40); }) : null; for (let i = 0; i < n; i++) { const s = 0.42 - i * 0.03, b = B.box(s, s * 0.75, s, lab ? mat({map: lab, roughness: 0.9}) : M.card(), x + (rnd() - 0.5) * 0.05, 0.16 + i * 0.31, z + (rnd() - 0.5) * 0.05, (rnd() - 0.5) * 0.3); void b; } },
    papersFloor(cx, cz, n, spread = 1.2) { for (let i = 0; i < n; i++) B.lay(tex(`assets/paper-${1 + Math.floor(rnd() * 9)}.webp`), 0.24, 0.3, cx + (rnd() - 0.5) * spread, 0.004 + i * 0.0006, cz + (rnd() - 0.5) * spread * 0.6, rnd() * 6.28); },
    newspapers(x, y, z, n = 2) { const t = B.canvasTex(256, 330, (c, cw, ch) => { c.fillStyle = "#e8e2d2"; c.fillRect(0, 0, cw, ch); c.fillStyle = "#1a1714"; c.font = "bold 30px serif"; c.textAlign = "center"; c.fillText("THE DAILY", cw / 2, 40); c.fillRect(12, 50, cw - 24, 3); c.font = "bold 20px serif"; c.fillText("MYSTERY DEEPENS", cw / 2, 80); for (let col = 0; col < 3; col++) for (let l = 0; l < 22; l++) c.fillRect(14 + col * 78, 100 + l * 10, 66 - (l % 5 === 4 ? 30 : 0), 3); c.fillStyle = "#777"; c.fillRect(92, 100, 70, 60); }); for (let i = 0; i < n; i++) B.lay(t, 0.36, 0.46, x + (i - 0.5) * 0.28, y + 0.002 + i * 0.001, z + (rnd() - 0.5) * 0.1, (rnd() - 0.5) * 0.8, false); },
    magnifier(x, y, z) { const m = M.metal(0x8a6a3a); const ring = new THREE.Mesh(new THREE.TorusGeometry(0.06, 0.008, 8, 24), m); disposables.push(ring.geometry); ring.rotation.x = Math.PI / 2; ring.position.set(x, y + 0.01, z); furn.add(ring); const gl = B.cyl(0.055, 0.055, 0.004, mat({color: 0xcfe0e8, transparent: true, opacity: 0.35, metalness: 0.2, roughness: 0.05}), x, y + 0.01, z, 24); void gl; const h = B.cyl(0.012, 0.012, 0.13, M.darkWood(), x + 0.1, y + 0.012, z + 0.03, 8); h.rotation.z = Math.PI / 2; h.rotation.y = -0.3; },
    mug(x, y, z, color = 0xe8e2d8) { B.cyl(0.04, 0.036, 0.1, M.paint(color, 0.4), x, y + 0.05, z, 16); const hnd = new THREE.Mesh(new THREE.TorusGeometry(0.025, 0.007, 6, 12), M.paint(color, 0.4)); disposables.push(hnd.geometry); hnd.position.set(x + 0.045, y + 0.055, z); furn.add(hnd); },
    books(x, y, z, n = 4) { const cs = [0x6b2a20, 0x2c3a4e, 0x5a4a2a, 0x2f4a36]; for (let i = 0; i < n; i++) B.box(0.22, 0.04, 0.3, M.paint(cs[i % 4], 0.8), x + (rnd() - 0.5) * 0.03, y + 0.02 + i * 0.04, z, (rnd() - 0.5) * 0.3); },
    nameplate(x, y, z, text) { const t = B.canvasTex(256, 64, (c, cw, ch) => { c.fillStyle = "#1c1a18"; c.fillRect(0, 0, cw, ch); c.strokeStyle = "#b08a48"; c.lineWidth = 4; c.strokeRect(4, 4, cw - 8, ch - 8); c.fillStyle = "#e8d8b0"; c.font = "bold 28px serif"; c.textAlign = "center"; c.fillText(text, cw / 2, 42); }); const p = plane(0.3, 0.075, mat({map: t, roughness: 0.4})); p.position.set(x, y + 0.045, z); p.rotation.x = -0.35; furn.add(p); B.box(0.3, 0.02, 0.04, M.paint(0x1c1a18), x, y + 0.01, z - 0.01); },
    cooler(x, z) { B.box(0.34, 0.95, 0.34, M.paint(0xd8d8d0, 0.5), x, 0.475, z); B.cyl(0.15, 0.15, 0.4, mat({color: 0x6aa8e0, transparent: true, opacity: 0.6, roughness: 0.1}), x, 1.15, z); },
    coil(x, y, z) { const m = M.paint(0xa11d1d, 0.8); for (let i = 0; i < 3; i++) { const t = new THREE.Mesh(new THREE.TorusGeometry(0.07 - i * 0.012, 0.006, 6, 20), m); disposables.push(t.geometry); t.rotation.x = Math.PI / 2; t.position.set(x, y + 0.006 + i * 0.008, z); furn.add(t); } },
    boardLight(x, y, z, power = 5, tx = 0.1, ty = 1.7) { boardLight.position.set(x, y, z); boardLight.target.position.set(tx, ty, -3); boardLight.intensity = power; },
    // a small, faint "WHYLO" for anyone who looks closely
    secret(w, h, x, y, z, rot, color = "rgba(40,30,22,.55)", font = 'bold 44px "Special Elite", monospace') {
      const t = B.canvasTex(256, 80, (c, cw, ch) => { c.fillStyle = color; c.font = font; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText("WHYLO", cw / 2, ch / 2); });
      const p = plane(w, h, mat({map: t, transparent: true, alphaTest: 0.05, roughness: 0.9, depthWrite: false}));
      p.position.set(x, y, z); p.rotation.set(rot[0] || 0, rot[1] || 0, rot[2] || 0); furn.add(p); return p;
    },
    stain(x, z, s = 0.9) { const t = B.canvasTex(128, 128, (c, cw, ch) => { const g = c.createRadialGradient(64, 64, 4, 64, 64, 62); g.addColorStop(0, "rgba(10,8,6,.7)"); g.addColorStop(1, "rgba(10,8,6,0)"); c.fillStyle = g; c.fillRect(0, 0, cw, ch); }); B.lay(t, s, s * 0.7, x, 0.005, z, rnd() * 3); },
  };


  // ---------- real 3D furniture (CC0 models from Poly Haven), computers only ----------
  // Each piece loads its model, sized to fit; if a model can't load, the simple shape is built instead.
  const USE_MODELS = !mobile && !!addons.GLTFLoader;
  const gltfLoader = USE_MODELS ? new addons.GLTFLoader() : null;
  const modelCache = new Map();
  const loadModel = id => { if (!modelCache.has(id)) modelCache.set(id, new Promise((ok, bad) => gltfLoader.load(`assets/models/${id}.glb`, g => ok(g.scene), undefined, bad))); return modelCache.get(id); };
  let furnishGen = 0, curRoom = "office";
  // which way each model faces by default (radians added so its front faces +z, toward the middle of the room)
  const FRONT = {};
  B.model = (id, o, fallback) => {
    if (!USE_MODELS) { fallback?.(); return; }
    const gen = furnishGen;
    loadModel(id).then(src => {
      if (gen !== furnishGen) return; // the room changed while it loaded
      const m = src.clone(true);
      if (o.pre) m.rotation.set(...o.pre); // turn the model before measuring it (e.g. lay a tyre flat)
      m.traverse(c => { if (c.isMesh) { c.castShadow = true; c.receiveShadow = true; if (c.material && "envMapIntensity" in c.material) c.material.envMapIntensity = 0.5; } });
      const bb = new THREE.Box3().setFromObject(m), size = bb.getSize(new THREE.Vector3()), ctr = bb.getCenter(new THREE.Vector3());
      const inner = new THREE.Group(), holder = new THREE.Group();
      m.position.x -= ctr.x; m.position.y -= bb.min.y; m.position.z -= ctr.z; inner.add(m); holder.add(inner);
      let fx = size.x, fz = size.z;
      inner.rotation.y = FRONT[id] || 0;
      if (o.box) { // exact footprint and height (tables)
        const [w, h, d] = o.box;
        if ((w > d) !== (fx > fz)) { inner.rotation.y += Math.PI / 2; [fx, fz] = [fz, fx]; }
        holder.scale.set(w / fx, h / size.y, d / fz);
      } else {
        const k = o.h ? o.h / size.y : o.w ? o.w / Math.max(fx, fz) : 1;
        holder.scale.setScalar(k);
        if (o.top != null) o.y = o.top - size.y * k;
      }
      holder.position.set(o.x, o.y || 0, o.z); holder.rotation.y = o.ry || 0;
      if (o.rx) holder.rotation.x = o.rx;
      furn.add(holder);
    }).catch(() => { if (gen === furnishGen) fallback?.(); });
  };
  if (USE_MODELS) {
    const orig = {...B}, none = () => new THREE.Group();
    const DESKS = {office: "metal_office_desk", den: "WoodenTable_03", cozy: "WoodenTable_03", cabin: "WoodenTable_03", tabletop: "WoodenTable_03", archive: "metal_office_desk", precinct: "metal_office_desk"};
    B.desk = (x, z, w, d, m, top = 0.76, legsM = m) => { const id = DESKS[curRoom]; if (!id) return orig.desk(x, z, w, d, m, top, legsM); B.model(id, {x, z, box: [w, top, d]}, () => orig.desk(x, z, w, d, m, top, legsM)); return top; };
    B.chair = (x, z, ry, color) => { if (curRoom === "industrial") return orig.chair(x, z, ry, color); B.model("painted_wooden_chair_01", {x, z, ry: ry + Math.PI, h: 0.92}, () => orig.chair(x, z, ry, color)); return none(); };
    B.stool = (x, z, m) => B.model(curRoom === "cabin" || curRoom === "tabletop" ? "wooden_stool_01" : "metal_stool_01", {x, z, h: 0.66}, () => orig.stool(x, z, m));
    B.armchair = (x, z, ry, color) => { B.model("ArmChair_01", {x, z, ry: ry + Math.PI, h: 0.95}, () => orig.armchair(x, z, ry, color)); return none(); };
    B.shelf = (x, z, ry, books, m) => { B.model("wooden_bookshelf_worn", {x, z, ry, h: 1.95}, () => orig.shelf(x, z, ry, books, m)); return none(); };
    B.stand = (url, w, h, x, yBottom, z, ry = 0) => { if (url.includes("prop-lamp")) { B.model("desk_lamp_arm_01", {x: x - 0.2, y: yBottom, z: z - 0.24, ry: 0.5, h: 0.55}, () => orig.stand(url, w, h, x, yBottom, z, ry)); return none(); } return orig.stand(url, w, h, x, yBottom, z, ry); };
    B.lantern = (x, y, z) => { B.model("Lantern_01", {x, y, z, h: 0.32}, () => orig.lantern(x, y, z)); const l = new THREE.PointLight(0xffa850, 4, 0, 1.8); l.position.set(x, y + 0.16, z + 0.08); furn.add(l); flickers.push({l, base: 4, kind: "fire"}); };
    B.stove = (x, z) => { B.model("barrel_stove", {x, z, h: 1.05}, () => orig.stove(x, z)); const l = new THREE.PointLight(0xff8a30, 6, 0, 1.8); l.position.set(x, 0.45, z + 0.55); furn.add(l); flickers.push({l, base: 6, kind: "fire"}); };
    B.crate = (x, y, z, s = 0.5, ry = 0) => { B.model(rnd() < 0.5 ? "wooden_crate_01" : "wooden_crate_02", {x, y, z, ry, h: s}, () => orig.crate(x, y, z, s, ry)); return none(); };
    B.barrel = (x, z, color) => B.model(rnd() < 0.5 ? "Barrel_01" : "barrel_03", {x, z, ry: rnd() * 6, h: 0.9}, () => orig.barrel(x, z, color));
    B.metalShelf = (x, z, ry) => { B.model("steel_frame_shelves_01", {x, z, ry, h: 1.9}, () => orig.metalShelf(x, z, ry)); return none(); };
    B.toolchest = (x, z, ry = 0) => { B.model("metal_tool_chest", {x, z, ry, h: 1.05}, () => orig.toolchest(x, z, ry)); return none(); };
    B.vise = (x, y, z) => B.model("bench_vice_01", {x, y, z, w: 0.26}, () => orig.vise(x, y, z));
    B.tires = (x, z, n = 4) => { for (let i = 0; i < n; i++) B.model("old_tyre", {x: x + (rnd() - 0.5) * 0.04, y: i * 0.21, z, ry: rnd() * 6, w: 0.64, pre: [Math.PI / 2, 0, 0]}, i ? null : () => orig.tires(x, z, n)); };
    B.plant = (x, z) => B.model("potted_plant_02", {x, z, ry: rnd() * 6, h: 1.1}, () => orig.plant(x, z));
    B.magnifier = (x, y, z) => B.model("magnifying_glass_01", {x, y, z, ry: 0.6, w: 0.22}, () => orig.magnifier(x, y, z));
    B.boxes = (x, z, n = 3, label = "") => { if (label) return orig.boxes(x, z, n, label); for (let i = 0; i < n; i++) B.model("cardboard_box_01", {x: x + (rnd() - 0.5) * 0.05, y: i * 0.32, z, ry: (rnd() - 0.5) * 0.4, w: 0.44 - i * 0.03}, i ? null : () => orig.boxes(x, z, n, label)); };
    B.tube = (x, z, power = 9) => { B.model("mounted_fluorescent_lights", {x, z, top: ROOM.h, w: 1.25}, () => orig.tube(x, z, power)); const l = new THREE.PointLight(0xdfeeff, power, 0, 1.6); l.position.set(x, ROOM.h - 0.3, z); furn.add(l); flickers.push({l, base: power, kind: "tube"}); };
    B.bulb = (x, z, y = 2.5, power = 16, color = 0xffc887, cage = false) => {
      if (!cage && curRoom !== "garage" && curRoom !== "workshop") return orig.bulb(x, z, y, power, color, cage);
      B.model(cage ? "caged_hanging_light" : "hanging_industrial_lamp", {x, z, top: ROOM.h, h: ROOM.h - y + 0.12}, () => orig.bulb(x, z, y, power, color, cage));
      const l = new THREE.PointLight(color, power, 0, 1.7); l.position.set(x, y - 0.08, z); furn.add(l);
      if (!shadowBulb) { shadowBulb = l; l.castShadow = true; l.shadow.mapSize.set(512, 512); l.shadow.bias = -0.003; l.shadow.radius = 4; l.shadow.camera.near = 0.15; }
      return l;
    };
  }
  // small extras that only exist as models
  const EXTRAS = {
    office: () => B.model("wall_clock", {x: -1.9, y: 1.95, z: -2.97, w: 0.32}),
    precinct: () => { B.model("wall_clock", {x: 1.9, y: 1.95, z: -2.97, w: 0.32}); B.model("office_notepads", {x: 0.45, y: 0.76, z: -2.5, ry: -0.3, w: 0.22}); },
    workshop: () => B.model("tool_cart", {x: 2.25, z: -1.25, ry: -1.2, h: 0.9}),
    archive: () => B.model("office_notepads", {x: 0.75, y: 0.7, z: -2.55, ry: 0.4, w: 0.22}),
    den: () => B.model("wall_clock", {x: -2.97, y: 2.0, z: -2.0, ry: Math.PI / 2, w: 0.32}),
  };

  // ---------- one layout per room ----------
  const DZ = -2.62; // just in front of the board wall
  const LAYOUTS = {
    office() {
      const top = B.desk(0, DZ, 2.1, 0.72, M.wood()); B.deskProps(DZ, top, ["lamp", "phone", "typewriter"]);
      B.filing(2.42, DZ, 0); B.shelf(W2 - 0.2, 0.6, -Math.PI / 2); B.window("left", -0.7); B.frame("assets/room-garage.webp", "right", -1.35, 1.72, 0.78, 0.52);
      B.chair(1.05, -1.95, -0.75); B.bulb(0, -1.2); B.secret(0.13, 0.04, 2.167, 0.24, -2.62, [0, -Math.PI / 2, 0], "rgba(235,232,220,.7)"); B.boardLight(-0.5, top + 0.4, DZ + 0.18);
    },
    cabin() {
      const top = B.desk(0, DZ, 1.9, 0.7, M.rough(), 0.78); B.lantern(-0.55, top, DZ + 0.05); B.newspapers(0.35, top, DZ, 1); B.stand("assets/prop-phone.webp", 0.3, 0.19, 0.05, top, DZ + 0.12, 0);
      B.stove(-2.35, -2.2); B.secret(0.16, 0.05, -2.35, 1.35, -2.988, [0, 0, 0], "rgba(25,15,8,.6)"); B.logs(-2.4, -1.1); B.stool(0.9, -1.9, M.rough()); B.hooks("right", 0.4); B.window("right", -1.4, "night", 0.7, 0.8, 1.8);
      B.rug(0.2, -0.6, 2.0, 1.4, "#6a3a24", "#3a2014"); B.bulb(0.8, -0.4, 2.55, 7); B.boardLight(-0.55, top + 0.25, DZ + 0.2, 4);
    },
    cozy() {
      const top = B.desk(0, DZ, 1.9, 0.68, M.darkWood()); B.stand("assets/prop-lamp.webp", 0.62, 0.51, -0.6, top, DZ - 0.06, 0.12); B.books(0.45, top, DZ, 5); B.mug(0.05, top, DZ + 0.12, 0x9a3a2a);
      B.shelf(-W2 + 0.2, -1.3, Math.PI / 2); B.shelf(-W2 + 0.2, 0.0, Math.PI / 2); B.armchair(1.7, -1.3, -2.2, 0x6a1a1a); B.secret(0.16, 0.05, 1.45, 0.008, -0.08, [-Math.PI / 2, 0, 0], "rgba(50,10,8,.75)", 'bold 40px serif'); B.rug(0.3, -0.9, 2.6, 1.8, "#7a2a22", "#3a1410");
      B.floorLamp(2.45, -2.35); B.plant(2.5, 0.4); B.frame("assets/room-cozy.webp", "right", 0.9, 1.75, 0.8, 0.45); B.boardLight(-0.5, top + 0.4, DZ + 0.18, 6);
    },
    workshop() {
      const top = B.workbench(0, DZ); B.vise(-0.8, top, DZ + 0.2); B.box(0.3, 0.04, 0.06, M.metal(0x777777), 0.2, top + 0.02, DZ + 0.1, 0.4); B.box(0.22, 0.12, 0.14, M.metal(0x9a1a14), 0.7, top + 0.06, DZ);
      B.pegboard("right", -1.6); B.secret(0.1, 0.03, 2.986, 1.09, -0.88, [0, -Math.PI / 2, 0], "rgba(50,35,20,.6)"); B.barrel(2.4, -2.4, 0x2a4a6a); B.crate(-2.3, 0, -2.3, 0.6, 0.2); B.crate(-2.25, 0.6, -2.3, 0.45, -0.3); B.crate(-2.4, 0, -1.6, 0.5);
      B.stain(0.8, -1.6); B.bulb(0, -2.2, 2.2, 10, 0xffd7a0, true); B.boardLight(0, 2.15, -2.0, 4, 0, 1.4);
    },
    industrial() {
      B.pipes(); B.metalShelf(-W2 + 0.3, -1.4, Math.PI / 2); B.crate(1.6, 0, -2.5, 0.65, 0.3); B.crate(1.6, 0.65, -2.5, 0.5, -0.2); B.barrel(2.45, -2.3, 0x7a3a1a); B.secret(0.34, 0.11, 2.988, 0.32, -2.0, [0, -Math.PI / 2, 0], "rgba(150,40,30,.45)", 'bold 52px "Permanent Marker", cursive'); B.barrel(2.3, -1.65, 0x3a5a3a);
      const c = B.chair(-0.9, -1.9, 0.6, 0x4a4a4a); c.rotation.z = 1.4; c.position.y = 0.23; B.papersFloor(-0.2, -1.4, 7);
      B.tube(-1, -1.8); B.tube(1, -0.4, 7); B.boardLight(0, 2.7, -1.8, 4, 0, 1.5);
    },
    brick() {
      const top = B.desk(0, DZ, 1.8, 0.7, M.paint(0xe8e6e0, 0.4), 0.75, M.metal(0x222222)); B.box(0.36, 0.015, 0.25, M.paint(0x222222, 0.3), 0.3, top + 0.008, DZ + 0.05); B.mug(-0.4, top, DZ + 0.1);
      B.stool(0.4, -1.95, M.metal(0x222222)); B.window("left", -1.0, "day", 1.6, 1.7, 1.55); B.plant(-2.5, -2.5); B.plant(2.5, -2.5); B.secret(0.09, 0.028, -2.5, 0.16, -2.334, [0, 0, 0], "rgba(255,230,210,.55)");
      for (const x of [-0.8, 0, 0.8]) { B.cyl(0.05, 0.05, 0.12, M.metal(0x111111), x, ROOM.h - 0.12, -1.6, 12); } B.box(2.0, 0.03, 0.04, M.metal(0x111111), 0, ROOM.h - 0.03, -1.6);
      ambientK = 1.5; B.boardLight(0, ROOM.h - 0.15, -1.6, 7, 0, 1.5);
    },
    garage() {
      const top = B.workbench(0, DZ, 1.9); B.stand("assets/prop-phone.webp", 0.3, 0.19, -0.6, top, DZ + 0.05, 0.1); B.box(0.5, 0.18, 0.22, M.metal(0x9a1a14), 0.5, top + 0.09, DZ);
      B.toolchest(2.3, -2.5); B.secret(0.14, 0.045, 2.3, 1.052, -2.5, [-Math.PI / 2, 0, 0], "rgba(230,210,200,.4)"); B.tires(-2.3, -2.3); B.barrel(-2.35, -1.4, 0x2a3a5a); B.pegboard("right", -1.2, 1.4); B.stain(-0.4, -1.5, 1.2); B.stain(1.2, -0.8, 0.8);
      B.bulb(0, -1.4, 2.45, 14); B.boardLight(0, 2.4, -1.4, 4, 0, 1.5);
    },
    den() {
      const top = B.desk(0, DZ, 2.0, 0.72, M.wood()); B.deskProps(DZ, top, ["lamp", "typewriter"]); B.books(0.05, top, DZ + 0.05, 3);
      B.shelf(-W2 + 0.2, -1.4, Math.PI / 2); B.armchair(1.8, -1.2, -2.3, 0x4a2a16); B.rug(0.2, -1.0, 2.4, 1.6, "#5a3a22", "#2a1a10");
      B.frame("assets/room-cabin.webp", "right", -1.2, 1.75, 0.6, 0.4); B.frame("assets/room-den.webp", "right", -0.3, 1.75, 0.6, 0.34); B.secret(0.07, 0.022, 2.986, 1.6, -0.06, [0, -Math.PI / 2, 0], "rgba(240,230,210,.6)", 'italic 40px serif'); B.floorLamp(2.5, -2.4, 6);
      B.boardLight(-0.5, top + 0.4, DZ + 0.18, 6);
    },
    archive() {
      for (let i = 0; i < 5; i++) B.filing(W2 - 0.34, -2.45 + i * 0.6, -Math.PI / 2, 0x5a5e56);
      B.boxes(-2.4, -2.4, 4, "CASE FILES"); B.secret(0.075, 0.024, 2.344, 0.62, -0.65, [0, -Math.PI / 2, 0], "rgba(30,25,20,.8)"); B.boxes(-2.35, -1.7, 3); B.boxes(-2.45, -1.0, 2, "1987"); B.papersFloor(-0.6, -1.5, 9, 1.6);
      const top = B.desk(0, DZ, 1.9, 0.7, M.darkWood()); B.magnifier(-0.4, top, DZ + 0.1); B.newspapers(0.35, top, DZ, 2); B.mug(-0.75, top, DZ + 0.05, 0x3a3a3a);
      B.bulb(0, -1.4, 2.5, 13); B.boardLight(0, 2.45, -1.4, 4, 0, 1.5);
    },
    precinct() {
      const top = B.desk(0, DZ, 2.0, 0.72, M.metal(0x5a5e5a), 0.76, M.metal(0x3a3e3a)); B.nameplate(0, top, DZ + 0.28, "DET. HARPER"); B.mug(-0.5, top, DZ + 0.1); B.stand("assets/prop-phone.webp", 0.3, 0.19, 0.55, top, DZ, -0.1); B.newspapers(-0.1, top, DZ - 0.05, 1);
      B.filing(-2.42, DZ, 0, 0x4c544a, 5); B.cooler(2.45, -1.6); B.secret(0.12, 0.04, 2.278, 0.25, -1.6, [0, -Math.PI / 2, 0], "rgba(60,60,60,.55)"); B.boxes(2.35, -2.5, 3, "EVIDENCE"); B.chair(1.0, -1.95, -0.6, 0x2a2a2a);
      for (const x of [-1.1, 0, 1.1]) B.bulb(x, -2.4, 2.55, 6, 0xffc887, true); B.boardLight(0, 2.5, -2.0, 3, 0, 1.6);
    },
    tabletop() {
      const top = B.desk(0, DZ, 2.0, 0.75, M.rough(), 0.78); B.newspapers(-0.3, top, DZ, 2); B.magnifier(-0.75, top, DZ + 0.15); B.coil(0.65, top, DZ + 0.12);
      B.crate(-2.3, 0, -2.4, 0.6, 0.3); B.crate(2.3, 0, -2.5, 0.55, -0.2); B.crate(2.35, 0.55, -2.45, 0.4, 0.1); B.secret(0.12, 0.04, 2.988, 0.15, -2.15, [0, -Math.PI / 2, 0], "rgba(30,20,12,.55)"); B.papersFloor(0.3, -1.6, 5);
      B.bulb(0, -2.0, 2.25, 18, 0xfff0d0); ambientK = 0.7; B.boardLight(0, 2.2, -2.0, 5, 0, 1.6);
    },
  };
  // ---------- the dice tray ----------
  const TRAY = {office: [0.78, 0.76, -2.4], den: [0.75, 0.76, -2.4], cozy: [0.75, 0.76, -2.4], cabin: [0.72, 0.78, -2.4], tabletop: [0.15, 0.78, -2.42],
    archive: [0.75, 0.7, -2.4], precinct: [0.25, 0.76, -2.42], workshop: [0.3, 0.86, -2.45], garage: [0.0, 0.86, -2.42], brick: [0.65, 0.75, -2.4], industrial: [-0.55, 0.5, -2.15]};
  let tray = null;
  const dice = [];
  function buildTray(key) {
    const [x, y, z] = TRAY[key] || TRAY.office;
    tray = new THREE.Group(); tray.position.set(x, y, z); furn.add(tray);
    const wood = mat({map: tex("assets/desk-wood.webp", 1, 1), color: 0x4a2c18, roughness: 0.5}), felt = mat({color: 0x1f4a2e, roughness: 1});
    const add = (w, h, d, m, px, py, pz) => box(w, h, d, m, px, py, pz, tray);
    add(0.34, 0.012, 0.24, felt, 0, 0.006, 0);
    add(0.36, 0.035, 0.012, wood, 0, 0.018, -0.126); add(0.36, 0.035, 0.012, wood, 0, 0.018, 0.126);
    add(0.012, 0.035, 0.24, wood, -0.174, 0.018, 0); add(0.012, 0.035, 0.24, wood, 0.174, 0.018, 0);
    if (key === "industrial") B.crate(x, 0, z, 0.5, 0.15); // something to put it on
    pickTray.length = 0; tray.traverse(o => { if (o.isMesh) pickTray.push(o); });
    // a couple of resting dice so it reads as a dice tray
    showDice([{kind: "d100", results: [rnd() * 99 + 1 | 0]}].map(() => null), true);
  }
  const pickTray = [];
  const DIE_SHAPES = {d4: () => new THREE.TetrahedronGeometry(0.022), d6: () => new THREE.BoxGeometry(0.03, 0.03, 0.03), d8: () => new THREE.OctahedronGeometry(0.022),
    d10: () => new THREE.OctahedronGeometry(0.023, 0), d12: () => new THREE.DodecahedronGeometry(0.021), d20: () => new THREE.IcosahedronGeometry(0.022), d100: () => new THREE.IcosahedronGeometry(0.023)};
  const numTex = text => B.canvasTex(128, 64, (c, w, h) => { c.fillStyle = "rgba(20,13,8,.85)"; c.beginPath(); c.roundRect(6, 6, w - 12, h - 12, 16); c.fill(); c.fillStyle = "#efe3c6"; c.font = 'bold 36px "Special Elite", monospace'; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText(text, w / 2, h / 2 + 2); });
  function clearDice() { for (const d of dice) { tray?.remove(d.mesh); if (d.label) tray?.remove(d.label); } dice.length = 0; }
  // r: a roll ({kind, results}); resting=true just places idle dice
  function showDice(_unused, resting) {
    clearDice();
    if (!tray || !resting) return;
    const colors = [0xf3eee2, 0xa11d1d];
    [["d100", -0.06, -0.03], ["d10", 0.05, 0.04]].forEach(([k, px, pz], i) => {
      const g = DIE_SHAPES[k](); disposables.push(g);
      const m = new THREE.Mesh(g, mat({color: colors[i], roughness: 0.35})); m.position.set(px, 0.035, pz); m.rotation.set(rnd() * 3, rnd() * 3, rnd() * 3); m.castShadow = true; tray.add(m);
      dice.push({mesh: m});
    });
  }
  function rollDice(r) {
    if (!tray) return;
    clearDice();
    const list = r.kind === "d100" ? [["d100", String(r.results[0] >= 100 ? "00" : String(Math.floor(r.results[0] / 10) * 10).padStart(2, "0")), 0xa11d1d], ["d10", String(r.results[0] % 10), 0xf3eee2]]
      : r.results.map(v => [r.kind, String(v), 0xf3eee2]);
    list.slice(0, 6).forEach(([k, text, color], i) => {
      const g = (DIE_SHAPES[k] || DIE_SHAPES.d6)(); disposables.push(g);
      const m = new THREE.Mesh(g, mat({color, roughness: 0.35})); m.castShadow = true; tray.add(m);
      const n = list.length, tx = (i - (n - 1) / 2) * 0.055, tz = (i % 2 ? 0.035 : -0.03);
      const sm = new THREE.SpriteMaterial({map: numTex(text), depthWrite: false, transparent: true, toneMapped: false}); disposables.push(sm);
      const label = new THREE.Sprite(sm); label.scale.set(0.07, 0.035, 1); label.visible = false; if (composer) label.layers.set(1); tray.add(label);
      dice.push({mesh: m, label, from: {x: -0.14 + rnd() * 0.04, z: 0.1 - rnd() * 0.2}, to: {x: tx, z: tz}, spin: [rnd() * 20 + 8, rnd() * 20 + 8, rnd() * 20 + 8], t0: performance.now() + i * 90, ms: reducedMotion ? 1 : 1100});
    });
  }
  function stepDice(now) {
    for (const d of dice) {
      if (!d.to) continue;
      const k = Math.max(0, Math.min(1, (now - d.t0) / d.ms)), e = 1 - Math.pow(1 - k, 3);
      d.mesh.position.set(d.from.x + (d.to.x - d.from.x) * e, 0.03 + Math.abs(Math.sin(k * Math.PI * 3)) * 0.05 * (1 - k), d.from.z + (d.to.z - d.from.z) * e);
      const slow = (1 - e);
      d.mesh.rotation.x += d.spin[0] * 0.016 * slow; d.mesh.rotation.y += d.spin[1] * 0.016 * slow; d.mesh.rotation.z += d.spin[2] * 0.016 * slow;
      if (k >= 1 && !d.label.visible) { d.label.visible = true; d.label.position.set(d.to.x, 0.09, d.to.z); }
    }
  }
  function furnish(key) {
    furn.clear(); flickers.length = 0; facers.length = 0; shadowBulb = null; ambientK = 1; seed = 7;
    furnishGen++; curRoom = LAYOUTS[key] ? key : "office";
    (LAYOUTS[key] || LAYOUTS.office)();
    if (USE_MODELS) EXTRAS[curRoom]?.();
    buildTray(curRoom);
    setLight(lightMode);
  }

  // ---------- camera: pose, look, walk ----------
  const pose = {...ROOM_POSE};
  let fovBase = 60, anim = null, running = false;
  const applyPose = (bob = 0) => { camera.position.set(pose.x, pose.y + bob, pose.z); camera.rotation.set(pose.pitch, pose.yaw, 0); };
  function resize() {
    const w = canvas.clientWidth || innerWidth, h = canvas.clientHeight || innerHeight;
    renderer.setSize(w, h, false);
    if (composer) { composer.setPixelRatio(renderer.getPixelRatio()); composer.setSize(w, h); }
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
    } else if (e.pointerType === "mouse") canvas.style.cursor = hitBoard(e) || hitTray(e) ? "pointer" : "grab";
  };
  const onUp = e => {
    pointers.delete(e.pointerId);
    if (pointers.size < 2) pinch0 = null;
    if (drag && !drag.moved && e.type === "pointerup") { if (hitBoard(e)) focusBoard(); else if (hitTray(e)) onTray?.(); }
    if (!pointers.size) drag = null;
  };
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
  function hitTray(e) {
    if (!pickTray.length) return false;
    const r = canvas.getBoundingClientRect();
    ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ndc, camera);
    return ray.intersectObjects(pickTray, false).length > 0;
  }
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
    for (const f of flickers) f.l.intensity = f.kind === "fire" ? f.base * (0.78 + 0.22 * Math.sin(now * 0.011) * Math.sin(now * 0.017 + 1.3) + 0.1 * Math.random()) : f.base * (Math.random() < 0.006 ? 0.25 : 1);
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
    else applyPose(Math.sin(now * 0.0011) * 0.004); // a little breathing while you stand still
    stepAvatars(dt);
    stepDice(now);
    for (const p of facers) p.rotation.y = Math.atan2(camera.position.x - p.position.x, camera.position.z - p.position.z);
    const tt = now * 0.0001;
    for (let i = 0; i < DUST; i++) { const k = i * 3; dustPos[k] = dustBase[k] + Math.sin(tt * 3 + i) * 0.15; dustPos[k + 1] = dustBase[k + 1] + Math.sin(tt * 2 + i * 1.7) * 0.12; dustPos[k + 2] = dustBase[k + 2] + Math.cos(tt * 2.5 + i * 0.7) * 0.15; }
    dustGeo.attributes.position.needsUpdate = true;
    if (grainPass) grainPass.uniforms.time.value = (now * 0.001) % 100;
    if (composer) {
      composer.render();
      if (avatars.size || dice.some(d => d.label?.visible)) { renderer.setRenderTarget(null); renderer.autoClear = false; renderer.clearDepth(); camera.layers.set(1); renderer.render(scene, camera); camera.layers.set(0); renderer.autoClear = true; }
    } else renderer.render(scene, camera);
  }

  // ---------- public API ----------
  // ---------- other agents in the case ----------
  const avatars = new Map();
  // name tag: rank and codename, then callsign and unit
  const labelTex = (lines, hex) => B.canvasTex(320, lines.length > 1 ? 96 : 64, (c, cw, ch) => {
    c.fillStyle = "rgba(20,13,8,.8)"; c.beginPath(); c.roundRect(4, 6, cw - 8, ch - 12, 22); c.fill();
    c.fillStyle = hex; c.beginPath(); c.arc(30, lines.length > 1 ? 34 : ch / 2, 9, 0, Math.PI * 2); c.fill();
    c.textBaseline = "middle"; c.fillStyle = "#efe3c6"; c.font = '24px "Special Elite", monospace';
    const fit = (t, max) => { t = String(t); while (c.measureText(t).width > max && t.length > 3) t = t.slice(0, -2) + "…"; return t; };
    c.fillText(fit(lines[0], cw - 66), 50, lines.length > 1 ? 35 : ch / 2 + 1);
    if (lines[1]) { c.fillStyle = "#d9b46a"; c.font = '19px "Special Elite", monospace'; c.fillText(fit(lines[1], cw - 66), 50, 66); }
  });
  function makeAvatar(a) {
    const g = new THREE.Group();
    const built = buildAgent(THREE, a.look, {color: a.color, name: a.name, mobile, style: a.style});
    disposables.push(...built.trash); g.add(built.group);
    const lines = labelLines(a.look, a.name);
    const sm = new THREE.SpriteMaterial({map: labelTex(lines, a.color), depthWrite: false, transparent: true, toneMapped: !composer}); disposables.push(sm);
    const label = new THREE.Sprite(sm); label.scale.set(0.7, lines.length > 1 ? 0.21 : 0.14, 1); label.position.y = 2.1; g.add(label);
    if (composer) label.layers.set(1); // drawn after the effects (ambient occlusion can't handle sprites)
    scene.add(g);
    return {g, name: a.name, color: a.color, lookKey: JSON.stringify(a.look || {}) + a.style, target: {x: 0, z: 0, yaw: 0}, placed: false};
  }
  function setAvatars(list) {
    const seen = new Set();
    const atBoard = list.filter(a => a.pose.mode !== "room");
    for (const a of list) {
      seen.add(a.id);
      let av = avatars.get(a.id);
      if (av && (av.name !== a.name || av.color !== a.color || av.lookKey !== JSON.stringify(a.look || {}) + a.style)) { scene.remove(av.g); avatars.delete(a.id); av = null; }
      if (!av) { av = makeAvatar(a); avatars.set(a.id, av); }
      if (a.pose.mode === "room") av.target = {x: +a.pose.x || 0, z: +a.pose.z || 0, yaw: +a.pose.yaw || 0};
      else { const i = atBoard.indexOf(a); av.target = {x: -0.9 + i * 0.6, z: -1.55, yaw: 0}; } // working on the board: standing in front of it
      if (!av.placed) { av.g.position.set(av.target.x, 0, av.target.z); av.g.rotation.y = av.target.yaw; av.placed = true; }
    }
    for (const [id, av] of avatars) if (!seen.has(id)) { scene.remove(av.g); avatars.delete(id); }
  }
  function stepAvatars(dt) {
    const k = Math.min(1, dt * 7);
    for (const av of avatars.values()) {
      av.g.position.x += (av.target.x - av.g.position.x) * k; av.g.position.z += (av.target.z - av.g.position.z) * k;
      const d = ((av.target.yaw - av.g.rotation.y + Math.PI * 3) % (Math.PI * 2)) - Math.PI; av.g.rotation.y += d * k;
    }
  }
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
    setAvatars,
    rollDice,
    getPose() { return {mode: "room", x: +pose.x.toFixed(2), z: +pose.z.toFixed(2), yaw: +pose.yaw.toFixed(2)}; },
    lookFrom(x, y, z, yaw, pitch) { anim = null; Object.assign(pose, {x, y, z, yaw, pitch}); applyPose(); },
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
      composer?.dispose?.();
      renderer.dispose();
    },
  };
}
