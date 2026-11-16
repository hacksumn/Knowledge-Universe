# Knowledge Universe

A React 19 + TypeScript learning explorer for AI and the systems around it. Subjects contain pathways, and pathways contain ordered lessons.

## Run

```sh
npm ci
npm run dev      # http://localhost:5173 (Vite picks another port if busy)
npm test
npm run build
```

No backend or API key is needed.

## Content

All catalogue content lives in `apps/web/src/catalogue.ts` and is original:

- 8 subjects: Machine Learning, Agents, Data Centers, Prediction Models, Sports Gambling, LLMs, Possible Use Cases for AI, PCB Diagnostics. Each has an accent color, a tagline and a description.
- 2–4 pathways per subject (25 in total) with 102 lessons.
- Every lesson has a written body of roughly 400–600 words, ending with a key takeaway.

### Editing lessons

Lesson text lives in Markdown, one file per pathway: `apps/web/src/lessons/<pathway-id>.md`. Each lesson starts with a marker line `@@ <lesson-slug>`, where the slug is the lesson title in lowercase with hyphens (e.g. `@@ read-a-one-line-diagram`). Titles, summaries and order are set in `catalogue.ts`.

Supported formatting: `## heading`, `- bullets`, `1. numbered lists`, `> callout`, pipe tables, `**bold**` and `` `code` ``. Separate blocks with a blank line. A lesson without a section shows a **Draft** badge. `npm test` checks that every lesson has a body and that no section is orphaned.

Subject artwork is drawn as inline SVG in `apps/web/src/art.tsx`, one motif per subject.

## Explore

- Browse subjects, filter with the subject chips (the row scrolls horizontally) or search pathway, subject and lesson text. `/` focuses search.
- Open a pathway to see its lessons; select a lesson to read it, and use **Next** to move through the pathway.
- Bookmark pathways and find them in My collection (stored in this browser).
- Escape closes the drawer; keyboard focus stays within the open drawer.

The original 3D graph prototype's data module (`apps/web/src/data.ts`) and its tests are retained but no longer drive the interface.
