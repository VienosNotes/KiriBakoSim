import './style.css';
import * as THREE from 'three';
import {BufferGeometry, type ShaderMaterial, Vector3} from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {KbRand} from './utils/KbRand';
import {BoxKb} from "./models/BoxKb.ts";
import {Droplet} from "./models/droplet.ts";
import {Muon} from "./models/ChargedParticle.ts";
import {boltzmann} from "./utils/utils.ts";
import {createEnhancedMaterial, createPixelMaterial} from "./shaders/DropletMaterial.ts";
import {initDev} from "./devconf.ts";

initDev();

// 1秒間にミューオンが飛来する平均回数
const muonRatePerSec = 2.5;
// 1秒間に背景水滴を生成する平均回数
const bgRatePerSec = 500;

// ブラウン運動を誇張する倍率
const brownSigmaMultiplier = 50
// 落下速度を誇張する倍率
const fallSpeedMultiplier = 1;


// 荷電粒子の1ステップの距離
const sd = 0.001; // meter

const kb = new BoxKb(2, 0.5, 2);

const maxDrops = 100000;
//const lines: THREE.Line[] = [];
let droplets: Droplet[] = [];

let verticesBuffer: Float32Array = new Float32Array(maxDrops * 3);
let deathBuffer: Float32Array = new Float32Array(maxDrops);
let bornBuffer: Float32Array = new Float32Array(maxDrops);
let dropSizeBuffer:  Float32Array = new Float32Array(maxDrops);
let lastUpdated = 0;

let usingMesh: THREE.Points;
let usingMaterial: ShaderMaterial | undefined;

const rand = new KbRand();
const canvas = document.querySelector('#c')!;
const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000 );
camera.position.set(-0.8, 1.4, 1.0);

const renderer = new THREE.WebGLRenderer({antialias: true, canvas});
renderer.setSize( window.innerWidth, window.innerHeight );

const scene = new THREE.Scene();

const frame = buildKiribako();
//scene.add(frame);

const light = buildLight();
scene.add(light);

const controls = new OrbitControls(camera, renderer.domElement);

const dropsBuffer = new BufferGeometry();
dropsBuffer.setAttribute("position", new THREE.BufferAttribute(verticesBuffer, 3));
dropsBuffer.setAttribute("expiredAt", new THREE.BufferAttribute(deathBuffer, 1));
dropsBuffer.setAttribute("createdAt", new THREE.BufferAttribute(bornBuffer, 1));
dropsBuffer.setAttribute("dropSize", new THREE.BufferAttribute(dropSizeBuffer, 1));

initControls();

window.addEventListener("resize", resize);
resize();
renderer.setAnimationLoop(update);

let reserved: number = 0;

function update(time: number)
{
    const dt = time - lastUpdated;
    controls.update();
    procRandomEvents(time, dt);
    updateDrops(time, dt);
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
    const shaderSelector = document.querySelector('#shader-selector')! as HTMLSelectElement;

    const params = new URLSearchParams(window.location.search);
    const shaderQuery = params.get("shader");

    if (shaderSelector && shaderQuery) {
        const exists = Array.from(shaderSelector.options)
            .some(option => option.value === shaderQuery);

        if (exists) {
            shaderSelector.value = shaderQuery;
        }
    }

    shaderSelector.addEventListener("change", e => {
        switchShader(shaderSelector.value);
    });
    switchShader(shaderSelector.value);

    const title = document.querySelector('#top-panel')! as HTMLDivElement;
    title.addEventListener('click', () => reserved++);
}

function switchShader(name: string) {
    dump();
    scene.remove(usingMesh);
    if (name == "Simple") {
        const glowTexture = createGlowTexture();
        const dropsMaterial = new THREE.PointsMaterial({
            size: 0.04,
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
            map: glowTexture,
        });
        usingMaterial = undefined;
        usingMesh = new THREE.Points(dropsBuffer, dropsMaterial);
    } else if (name == "Pixel") {
        usingMaterial = createPixelMaterial();
        usingMesh = new THREE.Points(dropsBuffer, usingMaterial);
    } else if (name == "Default") {
        usingMaterial= createEnhancedMaterial();
        usingMesh = new THREE.Points(dropsBuffer, usingMaterial);
    }
    scene.add(usingMesh);
}

function dump() {
    console.log(`camera pos:`);
    console.log(camera);
}

function castRandomMuon(time: number) {
    let bufIdx = droplets.length;
    //console.log("muon! " + bufIdx + " droplets");

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
        created.forEach(d => droplets.push(new Droplet(d, bufIdx++, dropSize, time, time + rand.normalIn(0, 3000))));
    }

    // const geometry = new THREE.BufferGeometry().setFromPoints([p1,p2]);
    // const material = new LineBasicMaterial({color: "orange"});
    // const line = new THREE.Line(geometry, material);

//    lines.push(line);
//    scene.add(line);
}

// function clearLines(): void {
//     lines.forEach(l => scene.remove(l));
//     lines.splice(0);
// }

function updateDrops(time: number, dt: number) {
    const now = time;
    if (usingMaterial !== undefined) {
        usingMaterial.uniforms.time.value = time;
    }
    const posAttr = dropsBuffer.getAttribute("position") as THREE.BufferAttribute;
    const expiredAttr = dropsBuffer.getAttribute("expiredAt") as THREE.BufferAttribute;
    const createdAttr = dropsBuffer.getAttribute("createdAt") as THREE.BufferAttribute;
    const dropSizeAttr = dropsBuffer.getAttribute("dropSize") as THREE.BufferAttribute;
    let i = 0;
    const nextDrops: Droplet[] = [];

    droplets.forEach(d => {
        if (time > d.expiredAt) {
            return;
        }

        let nv = next(d, now);

        if (!kb.contains(nv) && !d.deathMarked) {
            // 移動先が外にはみ出たら200msで死ぬように寿命を縮める
            d.expiredAt = time + 200;
            d.deathMarked = true;
        }

        d.bufferIndex = i;
        d.position = nv;
        nextDrops.push(d);
        posAttr.setXYZ(i, nv.x, nv.y, nv.z);
        createdAttr.setX(i, d.createdAt);
        expiredAttr.setX(i, d.expiredAt);
        dropSizeAttr.setX(i, d.radius);
        i++;
    });

    dropsBuffer.setDrawRange(0, i);
    posAttr.needsUpdate = true;
    createdAttr.needsUpdate = true;
    expiredAttr.needsUpdate = true;
    dropSizeAttr.needsUpdate = true;
    droplets = nextDrops;
}

function next(drop: Droplet, now: number) : Vector3 {

    const dt = now - lastUpdated;
    // 終端速度で沈降
    const fell = drop.position.add(new Vector3(0, -(drop.fallSpeed * fallSpeedMultiplier * dt / 1000), 0));

    // ブラウン運動
    const d = (boltzmann * kb.temperature) / (6 * Math.PI * kb.viscosity * drop.radius);
    const brownSigma = Math.sqrt(2 * d * dt) * brownSigmaMultiplier;
    const next = fell.add(new Vector3(rand.normal() * brownSigma, rand.normal() * brownSigma, rand.normal() * brownSigma));

    return next;

}

function procRandomEvents(now: number, dt: number) {

    // Muon
    const n = rand.poisson(muonRatePerSec * (dt/1000)) + reserved;
    reserved = 0;
    for (let i = 0; i < n; i++) {
        castRandomMuon(now);
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

function createGlowTexture() {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 64;

    const ctx = canvas.getContext("2d")!;

    const gradient = ctx.createRadialGradient(
        32, 32, 0,
        32, 32, 32,
    );

    gradient.addColorStop(0, "rgba(255,255,255,1)");
    gradient.addColorStop(0.1, "rgba(255,255,255,1)");
    gradient.addColorStop(0.2, "rgba(255,255,255,0.1)");
    gradient.addColorStop(1, "rgba(255,255,255,0)");

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 64, 64);

    return new THREE.CanvasTexture(canvas);
}

function resize() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    renderer.setSize(width, height);

    camera.aspect = width / height;
    camera.updateProjectionMatrix();
}

