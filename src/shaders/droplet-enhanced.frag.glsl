varying float vOpacity;

void main() {

float r = distance(gl_PointCoord, vec2(0.5));

float core =
    1.0 - smoothstep(0.0, 0.20, r);

float halo =
    1.0 - smoothstep(0.15, 0.80, r);

float radialAlpha =
    core * 0.8 + halo * 0.08;

gl_FragColor =
    vec4(1.0, 1.0, 1.0, vOpacity * radialAlpha);
}