# Knowledge Universe

Milestone 1 of the supplied product blueprint: a real WebGL 2 knowledge explorer built with React 19, TypeScript, Vite, Zustand, Three.js and react-force-graph-3d.

## Run locally

Install Node.js 22 or newer, unzip this project, and open a terminal in the directory containing package.json:

```sh
npm ci
npm run dev
```

Vite prints the actual local URL (normally http://localhost:5173; it chooses another port if occupied). Keep the terminal running. No API key or backend is required. Internet access is needed to install packages; Google Fonts are optional and fall back to system fonts.

```sh
npm test          # graph integrity, connectivity, domain coverage, search, deterministic data
npm run build    # TypeScript validation + production bundle in dist/
npm run preview  # serve the production bundle, normally http://localhost:4173
```

## Explore

- Left drag: orbit. Right drag: pan. Scroll: zoom.
- Click a concept: select it, inspect its description and move the camera toward it. Double-click or F: focus.
- Click an edge: inspect the curated relationship and its evidence status.
- Search titles and descriptions; Enter focuses the first result.
- Select a domain to view its neighborhood. Home returns to all six.
- Shift + drag a sphere: reposition and pin it for this session.
- Side panels collapse independently. Immersive view hides both.
- `/`: search. Escape: deselect and close dialogs. Home: universe overview.
- Preferences: disable camera animation, hide labels, release all pinned concepts.

## Scope and verification

61 concepts, six domain clusters, typed links and eight cross-domain links. All descriptions and relationship rationales are curated demo content, not source-verified research. There are no LLM calls, fake AI controls, credentials, persistence, accounts, saved notes, or backend services. Reload restores the deterministic dataset. AI expansion is explicitly marked as a future milestone.

The renderer caps pixel ratio at 1.5 after settling, uses small sphere meshes and restrained halos, stops physics after a bounded settling period, and shows labels for the selected neighborhood. Reduced-motion preferences disable camera transitions by default. Performance targets from the blueprint remain unmeasured. Browser interaction QA and console checks were not available in the build environment; see docs/progress.md for the manual acceptance checklist.

Future architecture and milestone boundaries are documented under docs/. This repository intentionally does not scaffold nonfunctional API or database code in Milestone 1.
