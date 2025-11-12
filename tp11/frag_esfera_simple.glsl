// Fragment Shader del cielo + esfera
// En este shader construimos rayos por píxel, pero sólo para mostrar un cielo + esfera simple
precision mediump float;
varying vec2 vUV; // Coordenadas normalizadas de pantalla (0..1)

// Parámetros de cámara y proyección
uniform vec2 uResolution;   // tamaño del canvas en píxeles
uniform float uTanHalfFov;   // tan(fov/2)
uniform mat3 uCamRot;       // rotación de la cámara (mundo)
uniform vec3 uCamPos;       // posición de la cámara (mundo)


// Cielo: gradiente simple en función de la dirección del rayo
// dir es un vector unitario de dirección del rayo, hay que convertirlo a un valor entre 0 y 1.
vec3 colorCielo(vec3 dir){
    float t = clamp(0.5 * (dir.y + 1.0), 0.0, 1.0);
    vec3 top = vec3(0.55, 0.75, 1.0);
    vec3 bottom = vec3(0.07, 0.07, 0.12);
    return mix(bottom, top, t); // mix = interpolación lineal entre bottom y top con step t
}

// Parámetros de la escena (esfera)
vec3  SPHERE_CENTER() { return vec3(0.0, 0.0, -2.0); }
float SPHERE_RADIUS() { return 1.0; }
vec3 SPHERE_COLOR() { return vec3(1.0, 0.0, 0.0); } // rojo

// Intersección rayo-esfera analítica. Devuelve el t de la intersección más cercana, o -1 si no hay intersección.
float hitSphere(vec3 o, vec3 d, vec3 center, float radius) {
    float t = -1.0;
    vec3 oc = o - center;
    float a = dot(d, d);
    float b = 2.0 * dot(oc, d);
    float c = dot(oc, oc) - radius * radius;
    float discriminant = b * b - 4.0 * a * c;
    if (discriminant < 0.0) {
        return t; // No hay intersección
    } else {
        float t1 = (-b - sqrt(discriminant)) / (2.0 * a);
        float t2 = (-b + sqrt(discriminant)) / (2.0 * a);
        if (t1 > 0.0) return t1;
        if (t2 > 0.0) return t2;
        return t; // Ambas intersecciones están detrás del origen
    }
}

void main(){
    // 1) Construcción del rayo en espacio cámara, y transformación a mundo
    // Intuición (cámara pinhole):
    // - La cámara está en el origen del espacio cámara y mira hacia -Z.
    // - Imaginamos un "plano de imagen" a una distancia 1 frente a la cámara (z = -1).
    // - Para cada fragmento/píxel, tomamos su posición normalizada en pantalla vUV en [0,1]^2,
    //   donde (0,0) es la esquina inferior-izquierda y (1,1) la superior-derecha.
    // - Convertimos esas coordenadas a NDC (Normalized Device Coordinates) en [-1,1]^2,
    //   donde (0,0) es el centro de la pantalla; (-1,-1) es la esquina inferior-izquierda y (1,1) la superior-derecha.
    // - Luego, escalamos X e Y por tan(fov/2) y el aspect para obtener el punto del plano de imagen
    //   en espacio cámara. El rayo va desde el origen (ojo) hacia ese punto en (x, y, z=-1).
    // - Finalmente, rotamos ese rayo a espacio mundo con uCamRot y usamos uCamPos como origen del rayo.
    //
    // Relación con el fragmento actual: vUV viene del fullscreen quad y coincide con la cobertura del
    // píxel actual. Por eso, cada ejecución del fragment shader genera un rayo distinto a partir de su vUV.
    float aspect = uResolution.x / uResolution.y;
    
    // Paso 1: de [0,1]^2 a NDC [-1,1]^2
    vec2 ndc = vec2(vUV * 2.0 - 1.0);

    // Paso 2: construir dirección en espacio cámara apuntando al plano de imagen z=-1
    // - Multiplicamos X por aspect*uTanHalfFov y Y por uTanHalfFov para compensar el FOV vertical
    //   y el aspecto (para que los píxeles "cuadrados" no se estiren horizontalmente).
    vec3 rayDirCam = normalize(vec3(ndc.x * uTanHalfFov * aspect,
                                    ndc.y * uTanHalfFov,
                                    -1.0));

    // Paso 3: definir primero el origen del rayo (posición de la cámara en mundo)
    // Esto ayuda a la lectura: primero "desde dónde sale" el rayo y luego "hacia dónde apunta".
    vec3 rayOrigin = uCamPos;

    // Paso 4: Orientar los rayos con la rotación de la cámara
    vec3 rayDir    = normalize(uCamRot * rayDirCam); // espacio mundo

    // 2) Intersección, vemos qué color asignar dependiendo de si golpeamos la esfera o no
    vec3 color;

    float t = hitSphere(rayOrigin, rayDir, SPHERE_CENTER(), SPHERE_RADIUS());
    if (t > 0.0) {
        // Si hay intersección, calculamos el color de la esfera
        color = SPHERE_COLOR();
    } else {
        // Si no hay intersección, usamos el color del cielo
        color = colorCielo(rayDir);
    }

    gl_FragColor = vec4(color, 1.0);
}