# Knowledge Universe

A React 19 + TypeScript explorer inspired by Kinnu's Kinnuverse, rebuilt from the live page and the supplied REA reference capture.

## Run

```sh
npm ci
npm run dev
npm run build
npm test
```

The local Vite server normally runs at http://localhost:5173. No backend or API key is needed. Artwork, typography, and the learning catalogue are served locally.

## Explore

- Browse seven continents and 100 pathways containing 899 source lesson links.
- Filter by continent or search pathway titles and lesson titles. `/` focuses search.
- Open a pathway to see its ordered lessons. Lessons open on Kinnu in another tab.
- Bookmark pathways and find them in My collection; bookmarks persist in this browser.
- Use Surprise me or select an origami tile for a discovery.
- Escape closes the drawer; keyboard focus stays within the open drawer.

The responsive interface uses Kinnu's reference artwork with an original explorer layout. It does not copy the source marketing page or host the lesson article bodies. Reference findings, evidence IDs, design choices, and browser verification are recorded in [docs/rebuild-evidence.md](docs/rebuild-evidence.md).

The original graph dataset and its tests are retained but no longer drive the interface.
