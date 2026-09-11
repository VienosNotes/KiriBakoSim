uniform float time;
varying float vSourceId;
varying float vOpacity;
varying float vRed;
varying float vGreen;
varying float vBlue;


void main() {

float r = distance(gl_PointCoord, vec2(0.5));

float beat;

 if (vSourceId == 0.0) {
   float period = 1000.0;
   float width = 400.0;
   float t = mod(time, period);
   float d = min(t, period - t);
   float pulse = exp(-(d * d) / (2.0 * width * width));
   float core =
       1.0 - smoothstep(0.0, 0.20 + pulse * 0.1, r);

   float halo =
       1.0 - smoothstep(0.15 + pulse * 0.1, 0.80, r);

   float radialAlpha =
       core * 0.8 + halo * 0.08;
       gl_FragColor =
           vec4(vRed, vGreen, vBlue, vOpacity * radialAlpha * pulse);
 } else {
   float core =
       1.0 - smoothstep(0.0, 0.20 + beat, r);

   float halo =
       1.0 - smoothstep(0.15, 0.80, r);

   float radialAlpha =
       core * 0.8 + halo * 0.08;
       gl_FragColor =
           vec4(vRed, vGreen, vBlue, vOpacity * radialAlpha);
 }




}