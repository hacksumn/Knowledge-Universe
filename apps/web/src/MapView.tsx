import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ForceGraph3D, { type ForceGraphMethods } from 'react-force-graph-3d';
import * as THREE from 'three';
import SpriteText from 'three-spritetext';
import { ArrowUpRight, BookOpen, Bookmark, Check, ChevronLeft, ChevronRight, Home, List as ListIcon, Orbit, Pause, Play } from 'lucide-react';
import { continents, continentById, pathways, pathwaysIn, type ContinentId, type Pathway } from './catalogue';
import { buildMapGraph, subjectPosition, nodeId, HUB_ID, type Expansion, type MapNodeSpec, type MapLinkSpec } from './mapGraph';

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
// Deterministic pseudo-random numbers so the sky looks the same on every visit.
function rng(seed: number) { return () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296); }
function makeSky() {
  const group = new THREE.Group();
  const rand = rng(42), n = 3200, pos = new Float32Array(n * 3), col = new Float32Array(n * 3);
  const tints = [new THREE.Color('#ffffff'), new THREE.Color('#cfd8ff'), new THREE.Color('#e4dcff'), new THREE.Color('#fff1d6')];
  for (let i = 0; i < n; i++) {
    const u = rand() * 2 - 1, t = rand() * Math.PI * 2, r = 2600 + rand() * 3200, s = Math.sqrt(1 - u * u);
    pos.set([Math.cos(t) * s * r, u * r, Math.sin(t) * s * r], i * 3);
    const c = tints[Math.floor(rand() * tints.length)].clone().multiplyScalar(.45 + rand() * .55);
    col.set([c.r, c.g, c.b], i * 3);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  group.add(new THREE.Points(geo, new THREE.PointsMaterial({ size: 1.7, sizeAttenuation: false, vertexColors: true, transparent: true, opacity: .95, depthWrite: false })));
  const nebulae: [string, number, number, number, number][] = [['#7b5cff', -1800, 900, -2600, 3400], ['#2fb7a8', 2100, -700, -2400, 2800], ['#f17fa1', 400, 1500, 2600, 2400], ['#58b9ff', -2300, -1200, 1600, 2600]];
  for (const [color, x, y, z, size] of nebulae) { const s = glowSprite(color, size, .16); s.position.set(x, y, z); group.add(s); }
  return group;
}

// ── Node visuals ───────────────────────────────────────────────────────────
function label(text: string, height: number, color: string, y: number) {
  const s = new SpriteText(text, height, color);
  s.fontFace = 'Inter, system-ui, -apple-system, Segoe UI, sans-serif';
  s.fontWeight = '600';
  s.material.depthWrite = false;
  s.position.y = y;
  return s;
}
function makeNodeObject(n: MapNode, opts: { focused: boolean; dim: boolean; index: number }) {
  const g = new THREE.Group();
  const color = new THREE.Color(n.color);
  const fade = opts.dim ? .35 : 1;
  if (n.kind === 'hub') {
    g.add(new THREE.Mesh(new THREE.SphereGeometry(16, 32, 24), new THREE.MeshBasicMaterial({ color: '#f3f0ff' })));
    g.add(glowSprite('#b9adff', 150, .9), glowSprite('#ffffff', 60, .8));
    g.add(label('Knowledge Universe', 9, '#ece8ff', -34));
  } else if (n.kind === 'subject') {
    const r = 17;
    g.add(new THREE.Mesh(new THREE.SphereGeometry(r, 36, 28), new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: .38, roughness: .55, metalness: .15, transparent: opts.dim, opacity: fade })));
    g.add(glowSprite(n.color, r * 5.2, .55 * fade));
    if (opts.index % 2 === 0) {
      const ring = new THREE.Mesh(new THREE.RingGeometry(r * 1.45, r * 1.85, 64), new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide, transparent: true, opacity: .35 * fade, depthWrite: false }));
      ring.rotation.set(Math.PI / 2.4, .3 * opts.index, 0);
      g.add(ring);
    }
    g.add(label(n.label, 8.5, opts.dim ? '#8d93ad' : '#f1f3fb', -r - 13));
  } else if (n.kind === 'pathway') {
    const r = 6.5;
    g.add(new THREE.Mesh(new THREE.SphereGeometry(r, 24, 18), new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: .5, roughness: .6 })));
    g.add(glowSprite(n.color, r * 5, .5));
    g.add(label(n.label, 4.4, '#e3e6f3', -r - 6.5));
  } else {
    const r = 2.6;
    g.add(new THREE.Mesh(new THREE.OctahedronGeometry(r), new THREE.MeshBasicMaterial({ color: color.clone().lerp(new THREE.Color('#ffffff'), .35) })));
    g.add(glowSprite(n.color, r * 6, .45));
    g.add(label(n.label, 2.7, '#d3d7e8', -r - 3.8));
  }
  if (opts.focused) {
    const r = n.kind === 'subject' ? 26 : n.kind === 'pathway' ? 11 : n.kind === 'lesson' ? 5.5 : 26;
    g.add(new THREE.Mesh(new THREE.TorusGeometry(r, n.kind === 'lesson' ? .25 : .5, 8, 72), new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: .85 })));
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
          // Children start just outside their parent, fanned out away from the hub, then the simulation spreads them.
          const parent = cache.current.get(spec.parent!)!;
          const k = siblings.get(spec.parent!) ?? 0; siblings.set(spec.parent!, k + 1);
          const out = new THREE.Vector3(parent.x ?? 0, parent.y ?? 0, parent.z ?? 0); if (out.lengthSq() < 1) out.set(0, 0, 1); out.normalize();
          const a = k * 2.4, d = spec.kind === 'pathway' ? 30 : 14;
          n.x = (parent.x ?? 0) + out.x * d + Math.cos(a) * d; n.y = (parent.y ?? 0) + out.y * d + Math.sin(a) * d; n.z = (parent.z ?? 0) + out.z * d + Math.sin(a * 1.3) * d;
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
  const overviewDistance = mobile ? 1650 : size.width < 1100 ? 900 : 760;
  // Move camera and target together so the focus point sits in the middle of the area the panel leaves free:
  // left of the side panel on desktop, above the bottom sheet on phones.
  const moveCamera = useCallback((cam: THREE.Vector3, target: THREE.Vector3, ms: number) => {
    const api = fg.current; if (!api) return;
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
    moveCamera(new THREE.Vector3(0, -overviewDistance * .16, overviewDistance), new THREE.Vector3(0, 0, 0), ms);
  }, [overviewDistance, moveCamera]);

  // One-time scene setup: sky, forces, controls.
  useEffect(() => {
    if (!webgl) return;
    let frame = 0, sky: THREE.Group | null = null, cancelled = false;
    const setup = () => {
      const api = fg.current;
      if (!api) { if (!cancelled) frame = requestAnimationFrame(setup); return; }
      sky = makeSky(); api.scene().add(sky);
      api.d3Force('center', null);
      // Keep pathways and lessons close to their parent's depth so labels stay a similar size on screen.
      let simNodes: MapNode[] = [];
      const flatten = Object.assign((alpha: number) => {
        for (const n of simNodes) {
          if (n.kind !== 'pathway' && n.kind !== 'lesson') continue;
          const parent = cache.current.get(n.parent!); if (!parent) continue;
          (n as MapNode & { vz?: number }).vz = ((n as MapNode & { vz?: number }).vz ?? 0) + ((parent.z ?? 0) - (n.z ?? 0)) * .12 * alpha;
        }
      }, { initialize: (nodes: MapNode[]) => { simNodes = nodes; } });
      api.d3Force('flatten', flatten as never);
      api.d3Force('charge')?.strength((n: MapNode) => n.kind === 'lesson' ? -45 : -90);
      api.d3Force('link')?.distance((l: MapLink) => l.kind === 'lesson' ? 44 : l.kind === 'pathway' ? (idOf(l.target) === expandedPathway.current ? 125 : 72) : 330).strength((l: MapLink) => l.kind === 'subject' ? 0 : 1);
      const controls = api.controls() as unknown as { autoRotateSpeed: number; minDistance: number; maxDistance: number; enableDamping: boolean; addEventListener: (t: string, f: () => void) => void };
      controls.autoRotateSpeed = .35; controls.minDistance = 30; controls.maxDistance = 2600; controls.enableDamping = true;
      controls.addEventListener('start', () => setSpin(false));
      api.camera().position.set(0, -overviewDistance * .5, overviewDistance * 1.9);
      const drift = () => { if (sky) sky.rotation.y += .00006; frame = requestAnimationFrame(drift); };
      if (!reducedMotion) frame = requestAnimationFrame(drift);
    };
    frame = requestAnimationFrame(setup);
    return () => { cancelled = true; cancelAnimationFrame(frame); if (sky) fg.current?.scene().remove(sky); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [webgl]);

  const framed = useRef(false);
  useEffect(() => { if (!framed.current && size.width > 0 && fg.current) { framed.current = true; overview(reducedMotion ? 0 : 2200); } }, [size, overview]);

  useEffect(() => { const c = fg.current?.controls() as unknown as { autoRotate: boolean } | undefined; if (c) c.autoRotate = spin; }, [spin, data]);

  const flyTo = useCallback((n: MapNode, distance: number, delay = 0) => {
    const go = () => {
      const p = new THREE.Vector3(n.x ?? 0, n.y ?? 0, n.z ?? 0);
      const parent = n.parent ? cache.current.get(n.parent) : undefined;
      const away = parent ? p.clone().sub(new THREE.Vector3(parent.x ?? 0, parent.y ?? 0, parent.z ?? 0)) : p.clone();
      if (away.lengthSq() < 1) away.set(0, 0, 1);
      const dir = away.normalize().multiplyScalar(.55).add(new THREE.Vector3(0, -.15, 1)).normalize();
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
    const n = cache.current.get(nodeId.subject(id)); if (n) flyTo(n, 330);
  }, [flyTo]);
  const openPathway = useCallback((id: string) => {
    const p = pathwayById[id]; if (!p) return;
    setSpin(false);
    setExpansion({ subject: p.continent, pathway: id }); setFocus({ kind: 'pathway', id });
    // The pathway node may be new (opened from the panel), so let the simulation place it before flying.
    const existing = cache.current.get(nodeId.pathway(id));
    setTimeout(() => { const n = cache.current.get(nodeId.pathway(id)); if (n) flyTo(n, 200); }, existing ? 450 : 800);
  }, [flyTo]);
  const openLesson = useCallback((pathwayId: string, lessonId: string) => {
    setFocus({ kind: 'lesson', pathway: pathwayId, id: lessonId });
    onOpenPathway(pathwayById[pathwayId], lessonId);
  }, [onOpenPathway]);

  const onNodeClick = useCallback((n: MapNode) => {
    if (n.kind === 'hub') return reset();
    if (n.kind === 'subject') {
      const id = n.id.slice(2) as ContinentId;
      if (expansion.subject === id && !expansion.pathway) return reset();
      return openSubject(id);
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
    index: n.kind === 'subject' ? continents.findIndex(c => nodeId.subject(c.id) === n.id) : 0,
  }), [focusedNodeId, expansion.subject]);

  const linkColor = useCallback((l: MapLink) => {
    if (l.kind === 'subject') { const sid = idOf(l.target); const lit = !expansion.subject || sid === nodeId.subject(expansion.subject); return lit ? 'rgba(185,173,255,0.30)' : 'rgba(185,173,255,0.10)'; }
    const c = new THREE.Color((cache.current.get(idOf(l.target))?.color) ?? '#ffffff');
    return `rgba(${Math.round(c.r * 255)},${Math.round(c.g * 255)},${Math.round(c.b * 255)},${l.kind === 'pathway' ? .65 : .45})`;
  }, [expansion.subject]);

  // ── Side panel content ──
  const subject = focus.kind === 'subject' ? continentById[focus.id] : focus.kind === 'pathway' ? continentById[pathwayById[focus.id].continent] : focus.kind === 'lesson' ? continentById[pathwayById[focus.pathway].continent] : null;
  const pathway = focus.kind === 'pathway' ? pathwayById[focus.id] : focus.kind === 'lesson' ? pathwayById[focus.pathway] : null;

  if (!webgl) return <div className="map-fallback"><Orbit size={40} /><h2>3D map unavailable</h2><p>Your browser could not start WebGL. Turn on hardware acceleration or use the list view.</p><button className="primary" onClick={onShowList}>Open list view <ArrowUpRight size={16} /></button></div>;

  return <div className="map-view" ref={wrap}>
    {size.width > 0 && <ForceGraph3D<MapNode, MapLink>
      ref={fg}
      width={size.width}
      height={size.height}
      graphData={data}
      controlType="orbit"
      backgroundColor="#05070f"
      showNavInfo={false}
      rendererConfig={{ antialias: true, alpha: false }}
      nodeId="id"
      nodeThreeObject={nodeObject}
      nodeLabel={(n: MapNode) => `<div class="map-tooltip"><span style="background:${n.color}"></span>${escapeHtml(n.label)}</div>`}
      onNodeClick={onNodeClick}
      onNodeHover={(n: MapNode | null) => { if (wrap.current) wrap.current.style.cursor = n ? 'pointer' : 'grab'; }}
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
      <p className="map-hint">Drag to orbit · Scroll or pinch to zoom · Click a planet to expand it</p>
    </div>

    <div className="map-controls">
      <button className="icon-button" title="Back to the whole universe" aria-label="Back to the whole universe" onClick={reset}><Home size={17} /></button>
      <button className="icon-button" title={spin ? 'Stop drifting' : 'Drift slowly'} aria-label={spin ? 'Stop auto-rotation' : 'Start auto-rotation'} aria-pressed={spin} onClick={() => setSpin(s => !s)}>{spin ? <Pause size={16} /> : <Play size={16} />}</button>
      <button className="icon-button" title="List view" aria-label="Switch to list view" onClick={onShowList}><ListIcon size={17} /></button>
    </div>

    <aside className="map-panel" style={{ '--accent': subject?.color ?? '#a495ff' } as React.CSSProperties} aria-live="polite">
      {!subject && <>
        <div className="eyebrow">THE KNOWLEDGE UNIVERSE</div>
        <h2>Pick a planet.</h2>
        <p className="map-panel-text">{continents.length} subjects orbit the center. Choose one to reveal its pathways.</p>
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
