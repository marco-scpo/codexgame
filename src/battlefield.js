import {
  STRUCTURES,
  ENEMIES,
  SCENARIOS,
  distance,
  coordinate,
  maxHp,
} from "./engine.js";
import { sprite } from "./art.js";
export function tileName(t) {
  return t.structure === "core"
    ? "Command core"
    : t.structure
      ? STRUCTURES[t.structure].name
      : t.relic
        ? "Ancient cache"
        : t.terrain === "ore"
          ? "Ore deposit"
          : t.terrain === "rock"
            ? "Rock formation"
            : "Open terrain";
}
export function tileLabel(t, game) {
  return `${coordinate(t)}: ${tileName(t)}${game.enemies.some((e) => e.x === t.x && e.y === t.y) ? ", hostile present" : ""}`;
}
export function battlefield(game, armed, showRange) {
  const selected = game.tiles[game.selected];
  const palettes = {
    drift: ["#314343", "#1a282d", "#3e5752", "#60736a"],
    rust: ["#524237", "#302d31", "#675448", "#94745b"],
    night: ["#3d3b55", "#25263c", "#55536f", "#827799"],
  };
  const [light, dark, rock, rockLight] = palettes[game.scenario];
  let art = `<defs><radialGradient id="soil"><stop stop-color="${light}"/><stop offset="1" stop-color="${dark}"/></radialGradient><pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse"><path d="M60 0H0v60" fill="none" stroke="#afc9d1" stroke-opacity=".12"/></pattern></defs><rect width="720" height="540" fill="url(#soil)"/>`;
  for (const t of game.tiles) {
    const n = t.x * 17 + t.y * 31;
    art += `<g transform="translate(${t.x * 60} ${t.y * 60})" shape-rendering="crispEdges"><rect x="${7 + (n % 40)}" y="${8 + (n % 39)}" width="${(n % 3) + 1}" height="2" fill="#9cb4aa" opacity=".25"/><path d="M${5 + (n % 16)} ${44 - (n % 20)}h7m${22 + (n % 15)} ${15 + (n % 25)}h4" stroke="#95aea5" stroke-opacity=".17"/>`;
    if (t.terrain === "rock")
      art += `<ellipse cx="30" cy="48" rx="24" ry="7" fill="#111b25" opacity=".5"/><path fill="${rock}" d="m7 39 8-20 15-8 15 9 10 25-18 8z"/><path fill="${rockLight}" d="m15 21 15-9 12 9-9 14-18 5z"/><path fill="#c2c3ae" opacity=".15" d="m20 24 10-8 8 7-7 6z"/><path fill="#192530" opacity=".7" d="m8 41 26-6 20 9-17 9z"/>`;
    else if (t.terrain === "ore")
      art +=
        '<ellipse cx="30" cy="44" rx="24" ry="7" fill="#17212d" opacity=".6"/><path fill="#746147" d="m7 40 11-15 14 7 12-11 11 21-17 7-22-3z"/><path fill="#d49957" d="m12 37 7-10 7 8-4 8zM32 34l11-10 7 15-10 5z"/><path fill="#ffe3a0" d="m16 32 4-4 4 7-6 3zM39 30l5-3 3 8-5 3z"/><rect x="28" y="44" width="5" height="4" fill="#e7b578"/>';
    else if (!t.structure && !t.relic && n % 5 === 0)
      art += `<path d="M12 47h3v-8h3v-4h3v8h4v4h-4v4h-9z" fill="${SCENARIOS[game.scenario].color}" opacity=".23"/><rect x="17" y="34" width="4" height="3" fill="${SCENARIOS[game.scenario].color}" opacity=".6"/>`;
    art += "</g>";
  }
  art += '<rect width="720" height="540" fill="url(#grid)"/>';
  // Visible power links make a colony read as a connected settlement.
  for (const t of game.tiles.filter((t) => t.structure))
    for (const other of game.tiles.filter((t) => t.structure)) {
      if (other.y * 12 + other.x <= t.y * 12 + t.x || distance(t, other) > 1)
        continue;
      art += `<path d="M${t.x * 60 + 30} ${t.y * 60 + 42}H${other.x * 60 + 30}V${other.y * 60 + 42}" stroke="#69b9aa" stroke-opacity=".45" stroke-width="3" stroke-dasharray="3 3"/>`;
    }
  if (
    showRange &&
    selected.structure &&
    STRUCTURES[selected.structure]?.range
  ) {
    const radius = STRUCTURES[selected.structure].range;
    for (const t of game.tiles)
      if (
        distance(t, selected) <= radius &&
        (selected.structure !== "mortar" || distance(t, selected) >= 2)
      )
        art += `<rect x="${t.x * 60 + 1}" y="${t.y * 60 + 1}" width="58" height="58" fill="#78ddce" fill-opacity=".12" stroke="#7cdfcc" stroke-opacity=".18"/>`;
  }
  if (armed)
    for (const t of game.tiles)
      if (
        !t.structure &&
        t.terrain !== "rock" &&
        !t.relic &&
        game.tiles.some((s) => s.structure && distance(s, t) <= 2)
      )
        art += `<rect x="${t.x * 60 + 3}" y="${t.y * 60 + 3}" width="54" height="54" fill="#67dcca" fill-opacity=".06" stroke="#67dcca" stroke-opacity=".28" stroke-dasharray="4 4"/>`;
  for (const t of game.tiles) {
    if (t.relic)
      art += `<g class="relic-sprite">${sprite("relic", t.x * 60, t.y * 60)}</g>`;
    if (!t.structure) continue;
    art += `<ellipse cx="${t.x * 60 + 30}" cy="${t.y * 60 + 49}" rx="23" ry="7" fill="#0c1525" opacity=".5"/>${sprite(t.structure, t.x * 60, t.y * 60)}`;
    const maximum = maxHp(game, t);
    art += `<rect x="${t.x * 60 + 12}" y="${t.y * 60 + 54}" width="36" height="3" fill="#101b26"/><rect x="${t.x * 60 + 12}" y="${t.y * 60 + 54}" width="${(36 * Math.max(0, t.hp)) / maximum}" height="3" fill="${t.hp / maximum < 0.35 ? "#ed7b78" : "#80d5b7"}"/>`;
  }
  for (const [i, e] of game.enemies.entries()) {
    const overlap = game.enemies
      .slice(0, i)
      .filter((other) => distance(e, other) === 0).length;
    art += `<g class="hostile-sprite">${sprite(e.type === "raider" ? "enemy" : e.type, e.x * 60 + overlap * 5, e.y * 60 - overlap * 3)}<rect x="${e.x * 60 + 12}" y="${e.y * 60 + 54}" width="36" height="3" fill="#171c29"/><rect x="${e.x * 60 + 12}" y="${e.y * 60 + 54}" width="${(36 * e.hp) / e.maxHp}" height="3" fill="#e8898b"/></g>`;
  }
  for (const r of game.nextRaid)
    art += `<g class="spawn-marker"><path d="M${r.x * 60 + 22} ${r.y * 60 + 3}h16v4h-16zM${r.x * 60 + 28} ${r.y * 60 + 7}h4v6h-4z" fill="#ec956f"/><rect x="${r.x * 60 + 3}" y="${r.y * 60 + 3}" width="54" height="54" fill="none" stroke="#e89873" stroke-opacity=".4" stroke-dasharray="3 6"/></g>`;
  art += `<rect x="${selected.x * 60 + 2}" y="${selected.y * 60 + 2}" width="56" height="56" fill="#fff2c4" fill-opacity=".06" stroke="#f6cc7d" stroke-width="1.5"/><path d="M${selected.x * 60 + 12} ${selected.y * 60 + 2}h-10v10m44-10h10v10m0 34v10h-10m-34 0h-10v-10" fill="none" stroke="#ffe2a0" stroke-width="3"/>`;
  for (const fx of game.effects || []) {
    if (fx.kind === "shot")
      art += `<line class="shot-effect ${fx.mortar ? "mortar-shot" : ""}" x1="${fx.x * 60 + 30}" y1="${fx.y * 60 + 20}" x2="${fx.tx * 60 + 30}" y2="${fx.ty * 60 + 28}" stroke="${fx.mortar ? "#bcb2ff" : "#ffe2a0"}" stroke-width="3"/>`;
    if (fx.kind === "pulse")
      art += `<circle class="pulse-effect" cx="${fx.x * 60 + 30}" cy="${fx.y * 60 + 30}" r="125" fill="#ad9dff" fill-opacity=".1" stroke="#c7b4ff" stroke-width="4"/>`;
    if (fx.kind === "build" || fx.kind === "kill")
      art += `<rect class="build-effect" x="${fx.x * 60 + 7}" y="${fx.y * 60 + 7}" width="46" height="46" fill="${fx.kind === "kill" ? "#ffaa7c" : "#91f2d8"}" fill-opacity=".5"/>`;
    if (fx.kind === "hit")
      art += `<text class="damage-effect" x="${fx.x * 60 + 30}" y="${fx.y * 60 + 10}" text-anchor="middle" fill="${fx.shielded ? "#77d9d4" : "#ff9c8f"}" font-size="15" font-weight="bold">−${fx.amount}</text>`;
  }
  return `<svg class="terrain" viewBox="0 0 720 540" preserveAspectRatio="none" aria-hidden="true">${art}</svg>`;
}
