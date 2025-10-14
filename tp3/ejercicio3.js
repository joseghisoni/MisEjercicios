/*
ejercicio3.js — Funciones para transformaciones 3D y rendering. 
Recordar que usaremos las siguientes convenciones para matrices: un arreglo 1D 
con 9 valores en orden "column-major". Es decir, para un arreglo A[] de 0 a 8, 
cada posición corresponderá a la siguiente matriz:

| A[0] A[3] A[6] |      ==>     [ A[0], A[1], A[2], 
| A[1] A[4] A[7] |                A[3], A[4], A[5], 
| A[2] A[5] A[8] |                A[6], A[7], A[8] ]
*/

// --------------------------- I. Transformaciones 3D ----------------------- //

/* TODO: Implementar funciones básicas para operar con vectores 3D.
Deben incluir: add (suma), sub (resta), dot (producto escalar), 
cross (producto vectorial), norm (longitud), normalize (normalización) y scale (escalar).
Representaremos los vectores como arreglos de 3 elementos: [x, y, z].

Ejemplo de uso:
const v1 = [1, 0, 0];
const v2 = [0, 1, 0];
Vec.add(v1, v2);    devuelve: [1, 1, 0]
Vec.scale(v1, 2);   devuelve: [2, 0, 0]
Tip: Math.hypot(x, y, z) devuelve la magnitud de un vector.
*/ 
const Vec = {
  add:(a,b)=>[a[0]+b[0], a[1]+b[1], a[2]+b[2]],
  sub:(a,b)=>[a[0]-b[0], a[1]-b[1], a[2]-b[2]],
  dot:(a,b)=> (a[0]*b[0] + a[1]*b[1] + a[2]*b[2]),
  cross:(a,b)=>[
    a[1]*b[2] - a[2]*b[1],
    a[2]*b[0] - a[0]*b[2],
    a[0]*b[1] - a[1]*b[0]
  ],
  norm:(a)=> Math.hypot(a[0], a[1], a[2]),
  normalize:(a)=>{
    const n = Math.hypot(a[0], a[1], a[2]);
    if (n === 0) return [0,0,0];
    return [a[0]/n, a[1]/n, a[2]/n];
  },
  scale:(a, x)=> [a[0]*x, a[1]*x, a[2]*x],
};

/* TODO: Implementar multiplicación de matrices 4x4 (orden column-major)
Ayuda: ver tp2.
Ojo: mat4mul(A, B) implementa la multiplicación de matrices en el siguiente orden: AB
*/
function mat4Mul(a,b){
  const out = new Array(16);
  for ( let i = 0; i < 4; i++){
    for (let j = 0; j < 4; j++){
      let suma = 0;
      for(let k = 0; k < 4; k++){
        const a_ik = a[k * 4 + i];
        const b_kj = b[j * 4 + k];
        suma += a_ik * b_kj;
      }
      out[j * 4 + i] = suma;
    }
  }
  return out;
}

/* TODO: Implementar multiplicación de matrices 4x4 (orden column-major)
Ayuda: ver tp2.
*/
function mat4Vec4(a, b){
  const out = new Array(4);
  for ( let i = 0; i < 4; i++){
    let suma = 0;
    for (let j = 0; j < 4; j++){
      const a_ij = a[j * 4 + i];
      suma += a_ij * b[j];
    }
    out[i] = suma;
  }
  return out;
}

/* TODO: Implementar la matriz de vista (lookAt).
La matriz lookAt define la transformación de cámara que coloca el ojo (eye) en
una posición del mundo, orientada hacia un punto objetivo (center), con una
dirección "arriba" (up).

En otras palabras, construye el sistema de referencia de la cámara:
  - f (forward): vector normalizado de 'eye' hasta 'center' (dirección de visión).
  - s (side/right): vector perpendicular a 'f' y 'up'.
  - u (up real): vector perpendicular a 's' y 'f'.

Notar que:
  - El orden column-major implica que los valores se almacenan por columnas.
  - El componente de traslación alinea el origen de la cámara con 'eye'.
  - Al multiplicar un punto del mundo por esta matriz, se obtiene su posición
    en el espacio de la cámara (eye en el origen, mirando hacia -Z).
*/
function lookAt(eye, center, up){
  let f = Vec.normalize(Vec.sub(center, eye))            // -w
  let w = Vec.scale(f, -1)
  let s = Vec.normalize(Vec.cross(up, w)) // u
  let u = Vec.cross(w, s)                                // v

  let matriz_rotacion = [s[0], u[0], w[0], 0, s[1], u[1], w[1], 0, s[2], u[2], w[2], 0, 0, 0, 0, 1]

  let matriz_traslacion = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, eye[0] * -1, eye[1] * -1, eye[2] * -1, 1]

  return mat4Mul(matriz_rotacion, matriz_traslacion)

}

/* TODO: Implementar la matriz de proyección ortográfica
Mapea el volumen de cámara (view volume) definido por:
  x ∈ [left, right], y ∈ [bottom, top], z ∈ [znear, zfar]
al espacio NDC (Normalized Device Coordinates):
  x_ndc, y_ndc ∈ [-1, 1]   y   z_ndc ∈ [-1, 1]  donde la cámara apunta hacia -Z.
*/
function orthographic(left, right, bottom, top, znear, zfar){
  let matriz = [ 2 / (right - left), 0, 0, 0, 0, 2 / (top - bottom), 0, 0, 0, 0, 2/(znear - zfar), 0, -1 * (right + left) / (right - left), -1 * (top + bottom) / (top - bottom), -1 * (znear + zfar) / (znear - zfar), 1 ]
  return matriz

}
function perspective(fovYdeg, aspect, znear, zfar){
  const halfRad = (fovYdeg * Math.PI / 180) * 0.5;
  const f = 1 / Math.tan(halfRad); // cot(fovY/2)
  // Column-major 4x4 perspective matrix (OpenGL-style)
  // Maps view frustum to clip space; z in [-1,1] after divide by w
  return [
    f / aspect, 0, 0, 0,
    0, f, 0, 0,
    0, 0, - (zfar + znear) / (znear - zfar), -1,
    0, 0, (2 * zfar * znear) / (znear - zfar), 0
  ];
}


/*Implementa la conversión de NDC a espacio de pantalla
Convierte coordenadas de NDC [-1,1]^3 a coordenadas de 
pantalla [0,width-1] x [0,height-1] (en coordenadas homogeneas)
Ejemplo: ndcToScreen([-1,1,0], 800, 600) => [0, 0, 0] 
*/
function ndcToScreen(ndc, width, height){
  const x = (ndc[0] * 0.5 + 0.5) * (width - 1);
  const y = ((-ndc[1]) * 0.5 + 0.5) * (height - 1);
  return [x,y,ndc[2]]; // coord z lo mantengo
}

// ----------------------------- II. Rasterization  ----------------------------- //

// ---------------------------- II. I. Raster utils ------------------------- // 

/* Implementa la función setupCamera(ui).
// Esta función calcula la posición y orientación de la cámara a partir de
// parámetros de interfaz (ui). En este caso:
//   - ui.az : ángulo de acimut.
//   - ui.el : ángulo de elevación.
// Asumismos que: 
//   - radius:=3, distancia fija de la cámara al centro de la escena.
//   - center:=(0,0,0) punto de interés al que la cámara siempre mira (aquí el origen).
//   - up = [0,1,0], vector que indica la posición vertical del mundo.
// La función debe devolver un objeto con {eye, center, up}, que se usará
// en la construcción de la matriz de vista (lookAt).
*/
function setupCamera(ui) {
  const azimuth = ui.az;
  const elevation = ui.el;
  const radius = 3.0; 
  const center = [0, 0, 0]; 
  const eye = [
    radius * Math.cos(elevation) * Math.cos(azimuth),
    radius * Math.sin(elevation),
    radius * Math.cos(elevation) * Math.sin(azimuth)
  ];
  const up = [0, 1, 0];
  
  return { eye, center, up };
}

/* Esta función construye la matriz de proyección P según el tipo elegido.
Notas:
•⁠  ⁠NDC: x,y,z ∈ [-1, 1], cámara mirando hacia -Z.
•⁠  ⁠En perspectiva: usar ⁠ perspective(fov, aspect, zn, zf) ⁠ donde
    fov = ui.fov (grados), aspect = width/height.
•⁠  ⁠En ortográfica: asumimos prisma simétrico en X/Y. Se calcula
    aspect = width/height,
    right = ui.orthoLeft * aspect,   // medio-ancho en mundo
    top   = ui.orthoBottom,          // medio-alto en mundo
  y luego ⁠ orthographic(-right, right, -top, top, zn, zf) ⁠.
*/
function setupProjection(width, height, ui, projectionType) {
  const fov = ui.fov;
  let zn, zf;
  
  zn = ui.near;
  zf = ui.far;
  // Asegurar que zn > zf (near está más cerca que far en valores negativos)
  if (zn <= zf) {
    zf = zn - 0.001;
  }

  let P;
  if (projectionType === 'perspective') {
    P = perspective(fov, width/height, zn, zf);
  } else {
    const aspect = width/height;
    const right = ui.orthoLeft * aspect;
    const top = ui.orthoBottom ;
    P = orthographic(-right, right, -top, top, zn, zf);
  }
  
  return { P, fov, zn, zf };
}
/* Implementa la función processGeometry
Esta etapa toma la matriz MVP (Model-View-Projection, MVP = P * V * M) y
transforma todos los vértices del objeto desde espacio de modelo hasta 
espacio CLIP (en coordenadas homogéneas).

Entradas:
  - MVP: matriz 4x4 que ya compone modelo, vista y proyección.
  - CUBE_VERTS: arreglo de vértices en espacio de modelo, cada v = [x,y,z].

Salidas:
  - clip: arreglo de vértices en coordenadas CLIP: [x', y', z', w']
          resultantes de mat4Vec4(MVP, [x, y, z, 1]).
Notar que las coordenadas CLIP aún NO están en NDC. 
*/
function processGeometry(MVP) {
  const clip = CUBE_VERTS.map(v => mat4Vec4(MVP, [v[0],v[1],v[2],1]));
  return { clip };
}
// Esta función mapea las coordenadas homogéneas a NDC
function homogeneousToNDC(coords) {
    const w = coords[3];
    return [
        coords[0] / w,  // x
        coords[1] / w,  // y
        coords[2] / w   // z
    ];
}
// -------------------- II. II. Rasterization de triángulos ---------------------- // 

function area(p0, p1, p2) {
  const x0 = p0[0], y0 = p0[1];
  return (p1[0] - x0) * (p2[1] - y0) - (p1[1] - y0) * (p2[0] - x0);
}

/*Implementa la función triOutsideZ(c0, c1, c2).
Decide si un triángulo está completamente fuera del volumen de visión en el eje Z.
*/
function triOutsideZ(c0, c1, c2) {
  function nearOut(v) {
    var z = v[2], w = v[3];
    if (w === 0) return true;           // tomamos w≈0 como fuera
    return (z / w) > 1;                 // z_ndc > 1 → fuera near
  }

  function farOut(v) {
    var z = v[2], w = v[3];
    if (w === 0) return true;           // tomamos w≈0 como fuera
    return (z / w) < -1;                // z_ndc < -1 → fuera far
  }

  var allNear = nearOut(c0) && nearOut(c1) && nearOut(c2);
  if (allNear) return true;

  var allFar = farOut(c0) && farOut(c1) && farOut(c2);
  if (allFar) return true;

  return false; 
}

// TODO: rasterizer, toma un triángulo en coordenadas de pantalla
// y pinta los vértices correspondientes con el color de rgb
function drawTriangle(img, depth, v0, v1, v2, rgb){
  const h=img.h, w=img.w;
  const xs=[v0[0],v1[0],v2[0]], ys=[v0[1],v1[1],v2[1]];
  // Busco bounding box
  let minX=Math.max(0, Math.floor(Math.min(...xs))), maxX=Math.min(w-1, Math.ceil(Math.max(...xs)));
  let minY=Math.max(0, Math.floor(Math.min(...ys))), maxY=Math.min(h-1, Math.ceil(Math.max(...ys)));
  const A = area(v0, v1, v2);
  if (A === 0) return;
  

  for(let y=minY;y<=maxY;y++){
    for(let x=minX;x<=maxX;x++){
      const p=[x+0.5,y+0.5]; // Píxel en coordenadas de pantalla
      // Barycentric test
      const w0 = area(p, v1, v2);
      const w1 = area(v0, p, v2);
      const w2 = area(v0, v1, p);
      // Accept if same sign as triangle area
      if (A < 0) {
        if (w0 > 0 || w1 > 0 || w2 > 0) continue;
      } else {
        if (w0 < 0 || w1 < 0 || w2 < 0) continue;
      }
      const b0 = w0 / A, b1 = w1 / A, b2 = w2 / A;
      const z = b0*v0[2] + b1*v1[2] + b2*v2[2];
      const idx = (y*w + x);
      if (z >= depth[idx]) continue; // keep nearest with smaller z (NDC: near ~ -1)
      depth[idx] = z;
      const base = idx*4;
      img.data[base+0] = rgb[0];
      img.data[base+1] = rgb[1];
      img.data[base+2] = rgb[2];
      img.data[base+3] = 255;
    }
  }
}

// Esta función renderiza el triángulo
function renderTriangles(width, height, clip) {
  const imgData = ctx.createImageData(width, height);
  const depth   = new Float32Array(width * height);
  depth.fill(Number.POSITIVE_INFINITY);
  const img = {data: imgData.data, w: width, h: height};
  
  for(let i = 0; i < CUBE_FACES.length; i++) {
    // Elijo un triángulo
    const [i0, i1, i2] = CUBE_FACES[i];
    // Convierto a coordenadas CLIP y descarto triángulos
    const c0 = clip[i0], c1 = clip[i1], c2 = clip[i2];

    if (triOutsideZ(c0, c1, c2)) continue;

    // Convierto CLIP -> NDC -> screen
    const v0 = ndcToScreen(homogeneousToNDC(c0), width, height);
    const v1 = ndcToScreen(homogeneousToNDC(c1), width, height);
    const v2 = ndcToScreen(homogeneousToNDC(c2), width, height);

    // Backface culling
    const A = area(v0, v1, v2);
    if (A < 0) continue; // cull clockwise; keep CCW in screen space

    if (mode === 'fill') {
      drawTriangle(img, depth, v0, v1, v2, FACE_COLORS[i]);
    } else if (mode === 'depth') {
      drawTriangle(img, depth, v0, v1, v2, [0, 0, 0]);
    }
  }
  return { imgData, depth };
}

// TODO: Completar la función de renderizado principal
function render() {
  const W = cv.width, H = cv.height;
  
  // 1. Setear cámara y construir la matriz de Vista
  const ui = readUI();
  const { eye, center, up } = setupCamera(ui);
  const V = lookAt(eye, center, up);

  // 2. Configurar proyección
  const { P, fov, zn, zf } = setupProjection(W, H, ui, projectionType);

  // 3. Crear matriz de modelo-vista-proyección
  const M = [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1]; // Identidad - objeto fijo en el espacio mundo
  const VP = mat4Mul(P, V);
  const MVP = mat4Mul(VP, M);

  // 4. Convierto a coordenadas homogeneas
  const { clip } = processGeometry(MVP);

  // 5. Renderizo triángulos
  const { imgData, depth } = renderTriangles(W, H, clip);
  
  // 6. Post-procesar (visualización de profundidad)
  postProcess(imgData, depth, projectionType);

  // 7. Muestro la imagen en el canvas
  ctx.putImageData(imgData, 0, 0);

  // 8. Actualizo la interfaz de usuario
  updateMatrixDisplay(eye, center, up, V, P);

  // 9. Actualizo la vista del mundo
  if (typeof drawWorldView === 'function') {
    drawWorldView(eye, center, up, fov, W/H, zn, zf, ui.az, ui.el, projectionType);
  }
}