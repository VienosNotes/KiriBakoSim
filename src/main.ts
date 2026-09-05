import './style.css';
import * as THREE from 'three';
import {LineBasicMaterial, PointsMaterial, Vector3} from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {KbRand} from './utils/KbRand';
import {BoxKb} from "./models/BoxKb.ts";
import {Droplet} from "./models/droplet.ts";
import {Muon} from "./models/ChargedParticle.ts";

const sd = 0.001; // meter

const kb = new BoxKb(2, 0.5, 2);

const lines: THREE.Line[] = [];
const droplets: Droplet[] = [];

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

renderer.setAnimationLoop(update);

function update()
{
    controls.update();
    renderer.render(scene, camera);
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

    while(p2.clone().sub(current).dot(direction) > 0)
    {
        current.addScaledVector(direction, sd);
        particle.position = current;
        const sensitivity = kb.getLocalSensitivity(current);
        const created = particle.sampleDroplets(sensitivity, sd).filter(d => kb.contains(d));
        created.forEach(d => droplets.push(new Droplet(d, bufIdx++)));
    }

    const geometry = new THREE.BufferGeometry().setFromPoints([p1,p2]);
    const material = new LineBasicMaterial({color: "orange"});
    const line = new THREE.Line(geometry, material);

    const dgeo = new THREE.BufferGeometry().setFromPoints(droplets.map(d => d.position));
    const dmaterial = new PointsMaterial({color: "white", size: 0.01});
    const drops = new THREE.Points(dgeo, dmaterial);

    lines.push(line);
    scene.add(line);

    scene.add(drops);
}

function putDroplet(particlePos: Vector3) {

}

function clearLines(): void {
    lines.forEach(l => scene.remove(l));
    lines.splice(0);
}