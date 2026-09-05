import './style.css';
import * as THREE from 'three';
import {BufferGeometry, LineBasicMaterial, PointsMaterial, Vector3} from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {KbRand} from './utils/KbRand';
import {BoxKb} from "./models/BoxKb.ts";
import {Droplet} from "./models/droplet.ts";
import {Muon} from "./models/ChargedParticle.ts";
import {boltzmann} from "./utils/utils.ts";

// 1秒間にミューオンが飛来する平均回数
const muonRatePerSec = 2.5;
// 1秒間に背景水滴を生成する平均回数
const bgRatePerSec = 1000;

// ブラウン運動を誇張する倍率
const brownSigmaMultiplier = 50
// 落下速度を誇張する倍率
const fallSpeedMultiplier = 1;


// 荷電粒子の1ステップの距離
const sd = 0.001; // meter

const kb = new BoxKb(2, 0.5, 2);

const maxDrops = 100000;
const lines: THREE.Line[] = [];
let droplets: Droplet[] = [];
let verticesBuffer: Float32Array = new Float32Array(maxDrops * 3);
let lastUpdated = 0;

const rand = new KbRand();
initControls();
const canvas = document.querySelector('#c')!;

const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000 );
camera.position.z = 2;
camera.position.set(-0.52, 1.67, 0.97);

const renderer = new THREE.WebGLRenderer({antialias: true, canvas});
renderer.setSize( window.innerWidth, window.innerHeight );

const scene = new THREE.Scene();

const frame = buildKiribako();
scene.add(frame);

const light = buildLight();
scene.add(light);

const controls = new OrbitControls(camera, renderer.domElement);

const dropsBuffer = new BufferGeometry();
dropsBuffer.setAttribute("position", new THREE.BufferAttribute(verticesBuffer, 3));
const dropsMaterial = new PointsMaterial({color: "white", size: 0.001});
const dropsMesh = new THREE.Points(dropsBuffer, dropsMaterial);
scene.add(dropsMesh);

renderer.setAnimationLoop(update);

function update(time: number)
{
    const dt = time - lastUpdated;
    controls.update();
    procRandomEvents(time, dt);
    updateDrops(time);
    renderer.render(scene, camera);
    lastUpdated = time;
}

function buildKiribako() {
    const geometry = new THREE.BoxGeometry(kb.width, kb.height, kb.depth);
    const edges = new THREE.EdgesGeometry(geometry);
    const material = new THREE.LineBasicMaterial();
    return new THREE.LineSegments(edges, material);
}

function buildLight() {
    const color = 16777215;
    const intensity = 3;
    const light = new THREE.DirectionalLight(color, intensity);
    light.position.set(-1, 2, 4);
    return light;
}

function getRandomPointInKb(width : number, height : number, depth: number) {
    return new Vector3(
        rand.uniformIn(-width/2, width/2),
        rand.uniformIn(-height/2, height/2),
        rand.uniformIn(-depth/2, depth/2),
    );
}

function initControls()
{
    const rMuon = (document.querySelector('#rand-muon') as HTMLButtonElement)!;
    rMuon.addEventListener('click', () => castRandomMuon());
    const clearLinesButton = (document.querySelector('#clear-lines') as HTMLButtonElement)!;
    clearLinesButton.addEventListener('click', () => clearLines());

}

function castRandomMuon() {
    let bufIdx = droplets.length;
    console.log("muon! " + bufIdx + " droplets");

    const point = getRandomPointInKb(kb.width, kb.height, kb.depth);
    const direction = rand.randomDirection();
    const p1 = point.clone().addScaledVector(direction, -kb.norm);
    const p2 = point.clone().addScaledVector(direction, kb.norm);

    const particle = new Muon(direction, 1, p1, rand);

    const current = p1.clone();
    const now = lastUpdated;

    while(p2.clone().sub(current).dot(direction) > 0)
    {
        current.addScaledVector(direction, sd);
        particle.position = current;
        const sensitivity = kb.getLocalSensitivity(current);
        const created = particle.sampleDroplets(sensitivity, sd).filter(d => kb.contains(d));
        const dropSize = rand.logNormal(2e-5);
        created.forEach(d => droplets.push(new Droplet(d, bufIdx++, dropSize, now, now + rand.normalIn(0, 2000))));
    }

    const geometry = new THREE.BufferGeometry().setFromPoints([p1,p2]);
    const material = new LineBasicMaterial({color: "orange"});
    const line = new THREE.Line(geometry, material);

//    lines.push(line);
//    scene.add(line);
}

function clearLines(): void {
    lines.forEach(l => scene.remove(l));
    lines.splice(0);
}

function updateDrops(time: number) {
    const now = time
    const attr = dropsBuffer.getAttribute("position") as THREE.BufferAttribute;
    let i = 0;
    const nextDrops: Droplet[] = [];
    droplets.forEach(d => {
        const nv = next(d, now);
        if (nv === undefined) {
            return;
        }
        d.bufferIndex = i;
        d.position = nv;
        nextDrops.push(d);
        attr.setXYZ(i, nv.x, nv.y, nv.z);
        i++;
    });

    dropsBuffer.setDrawRange(0, i);
    attr.needsUpdate = true;
    droplets = nextDrops;
}



function next(drop: Droplet, now: number) : Vector3 | undefined {
    if (drop.expiredAt < now) { return undefined; }

    const dt = now - lastUpdated;
    // 終端速度で沈降
    const fell = drop.position.add(new Vector3(0, -(drop.fallSpeed * fallSpeedMultiplier * dt / 1000), 0));

    // ブラウン運動
    const d = (boltzmann * kb.temperature) / (6 * Math.PI * kb.viscosity * drop.radius);
    const brownSigma = Math.sqrt(2 * d * dt) * brownSigmaMultiplier;
    const next = fell.add(new Vector3(rand.normal() * brownSigma, rand.normal() * brownSigma, rand.normal() * brownSigma));

    return kb.contains(next) ? next : undefined;
}

function procRandomEvents(now: number, dt: number) {

    // Muon
    const n = rand.poisson(muonRatePerSec * (dt/1000));
    for (let i = 0; i < n; i++) {
        castRandomMuon();
    }

    // background drops

    const bgn = rand.poisson(bgRatePerSec * (dt/1000));
    for (let i = 0; i < bgn; i++) {
        const pos = new Vector3(
            rand.uniformIn(-kb.width/2, kb.width/2),
            rand.uniformIn(kb.bgDropsBaseHeightLower, kb.bgDropsBaseHeightUpper),
            rand.uniformIn(-kb.depth/2, kb.depth/2),
        )
        const dropSize = rand.logNormal(2e-5);
        const bg = new Droplet(pos, droplets.length, dropSize, now, now + rand.normalIn(500, 2500));
        droplets.push(bg);
    }
}