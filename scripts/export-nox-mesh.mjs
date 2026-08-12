import fs from 'node:fs';
import * as THREE from 'three';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

globalThis.FileReader = class FileReader {
  readAsArrayBuffer(blob) {
    blob.arrayBuffer().then((result) => {
      this.result = result;
      this.onloadend?.();
    });
  }
  readAsDataURL(blob) {
    blob.arrayBuffer().then((result) => {
      this.result = `data:${blob.type};base64,${Buffer.from(result).toString('base64')}`;
      this.onloadend?.();
    });
  }
};

const out = new URL('../assets/models/nox-quadruped-prototype.glb', import.meta.url);
fs.mkdirSync(new URL('../assets/models/', import.meta.url), { recursive: true });

const mat = (name, color, roughness = .3, metalness = .9, emissive = 0x000000) => {
  const material = new THREE.MeshStandardMaterial({ color, roughness, metalness, emissive, emissiveIntensity: emissive ? 1.5 : 0 });
  material.name = name;
  return material;
};
const graphite = mat('Graphite alloy', 0x272c37, .25, .9);
const armor = mat('Brushed armor', 0x4a5160, .3, .88);
const black = mat('Black chassis', 0x080b11, .2, 1);
const gold = mat('Machined gold', 0xc88d35, .2, .94);
const violet = mat('Violet energy seam', 0x7a20b5, .2, .75, 0x3d006b);
const eye = mat('Adaptive eye violet', 0xc234ff, .06, .18, 0x7d00e6);
const red = mat('Sentinel red', 0xd62939, .16, .4, 0x9e0013);
function part(geo, material, name, pos = [0, 0, 0], rot = [0, 0, 0], scale = [1, 1, 1]) { const m = new THREE.Mesh(geo, material); m.name = name; m.position.set(...pos); m.rotation.set(...rot); m.scale.set(...scale); return m; }
function plate(parent, size, material, name, pos, rot = [0,0,0]) { parent.add(part(new RoundedBoxGeometry(...size, 4, Math.min(.075, ...size.map((value) => value / 5))), material, name, pos, rot)); }
function capsule(parent, radius, length, material, name, pos, rot = [0,0,0]) { parent.add(part(new THREE.CapsuleGeometry(radius, length, 6, 12), material, name, pos, rot)); }
function wedge(parent, radius, depth, material, name, pos, rot = [0,0,0], scale = [1,1,1]) { parent.add(part(new THREE.CylinderGeometry(radius, radius, depth, 4, 1, false, Math.PI / 4), material, name, pos, rot, scale)); }

const nox = new THREE.Group(); nox.name = 'NoxQuadruped';
const body = new THREE.Group(); body.name = 'Body'; body.position.set(0, 1.45, 0); nox.add(body);
body.add(part(new THREE.CapsuleGeometry(.86, 1.45, 8, 16), graphite, 'CoreChassis', [0,0,0], [Math.PI / 2,0,0]));
plate(body,[1.58,.34,1.16],armor,'ChestArmor',[0,.2,.05]); plate(body,[1.48,.11,.88],violet,'ChestVioletTrim',[0,.4,.22],[-.08,0,0]); plate(body,[1.57,.21,.95],graphite,'SpineArmor',[0,.47,.15],[-.08,0,0]);
for (let i = 0; i < 4; i += 1) {
  plate(body, [1.22 - i * .05, .12, .32], armor, `SpinePlate${i + 1}`, [0, .48, -.18 - i * .28], [-.12, 0, 0]);
  plate(body, [1.05 - i * .05, .035, .06], violet, `SpineSeam${i + 1}`, [0, .56, -.18 - i * .28], [-.12, 0, 0]);
}

const headJoint = new THREE.Group(); headJoint.name = 'HeadJoint'; headJoint.position.set(0,.48,1.15); body.add(headJoint);
const head = new THREE.Group(); head.name = 'Head'; headJoint.add(head);
head.add(part(new THREE.DodecahedronGeometry(.83,1),graphite,'Helmet',[0,.06,.08],[0,Math.PI/4,0],[1.05,.86,1.03])); plate(head,[1.25,.42,.78],armor,'FaceArmor',[0,.26,.48],[-.28,0,0]); plate(head,[.9,.12,.74],black,'Brow',[0,.38,.72],[-.25,0,0]);
plate(head, [.72, .24, .45], black, 'Muzzle',[0, -.04, .78],[-.06,0,0]);
plate(head, [.94, .075, .11], violet, 'MuzzleSeam',[0, .02, 1.005],[-.06,0,0]);
for (const side of [-1,1]) {
  const ear = new THREE.Group(); ear.name = side < 0 ? 'EarL' : 'EarR'; ear.position.set(side*.5,.68,.08); ear.rotation.z = side*-.2; head.add(ear);
  ear.add(part(new THREE.ConeGeometry(.3,.9,4),graphite,'EarArmor',[0,.4,0],[0,Math.PI/4,0])); ear.add(part(new THREE.ConeGeometry(.13,.55,4),violet,'EarViolet',[0,.39,.04],[0,Math.PI/4,0]));
  wedge(head, .22, .09, eye, side < 0 ? 'EyeL' : 'EyeR', [side*.34,.02,.79], [Math.PI/2, 0, side * .32], [1.5,.55,.32]);
  plate(head,[.43,.12,.17],armor,side < 0 ? 'CheekPlateL' : 'CheekPlateR',[side*.5,-.08,.64],[0,side*.18,side*.25]);
  const temple = new THREE.Group(); temple.name = side < 0 ? 'TempleWheelL' : 'TempleWheelR'; temple.position.set(side*.78,.02,.12); temple.rotation.z = Math.PI/2; head.add(temple); temple.add(part(new THREE.CylinderGeometry(.23,.23,.13,16),gold,'GoldHub',[0,0,0])); temple.add(part(new THREE.CylinderGeometry(.34,.34,.12,20),black,'TempleTire',[0,0,-.01]));
 }
head.add(part(new THREE.ConeGeometry(.12,.36,4),red,'ForeheadCore',[0,.36,.75],[Math.PI/2,0,Math.PI/4]));

function wheel(parent, side, z, name) {
  const g = new THREE.Group(); g.name = name; g.position.set(side*.92,.02,z); parent.add(g);
  g.add(part(new THREE.CylinderGeometry(.38,.38,.22,20),black,'Tire',[0,0,0],[Math.PI/2,0,0]));
  g.add(part(new THREE.CylinderGeometry(.25,.25,.245,16),gold,'Hub',[0,0,0],[Math.PI/2,0,0]));
  const spokes = new THREE.Group(); spokes.name = 'HubSpokes'; g.add(spokes);
  for (let spoke = 0; spoke < 6; spoke += 1) {
    const angle = spoke * Math.PI / 3;
    capsule(spokes, .026, .34, graphite, `Spoke${spoke + 1}`, [Math.cos(angle) * .13, Math.sin(angle) * .13, .13], [Math.PI / 2, 0, angle]);
  }
}
for (const side of [-1,1]) { wheel(body,side,.52,side<0?'ShoulderWheelL':'ShoulderWheelR'); wheel(body,side,-.64,side<0?'HaunchWheelL':'HaunchWheelR'); }
function leg(side, front) { const label = `${front ? 'Front' : 'Rear'}${side<0?'L':'R'}`; const rig = new THREE.Group(); rig.name=`${label}Hip`; rig.position.set(side*.7,-.27,front?.72:-.72); body.add(rig); const upper = new THREE.Group(); upper.name=`${label}Upper`; rig.add(upper); capsule(upper,.2,.66,armor,`${label}UpperArmor`,[0,-.4,0]); upper.add(part(new THREE.SphereGeometry(.27,12,8),gold,`${label}Knee`,[0,-.12,0])); plate(upper,[.28,.42,.22],graphite,`${label}UpperPlate`,[0,-.42,.12],[front?-.17:.15,0,0]); const lower = new THREE.Group(); lower.name=`${label}Lower`; lower.position.set(0,-.73,front?.05:-.03); upper.add(lower); capsule(lower,.18,.56,graphite,`${label}LowerArmor`,[0,-.31,.08],[front?-.13:.13,0,0]); plate(lower,[.27,.34,.2],armor,`${label}ShinPlate`,[0,-.3,.15],[front?-.1:.1,0,0]); const paw = new THREE.Group(); paw.name=`${label}Paw`; paw.position.set(0,-.7,.3); lower.add(paw); paw.add(part(new RoundedBoxGeometry(.46,.22,.64,4,.06),black,`${label}PawArmor`,[0,0,.12])); for(const toe of [-.14,0,.14]) paw.add(part(new THREE.ConeGeometry(.07,.23,4),gold,`${label}Claw`,[toe,-.04,.48],[Math.PI/2,0,Math.PI/4])); }
for(const side of [-1,1]) { leg(side,true); leg(side,false); }
const tailRoot = new THREE.Group(); tailRoot.name='TailRoot'; tailRoot.position.set(0,.2,-1.25); body.add(tailRoot); let segment=tailRoot; for(let i=0;i<4;i+=1) { const joint=new THREE.Group(); joint.name=`TailJoint${i+1}`; joint.position.z=i===0?0:-.42; segment.add(joint); joint.add(part(new THREE.ConeGeometry(.16-i*.02,.52,5),graphite,`TailArmor${i+1}`,[0,.16,-.2],[Math.PI/2.8,0,0])); joint.add(part(new THREE.ConeGeometry(.055,.35,4),violet,`TailEnergy${i+1}`,[0,.17,-.24],[Math.PI/2.8,0,0])); segment=joint; }

const rotationsX = (values) => new Float32Array(values.flatMap((value) => new THREE.Quaternion().setFromEuler(new THREE.Euler(THREE.MathUtils.degToRad(value), 0, 0)).toArray()));
const rotationsY = (values) => new Float32Array(values.flatMap((value) => new THREE.Quaternion().setFromEuler(new THREE.Euler(0, THREE.MathUtils.degToRad(value), 0)).toArray()));
const times = new Float32Array([0, .25, .5, .75, 1]);
const gait = new THREE.AnimationClip('quadruped_walk', 1, [
  new THREE.QuaternionKeyframeTrack('FrontLHip.quaternion', times, rotationsX([10, -24, 10, 30, 10])),
  new THREE.QuaternionKeyframeTrack('RearRHip.quaternion', times, rotationsX([10, -24, 10, 30, 10])),
  new THREE.QuaternionKeyframeTrack('FrontRHip.quaternion', times, rotationsX([-20, 22, -20, -30, -20])),
  new THREE.QuaternionKeyframeTrack('RearLHip.quaternion', times, rotationsX([-20, 22, -20, -30, -20])),
  new THREE.QuaternionKeyframeTrack('HeadJoint.quaternion', times, rotationsX([0, 2, 0, -2, 0])),
  new THREE.QuaternionKeyframeTrack('TailRoot.quaternion', times, rotationsY([8, -11, 8, 16, 8]))
]);
const idle = new THREE.AnimationClip('quadruped_idle', 2, [
  new THREE.QuaternionKeyframeTrack('HeadJoint.quaternion', new Float32Array([0, .5, 1, 1.5, 2]), rotationsX([0, -2, 1.5, -1, 0])),
  new THREE.QuaternionKeyframeTrack('TailRoot.quaternion', new Float32Array([0, .5, 1, 1.5, 2]), rotationsY([0, 8, -6, 10, 0]))
]);

const exporter = new GLTFExporter();
const result = await exporter.parseAsync(nox, { binary: true, trs: true, onlyVisible: true, animations: [idle, gait] });
fs.writeFileSync(out, Buffer.from(result));
console.log(`Wrote ${out.pathname}`);
