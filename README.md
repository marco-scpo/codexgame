# OUTPOST / 09

A retro sci-fi colony defense game for short breaks. Build a foothold on an alien planet, manage a power reserve, and survive long enough to signal the rescue fleet.

**Play: https://marco-scpo.github.io/codexgame/**

## Frontier update / version 2

The game now opens as a tactical command screen: a battlefield, live radar, wave forecast, construction dock, and structure console. CRT scanlines and sound can be toggled independently. Sound starts muted.

- **Three sectors:** Drift Basin (10 cycles), Rust Moon (14 cycles, reduced solar output), and the Dark Reach (16 cycles, heavier waves). Each has three difficulty settings.
- **Six structures:** Alloy extractors, solar arrays, sentries, barriers, arc mortars, and shield pylons.
- **Four enemies:** Raiders, fast economy-hunting skitters, armored ironclads, and ranged spitters.
- **Tactical decisions:** Powered defenses, pathfinding around rocks and structures, splash damage, shield coverage, orbital strikes, and exact next-wave arrival markers.
- **Expedition content:** Ancient resource caches, three transmission events with supply choices, weapon/core/command research, high scores, and optional endless defense after rescue.
- **Convenience:** Automatic saves, migration of original saves, keyboard controls, and undo within the current cycle.

## Play locally

```sh
npm install
npm run dev
```

Open http://localhost:5173. To create a standalone game, run `npm run build` and open `game.html` in a browser. This file contains all code, SVG pixel art, and styles. It plays without a server; optional Google Fonts fall back to system fonts offline.

## Your mission

Keep your command core intact through the sector's complete extraction window and reach 100% rescue signal. If the signal is late, keep holding the core until it is ready. You start with three orders per cycle. There is no timer, account, or backend.

Select a tile and deploy a structure from the console, or choose a blueprint from the construction dock and click a valid tile. Build within Manhattan distance two of an existing structure. Extractors require ore; rocks block construction and movement. Ancient caches must be recovered before their tiles can be used.

At the end of each cycle, shield pylons activate, guns fire, hostiles move and attack, income arrives, orders reset, and the forecast wave enters. Arrival tiles are marked in orange. Some cycles bring a transmission that must be resolved before continuing.

Sentries use one energy per shot. Mortars use two and hit enemies within one tile of their target, at a firing range of two to five tiles. Pylons use one energy per cycle and absorb six damage for structures within two tiles; shields do not stack. Ironclad armor absorbs four damage from every hit. Late waves grow stronger during extended defense.

Repair restores up to 35 integrity for 10 alloy and 4 energy. Salvage returns half the alloy build cost. Cache recovery grants 15 alloy and 12 energy. A rescue signal boost costs 10 energy and adds 20%. Orbital pulses cost 12 energy, deal 26 damage in a two-tile radius around the selected tile, and recharge in three cycles. All these orders, along with research and construction, use one order each.

Research improves weapon damage, raises core capacity, or grants four orders starting next cycle. Every structure, hostile, and rule is described in the in-game **Codex**. After rescue, you can launch another sector or stay for endless defense.

### Controls

| Control | Action |
| --- | --- |
| Click a tile | Inspect, or deploy the selected blueprint |
| 1–6 | Select a construction blueprint |
| Arrow keys | Navigate the focused battlefield |
| E | End the cycle |
| Q | Orbital pulse at the selected tile |
| Z | Undo the last order in the current cycle |
| ? | Help |
| Esc | Cancel blueprint, close a dialog, or pause |

Undo history ends when you advance a cycle or reload the game. Expedition progress and settings save in your browser when storage is available. The original version's expeditions migrate automatically into the new interface.

## Development

Vanilla JavaScript, SVG pixel art, and Vite. The independent game engine uses seeded randomness, deterministic wave forecasts, BFS pathfinding, and validated, versioned browser saves.

```sh
npm test                        # Engine tests
npx playwright install chromium
npm run test:browser             # Browser gameplay and layout tests
npm run build                   # Production assets and standalone game.html
```

Browser tests run a server on port 5174 and cover full expeditions, event/save recovery, construction, undo, accessibility, and mobile/laptop layouts. Test screenshots go to Playwright's ignored output directory.

## GitHub Pages

`.github/workflows/pages.yml` tests the engine and browser, builds the game, and deploys `dist/` on every push to `main`. The repository's **Settings → Pages → Source** is set to **GitHub Actions**. The workflow also supports manual dispatch from the Actions tab.

Vite uses relative asset paths so the game loads correctly under `/codexgame/`. No API keys are required.
