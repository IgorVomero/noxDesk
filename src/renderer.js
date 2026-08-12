const pet = document.querySelector('#pet');
const desktop = window.noxDesktop ?? {
  getSettings: async () => ({ autonomous: true }),
  moveBy: () => {},
  onSettingsChanged: () => {},
  onCommand: () => {}
};

const presets = {
  idle: { min: 7000, max: 12000 },
  alert: { min: 2200, max: 4200 },
  resting: { min: 5000, max: 8500 },
  interacting: { min: 1800, max: 3000 }
};

const brain = {
  state: 'idle',
  energy: 0.74,
  curiosity: 0.5,
  lastInteraction: 0
};

let settings = { autonomous: true };
let routineTimer;
let dragState;
let skipNextClick = false;

function randomBetween(min, max) { return min + Math.random() * (max - min); }

function applyState(next) {
  brain.state = next;
  pet.className = `pet state-${next}`;
}

function chooseNextState() {
  const elapsedSinceInteraction = Date.now() - brain.lastInteraction;
  brain.energy = Math.min(1, Math.max(.18, brain.energy + (Math.random() - .42) * .12));
  brain.curiosity = Math.min(1, Math.max(.1, brain.curiosity + (Math.random() - .5) * .2));
  if (elapsedSinceInteraction < 11000) return 'interacting';
  if (brain.energy < .34) return 'resting';
  if (brain.curiosity > .62) return 'alert';
  return 'idle';
}

function scheduleRoutine() {
  window.clearTimeout(routineTimer);
  if (!settings.autonomous) return applyState('idle');
  const next = chooseNextState();
  applyState(next);
  const preset = presets[next];
  routineTimer = window.setTimeout(scheduleRoutine, randomBetween(preset.min, preset.max));
}

function interact() {
  brain.lastInteraction = Date.now();
  brain.energy = Math.min(1, brain.energy + .12);
  brain.curiosity = Math.min(1, brain.curiosity + .18);
  applyState('interacting');
  window.clearTimeout(routineTimer);
  routineTimer = window.setTimeout(scheduleRoutine, randomBetween(presets.interacting.min, presets.interacting.max));
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

pet.addEventListener('pointerup', () => {
  if (dragState?.moved) skipNextClick = true;
  dragState = undefined;
});

pet.addEventListener('click', () => {
  if (skipNextClick) { skipNextClick = false; return; }
  interact();
});

desktop.onSettingsChanged((next) => {
  settings = { ...settings, ...next };
  scheduleRoutine();
});

desktop.onCommand((command) => {
  if (command === 'interact') interact();
});

desktop.getSettings().then((initial) => {
  settings = { ...settings, ...initial };
  scheduleRoutine();
});
