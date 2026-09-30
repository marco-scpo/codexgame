import './style.css';
import { WIDTH, HEIGHT, LAST_TURN, STRUCTURES, createGame, incomes, buildReason, build, action, coordinate, endTurn, raidSize, validSave } from './engine.js';

const SAVE_KEY = 'outpost-09-expedition-v1';
let storageAvailable = true;
let game;
try { const saved = JSON.parse(localStorage.getItem(SAVE_KEY)); game = validSave(saved) ? saved : createGame(); } catch { game = createGame(); }
let mode = 'map', modal = null, sound = false, toastTimer, audioContext;
const app = document.querySelector('#app');
const icons = {
  logo: '<path d="M12 2 21 7v10l-9 5-9-5V7z"/><path d="M12 6v12M6 9l12 6M18 9 6 15"/>',
  map: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M3 15h18M9 3v18M15 3v18"/>',
  book: '<path d="M12 5v16M12 5C9 3 5 3 2 5v14c3-2 7-2 10 2 3-4 7-4 10-2V5c-3-2-7-2-10 0Z"/>',
  refresh: '<path d="M20 8a8 8 0 1 0 0 8M20 3v5h-5"/>',
  volume: '<path d="m11 4-6 5H2v6h3l6 5zM15 8a6 6 0 0 1 0 8M18 5a10 10 0 0 1 0 14"/>',
  mute: '<path d="m11 4-6 5H2v6h3l6 5zM16 9l6 6m0-6-6 6"/>',
  help: '<circle cx="12" cy="12" r="9"/><path d="M9 9a3 3 0 0 1 6 0c0 2-3 2-3 5M12 17h.01"/>',
  alloy: '<path d="m12 3 9 5v8l-9 5-9-5V8zM3 8l9 5 9-5M12 13v8"/>',
  energy: '<path d="m13 2-9 12h7l-1 8 10-12h-7z"/>',
  shield: '<path d="m12 2 9 4v6c0 5-9 10-9 10S3 17 3 12V6zM8 12l3 3 5-6"/>',
  arrow: '<path d="M4 12h16m-6-6 6 6-6 6"/>',
  radar: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><path d="m12 12 7-7M12 12h.01"/>',
  pause: '<path d="M8 4v16M16 4v16"/>',
  repair: '<path d="M14 6a5 5 0 0 0-6 6L3 17a3 3 0 0 0 4 4l5-5a5 5 0 0 0 6-6l-4 4-4-4z"/>',
  star: '<path d="m12 2 3 7 7 1-5 5 1 7-6-4-6 4 1-7-5-5 7-1z"/>',
};
const icon = name => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="square" aria-hidden="true">${icons[name] || icons.logo}</svg>`;
const escape = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
function save() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(game)); } catch { storageAvailable = false; } }
function beep(type = 'good') {
  if (!sound) return;
  try {
    audioContext ||= new (window.AudioContext || window.webkitAudioContext)();
    audioContext.resume();
    const o = audioContext.createOscillator(), gain = audioContext.createGain();
    o.type = 'square'; o.frequency.value = type === 'danger' ? 130 : 420;
    gain.gain.setValueAtTime(.018, audioContext.currentTime); gain.gain.exponentialRampToValueAtTime(.001, audioContext.currentTime + .12);
    o.connect(gain); gain.connect(audioContext.destination); o.start(); o.stop(audioContext.currentTime + .12);
  } catch { /* Sound is optional. */ }
}
function notify(text, error = false) {
  const el = document.querySelector('#toast'); el.textContent = text; el.className = `toast visible ${error ? 'error' : ''}`;
  clearTimeout(toastTimer); toastTimer = setTimeout(() => el.className = 'toast', 3200);
}
function sprite(type, x = 0, y = 0, size = 60) {
  let body = '';
  if (type === 'core') body = '<path fill="#283c36" d="M9 21h8V12h26v9h8v29H9z"/><path fill="#778e83" d="M14 24h32v22H14zM20 15h20v9H20z"/><path fill="#c7d6bc" d="M18 27h24v5H18zM21 36h7v10h-7zM33 36h7v10h-7z"/><path fill="#e1a763" d="M25 8h10v8H25zM28 2h4v7h-4zM27 23h6v7h-6z"/><path fill="#141f1b" d="M17 46h26v5H17z"/>';
  if (type === 'reactor') body = '<path fill="#45554e" d="M27 18h6v30h-6zM19 47h22v4H19z"/><path fill="#557b78" d="M6 12h48v25H6z"/><path fill="#8dc5bd" d="M9 15h42v19H9z"/><path stroke="#416966" stroke-width="2" d="M19 15v19M30 15v19M41 15v19M9 24h42"/><path fill="#d7e4b7" d="M27 38h6v4h-6z"/>';
  if (type === 'mine') body = '<path fill="#535c47" d="M10 39h40v11H10zM17 16h26v26H17z"/><path fill="#bd8d55" d="M20 19h20v23H20z"/><path fill="#ebbc73" d="M25 11h10v13H25zM11 36h38v6H11z"/><path fill="#29392e" d="M23 27h14v10H23z"/><path fill="#efc580" d="M27 28h6v9h-6z"/><path fill="#76816a" d="M10 44h7v8h-7zM43 44h7v8h-7z"/>';
  if (type === 'turret') body = '<path fill="#334f3d" d="M12 35h36v15H12z"/><path fill="#708f72" d="M17 29h26v17H17z"/><path fill="#b2c99a" d="M22 21h16v15H22z"/><path fill="#789b77" d="M26 5h8v21h-8z"/><path fill="#dce8c4" d="M27 4h6v8h-6zM24 24h12v5H24z"/><path fill="#2b4030" d="M12 46h36v6H12z"/><path fill="#e9b564" d="M27 38h6v5h-6z"/>';
  if (type === 'wall') body = '<path fill="#2b352d" d="M5 38h50v15H5z"/><path fill="#697660" d="M7 20h46v25H7z"/><path fill="#9ba488" d="M7 18h46v6H7z"/><path fill="#424b3c" d="M17 24h4v21h-4zM38 24h4v21h-4z"/><path fill="#d2ac65" d="M9 32h6v7H9zM23 32h13v7H23zM44 32h7v7h-7z"/>';
  if (type === 'enemy') body = '<path fill="#4f302e" d="M12 22h36v22H12zM20 13h20v9H20z"/><path fill="#c96f61" d="M16 24h28v15H16zM23 17h14v9H23z"/><path fill="#efb3a0" d="M20 28h7v5h-7zM33 28h7v5h-7z"/><path fill="#8d5148" d="M8 32h8v14H8zM44 32h8v14h-8zM16 42h10v9H16zM34 42h10v9H34z"/>';
  return `<g transform="translate(${x} ${y}) scale(${size / 60})" shape-rendering="crispEdges">${body}</g>`;
}
function miniSprite(type) { return `<svg viewBox="0 0 60 60" class="mini-sprite" aria-hidden="true">${sprite(type)}</svg>`; }
function boardSvg() {
  const selected = game.tiles[game.selected];
  let art = '<defs><pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse"><path d="M60 0H0v60" fill="none" stroke="#719476" stroke-opacity=".09"/></pattern><radialGradient id="ground"><stop stop-color="#26392d"/><stop offset="1" stop-color="#18251e"/></radialGradient></defs><rect width="720" height="540" fill="url(#ground)"/>';
  for (const t of game.tiles) {
    const x = t.x * 60, y = t.y * 60, n = t.x * 17 + t.y * 31;
    art += `<g transform="translate(${x} ${y})"><rect x="${8 + n % 35}" y="${9 + n % 37}" width="2" height="2" fill="#71836a" opacity=".3"/><path d="M${6 + n % 12} ${44 - n % 20}h5m${22 + n % 15} ${15 + n % 25}h3" stroke="#5a7054" stroke-opacity=".2"/>`;
    if (t.terrain === 'rock') art += '<path fill="#344238" d="m10 39 7-18 15-8 12 8 8 23-17 6z"/><path fill="#48554a" d="m17 22 15-8 9 8-7 14-17 4z"/><path fill="#596356" d="m21 24 10-7 7 6-6 7z"/><path fill="#222e25" d="m11 40 22-5 18 8-16 7z"/>';
    else if (t.terrain === 'ore') art += '<path fill="#5a4c30" d="m9 40 11-13 10 5 13-8 10 15-14 9-20-2z"/><path fill="#b08b4c" d="m13 37 6-8 6 6-3 7zM32 34l10-7 6 10-9 7z"/><path fill="#e5b66c" d="m17 32 3-3 3 6-5 2zM39 32l4-3 2 6-5 2z"/><rect x="29" y="43" width="4" height="4" fill="#947442"/>';
    art += '</g>';
  }
  art += '<rect width="720" height="540" fill="url(#grid)"/>';
  if (selected.structure === 'turret') for (const t of game.tiles) if (Math.abs(t.x - selected.x) + Math.abs(t.y - selected.y) <= 3) art += `<rect x="${t.x * 60 + 1}" y="${t.y * 60 + 1}" width="58" height="58" fill="#afca99" opacity=".08"/>`;
  for (const t of game.tiles) if (t.structure) {
    art += `<ellipse cx="${t.x * 60 + 30}" cy="${t.y * 60 + 48}" rx="23" ry="6" fill="#0c1510" opacity=".5"/>${sprite(t.structure, t.x * 60, t.y * 60)}`;
    const max = t.structure === 'core' ? 100 : STRUCTURES[t.structure].hp;
    if (t.hp < max) art += `<rect x="${t.x * 60 + 13}" y="${t.y * 60 + 54}" width="34" height="3" fill="#152019"/><rect x="${t.x * 60 + 13}" y="${t.y * 60 + 54}" width="${34 * Math.max(0, t.hp) / max}" height="3" fill="#d59a6e"/>`;
  }
  for (const e of game.enemies) art += sprite('enemy', e.x * 60, e.y * 60);
  art += `<rect x="${selected.x * 60 + 2}" y="${selected.y * 60 + 2}" width="56" height="56" fill="#d5e5bb" fill-opacity=".07" stroke="#c0d7a5" stroke-width="1.5"/><path d="M${selected.x * 60 + 2 + 10} ${selected.y * 60 + 2}h-10v10m44-10h10v10m0 34v10h-10m-34 0h-10v-10" fill="none" stroke="#d8e8b8" stroke-width="3"/>`;
  return `<svg class="terrain" viewBox="0 0 720 540" preserveAspectRatio="none" aria-hidden="true">${art}</svg>`;
}
function tileLabel(t) { return `${coordinate(t)}: ${t.structure === 'core' ? 'Command core' : t.structure ? STRUCTURES[t.structure].name : t.terrain === 'ore' ? 'Ore deposit' : t.terrain === 'rock' ? 'Rocky terrain' : 'Open terrain'}${game.enemies.some(e => e.x === t.x && e.y === t.y) ? ', raider present' : ''}`; }
function fieldGuide() {
  return `<div class="guide"><span class="eyebrow">COLONIST’S HANDBOOK / REV. 09</span><h2>A little strategy.<br>A long way from home.</h2><p>Keep your command core standing for ${LAST_TURN} cycles and charge the distress signal to 100%. If you need more time, you can keep going after cycle 10.</p><div class="guide-rules"><article><span>01</span><h3>Make three good calls.</h3><p>You get 3 orders each cycle. Building, repairing, upgrading, salvaging, and charging each use one. Unused orders don’t carry over.</p></article><article><span>02</span><h3>Build your lifeline.</h3><p>Expand within 2 tiles of any structure. Extractors need amber ore. Solar arrays supply energy. Each signal charge costs 10 energy and adds 20%.</p></article><article><span>03</span><h3>Watch the perimeter.</h3><p>Sentries fire before raiders move, once per cycle, within 3 tiles. Raiders move one tile toward the nearest structure and attack when adjacent. Barriers buy time.</p></article><article><span>04</span><h3>Live to see another cycle.</h3><p>End a cycle to collect income and refresh orders. Raids begin on cycle 2 and get stronger. Repair restores 35 integrity. Destroyed raiders yield 3 alloy.</p></article></div><div class="guide-tip">${icon('star')} <p>A good opening: add a sentry near the core, build an extractor on nearby ore, and save a little energy for your signal.</p></div><button class="primary" data-command="map">Back to the sector ${icon('arrow')}</button></div>`;
}
function detailPanel() {
  const t = game.tiles[game.selected], enemy = game.enemies.find(e => e.x === t.x && e.y === t.y);
  const name = t.structure === 'core' ? 'Command core' : t.structure ? STRUCTURES[t.structure].name : t.terrain === 'ore' ? 'Ore deposit' : t.terrain === 'rock' ? 'Rock formation' : 'Open terrain';
  const desc = t.structure === 'core' ? 'Home, for now. Keep this standing until your rescue arrives.' : t.structure ? STRUCTURES[t.structure].description : t.terrain === 'ore' ? 'Rich in workable metals. An ideal site for an alloy extractor.' : t.terrain === 'rock' ? 'Unstable ground. Structures cannot be deployed here.' : 'A little room to grow. Select a structure to expand your outpost.';
  const max = t.structure === 'core' ? 100 : t.structure ? STRUCTURES[t.structure].hp : 0;
  return `<aside class="inspector"><div class="panel-heading"><span class="eyebrow">TILE INSPECTOR</span><span class="coord">${coordinate(t)}</span></div><div class="tile-identity">${t.structure ? miniSprite(t.structure) : icon(t.terrain === 'ore' ? 'alloy' : 'radar')}<div><h3>${name}</h3><span>${t.structure ? 'COLONY STRUCTURE' : 'UNCLAIMED TERRITORY'}</span></div></div><p class="tile-description">${desc}</p>${t.structure ? `<div class="integrity"><span>Integrity</span><strong>${Math.max(0, t.hp)}<small> / ${max}</small></strong></div><div class="meter"><i style="width:${Math.max(0, t.hp) / max * 100}%"></i></div>` : ''}${enemy ? `<div class="enemy-info">${icon('radar')} Raider detected · ${enemy.hp} HP</div>` : ''}<div class="separator"></div><div class="section-label">${t.structure ? 'STRUCTURE ORDERS' : 'BUILD SOMETHING'}<span>1 ORDER EACH</span></div>${t.structure ? `<div class="structure-actions"><button data-action="repair" ${game.orders === 0 || t.hp >= max || game.alloy < 10 || game.energy < 4 || game.status !== 'playing' ? 'disabled' : ''}>${icon('repair')}<div>Repair structure<small>10 alloy · 4 energy · +35 integrity</small></div></button>${t.structure !== 'core' ? `<button data-action="salvage" ${game.orders === 0 || game.status !== 'playing' ? 'disabled' : ''}>${icon('refresh')}<div>Salvage structure<small>Recover ${Math.floor(STRUCTURES[t.structure].alloy / 2)} alloy</small></div></button>` : `<div class="core-tip">Select an empty tile on the map to build your colony.</div>`}</div>` : `<div class="build-list">${Object.entries(STRUCTURES).map(([type, s]) => { const reason = buildReason(game, game.selected, type); return `<button class="build-card" data-build="${type}" ${reason ? 'disabled' : ''} title="${escape(reason || s.description)}">${miniSprite(type)}<div><strong>${s.short}</strong><small>${type === 'mine' ? '+5 alloy / cycle' : type === 'reactor' ? '+4 energy / cycle' : type === 'turret' ? (game.upgraded ? '22' : '14') + ' damage · range 3' : '60 integrity'}</small><span class="cost">${s.alloy} ${icon('alloy')}${s.energy ? ` <b>·</b> ${s.energy} ${icon('energy')}` : ''}</span></div><span class="build-plus">+</span></button>`; }).join('')}</div>`}<div class="research"><div class="section-label">RESEARCH<span>${game.upgraded ? 'INSTALLED' : '1 ORDER'}</span></div><button data-action="upgrade" ${game.upgraded || game.orders === 0 || game.alloy < 20 || game.energy < 10 || game.status !== 'playing' ? 'disabled' : ''}>${icon('shield')}<div><strong>Targeting MK.II</strong><small>${game.upgraded ? 'Sentries deal 22 damage' : '20 alloy · 10 energy'}</small></div><span>${game.upgraded ? '✓' : '↗︎'}</span></button></div></aside>`;
}
function render() {
  const active = document.activeElement;
  const focusKey = active?.dataset?.command ? `[data-command="${active.dataset.command}"]` : active?.dataset?.action ? `[data-action="${active.dataset.action}"]` : active?.dataset?.tile !== undefined ? `[data-tile="${game.selected}"]` : null;
  const income = incomes(game), core = game.tiles.find(t => t.structure === 'core'), hp = Math.max(0, core?.hp || 0);
  app.innerHTML = `<div class="shell"><aside class="rail"><button class="brand-mark" data-command="map" aria-label="Outpost home">${icon('logo')}</button><div class="rail-nav"><button class="${mode === 'map' ? 'active' : ''}" data-command="map" title="Sector map" aria-label="Sector map">${icon('map')}</button><button class="${mode === 'guide' ? 'active' : ''}" data-command="guide" title="Field guide" aria-label="Field guide">${icon('book')}</button><button data-command="new" title="New expedition" aria-label="New expedition">${icon('refresh')}</button></div><div class="rail-bottom"><button data-command="sound" title="${sound ? 'Mute' : 'Enable sound'}" aria-label="${sound ? 'Mute' : 'Enable sound'}" aria-pressed="${sound}">${icon(sound ? 'volume' : 'mute')}</button><button data-command="help" title="How to play" aria-label="How to play">${icon('help')}</button><span class="rail-version">v.09</span></div></aside><div class="workspace"><header class="topbar"><a class="wordmark" href="#" data-command="map">OUTPOST <span>/</span> 09<span class="wordmark-tag">FRONTIER COMMAND</span></a><div class="system-status"><span class="status-dot"></span> SYSTEMS ONLINE<span class="system-divider">/</span><span>LOCAL EXPEDITION</span></div><button class="icon-button pause" data-command="pause" title="Pause expedition" aria-label="Pause expedition">${icon('pause')}</button></header><main><section class="mission-heading"><div><div class="eyebrow"><span class="tiny-cross">+</span> THE FAR EDGE OF THE KNOWN UNIVERSE</div><h1>A small colony.<br class="mobile-break"> A big universe.</h1><p>Build your foothold. Hold the line. Find your way home.</p></div><div class="mission-number"><span>EXPEDITION</span><strong>009<span>↗︎</span></strong></div></section><section class="resource-strip" aria-label="Colony resources"><div class="cycle-stat"><div class="stat-icon">${icon('radar')}</div><div><span class="stat-label">CYCLE</span><strong>${String(game.turn).padStart(2, '0')}<small> / ${LAST_TURN}</small></strong></div><span class="cycle-label">${game.status === 'won' ? 'EVACUATED' : game.status === 'lost' ? 'SIGNAL LOST' : game.turn < 3 ? 'ESTABLISHING' : game.turn < 7 ? 'HOLDING THE LINE' : 'FINAL APPROACH'}</span></div><div><div class="stat-icon amber">${icon('alloy')}</div><div><span class="stat-label">ALLOY</span><strong>${game.alloy}</strong></div><span class="income">+${income.alloy}<small>/ cycle</small></span></div><div><div class="stat-icon blue">${icon('energy')}</div><div><span class="stat-label">ENERGY</span><strong>${game.energy}</strong></div><span class="income">+${income.energy}<small>/ cycle</small></span></div><div><div class="stat-icon">${icon('shield')}</div><div><span class="stat-label">CORE INTEGRITY</span><strong class="${hp < 35 ? 'danger-text' : ''}">${hp}<small>%</small></strong></div><div class="mini-meter"><i style="width:${hp}%"></i></div></div></section><div class="game-layout"><section class="sector-panel"><div class="map-heading"><div class="map-tabs"><button data-command="map" class="${mode === 'map' ? 'selected' : ''}">${icon('map')} Sector map</button><button data-command="guide" class="${mode === 'guide' ? 'selected' : ''}">${icon('book')} Field guide</button></div><span class="map-location"><span class="status-dot"></span> KEPLER-186F</span></div>${mode === 'map' ? `<div class="map-frame"><div class="map-topline"><span>SECTOR 07 <b>/</b> NORTHERN BASIN</span><span>12 × 09</span></div><div class="board-wrapper"><div class="y-labels">${Array.from({ length: HEIGHT }, (_, i) => `<span>${String(i + 1).padStart(2, '0')}</span>`).join('')}</div><div class="board">${boardSvg()}<div class="tile-grid" role="group" aria-label="Sector map. Use arrow keys to navigate tiles.">${game.tiles.map((t, i) => `<button data-tile="${i}" class="tile-hit" tabindex="${i === game.selected ? '0' : '-1'}" aria-label="${tileLabel(t)}" aria-pressed="${i === game.selected}" title="${tileLabel(t)}"></button>`).join('')}</div>${game.status !== 'playing' ? `<div class="game-over"><span class="eyebrow">${game.status === 'won' ? 'TRANSMISSION RECEIVED' : 'TRANSMISSION LOST'}</span><h2>${game.status === 'won' ? 'You made it home.' : 'The stars remember.'}</h2><p>${game.status === 'won' ? `Your colony survived ${game.turn - 1} cycles. A small victory in a very big universe.` : `Your outpost held for ${game.turn} cycles. Every expedition teaches you something.`}</p><button class="primary" data-command="new">Another expedition ${icon('arrow')}</button></div>` : ''}</div><div class="x-labels">${Array.from({ length: WIDTH }, (_, i) => `<span>${String.fromCharCode(65 + i)}</span>`).join('')}</div></div></div><div class="map-legend"><span><i class="legend-square colony"></i> Your colony</span><span><i class="legend-square ore"></i> Ore deposit</span><span><i class="legend-square raider"></i> Raider</span><span class="legend-hint">${icon('map')} Click a tile to inspect</span></div>` : fieldGuide()}<div class="transmission"><div class="transmission-icon">${icon('radar')}</div><div><span class="eyebrow">LATEST TRANSMISSION <b> / C${String(game.log[0]?.turn || 1).padStart(2, '0')}</b></span><p class="${game.log[0]?.tone === 'danger' ? 'danger-text' : ''}">${escape(game.log[0]?.text || '')}</p></div><button data-command="log" title="View mission log" aria-label="View mission log">↗︎</button></div></section>${detailPanel()}</div><section class="bottom-row"><div class="signal-panel"><div class="signal-icon">${icon('radar')}</div><div class="signal-copy"><div class="section-label">THE WAY HOME <span>${game.signal}% CHARGED</span></div><div class="signal-segments">${Array.from({ length: 10 }, (_, i) => `<i class="${game.signal >= (i + 1) * 10 ? 'lit' : ''}"></i>`).join('')}</div><p>${game.signal >= 100 ? (game.turn > LAST_TURN ? 'Signal received. Rescue has arrived.' : `Signal ready. Hold the core through cycle ${LAST_TURN}.`) : 'Charge your distress signal to call for extraction.'}</p></div><button class="charge-button" data-action="charge" ${game.signal >= 100 || game.energy < 10 || !game.orders || game.status !== 'playing' ? 'disabled' : ''}>${icon('energy')} ${game.signal >= 100 ? 'Signal ready' : 'Charge signal'}<small>10 ENERGY · 1 ORDER</small></button></div><div class="turn-panel"><div class="orders"><span class="stat-label">ORDERS REMAINING</span><div>${Array.from({ length: 3 }, (_, i) => `<i class="${i < game.orders ? 'available' : ''}"></i>`).join('')}<strong>${game.orders}<small> / 3</small></strong></div></div><button class="end-turn" data-command="end" ${game.status !== 'playing' ? 'disabled' : ''}>End cycle ${icon('arrow')}<span>${raidSize(game.turn + 1)} INCOMING RAIDER${raidSize(game.turn + 1) !== 1 ? 'S' : ''}</span></button></div></section><footer><span><span class="status-dot"></span> ${storageAvailable ? 'PROGRESS SAVED ON THIS DEVICE' : 'SAVING UNAVAILABLE · KEEP THIS TAB OPEN'}</span><span>NO RUSH. THE UNIVERSE CAN WAIT.<span class="footer-star">✳</span></span></footer></main></div></div><div class="toast" id="toast" role="status" aria-live="polite"></div><div id="modal-root">${modalMarkup()}</div>`;
  if (modal) { document.querySelector('.modal button')?.focus(); } else if (focusKey) { document.querySelector(focusKey)?.focus({ preventScroll: true }); } 
}
function modalMarkup() {
  if (!modal) return '';
  const content = modal === 'new' ? `<span class="eyebrow">A FRESH FRONTIER</span><h2>Start another expedition?</h2><p>Your current expedition will be replaced. A new planet, a new perimeter, another chance to make it home.</p><div class="modal-actions"><button class="secondary" data-command="close">Keep playing</button><button class="primary" data-command="restart">Start expedition ${icon('arrow')}</button></div>` : modal === 'pause' ? `<span class="eyebrow">COMMAND ON STANDBY</span><h2>The universe can wait.</h2><p>Your progress is saved. Nothing moves until you end a cycle. Take all the time you need.</p><button class="primary" data-command="close">Return to the colony ${icon('arrow')}</button>` : modal === 'log' ? `<span class="eyebrow">EXPEDITION 009</span><h2>Mission log</h2><div class="full-log">${game.log.map(l => `<div><span>C${String(l.turn).padStart(2, '0')}</span><p class="${l.tone === 'danger' ? 'danger-text' : l.tone === 'good' ? 'good-text' : ''}">${escape(l.text)}</p></div>`).join('')}</div>` : `<span class="eyebrow">WELCOME TO OUTPOST / 09</span><h2>Your colony. Your call.</h2><p>Survive <strong>10 cycles</strong> and charge your <strong>distress signal to 100%</strong> to win. You get three orders each cycle.</p><ul class="help-list"><li><strong>Click a tile</strong> to build, repair, or salvage.</li><li><strong>Extractors</strong> mine ore. <strong>Solar arrays</strong> generate energy.</li><li><strong>Sentries</strong> shoot nearby raiders when you end a cycle.</li><li><strong>Charge signal</strong> five times to call for rescue.</li><li><strong>End cycle</strong> collects income, advances raiders, and resets your orders.</li></ul><p class="keyboard-tip">Arrow keys: select tile · E: end cycle · ?: help · Esc: close</p><button class="primary" data-command="close">Let’s build something ${icon('arrow')}</button>`;
  return `<div class="modal-backdrop"><section class="modal ${modal === 'log' ? 'log-modal' : ''}" role="dialog" aria-modal="true" aria-label="${modal === 'new' ? 'New expedition' : modal === 'log' ? 'Mission log' : modal === 'pause' ? 'Paused' : 'How to play'}"><button class="modal-close" data-command="close" aria-label="Close dialog">×</button>${content}</section></div>`;
}
function applyOrder(result) {
  if (!result.ok) { notify(result.message, true); beep('danger'); return; }
  save(); render(); beep();
}
app.addEventListener('click', e => {
  const button = e.target.closest('[data-command], [data-tile], [data-build], [data-action]');
  if (!button || button.disabled) return;
  if (button.dataset.tile !== undefined) { game.selected = Number(button.dataset.tile); save(); render(); return; }
  if (button.dataset.build) return applyOrder(build(game, game.selected, button.dataset.build));
  if (button.dataset.action) return applyOrder(action(game, button.dataset.action));
  const cmd = button.dataset.command;
  e.preventDefault();
  if (cmd === 'map' || cmd === 'guide') { mode = cmd; modal = null; }
  else if (['new', 'help', 'pause', 'log'].includes(cmd)) modal = cmd;
  else if (cmd === 'close') modal = null;
  else if (cmd === 'restart') { game = createGame(); mode = 'map'; modal = null; save(); }
  else if (cmd === 'sound') { sound = !sound; beep(); }
  else if (cmd === 'end') return applyOrder(endTurn(game));
  render();
});
document.addEventListener('keydown', e => {
  if (modal) {
    if (e.key === 'Escape') { modal = null; render(); }
    if (e.key === 'Tab') {
      const items = [...document.querySelectorAll('.modal button')], first = items[0], last = items.at(-1);
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
    return;
  }
  if (e.key === '?' || e.key === 'Escape') { modal = e.key === '?' ? 'help' : 'pause'; render(); return; }
  if (e.key.toLowerCase() === 'e' && !e.repeat && !e.ctrlKey && !e.metaKey) { e.preventDefault(); applyOrder(endTurn(game)); return; }
  if (e.target.dataset.tile !== undefined && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
    e.preventDefault();
    const t = game.tiles[game.selected];
    const x = Math.max(0, Math.min(WIDTH - 1, t.x + (e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0)));
    const y = Math.max(0, Math.min(HEIGHT - 1, t.y + (e.key === 'ArrowDown' ? 1 : e.key === 'ArrowUp' ? -1 : 0)));
    game.selected = y * WIDTH + x; save(); render(); document.querySelector(`[data-tile="${game.selected}"]`).focus();
  }
});
save(); render();
