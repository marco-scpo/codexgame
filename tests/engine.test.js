import test from "node:test";
import assert from "node:assert/strict";
import {
  createGame,
  build,
  buildReason,
  action,
  endTurn,
  incomes,
  validSave,
  STRUCTURES,
  ENEMIES,
  SCENARIOS,
  loadSave,
  resolveEvent,
  nextStep,
  maxHp,
  maxOrders,
  continueEndless,
  objective,
  actionReason,
} from "../src/engine.js";

test("seeded sectors and raids are reproducible", () => {
  const a = createGame(42),
    b = createGame(42);
  for (let i = 0; i < 5; i++) {
    endTurn(a);
    endTurn(b);
  }
  assert.deepEqual(a, b);
  assert.notDeepEqual(createGame(42).tiles, createGame(43).tiles);
});
test("building spends exact resources and one order", () => {
  const g = createGame(42);
  assert.equal(build(g, 55, "turret").ok, true);
  assert.equal(g.alloy, 18);
  assert.equal(g.energy, 13);
  assert.equal(g.orders, 2);
  assert.equal(g.tiles[55].hp, STRUCTURES.turret.hp);
});
test("invalid building orders never spend resources", () => {
  const g = createGame(42),
    before = structuredClone(g);
  assert.equal(build(g, 54, "mine").ok, false);
  assert.equal(build(g, 55, "mine").ok, false);
  assert.deepEqual(g, before);
  g.tiles[0].terrain = "plain";
  assert.match(buildReason(g, 0, "wall"), /within 2/);
  g.tiles[55].terrain = "rock";
  assert.match(buildReason(g, 55, "wall"), /Rocky/);
});
test("orders are capped and renew each cycle", () => {
  const g = createGame(42);
  g.alloy = 100;
  g.energy = 100;
  for (let i = 0; i < 3; i++) assert.equal(action(g, "charge").ok, true);
  assert.equal(action(g, "charge").ok, false);
  endTurn(g);
  assert.equal(g.orders, 3);
  assert.equal(g.turn, 2);
});
test("income includes only surviving extractors and solar arrays", () => {
  const g = createGame(42);
  assert.deepEqual(incomes(g), { alloy: 8, energy: 6 });
  build(g, 64, "mine");
  assert.deepEqual(incomes(g), { alloy: 13, energy: 6 });
  const before = g.alloy;
  endTurn(g);
  assert.equal(g.alloy, before + 13);
});
test("signal charge cannot exceed 100 or spend at full charge", () => {
  const g = createGame(42);
  g.energy = 100;
  for (let i = 0; i < 5; i++) {
    g.orders = 3;
    action(g, "charge");
  }
  const before = structuredClone(g);
  assert.equal(g.signal, 100);
  assert.equal(action(g, "charge").ok, false);
  assert.deepEqual(g, before);
});
test("repairs cap at maximum health and reject full health", () => {
  const g = createGame(42);
  g.tiles[54].hp = 90;
  assert.equal(action(g, "repair").ok, true);
  assert.equal(g.tiles[54].hp, 100);
  const before = structuredClone(g);
  assert.equal(action(g, "repair").ok, false);
  assert.deepEqual(g, before);
});
test("salvage recovers half cost and cannot remove the core", () => {
  const g = createGame(42);
  assert.equal(action(g, "salvage", 54).ok, false);
  assert.equal(action(g, "salvage", 53).ok, true);
  assert.equal(g.tiles[53].structure, null);
  assert.equal(g.alloy, 41);
});
test("sentries fire before raiders move and recover salvage for kills", () => {
  const g = createGame(42);
  build(g, 55, "turret");
  g.enemies = [{ id: 99, x: 8, y: 4, hp: 14, damage: 10 }];
  const before = g.alloy;
  endTurn(g);
  assert.equal(
    g.enemies.some((e) => e.id === 99),
    false,
  );
  assert.equal(g.alloy, before + 3 + 8);
});
test("upgraded sentries do 22 damage and out-of-range raiders survive", () => {
  const g = createGame(42);
  g.alloy = 100;
  g.energy = 100;
  build(g, 55, "turret");
  action(g, "upgrade");
  g.enemies = [
    { id: 99, x: 8, y: 4, hp: 32, damage: 14 },
    { id: 98, x: 0, y: 0, hp: 24, damage: 10 },
  ];
  endTurn(g);
  assert.equal(g.enemies.find((e) => e.id === 99).hp, 10);
  assert.equal(g.enemies.find((e) => e.id === 98).hp, 24);
});
test("adjacent raiders damage and destroy structures", () => {
  const g = createGame(42);
  g.tiles[42].hp = 10;
  g.enemies = [{ id: 99, x: 6, y: 2, hp: 24, damage: 10 }];
  endTurn(g);
  assert.equal(g.tiles[42].structure, null);
  assert.deepEqual(incomes(g), { alloy: 3, energy: 6 });
});
test("losing the core ends play and does not grant another cycle", () => {
  const g = createGame(42);
  g.tiles[54].hp = 10;
  g.enemies = [{ id: 99, x: 7, y: 4, hp: 24, damage: 10 }];
  endTurn(g);
  assert.equal(g.status, "lost");
  assert.equal(g.turn, 1);
  const before = structuredClone(g);
  endTurn(g);
  action(g, "charge");
  assert.deepEqual(g, before);
});
test("rescue requires surviving ten complete cycles AND a full signal", () => {
  const g = createGame(42);
  g.signal = 100;
  g.turn = 10;
  endTurn(g);
  assert.equal(g.status, "won");
  assert.equal(g.turn, 11);
  const h = createGame(42);
  h.turn = 10;
  endTurn(h);
  assert.equal(h.status, "playing");
  h.energy = 100;
  h.signal = 80;
  resolveEvent(h, "kit");
  action(h, "charge");
  assert.equal(h.status, "won");
});
test("saved expeditions round-trip and malformed saves are rejected", () => {
  const g = createGame(42);
  endTurn(g);
  assert.equal(validSave(JSON.parse(JSON.stringify(g))), true);
  for (const bad of [
    null,
    {},
    { ...g, tiles: [] },
    { ...g, orders: 99 },
    { ...g, enemies: [null] },
    { ...g, selected: -1 },
    { ...g, log: [{ turn: 1, text: "x", tone: "fake" }] },
  ])
    assert.equal(validSave(bad), false);
});

function enemy(type, x, y, id = 99) {
  const s = ENEMIES[type];
  return { id, type, x, y, hp: s.hp, maxHp: s.hp, damage: s.damage };
}
function clearGround(g) {
  for (const t of g.tiles)
    if (!t.structure) {
      t.terrain = "plain";
      t.relic = false;
    }
}

test("new sectors have distinct extraction windows, power output, and forecasts", () => {
  for (const key of Object.keys(SCENARIOS)) {
    const g = createGame(42, key);
    assert.equal(objective(g), SCENARIOS[key].turns);
    assert.equal(incomes(g).energy, 2 + SCENARIOS[key].solar);
    assert.equal(validSave(g), true);
  }
  assert.equal(createGame(42, "night").nextRaid.length, 2);
});
test("forecast tiles and classes exactly match the arriving wave", () => {
  const g = createGame(42, "night"),
    forecast = structuredClone(g.nextRaid);
  endTurn(g);
  assert.deepEqual(
    g.enemies.map(({ type, side, x, y }) => ({ type, side, x, y })),
    forecast,
  );
  assert.equal(g.nextRaid.length, 2);
});
test("pathfinding goes around rocks and never walks through structures", () => {
  const g = createGame(42);
  clearGround(g);
  g.tiles[51].terrain = "rock";
  const step = nextStep(g, enemy("raider", 2, 4), g.tiles[54]);
  assert.notDeepEqual(step, { x: 3, y: 4 });
  assert.equal(g.tiles[step.y * 12 + step.x].structure, null);
  assert.notEqual(g.tiles[step.y * 12 + step.x].terrain, "rock");
});
test("skitters move two tiles toward vulnerable economy structures", () => {
  const g = createGame(42);
  clearGround(g);
  g.enemies = [enemy("scout", 0, 4)];
  endTurn(g);
  const e = g.enemies.find((e) => e.id === 99);
  assert.equal(Math.abs(e.x) + Math.abs(e.y - 4), 2);
});
test("spitters attack from three tiles away", () => {
  const g = createGame(42);
  clearGround(g);
  g.enemies = [enemy("siege", 6, 0)];
  const before = g.tiles[42].hp;
  endTurn(g);
  assert.equal(g.tiles[42].hp, before - 10);
  assert.equal(g.enemies.find((e) => e.id === 99).y, 0);
});
test("ironclad armor reduces weapon damage", () => {
  const g = createGame(42);
  build(g, 55, "turret");
  g.enemies = [enemy("brute", 8, 4)];
  endTurn(g);
  assert.equal(g.enemies.find((e) => e.id === 99).hp, 50);
});
test("mortars damage neighboring enemies but cannot target adjacent tiles", () => {
  const g = createGame(42);
  g.alloy = 100;
  g.energy = 100;
  build(g, 55, "mortar");
  g.enemies = [enemy("raider", 9, 4), enemy("raider", 9, 5, 98)];
  endTurn(g);
  assert.equal(g.enemies.find((e) => e.id === 99).hp, 6);
  assert.equal(g.enemies.find((e) => e.id === 98).hp, 6);
  const h = createGame(42);
  h.alloy = 100;
  h.energy = 100;
  build(h, 55, "mortar");
  h.enemies = [enemy("raider", 8, 4)];
  endTurn(h);
  assert.equal(h.enemies.find((e) => e.id === 99).hp, 24);
});
test("shield pylons absorb six damage and do not stack", () => {
  const g = createGame(42);
  g.alloy = 100;
  g.energy = 100;
  build(g, 55, "shield");
  build(g, 65, "shield");
  g.enemies = [enemy("raider", 6, 5)];
  const before = g.tiles[54].hp;
  endTurn(g);
  assert.equal(g.tiles[54].hp, before - 4);
});
test("unpowered defenses cannot fire or shield", () => {
  const g = createGame(42);
  build(g, 55, "turret");
  g.energy = 0;
  g.enemies = [enemy("raider", 8, 4)];
  endTurn(g);
  assert.equal(g.enemies.find((e) => e.id === 99).hp, 24);
  assert.equal(g.energy, 6);
  assert.ok(g.log.some((l) => l.text.includes("depleted")));
});
test("orbital pulse respects radius, armor, cooldown, and rejected order costs", () => {
  const g = createGame(42);
  g.energy = 100;
  g.enemies = [
    enemy("raider", 6, 4),
    enemy("brute", 7, 4, 98),
    enemy("raider", 0, 0, 97),
  ];
  assert.equal(action(g, "pulse", 54).ok, true);
  assert.equal(g.energy, 88);
  assert.equal(g.orders, 2);
  assert.equal(
    g.enemies.some((e) => e.id === 99),
    false,
  );
  assert.equal(g.enemies.find((e) => e.id === 98).hp, 38);
  assert.equal(g.enemies.find((e) => e.id === 97).hp, 24);
  const before = structuredClone(g);
  assert.equal(action(g, "pulse", 54).ok, false);
  assert.deepEqual(g, before);
});
test("relic recovery requires expansion, consumes one order, and only pays once", () => {
  const g = createGame(42);
  assert.equal(action(g, "recover", 50).ok, false);
  clearGround(g);
  g.tiles[50].relic = true;
  build(g, 52, "wall");
  const before = g.alloy;
  assert.equal(action(g, "recover", 50).ok, true);
  assert.equal(g.alloy, before + 15);
  assert.equal(g.stats.relics, 1);
  assert.equal(action(g, "recover", 50).ok, false);
});
test("fortification increases core capacity and uplink grants orders next cycle", () => {
  const g = createGame(42);
  g.alloy = 100;
  g.energy = 100;
  action(g, "fortify");
  assert.equal(maxHp(g, g.tiles[54]), 140);
  assert.equal(g.tiles[54].hp, 140);
  action(g, "logistics");
  assert.equal(g.orders, 1);
  assert.equal(maxOrders(g), 4);
  endTurn(g);
  assert.equal(g.orders, 4);
});
test("transmission decisions block orders, survive saving, and resolve without order cost", () => {
  const g = createGame(42);
  for (let i = 0; i < 3; i++) endTurn(g);
  assert.equal(g.pendingEvent, "wreck");
  assert.equal(validSave(g), true);
  const saved = loadSave(JSON.parse(JSON.stringify(g)));
  assert.equal(saved.pendingEvent, "wreck");
  assert.equal(endTurn(g).ok, false);
  assert.equal(action(g, "charge").ok, false);
  assert.equal(build(g, 55, "wall").ok, false);
  const before = g.alloy,
    orders = g.orders;
  assert.equal(resolveEvent(g, "alloy").ok, true);
  assert.equal(g.alloy, before + 18);
  assert.equal(g.orders, orders);
  assert.equal(g.pendingEvent, null);
  assert.equal(resolveEvent(g, "alloy").ok, false);
});
test("unaffordable trade choices leave state untouched", () => {
  const g = createGame(42);
  g.pendingEvent = "trader";
  g.alloy = 0;
  const before = structuredClone(g);
  assert.equal(resolveEvent(g, "trade").ok, false);
  assert.deepEqual(g, before);
  assert.equal(resolveEvent(g, "kit").ok, true);
  assert.equal(g.alloy, 12);
});
test("rescue can continue into endless mode while the core remains vulnerable", () => {
  const g = createGame(42);
  g.turn = 10;
  g.signal = 100;
  endTurn(g);
  assert.equal(g.status, "won");
  assert.equal(continueEndless(g).ok, true);
  assert.equal(g.endless, true);
  assert.equal(g.status, "playing");
  const before = g.turn;
  endTurn(g);
  assert.equal(g.turn, before + 1);
  assert.equal(g.status, "playing");
});
test("version one saves migrate without losing progress, tiles, or resources", () => {
  const legacy = createGame(42);
  legacy.version = 1;
  legacy.turn = 6;
  legacy.signal = 40;
  legacy.alloy = 73;
  legacy.upgraded = true;
  legacy.enemies = [{ id: 1, x: 0, y: 4, hp: 32, damage: 14 }];
  const migrated = loadSave(legacy);
  assert.equal(validSave(migrated), true);
  assert.equal(migrated.turn, 6);
  assert.equal(migrated.signal, 40);
  assert.equal(migrated.alloy, 73);
  assert.equal(migrated.tech.targeting, true);
  assert.equal(migrated.tiles[54].hp, 100);
  assert.equal(migrated.enemies[0].hp, 32);
  assert.equal(migrated.enemies[0].type, "raider");
});
test("new save validation rejects hostile types, impossible orders, and bad tech", () => {
  const g = createGame(42);
  for (const bad of [
    { ...g, orders: 4 },
    { ...g, scenario: "toString" },
    { ...g, nextRaid: [{ type: "fake" }] },
    { ...g, tech: null },
    { ...g, stats: { kills: -1, relics: 0, built: 0 } },
  ])
    assert.equal(validSave(bad), false);
});
