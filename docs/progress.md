# Progress

Milestone 1 implemented. Milestones 2–6 intentionally deferred.

## Automated verification

Run `npm test` and `npm run build`. Tests verify 61 unique meaningful concepts, all six domains, typed valid endpoints, full graph connectivity, the blueprint's example cross-domain links, case-insensitive title/description search, compatibility with resolved simulation endpoints, and deterministic independent graph construction.

## Browser acceptance checklist — pending manual verification

A supported browser QA tool was unavailable in the build environment. These checks and FPS targets are not claimed as passed:

- Actual WebGL scene renders; six colored neighborhoods are visible.
- Orbit, right-drag pan, scroll zoom, focus animation and Home reset work.
- Select a node, search a title, search summary text, focus a result.
- Select an edge; inspect its rationale and unverified demo status.
- Domain filter and reset preserve responsive canvas sizing.
- Both panels collapse/reopen; immersive view returns correctly.
- Shortcuts work without interfering with text input.
- Shift-drag pins and Preferences releases session pins.
- Reduced motion disables camera transitions.
- No console errors during ordinary use; resize at desktop and mobile widths.
- Measure 50–100-node rendering on the target RTX 4060 PC before claiming 60 FPS.

## Remaining milestones

2. Persistent SQLite graph engine and camera bookmarks.
3. Validated provider-backed concept generation and cost metering.
4. Technical learning tools, notes and follow-up questions.
5. Source-backed research and verified relationship evidence.
6. Measured optimization, import/export, recovery and release validation.

## Catalogue explorer — Phase 1 (subjects and pathways)

- Replaced the catalogue scraped from Kinnu (pathways, lesson titles, artwork, font, page captures) with original content in `apps/web/src/catalogue.ts`: 8 subjects, 25 pathways, 102 stub lessons.
- Original inline SVG subject art (`apps/web/src/art.tsx`), navy/purple palette, system font, placeholder orbit mark and favicon (logo redesign is Phase 4).
- Search covers subject, pathway and lesson text; counters derive from the data; the subject chip row scrolls.
- Verified: `npm test`, `npm run build`, and Playwright runs at 1440×900 and 390×844 (subject cards, chip filter, search, drawer, lesson expansion, Escape) with no console errors and no horizontal overflow.

Next: Phase 2 map view, Phase 3 `related` cross-links, Phase 4 logo.

## Lesson content

- Wrote all 102 lessons (about 55,000 words, roughly 400–600 each) as Markdown in `apps/web/src/lessons/<pathway-id>.md`, loaded at build time and rendered with a small safe Markdown subset (headings, lists, callouts, tables, bold, code). Worked examples were checked numerically.
- Drawer shows the full lesson with a "Next" button; Draft badges remain only for lessons without a section.
- Tests check every lesson has a 400–650-word body with a key takeaway, no orphan sections, and the Markdown parser.

## Phase 2 — 3D map

- Map | List toggle in the header; the map is the opening screen. The three.js code is split into its own lazily loaded chunk, so the list view does not download it.
- Globe styling: fresnel rim-lit shell (pink to violet), a web of ~590 points joined to their nearest neighbours, nebula clouds inside, deep-blue starfield outside. Subjects are bright star points on the surface; pathways and lessons are held on the surface near their parent by a custom simulation force.
- Hover a subject (real mouse movement only) to expand it in place; click to fly in; pathways expand to lessons; lessons open the reading drawer. Hover expansion is ignored for touch input, stale pointer positions and during camera flights.
- Side panel / mobile bottom sheet mirrors the map for keyboard and touch use. WebGL-unavailable fallback links to the list view. Reduced-motion preference disables camera animation and drift.
- Verified with Playwright using software WebGL at 1440×900 and 390×844: hover expansion, panel navigation, pathway expansion, lesson drawer, canvas click, list toggle and search, no console errors.
