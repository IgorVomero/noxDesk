import fs from 'node:fs';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const file = new URL('../assets/models/nox-quadruped-prototype.glb', import.meta.url);
const bytes = fs.readFileSync(file);
const loader = new GLTFLoader();
const gltf = await new Promise((resolve, reject) => loader.parse(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength), '', resolve, reject));
const names = new Set();
gltf.scene.traverse((node) => names.add(node.name));

const requiredNodes = ['NoxQuadruped', 'HeadJoint', 'FrontLHip', 'FrontRHip', 'RearLHip', 'RearRHip', 'TailRoot', 'EyeL', 'EyeR'];
const missing = requiredNodes.filter((name) => !names.has(name));
const clips = new Map(gltf.animations.map((clip) => [clip.name, clip.tracks.length]));
const ok = missing.length === 0 && clips.get('quadruped_idle') === 2 && clips.get('quadruped_walk') === 6;

console.log(JSON.stringify({ ok, namedNodes: names.size, clips: Object.fromEntries(clips), missing }, null, 2));
if (!ok) process.exitCode = 1;
