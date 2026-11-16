# Architecture

`apps/web/src/data.ts` contains pure deterministic graph construction, domain definitions, concepts and typed relationships. `store.ts` owns UI state with Zustand. `main.tsx` binds the graph to Three.js rendering, camera interactions, search, panels and controls. `styles.css` defines the responsive visual system. Tests exercise graph integrity and data queries independently of WebGL.

ForceGraph owns simulation coordinates and resolves edge endpoints into node objects in place. Helpers accept both string IDs and resolved objects. React does not subscribe to per-tick coordinate updates. Physics settles after 100 ticks; selected neighborhoods limit visible labels. Pinning fixes coordinates until released or reloaded. No database is present in Milestone 1.

Future: add Fastify services, shared validated schemas, SQLite/Drizzle persistence, then server-side LLM adapters. Durable node IDs, sources, typed relationships, expansion runs and camera bookmarks should remain independent of the renderer. Secrets belong in backend environment variables and must never be exported with graph data. No later milestone is implemented here.
