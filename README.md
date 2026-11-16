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
- Lessons are stubs with a title and a one-line summary. To publish a lesson, add a `body` string to it (separate paragraphs with a blank line). Lessons without a body show a **Draft** badge.

Subject artwork is drawn as inline SVG in `apps/web/src/art.tsx`, one motif per subject.

## Explore

- Browse subjects, filter with the subject chips (the row scrolls horizontally) or search pathway, subject and lesson text. `/` focuses search.
- Open a pathway to see its lessons; select a lesson to expand its summary.
- Bookmark pathways and find them in My collection (stored in this browser).
- Escape closes the drawer; keyboard focus stays within the open drawer.

The original 3D graph prototype's data module (`apps/web/src/data.ts`) and its tests are retained but no longer drive the interface.
