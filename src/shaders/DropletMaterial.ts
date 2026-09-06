import * as THREE from "three";

import vertexShader from "./droplet.vert.glsl?raw";
import fragmentShader from "./droplet.frag.glsl?raw";
import {ShaderMaterial} from "three";

export function createDropletShader() : ShaderMaterial {
    return new ShaderMaterial({
        vertexShader, fragmentShader
    });
}