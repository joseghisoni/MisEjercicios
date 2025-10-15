/* Clase Point
Implementar la clase Point con los métodos necesarios para
realizar operaciones vectoriales básicas como suma, multiplicación
por un escalar, división por un escalar, comparación y verificación
de igualdad.
Testear: centroid([ (1,0,0), (0,1,0), (0,0,1) ]) = (1/3,1/3,1/3).
*/
class Point {
  constructor(x = 0.0, y = 0.0, z = 0.0) {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  add(other) {
    this.x += other.x;
    this.y += other.y;
    this.z += other.z;
    console.log(this)
    return this;
  }

  multiply(factor) {
    this.x *= factor;
    this.y *= factor;
    this.z *= factor;
    return this;
  }

  divide(factor) {
    return this.multiply(1.0 / factor);
  }

  equals(other) {
    return this.x === other.x && this.y === other.y && this.z === other.z;
  }
  // definimos un orden lexicográfico para los puntos
  lessThan(other) {
    return (this.x < other.x) ||
           (this.x === other.x && this.y < other.y) ||
           (this.x === other.x && this.y === other.y && this.z < other.z);
  }

}

// Calcula el centroide de un conjunto de puntos. O sea, el promedio de sus coordenadas.
// Devuelve una instancia de Point.
function centroid(points) {
  const n = points.length;
  if (n === 0) {
    return new Point(0, 0, 0); // o lanzar un error
  }
  
  let x_promedio = 0;
  let y_promedio = 0;
  let z_promedio = 0;
  for (const point of points) {
    x_promedio += point.x;
    y_promedio += point.y;
    z_promedio += point.z;
  }
  x_promedio /= n;
  y_promedio /= n;
  z_promedio /= n;

  return new Point(x_promedio, y_promedio, z_promedio);
}

/*  Clase Edge
Implementar la clase Edge que representa una arista entre dos puntos.
Debe incluir métodos para verificar si un punto pertenece a la arista,
comparar dos aristas y verificar si son iguales.
Además, contiene el atributo mid_edge (punto medio de la arista)
*/
class Edge {
  constructor(aBegin, aEnd) {
    if (aEnd.lessThan(aBegin)) {
    // asegurar que begin es el menor, si no, doy vuelta
    // esto me asegura que (A,B) y (B,A) son la misma arista
      [aBegin, aEnd] = [aEnd, aBegin];
    }
    this.hole_edge = false; // si es borde, ie, una superficie con agujero
    this.mid_edge = new Point(
      (aBegin.x + aEnd.x) / 2,
      (aBegin.y + aEnd.y) / 2,
      (aBegin.z + aEnd.z) / 2
    );
    this.begin = aBegin;
    this.end = aEnd;
    
  }

  contains(point) {
    const a = this.begin;
    const b = this.end;
    const p = point;
    const eps = 1e-6;

    // v = b - a, w = p - a
    const vx = b.x - a.x, vy = b.y - a.y, vz = b.z - a.z;
    const wx = p.x - a.x, wy = p.y - a.y, wz = p.z - a.z;

    const v2 = vx*vx + vy*vy + vz*vz;

    // Arista degenerada: trata como punto
    if (v2 < eps*eps) {
      const dx = p.x - a.x, dy = p.y - a.y, dz = p.z - a.z;
      return (dx*dx + dy*dy + dz*dz) <= eps*eps;
    }

    // Colinealidad: |v x w| ~ 0, normalizado por |v|
    const cx = vy*wz - vz*wy;
    const cy = vz*wx - vx*wz;
    const cz = vx*wy - vy*wx;
    const cross2 = cx*cx + cy*cy + cz*cz;
    if (cross2 > (eps*eps) * v2) return false;

    // Paramétrico: 0 <= t <= 1
    const t = (wx*vx + wy*vy + wz*vz) / v2;
    return t >= -eps && t <= 1 + eps;
  }

  equals(other) {
    this.begin == other.begin && this.end == other.end;
  }
  // definimos un orden lexicográfico para las aristas similar a puntos
  lessThan(other) {
    return this.begin.lessThan(other.begin) ||
           (this.begin.equals(other.begin) && this.end.lessThan(other.end));
  }

}

/*  Clase Face
Implementar la clase Face que representa una cara poligonal definida
por una lista de vértices (en orden) y aristas. Recordar que debe formar un polígono cerrado. 
Debe incluir métodos para calcular el facepoint (centroide), verificar si un vértice o arista pertenece a
la cara.
Testear: crea una cara con 4 vértices y verifica que las 4 aristas se crean correctamente.
*/
class Face {
  constructor(aVertices) {
    this.vertices = aVertices; // array de Point
    this.edges = [];
    const n = aVertices.length;
    for (let i = 0; i < n; i++) {
      const v_begin = aVertices[i];
      const v_end = aVertices[(i + 1) % n]; // wrap around
      this.edges.push(new Edge(v_begin, v_end));
    }
    this.face_point = centroid(aVertices); // centroide de los vertices
  }

  contains(vertex) {
    for (let i = 0; i < this.vertices.length; i++) {  
      if (this.vertices[i].equals(vertex)) {
        return true;
      }
    }
    return false;
  }
}
// Implementar la función que calcula los nuevos vértices según Catmull-Clark:
//                      new_vertex = (F + 2*R + (n-3)*P) / n
// F = promedio de puntos de caras, R = promedio de puntos medios de aristas,
// P = posición del vértice original, n = valencia del vértice (número de caras/edges adyacentes)
// Devuelve un Map/look-up table de Point a Point (vértice original a nuevo vértice)
function next_vertices(edges, faces) {
  // Mapea vértice original -> nuevo vértice
  const next_vertices_map = new Map();

  // Recolecto todos los vértices originales (por identidad de objeto)
  const allVertices = new Set();
  for (const f of faces) {
    for (const v of f.vertices) allVertices.add(v);
  }

  // Para cada vértice, lista de face points adyacentes
  const facesAdj = new Map(); // Point -> Point[] (face_points)
  for (const f of faces) {
    for (const v of f.vertices) {
      if (!facesAdj.has(v)) facesAdj.set(v, []);
      facesAdj.get(v).push(f.face_point);
    }
  }

  // Para cada vértice, lista de puntos medios de aristas adyacentes
  const edgeMidsAdj = new Map(); // Point -> Point[] (mid_edge)
  for (const e of edges) {
    // Cada 'e' debe tener begin, end y mid_edge
    if (!edgeMidsAdj.has(e.begin)) edgeMidsAdj.set(e.begin, []);
    if (!edgeMidsAdj.has(e.end)) edgeMidsAdj.set(e.end, []);
    edgeMidsAdj.get(e.begin).push(e.mid_edge);
    edgeMidsAdj.get(e.end).push(e.mid_edge);
  }

  // Aplico la fórmula: new_vertex = (F + 2*R + (n-3)*P) / n
  for (const v of allVertices) {
    const Flist = facesAdj.get(v) || [];
    const Rlist = edgeMidsAdj.get(v) || [];
    const n = Rlist.length > 0 ? Rlist.length : 1;

    const F = Flist.length ? centroid(Flist) : new Point(v.x, v.y, v.z);
    const R = Rlist.length ? centroid(Rlist) : new Point(v.x, v.y, v.z);

    const nx = (F.x + 2 * R.x + (n - 3) * v.x) / n;
    const ny = (F.y + 2 * R.y + (n - 3) * v.y) / n;
    const nz = (F.z + 2 * R.z + (n - 3) * v.z) / n;
    next_vertices_map.set(v, new Point(nx, ny, nz));
  }

  return next_vertices_map;
}

function findEdgePoint(edge, uniqueEdges) {
  for (const uniqueEdge of uniqueEdges) {
    if (uniqueEdge.equals(edge)) {
      return uniqueEdge.edge_point;
    }
  }
  return edge.edge_point;  // fallback
}

// [TODO]: Implementar la función que realiza una iteración de subdivisión.
// Input: lista de caras (Face[]).
// Output: nueva lista de caras (Face[]) refinada.
// Pasos:
// 1. Calcular los puntos de las caras (face points) - ya están en Face.face_point
// 2. Calcular los puntos de las aristas (edge points)
// 3. Calcular los nuevos vértices (next vertices)
// 4. Crear las nuevas caras usando los puntos calculados
function catmull_clark_surface_subdivision(faces) {
  // Paso 2: Calculo edge points
  // Notamos que un edge puede pertenecer a más de una cara, así que
  // primero necesitamos una lista única de edges para evitar cálculos repetidos.
  const edgeKey = (e) => `${e.begin.x},${e.begin.y},${e.begin.z}|${e.end.x},${e.end.y},${e.end.z}`;
  const uniqueMap = new Map(); // key -> { edge, faces: Face[], instances: Edge[] }

  for (const f of faces) {
    for (const e of f.edges) {
      const key = edgeKey(e);
      if (!uniqueMap.has(key)) uniqueMap.set(key, { edge: e, faces: [], instances: [] });
      const rec = uniqueMap.get(key);
      rec.faces.push(f);
      rec.instances.push(e);
    }
  }

  // Calculo edge_point por cada arista única
  for (const rec of uniqueMap.values()) {
    const e = rec.edge;
    let ep;
    if (rec.faces.length === 2) {
      // Interior: (F1 + F2 + V1 + V2)/4
      const f1 = rec.faces[0].face_point;
      const f2 = rec.faces[1].face_point;
      ep = new Point(
        (f1.x + f2.x + e.begin.x + e.end.x) / 4,
        (f1.y + f2.y + e.begin.y + e.end.y) / 4,
        (f1.z + f2.z + e.begin.z + e.end.z) / 4
      );
    } else {
      // Borde/agujero: punto medio
      e.hole_edge = true;
      ep = new Point(
        (e.begin.x + e.end.x) / 2,
        (e.begin.y + e.end.y) / 2,
        (e.begin.z + e.end.z) / 2
      );
    }
    e.edge_point = ep;
    for (const inst of rec.instances) inst.edge_point = ep;
  }

  // Paso 3: Calculo next vertices que mapea vertices viejos a nuevos
  const uniqueEdges = Array.from(uniqueMap.values()).map(r => r.edge);
  const nextVerts = next_vertices(uniqueEdges, faces);
  
  // Paso 4: Crear nuevas caras. Divide y refina.
  // Para encontrar los edgePoints correspondientes, usar findEdgePoint.
  // Ejemplo: si la cara es (A,B,C,D), las nuevas caras son:
  // (A, edgePoint(AB), facePoint, edgePoint(DA))
  // (B, edgePoint(BC), facePoint, edgePoint(AB))
  // (C, edgePoint(CD), facePoint, edgePoint(BC))
  // (D, edgePoint(DA), facePoint, edgePoint(CD))
  const next_faces = [];

  for (const f of faces) {
    const n = f.vertices.length;
    const F = f.face_point;
    for (let i = 0; i < n; i++) {
      const v = f.vertices[i];
      const eNext = f.edges[i];
      const ePrev = f.edges[(i - 1 + n) % n];
      const EPnext = findEdgePoint(eNext, uniqueEdges);
      const EPprev = findEdgePoint(ePrev, uniqueEdges);
      const Vnew = nextVerts.get(v) || v;
      next_faces.push(new Face([ Vnew, EPnext, F, EPprev ]));
    }
  }

  return next_faces;
}



function createInitialCubeFaces() {
  // Creamos los 8 vértices del cubo usando objetos Point
  const v0 = new Point( 1,  1,  1);
  const v1 = new Point(-1,  1,  1);
  const v2 = new Point(-1, -1,  1);
  const v3 = new Point( 1, -1,  1);
  const v4 = new Point( 1, -1, -1);
  const v5 = new Point( 1,  1, -1);
  const v6 = new Point(-1,  1, -1);
  const v7 = new Point(-1, -1, -1);

  // Creamos las 6 caras del cubo (cuadriláteros/quads)
  return [
    new Face([v0, v1, v2, v3]), // front
    new Face([v0, v3, v4, v5]), // right
    new Face([v0, v5, v6, v1]), // top
    new Face([v1, v6, v7, v2]), // left
    new Face([v2, v7, v4, v3]), // bottom
    new Face([v5, v4, v7, v6])  // back
  ];
} // Usamos esto para luego subdividir

function facesToMeshData(faces) {
  const positions = [];
  const colors = [];

  for (let i = 0; i < faces.length; i++) {
    const face = faces[i];

    // Generamos un color basado en el índice de la cara
    const hue = (i * 137.5) % 360; 
    const color = hslToRgb(hue / 360, 0.7, 0.6);

    // Quads a triángulos
    if (face.vertices.length === 4) {
      const [v0, v1, v2, v3] = face.vertices;

      // Triangulo 1: v0, v1, v2
      positions.push(v0.x, v0.y, v0.z);
      positions.push(v1.x, v1.y, v1.z);
      positions.push(v2.x, v2.y, v2.z);

      colors.push(...color, ...color, ...color);

      // Triangulo 2: v0, v2, v3
      positions.push(v0.x, v0.y, v0.z);
      positions.push(v2.x, v2.y, v2.z);
      positions.push(v3.x, v3.y, v3.z);

      colors.push(...color, ...color, ...color);
    }
  }

  return {
    positions: new Float32Array(positions),
    colors: new Float32Array(colors),
    vertexCount: positions.length / 3
  };
}
