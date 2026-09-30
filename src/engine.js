export const WIDTH = 12;
export const HEIGHT = 9;
export const LAST_TURN = 10;
export const STRUCTURES = {
  mine: { name: 'Alloy extractor', short: 'Extractor', alloy: 12, energy: 0, hp: 28, description: '+5 alloy each cycle. Requires an ore deposit.', terrain: 'ore' },
  reactor: { name: 'Solar array', short: 'Solar array', alloy: 10, energy: 2, hp: 24, description: '+4 energy each cycle. Keep the signal alive.' },
  turret: { name: 'Sentry turret', short: 'Sentry', alloy: 18, energy: 5, hp: 36, description: 'Deals 14 damage to the nearest raider within 3 tiles.' },
  wall: { name: 'Blast barrier', short: 'Barrier', alloy: 8, energy: 0, hp: 60, description: 'Absorbs incoming attacks. Protect your outer perimeter.' },
};
const distance = (a, b) => Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
export function random(state) {
  state.seed = (state.seed * 1664525 + 1013904223) >>> 0;
  return state.seed / 4294967296;
}
export function addLog(state, text, tone = 'normal') {
  state.log.unshift({ turn: state.turn, text, tone });
  state.log = state.log.slice(0, 40);
}
export function createGame(seed = Date.now() >>> 0) {
  const state = { version: 1, seed, turn: 1, alloy: 36, energy: 18, orders: 3, signal: 0, status: 'playing', selected: 54, upgraded: false, enemies: [], nextId: 1, log: [], tiles: [] };
  for (let y = 0; y < HEIGHT; y++) for (let x = 0; x < WIDTH; x++) {
    const r = random(state);
    state.tiles.push({ x, y, terrain: r < 0.15 ? 'rock' : r < 0.28 ? 'ore' : 'plain', structure: null, hp: 0 });
  }
  for (let y = 3; y <= 5; y++) for (let x = 4; x <= 7; x++) state.tiles[y * WIDTH + x].terrain = 'plain';
  Object.assign(state.tiles[54], { structure: 'core', hp: 100, terrain: 'plain' });
  Object.assign(state.tiles[53], { structure: 'reactor', hp: 24, terrain: 'plain' });
  Object.assign(state.tiles[42], { structure: 'mine', hp: 28, terrain: 'ore' });
  state.tiles[64].terrain = 'ore';
  state.tiles[56].terrain = 'ore';
  addLog(state, 'Touchdown confirmed. Welcome to the edge of nowhere.', 'good');
  addLog(state, 'Hold for 10 cycles. Charge the distress signal to 100%.');
  return state;
}
export function incomes(state) {
  return { alloy: 3 + state.tiles.filter(t => t.structure === 'mine').length * 5, energy: 2 + state.tiles.filter(t => t.structure === 'reactor').length * 4 };
}
export function raidSize(turn) { return turn < 2 ? 0 : Math.min(4, 1 + Math.floor((turn - 2) / 3)); }
export function buildReason(state, index, type) {
  const tile = state.tiles[index], spec = STRUCTURES[type];
  if (!tile || !spec) return 'Unknown order.';
  if (state.status !== 'playing') return 'This expedition has ended.';
  if (!state.orders) return 'No orders left. End the cycle to continue.';
  if (tile.structure) return 'This tile already has a structure.';
  if (tile.terrain === 'rock') return 'Rocky terrain cannot be built on.';
  if (spec.terrain && tile.terrain !== spec.terrain) return 'Select an ore deposit for an extractor.';
  if (state.enemies.some(e => e.x === tile.x && e.y === tile.y)) return 'A raider occupies this tile.';
  if (!state.tiles.some(t => t.structure && distance(t, tile) <= 2)) return 'Build within 2 tiles of an existing structure.';
  if (state.alloy < spec.alloy || state.energy < spec.energy) return 'Insufficient resources.';
  return '';
}
export function build(state, index, type) {
  const reason = buildReason(state, index, type);
  if (reason) return { ok: false, message: reason };
  const spec = STRUCTURES[type];
  Object.assign(state.tiles[index], { structure: type, hp: spec.hp });
  state.alloy -= spec.alloy; state.energy -= spec.energy; state.orders--;
  addLog(state, `${spec.short} deployed at ${coordinate(state.tiles[index])}.`, 'good');
  return { ok: true };
}
export function coordinate(tile) { return `${String.fromCharCode(65 + tile.x)}${String(tile.y + 1).padStart(2, '0')}`; }
export function action(state, type, index = state.selected) {
  if (state.status !== 'playing') return { ok: false, message: 'Start a new expedition to play again.' };
  if (!state.orders) return { ok: false, message: 'No orders left. End the cycle to continue.' };
  const tile = state.tiles[index];
  if (type === 'charge') {
    if (state.signal >= 100) return { ok: false, message: 'Your signal is already fully charged.' };
    if (state.energy < 10) return { ok: false, message: 'Charging requires 10 energy.' };
    state.energy -= 10; state.signal += 20;
    addLog(state, `Distress signal amplified to ${state.signal}%.`, 'good');
  } else if (type === 'upgrade') {
    if (state.upgraded) return { ok: false, message: 'Sentry upgrade already installed.' };
    if (state.alloy < 20 || state.energy < 10) return { ok: false, message: 'Upgrade requires 20 alloy and 10 energy.' };
    state.alloy -= 20; state.energy -= 10; state.upgraded = true;
    addLog(state, 'Targeting MK.II online. Sentries now deal 22 damage.', 'good');
  } else if (type === 'repair') {
    if (!tile?.structure) return { ok: false, message: 'Select a structure to repair.' };
    const maxHp = tile.structure === 'core' ? 100 : STRUCTURES[tile.structure].hp;
    if (tile.hp >= maxHp) return { ok: false, message: 'This structure is already at full integrity.' };
    if (state.alloy < 10 || state.energy < 4) return { ok: false, message: 'Repair requires 10 alloy and 4 energy.' };
    state.alloy -= 10; state.energy -= 4; tile.hp = Math.min(maxHp, tile.hp + 35);
    addLog(state, `${tile.structure === 'core' ? 'Command core' : STRUCTURES[tile.structure].short} repaired at ${coordinate(tile)}.`, 'good');
  } else if (type === 'salvage') {
    if (!tile?.structure || tile.structure === 'core') return { ok: false, message: 'Select a non-core structure to salvage.' };
    const refund = Math.floor(STRUCTURES[tile.structure].alloy / 2);
    state.alloy += refund; tile.structure = null; tile.hp = 0;
    addLog(state, `Structure salvaged. Recovered ${refund} alloy.`);
  } else return { ok: false, message: 'Unknown order.' };
  state.orders--;
  checkEnd(state);
  return { ok: true };
}
function checkEnd(state) {
  const core = state.tiles.find(t => t.structure === 'core');
  if (!core || core.hp <= 0) {
    state.status = 'lost'; addLog(state, 'Command core lost. The sector has fallen silent.', 'danger');
  } else if (state.turn > LAST_TURN && state.signal >= 100) {
    state.status = 'won'; addLog(state, 'Signal received. Evacuation ship inbound. You made it.', 'good');
  }
}
function spawnRaid(state) {
  const count = raidSize(state.turn);
  for (let i = 0; i < count; i++) {
    const side = Math.floor(random(state) * 4);
    const edge = random(state);
    const x = side === 0 ? 0 : side === 1 ? WIDTH - 1 : Math.floor(edge * WIDTH);
    const y = side === 2 ? 0 : side === 3 ? HEIGHT - 1 : Math.floor(edge * HEIGHT);
    state.enemies.push({ id: state.nextId++, x, y, hp: state.turn >= 7 ? 32 : 24, damage: state.turn >= 7 ? 14 : 10 });
  }
  if (count) addLog(state, `${count} raider${count > 1 ? 's' : ''} detected on the perimeter.`, 'danger');
}
export function endTurn(state) {
  if (state.status !== 'playing') return { ok: false, message: 'This expedition has ended.' };
  let kills = 0;
  const fire = () => {
    for (const turret of state.tiles.filter(t => t.structure === 'turret')) {
      const target = state.enemies.filter(e => e.hp > 0 && distance(e, turret) <= 3).sort((a, b) => distance(a, turret) - distance(b, turret))[0];
      if (target) { target.hp -= state.upgraded ? 22 : 14; if (target.hp <= 0) { kills++; state.alloy += 3; } }
    }
    state.enemies = state.enemies.filter(e => e.hp > 0);
  };
  fire();
  for (const enemy of state.enemies) {
    const targets = state.tiles.filter(t => t.structure).sort((a, b) => distance(a, enemy) - distance(b, enemy));
    const target = targets[0];
    if (!target) break;
    if (distance(enemy, target) > 1) {
      const dx = target.x - enemy.x, dy = target.y - enemy.y;
      if (Math.abs(dx) >= Math.abs(dy)) enemy.x += Math.sign(dx); else enemy.y += Math.sign(dy);
    }
    if (distance(enemy, target) <= 1) {
      target.hp -= enemy.damage;
      addLog(state, `${target.structure === 'core' ? 'Command core' : STRUCTURES[target.structure].short} hit at ${coordinate(target)}: −${enemy.damage} integrity.`, 'danger');
      if (target.hp <= 0 && target.structure !== 'core') { addLog(state, `${STRUCTURES[target.structure].short} destroyed.`, 'danger'); target.structure = null; target.hp = 0; }
    }
  }
  if (kills) addLog(state, `Sentries neutralized ${kills} raider${kills > 1 ? 's' : ''}. Salvage recovered.`, 'good');
  checkEnd(state);
  if (state.status === 'lost') return { ok: true };
  const income = incomes(state); state.alloy += income.alloy; state.energy += income.energy;
  state.turn++; state.orders = 3;
  checkEnd(state);
  if (state.status === 'playing') {
    spawnRaid(state);
    if (state.turn > LAST_TURN) addLog(state, 'Evacuation window open. Finish charging your signal!', 'danger');
  }
  return { ok: true };
}
export function validSave(state) {
  return !!state && state.version === 1 && Number.isInteger(state.turn) && state.turn >= 1 &&
    Number.isInteger(state.seed) && Number.isInteger(state.nextId) && typeof state.upgraded === 'boolean' &&
    Number.isInteger(state.selected) && state.selected >= 0 && state.selected < WIDTH * HEIGHT &&
    ['playing', 'won', 'lost'].includes(state.status) &&
    ['alloy', 'energy', 'signal', 'orders'].every(k => Number.isFinite(state[k]) && state[k] >= 0) && state.orders <= 3 && state.signal <= 100 &&
    Array.isArray(state.tiles) && state.tiles.length === WIDTH * HEIGHT && state.tiles.every((t, i) => t && t.x === i % WIDTH && t.y === Math.floor(i / WIDTH) && ['plain', 'ore', 'rock'].includes(t.terrain) && (t.structure === null || t.structure === 'core' || !!STRUCTURES[t.structure]) && Number.isFinite(t.hp)) &&
    Array.isArray(state.enemies) && state.enemies.every(e => e && Number.isInteger(e.id) && Number.isInteger(e.x) && e.x >= 0 && e.x < WIDTH && Number.isInteger(e.y) && e.y >= 0 && e.y < HEIGHT && Number.isFinite(e.hp) && e.hp > 0 && Number.isFinite(e.damage) && e.damage > 0) &&
    Array.isArray(state.log) && state.log.every(l => l && Number.isInteger(l.turn) && typeof l.text === 'string' && ['normal', 'good', 'danger'].includes(l.tone));
}
