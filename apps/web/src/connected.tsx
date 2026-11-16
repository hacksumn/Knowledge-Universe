import React from 'react';
import { ArrowUpRight, Link2 } from 'lucide-react';
import { resolveRelated, type RelatedRef } from './catalogue';

/** "Connected to" row: cross-links to pathways or lessons in other parts of the catalogue. */
export function ConnectedTo({ items, onOpen, compact = false }: { items: RelatedRef[]; onOpen: (id: string) => void; compact?: boolean }) {
  const resolved = items.flatMap(r => { const t = resolveRelated(r.id); return t ? [{ ref: r, ...t }] : []; });
  if (!resolved.length) return null;
  return <div className={`connected${compact ? ' compact' : ''}`}>
    <div className="connected-label"><Link2 size={13} /> Connected to</div>
    <ul>
      {resolved.map(({ ref, pathway, lesson, continent }) => <li key={ref.id}>
        <button style={{ '--accent': continent.color } as React.CSSProperties} onClick={() => onOpen(ref.id)} title={ref.reason}>
          <span className="color-dot" />
          <span className="connected-text">
            <strong>{lesson ? lesson.title : pathway.title}</strong>
            <small>{continent.name}{lesson ? ` · ${pathway.title}` : ' · pathway'}</small>
            {!compact && <em>{ref.reason}</em>}
          </span>
          <ArrowUpRight size={14} />
        </button>
      </li>)}
    </ul>
  </div>;
}
