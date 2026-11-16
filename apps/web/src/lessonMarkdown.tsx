import React from 'react';

// A small, safe Markdown subset for lesson bodies (rendered as React elements, never as HTML):
//   ## Heading          - bullet list        1. numbered list
//   > callout           | table | rows |     **bold**   `code`   plain paragraphs
// Blocks are separated by blank lines.

export type Block =
  | { type: 'heading'; text: string }
  | { type: 'ul' | 'ol'; items: string[] }
  | { type: 'callout'; text: string }
  | { type: 'table'; header: string[]; rows: string[][] }
  | { type: 'p'; text: string };

const cells = (row: string) => row.trim().replace(/^\||\|$/g, '').split('|').map(c => c.trim());

export function parseBlocks(md: string): Block[] {
  return md.replace(/\r\n/g, '\n').split(/\n{2,}/).map(b => b.trim()).filter(Boolean).map((block): Block => {
    const lines = block.split('\n').map(l => l.trim());
    if (lines.length === 1 && lines[0].startsWith('## ')) return { type: 'heading', text: lines[0].slice(3) };
    if (lines.every(l => l.startsWith('- '))) return { type: 'ul', items: lines.map(l => l.slice(2)) };
    if (lines.every(l => /^\d+\.\s/.test(l))) return { type: 'ol', items: lines.map(l => l.replace(/^\d+\.\s+/, '')) };
    if (lines.every(l => l.startsWith('>'))) return { type: 'callout', text: lines.map(l => l.replace(/^>\s?/, '')).join(' ') };
    if (lines.length >= 2 && lines.every(l => l.startsWith('|'))) {
      const body = lines.filter((_, i) => i !== 1 || !/^\|[\s:|-]+\|$/.test(lines[1]));
      return { type: 'table', header: cells(body[0]), rows: body.slice(1).map(cells) };
    }
    return { type: 'p', text: lines.join(' ') };
  });
}

function inline(text: string): React.ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).filter(Boolean).map((part, i) =>
    part.startsWith('**') && part.endsWith('**') ? <strong key={i}>{part.slice(2, -2)}</strong>
      : part.startsWith('`') && part.endsWith('`') ? <code key={i}>{part.slice(1, -1)}</code>
        : <React.Fragment key={i}>{part}</React.Fragment>);
}

export function LessonMarkdown({ source }: { source: string }) {
  return <div className="lesson-markdown">
    {parseBlocks(source).map((b, i) => {
      switch (b.type) {
        case 'heading': return <h4 key={i}>{inline(b.text)}</h4>;
        case 'ul': return <ul key={i}>{b.items.map((it, j) => <li key={j}>{inline(it)}</li>)}</ul>;
        case 'ol': return <ol key={i}>{b.items.map((it, j) => <li key={j}>{inline(it)}</li>)}</ol>;
        case 'callout': return <aside key={i} className="callout">{inline(b.text)}</aside>;
        case 'table': return <div key={i} className="table-wrap"><table><thead><tr>{b.header.map((h, j) => <th key={j}>{inline(h)}</th>)}</tr></thead><tbody>{b.rows.map((r, j) => <tr key={j}>{r.map((c, k) => <td key={k}>{inline(c)}</td>)}</tr>)}</tbody></table></div>;
        default: return <p key={i}>{inline(b.text)}</p>;
      }
    })}
  </div>;
}
