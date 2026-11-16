# Knowledge Universe rebuild — 16 November 2026

## Reference observations

Inspected https://www.kinnu.xyz/kinnuverse and the supplied REA capture at `reference/kinnuverse-20261116-112112`.

- `ev_5bf543c147dff7a2dfa02f27bdaa15b0582c4dac50136d6d20c0a57c664d1247`: overview screenshot, dark charcoal landing page, orange brand accent, rounded typography, colorful origami hexagons.
- `ev_febf3fd512263e9a917562321006096d0cf2ac0a7a9e42d766a686ef0af06733`: another visible landing-page frame; it does not show a selected learning pathway.
- `ev_6eb9e8d9b46f803d56a7b2e952e09bdabc61d5c606702259c1f9c2f120510ee6`: passive page inventory with DOM structure, script/resource URLs, accessibility metadata. Script sources were not captured.
- `ev_65facc3a28677db0205b9393db6d4f3cdff21601edff0d9603ff98e6a77b1a71`: attach-limited observation with an empty timeline. It establishes no click behavior.

The downloaded live HTML supplies 100 pathways, 899 distinct lesson links, and seven continents: Culture, History, Lifestyle, Philosophy, Psychology, Science, Technology. The local catalogue preserves source titles, hierarchy, lesson order, and source URLs. Images and the font are downloaded from resource URLs named in the capture and served locally under `public/assets`.

## Implementation choices

This is an explorer adaptation, not a pixel copy of the long marketing landing page. It uses the reference's visual language and real learning catalogue, with a compact hero, continent cards, title/lesson search, filters, a lesson drawer, random discovery, and a saved collection persisted in browser local storage. These local interactions are design choices; the supplied capture does not prove Kinnu has these exact controls. Lessons open on Kinnu. No lesson article body, account service, backend, or learning progress is simulated.

## Verification

- TypeScript and Vite production build.
- Catalogue checks cover unique pathway IDs, all continents, all 899 distinct lesson URLs, and each lesson's parent path.
- Existing graph-data tests remain available for the retained legacy data module.
- REA desktop replay `ev_36a0fbc5fea221bd19c4e4fe71b531419e1185217a5e392dbbdf7c1cd67028a1`: search, open AI pathway, save, close, view collection, reload, view collection again; all steps completed, one saved pathway retained.
- REA mobile replay `ev_1d14a1a4f9fb087f59e68bed7324733a106db494bfe93ef414a9da75e0eaf409`: 390 × 844 layout, Technology filter, Artificial Intelligence drawer, and source lesson links; all steps completed. Screenshot review prompted a mobile hero spacing adjustment.
- Console inspection found a missing favicon, subsequently supplied as a local SVG.

REA captures describe controlled replays, not exhaustive accessibility or cross-browser certification. The external source lesson destinations were preserved, not individually crawled.
