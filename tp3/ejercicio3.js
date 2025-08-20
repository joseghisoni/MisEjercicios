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
La transformación proyectiva que lleva del view frustrum a NDC 
(Normalized Device Coordinates).
Los parámetros son: 
- fovYdeg: field of view en grados (vertical)
- aspect: ratio de width/height
- znear, zfar: planos de near y far
Ayuda: ver apunte del campus.
*/
function perspective(fovYdeg, aspect, znear, zfar){

}


/* TODO: Implementar la conversión de NDC a espacio de pantalla
Convierte coordenadas de NDC [-1,1]^3 a coordenadas de 
pantalla [0,width-1] x [0,height-1] (en coordenadas homogeneas)
Ejemplo: ndcToScreen([-1,1,0], 800, 600) => [0, 0, 0]
*/
function ndcToScreen(ndc, width, height){

}


// -------------------- II. I. Rendering de triángulos ---------------------- // 

/* TODO: Implementar la función edge(a, b, c).
Esta función calcula el valor de la función de borde (edge function)
para el punto c respecto al segmento orientado ab.
Determina si un píxel está dentro de un triángulo (todas las edge≥0 o todas≤0), 
calcular pesos baricéntricos o área. 

Parámetros:
  a, b, c : puntos en 2D [x, y] (coordenadas de pantalla).

Devuelve:
  Número real positivo/negativo/cero que indica la posición relativa de c.
*/
function edge(a,b,c){ 

}

/*TODO: Implementar la función triOutsideZ(c0, c1, c2).
Esta función decide si un triángulo puede descartarse por completo al estar
fuera del volumen de visión en el eje Z (clipping por near/far).

Convenciones:
- Los vértices están en espacio CLIP: v = [x, y, z, w].
- El frustum válido cumple: -w ≤ z ≤ w.
  (es decir, después de dividir por w, z_ndc ∈ [-1, 1]).

Se pide implementar la lógica de descarte trivial :
- nearOut(v): z >  w  → el vértice está delante del plano near.
- farOut(v) : z < -w  → el vértice está detrás del plano far.
- Si los 3 vértices del triángulo están fuera por el mismo lado del frustum,
  el triángulo entero queda descartado (retorna true).
- Caso contrario (algún vértice adentro o cruzando), retorna false y se
  deja que el pipeline de clipping lo procese.

Parámetros:
  c0, c1, c2 : vértices del triángulo en coordenadas CLIP.
*/
function triOutsideZ(c0,c1,c2){

}
// TODO: rasterizer, toma un triángulo en coordenadas de pantalla
// y pinta los vértices correspondientes con el color de rgb
function drawTriangle(img, depth, v0, v1, v2, rgb){
  const h=img.h, w=img.w;
  const xs=[v0[0],v1[0],v2[0]], ys=[v0[1],v1[1],v2[1]];
  // Busco bounding box
  let minX=Math.max(0, Math.floor(Math.min(...xs))), maxX=Math.min(w-1, Math.ceil(Math.max(...xs)));
  let minY=Math.max(0, Math.floor(Math.min(...ys))), maxY=Math.min(h-1, Math.ceil(Math.max(...ys)));
  // Calculo el área del triángulo, si es cero no lo dibujo porque no ocupa espacio en pantalla
  const area = edge(v0,v1,v2); if(area===0) return;

  for(let y=minY;y<=maxY;y++){
    for(let x=minX;x<=maxX;x++){
      const p=[x+0.5,y+0.5]; // Píxel en coordenadas de pantalla
    
    }
  }
}
// TODO: Completar la función de renderizado de triángulos
function renderTriangles(width, height, clip) {
  const imgData = ctx.createImageData(width, height);
  const depth = new Float32Array(width * height);
  depth.fill(Number.POSITIVE_INFINITY);
  const img = {data: imgData.data, w: width, h: height};
  
  for(let i = 0; i < CUBE_FACES.length; i++) {
    // Elijo un triángulo
    const [i0, i1, i2] = CUBE_FACES[i];
    // Convierto a coordenadas CLIP y descarto triángulos
   

    // Convierto CLIP -> NDC -> screen
   
    
    // Backface culling
   
  }
  
  return { imgData, depth };
}

// TODO: Completar la función de renderizado principal
function render() {
  const W = cv.width, H = cv.height;
  
  // 1. Setear cámara y construir la matriz de Vista
  const ui = readUI();


  // 2. Configurar proyección
  
  // 3. Crear matriz de modelo-vista-proyección

  // 4. Convierto a coordenadas homogeneas
  
  // 5. Renderizo triángulos

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