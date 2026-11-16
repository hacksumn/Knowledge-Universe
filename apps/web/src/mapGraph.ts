// Pure graph construction for the 3D map: hub → subjects → pathways → lessons.
// Only the expanded subject shows its pathways, and only the expanded pathway
// (which must belong to that subject) shows its lessons.
import { continents, pathways, continentById, resolveRelated, type ContinentId } from './catalogue';

export type MapKind = 'hub' | 'subject' | 'pathway' | 'lesson';
export type MapNodeSpec = { id: string; kind: MapKind; label: string; color: string; parent: string | null };
/** `cross` links are cross-links (see catalogue `connections`) drawn from a visible pathway or lesson to the subject it connects to. */
export type MapLinkSpec = { source: string; target: string; kind: Exclude<MapKind, 'hub'> | 'cross'; reason?: string };
export type Expansion = { subject: ContinentId | null; pathway: string | null };

export const HUB_ID = 'hub';
export const HUB_COLOR = '#c9c1ff';
export const nodeId = {
  subject: (id: string) => `s:${id}`,
  pathway: (id: string) => `p:${id}`,
  lesson: (id: string) => `l:${id}`,
};

/** Radius of the glowing globe; subjects sit on its surface. */
export const GLOBE_RADIUS = 360;

/** Fixed, deterministic subject positions: spread evenly over the globe's surface (Fibonacci sphere). */
export function subjectPosition(index: number, count = continents.length) {
  const y = 1 - ((index + .5) / count) * 2;
  const r = Math.sqrt(1 - y * y);
  const theta = index * Math.PI * (3 - Math.sqrt(5)) + .9;
  return { x: Math.cos(theta) * r * GLOBE_RADIUS, y: y * GLOBE_RADIUS, z: Math.sin(theta) * r * GLOBE_RADIUS };
}

export function buildMapGraph({ subject, pathway }: Expansion) {
  const nodes: MapNodeSpec[] = [{ id: HUB_ID, kind: 'hub', label: 'Knowledge Universe', color: HUB_COLOR, parent: null }];
  const links: MapLinkSpec[] = [];
  for (const c of continents) {
    nodes.push({ id: nodeId.subject(c.id), kind: 'subject', label: c.name, color: c.color, parent: HUB_ID });
    links.push({ source: HUB_ID, target: nodeId.subject(c.id), kind: 'subject' });
  }
  if (subject && continentById[subject]) {
    const color = continentById[subject].color;
    for (const p of pathways.filter(p => p.continent === subject)) {
      nodes.push({ id: nodeId.pathway(p.id), kind: 'pathway', label: p.title, color, parent: nodeId.subject(subject) });
      links.push({ source: nodeId.subject(subject), target: nodeId.pathway(p.id), kind: 'pathway' });
      if (p.id === pathway) {
        for (const l of p.lessons) {
          nodes.push({ id: nodeId.lesson(l.id), kind: 'lesson', label: l.title, color, parent: nodeId.pathway(p.id) });
          links.push({ source: nodeId.pathway(p.id), target: nodeId.lesson(l.id), kind: 'lesson' });
        }
      }
    }
  }
  // Cross-links: from each visible pathway (and, when a pathway is open, each of its lessons) to the
  // subject on the other end of every connection, skipping links back into the expanded subject.
  if (subject && continentById[subject]) {
    const seen = new Set<string>();
    for (const n of nodes) {
      if (n.kind !== 'pathway' && n.kind !== 'lesson') continue;
      const id = n.id.slice(2);
      const end = n.kind === 'pathway' ? pathways.find(p => p.id === id) : pathways.find(p => p.id === id.split('/')[0])?.lessons.find(l => l.id === id);
      for (const r of end?.related ?? []) {
        const t = resolveRelated(r.id);
        if (!t || t.continent.id === subject) continue;
        const target = nodeId.subject(t.continent.id), key = `${n.id}|${target}`;
        if (seen.has(key)) continue; seen.add(key);
        links.push({ source: n.id, target, kind: 'cross', reason: r.reason });
      }
    }
  }
  return { nodes, links };
}
