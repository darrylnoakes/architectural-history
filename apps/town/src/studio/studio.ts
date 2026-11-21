import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { createRenderer, createRig, type Rig } from '@ah/engine';
import { stageSubject, type Staged, type Subject } from './subject';

interface Pane {
  el: HTMLElement;
  rig: Rig;
  controls: OrbitControls;
  staged: Staged | null;
  key: string;
  /** 0..1 while a newly shown building rises into place. */
  rise: number;
  framed: boolean;
}

/**
 * One canvas, one WebGL context, any number of panes. Each pane is an ordinary element on the page;
 * the studio draws a building into the part of the canvas that lies behind it and lets you turn it
 * round. Used for the single-building viewer (one pane) and the compare view (two).
 */
export class Studio {
  private renderer: THREE.WebGLRenderer;
  private panes: Pane[] = [];
  private raf = 0;
  private last = performance.now();

  constructor(private canvas: HTMLCanvasElement) {
    this.renderer = createRenderer(canvas, { maxPixelRatio: 2 });
    this.renderer.setScissorTest(true);
    this.loop();
  }

  /** Tell the studio which elements are panes. Call again whenever the set of elements changes. */
  setPanes(els: HTMLElement[]) {
    for (const p of this.panes) {
      if (els.includes(p.el)) continue;
      p.controls.dispose();
      p.staged?.dispose();
    }
    this.panes = els.map((el) => {
      const old = this.panes.find((p) => p.el === el);
      if (old) return old;
      const rig = createRig(this.renderer, { shadowExtent: 70, shadowMapSize: 2048, fog: false });
      const controls = new OrbitControls(rig.camera, el);
      controls.enableDamping = true;
      controls.dampingFactor = 0.09;
      controls.enablePan = false;
      controls.maxPolarAngle = Math.PI * 0.49;
      controls.minPolarAngle = 0.15;
      controls.rotateSpeed = 0.6;
      controls.zoomSpeed = 0.8;
      rig.camera.position.set(30, 22, 38);
      return { el, rig, controls, staged: null, key: '', rise: 1, framed: false };
    });
  }

  /** Show a building in a pane. The viewing angle is kept when the building changes. */
  show(index: number, subject: Subject | null) {
    const p = this.panes[index];
    if (!p) return;
    const key = subject ? `${subject.lineage.id}/${subject.def.id}/${subject.seed}` : '';
    if (key === p.key) return;
    p.key = key;
    if (p.staged) {
      p.rig.scene.remove(p.staged.group);
      p.staged.dispose();
      p.staged = null;
    }
    if (!subject) return;
    const staged = stageSubject(subject);
    p.staged = staged;
    p.rig.scene.add(staged.group);
    p.rig.setShadowCentre(staged.centre.x, staged.centre.z);
    p.rise = 0;

    // keep the angle the viewer chose; only the distance and the point looked at change
    const cam = p.rig.camera;
    const dir = cam.position.clone().sub(p.controls.target);
    if (dir.lengthSq() < 1e-6 || !p.framed) dir.set(0.62, 0.42, 0.78);
    dir.normalize();
    p.framed = true;
    const rect = p.el.getBoundingClientRect();
    const aspect = rect.width / Math.max(1, rect.height);
    const fov = (cam.fov * Math.PI) / 180;
    const fit = aspect < 1 ? 1 / aspect : 1;
    const dist = (staged.radius * 1.15 * fit) / Math.sin(fov / 2);
    p.controls.target.copy(staged.centre);
    cam.position.copy(staged.centre).addScaledVector(dir, dist);
    p.controls.minDistance = staged.radius * 0.7;
    p.controls.maxDistance = dist * 2.2;
    p.controls.update();
  }

  private loop = () => {
    this.raf = requestAnimationFrame(this.loop);
    const now = performance.now();
    const dt = Math.min(0.1, (now - this.last) / 1000);
    this.last = now;
    const canvas = this.canvas;
    const cw = canvas.clientWidth;
    const ch = canvas.clientHeight;
    if (!cw || !ch) return;
    const pr = this.renderer.getPixelRatio();
    if (canvas.width !== Math.floor(cw * pr) || canvas.height !== Math.floor(ch * pr)) this.renderer.setSize(cw, ch, false);
    const base = canvas.getBoundingClientRect();
    this.renderer.setScissor(0, 0, cw, ch);
    this.renderer.setViewport(0, 0, cw, ch);
    this.renderer.setClearColor(0xf8f3e8, 1);
    this.renderer.clear();
    for (const p of this.panes) {
      const r = p.el.getBoundingClientRect();
      const w = r.width;
      const h = r.height;
      if (w < 2 || h < 2 || r.bottom < base.top || r.top > base.bottom) continue;
      const x = r.left - base.left;
      const y = base.bottom - r.bottom;
      this.renderer.setViewport(x, y, w, h);
      this.renderer.setScissor(x, y, w, h);
      p.rig.camera.aspect = w / h;
      p.rig.camera.updateProjectionMatrix();
      p.controls.update();
      if (p.staged && p.rise < 1) {
        p.rise = Math.min(1, p.rise + dt / 0.45);
        const k = 1 - Math.pow(1 - p.rise, 3);
        p.staged.group.children[0].scale.y = Math.max(0.001, k);
      }
      this.renderer.render(p.rig.scene, p.rig.camera);
    }
  };

  dispose() {
    cancelAnimationFrame(this.raf);
    for (const p of this.panes) {
      p.controls.dispose();
      p.staged?.dispose();
    }
    this.panes = [];
    this.renderer.dispose();
    this.renderer.forceContextLoss();
  }
}
