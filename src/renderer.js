import * as THREE from '../node_modules/three/build/three.module.js';

const canvas = document.querySelector('#nox-canvas');
const desktop = window.noxDesktop ?? {
  getSettings: async () => ({ autonomous: true }),
  moveBy: () => {},
  onSettingsChanged: () => {},
  onCommand: () => {}
};

const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.12;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(31, 1, .1, 100);
camera.position.set(6.1, 3.7, 8.8);
camera.lookAt(0, 1.15, 0);

scene.add(new THREE.HemisphereLight(0xd7d0ff, 0x100516, 2.3));
const key = new THREE.DirectionalLight(0xffffff, 3.6);
key.position.set(4, 7, 5); key.castShadow = true; key.shadow.mapSize.set(1024, 1024); scene.add(key);
const rim = new THREE.PointLight(0x8b2fff, 14, 14, 2);
rim.position.set(-4, 3, -3); scene.add(rim);

const materials = {
  graphite: new THREE.MeshStandardMaterial({ color: 0x101218, roughness: .3, metalness: .95 }),
  black: new THREE.MeshStandardMaterial({ color: 0x030407, roughness: .25, metalness: 1 }),
  armor: new THREE.MeshStandardMaterial({ color: 0x272a33, roughness: .27, metalness: .92 }),
  gold: new THREE.MeshStandardMaterial({ color: 0xc4872d, roughness: .24, metalness: .9 }),
  violet: new THREE.MeshStandardMaterial({ color: 0x5a137f, roughness: .22, metalness: .65, emissive: 0x3e056b, emissiveIntensity: 1.6 }),
  red: new THREE.MeshStandardMaterial({ color: 0xb81325, emissive: 0x990014, emissiveIntensity: 2.8, roughness: .16, metalness: .25 }),
  eye: new THREE.MeshStandardMaterial({ color: 0xa82bff, emissive: 0x7b00d2, emissiveIntensity: 4.2, roughness: .08, metalness: .2 })
};

function mesh(geometry, material, position = [0, 0, 0], rotation = [0, 0, 0], scale = [1, 1, 1]) {
  const part = new THREE.Mesh(geometry, material);
  part.position.set(...position); part.rotation.set(...rotation); part.scale.set(...scale);
  part.castShadow = true; part.receiveShadow = true;
  return part;
}
function plate(group, size, position, rotation = [0, 0, 0], material = materials.armor) {
  group.add(mesh(new THREE.BoxGeometry(...size, 1, 1, 1), material, position, rotation));
}
function capsule(radius, length, material, position, rotation = [0, 0, 0]) {
  return mesh(new THREE.CapsuleGeometry(radius, length, 6, 12), material, position, rotation);
}

// True 3D articulated prototype. Silhouette/palette intentionally inherit the original pink-background Nox.
const nox = new THREE.Group(); scene.add(nox);
const body = new THREE.Group(); body.position.set(0, 1.45, 0); nox.add(body);
const headRig = new THREE.Group(); headRig.position.set(0, .48, 1.15); body.add(headRig);
const tailRig = new THREE.Group(); tailRig.position.set(0, .2, -1.25); body.add(tailRig);
const legs = []; const eyes = []; const wheels = [];

body.add(mesh(new THREE.CapsuleGeometry(.86, 1.45, 8, 16), materials.graphite, [0, 0, 0], [Math.PI / 2, 0, 0]));
plate(body, [1.58, .34, 1.16], [0, .2, .05], [0, 0, 0], materials.armor);
plate(body, [1.48, .11, .88], [0, .4, .22], [-.08, 0, 0], materials.violet);
plate(body, [1.57, .21, .95], [0, .47, .15], [-.08, 0, 0], materials.graphite);
plate(body, [1.28, .08, .65], [0, .61, .16], [-.08, 0, 0], materials.violet);

const head = new THREE.Group(); headRig.add(head);
head.add(mesh(new THREE.DodecahedronGeometry(.83, 1), materials.graphite, [0, .06, .08], [0, Math.PI / 4, 0], [1.05, .86, 1.03]));
plate(head, [1.25, .42, .78], [0, .26, .48], [-.28, 0, 0], materials.armor);
plate(head, [.9, .12, .74], [0, .38, .72], [-.25, 0, 0], materials.black);
for (const side of [-1, 1]) {
  const ear = new THREE.Group(); ear.position.set(side * .5, .68, .08); ear.rotation.z = side * -.2; head.add(ear);
  ear.add(mesh(new THREE.ConeGeometry(.3, .9, 4), materials.graphite, [0, .4, 0], [0, Math.PI / 4, 0]));
  ear.add(mesh(new THREE.ConeGeometry(.13, .55, 4), materials.violet, [0, .39, .04], [0, Math.PI / 4, 0]));
  const eye = mesh(new THREE.SphereGeometry(.16, 12, 8), materials.eye, [side * .34, .02, .77], [0, 0, 0], [1.5, .55, .32]); head.add(eye); eyes.push(eye);
  head.add(mesh(new THREE.CylinderGeometry(.23, .23, .13, 16), materials.gold, [side * .78, .02, .12], [0, 0, Math.PI / 2]));
  head.add(mesh(new THREE.CylinderGeometry(.13, .13, .15, 16), materials.black, [side * .84, .02, .12], [0, 0, Math.PI / 2]));
}
head.add(mesh(new THREE.ConeGeometry(.12, .36, 4), materials.red, [0, .36, .75], [Math.PI / 2, 0, Math.PI / 4]));
head.add(mesh(new THREE.SphereGeometry(.2, 12, 8), materials.black, [0, -.22, .78], [0, 0, 0], [1.25, .62, .45]));

function createWheel(parent, side, z) {
  const wheel = new THREE.Group(); wheel.position.set(side * .92, .02, z); parent.add(wheel);
  wheel.add(mesh(new THREE.CylinderGeometry(.38, .38, .22, 20), materials.black, [0, 0, 0], [Math.PI / 2, 0, 0]));
  wheel.add(mesh(new THREE.CylinderGeometry(.25, .25, .245, 16), materials.gold, [0, 0, 0], [Math.PI / 2, 0, 0]));
  wheel.add(mesh(new THREE.CylinderGeometry(.09, .09, .255, 12), materials.black, [0, 0, 0], [Math.PI / 2, 0, 0]));
  wheels.push(wheel);
}
for (const side of [-1, 1]) { createWheel(body, side, .52); createWheel(body, side, -.64); }

function createLeg(side, front) {
  const rig = new THREE.Group(); rig.position.set(side * .7, -.27, front ? .72 : -.72); body.add(rig);
  const upper = new THREE.Group(); rig.add(upper);
  upper.add(capsule(.2, .66, materials.armor, [0, -.4, 0]));
  upper.add(mesh(new THREE.SphereGeometry(.27, 12, 8), materials.gold, [0, -.12, 0]));
  const lower = new THREE.Group(); lower.position.set(0, -.73, front ? .05 : -.03); upper.add(lower);
  lower.add(capsule(.18, .56, materials.graphite, [0, -.31, .08], [front ? -.13 : .13, 0, 0]));
  lower.add(mesh(new THREE.SphereGeometry(.2, 12, 8), materials.gold, [0, -.6, .15]));
  const paw = new THREE.Group(); paw.position.set(0, -.7, .3); lower.add(paw);
  paw.add(mesh(new THREE.BoxGeometry(.46, .22, .64), materials.black, [0, 0, .12]));
  for (const toe of [-.14, 0, .14]) paw.add(mesh(new THREE.ConeGeometry(.07, .23, 4), materials.gold, [toe, -.04, .48], [Math.PI / 2, 0, Math.PI / 4]));
  legs.push({ rig, upper, lower, front, side, phase: front ? (side > 0 ? 0 : Math.PI) : (side > 0 ? Math.PI : 0) });
}
for (const side of [-1, 1]) { createLeg(side, true); createLeg(side, false); }

let segment = tailRig;
for (let i = 0; i < 4; i += 1) {
  const joint = new THREE.Group(); joint.position.z = i === 0 ? 0 : -.42; segment.add(joint);
  joint.add(mesh(new THREE.ConeGeometry(.16 - i * .02, .52, 5), materials.graphite, [0, .16, -.2], [Math.PI / 2.8, 0, 0]));
  if (i === 3) joint.add(mesh(new THREE.ConeGeometry(.18, .46, 4), materials.armor, [0, .25, -.35], [Math.PI / 2.8, 0, 0]));
  segment = joint;
}

const ground = mesh(new THREE.CircleGeometry(2.7, 40), new THREE.MeshBasicMaterial({ color: 0x22063e, transparent: true, opacity: .13 }), [0, -.36, 0], [-Math.PI / 2, 0, 0]);
ground.receiveShadow = true; nox.add(ground);

const brain = { state: 'idle', energy: .72, curiosity: .45, walking: false };
let settings = { autonomous: true }; let routineTimer; let dragState; let skipNextClick = false;
function randomBetween(min, max) { return min + Math.random() * (max - min); }
function setEye(mode) {
  const color = mode === 'blue' ? 0x22a7ff : mode === 'red' ? 0xff1637 : 0xa82bff;
  const emissive = mode === 'blue' ? 0x0265d9 : mode === 'red' ? 0xa90016 : 0x7100c9;
  for (const eye of eyes) { eye.material.color.setHex(color); eye.material.emissive.setHex(emissive); }
}
function setState(next) { brain.state = next; brain.walking = next === 'walk'; setEye(next === 'alert' ? 'red' : next === 'resting' ? 'blue' : 'violet'); }
function chooseNextState() {
  brain.energy = THREE.MathUtils.clamp(brain.energy + (Math.random() - .44) * .13, .16, 1);
  brain.curiosity = THREE.MathUtils.clamp(brain.curiosity + (Math.random() - .48) * .2, .1, 1);
  if (brain.energy < .29) return 'resting'; if (brain.curiosity > .67) return 'alert'; return Math.random() > .52 ? 'walk' : 'idle';
}
function scheduleRoutine() {
  window.clearTimeout(routineTimer); if (!settings.autonomous) return setState('idle');
  setState(chooseNextState());
  routineTimer = window.setTimeout(scheduleRoutine, brain.state === 'walk' ? randomBetween(2300, 4100) : randomBetween(4800, 8500));
}
function interact() { brain.energy = Math.min(1, brain.energy + .16); brain.curiosity = Math.min(1, brain.curiosity + .22); setState('alert'); window.clearTimeout(routineTimer); routineTimer = window.setTimeout(scheduleRoutine, 2400); }

function resize() { const { width, height } = canvas.getBoundingClientRect(); renderer.setSize(width, height, false); camera.aspect = width / height; camera.updateProjectionMatrix(); }
new ResizeObserver(resize).observe(canvas); resize();
function animate(now) {
  const time = now * .001; const walkRate = brain.walking ? 8 : brain.state === 'alert' ? 2.8 : brain.state === 'resting' ? .65 : 1.3; const gait = Math.sin(time * walkRate);
  body.position.y = Math.sin(time * (brain.state === 'resting' ? .65 : 1.3)) * (brain.state === 'resting' ? .015 : .035);
  headRig.rotation.x = brain.state === 'resting' ? .18 : Math.sin(time * (brain.state === 'alert' ? 2 : .65)) * .035;
  headRig.rotation.y = brain.state === 'alert' ? Math.sin(time * 1.45) * .12 : Math.sin(time * .45) * .035;
  tailRig.rotation.x = -.35 + Math.sin(time * (brain.state === 'alert' ? 2.4 : .78)) * .18;
  for (const leg of legs) { const swing = Math.sin(time * walkRate + leg.phase); const amount = brain.walking ? .44 : brain.state === 'alert' ? .06 : .018; leg.upper.rotation.x = swing * amount; leg.lower.rotation.x = Math.max(0, -swing) * amount * .84; leg.rig.position.y = brain.walking ? Math.max(0, swing) * .12 : 0; }
  for (const wheel of wheels) wheel.rotation.x -= brain.walking ? .13 : .002;
  if (brain.walking) desktop.moveBy(.45, 0);
  nox.rotation.y = Math.sin(time * .24) * .04;
  renderer.render(scene, camera); requestAnimationFrame(animate);
}
requestAnimationFrame(animate);

canvas.addEventListener('pointerdown', (event) => { dragState = { x: event.screenX, y: event.screenY, moved: false }; canvas.setPointerCapture?.(event.pointerId); });
canvas.addEventListener('pointermove', (event) => { if (!dragState) return; const x = event.screenX - dragState.x; const y = event.screenY - dragState.y; if (Math.abs(x) + Math.abs(y) > 2) { dragState.moved = true; desktop.moveBy(x, y); dragState.x = event.screenX; dragState.y = event.screenY; } });
canvas.addEventListener('pointerup', () => { if (dragState?.moved) skipNextClick = true; dragState = undefined; });
canvas.addEventListener('click', () => { if (skipNextClick) { skipNextClick = false; return; } interact(); });
desktop.onSettingsChanged((next) => { settings = { ...settings, ...next }; scheduleRoutine(); });
desktop.onCommand((command) => { if (command === 'interact') interact(); });
desktop.getSettings().then((initial) => { settings = { ...settings, ...initial }; scheduleRoutine(); });
