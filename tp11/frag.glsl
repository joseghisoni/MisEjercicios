// Fragment Shader del cielo
// En este shader construimos rayos por píxel, pero sólo para mostrar un cielo simple
precision mediump float;
varying vec2 vUV; // Coordenadas normalizadas de pantalla (0..1)

// Parámetros de cámara y proyección
uniform vec2 uResolution;   // tamaño del canvas en píxeles
uniform float uTanHalfFov;   // tan(fov/2)
uniform mat3 uCamRot;       // rotación de la cámara (mundo)
uniform vec3 uCamPos;       // posición de la cámara (mundo)



void main(){
    vec3 color=vec3(0.0, 0.5, 1.0); // Color azul claro
    gl_FragColor = vec4(color, 1.0);
}