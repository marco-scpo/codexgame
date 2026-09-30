# OUTPOST / 09

A quiet, retro sci-fi strategy game for short breaks. Establish a tiny colony on Kepler-186f, defend it against raiders, and send a signal home.

## Play

```sh
npm install
npm run dev
```

Open http://localhost:5173. To create a standalone browser game, run `npm run build` and open `game.html`. The standalone file includes all game code, pixel art, and styles; it can be played without a server. Optional Google Fonts fall back to system fonts when offline.

## Your mission

Survive ten complete cycles with your command core intact and charge the distress signal to 100%. Every cycle provides three orders. No real-time timers, no login, and sound is off by default. Progress automatically saves in your browser, when storage is available.

- **Build:** Select an empty tile within two tiles of a structure. Ore deposits support alloy extractors; plain terrain supports solar arrays, sentry turrets, and barriers.
- **Defend:** Sentries shoot once before raiders move, within a Manhattan distance of three tiles. Raiders approach the nearest structure and attack when adjacent. Sentry upgrades increase damage from 14 to 22. Defeated raiders provide three alloy.
- **Recover:** Repair restores up to 35 integrity. Salvage recovers half the alloy construction cost.
- **Signal:** Each charge uses ten energy and one order, adding 20%. If the signal is incomplete after cycle ten, continue holding the core until it is ready.
- **End cycle:** Raiders advance and attack, resources are collected, orders reset, and new raiders arrive.

Keyboard: arrow keys navigate the focused map; **E** ends a cycle; **?** opens help; **Esc** pauses or closes a dialog. All controls support keyboard navigation. The field guide contains the full rules.

## Development

Vanilla JavaScript, SVG pixel art, and Vite. The game engine is independent of the interface, uses seeded random generation, and validates browser saves before loading them.

```sh
npm test                       # Deterministic game-engine tests
npx playwright install chromium
npm run test:browser            # Browser interaction and responsive layout tests
npm run build                  # Production assets and standalone game.html
```

`npm run test:browser` starts its own test server on port 5174. The production `dist/` directory can be hosted as static files. No backend or API keys are required.

## GitHub Pages

The game is configured for https://marco-scpo.github.io/codexgame/.
In the repository's **Settings → Pages**, select **GitHub Actions** as the build and deployment source. For a private repository, GitHub Pages requires a plan that supports Pages on private repositories.

Every push to `main` runs the engine and browser tests, builds the game, and deploys `dist/` with the official GitHub Pages actions. You can also launch **Deploy game to GitHub Pages** manually from the Actions tab. Vite uses relative asset paths so the game loads correctly under `/codexgame/`.
