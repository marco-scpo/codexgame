import "./style.css";
import {
  WIDTH,
  HEIGHT,
  SCENARIOS,
  DIFFICULTIES,
  STRUCTURES,
  ENEMIES,
  RESEARCH,
  EVENTS,
  createGame,
  loadSave,
  objective,
  maxOrders,
  maxHp,
  score,
  incomes,
  buildReason,
  actionReason,
  build,
  action,
  coordinate,
  endTurn,
  resolveEvent,
  continueEndless,
} from "./engine.js";
import { miniSprite, sprite } from "./art.js";
import { icon } from "./icons.js";
import { battlefield, tileName, tileLabel } from "./battlefield.js";

const SAVE_KEY = "outpost-09-expedition-v1";
const PREFS_KEY = "outpost-09-preferences";
const app = document.querySelector("#app");
let storageAvailable = true,
  game,
  prefs = { sound: false, crt: true, best: 0 };
try {
  game = loadSave(JSON.parse(localStorage.getItem(SAVE_KEY)));
  const savedPrefs = JSON.parse(localStorage.getItem(PREFS_KEY));
  if (savedPrefs)
    prefs = {
      sound: !!savedPrefs.sound,
      crt: savedPrefs.crt !== false,
      best: Number.isFinite(savedPrefs.best) ? savedPrefs.best : 0,
    };
} catch {
  /* A missing or corrupt save starts a fresh expedition. */
}
game ||= createGame();
let modal = game.pendingEvent ? "event" : null,
  armed = null,
  showRange = true,
  launchScenario = game.scenario,
  launchDifficulty = game.difficulty,
  toastTimer,
  audioContext,
  returnFocus = null;
let undoHistory = [];
const escape = (s) =>
  String(s).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const padded = (n) => String(n).padStart(2, "0");
function save() {
  prefs.best = Math.max(prefs.best, score(game));
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(game));
    localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
  } catch {
    storageAvailable = false;
  }
}
function beep(type = "good") {
  if (!prefs.sound) return;
  try {
    audioContext ||= new (window.AudioContext || window.webkitAudioContext)();
    audioContext.resume();
    const o = audioContext.createOscillator(),
      gain = audioContext.createGain();
    o.type = "square";
    o.frequency.setValueAtTime(
      type === "danger" ? 120 : type === "turn" ? 270 : 520,
      audioContext.currentTime,
    );
    o.frequency.exponentialRampToValueAtTime(
      type === "danger" ? 80 : 800,
      audioContext.currentTime + 0.15,
    );
    gain.gain.setValueAtTime(0.02, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(
      0.001,
      audioContext.currentTime + 0.18,
    );
    o.connect(gain);
    gain.connect(audioContext.destination);
    o.start();
    o.stop(audioContext.currentTime + 0.18);
  } catch {
    /* Sound is optional. */
  }
}
function notify(text, error = false) {
  const el = document.querySelector("#toast");
  el.textContent = text;
  el.className = `toast visible ${error ? "error" : ""}`;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => (el.className = "toast"), 3500);
}
function focusSelector(el) {
  for (const name of [
    "tile",
    "command",
    "build",
    "blueprint",
    "action",
    "scenario",
    "difficulty",
    "choice",
  ])
    if (el?.dataset?.[name] !== undefined)
      return `[data-${name}="${el.dataset[name]}"]`;
  return null;
}
function openModal(name) {
  returnFocus = focusSelector(document.activeElement);
  modal = name;
  render();
}
function closeModal() {
  if (modal === "event") return;
  modal = null;
  render();
  const target = returnFocus && document.querySelector(returnFocus);
  (target || document.querySelector('[data-command="help"]'))?.focus({
    preventScroll: true,
  });
}
function deployButton(type) {
  const spec = STRUCTURES[type],
    reason = buildReason(game, game.selected, type);
  return `<button class="build-card" data-build="${type}" ${reason ? "disabled" : ""} title="${escape(reason || spec.description)}">${miniSprite(type)}<span><strong>${spec.short}</strong><small>${spec.alloy} A${spec.energy ? ` / ${spec.energy} E` : ""}</small></span></button>`;
}
function missionPanel() {
  const sector = SCENARIOS[game.scenario],
    completed = Math.min(objective(game), game.turn - 1);
  const counts = Object.fromEntries(
    Object.keys(ENEMIES).map((k) => [
      k,
      game.enemies.filter((e) => e.type === k).length,
    ]),
  );
  const sides = ["WEST", "EAST", "NORTH", "SOUTH"];
  const waveSides = [...new Set(game.nextRaid.map((r) => r.side))]
    .map((side) => sides[side])
    .join(" + ");
  return `<aside class="mission-panel panel"><div class="panel-cap"><span>MISSION CONTROL</span><span class="live-light"></span></div><div class="mission-brief"><span class="eyebrow">OPERATION ${padded(Object.keys(SCENARIOS).indexOf(game.scenario) + 1)}</span><h2>${sector.name}</h2><span class="difficulty-label">${DIFFICULTIES[game.difficulty].name} ${game.endless ? "/ ENDLESS" : "/ EXTRACTION"}</span><p>${sector.briefing}</p><div class="objective-line"><span class="objective-check ${game.turn > objective(game) ? "done" : ""}">${game.turn > objective(game) ? "✓" : "□"}</span><span>Hold the command core</span><b>${completed}/${objective(game)}</b></div><div class="cycle-progress">${Array.from({ length: objective(game) }, (_, i) => `<i class="${i < completed ? "lit" : ""}"></i>`).join("")}</div><div class="objective-line"><span class="objective-check ${game.signal >= 100 ? "done" : ""}">${game.signal >= 100 ? "✓" : "□"}</span><span>Transmit rescue signal</span><b>${game.signal}%</b></div><div class="signal-segments">${Array.from({ length: 5 }, (_, i) => `<i class="${game.signal >= (i + 1) * 20 ? "lit" : ""}"></i>`).join("")}</div><button class="charge-button" data-action="charge" ${actionReason(game, "charge") ? "disabled" : ""} title="${escape(actionReason(game, "charge") || "Send a 20% signal boost")}">${icon("radar")} ${game.signal >= 100 ? "SIGNAL LOCKED" : "BOOST SIGNAL"}<small>10 E / 1 ORDER</small></button></div><div class="radar-section"><div class="section-title"><span>HOSTILE SCANNER</span><strong class="${game.enemies.length ? "danger-text" : ""}">${padded(game.enemies.length)} CONTACTS</strong></div><div class="radar-display"><div class="radar-sweep"></div><i class="radar-core" style="left:54%;top:50%"></i>${game.enemies.map((e) => `<i class="radar-blip" style="left:${(e.x / 11) * 90 + 5}%;top:${(e.y / 8) * 90 + 5}%"></i>`).join("")}<span>LIVE TACTICAL FEED</span></div><div class="contact-list">${
    Object.entries(counts)
      .filter(([, n]) => n)
      .map(([type, n]) => `<span>${ENEMIES[type].name}<b>×${n}</b></span>`)
      .join("") || '<span class="clear-sector">No hostiles in range.</span>'
  }</div><div class="wave-forecast"><span>NEXT WAVE / C${padded(game.turn + 1)}</span><strong>${game.nextRaid.length} incoming <small>${waveSides}</small></strong><p>${game.nextRaid.map((r) => ENEMIES[r.type].name).join(" · ")}</p></div></div><div class="research-section"><div class="section-title"><span>RESEARCH TERMINAL</span><span>1 ORDER</span></div>${Object.entries(
    RESEARCH,
  )
    .map(
      ([key, spec]) =>
        `<button class="research-item ${game.tech[key] ? "installed" : ""}" data-action="${key === "targeting" ? "upgrade" : key}" ${actionReason(game, key) ? "disabled" : ""} title="${escape(actionReason(game, key) || spec.description)}"><span class="research-icon">${icon(key === "targeting" ? "shield" : key === "fortify" ? "logo" : "radar")}</span><span><strong>${spec.name}</strong><small>${game.tech[key] ? "INSTALLED" : `${spec.alloy} A / ${spec.energy} E`}</small></span><b>${game.tech[key] ? "✓" : "+"}</b></button>`,
    )
    .join(
      "",
    )}</div><div class="sector-record"><span>EXPEDITION SCORE</span><strong>${String(score(game)).padStart(5, "0")}</strong><small>BEST ${String(prefs.best).padStart(5, "0")} / ${game.stats.kills} KILLS</small></div></aside>`;
}
function inspector() {
  const t = game.tiles[game.selected],
    enemies = game.enemies.filter((e) => e.x === t.x && e.y === t.y),
    maximum = maxHp(game, t);
  const desc =
    t.structure === "core"
      ? "Colony command. If this falls, the expedition ends. Keep a reserve for repairs."
      : t.structure
        ? STRUCTURES[t.structure].description
        : t.relic
          ? "An ancient power cache. Expand within 2 tiles to recover +15 alloy and +12 energy."
          : t.terrain === "rock"
            ? "Impassable stone. Hostiles must go around. No construction here."
            : t.terrain === "ore"
              ? "Metal-rich ground. Deploy an extractor here to gain +5 alloy each cycle."
              : "Open ground. Deploy within 2 tiles of an existing colony structure.";
  const reason = armed ? buildReason(game, game.selected, armed) : "";
  return `<aside class="inspector panel"><div class="panel-cap"><span>COMMAND CONSOLE</span><span class="coord">${coordinate(t)}</span></div><div class="inspect-main"><div class="tile-portrait">${t.structure || t.relic ? miniSprite(t.structure || "relic") : icon(t.terrain === "ore" ? "alloy" : "map")}<span>${t.structure ? "COLONY" : t.relic ? "ANCIENT" : "TERRAIN"}</span></div><div class="tile-identity"><span class="eyebrow">SELECTED TILE / ${coordinate(t)}</span><h3>${tileName(t)}</h3></div><p class="tile-description">${desc}</p>${t.structure ? `<div class="integrity"><span>STRUCTURE INTEGRITY</span><strong>${Math.max(0, t.hp)} / ${maximum}</strong></div><div class="meter"><i style="width:${(Math.max(0, t.hp) / maximum) * 100}%"></i></div><div class="structure-actions"><button data-action="repair" ${actionReason(game, "repair") ? "disabled" : ""} title="${escape(actionReason(game, "repair") || "Restore 35 integrity")}">${icon("repair")} REPAIR<small>10 A / 4 E</small></button>${t.structure !== "core" ? `<button data-action="salvage" ${actionReason(game, "salvage") ? "disabled" : ""}>${icon("refresh")} SALVAGE<small>+${Math.floor(STRUCTURES[t.structure].alloy / 2)} A</small></button>` : ""}</div>` : ""}${t.relic ? `<button class="primary recover-button" data-action="recover" ${actionReason(game, "recover") ? "disabled" : ""} title="${escape(actionReason(game, "recover") || "Recover ancient cache")}">${icon("star")} RECOVER CACHE</button>` : ""}</div>${enemies.length ? `<div class="hostile-card"><span class="section-title">HOSTILE CONTACT${enemies.length > 1 ? "S" : ""}</span>${enemies.map((e) => `<div>${miniSprite(e.type === "raider" ? "enemy" : e.type)}<span><strong>${ENEMIES[e.type].name}</strong><small>${e.hp} HP / ${e.damage} DMG</small></span></div><p>${ENEMIES[e.type].description}</p>`).join("")}</div>` : ""}<div class="construction-section"><div class="section-title"><span>DEPLOY STRUCTURE</span><span>1 ORDER</span></div><div class="build-list">${Object.keys(STRUCTURES).map(deployButton).join("")}</div><p class="build-advice">${armed ? `BLUEPRINT: ${STRUCTURES[armed].short.toUpperCase()}<br>${escape(reason || "VALID SITE. CLICK THIS TILE TO DEPLOY.")}` : t.structure ? "Inspect an empty tile to deploy, or choose a blueprint from the dock." : "Amber = ore. Rocks block construction. Hover a disabled order for details."}</p></div><div class="ability-section"><div class="section-title"><span>ORBITAL SUPPORT</span><span>Q</span></div><button class="pulse-button" data-action="pulse" ${actionReason(game, "pulse") ? "disabled" : ""} title="${escape(actionReason(game, "pulse") || "Strike the selected tile and its 2-tile radius")}">${icon("energy")}<span><strong>ORBITAL PULSE</strong><small>${game.turn < game.pulseReady ? `${game.pulseReady - game.turn} CYCLES TO RECHARGE` : "26 DMG / RADIUS 2 / 12 E"}</small></span></button><p>Targets the selected tile. 1 order.<br>Recharges in 3 cycles. Allies unharmed.</p></div></aside>`;
}
function resultOverlay() {
  if (game.status === "playing") return "";
  return `<div class="result-overlay"><span class="eyebrow">${game.status === "won" ? "EXTRACTION CONFIRMED" : "COLONY SIGNAL LOST"}</span><div class="result-art"><svg viewBox="0 0 60 60">${sprite(game.status === "won" ? "lander" : "core")}</svg></div><h2>${game.status === "won" ? "MISSION COMPLETE" : "OUTPOST OVERRUN"}</h2><p>${game.status === "won" ? "The rescue frigate has your coordinates. Your crew is going home." : "The frontier is unforgiving. Regroup, rethink your perimeter, and try again."}</p><div class="result-stats"><span><b>${game.turn - 1}</b>CYCLES</span><span><b>${game.stats.kills}</b>KILLS</span><span><b>${score(game)}</b>SCORE</span></div><button class="primary" data-command="new">NEW EXPEDITION ${icon("arrow")}</button>${game.status === "won" ? '<button class="secondary" data-command="endless">STAY & DEFEND / ENDLESS MODE</button>' : ""}</div>`;
}
function render() {
  const active = focusSelector(document.activeElement),
    income = incomes(game),
    sector = SCENARIOS[game.scenario],
    core = game.tiles.find((t) => t.structure === "core"),
    hp = Math.max(0, core.hp);
  app.innerHTML = `<div class="game-shell ${prefs.crt ? "crt" : ""}" style="--sector-color:${sector.color}" data-scenario="${game.scenario}"><header class="game-header"><a href="#" class="game-logo" data-command="help"><span class="logo-symbol">${icon("logo")}</span><span>OUTPOST<span class="logo-number">/09</span><small>TACTICAL COLONY DEFENSE</small></span></a><div class="header-sector"><span>EXPEDITION ${padded(Object.keys(SCENARIOS).indexOf(game.scenario) + 1)}</span><strong>${sector.planet}</strong></div><nav class="system-buttons" aria-label="Game menu"><button data-command="undo" aria-label="Undo last order" title="Undo last order / Z (this cycle only)" ${undoHistory.length ? "" : "disabled"}>↶<span>UNDO</span></button><button data-command="new" aria-label="New expedition" title="New expedition">${icon("refresh")}<span>NEW</span></button><button data-command="guide" aria-label="Field guide" title="Field guide">${icon("book")}<span>CODEX</span></button><button data-command="sound" aria-label="${prefs.sound ? "Mute" : "Enable sound"}" aria-pressed="${prefs.sound}" title="Toggle sound">${icon(prefs.sound ? "volume" : "mute")}</button><button data-command="crt" aria-label="Toggle scanlines" aria-pressed="${prefs.crt}" title="Toggle CRT scanlines">CRT</button><button data-command="help" aria-label="How to play" title="How to play">?</button><button data-command="pause" aria-label="Pause expedition" title="Pause expedition">Ⅱ</button></nav></header><section class="hud" aria-label="Colony resources"><div class="cycle-stat"><span class="hud-icon">${icon("radar")}</span><div><span class="stat-label">CYCLE</span><strong>${padded(game.turn)}<small> / ${game.endless ? "∞" : objective(game)}</small></strong></div></div><div class="alloy-stat"><span class="hud-icon">${icon("alloy")}</span><div><span class="stat-label">ALLOY</span><strong>${game.alloy}</strong></div><span class="income">+${income.alloy}<small>/CYCLE</small></span></div><div class="energy-stat"><span class="hud-icon">${icon("energy")}</span><div><span class="stat-label">ENERGY</span><strong>${game.energy}</strong></div><span class="income">+${income.energy}<small>/CYCLE</small></span></div><div class="core-stat"><span class="hud-icon">${icon("shield")}</span><div><span class="stat-label">CORE INTEGRITY</span><strong class="${hp < 35 ? "danger-text" : ""}">${hp}<small> / ${maxHp(game, core)}</small></strong></div><div class="hud-meter"><i style="width:${(hp / maxHp(game, core)) * 100}%"></i></div></div><div class="orders"><span class="stat-label">ORDERS</span><div>${Array.from({ length: maxOrders(game) }, (_, i) => `<i class="${i < game.orders ? "available" : ""}"></i>`).join("")}<strong>${game.orders}<small> / ${maxOrders(game)}</small></strong></div></div></section><main class="command-grid">${missionPanel()}<section class="battle-panel panel"><div class="panel-cap"><span><i class="live-light"></i> SECTOR VIEW / ${sector.name.toUpperCase()}</span><div class="view-controls"><button data-command="range" aria-pressed="${showRange}" title="Toggle range overlay">RANGE ${showRange ? "ON" : "OFF"}</button><button data-command="event" ${game.pendingEvent ? "" : "disabled"} class="${game.pendingEvent ? "event-pending" : ""}" title="Incoming transmission">${icon("radar")} COMMS</button></div></div><div class="battlefield-container"><div class="map-topline"><span>TERRAIN SCAN / LIVE</span><span>${armed ? "CONSTRUCTION MODE" : game.enemies.length ? "HOSTILES DETECTED" : "PERIMETER CLEAR"}</span></div><div class="map-layout"><div class="y-labels">${Array.from({ length: HEIGHT }, (_, i) => `<span>${padded(i + 1)}</span>`).join("")}</div><div class="board ${armed ? "construction-mode" : ""}">${battlefield(game, armed, showRange)}<div class="tile-grid" role="group" aria-label="Battlefield. Arrow keys navigate; choose a blueprint to construct.">${game.tiles.map((t, i) => `<button data-tile="${i}" class="tile-hit" tabindex="${i === game.selected ? "0" : "-1"}" aria-label="${tileLabel(t, game)}" aria-pressed="${i === game.selected}" title="${tileLabel(t, game)}"></button>`).join("")}</div>${resultOverlay()}</div><div class="x-labels">${Array.from({ length: WIDTH }, (_, i) => `<span>${String.fromCharCode(65 + i)}</span>`).join("")}</div></div><div class="map-legend"><span><i class="legend-square colony"></i>COLONY</span><span><i class="legend-square ore"></i>ORE</span><span><i class="legend-square relic"></i>CACHE</span><span><i class="legend-square raider"></i>HOSTILE</span><span><i class="legend-square incoming"></i>NEXT WAVE</span></div></div><div class="blueprint-dock"><span class="dock-caption">CONSTRUCTION DOCK<span>${armed ? "ESC TO CANCEL" : "SELECT BLUEPRINT → CLICK TILE"}</span></span><div class="blueprints">${Object.entries(
    STRUCTURES,
  )
    .map(
      ([type, spec], i) =>
        `<button data-blueprint="${type}" class="${armed === type ? "armed" : ""}" aria-pressed="${armed === type}" title="${escape(spec.name + ": " + spec.description)}" ${game.status !== "playing" ? "disabled" : ""}><kbd>${i + 1}</kbd>${miniSprite(type)}<span>${spec.short}</span><small>${spec.alloy} A${spec.energy ? ` · ${spec.energy} E` : ""}</small></button>`,
    )
    .join(
      "",
    )}</div></div><div class="combat-feed"><div class="feed-heading"><span>COMMAND LOG</span><button data-command="log" aria-label="View mission log">FULL LOG +</button></div><div class="feed-lines" aria-live="polite">${game.log
    .slice(0, 3)
    .map(
      (l) =>
        `<div><span>C${padded(l.turn)}</span><p class="${l.tone === "danger" ? "danger-text" : l.tone === "good" ? "good-text" : ""}">${escape(l.text)}</p></div>`,
    )
    .join(
      "",
    )}</div></div></section>${inspector()}</main><footer class="command-footer"><div class="save-status"><i class="live-light"></i><span>${storageAvailable ? "AUTO-SAVE ACTIVE" : "SAVING UNAVAILABLE · KEEP THIS TAB OPEN"}</span><small>NO TIMER. EVERY MOVE IS YOURS.</small></div><div class="turn-hint"><span>${game.enemies.length ? "WEAPONS FIRE → HOSTILES ADVANCE → INCOME" : "COLLECT INCOME & REFRESH ORDERS"}</span><small>${game.orders} UNUSED ORDER${game.orders === 1 ? "" : "S"} WILL EXPIRE</small></div><button class="end-turn" data-command="end" ${game.status !== "playing" || game.pendingEvent ? "disabled" : ""}>END CYCLE ${icon("arrow")}<kbd>E</kbd></button></footer></div><div class="toast" id="toast" role="status"></div><div id="modal-root">${modalMarkup()}</div>`;
  if (modal)
    document
      .querySelector(".modal button:not(:disabled)")
      ?.focus({ preventScroll: true });
  else if (active)
    document.querySelector(active)?.focus({ preventScroll: true });
  game.effects = [];
}
function guideContent() {
  return `<span class="eyebrow">FIELD CODEX / REVISION 02</span><h2>KNOW YOUR FRONTIER</h2><div class="guide-intro"><p><strong>Win:</strong> Hold your command core through ${objective(game)} complete cycles and reach 100% rescue signal. If your signal is late, hold longer. After rescue, choose endless defense.</p><p><strong>Each cycle:</strong> Powered shields activate → sentries and mortars fire → hostiles move and attack → income arrives → orders reset → the forecast wave enters. Enemy arrival tiles are marked in orange.</p><p><strong>Build:</strong> Within Manhattan distance 2 of any structure. Rocks block movement and construction. Recover caches before using their tiles. Each deployment, repair, charge, strike, salvage, or research costs 1 order. Research uplink provides 4 orders starting next cycle.</p><p><strong>Repair / salvage:</strong> 10 alloy + 4 energy restores 35 integrity. Salvaging returns half the alloy cost. Cache recovery grants 15 alloy + 12 energy. All other action costs appear on their buttons.</p><p><strong>Combat:</strong> Range uses grid steps, not diagonals. Shields absorb 6 damage and do not stack. Mortars splash adjacent enemies. The orbital pulse hits enemies within 2 tiles for 26 damage, costs 12 energy, and recharges in 3 cycles. Ironclad armor absorbs 4 from each hit, including pulses.</p><p><strong>Power:</strong> Guns only draw energy when they have a target. Pylons use 1 energy each cycle. Solar arrays generate ${SCENARIOS[game.scenario].solar} energy on this planet. Keep a battery reserve.</p></div><h3>COLONY STRUCTURES</h3><div class="codex-grid">${Object.entries(
    STRUCTURES,
  )
    .map(
      ([type, s]) =>
        `<article>${miniSprite(type)}<div><h4>${s.name}</h4><p>${s.description}</p><small>${s.alloy} ALLOY / ${s.energy} ENERGY / ${s.hp} HP</small></div></article>`,
    )
    .join(
      "",
    )}</div><h3>HOSTILE SIGNATURES</h3><div class="codex-grid">${Object.entries(
    ENEMIES,
  )
    .map(
      ([type, e]) =>
        `<article>${miniSprite(type === "raider" ? "enemy" : type)}<div><h4>${e.name}</h4><p>${e.description}</p><small>${e.hp} HP / ${e.damage} BASE DAMAGE / ${e.reward} SALVAGE</small></div></article>`,
    )
    .join(
      "",
    )}</div><p class="keyboard-tip">1–6: select blueprint · click: inspect / build · arrows: navigate · Q: orbital pulse · Z: undo order · E: end cycle · ?: help · Esc: cancel blueprint / pause</p><button class="primary" data-command="close">RETURN TO COMMAND</button>`;
}
function modalMarkup() {
  if (!modal) return "";
  let content, label;
  if (modal === "new") {
    label = "New expedition";
    content = `<span class="eyebrow">FRONTIER COMMAND / MISSION SELECT</span><h2>CHOOSE YOUR LANDING ZONE</h2><p class="launch-warning">Launching replaces your saved expedition. Your high score stays.</p><div class="scenario-select">${Object.entries(
      SCENARIOS,
    )
      .map(
        ([key, s], i) =>
          `<button data-scenario="${key}" class="scenario-card ${launchScenario === key ? "chosen" : ""}" aria-pressed="${launchScenario === key}" style="--planet:${s.color}"><span class="planet-art planet-${key}"></span><span class="eyebrow">SECTOR ${padded(i + 1)} / ${s.turns} CYCLES</span><strong>${s.name}</strong><p>${s.description}</p><span class="scenario-check">${launchScenario === key ? "[ SELECTED ]" : "[ SELECT ]"}</span></button>`,
      )
      .join("")}</div><div class="difficulty-select">${Object.entries(
      DIFFICULTIES,
    )
      .map(
        ([key, d]) =>
          `<button data-difficulty="${key}" class="${launchDifficulty === key ? "chosen" : ""}" aria-pressed="${launchDifficulty === key}"><strong>${d.name}</strong><small>${d.description}</small></button>`,
      )
      .join(
        "",
      )}</div><div class="modal-actions"><button class="secondary" data-command="close">Keep playing</button><button class="primary" data-command="restart">Start expedition ${icon("arrow")}</button></div>`;
  } else if (modal === "event") {
    label = "Incoming transmission";
    const event = EVENTS[game.pendingEvent];
    if (!event) return "";
    content = `<span class="eyebrow">INCOMING TRANSMISSION / CYCLE ${padded(game.turn)}</span><div class="radio-art">${icon("radar")}<i></i><i></i><i></i><i></i><i></i><i></i><i></i></div><h2>${event.title.toUpperCase()}</h2><p>${event.description}</p><div class="event-choices">${event.choices.map((c) => `<button data-choice="${c.id}" ${c.id === "trade" && game.alloy < 18 ? "disabled" : ""}><strong>${c.label}</strong><span>${c.detail}</span>${icon("arrow")}</button>`).join("")}</div><p class="event-note">ONE CHOICE / NO ORDER COST / CHOOSE TO CONTINUE</p>`;
  } else if (modal === "pause") {
    label = "Paused";
    content = `<span class="eyebrow">COMMAND ON STANDBY</span><h2>PAUSED</h2><p>The universe can wait. Your expedition is saved. Nothing moves until you end a cycle.</p><button class="primary" data-command="close">RESUME EXPEDITION ${icon("arrow")}</button>`;
  } else if (modal === "log") {
    label = "Mission log";
    content = `<span class="eyebrow">EXPEDITION RECORD</span><h2>COMMAND LOG</h2><div class="full-log">${game.log.map((l) => `<div><span>C${padded(l.turn)}</span><p class="${l.tone === "danger" ? "danger-text" : l.tone === "good" ? "good-text" : ""}">${escape(l.text)}</p></div>`).join("")}</div>`;
  } else if (modal === "guide") {
    label = "Field guide";
    content = guideContent();
  } else {
    label = "How to play";
    content = `<span class="eyebrow">COLONIST ORIENTATION</span><h2>WELCOME, COMMANDER.</h2><p>Protect the core for <strong>${objective(game)} cycles</strong> and charge your <strong>rescue signal to 100%</strong>. There is no timer.</p><ol class="help-list"><li><strong>Build a sentry.</strong> Click an empty tile near the core, then deploy from the command console.</li><li><strong>Grow your economy.</strong> Put extractors on amber ore, and solar arrays on open ground.</li><li><strong>Keep the guns powered.</strong> Sentries need 1 energy per shot. Shields and mortars draw more.</li><li><strong>Read the battlefield.</strong> Orange markers show next wave arrival tiles. Select a weapon to see its range.</li><li><strong>Send for rescue.</strong> Boost the signal with 10 energy per 20%. Resolve incoming transmissions for supplies.</li></ol><p class="keyboard-tip">1–6 BLUEPRINTS · E END CYCLE · Q PULSE · Z UNDO</p><div class="modal-actions"><button class="secondary" data-command="guide">FULL FIELD CODEX</button><button class="primary" data-command="close">TAKE COMMAND ${icon("arrow")}</button></div>`;
  }
  return `<div class="modal-backdrop"><section class="modal ${modal === "new" ? "launch-modal" : modal === "guide" ? "codex-modal" : ""}" role="dialog" aria-modal="true" aria-label="${label}">${modal !== "event" ? '<button class="modal-close" data-command="close" aria-label="Close dialog">×</button>' : ""}${content}</section></div>`;
}
function applyOrder(result, type = "good") {
  if (!result.ok) {
    if (game.pendingEvent) openModal("event");
    notify(result.message, true);
    beep("danger");
    return;
  }
  if (game.pendingEvent) modal = "event";
  save();
  render();
  beep(type);
}
function performOrder(fn) {
  const before = structuredClone(game),
    result = fn();
  if (result.ok) {
    undoHistory.push(before);
    undoHistory = undoHistory.slice(-8);
  }
  applyOrder(result);
}
function undoOrder() {
  if (!undoHistory.length || game.pendingEvent || game.status !== "playing")
    return;
  game = undoHistory.pop();
  game.effects = [];
  save();
  render();
  beep();
}
function advanceCycle() {
  const result = endTurn(game);
  if (result.ok) undoHistory = [];
  applyOrder(result, "turn");
}
function selectTile(index) {
  game.selected = index;
  if (armed) return performOrder(() => build(game, index, armed));
  save();
  render();
}
app.addEventListener("click", (e) => {
  const b = e.target.closest(
    "[data-command], [data-tile], [data-build], [data-blueprint], [data-action], [data-choice], [data-scenario], [data-difficulty]",
  );
  if (!b || b.disabled) return;
  e.preventDefault();
  if (b.dataset.tile !== undefined) return selectTile(Number(b.dataset.tile));
  if (b.dataset.build)
    return performOrder(() => build(game, game.selected, b.dataset.build));
  if (b.dataset.action)
    return performOrder(() => action(game, b.dataset.action));
  if (b.dataset.blueprint) {
    armed = armed === b.dataset.blueprint ? null : b.dataset.blueprint;
    render();
    return;
  }
  if (b.dataset.scenario) {
    launchScenario = b.dataset.scenario;
    render();
    return;
  }
  if (b.dataset.difficulty) {
    launchDifficulty = b.dataset.difficulty;
    render();
    return;
  }
  if (b.dataset.choice) {
    const result = resolveEvent(game, b.dataset.choice);
    if (result.ok) modal = null;
    return applyOrder(result);
  }
  const cmd = b.dataset.command;
  if (["new", "help", "pause", "log", "guide"].includes(cmd))
    return openModal(cmd);
  if (cmd === "event") return openModal("event");
  if (cmd === "close") return closeModal();
  if (cmd === "restart") {
    undoHistory = [];
    game = createGame(Date.now() >>> 0, launchScenario, launchDifficulty);
    armed = null;
    modal = null;
    save();
    render();
    return;
  }
  if (cmd === "endless") {
    armed = null;
    undoHistory = [];
    return applyOrder(continueEndless(game));
  }
  if (cmd === "end") return advanceCycle();
  if (cmd === "undo") return undoOrder();
  if (cmd === "sound") {
    prefs.sound = !prefs.sound;
    save();
    beep();
  }
  if (cmd === "crt") {
    prefs.crt = !prefs.crt;
    save();
  }
  if (cmd === "range") showRange = !showRange;
  render();
});
document.addEventListener("keydown", (e) => {
  if (e.ctrlKey || e.metaKey || e.altKey) return;
  if (modal) {
    if (e.key === "Escape") {
      e.preventDefault();
      closeModal();
      return;
    }
    if (e.key === "Tab") {
      const items = [
          ...document.querySelectorAll(".modal button:not(:disabled)"),
        ],
        first = items[0],
        last = items.at(-1);
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
    return;
  }
  if (e.key === "Escape") {
    if (armed) {
      armed = null;
      render();
    } else openModal("pause");
    return;
  }
  if (e.key === "?") {
    openModal("help");
    return;
  }
  if (e.repeat) return;
  if (e.key.toLowerCase() === "e") {
    e.preventDefault();
    advanceCycle();
    return;
  }
  if (e.key.toLowerCase() === "q") {
    e.preventDefault();
    performOrder(() => action(game, "pulse"));
    return;
  }
  if (e.key.toLowerCase() === "z") {
    e.preventDefault();
    undoOrder();
    return;
  }
  if (game.status === "playing" && /^[1-6]$/.test(e.key)) {
    armed = Object.keys(STRUCTURES)[Number(e.key) - 1];
    render();
    return;
  }
  if (
    e.target.dataset.tile !== undefined &&
    ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)
  ) {
    e.preventDefault();
    const t = game.tiles[Number(e.target.dataset.tile)];
    const x = Math.max(
      0,
      Math.min(
        WIDTH - 1,
        t.x + (e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0),
      ),
    );
    const y = Math.max(
      0,
      Math.min(
        HEIGHT - 1,
        t.y + (e.key === "ArrowDown" ? 1 : e.key === "ArrowUp" ? -1 : 0),
      ),
    );
    game.selected = y * WIDTH + x;
    save();
    render();
    document
      .querySelector(`[data-tile="${game.selected}"]`)
      .focus({ preventScroll: true });
  }
});
save();
render();
