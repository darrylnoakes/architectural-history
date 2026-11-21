import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export type NavMode = 'orbit' | 'walk' | 'drone';

export interface WorldCollider {
  x: number;
  z: number;
  w: number;
  d: number;
  rotY: number;
}

/** What the navigator needs to know about the place it is moving through. */
export interface Walkable {
  /** Height of the surface you would stand on at (x, z), including bridge decks. */
  groundHeight(x: number, z: number, currentY?: number): number;
  /** Solid footprints that stop a walker. */
  colliders(): readonly WorldCollider[];
  /** Centre and radius of the area you may roam. */
  centre: THREE.Vector3;
  radius: number;
  /** Orbit limits. */
  minDistance: number;
  maxDistance: number;
}

export interface NavInput {
  /** Touch joystick, each axis -1..1 (x = strafe right, y = forward). */
  stick: THREE.Vector2;
  /** Touch buttons. */
  up: boolean;
  down: boolean;
  run: boolean;
}

const EYE = 1.7;
const WALK_SPEED = 5.5;
const RUN_SPEED = 14;
const DRONE_SPEED = 24;
const DRONE_FAST = 70;
const RADIUS = 0.45;

const _v = new THREE.Vector3();
const _q = new THREE.Quaternion();
const _e = new THREE.Euler(0, 0, 0, 'YXZ');

function smooth(t: number) {
  return t * t * (3 - 2 * t);
}

/**
 * Three ways of moving through a world with one camera:
 *  - orbit: drag to turn the model, scroll or pinch to zoom, right-drag or two fingers to pan
 *  - walk:  first person at eye height, held to the ground, blocked by buildings
 *  - drone: free flight
 * Desktop uses pointer lock for looking around in walk and drone; touch devices drag to look and
 * feed movement in through `input` (an on-screen stick).
 */
export class Navigator {
  mode: NavMode = 'orbit';
  readonly orbit: OrbitControls;
  readonly input: NavInput = { stick: new THREE.Vector2(), up: false, down: false, run: false };
  /** Called for a click or tap that was not a drag. ndc is null when the pointer is locked (aim with the crosshair). */
  onPick: ((ndc: THREE.Vector2 | null) => void) | null = null;
  onHover: ((ndc: THREE.Vector2 | null) => void) | null = null;
  onLockChange: ((locked: boolean) => void) | null = null;
  onModeChange: ((mode: NavMode) => void) | null = null;
  /** Keys the app wants to know about (anything the navigator does not use itself). */
  onKey: ((e: KeyboardEvent) => void) | null = null;

  private keys = new Set<string>();
  private yaw = 0;
  private pitch = 0;
  private vel = new THREE.Vector3();
  private locked = false;
  private drag: { id: number; x: number; y: number; sx: number; sy: number; t: number; moved: boolean } | null = null;
  private tween: {
    fromPos: THREE.Vector3;
    toPos: THREE.Vector3;
    fromQuat: THREE.Quaternion;
    toQuat: THREE.Quaternion;
    fromTarget?: THREE.Vector3;
    toTarget?: THREE.Vector3;
    t: number;
    dur: number;
    done?: () => void;
  } | null = null;
  private disposers: (() => void)[] = [];
  private touch = false;

  constructor(
    private camera: THREE.PerspectiveCamera,
    private dom: HTMLElement,
    private world: () => Walkable,
  ) {
    this.orbit = new OrbitControls(camera, dom);
    this.orbit.enableDamping = true;
    this.orbit.dampingFactor = 0.09;
    this.orbit.screenSpacePanning = false;
    this.orbit.maxPolarAngle = Math.PI * 0.47;
    this.orbit.minPolarAngle = 0.12;
    this.orbit.zoomSpeed = 0.9;
    this.orbit.rotateSpeed = 0.55;
    this.orbit.panSpeed = 0.9;
    this.orbit.zoomToCursor = true;
    this.applyWorldLimits();

    const on = <K extends keyof HTMLElementEventMap>(
      el: HTMLElement | Document | Window,
      type: K | string,
      fn: (e: any) => void,
      opts?: AddEventListenerOptions,
    ) => {
      el.addEventListener(type, fn as EventListener, opts);
      this.disposers.push(() => el.removeEventListener(type, fn as EventListener, opts));
    };

    on(window, 'keydown', (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      this.keys.add(e.code);
      if (this.mode !== 'orbit' && ['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
        e.preventDefault();
      }
      this.onKey?.(e);
    });
    on(window, 'keyup', (e: KeyboardEvent) => this.keys.delete(e.code));
    on(window, 'blur', () => this.keys.clear());

    on(document, 'pointerlockchange', () => {
      this.locked = document.pointerLockElement === this.dom;
      this.onLockChange?.(this.locked);
    });
    on(document, 'mousemove', (e: MouseEvent) => {
      if (!this.locked || this.mode === 'orbit') return;
      this.look(e.movementX, e.movementY, 0.0022);
    });

    on(dom, 'pointerdown', (e: PointerEvent) => {
      if (e.pointerType === 'touch') this.touch = true;
      if (this.drag) return;
      this.drag = { id: e.pointerId, x: e.clientX, y: e.clientY, sx: e.clientX, sy: e.clientY, t: performance.now(), moved: false };
    });
    on(window, 'pointermove', (e: PointerEvent) => {
      const d = this.drag;
      if (d && d.id === e.pointerId) {
        const dx = e.clientX - d.x;
        const dy = e.clientY - d.y;
        d.x = e.clientX;
        d.y = e.clientY;
        if (Math.hypot(e.clientX - d.sx, e.clientY - d.sy) > 6) d.moved = true;
        if (this.mode !== 'orbit' && !this.locked && d.moved) this.look(dx, dy, e.pointerType === 'touch' ? 0.0055 : 0.004);
      } else if (!d && e.pointerType === 'mouse' && e.target === this.dom && !this.locked) {
        this.onHover?.(this.ndc(e.clientX, e.clientY));
      }
    });
    const end = (e: PointerEvent) => {
      const d = this.drag;
      if (!d || d.id !== e.pointerId) return;
      this.drag = null;
      if (e.type === 'pointercancel') return;
      const quick = performance.now() - d.t < 450;
      if (d.moved || !quick || e.button > 0) return;
      if (this.tween) return;
      if (this.mode !== 'orbit' && !this.touch && e.pointerType === 'mouse') {
        if (!this.locked) {
          (this.dom.requestPointerLock() as unknown as Promise<void> | undefined)?.catch?.(() => {});
          return;
        }
        this.onPick?.(null);
        return;
      }
      this.onPick?.(this.ndc(e.clientX, e.clientY));
    };
    on(window, 'pointerup', end);
    on(window, 'pointercancel', end);
    on(dom, 'pointerleave', () => this.onHover?.(null));
    on(dom, 'contextmenu', (e: Event) => e.preventDefault());
  }

  private ndc(cx: number, cy: number): THREE.Vector2 {
    const r = this.dom.getBoundingClientRect();
    return new THREE.Vector2(((cx - r.left) / r.width) * 2 - 1, -((cy - r.top) / r.height) * 2 + 1);
  }

  private look(dx: number, dy: number, k: number) {
    this.yaw -= dx * k;
    this.pitch = Math.max(-1.45, Math.min(1.45, this.pitch - dy * k));
  }

  get isLocked() {
    return this.locked;
  }

  /** Re-read the roam and zoom limits after the world changed. */
  applyWorldLimits() {
    const w = this.world();
    this.orbit.minDistance = w.minDistance;
    this.orbit.maxDistance = w.maxDistance;
  }

  /** Put the orbit camera somewhere at once, without animation. */
  setOrbit(target: THREE.Vector3, distance: number, azimuth = 0.6, polar = 1.0) {
    this.tween = null;
    this.orbit.enabled = this.mode === 'orbit';
    this.orbit.target.copy(target);
    this.camera.position.set(
      target.x + distance * Math.sin(polar) * Math.sin(azimuth),
      target.y + distance * Math.cos(polar),
      target.z + distance * Math.sin(polar) * Math.cos(azimuth),
    );
    this.camera.lookAt(target);
    this.orbit.update();
  }

  /** Glide the orbit camera to look at `target` from `distance`, keeping the current viewing angle. */
  flyTo(target: THREE.Vector3, distance: number, dur = 1.1) {
    if (this.mode !== 'orbit') return;
    const dir = _v.copy(this.camera.position).sub(this.orbit.target);
    const len = dir.length() || 1;
    dir.multiplyScalar(1 / len);
    // do not arrive looking straight down or along the ground
    const polar = Math.acos(Math.max(-1, Math.min(1, dir.y)));
    const want = Math.min(1.2, Math.max(0.75, polar));
    const az = Math.atan2(dir.x, dir.z);
    const toPos = new THREE.Vector3(
      target.x + distance * Math.sin(want) * Math.sin(az),
      target.y + distance * Math.cos(want),
      target.z + distance * Math.sin(want) * Math.cos(az),
    );
    const m = new THREE.Matrix4().lookAt(toPos, target, THREE.Object3D.DEFAULT_UP);
    this.orbit.enabled = false;
    this.tween = {
      fromPos: this.camera.position.clone(),
      toPos,
      fromQuat: this.camera.quaternion.clone(),
      toQuat: new THREE.Quaternion().setFromRotationMatrix(m),
      fromTarget: this.orbit.target.clone(),
      toTarget: target.clone(),
      t: 0,
      dur,
      done: () => {
        this.orbit.target.copy(target);
        this.orbit.enabled = true;
        this.orbit.update();
      },
    };
  }

  setMode(mode: NavMode, opts?: { instant?: boolean; at?: THREE.Vector3; yaw?: number }) {
    if (mode === this.mode && !opts?.at && !opts?.instant) return;
    const w = this.world();
    const prev = this.mode;
    this.mode = mode;
    this.vel.set(0, 0, 0);
    this.tween = null;
    if (mode === 'orbit') {
      if (document.pointerLockElement === this.dom) document.exitPointerLock();
      // look at the ground ahead of where we were standing or flying
      const fwd = new THREE.Vector3(0, 0, -1).applyQuaternion(this.camera.quaternion);
      const flat = new THREE.Vector3(fwd.x, 0, fwd.z);
      if (flat.lengthSq() < 1e-4) flat.set(0, 0, -1);
      flat.normalize();
      const ahead = prev === 'walk' ? 28 : Math.min(160, Math.max(30, this.camera.position.y * 1.2));
      const target = opts?.at?.clone() ?? this.camera.position.clone().addScaledVector(flat, ahead);
      target.y = Math.max(0, w.groundHeight(target.x, target.z));
      const dist = prev === 'walk' ? 70 : Math.max(40, this.camera.position.distanceTo(target));
      const toPos = prev === 'walk' ? target.clone().addScaledVector(flat, -dist * 0.72).setY(target.y + dist * 0.6) : this.camera.position.clone();
      const m = new THREE.Matrix4().lookAt(toPos, target, THREE.Object3D.DEFAULT_UP);
      const finish = () => {
        this.orbit.target.copy(target);
        this.orbit.enabled = true;
        this.orbit.update();
      };
      if (opts?.instant) {
        this.camera.position.copy(toPos);
        finish();
      } else {
        this.orbit.enabled = false;
        this.tween = {
          fromPos: this.camera.position.clone(),
          toPos,
          fromQuat: this.camera.quaternion.clone(),
          toQuat: new THREE.Quaternion().setFromRotationMatrix(m),
          t: 0,
          dur: 0.9,
          done: finish,
        };
      }
    } else {
      this.orbit.enabled = false;
      let toPos: THREE.Vector3;
      let yaw: number;
      let pitch: number;
      _e.setFromQuaternion(this.camera.quaternion, 'YXZ');
      if (prev === 'orbit') {
        yaw = opts?.yaw ?? _e.y;
        if (mode === 'walk') {
          const p = opts?.at ?? this.orbit.target;
          toPos = new THREE.Vector3(p.x, 0, p.z);
          this.resolve(toPos);
          toPos.y = w.groundHeight(toPos.x, toPos.z) + EYE;
          pitch = 0;
        } else {
          // drone: start from where the orbit camera is, but not absurdly far out
          toPos = this.camera.position.clone();
          const d = toPos.distanceTo(this.orbit.target);
          if (d > 140) toPos.lerp(this.orbit.target, 1 - 140 / d);
          pitch = Math.max(-0.9, _e.x);
        }
      } else {
        // walk <-> drone
        yaw = _e.y;
        toPos = this.camera.position.clone();
        if (mode === 'walk') {
          this.resolve(toPos);
          toPos.y = w.groundHeight(toPos.x, toPos.z) + EYE;
          pitch = 0;
        } else {
          toPos.y += 14;
          pitch = -0.25;
        }
      }
      this.yaw = yaw;
      this.pitch = pitch;
      _e.set(pitch, yaw, 0, 'YXZ');
      const toQuat = new THREE.Quaternion().setFromEuler(_e);
      if (opts?.instant) {
        this.camera.position.copy(toPos);
        this.camera.quaternion.copy(toQuat);
      } else {
        this.tween = {
          fromPos: this.camera.position.clone(),
          toPos,
          fromQuat: this.camera.quaternion.clone(),
          toQuat,
          t: 0,
          dur: 0.9,
        };
      }
    }
    this.onModeChange?.(mode);
  }

  /** Push a walker's position out of any building it has stepped into. */
  private resolve(p: THREE.Vector3) {
    const cols = this.world().colliders();
    for (let pass = 0; pass < 2; pass++) {
      for (const c of cols) {
        const dx = p.x - c.x;
        const dz = p.z - c.z;
        if (Math.abs(dx) + Math.abs(dz) > c.w + c.d + 2) continue;
        const cos = Math.cos(c.rotY);
        const sin = Math.sin(c.rotY);
        const lx = dx * cos - dz * sin;
        const lz = dx * sin + dz * cos;
        const hx = c.w / 2;
        const hz = c.d / 2;
        const nx = Math.max(-hx, Math.min(hx, lx));
        const nz = Math.max(-hz, Math.min(hz, lz));
        let ox = lx - nx;
        let oz = lz - nz;
        const dist = Math.hypot(ox, oz);
        if (dist >= RADIUS) continue;
        if (dist > 1e-5) {
          const push = (RADIUS - dist) / dist;
          ox *= push;
          oz *= push;
        } else {
          // inside the box: leave through the nearest face
          const px = hx - Math.abs(lx);
          const pz = hz - Math.abs(lz);
          if (px < pz) {
            ox = (px + RADIUS) * Math.sign(lx || 1);
            oz = 0;
          } else {
            ox = 0;
            oz = (pz + RADIUS) * Math.sign(lz || 1);
          }
        }
        p.x += ox * cos + oz * sin;
        p.z += -ox * sin + oz * cos;
      }
    }
  }

  update(dt: number) {
    const w = this.world();
    if (this.tween) {
      const tw = this.tween;
      tw.t = Math.min(1, tw.t + dt / tw.dur);
      const k = smooth(tw.t);
      this.camera.position.lerpVectors(tw.fromPos, tw.toPos, k);
      this.camera.quaternion.slerpQuaternions(tw.fromQuat, tw.toQuat, k);
      if (tw.fromTarget && tw.toTarget) this.orbit.target.lerpVectors(tw.fromTarget, tw.toTarget, k);
      if (tw.t >= 1) {
        this.tween = null;
        tw.done?.();
      }
      return;
    }

    if (this.mode === 'orbit') {
      // keyboard pan
      const kx = (this.keys.has('KeyD') || this.keys.has('ArrowRight') ? 1 : 0) - (this.keys.has('KeyA') || this.keys.has('ArrowLeft') ? 1 : 0);
      const kz = (this.keys.has('KeyW') || this.keys.has('ArrowUp') ? 1 : 0) - (this.keys.has('KeyS') || this.keys.has('ArrowDown') ? 1 : 0);
      if (kx || kz) {
        const dist = this.camera.position.distanceTo(this.orbit.target);
        const fwd = _v.subVectors(this.orbit.target, this.camera.position).setY(0).normalize();
        const right = new THREE.Vector3(-fwd.z, 0, fwd.x);
        const step = dist * 0.9 * dt;
        const move = new THREE.Vector3().addScaledVector(fwd, kz * step).addScaledVector(right, kx * step);
        this.orbit.target.add(move);
        this.camera.position.add(move);
      }
      this.orbit.update();
      // keep the target on the map and the camera above ground
      const t = this.orbit.target;
      const off = _v.subVectors(t, w.centre).setY(0);
      if (off.length() > w.radius) {
        off.setLength(w.radius);
        const nx = w.centre.x + off.x;
        const nz = w.centre.z + off.z;
        this.camera.position.x += nx - t.x;
        this.camera.position.z += nz - t.z;
        t.x = nx;
        t.z = nz;
      }
      const floor = w.groundHeight(this.camera.position.x, this.camera.position.z) + 1.5;
      if (this.camera.position.y < floor) this.camera.position.y = floor;
      return;
    }

    // --- walk and drone share looking and the input vector
    const lookX = (this.keys.has('ArrowRight') ? 1 : 0) - (this.keys.has('ArrowLeft') ? 1 : 0);
    const lookY = (this.keys.has('ArrowUp') ? 1 : 0) - (this.keys.has('ArrowDown') ? 1 : 0);
    if (lookX) this.yaw -= lookX * 1.9 * dt;
    if (lookY) this.pitch = Math.max(-1.45, Math.min(1.45, this.pitch + lookY * 1.3 * dt));

    let mx = (this.keys.has('KeyD') ? 1 : 0) - (this.keys.has('KeyA') ? 1 : 0) + this.input.stick.x;
    let mz = (this.keys.has('KeyW') ? 1 : 0) - (this.keys.has('KeyS') ? 1 : 0) + this.input.stick.y;
    const mlen = Math.hypot(mx, mz);
    if (mlen > 1) {
      mx /= mlen;
      mz /= mlen;
    }
    const fast = this.keys.has('ShiftLeft') || this.keys.has('ShiftRight') || this.input.run;

    _e.set(this.pitch, this.yaw, 0, 'YXZ');
    this.camera.quaternion.setFromEuler(_e);
    const sinY = Math.sin(this.yaw);
    const cosY = Math.cos(this.yaw);
    const pos = this.camera.position;
    const want = new THREE.Vector3();

    if (this.mode === 'walk') {
      const speed = fast ? RUN_SPEED : WALK_SPEED;
      want.set((-sinY * mz + cosY * mx) * speed, 0, (-cosY * mz - sinY * mx) * speed);
      this.vel.lerp(want, 1 - Math.exp(-12 * dt));
      pos.x += this.vel.x * dt;
      pos.z += this.vel.z * dt;
      this.resolve(pos);
      this.clampToWorld(pos, w);
      const gy = w.groundHeight(pos.x, pos.z, pos.y - EYE) + EYE;
      pos.y += (gy - pos.y) * (1 - Math.exp(-14 * dt));
    } else {
      const speed = fast ? DRONE_FAST : DRONE_SPEED;
      const fwd = new THREE.Vector3(0, 0, -1).applyQuaternion(this.camera.quaternion);
      const right = new THREE.Vector3(cosY, 0, -sinY);
      const vy =
        (this.keys.has('Space') || this.keys.has('KeyE') || this.input.up ? 1 : 0) -
        (this.keys.has('KeyQ') || this.keys.has('KeyC') || this.input.down ? 1 : 0);
      want.addScaledVector(fwd, mz * speed).addScaledVector(right, mx * speed);
      want.y += vy * speed * 0.7;
      this.vel.lerp(want, 1 - Math.exp(-6 * dt));
      pos.addScaledVector(this.vel, dt);
      this.clampToWorld(pos, w);
      const floor = w.groundHeight(pos.x, pos.z) + 1.6;
      if (pos.y < floor) pos.y = floor;
      if (pos.y > 420) pos.y = 420;
    }
  }

  private clampToWorld(pos: THREE.Vector3, w: Walkable) {
    const dx = pos.x - w.centre.x;
    const dz = pos.z - w.centre.z;
    const d = Math.hypot(dx, dz);
    const max = w.radius * 1.35;
    if (d > max) {
      pos.x = w.centre.x + (dx / d) * max;
      pos.z = w.centre.z + (dz / d) * max;
    }
  }

  /** A ray for picking: through `ndc`, or straight ahead when ndc is null. */
  pickRay(ndc: THREE.Vector2 | null, raycaster: THREE.Raycaster) {
    raycaster.setFromCamera(ndc ?? new THREE.Vector2(0, 0), this.camera);
  }

  dispose() {
    for (const d of this.disposers) d();
    this.orbit.dispose();
  }
}
