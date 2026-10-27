// The End City study session: a first-person walk around the End ship.
// Plain three.js, no physics engine: the deck grid in world.ts decides where you can stand.
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { Deck, BLOCKS_PER_UNIT } from "./world";

export interface SkyClock {
  /** big text, e.g. "24:13" */
  time: string;
  /** small line under it */
  label: string;
  /** 0..1 progress ring */
  progress: number;
  running: boolean;
}

export interface EndCityEvents {
  onProgress: (loaded: number, total: number) => void;
  onReady: () => void;
  onError: (msg: string) => void;
  onOpenBook: () => void;
  onLockChange: (locked: boolean) => void;
  onHover: (target: "bookshelf" | null, distance: number) => void;
  onBarrier: () => void;
}

const EYE = 1.62;
const WALK = 4.3;
const SPRINT = 6.2;
const SNEAK = 1.6;
const GRAVITY = 28;
const JUMP = 8.6;
const REACH = 5;

/** 16×16 pixel-art bookshelf face, drawn on a canvas so we don't ship an image. */
function bookshelfTexture(top = false): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = c.height = 16;
  const g = c.getContext("2d")!;
  const plank = ["#a07a4a", "#8d6a3e", "#b48a56", "#7a5a33"];
  for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) {
    g.fillStyle = plank[(x * 7 + y * 13 + (y % 4 === 0 ? 2 : 0)) % plank.length]!;
    g.fillRect(x, y, 1, 1);
  }
  if (!top) {
    const books = ["#7b1f1f", "#1f3f7b", "#2f6b2a", "#7b6a1f", "#5a1f7b", "#1f6b6b", "#8a3a10", "#3a3a3a"];
    for (const row of [1, 9]) {
      g.fillStyle = "#3b2810";
      g.fillRect(0, row - 1, 16, 1);
      let x = 1;
      let i = row;
      while (x < 15) {
        const w = 1 + ((i * 5) % 2);
        const h = 5 + ((i * 3) % 2);
        g.fillStyle = books[i % books.length]!;
        g.fillRect(x, row + (6 - h), w, h);
        g.fillStyle = "#ffffff22";
        g.fillRect(x, row + (6 - h), 1, 1);
        x += w + (i % 3 === 0 ? 1 : 0);
        i++;
      }
    }
  }
  const t = new THREE.CanvasTexture(c);
  t.magFilter = THREE.NearestFilter;
  t.minFilter = THREE.NearestFilter;
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/** The End sky: dark violet static noise, like the real game, on a giant sphere. */
function endSkyTexture(): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const g = c.getContext("2d")!;
  for (let y = 0; y < 128; y++) for (let x = 0; x < 128; x++) {
    const n = Math.random();
    const v = 10 + Math.floor(n * n * 34);
    g.fillStyle = `rgb(${v + 12},${Math.floor(v * 0.6)},${v + 30})`;
    g.fillRect(x, y, 1, 1);
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(12, 6);
  t.magFilter = THREE.NearestFilter;
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function glowSprite(color: string): THREE.Texture {
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const g = c.getContext("2d")!;
  const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  grad.addColorStop(0, color);
  grad.addColorStop(0.35, color + "88");
  grad.addColorStop(1, color + "00");
  g.fillStyle = grad;
  g.fillRect(0, 0, 64, 64);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

export class EndCity {
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera: THREE.PerspectiveCamera;
  private clock = new THREE.Clock();
  private deck = new Deck();
  private raycaster = new THREE.Raycaster();
  private bookshelf!: THREE.Mesh;
  private bookshelfGlow!: THREE.Mesh;
  private label!: THREE.Sprite;
  private skyClock!: THREE.Mesh;
  private skyCanvas = document.createElement("canvas");
  private clockBase = 0;
  private skyTexture!: THREE.CanvasTexture;
  private motes!: THREE.Points;
  private glyphs!: THREE.Points;
  private orbs: THREE.Points | null = null;
  private orbsAge = 0;
  private barrierSprite!: THREE.Sprite;
  private barrierAge = 9;
  private raf = 0;
  private disposed = false;

  // player
  private pos = new THREE.Vector3();
  private vy = 0;
  private onGround = true;
  private yaw = 0;
  private pitch = 0;
  private keys = new Set<string>();
  private locked = false;
  private paused = false;
  /** touch controls write here: x = strafe, y = forward, each −1..1 */
  readonly stick = { x: 0, y: 0 };
  private jumpQueued = false;
  private hovered = false;
  private lastClock = "";
  private bob = 0;

  constructor(private host: HTMLElement, private ev: EndCityEvents) {
    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    this.renderer.setSize(host.clientWidth, host.clientHeight);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    host.appendChild(this.renderer.domElement);
    this.renderer.domElement.style.display = "block";
    this.renderer.domElement.style.touchAction = "none";

    this.camera = new THREE.PerspectiveCamera(72, host.clientWidth / host.clientHeight, 0.05, 900);
    this.scene.fog = new THREE.FogExp2(0x140a22, 0.0065);
    this.scene.background = new THREE.Color(0x0d0716);

    this.buildSky();
    this.buildLights();
    this.buildBookshelf();
    this.spawn();
    this.buildSkyClock();
    this.buildParticles();
    this.loadWorld();
    this.bindInput();
    this.loop();
  }

  // ── setup ──────────────────────────────────────────────────────────────
  private buildSky() {
    const sky = new THREE.Mesh(
      new THREE.SphereGeometry(600, 32, 16),
      new THREE.MeshBasicMaterial({ map: endSkyTexture(), side: THREE.BackSide, fog: false }),
    );
    this.scene.add(sky);
    // a few big soft violet "nebula" glows on the horizon
    const tex = glowSprite("#b04cff");
    for (let i = 0; i < 6; i++) {
      const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, color: 0xb04cff, transparent: true, opacity: 0.18, depthWrite: false, fog: false, blending: THREE.AdditiveBlending }));
      const a = (i / 6) * Math.PI * 2;
      s.position.set(Math.cos(a) * 400, 60 + (i % 3) * 40, Math.sin(a) * 400);
      s.scale.setScalar(260);
      this.scene.add(s);
    }
    // stars
    const n = 1400;
    const p = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      const u = Math.random() * 2 - 1, t = Math.random() * Math.PI * 2;
      const r = 520, k = Math.sqrt(1 - u * u);
      p.set([r * k * Math.cos(t), Math.abs(r * u) * 0.9 + 20, r * k * Math.sin(t)], i * 3);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(p, 3));
    this.scene.add(new THREE.Points(g, new THREE.PointsMaterial({ color: 0xe9dcff, size: 1.6, sizeAttenuation: false, fog: false, transparent: true, opacity: 0.8 })));
  }

  private buildLights() {
    this.scene.add(new THREE.HemisphereLight(0xc8a8ff, 0x1a0f2b, 1.6));
    this.scene.add(new THREE.AmbientLight(0x6a4a8a, 0.9));
    const moon = new THREE.DirectionalLight(0xe6d8ff, 1.4);
    moon.position.set(-60, 160, 40);
    this.scene.add(moon);
    const [sx, sz] = this.deck.worldAt(40, 14);
    for (const [dx, dz, c] of [[-6, 0, 0xb04cff], [8, 2, 0xff66ff], [0, -4, 0x8a6cff]] as const) {
      const l = new THREE.PointLight(c, 26, 22, 1.6);
      l.position.set(sx + dx, this.deck.floor0 + 3.5, sz + dz);
      this.scene.add(l);
    }
  }

  private buildBookshelf() {
    // Against the cabin wall on the main deck.
    const [x, z] = this.deck.worldAt(39, 17);
    const floor = this.deck.floorAtCell(38, 16) ?? this.deck.floor0;
    const side = bookshelfTexture(false);
    const top = bookshelfTexture(true);
    const sideMat = new THREE.MeshLambertMaterial({ map: side, emissive: 0x2a0b40, emissiveIntensity: 0.6 });
    const topMat = new THREE.MeshLambertMaterial({ map: top });
    this.bookshelf = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), [sideMat, sideMat, topMat, topMat, sideMat, sideMat]);
    this.bookshelf.position.set(x, floor + 0.5, z);
    this.scene.add(this.bookshelf);
    // glowing selection outline (shown when you look at it)
    this.bookshelfGlow = new THREE.Mesh(
      new THREE.BoxGeometry(1.06, 1.06, 1.06),
      new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true, transparent: true, opacity: 0.9 }),
    );
    this.bookshelfGlow.position.copy(this.bookshelf.position);
    this.bookshelfGlow.visible = false;
    this.scene.add(this.bookshelfGlow);
    // block the cells it occupies
    const [ix, iy] = this.deck.cellAt(x, z);
    for (let a = -1; a <= 0; a++) for (let b = -1; b <= 0; b++) this.deck.block(ix + a, iy + b);
    // floating label
    const c = document.createElement("canvas");
    c.width = 512;
    c.height = 128;
    const g = c.getContext("2d")!;
    g.fillStyle = "rgba(10,4,20,0.7)";
    g.fillRect(40, 20, 432, 88);
    g.font = "bold 44px 'Pixelify Sans', monospace";
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.fillStyle = "#eef59b";
    g.fillText("📖 Study Book", 256, 66);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    this.label = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, transparent: true, depthWrite: false }));
    this.label.scale.set(2.4, 0.6, 1);
    this.label.position.set(x, floor + 1.9, z);
    this.scene.add(this.label);
  }

  private buildSkyClock() {
    this.skyCanvas.width = 1024;
    this.skyCanvas.height = 512;
    this.skyTexture = new THREE.CanvasTexture(this.skyCanvas);
    this.skyTexture.colorSpace = THREE.SRGBColorSpace;
    this.skyClock = new THREE.Mesh(
      new THREE.PlaneGeometry(26, 13),
      new THREE.MeshBasicMaterial({ map: this.skyTexture, transparent: true, depthWrite: false, fog: false, side: THREE.DoubleSide }),
    );
    // Float it out past the bookshelf, in the direction you face when you spawn, about 20°
    // above eye level: visible right away, and looking up at it feels like looking at the sky.
    const fx = -Math.sin(this.yaw), fz = -Math.cos(this.yaw);
    this.clockBase = this.pos.y + EYE + 10;
    this.skyClock.position.set(this.pos.x + fx * 30, this.clockBase, this.pos.z + fz * 30);
    this.scene.add(this.skyClock);
    this.setClock({ time: "", label: "Open the bookshelf to start a focus timer", progress: 0, running: false });
  }

  /** Called by the page every tick with the shared focus timer. */
  setClock(c: SkyClock) {
    const key = `${c.time}|${c.label}|${Math.round(c.progress * 200)}|${c.running}`;
    if (key === this.lastClock) return;
    this.lastClock = key;
    const g = this.skyCanvas.getContext("2d")!;
    const W = this.skyCanvas.width, H = this.skyCanvas.height;
    g.clearRect(0, 0, W, H);
    // violet halo
    const halo = g.createRadialGradient(W / 2, H / 2, 20, W / 2, H / 2, W / 2);
    halo.addColorStop(0, "rgba(176,76,255,0.35)");
    halo.addColorStop(1, "rgba(176,76,255,0)");
    g.fillStyle = halo;
    g.fillRect(0, 0, W, H);
    g.textAlign = "center";
    g.textBaseline = "middle";
    if (c.time) {
      // progress ring
      g.lineWidth = 14;
      g.strokeStyle = "rgba(255,255,255,0.15)";
      g.beginPath();
      g.arc(W / 2, H / 2 - 20, 205, 0, Math.PI * 2);
      g.stroke();
      g.strokeStyle = c.running ? "#eef59b" : "#ff9bff";
      g.shadowColor = "#b04cff";
      g.shadowBlur = 30;
      g.beginPath();
      g.arc(W / 2, H / 2 - 20, 205, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * Math.max(0.001, c.progress));
      g.stroke();
      g.font = "bold 180px 'Pixelify Sans', 'Press Start 2P', monospace";
      g.fillStyle = "#ffffff";
      g.shadowBlur = 40;
      g.fillText(c.time, W / 2, H / 2 - 20);
      g.shadowBlur = 16;
      g.font = "bold 42px 'Pixelify Sans', monospace";
      g.fillStyle = "#e9dcff";
      g.fillText(c.label, W / 2, H - 50);
    } else {
      g.shadowColor = "#b04cff";
      g.shadowBlur = 24;
      g.font = "bold 64px 'Pixelify Sans', monospace";
      g.fillStyle = "rgba(240,230,255,0.9)";
      // wrap onto two lines so it never gets clipped
      const words = c.label.split(" ");
      const mid = Math.ceil(words.length / 2);
      g.fillText(words.slice(0, mid).join(" "), W / 2, H / 2 - 40);
      g.fillText(words.slice(mid).join(" "), W / 2, H / 2 + 40);
    }
    g.shadowBlur = 0;
    this.skyTexture.needsUpdate = true;
  }

  private buildParticles() {
    // end-rod motes drifting up around the ship
    const n = 260;
    const p = new Float32Array(n * 3);
    const [cx, cz] = this.deck.worldAt(33, 14);
    for (let i = 0; i < n; i++) p.set([cx + (Math.random() - 0.5) * 50, this.deck.floor0 - 6 + Math.random() * 26, cz + (Math.random() - 0.5) * 30], i * 3);
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(p, 3));
    this.motes = new THREE.Points(g, new THREE.PointsMaterial({ map: glowSprite("#ffffff"), color: 0xf3e9ff, size: 0.35, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
    this.scene.add(this.motes);
    // enchanting glyphs swirling into the bookshelf
    const m = 40;
    const q = new Float32Array(m * 3);
    const g2 = new THREE.BufferGeometry();
    g2.setAttribute("position", new THREE.BufferAttribute(q, 3));
    this.glyphs = new THREE.Points(g2, new THREE.PointsMaterial({ map: glowSprite("#c79bff"), color: 0xd8b4ff, size: 0.22, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
    this.scene.add(this.glyphs);
    // barrier icon (shows where you bump into the invisible wall)
    const c = document.createElement("canvas");
    c.width = c.height = 16;
    const bg = c.getContext("2d")!;
    bg.fillStyle = "#e01010";
    for (let i = 2; i < 14; i++) { bg.fillRect(i, 2, 1, 1); bg.fillRect(i, 13, 1, 1); bg.fillRect(2, i, 1, 1); bg.fillRect(13, i, 1, 1); bg.fillRect(i, i, 1, 1); }
    const t = new THREE.CanvasTexture(c);
    t.magFilter = THREE.NearestFilter;
    this.barrierSprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, transparent: true, depthWrite: false }));
    this.barrierSprite.scale.setScalar(0.9);
    this.barrierSprite.visible = false;
    this.scene.add(this.barrierSprite);
  }

  private spawn() {
    const [ix, iy] = this.deck.nearestWalkable(45, 13);
    const [x, z] = this.deck.worldAt(ix + 0.5, iy + 0.5);
    const floor = this.deck.standable(x, z, this.deck.floor0 + 1) ?? this.deck.floor0;
    this.pos.set(x, floor, z);
    // face the bookshelf
    const dx = this.bookshelf.position.x - x, dz = this.bookshelf.position.z - z;
    this.yaw = Math.atan2(-dx, -dz);
    this.pitch = -0.1;
  }

  private loadWorld() {
    const loader = new GLTFLoader();
    loader.load(
      "/models/end_city.glb",
      (gltf) => {
        if (this.disposed) return;
        const root = gltf.scene;
        root.scale.setScalar(BLOCKS_PER_UNIT);
        root.traverse((o) => {
          const mesh = o as THREE.Mesh;
          if (!mesh.isMesh) return;
          const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
          for (const m of mats as THREE.MeshStandardMaterial[]) {
            if (m.map) {
              m.map.magFilter = THREE.NearestFilter;
              m.map.minFilter = THREE.NearestMipmapLinearFilter;
              m.map.anisotropy = 4;
            }
            if (m.transparent || m.alphaMap || /Glass|Chorus|Banner|Ladder|Rod|Head/i.test(m.name)) {
              m.alphaTest = 0.4;
              m.transparent = /Glass/i.test(m.name);
              m.side = THREE.DoubleSide;
            }
            m.roughness = 1;
            m.metalness = 0;
            if (/End_Rod/i.test(m.name)) {
              m.emissive = new THREE.Color(0xfff2ff);
              m.emissiveIntensity = 1.2;
            }
            if (/Purpur/i.test(m.name)) m.emissive = new THREE.Color(0x1a0526);
          }
          mesh.matrixAutoUpdate = false;
          mesh.updateMatrix();
        });
        this.scene.add(root);
        root.updateMatrixWorld(true);
        this.ev.onReady();
      },
      (e) => this.ev.onProgress(e.loaded, e.total || 19_460_040),
      () => this.ev.onError("Couldn't load the End City. Check your connection and refresh."),
    );
  }

  // ── input ──────────────────────────────────────────────────────────────
  private onKeyDown = (e: KeyboardEvent) => {
    if (this.paused) return;
    this.keys.add(e.code);
    if (e.code === "Space") this.jumpQueued = true;
    if (e.code === "KeyE" && this.hovered) this.ev.onOpenBook();
  };
  private onKeyUp = (e: KeyboardEvent) => this.keys.delete(e.code);
  private onMouseMove = (e: MouseEvent) => {
    if (!this.locked) return;
    this.look(e.movementX, e.movementY, 0.0022);
  };
  private onPointerLockChange = () => {
    this.locked = document.pointerLockElement === this.renderer.domElement;
    if (!this.locked) this.keys.clear();
    this.ev.onLockChange(this.locked);
  };
  private onClick = (e: MouseEvent) => {
    if (this.paused) return;
    if (!this.locked) {
      // touch devices: tap the bookshelf directly
      if (this.pickAt(e.clientX, e.clientY)) return this.ev.onOpenBook();
      if (matchMedia("(pointer: fine)").matches) this.lock();
      return;
    }
    if (this.hovered) this.ev.onOpenBook();
  };
  private onResize = () => {
    const w = this.host.clientWidth, h = this.host.clientHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  };

  look(dx: number, dy: number, sens = 0.0022) {
    this.yaw -= dx * sens;
    this.pitch = Math.max(-1.5, Math.min(1.5, this.pitch - dy * sens));
  }

  jump() {
    this.jumpQueued = true;
  }

  lock() {
    try {
      void this.renderer.domElement.requestPointerLock();
    } catch {
      /* not supported */
    }
  }

  unlock() {
    if (document.pointerLockElement) document.exitPointerLock();
  }

  /** Pause movement while a menu/book is open. */
  setPaused(p: boolean) {
    this.paused = p;
    this.keys.clear();
    this.stick.x = this.stick.y = 0;
    if (p) this.unlock();
  }

  private bindInput() {
    window.addEventListener("keydown", this.onKeyDown);
    window.addEventListener("keyup", this.onKeyUp);
    document.addEventListener("mousemove", this.onMouseMove);
    document.addEventListener("pointerlockchange", this.onPointerLockChange);
    this.renderer.domElement.addEventListener("click", this.onClick);
    window.addEventListener("resize", this.onResize);
  }

  private pickAt(clientX: number, clientY: number): boolean {
    const r = this.renderer.domElement.getBoundingClientRect();
    const v = new THREE.Vector2(((clientX - r.left) / r.width) * 2 - 1, -((clientY - r.top) / r.height) * 2 + 1);
    this.raycaster.setFromCamera(v, this.camera);
    const hit = this.raycaster.intersectObject(this.bookshelf)[0];
    return Boolean(hit && hit.distance <= REACH + 3);
  }

  /** Little celebration when a focus block finishes: XP orbs burst from the bookshelf. */
  celebrate() {
    if (this.orbs) this.scene.remove(this.orbs);
    const n = 70;
    const p = new Float32Array(n * 3);
    const vel = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      p.set([this.bookshelf.position.x, this.bookshelf.position.y + 0.6, this.bookshelf.position.z], i * 3);
      vel.set([(Math.random() - 0.5) * 6, 4 + Math.random() * 6, (Math.random() - 0.5) * 6], i * 3);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(p, 3));
    g.userData.vel = vel;
    this.orbs = new THREE.Points(g, new THREE.PointsMaterial({ map: glowSprite("#9cff3a"), color: 0xb6ff5a, size: 0.5, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
    this.orbsAge = 0;
    this.scene.add(this.orbs);
  }

  // ── simulation ─────────────────────────────────────────────────────────
  private step(dt: number) {
    const t = this.clock.elapsedTime;
    // movement
    let fwd = 0, side = 0;
    if (!this.paused) {
      if (this.keys.has("KeyW") || this.keys.has("ArrowUp")) fwd += 1;
      if (this.keys.has("KeyS") || this.keys.has("ArrowDown")) fwd -= 1;
      if (this.keys.has("KeyD") || this.keys.has("ArrowRight")) side += 1;
      if (this.keys.has("KeyA") || this.keys.has("ArrowLeft")) side -= 1;
      fwd += this.stick.y;
      side += this.stick.x;
    }
    const len = Math.hypot(fwd, side);
    if (len > 1) { fwd /= len; side /= len; }
    const sneak = this.keys.has("ShiftLeft") || this.keys.has("ShiftRight");
    const sprint = !sneak && (this.keys.has("ControlLeft") || this.keys.has("ControlRight")) && fwd > 0;
    const speed = sneak ? SNEAK : sprint ? SPRINT : WALK;
    const sin = Math.sin(this.yaw), cos = Math.cos(this.yaw);
    const dx = (-sin * fwd + cos * side) * speed * dt;
    const dz = (-cos * fwd - sin * side) * speed * dt;

    if (dx || dz) {
      const before = this.pos.clone();
      // try full move, then slide along each axis (so you glide along walls and railings)
      const tryMove = (x: number, z: number) => {
        const f = this.deck.standable(x, z, this.pos.y, 0.28, this.onGround ? 1.1 : 0.6);
        if (f === null) return false;
        this.pos.x = x;
        this.pos.z = z;
        if (f > this.pos.y) { this.pos.y = f; this.vy = Math.max(this.vy, 0); } // auto-step up
        return true;
      };
      if (!tryMove(this.pos.x + dx, this.pos.z + dz)) {
        const a = tryMove(this.pos.x + dx, this.pos.z);
        const b = tryMove(this.pos.x, this.pos.z + dz);
        if (!a && !b) this.bumpBarrier(before.x + dx * 8, before.z + dz * 8);
        else if (!a || !b) this.bumpBarrier(before.x + (a ? 0 : dx * 8), before.z + (b ? 0 : dz * 8));
      }
      if (this.onGround) this.bob += dt * speed * 2.2;
    }

    // gravity + jumping
    const floor = this.deck.standable(this.pos.x, this.pos.z, this.pos.y + 10, 0.28, 99) ?? this.pos.y;
    if (this.jumpQueued && this.onGround && !this.paused) {
      this.vy = JUMP;
      this.onGround = false;
    }
    this.jumpQueued = false;
    this.vy -= GRAVITY * dt;
    this.pos.y += this.vy * dt;
    if (this.pos.y <= floor) {
      this.pos.y = floor;
      this.vy = 0;
      this.onGround = true;
    } else if (this.pos.y > floor + 0.02) {
      this.onGround = false;
    }

    // camera
    const bobY = this.onGround && len > 0 ? Math.sin(this.bob) * 0.045 : 0;
    this.camera.position.set(this.pos.x, this.pos.y + (sneak ? EYE - 0.3 : EYE) + bobY, this.pos.z);
    this.camera.rotation.set(this.pitch, this.yaw, 0, "YXZ");
    this.camera.fov += ((sprint ? 80 : 72) - this.camera.fov) * Math.min(1, dt * 8);
    this.camera.updateProjectionMatrix();

    // what are we looking at?
    this.raycaster.setFromCamera(new THREE.Vector2(0, 0), this.camera);
    const hit = this.raycaster.intersectObject(this.bookshelf)[0];
    const dist = this.camera.position.distanceTo(this.bookshelf.position);
    const hovered = Boolean(hit && hit.distance <= REACH);
    if (hovered !== this.hovered) {
      this.hovered = hovered;
      this.bookshelfGlow.visible = hovered;
    }
    this.ev.onHover(hovered ? "bookshelf" : null, dist);

    // ambience
    this.label.position.y = this.bookshelf.position.y + 1.4 + Math.sin(t * 2) * 0.08;
    (this.bookshelfGlow.material as THREE.MeshBasicMaterial).opacity = 0.6 + Math.sin(t * 6) * 0.3;
    // the sky clock turns slowly to face you
    const cx = this.camera.position.x - this.skyClock.position.x, cz = this.camera.position.z - this.skyClock.position.z;
    this.skyClock.rotation.y = Math.atan2(cx, cz);
    this.skyClock.position.y = this.clockBase + Math.sin(t * 0.6) * 0.4;

    const mp = this.motes.geometry.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < mp.count; i++) {
      let y = mp.getY(i) + dt * (0.4 + (i % 7) * 0.08);
      if (y > this.deck.floor0 + 22) y = this.deck.floor0 - 6;
      mp.setY(i, y);
      mp.setX(i, mp.getX(i) + Math.sin(t + i) * dt * 0.12);
    }
    mp.needsUpdate = true;

    const gp = this.glyphs.geometry.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < gp.count; i++) {
      const phase = (t * 0.35 + i / gp.count) % 1;
      const ang = i * 2.39996 + t * 0.8;
      const rad = 2.4 * (1 - phase);
      gp.setXYZ(i, this.bookshelf.position.x + Math.cos(ang) * rad, this.bookshelf.position.y + 0.2 + (1 - phase) * 1.6, this.bookshelf.position.z + Math.sin(ang) * rad);
    }
    gp.needsUpdate = true;

    if (this.barrierAge < 0.9) {
      this.barrierAge += dt;
      (this.barrierSprite.material as THREE.SpriteMaterial).opacity = Math.max(0, 1 - this.barrierAge / 0.9);
      if (this.barrierAge >= 0.9) this.barrierSprite.visible = false;
    }

    if (this.orbs) {
      this.orbsAge += dt;
      const op = this.orbs.geometry.attributes.position as THREE.BufferAttribute;
      const vel = this.orbs.geometry.userData.vel as Float32Array;
      for (let i = 0; i < op.count; i++) {
        vel[i * 3 + 1]! -= 9 * dt;
        // orbs drift toward the player like real XP
        const tx = this.pos.x - op.getX(i), tz = this.pos.z - op.getZ(i), ty = this.pos.y + 1 - op.getY(i);
        const pull = this.orbsAge > 0.8 ? 6 : 0;
        op.setXYZ(i, op.getX(i) + (vel[i * 3]! + tx * pull * dt * 4) * dt, op.getY(i) + (vel[i * 3 + 1]! + ty * pull) * dt, op.getZ(i) + (vel[i * 3 + 2]! + tz * pull * dt * 4) * dt);
      }
      op.needsUpdate = true;
      if (this.orbsAge > 2.6) {
        this.scene.remove(this.orbs);
        this.orbs = null;
      }
    }
  }

  private lastBarrier = 0;
  private bumpBarrier(x: number, z: number) {
    const now = performance.now();
    if (now - this.lastBarrier < 450) return;
    this.lastBarrier = now;
    // put the icon at the edge just in front of you, at chest height
    const dx = x - this.pos.x, dz = z - this.pos.z;
    const d = Math.hypot(dx, dz) || 1;
    this.barrierSprite.position.set(this.pos.x + (dx / d) * 0.9, this.pos.y + 1.1, this.pos.z + (dz / d) * 0.9);
    this.barrierSprite.visible = true;
    this.barrierAge = 0;
    this.ev.onBarrier();
  }

  private loop = () => {
    if (this.disposed) return;
    this.raf = requestAnimationFrame(this.loop);
    const dt = Math.min(0.05, this.clock.getDelta());
    this.step(dt);
    this.renderer.render(this.scene, this.camera);
  };

  dispose() {
    this.disposed = true;
    cancelAnimationFrame(this.raf);
    window.removeEventListener("keydown", this.onKeyDown);
    window.removeEventListener("keyup", this.onKeyUp);
    document.removeEventListener("mousemove", this.onMouseMove);
    document.removeEventListener("pointerlockchange", this.onPointerLockChange);
    window.removeEventListener("resize", this.onResize);
    this.unlock();
    this.scene.traverse((o) => {
      const m = o as THREE.Mesh;
      m.geometry?.dispose?.();
      const mats = Array.isArray(m.material) ? m.material : m.material ? [m.material] : [];
      for (const mat of mats) {
        for (const v of Object.values(mat)) if (v instanceof THREE.Texture) v.dispose();
        mat.dispose();
      }
    });
    this.renderer.dispose();
    this.renderer.domElement.remove();
  }
}
