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
  // Completar 
};

/* TODO: Implementar multiplicación de matrices 4x4 (orden column-major)
Ayuda: ver tp2.
Ojo: mat4mul(A, B) implementa la multiplicación de matrices en el siguiente orden: AB
*/
function mat4Mul(a,b){
  
}

/* TODO: Implementar multiplicación de matrices 4x4 (orden column-major)
Ayuda: ver tp2.
*/
function mat4Vec4(m, v){
  
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

}

/* TODO: Implementar la matriz de proyección ortográfica
Mapea el volumen de cámara (view volume) definido por:
  x ∈ [left, right], y ∈ [bottom, top], z ∈ [znear, zfar]
al espacio NDC (Normalized Device Coordinates):
  x_ndc, y_ndc ∈ [-1, 1]   y   z_ndc ∈ [-1, 1]  donde la cámara apunta hacia -Z.
*/
function orthographic(left, right, bottom, top, znear, zfar){

}
/* TODO: Implementar la matriz de proyección perspectiva,
La transformación proyectiva que lleva del view frustrum a espacio CLIP. Ejemplo,
(x_clip, y_clip, z_clip, w_clip).T = P * (x, y, z, 1).T
Para obtener las coordenadas en NDC, basta dividir (x,y,z) por w_clip.
Los parámetros son: 
- fovYdeg: field of view en grados (vertical)
- aspect: ratio (r) de width/height
- znear, zfar: planos de near y far
Ayuda: ver apunte del campus.
*/
function perspective(fovYdeg, aspect, znear, zfar){

}


/*Implementa la conversión de NDC a espacio de pantalla
Convierte coordenadas de NDC [-1,1]^3 a coordenadas de 
pantalla [0,width-1] x [0,height-1] (en coordenadas homogeneas)
Ejemplo: ndcToScreen([-1,1,0], 800, 600) => [0, 0, 0] 
*/
function ndcToScreen(ndc, width, height){
  const x = (ndc[0]*0.5*(width)+0.5*(width-1));
  const y = ((-ndc[1]*0.5*(height)+0.5*(height-1)));
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
- NDC: x,y,z ∈ [-1, 1], cámara mirando hacia -Z.
- En perspectiva: usar `perspective(fov, aspect, zn, zf)` donde
    fov = ui.fov (grados), aspect = width/height.
- En ortográfica: asumimos prisma simétrico en X/Y. Se calcula
    aspect = width/height,
    right = ui.orthoLeft * aspect,   // medio-ancho en mundo
    top   = ui.orthoBottom,          // medio-alto en mundo
  y luego `orthographic(-right, right, -top, top, zn, zf)`.
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

/* TODO: Implementar la función area(p0, p1, p2).
*/
function area(p0,p1,p2){ 

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
  

  for(let y=minY;y<=maxY;y++){
    for(let x=minX;x<=maxX;x++){
      const p=[x+0.5,y+0.5]; // Píxel en coordenadas de pantalla
      // dibujo pixel
    }
  }
}

// Esta función renderiza el triángulo
function renderTriangles(width, height, clip) {
  const imgData = ctx.createImageData(width, height);
  const depth   = new Float32Array(width * height);
  depth.fill(Number.NEGATIVE_INFINITY);
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
    const area = edge(v0, v1, v2);
    if (area > 0) continue; // ndc flip this

    if (mode === 'fill') {
      drawTriangle(img, depth, v0, v1, v2, FACE_COLORS[i]);
    } else if (mode === 'depth') {
      drawTriangle(img, depth, v0, v1, v2, [0, 0, 0]);
    }
}

// TODO: Completar la función de renderizado principal
function render() {
  const W = cv.width, H = cv.height;
  
  // 1. Setear cámara y construir la matriz de Vista
  const ui = readUI();
  // a completar

  // 2. Configurar proyección
  const { P, fov, zn, zf } = setupProjection(W, H, ui, projectionType);

  // 3. Crear matriz de modelo-vista-proyección
  const M = [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1]; // Identidad - objeto fijo en el espacio mundo
  //  a completar

  // 4. Convierto a coordenadas homogeneas
  const { clip } = processGeometry(MVP);

  // 5. Renderizo triángulos
  const { imgData, depth } = renderTriangles(W, H, clip);
  
  // 6. Post-procesar (visualización de profundidad)
  postProcess(imgData, depth);

  // 7. Muestro la imagen en el canvas
  ctx.putImageData(imgData, 0, 0);

  // 8. Actualizo la interfaz de usuario
  updateMatrixDisplay(eye, center, up, V, P);

  // 9. Actualizo la vista del mundo
  if (typeof drawWorldView === 'function') {
    drawWorldView(eye, center, up, fov, W/H, zn, zf, ui.az, ui.el, projectionType);
  }
}
