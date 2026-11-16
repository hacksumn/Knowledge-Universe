import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ForceGraph3D, { type ForceGraphMethods } from 'react-force-graph-3d';
import * as THREE from 'three';
import SpriteText from 'three-spritetext';
import { ArrowUpRight, BookOpen, Bookmark, Check, ChevronLeft, ChevronRight, Home, List as ListIcon, Orbit, Pause, Play } from 'lucide-react';
import { continents, continentById, pathways, pathwaysIn, type ContinentId, type Pathway } from './catalogue';
import { buildMapGraph, subjectPosition, nodeId, HUB_ID, GLOBE_RADIUS, type Expansion, type MapNodeSpec, type MapLinkSpec } from './mapGraph';

type MapNode = MapNodeSpec & { x?: number; y?: number; z?: number; fx?: number; fy?: number; fz?: number };
type MapLink = Omit<MapLinkSpec, 'source' | 'target'> & { source: string | MapNode; target: string | MapNode };
type Focus = { kind: 'none' } | { kind: 'subject'; id: ContinentId } | { kind: 'pathway'; id: string } | { kind: 'lesson'; pathway: string; id: string };

export type MapViewProps = {
  saved: string[];
  onToggleSave: (pathwayId: string) => void;
  onOpenPathway: (p: Pathway, lessonId?: string) => void;
  onShowList: () => void;
};

const reducedMotion = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
const pathwayById = Object.fromEntries(pathways.map(p => [p.id, p]));
const idOf = (v: string | MapNode) => (typeof v === 'string' ? v : v.id);
const escapeHtml = (s: string) => s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));

// ── Shared textures and scenery ────────────────────────────────────────────
let glowTexture: THREE.Texture | null = null;
function glow(): THREE.Texture {
  if (glowTexture) return glowTexture;
  const c = document.createElement('canvas'); c.width = c.height = 128;
  const g = c.getContext('2d')!;
  const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  grad.addColorStop(0, 'rgba(255,255,255,1)'); grad.addColorStop(.25, 'rgba(255,255,255,.45)'); grad.addColorStop(.6, 'rgba(255,255,255,.08)'); grad.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = grad; g.fillRect(0, 0, 128, 128);
  glowTexture = new THREE.CanvasTexture(c);
  return glowTexture;
}
function glowSprite(color: string, size: number, opacity: number) {
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glow(), color, transparent: true, opacity, blending: THREE.AdditiveBlending, depthWrite: false }));
  s.scale.set(size, size, 1);
  return s;
}
// Deterministic pseudo-random numbers so the scene looks the same on every visit.
function rng(seed: number) { return () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296); }
function makeSky() {
  const group = new THREE.Group();
  const rand = rng(42), n = 3200, pos = new Float32Array(n * 3), col = new Float32Array(n * 3);
  const tints = [new THREE.Color('#ffffff'), new THREE.Color('#cfd8ff'), new THREE.Color('#b9c8ff'), new THREE.Color('#e4dcff')];
  for (let i = 0; i < n; i++) {
    const u = rand() * 2 - 1, t = rand() * Math.PI * 2, r = 2700 + rand() * 3200, s = Math.sqrt(1 - u * u);
    pos.set([Math.cos(t) * s * r, u * r, Math.sin(t) * s * r], i * 3);
    const c = tints[Math.floor(rand() * tints.length)].clone().multiplyScalar(.45 + rand() * .55);
    col.set([c.r, c.g, c.b], i * 3);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  group.add(new THREE.Points(geo, new THREE.PointsMaterial({ size: 1.7, sizeAttenuation: false, vertexColors: true, transparent: true, opacity: .95, depthWrite: false })));
  // Deep-blue space clouds behind the globe.
  const nebulae: [string, number, number, number, number, number][] = [['#2b4dff', -1700, 800, -2500, 3600, .22], ['#1d8fff', 2000, -900, -2300, 3000, .18], ['#5b3cff', 300, 1500, -2800, 2600, .16], ['#2a6bff', -2200, -1300, 1500, 2800, .14], ['#ff4fb8', 2300, 1300, 1200, 1800, .07]];
  for (const [color, x, y, z, size, o] of nebulae) { const s = glowSprite(color, size, o); s.position.set(x, y, z); group.add(s); }
  return group;
}

// ── The glowing globe: rim-lit shell, a web of points and lines, nebula inside ──
const WEB_COLORS = ['#ff6ad5', '#c08bff', '#8f7cff', '#7fb8ff', '#ffffff'].map(c => new THREE.Color(c));
function makeGlobe(R: number) {
  const group = new THREE.Group();
  const rand = rng(7);
  // Shell: brighter toward the edge (fresnel), pink at the top-right fading to violet.
  group.add(new THREE.Mesh(new THREE.SphereGeometry(R, 96, 64), new THREE.ShaderMaterial({
    uniforms: { pink: { value: new THREE.Color('#ff5fd2') }, violet: { value: new THREE.Color('#7f5cff') }, radius: { value: R } },
    vertexShader: 'varying vec3 vN; varying vec3 vV; varying vec3 vP; void main(){ vec4 mv = modelViewMatrix * vec4(position, 1.0); vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz); vP = position; gl_Position = projectionMatrix * mv; }',
    fragmentShader: 'uniform vec3 pink; uniform vec3 violet; uniform float radius; varying vec3 vN; varying vec3 vV; varying vec3 vP; void main(){ float f = pow(1.0 - abs(dot(vN, vV)), 2.4); vec3 c = mix(violet, pink, smoothstep(-0.6, 0.9, (vP.y * 0.7 + vP.x * 0.5) / radius)); gl_FragColor = vec4(c, f * 0.9 + 0.025); }',
    transparent: true, blending: THREE.AdditiveBlending, depthWrite: false,
  })));
  group.add(new THREE.Mesh(new THREE.SphereGeometry(R * .99, 64, 48), new THREE.MeshBasicMaterial({ color: '#5a2fd0', transparent: true, opacity: .07, side: THREE.BackSide, blending: THREE.AdditiveBlending, depthWrite: false })));

  // Web points: most on the surface, some inside.
  const surface = 420, inner = 170, total = surface + inner;
  const pts: THREE.Vector3[] = [];
  for (let i = 0; i < surface; i++) {
    const y = 1 - ((i + .5) / surface) * 2, r = Math.sqrt(1 - y * y), t = i * Math.PI * (3 - Math.sqrt(5));
    const v = new THREE.Vector3(Math.cos(t) * r, y, Math.sin(t) * r).add(new THREE.Vector3(rand() - .5, rand() - .5, rand() - .5).multiplyScalar(.09)).normalize().multiplyScalar(R);
    pts.push(v);
  }
  for (let i = 0; i < inner; i++) {
    const v = new THREE.Vector3(rand() * 2 - 1, rand() * 2 - 1, rand() * 2 - 1); if (v.lengthSq() > 1) { i--; continue; }
    pts.push(v.multiplyScalar(R * .93));
  }
  const pos = new Float32Array(total * 3), col = new Float32Array(total * 3), colors: THREE.Color[] = [];
  pts.forEach((v, i) => { const c = WEB_COLORS[Math.floor(rand() * WEB_COLORS.length)].clone().multiplyScalar(.55 + rand() * .45); colors.push(c); pos.set([v.x, v.y, v.z], i * 3); col.set([c.r, c.g, c.b], i * 3); });
  const pgeo = new THREE.BufferGeometry();
  pgeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  pgeo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  group.add(new THREE.Points(pgeo, new THREE.PointsMaterial({ size: 9, map: glow(), vertexColors: true, transparent: true, opacity: .9, blending: THREE.AdditiveBlending, depthWrite: false })));

  // Lines to nearest neighbours (3 for surface points, 2 for inner points), de-duplicated.
  const seen = new Set<string>(), seg: number[] = [], segCol: number[] = [];
  pts.forEach((a, i) => {
    const k = i < surface ? 3 : 2;
    const near = pts.map((b, j) => [j, a.distanceToSquared(b)] as const).filter(([j]) => j !== i).sort((x, y) => x[1] - y[1]).slice(0, k);
    for (const [j] of near) {
      const key = i < j ? `${i}-${j}` : `${j}-${i}`; if (seen.has(key)) continue; seen.add(key);
      const b = pts[j]; seg.push(a.x, a.y, a.z, b.x, b.y, b.z);
      segCol.push(colors[i].r, colors[i].g, colors[i].b, colors[j].r, colors[j].g, colors[j].b);
    }
  });
  const lgeo = new THREE.BufferGeometry();
  lgeo.setAttribute('position', new THREE.Float32BufferAttribute(seg, 3));
  lgeo.setAttribute('color', new THREE.Float32BufferAttribute(segCol, 3));
  group.add(new THREE.LineSegments(lgeo, new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: .3, blending: THREE.AdditiveBlending, depthWrite: false })));

  // Nebula clouds and a few bright sparkles inside the globe.
  const cloud = ['#ff4fd8', '#a35cff', '#ffb8f0', '#6a5cff', '#ff8ae6', '#4f7dff'];
  for (let i = 0; i < 20; i++) {
    const v = new THREE.Vector3(rand() * 2 - 1, rand() * 2 - 1, rand() * 2 - 1).normalize().multiplyScalar(R * (.15 + rand() * .55));
    const s = glowSprite(cloud[i % cloud.length], R * (.45 + rand() * .65), .11 + rand() * .12); s.position.copy(v); group.add(s);
  }
  for (let i = 0; i < 22; i++) {
    const v = pts[Math.floor(rand() * surface)];
    const s = glowSprite(rand() > .5 ? '#ffffff' : '#ffb3ef', 9 + rand() * 15, .4 + rand() * .3); s.position.copy(v); group.add(s);
  }
  return group;
}

// ── Node visuals: glowing stars, brightest for subjects ─────────────────────
function label(text: string, height: number, color: string, y: number) {
  const s = new SpriteText(text, height, color);
  s.fontFace = 'Inter, system-ui, -apple-system, Segoe UI, sans-serif';
  s.fontWeight = '600';
  s.strokeWidth = 1.2;
  s.strokeColor = '#12082a';
  s.material.depthWrite = false;
  s.position.y = y;
  return s;
}
function star(color: THREE.Color, core: number, halo: number, opacity: number) {
  const g = new THREE.Group();
  g.add(new THREE.Mesh(new THREE.SphereGeometry(core, 20, 16), new THREE.MeshBasicMaterial({ color: color.clone().lerp(new THREE.Color('#ffffff'), .6), transparent: opacity < 1, opacity })));
  g.add(glowSprite('#' + color.getHexString(), halo, .9 * opacity), glowSprite('#ffffff', halo * .32, .85 * opacity));
  return g;
}
function makeNodeObject(n: MapNode, opts: { focused: boolean; dim: boolean; scale: number }) {
  const k = opts.scale;
  const g = new THREE.Group();
  const color = new THREE.Color(n.color);
  const fade = opts.dim ? .45 : 1;
  if (n.kind === 'hub') {
    g.add(star(new THREE.Color('#d9ccff'), 8 * k, 150 * k, 1));
  } else if (n.kind === 'subject') {
    g.add(star(color, 8.5 * k, 125 * k, fade));
    g.add(label(n.label, 12.5 * k, opts.dim ? '#b7b3cf' : '#ffffff', -26 * k));
  } else if (n.kind === 'pathway') {
    g.add(star(color, 4, 40, 1));
    g.add(label(n.label, 5.5, '#f1ecff', -13));
  } else {
    g.add(star(color, 2.2, 20, 1));
    g.add(label(n.label, 3.3, '#e6e0f7', -7.5));
  }
  if (opts.focused && n.kind !== 'hub') {
    // A ring lying on the globe's surface around the focused point.
    const r = n.kind === 'subject' ? 24 * k : n.kind === 'pathway' ? 12 : 6.5;
    const ring = new THREE.Mesh(new THREE.TorusGeometry(r, n.kind === 'lesson' ? .3 : .55, 8, 72), new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: .85 }));
    const out = new THREE.Vector3(n.x ?? 0, n.y ?? 0, n.z ?? 0);
    if (out.lengthSq() > 1) ring.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), out.normalize());
    g.add(ring);
  }
  return g;
}

// ── Component ──────────────────────────────────────────────────────────────
export default function MapView({ saved, onToggleSave, onOpenPathway, onShowList }: MapViewProps) {
  const wrap = useRef<HTMLDivElement>(null);
  const fg = useRef<ForceGraphMethods<MapNode, MapLink> | undefined>(undefined);
  const cache = useRef(new Map<string, MapNode>());
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [expansion, setExpansion] = useState<Expansion>({ subject: null, pathway: null });
  const [focus, setFocus] = useState<Focus>({ kind: 'none' });
  const expandedPathway = useRef<string | null>(null);
  expandedPathway.current = expansion.pathway ? nodeId.pathway(expansion.pathway) : null;
  const [spin, setSpin] = useState(!reducedMotion);
  const [webgl] = useState(() => { try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch { return false; } });

  // Build graph data, reusing node objects so the simulation keeps their positions.
  const data = useMemo(() => {
    const { nodes, links } = buildMapGraph(expansion);
    const visible = new Set(nodes.map(n => n.id));
    for (const id of [...cache.current.keys()]) if (!visible.has(id)) cache.current.delete(id);
    const siblings = new Map<string, number>();
    const out = nodes.map(spec => {
      let n = cache.current.get(spec.id);
      if (!n) {
        n = { ...spec };
        if (spec.kind === 'hub') { n.x = n.fx = 0; n.y = n.fy = 0; n.z = n.fz = 0; }
        else if (spec.kind === 'subject') { const p = subjectPosition(continents.findIndex(c => nodeId.subject(c.id) === spec.id)); n.x = n.fx = p.x; n.y = n.fy = p.y; n.z = n.fz = p.z; }
        else {
          // Children start on the globe's surface in a small ring around their parent; the simulation then spreads them.
          const parent = cache.current.get(spec.parent!)!;
          const k = siblings.get(spec.parent!) ?? 0; siblings.set(spec.parent!, k + 1);
          const out = new THREE.Vector3(parent.x ?? 0, parent.y ?? 0, parent.z ?? 0); if (out.lengthSq() < 1) out.set(0, 0, 1); out.normalize();
          const t1 = new THREE.Vector3().crossVectors(out, Math.abs(out.y) > .95 ? new THREE.Vector3(1, 0, 0) : new THREE.Vector3(0, 1, 0)).normalize();
          const t2 = new THREE.Vector3().crossVectors(out, t1);
          const a = k * 2.4, d = spec.kind === 'pathway' ? 45 : 22;
          const v = new THREE.Vector3(parent.x ?? 0, parent.y ?? 0, parent.z ?? 0).addScaledVector(t1, Math.cos(a) * d).addScaledVector(t2, Math.sin(a) * d).setLength(GLOBE_RADIUS);
          n.x = v.x; n.y = v.y; n.z = v.z;
        }
        cache.current.set(spec.id, n);
      }
      return n;
    });
    return { nodes: out, links: links.map(l => ({ ...l })) as MapLink[] };
  }, [expansion]);

  // Size tracking.
  useEffect(() => {
    const el = wrap.current; if (!el) return;
    const ro = new ResizeObserver(([e]) => setSize({ width: Math.round(e.contentRect.width), height: Math.round(e.contentRect.height) }));
    ro.observe(el); return () => ro.disconnect();
  }, []);

  const mobile = size.width < 700;
  const overviewDistance = mobile ? 1800 : size.width < 1100 ? 1120 : 1000;
  // Move camera and target together so the focus point sits in the middle of the area the panel leaves free:
  // left of the side panel on desktop, above the bottom sheet on phones.
  const flyingUntil = useRef(0);
  const moveCamera = useCallback((cam: THREE.Vector3, target: THREE.Vector3, ms: number) => {
    const api = fg.current; if (!api) return;
    flyingUntil.current = Date.now() + (reducedMotion ? 0 : ms) + 150;
    const camera = api.camera() as THREE.PerspectiveCamera;
    const dist = cam.distanceTo(target);
    const worldPerPx = (2 * dist * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2))) / Math.max(size.height, 1);
    const forward = target.clone().sub(cam).normalize();
    const right = forward.clone().cross(new THREE.Vector3(0, 1, 0)).normalize();
    const up = right.clone().cross(forward).normalize();
    const shift = mobile ? up.multiplyScalar(-(size.height * .42) / 2 * worldPerPx) : right.multiplyScalar((size.width >= 950 ? 360 : 320) / 2 * worldPerPx);
    const c = cam.clone().add(shift), t = target.clone().add(shift);
    api.cameraPosition({ x: c.x, y: c.y, z: c.z }, { x: t.x, y: t.y, z: t.z }, reducedMotion ? 0 : ms);
  }, [mobile, size.width, size.height]);
  const overview = useCallback((ms = 1200) => {
    moveCamera(new THREE.Vector3(0, overviewDistance * .12, overviewDistance), new THREE.Vector3(0, 0, 0), ms);
  }, [overviewDistance, moveCamera]);

  // One-time scene setup: sky, forces, controls.
  useEffect(() => {
    if (!webgl) return;
    let frame = 0, sky: THREE.Group | null = null, globe: THREE.Group | null = null, cancelled = false;
    const setup = () => {
      const api = fg.current;
      if (!api) { if (!cancelled) frame = requestAnimationFrame(setup); return; }
      sky = makeSky(); api.scene().add(sky);
      globe = makeGlobe(GLOBE_RADIUS); api.scene().add(globe);
      api.d3Force('center', null);
      // Hold pathways and lessons on the globe's surface, like points on a planet.
      let simNodes: MapNode[] = [];
      type Moving = MapNode & { vx?: number; vy?: number; vz?: number };
      const shell = Object.assign((alpha: number) => {
        for (const n of simNodes as Moving[]) {
          if (n.kind !== 'pathway' && n.kind !== 'lesson') continue;
          const x = n.x ?? 0, y = n.y ?? 0, z = n.z ?? 0, len = Math.hypot(x, y, z) || 1;
          const k = ((GLOBE_RADIUS - len) / len) * .6 * alpha;
          n.vx = (n.vx ?? 0) + x * k; n.vy = (n.vy ?? 0) + y * k; n.vz = (n.vz ?? 0) + z * k;
        }
      }, { initialize: (nodes: MapNode[]) => { simNodes = nodes; } });
      api.d3Force('shell', shell as never);
      api.d3Force('charge')?.strength((n: MapNode) => n.kind === 'lesson' ? -45 : -90);
      api.d3Force('link')?.distance((l: MapLink) => l.kind === 'lesson' ? 48 : l.kind === 'pathway' ? (idOf(l.target) === expandedPathway.current ? 130 : 85) : GLOBE_RADIUS).strength((l: MapLink) => l.kind === 'subject' ? 0 : 1);
      const controls = api.controls() as unknown as { autoRotateSpeed: number; minDistance: number; maxDistance: number; enableDamping: boolean; addEventListener: (t: string, f: () => void) => void };
      controls.autoRotateSpeed = .35; controls.minDistance = 30; controls.maxDistance = 2600; controls.enableDamping = true;
      controls.addEventListener('start', () => setSpin(false));
      api.camera().position.set(0, -overviewDistance * .5, overviewDistance * 1.9);
      const drift = () => { if (sky) sky.rotation.y += .00006; frame = requestAnimationFrame(drift); };
      if (!reducedMotion) frame = requestAnimationFrame(drift);
    };
    frame = requestAnimationFrame(setup);
    return () => { cancelled = true; cancelAnimationFrame(frame); if (sky) fg.current?.scene().remove(sky); if (globe) fg.current?.scene().remove(globe); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [webgl]);

  const framed = useRef(false);
  useEffect(() => { if (!framed.current && size.width > 0 && fg.current) { framed.current = true; overview(reducedMotion ? 0 : 2200); } }, [size, overview]);

  useEffect(() => { const c = fg.current?.controls() as unknown as { autoRotate: boolean } | undefined; if (c) c.autoRotate = spin; }, [spin, data]);

  const flyTo = useCallback((n: MapNode, distance: number, delay = 0) => {
    const go = () => {
      const p = new THREE.Vector3(n.x ?? 0, n.y ?? 0, n.z ?? 0);
      // Approach from outside the globe, straight down onto the point.
      const dir = p.lengthSq() < 1 ? new THREE.Vector3(0, .12, 1).normalize() : p.clone().normalize();
      const cam = p.clone().add(dir.multiplyScalar(mobile ? distance * 1.45 : distance));
      moveCamera(cam, p, 1300);
    };
    if (delay && !reducedMotion) setTimeout(go, delay); else go();
  }, [mobile, moveCamera]);

  // ── Actions (shared by clicks in the scene and the side panel) ──
  const reset = useCallback(() => { setExpansion({ subject: null, pathway: null }); setFocus({ kind: 'none' }); overview(); }, [overview]);
  const openSubject = useCallback((id: ContinentId) => {
    setSpin(false);
    setExpansion({ subject: id, pathway: null }); setFocus({ kind: 'subject', id });
    const n = cache.current.get(nodeId.subject(id)); if (n) flyTo(n, 430);
  }, [flyTo]);
  const openPathway = useCallback((id: string) => {
    const p = pathwayById[id]; if (!p) return;
    setSpin(false);
    setExpansion({ subject: p.continent, pathway: id }); setFocus({ kind: 'pathway', id });
    // The pathway node may be new (opened from the panel), so let the simulation place it before flying.
    const existing = cache.current.get(nodeId.pathway(id));
    setTimeout(() => { const n = cache.current.get(nodeId.pathway(id)); if (n) flyTo(n, 270); }, existing ? 450 : 800);
  }, [flyTo]);
  // Hovering a subject expands it in place after a short pause, so sweeping across the globe doesn't flicker.
  const hoverTimer = useRef<number | undefined>(undefined);
  // Only real mouse movement over the globe counts: not touch, not a stale pointer while the camera moves or drifts.
  const pointer = useRef({ overCanvas: false, mouse: false, movedAt: 0 });
  const hoverAllowed = () => pointer.current.overCanvas && pointer.current.mouse && Date.now() - pointer.current.movedAt < 500 && Date.now() > flyingUntil.current;
  const expandOnHover = useCallback((id: ContinentId) => {
    if (expansion.subject === id) return;
    setSpin(false);
    setExpansion({ subject: id, pathway: null }); setFocus({ kind: 'subject', id });
  }, [expansion.subject]);
  useEffect(() => () => window.clearTimeout(hoverTimer.current), []);
  const openLesson = useCallback((pathwayId: string, lessonId: string) => {
    setFocus({ kind: 'lesson', pathway: pathwayId, id: lessonId });
    onOpenPathway(pathwayById[pathwayId], lessonId);
  }, [onOpenPathway]);

  const onNodeClick = useCallback((n: MapNode) => {
    if (n.kind === 'hub') return reset();
    if (n.kind === 'subject') {
      window.clearTimeout(hoverTimer.current);
      return openSubject(n.id.slice(2) as ContinentId);
    }
    if (n.kind === 'pathway') {
      const id = n.id.slice(2);
      if (expansion.pathway === id) { setExpansion({ ...expansion, pathway: null }); setFocus({ kind: 'pathway', id }); return; }
      return openPathway(id);
    }
    const lessonId = n.id.slice(2);
    openLesson(lessonId.split('/')[0], lessonId);
  }, [expansion, reset, openSubject, openPathway, openLesson]);

  const focusedNodeId = focus.kind === 'subject' ? nodeId.subject(focus.id) : focus.kind === 'pathway' ? nodeId.pathway(focus.id) : focus.kind === 'lesson' ? nodeId.lesson(focus.id) : focus.kind === 'none' ? HUB_ID : null;
  const nodeObject = useCallback((n: MapNode) => makeNodeObject(n, {
    focused: n.id === focusedNodeId && n.kind !== 'hub',
    dim: !!expansion.subject && n.kind === 'subject' && n.id !== nodeId.subject(expansion.subject),
    scale: mobile && (n.kind === 'subject' || n.kind === 'hub') ? 1.6 : 1,
  }), [focusedNodeId, expansion.subject, mobile]);

  const linkColor = useCallback((l: MapLink) => {
    if (l.kind === 'subject') { const sid = idOf(l.target); const lit = !expansion.subject || sid === nodeId.subject(expansion.subject); return lit ? 'rgba(255,150,235,0.32)' : 'rgba(200,160,255,0.10)'; }
    const c = new THREE.Color((cache.current.get(idOf(l.target))?.color) ?? '#ffffff');
    return `rgba(${Math.round(c.r * 255)},${Math.round(c.g * 255)},${Math.round(c.b * 255)},${l.kind === 'pathway' ? .65 : .45})`;
  }, [expansion.subject]);

  // ── Side panel content ──
  const subject = focus.kind === 'subject' ? continentById[focus.id] : focus.kind === 'pathway' ? continentById[pathwayById[focus.id].continent] : focus.kind === 'lesson' ? continentById[pathwayById[focus.pathway].continent] : null;
  const pathway = focus.kind === 'pathway' ? pathwayById[focus.id] : focus.kind === 'lesson' ? pathwayById[focus.pathway] : null;

  if (!webgl) return <div className="map-fallback"><Orbit size={40} /><h2>3D map unavailable</h2><p>Your browser could not start WebGL. Turn on hardware acceleration or use the list view.</p><button className="primary" onClick={onShowList}>Open list view <ArrowUpRight size={16} /></button></div>;

  return <div className="map-view" ref={wrap}
    onPointerMove={e => { pointer.current = { overCanvas: (e.target as HTMLElement).tagName === 'CANVAS', mouse: e.pointerType === 'mouse', movedAt: Date.now() }; }}
    onPointerLeave={() => { pointer.current.overCanvas = false; window.clearTimeout(hoverTimer.current); }}
    onPointerDown={e => { if (e.pointerType !== 'mouse') pointer.current.mouse = false; }}>
    {size.width > 0 && <ForceGraph3D<MapNode, MapLink>
      ref={fg}
      width={size.width}
      height={size.height}
      graphData={data}
      controlType="orbit"
      backgroundColor="#040611"
      showNavInfo={false}
      rendererConfig={{ antialias: true, alpha: false }}
      nodeId="id"
      nodeThreeObject={nodeObject}
      nodeLabel={(n: MapNode) => `<div class="map-tooltip"><span style="background:${n.color}"></span>${escapeHtml(n.label)}</div>`}
      onNodeClick={onNodeClick}
      onNodeHover={(n: MapNode | null) => {
        if (wrap.current) wrap.current.style.cursor = n ? 'pointer' : 'grab';
        window.clearTimeout(hoverTimer.current);
        if (n?.kind === 'subject' && hoverAllowed()) { const id = n.id.slice(2) as ContinentId; hoverTimer.current = window.setTimeout(() => { if (pointer.current.overCanvas && Date.now() > flyingUntil.current) expandOnHover(id); }, 280); }
      }}
      enableNodeDrag={false}
      linkColor={linkColor}
      linkOpacity={1}
      linkWidth={(l: MapLink) => l.kind === 'pathway' ? .7 : l.kind === 'lesson' ? .35 : 0}
      linkDirectionalParticles={(l: MapLink) => l.kind === 'subject' ? (expansion.subject && idOf(l.target) === nodeId.subject(expansion.subject) ? 3 : 1) : 2}
      linkDirectionalParticleSpeed={(l: MapLink) => l.kind === 'subject' ? .0035 : .007}
      linkDirectionalParticleWidth={(l: MapLink) => l.kind === 'subject' ? 1.8 : 1.2}
      linkDirectionalParticleColor={linkColor}
      d3VelocityDecay={.32}
      cooldownTime={5000}
    />}

    <div className="map-top">
      <nav className="map-crumbs" aria-label="Map location">
        <button onClick={reset}>Universe</button>
        {subject && <><ChevronRight size={13} /><button onClick={() => openSubject(subject.id)} style={{ color: subject.color }}>{subject.name}</button></>}
        {pathway && <><ChevronRight size={13} /><button onClick={() => openPathway(pathway.id)}>{pathway.title}</button></>}
      </nav>
      <p className="map-hint">Hover a subject to expand it · Click to fly in · Drag to orbit · Scroll to zoom</p>
    </div>

    <div className="map-controls">
      <button className="icon-button" title="Back to the whole universe" aria-label="Back to the whole universe" onClick={reset}><Home size={17} /></button>
      <button className="icon-button" title={spin ? 'Stop drifting' : 'Drift slowly'} aria-label={spin ? 'Stop auto-rotation' : 'Start auto-rotation'} aria-pressed={spin} onClick={() => setSpin(s => !s)}>{spin ? <Pause size={16} /> : <Play size={16} />}</button>
      <button className="icon-button" title="List view" aria-label="Switch to list view" onClick={onShowList}><ListIcon size={17} /></button>
    </div>

    <aside className="map-panel" style={{ '--accent': subject?.color ?? '#a495ff' } as React.CSSProperties} aria-live="polite">
      {!subject && <>
        <div className="eyebrow">THE KNOWLEDGE UNIVERSE</div>
        <h2>Pick a subject.</h2>
        <p className="map-panel-text">Each bright point on the globe is a subject. {mobile ? 'Tap one to fly in' : 'Hover one to expand it, click to fly in'}, or choose below.</p>
        <ul className="map-list">{continents.map(c => <li key={c.id}><button onClick={() => openSubject(c.id)}><span className="color-dot" style={{ background: c.color }} /><span>{c.name}<small>{pathwaysIn(c.id).length} pathways</small></span><ChevronRight size={15} /></button></li>)}</ul>
      </>}
      {subject && !pathway && <>
        <button className="map-back" onClick={reset}><ChevronLeft size={14} /> All subjects</button>
        <div className="eyebrow" style={{ color: subject.color }}>{subject.tagline.toUpperCase()}</div>
        <h2>{subject.name}</h2>
        <p className="map-panel-text">{subject.description}</p>
        <ul className="map-list">{pathwaysIn(subject.id).map(p => <li key={p.id}><button onClick={() => openPathway(p.id)}><span className="color-dot" /><span>{p.title}<small>{p.lessons.length} lessons</small></span><ChevronRight size={15} /></button></li>)}</ul>
      </>}
      {subject && pathway && <>
        <button className="map-back" onClick={() => openSubject(subject.id)}><ChevronLeft size={14} /> {subject.name}</button>
        <div className="eyebrow" style={{ color: subject.color }}>LEARNING PATHWAY</div>
        <h2>{pathway.title}</h2>
        <p className="map-panel-text">{pathway.description}</p>
        <ol className="map-list numbered">{pathway.lessons.map((l, i) => <li key={l.id}><button className={focus.kind === 'lesson' && focus.id === l.id ? 'active' : ''} onClick={() => openLesson(pathway.id, l.id)}><span className="map-num">{String(i + 1).padStart(2, '0')}</span><span>{l.title}</span><BookOpen size={14} /></button></li>)}</ol>
        <div className="map-actions">
          <button className="primary" onClick={() => onOpenPathway(pathway)}>Start pathway <ArrowUpRight size={15} /></button>
          <button className="map-save" onClick={() => onToggleSave(pathway.id)} aria-pressed={saved.includes(pathway.id)}>{saved.includes(pathway.id) ? <><Check size={15} /> Saved</> : <><Bookmark size={15} /> Save</>}</button>
        </div>
      </>}
    </aside>
  </div>;
}
