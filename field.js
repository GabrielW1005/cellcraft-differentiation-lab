'use strict';

const missions = window.fieldMissions;
const byId = id => document.getElementById(id);
const canvas = byId('world');
const ctx = canvas.getContext('2d', { alpha: false });
const world = { width: 2200, height: 438 };
const maxHealth = 4;
const taskReach = 82;
const store = 'cellcraft-differentiation-field-v1';
const clamp = (n, min, max) => Math.min(max, Math.max(min, n));
const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
const directions = {
  w: 'up', arrowup: 'up', s: 'down', arrowdown: 'down',
  a: 'left', arrowleft: 'left', d: 'right', arrowright: 'right',
};

const keys = new Set();
const touch = new Map();
let records = {};
try {
  const saved = JSON.parse(localStorage.getItem(store) || '{}');
  if (saved && typeof saved === 'object' && !Array.isArray(saved)) records = saved;
} catch {}
let missionIndex = 0;
let mode = 'ready';
let state;
let clock = 0;
let lastFrame = 0;
let camera = 0;
let ratio = 1;
let viewWidth = 920;
let toastTimer = 0;
let dirty = true;
let lastHint = '';
let pointer = null;
let saveTools;
let checkpointAnswered = false;
let progressDialogOpen = false;

function seeded(num) {
  const seed = Math.sin(num * 192.293 + 72.17) * 19299.35;
  return seed - Math.floor(seed);
}

function currentMission() { return missions[missionIndex]; }

function createCourse(index) {
  const mission = missions[index];
  const offset = (index % 3) * 22;
  const topTrack = 126 + offset;
  const bottomTrack = 338 - offset;
  const genes = [
    { x: 300, y: index % 2 ? bottomTrack : topTrack, icon: '✦', label: 'Developmental signal', type: 'signal' },
    { x: 632 + index % 2 * 38, y: index % 2 ? topTrack : bottomTrack, icon: '1', label: mission.genes[0], type: 'gene' },
    { x: 990 - index % 3 * 20, y: index % 2 ? bottomTrack : topTrack, icon: '2', label: mission.genes[1], type: 'gene' },
  ];
  const hazards = Array.from({ length: 10 + index }, (_, i) => ({
    x: 418 + i * (1590 / (10 + index)),
    y: 109 + seeded(i + index * 90) * 224,
    drift: 24 + seeded(i + 32) * 41, pace: .63 + seeded(i + index * 5) * .8,
    phase: seeded(i + index * 19) * Math.PI * 2,
    radius: 12 + seeded(i + 94) * 11, type: i % 4 === 2 ? 'drift' : 'spike',
  }));
  const plants = index > 3;
  const banks = Array.from({ length: 48 }, (_, i) => ({
    x: i * 48 + seeded(i + index * 64) * 19,
    y: i % 2 ? 390 + 49 * seeded(i + 32) : 6 + 48 * seeded(i + 97),
    radius: 24 + seeded(i + 73) * 45, shape: plants ? 1 : 0,
  }));
  return {
    player: { x: 104, y: 221, vx: 0, vy: 0, face: 1, health: maxHealth, boost: 1, dash: 0, invulnerable: 0 },
    genes, hazards, banks,
    supplies: [
      { x: 773, y: 224, type: 'heal', icon: '+', label: 'Repair' },
      { x: 1156, y: 218, type: 'boost', icon: '»', label: 'Dash charge' },
      { x: 1715, y: 394, type: 'heal', icon: '+', label: 'Repair' },
    ],
    collected: 0, task: 0, time: 0, deaths: 0, effect: null,
  };
}

function clearControls() {
  keys.clear();
  touch.clear();
  pointer = null;
  document.querySelectorAll('.held').forEach(b => b.classList.remove('held'));
}

function openCover(html, focus = false) {
  byId('cover').hidden = false;
  const content = byId('cover-content');
  content.innerHTML = html;
  if (focus) content.querySelector('button')?.focus({ preventScroll: true });
}

function setMode(nextMode) {
  mode = nextMode;
  clearControls();
  byId('pause').disabled = !['play', 'pause'].includes(mode);
  byId('pause').textContent = mode === 'pause' ? '▶' : 'Ⅱ';
  byId('pause').setAttribute('aria-label', mode === 'pause' ? 'Resume' : 'Pause');
  byId('cover').hidden = mode === 'play';
  dirty = true;
}

function start() {
  setMode('play');
  canvas.focus({ preventScroll: true });
  notify('Swim to the purple developmental signal.');
}

function openCourse(index, play = false) {
  missionIndex = index;
  state = createCourse(index);
  checkpointAnswered = false;
  camera = 0;
  byId('toast').classList.remove('show');
  const mission = currentMission();
  byId('domain').textContent = `${mission.domain} cells · Mission ${index + 1} of ${missions.length}`;
  byId('course').textContent = mission.course;
  byId('specialist').textContent = mission.name;
  byId('summary').textContent = mission.summary;
  updateMissionButtons();
  if (play) {
    start();
    saveTools?.saveNow();
    return;
  }
  setMode('ready');
  openCover(`<p class="eyebrow">${mission.precursor}</p><h3>${mission.course}</h3>
    <p class="cover-copy">Swim through the course. Collect a developmental signal and two gene-activity markers, then use your specialist’s structures to finish the job.</p>
    <div class="cover-buttons"><button class="primary" id="start-course" type="button">Play mission →</button></div>`);
  byId('start-course').onclick = () => {
    start();
    saveTools?.saveNow();
  };
}

function updateMissionButtons() {
  byId('progress').textContent = `${missions.filter(m => records[m.id]?.complete).length} / ${missions.length} cleared`;
  const list = byId('mission-list');
  list.innerHTML = missions.map((m, i) => `
    <button class="mission-button" style="--tone:${m.color}" type="button" data-course="${i}" ${i === missionIndex ? 'aria-current="true"' : ''}>
      <span class="mission-glyph" aria-hidden="true">${m.glyph}</span>
      <span><b>${m.course}</b><small>${records[m.id]?.complete ? '✓ Cleared' : m.name}</small></span>
    </button>`).join('');
}

function showPause(restored = false) {
  setMode('pause');
  openCover(`<p class="eyebrow">${currentMission().course}</p><h3>${restored ? 'Saved mission restored' : 'Paused'}</h3>
    <p class="cover-copy">Drag on the field or hold the on-screen arrows to swim. You can also use WASD, Space to dash, and E to use your specialty.</p>
    <div class="cover-buttons"><button class="primary" id="resume-course" type="button">Resume →</button></div>`, !restored);
  byId('resume-course').onclick = togglePause;
}

function togglePause() {
  if (mode === 'pause') {
    setMode('play');
    canvas.focus({ preventScroll: true });
  } else if (mode === 'play') {
    showPause();
  }
}

function notify(copy) {
  const el = byId('toast');
  el.textContent = copy;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 3000);
}

function finish(restoredAnswer = false, focus = true) {
  setMode('question');
  const mission = currentMission();
  openCover(`<p class="eyebrow">Specialist task complete</p><h3>${mission.question}</h3>
    <div class="choices">${mission.answers.map((answer, i) => `<button type="button" data-answer="${i}">${answer}</button>`).join('')}</div>
    <p id="question-feedback" class="explain" role="status"></p><div class="cover-buttons" id="result-buttons" hidden></div>`, focus);
  const buttons = [...document.querySelectorAll('[data-answer]')];
  function showAnswer(button, save) {
    checkpointAnswered = true;
    byId('question-feedback').textContent = mission.science;
    buttons.forEach(b => { b.disabled = true; });
    button.classList.add('correct');
    records[mission.id] = { complete: true };
    updateMissionButtons();
    const controls = byId('result-buttons');
    controls.hidden = false;
    const next = (missionIndex + 1) % missions.length;
    controls.innerHTML = `<button type="button" class="primary" id="next-course">${next ? 'Next mission →' : 'Play first mission →'}</button>
      <button type="button" class="secondary" id="replay-course">Replay</button>`;
    byId('next-course').onclick = () => openCourse(next, true);
    byId('replay-course').onclick = () => openCourse(missionIndex, true);
    if (save) {
      saveTools?.saveNow();
      byId('next-course').focus({ preventScroll: true });
    }
  }
  for (const button of buttons) {
    button.onclick = () => {
      if (Number(button.dataset.answer) !== mission.correct) {
        button.classList.add('retry');
        byId('question-feedback').textContent = 'Try again. Think about the structure you just used.';
        return;
      }
      showAnswer(button, true);
    };
  }
  if (restoredAnswer) showAnswer(buttons[mission.correct], false);
}

function snapshot() {
  const p = state.player;
  return {
    version: 1,
    mission: currentMission().id,
    phase: state.task === currentMission().tasks.length ? 'question' : mode === 'ready' ? 'ready' : 'active',
    answered: checkpointAnswered,
    practice: byId('practice').checked,
    completed: missions.filter(m => records[m.id]?.complete).map(m => m.id),
    markers: state.collected,
    tasks: state.task,
    elapsed: Math.round(state.time * 10) / 10,
    player: {
      x: Math.round(p.x * 10) / 10, y: Math.round(p.y * 10) / 10,
      health: p.health, boost: Math.round(p.boost * 100) / 100, face: p.face,
    },
    used: state.supplies.map(supply => supply.used === true),
  };
}

function restore(data) {
  if (!data || data.version !== 1 || !['ready', 'active', 'question'].includes(data.phase)) return false;
  const index = missions.findIndex(m => m.id === data.mission);
  if (index === -1 || !Array.isArray(data.completed) || data.completed.some(id => !missions.some(m => m.id === id))) return false;
  const mission = missions[index];
  const draft = createCourse(index);
  const bounded = (value, min, max) => Number.isFinite(value) && value >= min && value <= max;
  const validCount = (value, count) => Number.isInteger(value) && bounded(value, 0, count);
  const p = data.player;
  if (typeof data.answered !== 'boolean' || typeof data.practice !== 'boolean') return false;
  if (!validCount(data.markers, draft.genes.length) || !validCount(data.tasks, mission.tasks.length)) return false;
  if (data.tasks && data.markers !== draft.genes.length) return false;
  if ((data.phase === 'question') !== (data.tasks === mission.tasks.length)) return false;
  if (data.answered && (data.phase !== 'question' || !data.completed.includes(mission.id))) return false;
  if (data.phase === 'ready' && (data.markers || data.tasks)) return false;
  if (!p || !bounded(p.x, 42, world.width - 42) || !bounded(p.y, 71, world.height - 38)) return false;
  if (!validCount(p.health, maxHealth) || p.health < 1 || !bounded(p.boost, 0, 1) || ![-1, 1].includes(p.face)) return false;
  if (!Number.isFinite(data.elapsed) || data.elapsed < 0) return false;
  if (!Array.isArray(data.used) || data.used.length !== draft.supplies.length || data.used.some(value => typeof value !== 'boolean')) return false;

  records = Object.fromEntries(data.completed.map(id => [id, { complete: true }]));
  byId('practice').checked = data.practice;
  openCourse(index);
  Object.assign(state.player, { x: p.x, y: p.y, health: p.health, boost: p.boost, face: p.face });
  state.collected = data.markers;
  state.task = data.tasks;
  state.time = data.elapsed;
  state.supplies.forEach((supply, i) => { supply.used = data.used[i]; });
  camera = clamp(p.x - viewWidth * .39, 0, Math.max(0, world.width - viewWidth));
  if (data.phase === 'question') finish(data.answered, false);
  else if (data.phase === 'active') showPause(true);
  return true;
}

function objective() {
  return state.genes[state.collected] || currentMission().tasks[state.task];
}

function goalHint() {
  const target = objective();
  if (mode === 'ready') return 'Press Play mission, then follow the glowing marker.';
  if (!target) return 'Connect the cell’s structure to its job in the checkpoint.';
  if (state.collected < state.genes.length) return `Follow the guide marker to ${target.label.toLowerCase()}.`;
  if (distance(state.player, target) < taskReach) return `Press E or Use at ${target.label}.`;
  return `Swim to ${target.label}. You can dash past moving hazards.`;
}

function updateTrack() {
  const mission = currentMission();
  const steps = ['Collect the developmental signal', ...mission.genes.map(g => 'Collect ' + g), ...mission.tasks.map(t => t.action)];
  const active = state.collected + state.task;
  byId('goals').innerHTML = steps.map((step, index) => `
    <li class="${index < active ? 'done' : index === active ? 'active' : ''}" ${index === active ? 'aria-current="step"' : ''}>
      <span class="step-icon" aria-hidden="true">${index < active ? '✓' : index + 1}</span><span class="step-text">${step}</span>
    </li>`).join('');
  byId('form').textContent = state.collected < state.genes.length ? mission.precursor : mission.name;
  byId('health').innerHTML = Array.from({ length: maxHealth }, (_, i) => `<i class="${i < state.player.health ? 'live' : ''}"></i>`).join('');
  byId('health').setAttribute('aria-label', `Health: ${state.player.health} of ${maxHealth}`);
  dirty = false;
}

function useSpecialty() {
  if (mode !== 'play') return;
  if (state.collected < state.genes.length) {
    notify('Collect the three markers so this cell can differentiate.');
    return;
  }
  const target = objective();
  if (!target || distance(state.player, target) > taskReach) {
    notify('Swim into the task ring, then press Use.');
    return;
  }
  state.task += 1;
  state.effect = { start: { x: state.player.x, y: state.player.y }, end: target, age: 0 };
  notify(target.done);
  dirty = true;
  if (state.task >= currentMission().tasks.length) state.effect.ending = true;
  saveTools?.saveNow();
}

function movement() {
  const held = [...[...keys].map(key => directions[key]), ...touch.values()];
  let dx = Number(held.includes('right')) - Number(held.includes('left'));
  let dy = Number(held.includes('down')) - Number(held.includes('up'));
  const p = state.player;
  if (!dx && !dy && pointer && distance(pointer, p) > 12) {
    dx = pointer.x - p.x;
    dy = pointer.y - p.y;
  }
  const length = Math.hypot(dx, dy);
  return length ? [dx / length, dy / length] : [0, 0];
}

function dash() {
  if (mode !== 'play' || state.player.boost < .42) return;
  const p = state.player;
  const [dx, dy] = movement();
  const x = dx || dy ? dx : p.face;
  p.vx = x * 500;
  p.vy = dy * 500;
  p.dash = .25;
  p.boost -= .42;
}

function hazardAt(h, t) {
  return { x: h.x + Math.cos(t * h.pace + h.phase) * h.drift * .48,
    y: h.y + Math.sin(t * h.pace + h.phase) * h.drift };
}

function respawn() {
  const p = state.player;
  state.deaths += 1;
  p.health = maxHealth;
  p.vx = p.vy = 0;
  p.invulnerable = 1.6;
  p.dash = 0;
  p.boost = 1;
  const checkpoint = state.collected ? state.genes[state.collected - 1] : { x: 139, y: 221 };
  p.x = Math.max(75, checkpoint.x - 40);
  p.y = checkpoint.y;
  camera = clamp(p.x - viewWidth * .42, 0, Math.max(0, world.width - viewWidth));
  notify('Cell restored at a checkpoint. Collected markers and finished tasks stay recorded.');
}

function advance(dt) {
  state.time += dt;
  const p = state.player;
  p.dash = Math.max(0, p.dash - dt);
  p.boost = Math.min(1, p.boost + dt * .21);
  p.invulnerable = Math.max(0, p.invulnerable - dt);
  const [dx, dy] = movement();
  if (dx) p.face = Math.sign(dx);
  if (!p.dash && p.invulnerable < .97) {
    const smooth = 1 - Math.exp(-14 * dt);
    const pace = missionIndex === 3 && state.collected === 3 ? 249 : 230;
    p.vx += (dx * pace - p.vx) * smooth;
    p.vy += (dy * pace - p.vy) * smooth;
  } else if (p.invulnerable >= .97) {
    p.vx *= 1 - dt * 3;
    p.vy *= 1 - dt * 3;
  }
  p.x = clamp(p.x + p.vx * dt, 42, world.width - 42);
  p.y = clamp(p.y + p.vy * dt, 71, world.height - 38);

  const gene = state.genes[state.collected];
  if (gene && distance(p, gene) < 37) {
    state.collected += 1;
    dirty = true;
    if (state.collected === state.genes.length) {
      p.invulnerable = Math.max(.4, p.invulnerable);
      state.effect = { start: { x: p.x, y: p.y }, end: { x: p.x, y: p.y }, age: 0 };
      notify(`Differentiated into a ${currentMission().name.toLowerCase()}. Find the first task ring.`);
    } else {
      notify(gene.type === 'signal' ? 'The precursor received a developmental signal.' : `Marker collected: ${gene.label}.`);
    }
    saveTools?.saveNow();
  }

  for (const supply of state.supplies) {
    if (supply.used || distance(p, supply) > 29) continue;
    if (supply.type === 'heal' && p.health < maxHealth) {
      p.health = Math.min(maxHealth, p.health + 2);
      supply.used = true;
      dirty = true;
      notify('Repair pickup restored health.');
    } else if (supply.type === 'boost' && p.boost < .85) {
      p.boost = 1;
      supply.used = true;
      notify('Pickup recharged your dash.');
    }
  }
  if (!byId('practice').checked && p.invulnerable === 0 && p.dash === 0) {
    for (const hazard of state.hazards) {
      const moving = hazardAt(hazard, state.time);
      if (distance(p, moving) > hazard.radius + 13) continue;
      p.health -= 1;
      p.invulnerable = 1.18;
      p.vx = (p.x < moving.x ? -1 : 1) * 230;
      p.vy = (p.y < moving.y ? -1 : 1) * 140;
      dirty = true;
      if (p.health <= 0) respawn();
      else notify('Watch for drifting hazards. Dash to slip past them.');
      break;
    }
  }
  if (state.effect) {
    state.effect.age += dt;
    if (state.effect.age > .85) {
      const ending = state.effect.ending;
      state.effect = null;
      if (ending) finish();
    }
  }
}

function circle(x, y, r, fill, stroke, w = 1) {
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2);
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = w; ctx.stroke(); }
}
function oval(x, y, rx, ry, color, stroke, w = 1) {
  ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  if (color) { ctx.fillStyle = color; ctx.fill(); }
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = w; ctx.stroke(); }
}
function poly(points, fill, stroke, width = 2) {
  ctx.beginPath(); points.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.closePath();
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = width; ctx.stroke(); }
}
function line(points, color, width) {
  ctx.beginPath(); points.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y));
  ctx.strokeStyle = color; ctx.lineWidth = width; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.stroke();
}
function label(text, x, y, color = '#e5f2f5', size = 13) {
  ctx.font = `700 ${size}px system-ui,sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.lineWidth = 3; ctx.strokeStyle = '#112130'; ctx.strokeText(text, x, y); ctx.fillStyle = color; ctx.fillText(text, x, y);
}

function drawBackground(t) {
  const backdrop = ctx.createLinearGradient(0, 0, 0, world.height);
  backdrop.addColorStop(0, '#142435'); backdrop.addColorStop(.54, '#1c3a48'); backdrop.addColorStop(1, '#132838');
  ctx.fillStyle = backdrop; ctx.fillRect(0, 0, viewWidth, world.height);
  for (let i = 0; i < 114; i += 1) {
    const rawX = seeded(i + missionIndex * 1000) * (world.width + 200);
    const x = rawX - camera * (i % 3 === 0 ? .4 : .68);
    if (x < -55 || x > viewWidth + 55) continue;
    const y = 31 + seeded(i * 3 + 77) * 376 + Math.sin(t * .7 + i) * 4;
    const radius = 1 + seeded(i * 7 + 91) * (i % 8 ? 2 : 24);
    circle(x, y, radius, i % 8 ? '#a6d5d140' : '#46778840', i % 8 ? null : '#7098a540');
  }

  ctx.save(); ctx.translate(-camera, 0);
  for (const bank of state.banks) {
    if (bank.x < camera - 78 || bank.x > camera + viewWidth + 78) continue;
    const r = bank.radius;
    if (bank.shape) {
      const points = Array.from({ length: 6 }, (_, i) => {
        const angle = i * Math.PI / 3;
        return [bank.x + Math.cos(angle) * r, bank.y + Math.sin(angle) * r * .65];
      });
      poly(points, '#293f47', '#54735d', 1.5);
    } else {
      oval(bank.x, bank.y, r, r * .66, '#294958', '#4e7781', 1.5);
    }
    oval(bank.x - r * .13, bank.y, r * .34, r * .2, '#335865', null);
  }
  ctx.restore();
}

function marker(target, t, kind) {
  const isGene = kind === 'gene';
  const isSignal = kind === 'signal';
  const isSupply = ['heal', 'boost'].includes(kind);
  const radius = isSupply ? 13 : isGene || isSignal ? 18 : 27;
  const y = target.y;
  const color = isSignal ? '#d4a7f3' : isGene ? '#8de4c8' : isSupply ? target.type === 'heal' ? '#fca79a' : '#92c8ff' : '#ffce9a';
  if (kind === 'task') circle(target.x, y, taskReach, '#f9c79308', '#f9c79367', 1.4);
  circle(target.x, y, radius + 13 + Math.sin(t * 4) * 3, null, color + '53');
  ctx.save(); ctx.shadowBlur = 15; ctx.shadowColor = color;
  circle(target.x, y, radius, '#20384b', color, 2.6);
  ctx.restore();
  label(target.icon || target.glyph, target.x, y, color, isSupply ? 14 : 18);
  label(target.label, target.x, y + radius + 15, color, isSupply ? 10 : 12);
}

function drawHazard(h, t) {
  const { x, y } = hazardAt(h, t);
  if (h.type === 'drift') {
    oval(x, y, h.radius, h.radius * .78, '#8c5369', '#f2a09a', 1.4);
    oval(x - 4, y, h.radius * .37, h.radius * .25, '#dc8a9b', null);
    for (let i = 0; i < 4; i += 1) line([[x + h.radius * .8, y + (i - 1.5) * 5], [x + h.radius + 9, y + Math.sin(t * 4 + i) * 9]], '#cb788f', 1.5);
  } else {
    const points = Array.from({ length: 18 }, (_, i) => {
      const angle = i * Math.PI / 9 + t * .5;
      const r = h.radius * (i % 2 ? .73 : 1);
      return [x + Math.cos(angle) * r, y + Math.sin(angle) * r];
    });
    poly(points, '#805460', '#eaa091', 1.5);
    circle(x, y, h.radius * .29, '#b46f76');
  }
}

function drawTaskTerrain() {
  const m = currentMission();
  for (const [index, task] of m.tasks.entries()) {
    const { x, y } = task;
    if (x < camera - 135 || x > camera + viewWidth + 135) continue;
    const active = state.task > index;
    if (m.id === 'skin') {
      for (let column = -2; column <= 2; column += 1) {
        if (column === 0 && !active) continue;
        const left = x + column * 32;
        const shape = [[left - 15, y - 15], [left + 14, y - 15], [left + 16, y + 6], [left + 10, y + 13], [left - 14, y + 13]];
        poly(shape, '#6f4e58', '#d89b7d', 1.7);
        oval(left, y - 2, 5, 3.5, '#b485a7', null);
      }
    } else if (m.id === 'muscle') {
      const age = state.effect?.ending ? state.effect.age : .85;
      const lifted = active ? Math.min(age / .6, 1) * 43 : 0;
      line([[x - 53, y - 51], [x + 55, y - 51], [x + 55, y + 35]], '#8c737e', 4);
      line([[x + 55, y - 50], [x + 55, y + 14 - lifted]], '#f1bcab', 2.5);
      ctx.fillStyle = '#e1a187';
      ctx.fillRect(x + 43, y + 14 - lifted, 24, 17);
    } else if (m.id === 'redblood') {
      for (const i of [-1, 0, 1]) {
        oval(x + 46, y + i * 21, index === 0 ? 19 : 17, index === 0 ? 15 : 12, '#56556d', '#a590af', 1.7);
      }
      line([[x - 75, y - 37], [x - 30, y - 24], [x + 12, y - 15], [x + 36, y - 11]], '#b56b8666', 6);
    } else if (m.id === 'neuron') {
      line([[x - 73, y - 31], [x - 27, y - 11], [x - 7, y], [x + 8, y - 9]], '#7cafd3a3', 5);
      for (const i of [-1, 1]) line([[x + 8, y - 9], [x + 24, y + i * 14]], '#7cafd3a3', 3);
      oval(x + 50, y, 14, 12, '#4b6185', '#92b6d1', 1.7);
      circle(x + 50, y, 4, '#bcabdb');
    } else if (m.id === 'leaf' && index === 2) {
      for (const i of [-1, 0, 1]) line([[x - 57 + i * 13, y - 61], [x - 32 + i * 13, y - 25]], '#e4c876', 3);
      oval(x + 41, y, 24, 13, '#496b61', '#aad08b', 2);
      for (const i of [-1, 0, 1]) line([[x + 41 + i * 8, y - 5], [x + 41 + i * 8, y + 5]], '#9dbb76', 2);
    } else {
      oval(x + 37, y, 27, 17, '#426675', '#80bdc8', 1.5);
      circle(x + 44, y - 3, 5, '#79bcca');
    }
  }
}

function drawPlayer(t) {
  const p = state.player;
  const m = currentMission();
  const specialized = state.collected === state.genes.length;
  const scale = 1 + Math.sin(t * 5.4) * .045;
  ctx.save(); ctx.translate(p.x, p.y); ctx.scale(p.face * scale, scale);
  if (p.invulnerable > .25 && Math.floor(t * 13) % 2) ctx.globalAlpha = .5;
  if (p.dash) {
    for (let i = 0; i < 4; i += 1) line([[-20 - i * 8, (i - 1.5) * 8], [-56 - i * 12, (i - 1.5) * 9]], '#abebe8a5', 2);
  }
  ctx.shadowColor = specialized ? m.color : '#75ddc9'; ctx.shadowBlur = 18;
  if (!specialized) {
    oval(0, 0, 21, 17, '#407d80', '#a0f1dc', 2.5);
    oval(-4, 1, 8, 7, '#7b77aa', '#bdb8f4', 1.2);
    circle(8, -6, 2, '#bde3cc');
  } else if (m.id === 'neuron') {
    line([[2, 0], [24, 2], [52, 0], [72, 1]], m.color, 6);
    for (const y of [-13, 13]) {
      line([[67, 0], [86, y]], m.color, 3); line([[-10, 0], [-24, y], [-35, y * 1.5]], m.color, 3);
    }
    oval(-6, 0, 16, 12, '#4c6092', '#b5d9f0', 2);
    circle(-8, 0, 6, '#bdacdf');
  } else if (m.id === 'muscle') {
    const length = state.effect ? 27 - Math.sin(state.effect.age / .85 * Math.PI) * 11 : 27;
    oval(0, 0, length, 13, '#934f5c', '#f7a9a1', 2.4);
    for (let x = -length + 8; x <= length - 8; x += 7) line([[x, -9], [x, 9]], '#fbd3bc91', 2);
    for (const x of [-length + 7, length - 5]) oval(x, 3, 3.5, 2, '#e4afd3', null);
  } else if (m.id === 'skin') {
    const points = [[-23, -10], [-7, -16], [17, -13], [25, 0], [18, 12], [-9, 16], [-25, 7]];
    poly(points, '#9d6874', '#f1b58e', 2.4); oval(-2, 0, 7, 4, '#dcaee1', null);
  } else if (m.id === 'redblood') {
    oval(0, 0, 23, 15, '#b7506d', '#f6a6a7', 2.5);
    oval(0, -1, 13, 7, '#d7838f', null);
    if (state.task === 1) for (const x of [-12, 1, 11]) circle(x, -2 + (x % 3) * 4, 2.4, '#a4e7ff');
  } else {
    const root = m.id === 'root';
    ctx.beginPath(); ctx.roundRect(-17, -18, 33, 36, 6); ctx.fillStyle = '#456b59'; ctx.fill();
    ctx.lineWidth = 2.5; ctx.strokeStyle = m.color; ctx.stroke();
    oval(-6, 2, 4, 6, '#bba3d9', null);
    if (root) {
      line([[11, 2], [28, 0], [43, 4], [56, -1]], m.color, 7);
      line([[11, 2], [28, 0], [43, 4], [56, -1]], '#5eaa90', 3);
    } else {
      for (const [x, y] of [[-7, -9], [6, -9], [7, 0], [6, 9], [-6, 9]]) oval(x, y, 3.4, 2.8, '#c2e88d', null);
    }
  }
  ctx.restore();
}

function drawEffect(t) {
  const fx = state.effect;
  if (!fx) return;
  const f = Math.min(fx.age / .85, 1);
  const { start, end } = fx;
  const color = currentMission().color;
  ctx.save(); ctx.globalAlpha = 1 - f * .86;
  circle(end.x, end.y, 25 + f * 55, null, color, 2);
  if (start !== end && distance(start, end) > 2) {
    const x = start.x + (end.x - start.x) * Math.min(f * 2, 1);
    const y = start.y + (end.y - start.y) * Math.min(f * 2, 1);
    line([[start.x, start.y], [x, y]], color, 2.5);
    circle(x, y, 4.6, '#f3fef1');
  }
  for (let i = 0; i < 13; i += 1) {
    const a = Math.PI * 2 * i / 13 + t;
    const r = 16 + f * (28 + 24 * seeded(i));
    circle(end.x + Math.cos(a) * r, end.y + Math.sin(a) * r, 2.5, color);
  }
  ctx.restore();
}

function drawGuide() {
  const target = objective();
  const p = state.player;
  const width = Math.min(260, viewWidth - 42);
  const left = (viewWidth - width) / 2;
  const bottom = world.height - 19;
  line([[left, bottom], [left + width, bottom]], '#72949a88', 4);
  circle(left + width * (p.x / world.width), bottom, 4.5, '#a5efdf');
  if (!target) return;
  circle(left + width * (target.x / world.width), bottom, 3.7, '#f8c996');
  if (target.x < camera + 20 || target.x > camera + viewWidth - 20) {
    const right = target.x > p.x;
    const x = right ? viewWidth - 23 : 23;
    const y = clamp(target.y, 81, world.height - 61);
    circle(x, y, 15, '#29444b', '#f3c492', 1.5);
    label(right ? '→' : '←', x, y - 1, '#fbe0ac', 17);
  }
}

function draw(t) {
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  drawBackground(t);
  ctx.save(); ctx.translate(-camera, 0);
  drawTaskTerrain();
  for (const h of state.hazards) {
    if (h.x > camera - 70 && h.x < camera + viewWidth + 70) drawHazard(h, state.time);
  }
  for (const supply of state.supplies) if (!supply.used) marker(supply, t, supply.type);
  const target = objective();
  if (target) marker(target, t, target.type || 'task');
  currentMission().tasks.slice(0, state.task).forEach(task => {
    circle(task.x, task.y, 21, '#295751', '#70bba8', 1.5);
    label('✓', task.x, task.y, '#c1f5df', 15);
  });
  drawPlayer(t);
  drawEffect(t);
  ctx.restore();
  drawGuide();
}

function resize() {
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const box = canvas.getBoundingClientRect();
  if (!box.height || !box.width) return;
  canvas.width = Math.round(box.width * dpr);
  canvas.height = Math.round(box.height * dpr);
  ratio = canvas.height / world.height;
  viewWidth = canvas.width / ratio;
}
function loop(now) {
  const dt = lastFrame ? Math.min(.05, (now - lastFrame) / 1000) : 0;
  lastFrame = now;
  clock += dt;
  if (mode === 'play' && !progressDialogOpen && !fieldDialogOpen()) advance(dt);
  const target = clamp(state.player.x - viewWidth * .39, 0, Math.max(0, world.width - viewWidth));
  camera += (target - camera) * Math.min(1, dt * 8);
  if (dirty) updateTrack();
  const hint = goalHint();
  if (lastHint !== hint) {
    byId('hint').textContent = hint;
    byId('compact-hint').textContent = hint;
    lastHint = hint;
  }
  byId('dash-meter').style.width = `${100 * state.player.boost}%`;
  draw(clock);
  requestAnimationFrame(loop);
}

byId('mission-list').onclick = e => {
  const button = e.target.closest('[data-course]');
  if (!button) return;
  const selected = Number(button.dataset.course);
  byId('missions-dialog').close();
  if (selected === missionIndex && mode === 'play') canvas.focus({ preventScroll: true });
  else openCourse(selected, true);
};
byId('pause').onclick = togglePause;
byId('restart').onclick = () => openCourse(missionIndex, true);
const fieldDialogs = [byId('missions-dialog'), byId('science-model')];
function fieldDialogOpen() { return fieldDialogs.some(dialog => dialog.open); }
function showFieldDialog(dialog) {
  clearControls();
  dialog.showModal();
}
byId('missions-button').onclick = () => showFieldDialog(fieldDialogs[0]);
byId('science-link').onclick = () => showFieldDialog(fieldDialogs[1]);
byId('practice').onchange = () => saveTools?.saveNow();
for (const dialog of fieldDialogs) {
  dialog.querySelector('.dialog-close').onclick = () => dialog.close();
  dialog.addEventListener('close', () => {
    clearControls();
    if (mode === 'play') canvas.focus({ preventScroll: true });
  });
}
window.addEventListener('keydown', event => {
  if (event.ctrlKey || event.metaKey || event.altKey) return;
  if (progressDialogOpen || fieldDialogOpen()) return;
  const k = event.key.toLowerCase();
  if (['escape', 'p'].includes(k) && ['play', 'pause'].includes(mode)) {
    event.preventDefault();
    if (!event.repeat) togglePause();
    return;
  }
  if (mode !== 'play' || (event.target !== canvas && event.target.closest?.('input,button,a,summary'))) return;
  if (directions[k]) { event.preventDefault(); keys.add(k); }
  if ([' ', 'shift', 'e', 'x'].includes(k)) {
    event.preventDefault();
    if (!event.repeat) {
      if (k === 'e' || k === 'x') useSpecialty();
      else dash();
    }
  }
});
window.addEventListener('keyup', event => keys.delete(event.key.toLowerCase()));
window.addEventListener('blur', clearControls);
document.addEventListener('visibilitychange', () => { if (document.hidden && mode === 'play') togglePause(); });

document.querySelectorAll('[data-dir]').forEach(button => {
  button.addEventListener('pointerdown', event => {
    if (mode !== 'play') return;
    event.preventDefault();
    button.setPointerCapture(event.pointerId);
    touch.set(event.pointerId, button.dataset.dir);
    button.classList.add('held');
  });
  for (const name of ['pointerup', 'pointercancel', 'lostpointercapture']) {
    button.addEventListener(name, event => { touch.delete(event.pointerId); button.classList.remove('held'); });
  }
});
byId('boost-touch').onclick = dash;
byId('use-touch').onclick = useSpecialty;
function setPointer(event) {
  const box = canvas.getBoundingClientRect();
  pointer = { id: event.pointerId, x: (event.clientX - box.left) * viewWidth / box.width + camera,
    y: (event.clientY - box.top) * world.height / box.height };
}
canvas.addEventListener('pointerdown', event => {
  if (mode !== 'play' || pointer) return;
  event.preventDefault();
  canvas.focus({ preventScroll: true });
  canvas.setPointerCapture(event.pointerId);
  setPointer(event);
});
canvas.addEventListener('pointermove', event => { if (pointer?.id === event.pointerId) setPointer(event); });
for (const name of ['pointerup', 'pointercancel', 'lostpointercapture']) {
  canvas.addEventListener(name, event => { if (pointer?.id === event.pointerId) pointer = null; });
}
window.addEventListener('resize', resize);
new ResizeObserver(resize).observe(canvas);

const requested = new URLSearchParams(location.search).get('mission');
const selected = missions.findIndex(m => m.id === requested);
openCourse(Math.max(0, selected));
resize();
saveTools = window.GameSave.attach({
  game: 'cellcraft-differentiation-lab',
  title: 'CellCraft',
  mount: byId('game-tools'),
  snapshot,
  restore,
  onOpenChange(open) {
    progressDialogOpen = open;
    clearControls();
    if (!open && mode === 'play') canvas.focus({ preventScroll: true });
  },
});
requestAnimationFrame(loop);
