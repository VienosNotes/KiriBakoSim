attribute float expiredAt;
attribute float createdAt;
attribute float dropSize;
uniform float time;
uniform float fadeoutDuration;
uniform float fadeinDuration;

varying float vOpacity;
varying float vRed;
varying float vGreen;
varying float vBlue;

void main() {
    vec4 mvPosition =
        modelViewMatrix * vec4(position, 1.0);

    gl_Position =
        projectionMatrix * mvPosition;

    gl_PointSize = 4.0 * dropSize * 100000.0;

    vOpacity = clamp((time - createdAt), 0.0, fadeinDuration) / fadeinDuration;
    vOpacity = vOpacity * clamp((expiredAt - time), 0.0, fadeoutDuration) / fadeoutDuration;

    vRed = 1.0;
    vGreen = 1.0;
    vBlue = 1.0;
}