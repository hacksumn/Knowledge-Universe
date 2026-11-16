// Loads lesson bodies from one Markdown file per pathway: lessons/<pathway-id>.md.
// Inside a file, each lesson starts with a marker line "@@ <lesson-slug>", where the
// slug is the lesson id after "<pathway-id>/" (see catalogue.ts).
const files = import.meta.glob('./*.md', { query: '?raw', import: 'default', eager: true }) as Record<string, string>;

export function parseLessonFile(pathwayId: string, text: string): Record<string, string> {
  const out: Record<string, string> = {};
  const parts = text.replace(/\r\n/g, '\n').split(/^@@[ \t]+(\S+)[ \t]*$/m);
  for (let i = 1; i < parts.length; i += 2) out[`${pathwayId}/${parts[i]}`] = parts[i + 1].trim();
  return out;
}

export const lessonBodies: Record<string, string> = Object.assign(
  {},
  ...Object.entries(files).map(([path, text]) => parseLessonFile(path.replace(/^\.\//, '').replace(/\.md$/, ''), text)),
);
