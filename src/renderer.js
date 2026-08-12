const pet = document.querySelector('#pet');
const shell = document.querySelector('.shell');
const thought = document.querySelector('#thought');
const desktop = window.noxDesktop ?? { getSettings: async () => ({ scale: 1, autonomous: true }), moveBy: () => {}, onSettingsChanged: () => {}, onCommand: () => {} };
const rows = {
  idle: { row: 0, durations: [280, 110, 110, 140, 140, 320] },
  walk: { row: 1, durations: [120, 120, 120, 120, 120, 120, 120, 220] },
  greet: { row: 3, durations: [140, 140, 140, 280] }
};
let settings = { scale: 1, autonomous: true };
let state = 'idle';
let isBiped = false;
let isTransforming = false;
let animationTimer;
let motionTimer;
let routineTimer;
let thoughtTimer;
let dragState;
let skipNextClick = false;

function stopAnimation() { window.clearTimeout(animationTimer); }
function stopMotion() { window.clearTimeout(motionTimer); }
function say(message, duration = 2600) { window.clearTimeout(thoughtTimer); thought.textContent = message; thought.classList.add('visible'); thoughtTimer = window.setTimeout(() => thought.classList.remove('visible'), duration); }
function setPose(name = 'idle', mood = '') {
  stopAnimation(); isBiped = false; pet.className = `pet quadruped ${mood}`.trim(); shell.classList.toggle('sleeping', mood === 'is-sleeping'); pet.style.backgroundImage = '';
  const { row, durations } = rows[name]; let frame = 0;
  const tick = () => { pet.style.backgroundPosition = `${-frame * 192}px ${-row * 208}px`; animationTimer = window.setTimeout(() => { frame = (frame + 1) % durations.length; tick(); }, durations[frame]); };
  tick();
}
function idle() { state = 'idle'; shell.classList.remove('recharging'); if (!isTransforming) setPose('idle'); }
function watch() { state = 'watch'; setPose('idle', 'is-watching'); say('Nox está de olho.', 2100); window.setTimeout(idle, 2500); }
function doze() { state = 'doze'; setPose('idle', 'is-sleeping'); say('Modo sentinela silenciosa.', 2800); window.setTimeout(idle, 7200); }
function greet() { if (isTransforming) return; state = 'greet'; setPose('greet'); say('Estou aqui.', 2100); window.setTimeout(idle, 2600); }
function recharge() { state = 'recharge'; setPose('idle', 'is-recharging'); shell.classList.add('recharging'); say('Recarregando núcleo.', 2600); window.setTimeout(idle, 4200); }
function wander() {
  if (isTransforming || !settings.autonomous) return idle();
  stopMotion();
  state = 'wander'; const direction = Math.random() > .5 ? 1 : -1; const vertical = Math.random() > .72 ? (Math.random() > .5 ? 1 : -1) : 0; const duration = 1700 + Math.random() * 1400; const started = Date.now();
  setPose('walk'); say('Patrulhando…', 1300);
  const step = () => { desktop.moveBy(direction * 5, vertical * 2); if (Date.now() - started >= duration || state !== 'wander') return idle(); motionTimer = window.setTimeout(step, 95); };
  step();
}
function transform(reverse = false) {
  if (isTransforming) return;
  isTransforming = true; state = 'transform'; stopAnimation(); stopMotion(); pet.className = 'pet biped'; shell.classList.remove('sleeping'); const frames = reverse ? [7, 6, 5, 4, 3, 2, 1, 0] : [0, 1, 2, 3, 4, 5, 6, 7]; let index = 0;
  say(reverse ? 'Voltando à forma felina.' : 'Forma guardião.', 2600);
  const tick = () => { pet.style.backgroundImage = `url('../assets/transform/frame-${frames[index]}.png')`; if (index === frames.length - 1) { isTransforming = false; isBiped = !reverse; if (isBiped) { pet.style.backgroundImage = "url('../assets/transform/frame-7.png')"; state = 'biped'; } else idle(); return; } index += 1; animationTimer = window.setTimeout(tick, 125); };
  tick();
}
function toggleTransform() { isBiped ? transform(true) : transform(false); }
function scheduleRoutine() {
  window.clearTimeout(routineTimer);
  routineTimer = window.setTimeout(() => { if (settings.autonomous && !isTransforming && state !== 'biped') { const roll = Math.random(); if (roll < .42) wander(); else if (roll < .68) watch(); else if (roll < .84) doze(); } scheduleRoutine(); }, 9000 + Math.random() * 9000);
}
pet.addEventListener('pointerdown', (event) => {
  dragState = { x: event.screenX, y: event.screenY, moved: false };
  pet.setPointerCapture?.(event.pointerId);
});
pet.addEventListener('pointermove', (event) => {
  if (!dragState) return;
  const x = event.screenX - dragState.x;
  const y = event.screenY - dragState.y;
  if (Math.abs(x) + Math.abs(y) > 2) {
    dragState.moved = true;
    desktop.moveBy(x, y);
    dragState.x = event.screenX;
    dragState.y = event.screenY;
  }
});
pet.addEventListener('pointerup', () => { if (dragState?.moved) skipNextClick = true; dragState = undefined; });
pet.addEventListener('click', () => { if (skipNextClick) { skipNextClick = false; return; } greet(); });
pet.addEventListener('dblclick', toggleTransform);
pet.addEventListener('mouseenter', () => { if (state === 'idle') watch(); });
pet.addEventListener('mouseleave', () => { if (state === 'watch') idle(); });
desktop.onSettingsChanged((next) => { settings = { ...settings, ...next }; });
desktop.onCommand((command) => { if (command === 'greet') greet(); if (command === 'recharge') recharge(); if (command === 'transform') toggleTransform(); });
desktop.getSettings().then((initial) => { settings = { ...settings, ...initial }; });
idle(); scheduleRoutine();
