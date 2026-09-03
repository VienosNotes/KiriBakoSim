import './style.css';
import * as THREE from 'three';
import { LineBasicMaterial, Vector3} from "three";
import {toRad, rnd, rndAngle} from './utils/utils';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';



const kbWidth = 2;
const kbHeight = 0.5;
const kbDepth = 2;

const lines: THREE.Line[] = [];
const drops = [];


initControls();
const canvas = document.querySelector('#c')!;

const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000 );
camera.position.z = 2;

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
    const geometry = new THREE.BoxGeometry(kbWidth, kbHeight, kbDepth);
    const edges = new THREE.EdgesGeometry(geometry);
    const material = new THREE.LineBasicMaterial();
    const frame = new THREE.LineSegments(edges, material);
    frame.rotation.x = toRad(60);
    frame.rotation.y = toRad(15);
    return frame;
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
        rnd(-width/2, width/2),
        rnd(-height/2, height/2),
        rnd(-depth/2, depth/2),
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
    console.log("muon!");
    const point = getRandomPointInKb(kbWidth, kbHeight, kbDepth);
    const angle = rndAngle();

    const p1 = point.clone().addScaledVector(angle, -10);
    const p2 = point.clone().addScaledVector(angle, 10);
    const geometry = new THREE.BufferGeometry().setFromPoints([p1,p2]);
    const material = new LineBasicMaterial({color: "orange"});
    const line = new THREE.Line(geometry, material);

    lines.push(line);
    scene.add(line);
}

function clearLines(): void {
    lines.forEach(l => scene.remove(l));
    lines.splice(0);
}