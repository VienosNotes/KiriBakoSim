import './style.css';
import * as THREE from 'three';
import {toRad} from './utils/utils';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';

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
    const boxWidth = 2;
    const boxHeight = 0.5;
    const boxDepth = 2;
    const geometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);
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
