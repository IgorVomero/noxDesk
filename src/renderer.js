const pet = document.querySelector('#pet');
const transformButton = document.querySelector('#transform');
const clickThroughButton = document.querySelector('#click-through');
const formLabel = document.querySelector('#form-label');
let isBiped = false;
let isTransforming = false;
let clickThrough = false;
let appSize = 420;
let timer;

const rows = {
  idle: { row: 0, durations: [280, 110, 110, 140, 140, 320] },
  running: { row: 1, durations: [120, 120, 120, 120, 120, 120, 120, 220] },
  wave: { row: 3, durations: [140, 140, 140, 280] },
  jump: { row: 4, durations: [140, 140, 140, 140, 280] }
};

function stopAnimation() { window.clearTimeout(timer); }

function playQuadruped(name = 'idle') {
  stopAnimation();
  isBiped = false;
  pet.className = 'pet quadruped';
  pet.style.backgroundImage = '';
  formLabel.textContent = 'FORMA: QUADRÚPEDE';
  const { row, durations } = rows[name];
  let frame = 0;
  const tick = () => {
    pet.style.backgroundPosition = `${-frame * 192}px ${-row * 208}px`;
    timer = window.setTimeout(() => { frame = (frame + 1) % durations.length; tick(); }, durations[frame]);
  };
  tick();
}

function playBipedIdle() {
  stopAnimation();
  isBiped = true;
  pet.className = 'pet biped';
  pet.style.backgroundImage = "url('../assets/transform/frame-7.png')";
  formLabel.textContent = 'FORMA: BÍPEDE';
}

function runTransform(reverse = false) {
  if (isTransforming) return;
  isTransforming = true;
  stopAnimation();
  pet.className = 'pet biped';
  const frames = reverse ? [7, 6, 5, 4, 3, 2, 1, 0] : [0, 1, 2, 3, 4, 5, 6, 7];
  let index = 0;
  formLabel.textContent = reverse ? 'TRANSFORMANDO: QUADRÚPEDE' : 'TRANSFORMANDO: BÍPEDE';
  const tick = () => {
    pet.style.backgroundImage = `url('../assets/transform/frame-${frames[index]}.png')`;
    if (index === frames.length - 1) {
      isTransforming = false;
      reverse ? playQuadruped() : playBipedIdle();
      return;
    }
    index += 1;
    timer = window.setTimeout(tick, 135);
  };
  tick();
}

function toggleTransform() { isBiped ? runTransform(true) : runTransform(false); }

pet.addEventListener('click', toggleTransform);
pet.addEventListener('mouseenter', () => { if (!isBiped && !isTransforming) playQuadruped('wave'); });
pet.addEventListener('mouseleave', () => { if (!isBiped && !isTransforming) playQuadruped('idle'); });
transformButton.addEventListener('click', toggleTransform);
clickThroughButton.addEventListener('click', () => window.noxDesktop.setClickThrough(!clickThrough));
document.querySelector('#hide').addEventListener('click', () => window.noxDesktop.hide());
document.querySelector('#smaller').addEventListener('click', () => { appSize = Math.max(300, appSize - 30); window.noxDesktop.setSize(appSize); });
document.querySelector('#larger').addEventListener('click', () => { appSize = Math.min(620, appSize + 30); window.noxDesktop.setSize(appSize); });
window.noxDesktop.onClickThroughChanged((enabled) => { clickThrough = enabled; clickThroughButton.textContent = enabled ? 'Cliques: atravessam' : 'Cliques: ativos'; });
playQuadruped();
