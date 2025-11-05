## ¿Qué vamos a hacer hoy? RayTracing

1. Ray Tracing del cielo (estático).
2. Ray Tracing del cielo dinámico.
3. Lo anterior, más una esfera.
4. Lo anterior, más los vectores normales de la esfera.
5. Lo anterior, más un plano. 
6. Lo anterior, más esfera pero ahora con color diffuso.
7. Lo anterior, más modelo de iluminación (Blinn-Phong).
8. Lo anterior, más sombras. 


### Pseudocódigo para el paso 2

```c
// Fragment Shader del cielo
// En este shader construimos rayos por píxel, pero sólo para mostrar un cielo simple
precision mediump float;
varying vec2 vUV; // Coordenadas normalizadas de pantalla (0..1)

// Parámetros de cámara y proyección: usar los mismos nombres que los punteros en el constructor del RayTracer.
// - tamaño del canvas en píxeles
// - tan(fov/2)
// - rotación de la cámara (mundo)
// - posición de la cámara (mundo)


// Cielo: gradiente simple en función de la dirección del rayo
vec3 colorCielo(vec3 dir){}

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
    
    // Relación con el fragmento actual: vUV viene del fullscreen quad y coincide con la cobertura del
    // píxel actual. Por eso, cada ejecución del fragment shader genera un rayo distinto a partir de su vUV.
    
    // Paso 1: de [0,1]^2 a NDC [-1,1]^2

    // Paso 2: construir dirección en espacio cámara apuntando al plano de imagen z=-1
    // - Multiplicamos X por aspect*uTanHalfFov y Y por uTanHalfFov para compensar el FOV vertical
    //   y el aspecto (para que los píxeles "cuadrados" no se estiren horizontalmente).
   

    // Paso 3: definir primero el origen del rayo (posición de la cámara en mundo)
    // Esto ayuda a la lectura: primero "desde dónde sale" el rayo y luego "hacia dónde apunta".
   

    // Paso 4: Orientar los rayos con la rotación de la cámara
   

    // Paso 5: Asigno el color
    vec3 color;

    color = ...

    gl_FragColor = vec4(color, 1.0);
}
```


## Algunas funciones útiles

1. Gradiente del color de cielo dependiente de la dirección 

```c
// Cielo: gradiente simple en función de la dirección del rayo
// dir es un vector unitario de dirección del rayo, hay que convertirlo a un valor entre 0 y 1.
vec3 colorCielo(vec3 dir){
    float t = clamp(0.5 * (dir.y + 1.0), 0.0, 1.0);
    vec3 top = vec3(0.55, 0.75, 1.0);
    vec3 bottom = vec3(0.07, 0.07, 0.12);
    return mix(bottom, top, t); // mix = interpolación lineal entre bottom y top con step t
}
```

2. Patrón de tablero
```c
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
```

3. Algunas clases útiles. Encapsulamos los "hits" en un objeto que guarda la distancia, 
el tipo de objeto que intersequé y cuál. Es útil por si quiero modelar una escena con varios objetos.
```c
const int OBJ_NONE   = 0;
const int OBJ_SPHERE = 1;
const int OBJ_PLANE  = 2;

struct HitInfo {
    float t;    // distancia a la intersección
    int   type; // tipo de objeto golpeado
    int   index;// cuál en el array (para múltiples esferas/planos)
};

HitInfo makeNoHit() {
    HitInfo h;
    h.t     = -1.0;
    h.type  = OBJ_NONE;
    h.index = -1;
    return h;
}

HitInfo updateHit(float tCandidate, int type, int index, HitInfo best) {
    // Si tCandidate es positivo (o sea, golpee algo)
    // y además es mejor que el mejor hasta ahora, actualizo el hitinfo
    if (tCandidate > 0.0 && (best.t < 0.0 || tCandidate < best.t)) {
        HitInfo newHit;
        newHit.t = tCandidate;
        newHit.type = type;
        newHit.index = index;
        return newHit;
    }
    return best;
}
```

4. Modelo de iluminación (TP anterior)
```c
void main()
	{
		vec4 I = vec4(1.0,1.0,1.0,1.0);

		// color_diff = Color difuso base (Kd). Por defecto es blanco.
		vec4 color_diff = vec4(1.0,1.0,1.0,1.0);
		if (useTex == 1) { color_diff = texture2D( tex, texCoord );	}

		vec3 v = normalize(-vec3(vertCoord[0],vertCoord[1],vertCoord[2])); 
		vec3 n = normalize(mn * normCoord);
	    vec3 w = normalize(lightdir);

		vec3 h = normalize(w + v);

		float dotwn = dot(w,n);

		// r = Vector de Reflexión (Reflect). Calcula el vector de la luz reflejada a través de la normal.
        // Fórmula: R = 2 * (L · N) * N - L
		vec3 r = 2.0 * dotwn * n - w;

		// Es la base de la iluminación difusa en el modelo de iluminación.
		float costeta = dotwn;
		// Es la base de la iluminación especular en el modelo de iluminación de Phong (clásico).
		float cosphi  = dot(r,v);
		// Es la base del brillo especular en el modelo Blinn-Phong.
		float cosphiblinn  = dot(n,h);

		vec4 Kd  = color_diff;
		// Ks = Coeficiente especular. Es el color del "brillo".
		vec4 Ks  = vec4(1.0,1.0,1.0,1.0);

		// --- Ecuación Final de Iluminación (Blinn-Phong) ---
        //
        // C = Componente_Ambiental + Componente_Difusa + Componente_Especular
        //
        // La fórmula está factorizada para optimizar:
        // C = I_Ambiente + I_Luz * ( Kd * cos(theta) + Ks * [ (cos(phi_blinn)^alpha) / cos(theta) ] ) * cos(theta)
        // C = I_Ambiente + I_Luz * max(0.0, costeta) * (Kd + Ks * (pow(max(0.0, cosphiblinn), alpha) / costeta))
		vec4 C = I * max(0.0,costeta) * (Kd +  Ks * ( ( pow( max(0.0,cosphiblinn), alpha) ) / costeta ) ) + 0.1 * I * Kd ;

		gl_FragColor = C;
	}
```