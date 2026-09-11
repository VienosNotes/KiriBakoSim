attribute float expiredAt;
attribute float createdAt;
attribute float dropSize;
attribute float sourceId;

uniform float time;
uniform float fadeoutDuration;
uniform float fadeinDuration;

varying float vOpacity;
varying float vRed;
varying float vGreen;
varying float vBlue;

vec3 hueToRgb(float h)
{
    vec3 rgb = abs(fract(h + vec3(0.0, 2.0/3.0, 1.0/3.0)) * 6.0 - 3.0);
    return clamp(rgb - 1.0, 0.0, 1.0);
}

void main() {
    vec4 mvPosition =
        modelViewMatrix * vec4(position, 1.0);

    gl_Position =
        projectionMatrix * mvPosition;

    float beat = (2.0 - (mod(time, 500.0) / 500.0));

    gl_PointSize = 4.0 * dropSize * 100000.0;

    vOpacity = clamp((time - createdAt), 0.0, fadeinDuration) / fadeinDuration;
    vOpacity = vOpacity * clamp((expiredAt - time), 0.0, fadeoutDuration) / fadeoutDuration;

    if (sourceId == 0.0) {

      float hue = mod(time + ((position.x + position.z) * 500.0), 1000.0) / 1000.0;
      vec3 rgb = hueToRgb(hue);
      vRed = rgb.r;
      vGreen = rgb.g;
      vBlue = rgb.b;
    } else {
      float hue2 = mod(sourceId, 16.0) / 16.0;
      vec3 rgb2 = hueToRgb(hue2);
      vRed = rgb2.r;
      vGreen = rgb2.g;
      vBlue = rgb2.b;
    }
}

