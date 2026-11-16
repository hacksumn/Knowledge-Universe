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

### Cross-links ("Connected to")

Pathways and lessons carry a `related` field listing connections to other parts of the catalogue. Edit the single `connections` list in `catalogue.ts`: each entry is `[endA, endB, reason]`, where an end is a pathway id (`probability-calibration`) or a lesson id (`nba-moneylines/walk-forward-validation`). Both ends get the link automatically. Links appear as a "Connected to" row on pathways and inside lessons, in the map's side panel, and as glowing arcs on the globe from an open subject's pathways and lessons to the subjects they connect to. `npm test` checks every end resolves and that no link is duplicated.

### Editing lessons

Lesson text lives in Markdown, one file per pathway: `apps/web/src/lessons/<pathway-id>.md`. Each lesson starts with a marker line `@@ <lesson-slug>`, where the slug is the lesson title in lowercase with hyphens (e.g. `@@ read-a-one-line-diagram`). Titles, summaries and order are set in `catalogue.ts`.

Supported formatting: `## heading`, `- bullets`, `1. numbered lists`, `> callout`, pipe tables, `**bold**` and `` `code` ``. Separate blocks with a blank line. A lesson without a section shows a **Draft** badge. `npm test` checks that every lesson has a body and that no section is orphaned.

Subject artwork is drawn as inline SVG in `apps/web/src/art.tsx`, one motif per subject.

## Explore

### Map (opening screen)

The map is a glowing 3D globe built with three.js (`apps/web/src/MapView.tsx`, loaded only when the map is shown). Each bright point on its surface is a subject.

- Hover a subject to expand it in place and show its pathways; click it to fly the camera in. On touch screens, tap to fly in.
- Click a pathway to show its lessons; click a lesson to open it in the reading drawer.
- Drag to orbit, scroll or pinch to zoom. The home button returns to the whole globe; the play/pause button toggles slow rotation.
- The side panel (a bottom sheet on phones) mirrors the map, so everything is also reachable by keyboard and touch.
- Graph structure is built by the pure module `apps/web/src/mapGraph.ts`, covered by `tests/mapGraph.test.ts`.

### List

- Browse subjects, filter with the subject chips (the row scrolls horizontally) or search pathway, subject and lesson text. `/` focuses search.
- Open a pathway to see its lessons; select a lesson to read it, and use **Next** to move through the pathway.
- Bookmark pathways and find them in My collection (stored in this browser).
- Escape closes the drawer; keyboard focus stays within the open drawer.

The original 3D graph prototype's data module (`apps/web/src/data.ts`) and its tests are retained but no longer drive the interface.
