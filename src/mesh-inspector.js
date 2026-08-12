import * as THREE from '../node_modules/three/build/three.module.js';
import { GLTFLoader } from '../node_modules/three/examples/jsm/loaders/GLTFLoader.js';

const canvas = document.querySelector('#nox-canvas');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.58;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x101218);
scene.fog = new THREE.Fog(0x101218, 8, 18);
const camera = new THREE.PerspectiveCamera(32, 1, .1, 100);
const target = new THREE.Vector3(0, .8, 0);
let radius = 7.5;
let yaw = -.68;
let pitch = .22;
let dragging;
let model;
let mixer;
let active;

scene.add(new THREE.HemisphereLight(0xd7ddff, 0x17121f, 3.5));
const key = new THREE.DirectionalLight(0xffffff, 4.7); key.position.set(5, 7, 5); scene.add(key);
const violet = new THREE.PointLight(0xa530ff, 23, 10); violet.position.set(-3.7, 2.6, 3); scene.add(violet);
const gold = new THREE.PointLight(0xffa139, 11, 7); gold.position.set(3.6, 1.8, -2.5); scene.add(gold);
const floor = new THREE.Mesh(new THREE.CircleGeometry(3.3, 64), new THREE.MeshStandardMaterial({ color: 0x1d202d, metalness: .15, roughness: .68 }));
floor.rotation.x = -Math.PI / 2; floor.position.y = -.89; scene.add(floor);

function updateCamera() {
  camera.position.set(
    target.x + radius * Math.cos(pitch) * Math.sin(yaw),
    target.y + radius * Math.sin(pitch),
    target.z + radius * Math.cos(pitch) * Math.cos(yaw)
  );
  camera.lookAt(target);
}
function resize() {
  const { width, height } = canvas.getBoundingClientRect();
  renderer.setSize(width, height, false);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
}
function play(name) {
  if (!mixer) return;
  const next = mixer.clipAction(mixer.getRoot().userData.clips.get(name));
  if (active && active !== next) active.fadeOut(.18);
  next.reset().fadeIn(.18).play();
  active = next;
  for (const button of document.querySelectorAll('[data-clip]')) button.setAttribute('aria-pressed', String(button.dataset.clip === name));
}
function eyes(color) {
  const palette = {
    violet: [0xc234ff, 0x7d00e6],
    red: [0xff2847, 0xaf0017],
    blue: [0x2daeff, 0x0065d8]
  }[color];
  model?.traverse((part) => {
    if (part.name === 'EyeL' || part.name === 'EyeR') {
      part.material.color.setHex(palette[0]);
      part.material.emissive.setHex(palette[1]);
    }
  });
}

new GLTFLoader().load('../assets/models/nox-quadruped-prototype.glb', (gltf) => {
  model = gltf.scene;
  model.position.y = -.88;
  model.rotation.y = Math.PI;
  scene.add(model);
  mixer = new THREE.AnimationMixer(model);
  model.userData.clips = new Map(gltf.animations.map((clip) => [clip.name, clip]));
  play('quadruped_idle');
}, undefined, console.error);

canvas.addEventListener('pointerdown', (event) => { dragging = { x: event.clientX, y: event.clientY }; canvas.setPointerCapture(event.pointerId); });
canvas.addEventListener('pointermove', (event) => {
  if (!dragging) return;
  yaw -= (event.clientX - dragging.x) * .008;
  pitch = THREE.MathUtils.clamp(pitch + (event.clientY - dragging.y) * .007, -.28, .75);
  dragging = { x: event.clientX, y: event.clientY };
  updateCamera();
});
canvas.addEventListener('pointerup', () => { dragging = undefined; });
canvas.addEventListener('wheel', (event) => { radius = THREE.MathUtils.clamp(radius + event.deltaY * .006, 4.2, 12); updateCamera(); }, { passive: true });
document.querySelectorAll('[data-clip]').forEach((button) => button.addEventListener('click', () => play(button.dataset.clip)));
document.querySelectorAll('[data-eye]').forEach((button) => button.addEventListener('click', () => eyes(button.dataset.eye)));

const clock = new THREE.Clock();
function render() {
  mixer?.update(clock.getDelta());
  renderer.render(scene, camera);
  requestAnimationFrame(render);
}
updateCamera(); resize(); render();
addEventListener('resize', resize);
