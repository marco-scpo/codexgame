import test from 'node:test';
import assert from 'node:assert/strict';
import { createGame, build, buildReason, action, endTurn, incomes, validSave, STRUCTURES } from '../src/engine.js';

test('seeded sectors and raids are reproducible', () => {
  const a = createGame(42), b = createGame(42);
  for (let i = 0; i < 5; i++) { endTurn(a); endTurn(b); }
  assert.deepEqual(a, b);
  assert.notDeepEqual(createGame(42).tiles, createGame(43).tiles);
});
test('building spends exact resources and one order', () => {
  const g = createGame(42);
  assert.equal(build(g, 55, 'turret').ok, true);
  assert.equal(g.alloy, 18); assert.equal(g.energy, 13); assert.equal(g.orders, 2);
  assert.equal(g.tiles[55].hp, STRUCTURES.turret.hp);
});
test('invalid building orders never spend resources', () => {
  const g = createGame(42), before = structuredClone(g);
  assert.equal(build(g, 54, 'mine').ok, false);
  assert.equal(build(g, 55, 'mine').ok, false);
  assert.deepEqual(g, before);
  g.tiles[0].terrain = 'plain';
  assert.match(buildReason(g, 0, 'wall'), /within 2/);
  g.tiles[55].terrain = 'rock';
  assert.match(buildReason(g, 55, 'wall'), /Rocky/);
});
test('orders are capped and renew each cycle', () => {
  const g = createGame(42);
  g.alloy = 100; g.energy = 100;
  for (let i = 0; i < 3; i++) assert.equal(action(g, 'charge').ok, true);
  assert.equal(action(g, 'charge').ok, false);
  endTurn(g); assert.equal(g.orders, 3); assert.equal(g.turn, 2);
});
test('income includes only surviving extractors and solar arrays', () => {
  const g = createGame(42);
  assert.deepEqual(incomes(g), { alloy: 8, energy: 6 });
  build(g, 64, 'mine');
  assert.deepEqual(incomes(g), { alloy: 13, energy: 6 });
  const before = g.alloy; endTurn(g); assert.equal(g.alloy, before + 13);
});
test('signal charge cannot exceed 100 or spend at full charge', () => {
  const g = createGame(42); g.energy = 100;
  for (let i = 0; i < 5; i++) { g.orders = 3; action(g, 'charge'); }
  const before = structuredClone(g);
  assert.equal(g.signal, 100); assert.equal(action(g, 'charge').ok, false);
  assert.deepEqual(g, before);
});
test('repairs cap at maximum health and reject full health', () => {
  const g = createGame(42); g.tiles[54].hp = 90;
  assert.equal(action(g, 'repair').ok, true); assert.equal(g.tiles[54].hp, 100);
  const before = structuredClone(g);
  assert.equal(action(g, 'repair').ok, false); assert.deepEqual(g, before);
});
test('salvage recovers half cost and cannot remove the core', () => {
  const g = createGame(42);
  assert.equal(action(g, 'salvage', 54).ok, false);
  assert.equal(action(g, 'salvage', 53).ok, true);
  assert.equal(g.tiles[53].structure, null); assert.equal(g.alloy, 41);
});
test('sentries fire before raiders move and recover salvage for kills', () => {
  const g = createGame(42); build(g, 55, 'turret');
  g.enemies = [{ id: 99, x: 8, y: 4, hp: 14, damage: 10 }];
  const before = g.alloy; endTurn(g);
  assert.equal(g.enemies.some(e => e.id === 99), false);
  assert.equal(g.alloy, before + 3 + 8);
});
test('upgraded sentries do 22 damage and out-of-range raiders survive', () => {
  const g = createGame(42); g.alloy = 100; g.energy = 100;
  build(g, 55, 'turret'); action(g, 'upgrade');
  g.enemies = [{ id: 99, x: 8, y: 4, hp: 32, damage: 14 }, { id: 98, x: 0, y: 0, hp: 24, damage: 10 }];
  endTurn(g);
  assert.equal(g.enemies.find(e => e.id === 99).hp, 10);
  assert.equal(g.enemies.find(e => e.id === 98).hp, 24);
});
test('adjacent raiders damage and destroy structures', () => {
  const g = createGame(42); g.tiles[42].hp = 10;
  g.enemies = [{ id: 99, x: 6, y: 2, hp: 24, damage: 10 }];
  endTurn(g);
  assert.equal(g.tiles[42].structure, null);
  assert.deepEqual(incomes(g), { alloy: 3, energy: 6 });
});
test('losing the core ends play and does not grant another cycle', () => {
  const g = createGame(42); g.tiles[54].hp = 10;
  g.enemies = [{ id: 99, x: 7, y: 4, hp: 24, damage: 10 }];
  endTurn(g); assert.equal(g.status, 'lost'); assert.equal(g.turn, 1);
  const before = structuredClone(g); endTurn(g); action(g, 'charge');
  assert.deepEqual(g, before);
});
test('rescue requires surviving ten complete cycles AND a full signal', () => {
  const g = createGame(42); g.signal = 100; g.turn = 10;
  endTurn(g); assert.equal(g.status, 'won'); assert.equal(g.turn, 11);
  const h = createGame(42); h.turn = 10; endTurn(h);
  assert.equal(h.status, 'playing'); h.energy = 100; h.signal = 80;
  action(h, 'charge'); assert.equal(h.status, 'won');
});
test('saved expeditions round-trip and malformed saves are rejected', () => {
  const g = createGame(42); endTurn(g);
  assert.equal(validSave(JSON.parse(JSON.stringify(g))), true);
  for (const bad of [null, {}, { ...g, tiles: [] }, { ...g, orders: 99 }, { ...g, enemies: [null] }, { ...g, selected: -1 }, { ...g, log: [{ turn: 1, text: 'x', tone: 'fake' }] }]) assert.equal(validSave(bad), false);
});
