// Fragment Shader del cielo + 2 esferas + plano + shadow ray + transparency
// En este shader construimos rayos por píxel, pero sólo para mostrar un cielo + 2 esferas
// + plano horizontal + Iluminación Blinn-Phong + Shadow Ray + Transparencia
precision mediump float;
varying vec2 vUV; // Coordenadas normalizadas de pantalla (0..1)

// Parámetros de cámara y proyección
uniform vec2 uResolution;   // tamaño del canvas en píxeles
uniform float uTanHalfFov;   // tan(fov/2)
uniform mat3 uCamRot;       // rotación de la cámara (mundo)
uniform vec3 uCamPos;       // posición de la cámara (mundo)

// Luz y material
uniform vec3  lightdir;      // dirección de la luz (mundo), será normalizada
uniform float alpha;         // brillo especular (exponente de Phong)


const float EPSILON = 0.0001;

struct Material {
    vec3 Kd;
    vec3 Ks;
    float transparency; // 0:opaco, 1:transparente
};

struct Ray {
    vec3 origin;
    vec3 dir;
};

struct Sphere {
    vec3 center;
    float radius;
    Material material;
};

struct Plane {
    vec3 normal;
    float height;
    Material material;
};

struct Hit {
    float t;
    int type;
    int index;
};

Ray makeRay(vec3 origin, vec3 dir) {
    Ray ray;
    ray.origin = origin;
    ray.dir = dir;
    return ray;
}

// Cielo: gradiente simple en función de la dirección del rayo
// dir es un vector unitario de dirección del rayo, hay que convertirlo a un valor entre 0 y 1.
vec3 colorCielo(vec3 dir){
    float t = clamp(0.5 * (dir.y + 1.0), 0.0, 1.0);
    vec3 top = vec3(0.55, 0.75, 1.0);
    vec3 bottom = vec3(0.07, 0.07, 0.12);
    return mix(bottom, top, t); // mix = interpolación lineal entre bottom y top con step t
}

// Parámetros de la escena (esferas, plano y Kambient)
const int NUM_SPHERES = 2;

const Sphere SPHERE_LEFT  = Sphere(vec3(-1.0, 0.0, -3.0), 1.0, Material(vec3(1.0, 0.0, 0.0), vec3(1.0), 0.0));
const Sphere SPHERE_RIGHT = Sphere(vec3( 1.0, 0.0, -2.0), 0.8, Material(vec3(0.1, 0.6, 1.0), vec3(1.0), 0.6));

const Plane FLOOR = Plane(vec3(0.0, 1.0, 0.0), -1.0, Material(vec3(0.0), vec3(0.3), 0.0));

Sphere getSphere(int i) {
    if (i == 0) return SPHERE_LEFT;
    if (i == 1) return SPHERE_RIGHT;
    return SPHERE_LEFT;
}

Plane getFloor() {
    return FLOOR;
}

float K_AMBIENT() { return 0.2; }
vec3 I_AMBIENT() { return vec3(1.0, 1.0, 1.0); } // luz ambiental

// Patrón de tablero sobre el plano (para dar profundidad visual)
vec3 colorTablero(vec3 p){
    float s = 1.0; // tamaño de cada celda
    float cx = floor(p.x / s);
    float cz = floor(p.z / s);
    float chk = mod(cx + cz, 2.0);
    vec3 cA = vec3(0.85);
    vec3 cB = vec3(0.25);
    return mix(cA, cB, chk); // mix = interpolación lineal entre cA y cB con step chk
}

// Intersección rayo-esfera analítica. Devuelve el t de la intersección más cercana, o -1 si no hay intersección.
float hitSphere(Ray ray, Sphere sphere) {
    float t = -1.0;
    vec3 oc = ray.origin - sphere.center;
    float a = dot(ray.dir, ray.dir);
    float b = 2.0 * dot(oc, ray.dir);
    float c = dot(oc, oc) - sphere.radius * sphere.radius;
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
// Intersección rayo-plano genérica
float hitPlane(Ray ray, Plane plane){
    float denom = dot(plane.normal, ray.dir);
    if (abs(denom) > EPSILON) { // evitar división por cero
        float t = (plane.height - dot(plane.normal, ray.origin)) / denom;
        if (t > EPSILON) {
            return t;
        }
    }
    return -1.0;
}

const int OBJ_NONE   = 0;
const int OBJ_SPHERE = 1;
const int OBJ_PLANE  = 2;
const int MAX_TRANSPARENCY_DEPTH = 2;

Hit makeNoHit() {
    Hit h;
    h.t     = -1.0;
    h.type  = OBJ_NONE;
    h.index = -1;
    return h;
}

Hit updateHit(float tCandidate, int type, int index, Hit best) {
    // Si tCandidate es positivo (o sea, golpee algo)
    // y además es mejor que el mejor hasta ahora, actualizo el hitinfo
    if (tCandidate > 0.0 && (best.t < 0.0 || tCandidate < best.t)) {
        Hit newHit;
        newHit.t = tCandidate;
        newHit.type = type;
        newHit.index = index;
        return newHit;
    }
    return best;
}

Hit intersectScene(Ray ray) {
    Hit hit = makeNoHit();
    for (int i = 0; i < NUM_SPHERES; ++i) {
        Sphere sphere = getSphere(i);
        float tS = hitSphere(ray, sphere);
        hit = updateHit(tS, OBJ_SPHERE, i, hit);
    }
    Plane floor = getFloor();
    float tFloor = hitPlane(ray, floor);
    hit = updateHit(tFloor, OBJ_PLANE, 0, hit);
    return hit;
}

//  Idea: desde el punto de intersección, lanzar un rayo hacia la luz
//  Si golpea algo, está en sombra (retorna 0), si no, no lo está (retorna 1)
float computeShadow(vec3 p, vec3 n, int objType, Plane plane) {
    vec3 origin = p + n * EPSILON; // evitar auto-ocultamiento
    vec3 l = normalize(lightdir);
    float shadow = 1.0;
    Ray shadowRay = makeRay(origin, l);

    for (int i = 0; i < NUM_SPHERES; ++i) {
        Sphere sphere = getSphere(i);
        float tS = hitSphere(shadowRay, sphere);
        if (tS > 0.0) {
            return 0.0; // blocked by some sphere
        }
    }

    // ¿Nos tapa el plano?
    // Si estamos SOBRE el plano, ignoramos el propio plano como oclusor
    if (objType != OBJ_PLANE) {
        float tF = hitPlane(shadowRay, plane);
        if (tF > 0.0) {
            shadow = 0.0;
        }
    }
    return shadow;
}

vec3 computeLighting(vec3 p, vec3 n, vec3 v, vec3 Kd, vec3 Ks, int objType, Plane plane) {
    vec3 w = normalize(lightdir);
    vec3 h = normalize(w + v); // vector medio
    float dotwn = dot(w, n);               // L·N
    float costheta = max(dotwn, 0.0);      // cos(theta)
    float cosphiblinn = max(dot(n, h), 0.0); // Blinn-Phong half-vector term
    vec3 ambient = K_AMBIENT() * Kd * I_AMBIENT();
    vec3 direct = I_AMBIENT() * costheta *
        (Kd + Ks *( (pow(cosphiblinn, alpha) / max(costheta, EPSILON))) );

    float shadow = computeShadow(p, n, objType, plane);
    return direct * shadow + ambient;
}

vec3 traceRay(Ray ray) {
    vec3 color = vec3(0.0);
    vec3 throughput = vec3(1.0);
    Ray currentRay = ray;
    Plane plane = getFloor();

    for (int depth = 0; depth <= MAX_TRANSPARENCY_DEPTH; ++depth) {
        Hit hit = intersectScene(currentRay);
        if (hit.type == OBJ_NONE) {
            color += throughput * colorCielo(currentRay.dir);
            break;
        }

        vec3 p = currentRay.origin + currentRay.dir * hit.t;
        vec3 n;
        vec3 Kd;
        vec3 Ks;
        Material material;

        if (hit.type == OBJ_SPHERE) {
            Sphere sphere = getSphere(hit.index);
            n = normalize(p - sphere.center);
            Kd = sphere.material.Kd;
            Ks = sphere.material.Ks;
            material = sphere.material;
        } else {
            n = plane.normal;
            Kd = colorTablero(p);
            Ks = plane.material.Ks;
            material = plane.material;
        }

        vec3 v = normalize(currentRay.origin - p);
        vec3 localColor = computeLighting(p, n, v, Kd, Ks, hit.type, plane);

        float transp = material.transparency;

        // Si el objeto es completamente opaco, terminamos
        if (transp == 0.0) {
            color += throughput * localColor;
            break;
        }

        // Acumular la porción opaca de esta superficie
        color += (1.0 - transp) * localColor;

        // Continuar el rayo a través del objeto transparente
        throughput *= transp;

        // Mover el origen del rayo ligeramente más allá de la superficie para evitar auto-intersección
        currentRay = makeRay(p + currentRay.dir * EPSILON, currentRay.dir);
    }

    return color;
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
    Ray primaryRay = makeRay(rayOrigin, rayDir);

    vec3 color = traceRay(primaryRay);
    gl_FragColor = vec4(color, 1.0);
}
