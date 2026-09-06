attribute float expiredAt;
attribute float createdAt;
uniform float time;
uniform float fadeoutDuration;
uniform float fadeinDuration;

varying float vOpacity;

void main() {
    vec4 mvPosition =
        modelViewMatrix * vec4(position, 1.0);

    gl_Position =
        projectionMatrix * mvPosition;

    gl_PointSize = 4.0;

    vOpacity = clamp((time - createdAt), 0.0, fadeinDuration) / fadeinDuration;
    vOpacity = vOpacity * clamp((expiredAt - time), 0.0, fadeoutDuration) / fadeoutDuration;
}