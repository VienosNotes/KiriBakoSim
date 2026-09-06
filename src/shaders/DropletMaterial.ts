import pixelVertexShader from "./droplet-pixel.vert.glsl?raw";
import pixelFragmentShader from "./droplet-pixel.frag.glsl?raw";

import enhancedVertexShader from "./droplet-enhanced.vert.glsl?raw";
import enhancedFragmentShader from "./droplet-enhanced.frag.glsl?raw";

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
        vertexShader: enhancedVertexShader, fragmentShader: enhancedFragmentShader,
        transparent: true, depthWrite: false,
        uniforms: {
            time: {value: 0.0},
            fadeoutDuration: { value: 1000 },
            fadeinDuration: { value: 200 }
        }
    });
}