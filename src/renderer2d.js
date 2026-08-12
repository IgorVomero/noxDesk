const pet = document.querySelector('#pet');
const desktop = window.noxDesktop ?? {
  getSettings: async () => ({ autonomous: true }),
  moveBy: () => {},
  onSettingsChanged: () => {},
  onCommand: () => {}
};

// Safe presentation fallback while the real 3D model is being authored.
// Only the stable, full-size idle row of the original Nox atlas is displayed.
const idleFrames = [0, 1, 2, 3, 4, 5];
const idleDurations = [580, 190, 190, 250, 250, 650];
let frameIndex = 0;
let animationTimer;
let attentionTimer;
let dragState;
let skipNextClick = false;

function playIdle() {
  const frame = idleFrames[frameIndex];
  pet.style.backgroundPosition = `${-frame * 192}px 0`;
  animationTimer = window.setTimeout(() => {
    frameIndex = (frameIndex + 1) % idleFrames.length;
    playIdle();
  }, idleDurations[frameIndex]);
}

function attend() {
  window.clearTimeout(attentionTimer);
  pet.classList.add('is-attentive');
  attentionTimer = window.setTimeout(() => pet.classList.remove('is-attentive'), 1500);
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
  attend();
});

desktop.onCommand((command) => { if (command === 'interact') attend(); });
playIdle();
