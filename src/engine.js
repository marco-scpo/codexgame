export const WIDTH = 12;
export const HEIGHT = 9;
export const LAST_TURN = 10;
export const SCENARIOS = {
  drift: {
    name: "Drift Basin",
    planet: "KEPLER-186F",
    turns: 10,
    solar: 4,
    raidBonus: 0,
    color: "#66d7c0",
    description: "A forgiving landing zone. Learn to hold the frontier.",
    briefing:
      "Your lander is scrap. The rescue frigate returns in ten cycles. Build a perimeter and get that relay online.",
  },
  rust: {
    name: "Rust Moon",
    planet: "VEGA-IV / MOON 02",
    turns: 14,
    solar: 3,
    raidBonus: 0,
    color: "#eaa567",
    description: "Dust dims your solar arrays. Stretch every energy cell.",
    briefing:
      "The sand here eats machinery. Solar output is reduced, and rescue is fourteen cycles out. Protect your power supply.",
  },
  night: {
    name: "The Dark Reach",
    planet: "PROXIMA / DARK SIDE",
    turns: 16,
    solar: 4,
    raidBonus: 1,
    color: "#c0a0ef",
    description: "A hostile sector. Heavier waves and a longer hold.",
    briefing:
      "Something followed your descent. Hostile signatures are everywhere. The fleet needs sixteen cycles to reach you.",
  },
};
export const DIFFICULTIES = {
  cadet: {
    name: "Cadet",
    description: "Room to experiment.",
    bonus: 0,
    damage: 1,
  },
  commander: {
    name: "Commander",
    description: "A proper fight.",
    bonus: 1,
    damage: 1,
  },
  veteran: {
    name: "Veteran",
    description: "Every order counts.",
    bonus: 1,
    damage: 1.3,
  },
};
export const STRUCTURES = {
  mine: {
    name: "Alloy extractor",
    short: "Extractor",
    alloy: 12,
    energy: 0,
    hp: 28,
    description: "+5 alloy each cycle. Build on an amber ore deposit.",
    terrain: "ore",
  },
  reactor: {
    name: "Solar array",
    short: "Solar array",
    alloy: 10,
    energy: 2,
    hp: 24,
    description:
      "Generates energy every cycle. Weapons need stored energy to fire.",
  },
  turret: {
    name: "Sentry turret",
    short: "Sentry",
    alloy: 18,
    energy: 5,
    hp: 36,
    range: 3,
    upkeep: 1,
    description:
      "14 damage • range 3 • 1 energy per shot. Reliable perimeter defense.",
  },
  wall: {
    name: "Blast barrier",
    short: "Barrier",
    alloy: 8,
    energy: 0,
    hp: 60,
    description:
      "60 integrity. Raiders cannot walk through structures. Shape their approach.",
  },
  mortar: {
    name: "Arc mortar",
    short: "Arc mortar",
    alloy: 26,
    energy: 8,
    hp: 30,
    range: 5,
    upkeep: 2,
    description:
      "18 damage • range 2–5 • 2 energy. Splash hits every enemy within 1 tile of the target.",
  },
  shield: {
    name: "Shield pylon",
    short: "Shield pylon",
    alloy: 22,
    energy: 6,
    hp: 32,
    range: 2,
    upkeep: 1,
    description:
      "Absorbs 6 damage for structures within 2 tiles. Uses 1 energy per cycle. Does not stack.",
  },
};
export const ENEMIES = {
  raider: {
    name: "Raider",
    hp: 24,
    damage: 10,
    speed: 1,
    range: 1,
    armor: 0,
    reward: 3,
    description:
      "Standard assault unit. Moves 1 tile and attacks adjacent structures.",
  },
  scout: {
    name: "Skitter",
    hp: 18,
    damage: 7,
    speed: 2,
    range: 1,
    armor: 0,
    reward: 3,
    description:
      "Moves 2 tiles. Prefers your extractors and solar arrays. Intercept early.",
  },
  brute: {
    name: "Ironclad",
    hp: 60,
    damage: 18,
    speed: 1,
    range: 1,
    armor: 4,
    reward: 8,
    description:
      "Slow armored assault. Absorbs 4 damage per hit. Bring upgraded guns.",
  },
  siege: {
    name: "Spitter",
    hp: 36,
    damage: 10,
    speed: 1,
    range: 3,
    armor: 0,
    reward: 5,
    description:
      "Bombards structures from 3 tiles away. Outrange it with a mortar.",
  },
};
export const RESEARCH = {
  targeting: {
    name: "Targeting MK.II",
    alloy: 20,
    energy: 10,
    description: "+8 damage for all sentries and mortars.",
  },
  fortify: {
    name: "Reinforced core",
    alloy: 20,
    energy: 8,
    description:
      "+40 maximum core integrity. Immediately restores 40 integrity.",
  },
  logistics: {
    name: "Command uplink",
    alloy: 24,
    energy: 12,
    description: "Gain 4 orders each future cycle, instead of 3.",
  },
};
export const EVENTS = {
  wreck: {
    title: "A ghost on the scanner",
    description:
      "A wrecked survey ship lies in the ravine. Your crew can recover one intact system before its reactor collapses.",
    choices: [
      { id: "alloy", label: "Strip the hull", detail: "+18 alloy" },
      { id: "energy", label: "Recover power cells", detail: "+14 energy" },
    ],
  },
  relay: {
    title: "An old voice in the static",
    description:
      "A forgotten relay responds to your signal. Its last reserve can boost your distress call or power your repair drones.",
    choices: [
      { id: "signal", label: "Borrow the frequency", detail: "+20% signal" },
      {
        id: "repair",
        label: "Launch repair drones",
        detail: "+30 core integrity, +8 alloy",
      },
    ],
  },
  trader: {
    title: "The last supply drop",
    description:
      "An unmarked freighter offers a brief window for resupply. The pilot wants salvage, but leaves a repair kit either way.",
    choices: [
      {
        id: "trade",
        label: "Trade salvage for cells",
        detail: "−18 alloy, +30 energy",
      },
      {
        id: "kit",
        label: "Take the field kit",
        detail: "+25 core integrity, +12 alloy",
      },
    ],
  },
};
export const distance = (a, b) => Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
export function random(state) {
  state.seed = (state.seed * 1664525 + 1013904223) >>> 0;
  return state.seed / 4294967296;
}
export function addLog(state, text, tone = "normal") {
  state.log.unshift({ turn: state.turn, text, tone });
  state.log = state.log.slice(0, 80);
}
export function objective(state) {
  return SCENARIOS[state.scenario].turns;
}
export function maxOrders(state) {
  return state.tech.logistics ? 4 : 3;
}
export function maxHp(state, tile) {
  return tile.structure === "core"
    ? state.tech.fortify
      ? 140
      : 100
    : STRUCTURES[tile.structure]?.hp || 0;
}
export function score(state) {
  return (
    (state.turn - 1) * 100 +
    state.stats.kills * 40 +
    state.stats.relics * 150 +
    state.signal * 5 +
    (state.status === "won" ? 1000 : 0)
  );
}
export function createGame(
  seed = Date.now() >>> 0,
  scenario = "drift",
  difficulty = "cadet",
) {
  if (!SCENARIOS[scenario] || !DIFFICULTIES[difficulty])
    throw new Error("Unknown expedition settings.");
  const state = {
    version: 2,
    seed: seed >>> 0,
    scenario,
    difficulty,
    turn: 1,
    alloy: 36,
    energy: 18,
    orders: 3,
    signal: 0,
    status: "playing",
    selected: 54,
    upgraded: false,
    tech: { targeting: false, fortify: false, logistics: false },
    endless: false,
    pulseReady: 1,
    pendingEvent: null,
    nextRaid: [],
    effects: [],
    stats: { kills: 0, relics: 0, built: 0 },
    enemies: [],
    nextId: 1,
    log: [],
    tiles: [],
  };
  for (let y = 0; y < HEIGHT; y++)
    for (let x = 0; x < WIDTH; x++) {
      const r = random(state);
      state.tiles.push({
        x,
        y,
        terrain: r < 0.15 ? "rock" : r < 0.29 ? "ore" : "plain",
        structure: null,
        hp: 0,
        relic: false,
      });
    }
  for (let y = 3; y <= 5; y++)
    for (let x = 4; x <= 7; x++) state.tiles[y * WIDTH + x].terrain = "plain";
  Object.assign(state.tiles[54], {
    structure: "core",
    hp: 100,
    terrain: "plain",
  });
  Object.assign(state.tiles[53], {
    structure: "reactor",
    hp: 24,
    terrain: "plain",
  });
  Object.assign(state.tiles[42], { structure: "mine", hp: 28, terrain: "ore" });
  state.tiles[64].terrain = "ore";
  state.tiles[56].terrain = "ore";
  for (const index of [50, 69])
    Object.assign(state.tiles[index], { terrain: "plain", relic: true });
  addLog(state, "Touchdown confirmed. Colony command is yours.", "good");
  addLog(
    state,
    `Hold ${objective(state)} cycles. Charge the rescue signal to 100%.`,
  );
  state.nextRaid = forecast(state, 2);
  return state;
}
export function incomes(state) {
  return {
    alloy: 3 + state.tiles.filter((t) => t.structure === "mine").length * 5,
    energy:
      2 +
      state.tiles.filter((t) => t.structure === "reactor").length *
        SCENARIOS[state.scenario].solar,
  };
}
export function raidSize(turn, state) {
  if (turn < 2) return 0;
  const extra = state
    ? SCENARIOS[state.scenario].raidBonus +
      (turn >= 4 ? DIFFICULTIES[state.difficulty].bonus : 0)
    : 0;
  return Math.min(7, 1 + Math.floor((turn - 2) / 3) + extra);
}
function forecast(state, turn) {
  const wave = [];
  for (let i = 0; i < raidSize(turn, state); i++) {
    const side = Math.floor(random(state) * 4),
      edge = random(state);
    const roll = random(state);
    const type =
      turn >= 8 && roll < 0.22
        ? "siege"
        : turn >= 6 && roll < 0.44
          ? "brute"
          : turn >= 3 && roll < 0.68
            ? "scout"
            : "raider";
    wave.push({
      type,
      side,
      x: side === 0 ? 0 : side === 1 ? WIDTH - 1 : Math.floor(edge * WIDTH),
      y: side === 2 ? 0 : side === 3 ? HEIGHT - 1 : Math.floor(edge * HEIGHT),
    });
  }
  return wave;
}
function blocked(state) {
  if (state.status !== "playing") return "This expedition has ended.";
  if (state.pendingEvent) return "Resolve the incoming transmission first.";
  if (!state.orders) return "No orders left. End the cycle to continue.";
  return "";
}
export function buildReason(state, index, type) {
  const tile = state.tiles[index],
    spec = STRUCTURES[type];
  if (!tile || !spec) return "Unknown order.";
  const reason = blocked(state);
  if (reason) return reason;
  if (tile.structure) return "This tile already has a structure.";
  if (tile.relic) return "Recover this relic before building here.";
  if (tile.terrain === "rock") return "Rocky terrain cannot be built on.";
  if (spec.terrain && tile.terrain !== spec.terrain)
    return "Select an ore deposit for an extractor.";
  if (state.enemies.some((e) => e.x === tile.x && e.y === tile.y))
    return "A hostile occupies this tile.";
  if (!state.tiles.some((t) => t.structure && distance(t, tile) <= 2))
    return "Build within 2 tiles of an existing structure.";
  if (state.alloy < spec.alloy || state.energy < spec.energy)
    return "Insufficient resources.";
  return "";
}
export function build(state, index, type) {
  const reason = buildReason(state, index, type);
  if (reason) return { ok: false, message: reason };
  const spec = STRUCTURES[type];
  Object.assign(state.tiles[index], { structure: type, hp: spec.hp });
  state.alloy -= spec.alloy;
  state.energy -= spec.energy;
  state.orders--;
  state.stats.built++;
  state.effects = [
    { kind: "build", x: state.tiles[index].x, y: state.tiles[index].y },
  ];
  addLog(
    state,
    `${spec.short} deployed at ${coordinate(state.tiles[index])}.`,
    "good",
  );
  return { ok: true };
}
export function coordinate(tile) {
  return `${String.fromCharCode(65 + tile.x)}${String(tile.y + 1).padStart(2, "0")}`;
}
export function actionReason(state, type, index = state.selected) {
  const reason = blocked(state);
  if (reason) return reason;
  const t = state.tiles[index];
  if (type === "charge")
    return state.signal >= 100
      ? "Signal is fully charged."
      : state.energy < 10
        ? "Requires 10 energy."
        : "";
  if (type === "upgrade" || RESEARCH[type]) {
    const key = type === "upgrade" ? "targeting" : type,
      spec = RESEARCH[key];
    return state.tech[key]
      ? "Research already installed."
      : state.alloy < spec.alloy || state.energy < spec.energy
        ? `Requires ${spec.alloy} alloy and ${spec.energy} energy.`
        : "";
  }
  if (type === "repair")
    return !t?.structure
      ? "Select a structure to repair."
      : t.hp >= maxHp(state, t)
        ? "Structure is at full integrity."
        : state.alloy < 10 || state.energy < 4
          ? "Requires 10 alloy and 4 energy."
          : "";
  if (type === "salvage")
    return !t?.structure || t.structure === "core"
      ? "Select a non-core structure to salvage."
      : "";
  if (type === "recover")
    return !t?.relic
      ? "Select an ancient relic."
      : !state.tiles.some((s) => s.structure && distance(s, t) <= 2)
        ? "Expand within 2 tiles of this relic first."
        : state.enemies.some((e) => distance(e, t) === 0)
          ? "Clear the hostile from this relic first."
          : "";
  if (type === "pulse")
    return state.turn < state.pulseReady
      ? `Orbital pulse recharges in ${state.pulseReady - state.turn} cycles.`
      : state.energy < 12
        ? "Requires 12 energy."
        : !t || !state.enemies.some((e) => distance(e, t) <= 2)
          ? "Select a tile within 2 tiles of a hostile."
          : "";
  return "Unknown order.";
}
function damageEnemy(state, enemy, amount) {
  if (enemy.hp <= 0) return;
  enemy.hp -= Math.max(1, amount - (ENEMIES[enemy.type]?.armor || 0));
  if (enemy.hp <= 0) {
    state.stats.kills++;
    state.alloy += ENEMIES[enemy.type]?.reward || 3;
    state.effects.push({ kind: "kill", x: enemy.x, y: enemy.y });
  }
}
export function action(state, type, index = state.selected) {
  const reason = actionReason(state, type, index);
  if (reason) return { ok: false, message: reason };
  const tile = state.tiles[index];
  state.effects = [];
  if (type === "charge") {
    state.energy -= 10;
    state.signal = Math.min(100, state.signal + 20);
    addLog(state, `Rescue signal amplified to ${state.signal}%.`, "good");
  } else if (type === "upgrade" || RESEARCH[type]) {
    const key = type === "upgrade" ? "targeting" : type,
      spec = RESEARCH[key];
    state.alloy -= spec.alloy;
    state.energy -= spec.energy;
    state.tech[key] = true;
    if (key === "targeting") state.upgraded = true;
    if (key === "fortify")
      state.tiles.find((t) => t.structure === "core").hp += 40;
    addLog(state, `${spec.name} online. ${spec.description}`, "good");
  } else if (type === "repair") {
    state.alloy -= 10;
    state.energy -= 4;
    tile.hp = Math.min(maxHp(state, tile), tile.hp + 35);
    addLog(state, `Repair drones restored ${coordinate(tile)}.`, "good");
  } else if (type === "salvage") {
    const refund = Math.floor(STRUCTURES[tile.structure].alloy / 2);
    state.alloy += refund;
    tile.structure = null;
    tile.hp = 0;
    addLog(state, `Structure salvaged. Recovered ${refund} alloy.`);
  } else if (type === "recover") {
    tile.relic = false;
    state.alloy += 15;
    state.energy += 12;
    state.stats.relics++;
    addLog(state, "Ancient cache recovered: +15 alloy, +12 energy.", "good");
    state.effects.push({ kind: "build", x: tile.x, y: tile.y });
  } else if (type === "pulse") {
    state.energy -= 12;
    state.pulseReady = state.turn + 3;
    state.effects.push({ kind: "pulse", x: tile.x, y: tile.y });
    for (const enemy of state.enemies.filter((e) => distance(e, tile) <= 2))
      damageEnemy(state, enemy, 26);
    state.enemies = state.enemies.filter((e) => e.hp > 0);
    addLog(
      state,
      `Orbital pulse struck ${coordinate(tile)}. Recharging for 3 cycles.`,
      "good",
    );
  }
  state.orders--;
  checkEnd(state);
  return { ok: true };
}
function checkEnd(state) {
  const core = state.tiles.find((t) => t.structure === "core");
  if (!core || core.hp <= 0) {
    state.status = "lost";
    addLog(
      state,
      "Command core destroyed. The sector has fallen silent.",
      "danger",
    );
  } else if (
    !state.endless &&
    state.turn > objective(state) &&
    state.signal >= 100
  ) {
    state.status = "won";
    state.pendingEvent = null;
    addLog(
      state,
      "Signal received. Evacuation ship inbound. Mission complete.",
      "good",
    );
  }
}
export function continueEndless(state) {
  if (state.status !== "won")
    return { ok: false, message: "Complete the expedition first." };
  state.endless = true;
  state.status = "playing";
  state.orders = maxOrders(state);
  spawnRaid(state);
  state.nextRaid = forecast(state, state.turn + 1);
  addLog(state, "Evacuation declined. Endless defense engaged.", "good");
  return { ok: true };
}
function spawnRaid(state) {
  for (const entry of state.nextRaid) {
    const spec = ENEMIES[entry.type],
      scale = DIFFICULTIES[state.difficulty].damage;
    const late = Math.floor(Math.max(0, state.turn - 10) / 4);
    state.enemies.push({
      id: state.nextId++,
      ...entry,
      hp: spec.hp + late * 6,
      maxHp: spec.hp + late * 6,
      damage: Math.round((spec.damage + late * 2) * scale),
    });
    const tile = state.tiles[entry.y * WIDTH + entry.x];
    if (tile.terrain === "rock") tile.terrain = "plain";
  }
  if (state.nextRaid.length)
    addLog(
      state,
      `${state.nextRaid.length} hostile signatures entered the sector.`,
      "danger",
    );
}
// A short BFS makes terrain and barriers matter without trapping units in a greedy path.
export function nextStep(state, enemy, target, range = 1) {
  if (distance(enemy, target) <= range) return null;
  const queue = [{ x: enemy.x, y: enemy.y, first: null }],
    seen = new Set([enemy.y * WIDTH + enemy.x]);
  for (let i = 0; i < queue.length; i++) {
    const current = queue[i];
    const neighbors = [
      { x: current.x + 1, y: current.y },
      { x: current.x - 1, y: current.y },
      { x: current.x, y: current.y + 1 },
      { x: current.x, y: current.y - 1 },
    ].sort((a, b) => distance(a, target) - distance(b, target));
    for (const n of neighbors) {
      if (n.x < 0 || n.x >= WIDTH || n.y < 0 || n.y >= HEIGHT) continue;
      const index = n.y * WIDTH + n.x,
        tile = state.tiles[index];
      if (seen.has(index) || tile.terrain === "rock" || tile.structure)
        continue;
      seen.add(index);
      const first = current.first || n;
      if (distance(n, target) <= range) return first;
      queue.push({ ...n, first });
    }
  }
  return null;
}
export function resolveEvent(state, choice) {
  const event = EVENTS[state.pendingEvent];
  if (!event || !event.choices.some((c) => c.id === choice))
    return { ok: false, message: "Unknown transmission choice." };
  if (choice === "trade" && state.alloy < 18)
    return { ok: false, message: "Requires 18 alloy." };
  const core = state.tiles.find((t) => t.structure === "core");
  if (choice === "alloy") state.alloy += 18;
  if (choice === "energy") state.energy += 14;
  if (choice === "signal") state.signal = Math.min(100, state.signal + 20);
  if (choice === "repair" || choice === "kit") {
    core.hp = Math.min(
      maxHp(state, core),
      core.hp + (choice === "repair" ? 30 : 25),
    );
    state.alloy += choice === "repair" ? 8 : 12;
  }
  if (choice === "trade") {
    state.alloy -= 18;
    state.energy += 30;
  }
  addLog(
    state,
    `${event.title}: ${event.choices.find((c) => c.id === choice).detail}.`,
    "good",
  );
  state.pendingEvent = null;
  checkEnd(state);
  return { ok: true };
}
export function endTurn(state) {
  if (state.status !== "playing")
    return { ok: false, message: "This expedition has ended." };
  if (state.pendingEvent)
    return { ok: false, message: "Resolve the incoming transmission first." };
  state.effects = [];
  let brownout = false;
  const shields = state.tiles
    .filter((t) => t.structure === "shield")
    .filter(() => {
      if (state.energy < 1) {
        brownout = true;
        return false;
      }
      state.energy--;
      return true;
    });
  const killsBefore = state.stats.kills;
  for (const turret of state.tiles.filter(
    (t) => t.structure === "turret" || t.structure === "mortar",
  )) {
    const spec = STRUCTURES[turret.structure];
    const target = state.enemies
      .filter(
        (e) =>
          e.hp > 0 &&
          distance(e, turret) <= spec.range &&
          (turret.structure !== "mortar" || distance(e, turret) >= 2),
      )
      .sort((a, b) => distance(a, turret) - distance(b, turret))[0];
    if (!target) continue;
    if (state.energy < spec.upkeep) {
      brownout = true;
      continue;
    }
    state.energy -= spec.upkeep;
    state.effects.push({
      kind: "shot",
      x: turret.x,
      y: turret.y,
      tx: target.x,
      ty: target.y,
      mortar: turret.structure === "mortar",
    });
    const damage =
      (turret.structure === "mortar" ? 18 : 14) + (state.upgraded ? 8 : 0);
    const targets =
      turret.structure === "mortar"
        ? state.enemies.filter((e) => e.hp > 0 && distance(e, target) <= 1)
        : [target];
    for (const e of targets) damageEnemy(state, e, damage);
  }
  state.enemies = state.enemies.filter((e) => e.hp > 0);
  for (const enemy of state.enemies) {
    const spec = ENEMIES[enemy.type] || ENEMIES.raider;
    const targets = state.tiles
      .filter((t) => t.structure)
      .sort((a, b) => {
        const preference = (t) =>
          enemy.type === "scout" && ["reactor", "mine"].includes(t.structure)
            ? -3
            : 0;
        return (
          distance(a, enemy) +
          preference(a) -
          distance(b, enemy) -
          preference(b)
        );
      });
    let target;
    for (const candidate of targets)
      if (
        distance(enemy, candidate) <= spec.range ||
        nextStep(state, enemy, candidate, spec.range)
      ) {
        target = candidate;
        break;
      }
    if (!target) continue;
    for (let step = 0; step < spec.speed; step++) {
      const next = nextStep(state, enemy, target, spec.range);
      if (!next) break;
      enemy.x = next.x;
      enemy.y = next.y;
    }
    if (distance(enemy, target) <= spec.range) {
      const protectedBy = shields.some(
        (s) => s.structure === "shield" && s.hp > 0 && distance(s, target) <= 2,
      );
      const damage = Math.max(1, enemy.damage - (protectedBy ? 6 : 0));
      target.hp -= damage;
      state.effects.push({
        kind: "hit",
        x: target.x,
        y: target.y,
        amount: damage,
        shielded: protectedBy,
      });
      addLog(
        state,
        `${target.structure === "core" ? "Core" : STRUCTURES[target.structure].short} at ${coordinate(target)} hit for ${damage}${protectedBy ? " (shielded)" : ""}.`,
        "danger",
      );
      if (target.hp <= 0 && target.structure !== "core") {
        addLog(
          state,
          `${STRUCTURES[target.structure].short} destroyed at ${coordinate(target)}.`,
          "danger",
        );
        target.structure = null;
        target.hp = 0;
      }
    }
  }
  if (state.stats.kills > killsBefore)
    addLog(
      state,
      `${state.stats.kills - killsBefore} hostiles neutralized. Salvage recovered.`,
      "good",
    );
  if (brownout)
    addLog(
      state,
      "Power reserve depleted. Some defenses could not activate.",
      "danger",
    );
  checkEnd(state);
  if (state.status === "lost") return { ok: true };
  const income = incomes(state);
  state.alloy += income.alloy;
  state.energy += income.energy;
  state.turn++;
  state.orders = maxOrders(state);
  checkEnd(state);
  if (state.status === "playing") {
    spawnRaid(state);
    state.nextRaid = forecast(state, state.turn + 1);
    state.pendingEvent =
      { 4: "wreck", 7: "relay", 11: "trader" }[state.turn] || null;
    if (state.pendingEvent)
      addLog(
        state,
        "Incoming transmission. A decision awaits command.",
        "good",
      );
    if (!state.endless && state.turn > objective(state))
      addLog(
        state,
        "Rescue window open. Finish charging your signal!",
        "danger",
      );
  }
  return { ok: true };
}
function baseValid(state) {
  return (
    !!state &&
    Number.isInteger(state.turn) &&
    state.turn >= 1 &&
    Number.isInteger(state.seed) &&
    state.seed >= 0 &&
    state.seed <= 4294967295 &&
    Number.isInteger(state.nextId) &&
    state.nextId > 0 &&
    typeof state.upgraded === "boolean" &&
    Number.isInteger(state.selected) &&
    state.selected >= 0 &&
    state.selected < WIDTH * HEIGHT &&
    ["playing", "won", "lost"].includes(state.status) &&
    ["alloy", "energy", "signal", "orders"].every(
      (k) => Number.isFinite(state[k]) && state[k] >= 0,
    ) &&
    state.orders <= 4 &&
    state.signal <= 100 &&
    Array.isArray(state.tiles) &&
    state.tiles.length === WIDTH * HEIGHT &&
    state.tiles.every(
      (t, i) =>
        t &&
        t.x === i % WIDTH &&
        t.y === Math.floor(i / WIDTH) &&
        ["plain", "ore", "rock"].includes(t.terrain) &&
        (t.structure === null ||
          t.structure === "core" ||
          Object.hasOwn(STRUCTURES, t.structure)) &&
        Number.isFinite(t.hp),
    ) &&
    state.tiles.filter((t) => t.structure === "core").length === 1 &&
    Array.isArray(state.enemies) &&
    state.enemies.every(
      (e) =>
        e &&
        Number.isInteger(e.id) &&
        Number.isInteger(e.x) &&
        e.x >= 0 &&
        e.x < WIDTH &&
        Number.isInteger(e.y) &&
        e.y >= 0 &&
        e.y < HEIGHT &&
        Number.isFinite(e.hp) &&
        e.hp > 0 &&
        Number.isFinite(e.damage) &&
        e.damage > 0,
    ) &&
    Array.isArray(state.log) &&
    state.log.every(
      (l) =>
        l &&
        Number.isInteger(l.turn) &&
        typeof l.text === "string" &&
        ["normal", "good", "danger"].includes(l.tone),
    )
  );
}
export function validSave(state) {
  return (
    baseValid(state) &&
    state.version === 2 &&
    Object.hasOwn(SCENARIOS, state.scenario) &&
    Object.hasOwn(DIFFICULTIES, state.difficulty) &&
    typeof state.endless === "boolean" &&
    Number.isInteger(state.pulseReady) &&
    state.pulseReady >= 1 &&
    !!state.tech &&
    Object.keys(RESEARCH).every((k) => typeof state.tech[k] === "boolean") &&
    state.upgraded === state.tech.targeting &&
    state.orders <= maxOrders(state) &&
    !!state.stats &&
    ["kills", "relics", "built"].every(
      (k) => Number.isInteger(state.stats[k]) && state.stats[k] >= 0,
    ) &&
    (state.pendingEvent === null ||
      Object.hasOwn(EVENTS, state.pendingEvent)) &&
    Array.isArray(state.nextRaid) &&
    state.nextRaid.length <= 7 &&
    state.nextRaid.every(
      (e) =>
        e &&
        Object.hasOwn(ENEMIES, e.type) &&
        Number.isInteger(e.side) &&
        e.side >= 0 &&
        e.side < 4 &&
        Number.isInteger(e.x) &&
        e.x >= 0 &&
        e.x < WIDTH &&
        Number.isInteger(e.y) &&
        e.y >= 0 &&
        e.y < HEIGHT,
    ) &&
    state.tiles.every((t) => typeof t.relic === "boolean") &&
    state.enemies.every(
      (e) =>
        Object.hasOwn(ENEMIES, e.type) &&
        Number.isFinite(e.maxHp) &&
        e.maxHp >= e.hp,
    )
  );
}
export function loadSave(saved) {
  if (validSave(saved)) return { ...saved, effects: [] };
  if (saved?.version !== 1 || !baseValid(saved) || saved.orders > 3)
    return null;
  const state = {
    ...saved,
    version: 2,
    scenario: "drift",
    difficulty: "cadet",
    endless: false,
    pulseReady: saved.turn,
    pendingEvent: null,
    nextRaid: [],
    effects: [],
    tech: { targeting: saved.upgraded, fortify: false, logistics: false },
    stats: { kills: 0, relics: 0, built: 0 },
    tiles: saved.tiles.map((t) => ({ ...t, relic: false })),
    enemies: saved.enemies.map((e) => ({
      ...e,
      type: "raider",
      maxHp: Math.max(24, e.hp),
    })),
  };
  state.nextRaid = forecast(state, state.turn + 1);
  addLog(
    state,
    "Command interface upgraded. Your expedition has been preserved.",
    "good",
  );
  return validSave(state) ? state : null;
}
