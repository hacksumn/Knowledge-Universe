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
