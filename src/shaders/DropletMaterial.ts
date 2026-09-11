import pixelVertexShader from "./droplet-pixel.vert.glsl?raw";
import pixelFragmentShader from "./droplet-pixel.frag.glsl?raw";

import defaultVertexShader from "./droplet-default.vert.glsl?raw";
import defaultFragmentShader from "./droplet-default.frag.glsl?raw";

import dopaVertexShader from "./droplet-dopa.vert.glsl?raw";
import dopaFragmentShader from "./droplet-dopa.frag.glsl?raw";

import {ShaderMaterial} from "three";

export function createPixelMaterial() : ShaderMaterial {
    return new ShaderMaterial({
        vertexShader: pixelVertexShader, fragmentShader: pixelFragmentShader,
        uniforms: {
            time: {value: 0.0},
            fadeoutDuration: { value: 1000 },
            fadeinDuration: { value: 500 }
        }
    });
}

export function createEnhancedMaterial() : ShaderMaterial {
    return new ShaderMaterial({
        vertexShader: defaultVertexShader, fragmentShader: defaultFragmentShader,
        transparent: true, depthWrite: false,
        uniforms: {
            time: {value: 0.0},
            fadeoutDuration: { value: 1000 },
            fadeinDuration: { value: 200 }
        }
    });
}

export function createDopaMaterial() : ShaderMaterial {
    return new ShaderMaterial({
        vertexShader: dopaVertexShader, fragmentShader: dopaFragmentShader,
        transparent: true, depthWrite: false,
        uniforms: {
            time: {value: 0.0},
            fadeoutDuration: { value: 1000 },
            fadeinDuration: { value: 200 }
        }
    });
}