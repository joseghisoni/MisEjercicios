// Implementación de la estructura de datos Half-Edge
//
// La estructura de datos half-edge representa una malla dividiendo cada edge en dos half-edges,
// uno para cada cara/face adyacente. Esto permite un navegación y consultas de topología eficientes. 
// La half-edge asume que las mallas son manifold. Para que una malla sea manifold, deben cumplirse dos condiciones. 
// Primero, las caras adyacentes alrededor de un vértice deben poder ordenarse de modo que sus vértices (además del
// vértice común) formen una cadena simple. Segundo, cada arista debe ser compartida por no más de dos caras.

// Asumiremos un orden de giro CCW para las caras. Por ejemplo,
//     (2)
//     / \
//   (0)—(1)
// CCW order 0 -> 1 -> 2

// Paso 1. Definir las clases básicas: Vertex, HalfEdge, Face
// Paso 2. Definir la clase HalfEdgeMesh que maneja la estructura de datos half-edge
// Paso 3. Implementar un parser simple para archivos OBJ
// Paso 4. Implementar los funciones de consultas (getAdjacentVertices, etc.)
// Paso 5. (Opcional) Implementar Catmull-Clark Subdivision usando half-edges. 

// ============================================================================
// Clases de la estructura de datos
// ============================================================================

// clase Vertex 
//  Implementar el constructor y los siguientes métodos:
//  - getAdjacentVertices(): Devuelve un array con los vértices adyacentes (1-ring neighbors).
//  - getOutgoingHalfEdges(): Devuelve un array con las half-edges que salen de este vértice.
//  - getIncidentFaces(): Devuelve un array con las caras incidentes a este vértice.
//  - getValence(): Devuelve la valencia del vértice (número de edges/caras conectadas).
//  - isBoundary(): Devuelve true si el vértice está en la frontera (tiene al menos una half-edge sin twin).
class Vertex {
    // El constructor debe guardar:
    //  - id: Identificador único del vértice
    //  - position: Posición 3D del vértice (objeto {x, y, z})
    //  - halfEdge: Una half-edge que sale de este vértice (objeto HalfEdge)
    constructor(x, y, z, id) {
        this.id = id;
        this.position = { x, y, z };
        this.halfEdge = null; // Se asigna cuando se construye la malla
    }

    /**
     * Devuelve un array con los vértices adyacentes
     */
    getAdjacentVertices() {
        let vertices = [];
        for(let i of this.getOutgoingHalfEdges()) {
            vertices.push(i.getDestinationVertex());
        }
        return vertices;
    }

    /**
     * Devuelve un array con las half-edges que salen de este vértice
     */
    getOutgoingHalfEdges() {
        let halfEdges = [];
        let start = this.halfEdge;
        if (!start) return halfEdges;
        let current = start;
        while (true) {
            halfEdges.push(current);
            if (current.twin === null) break; // Si es frontera, no hay más half-edges
            current = current.twin.next;
            if (current === start) break; // Volvimos al inicio
        }
        return halfEdges;
    }

    /**
     * Devuelve un array con las caras incidentes a este vértice
     */
    getIncidentFaces() {
        let faces = [];
        for(let i in this.getOutgoingHalfEdges()) {
            faces.push(i.face);
        }
        return faces;
    }

    /**
     * Devuelve la valencia del vértice (número de edges/caras conectadas)
     */
    getValence() {
        return this.getIncidentFaces().length;
    }

    /*
    * Devuelve true si el vértice está en la frontera (tiene al menos una half-edge sin twin)
    */
    isBoundary() {
        for(let i in this.getOutgoingHalfEdges()) {
            if (i.isBoundary()) return true;
        }
        return false;
    }
    toString() {
        return `Vertex ${this.id} [${this.position.x.toFixed(2)}, ${this.position.y.toFixed(2)}, ${this.position.z.toFixed(2)}]`;
    }
}

// Clase half-edge
// Implementar el constructor y los siguientes métodos:
//  - getSourceVertex(): Devuelve el vértice de origen de esta half-edge.
//  - getDestinationVertex(): Devuelve el vértice de destino de esta half-edge.
//  - getVertices(): Devuelve un array con ambos vértices de esta half-edge [origen, destino].
//  - isBoundary(): Devuelve true si esta half-edge es una frontera (no tiene twin).
//  - getLength(): Devuelve la longitud de esta half-edge.
class HalfEdge {
    // el constructor debe guardar:
    //  - id: Identificador único de la half-edge
    //  - vertex: Vértice en el INICIO de esta half-edge (objeto Vertex)
    //  - face: Cara a la que pertenece esta half-edge (objeto Face)
    //  - next: Siguiente half-edge en la cara (objeto HalfEdge)
    //  - prev: Half-edge previa en la cara (objeto HalfEdge)
    //  - twin: Half-edge opuesta (objeto HalfEdge)
    constructor(id) {
        this.id = id;
        this.vertex = null; // Se asigna cuando se construye la malla
        this.face = null;
        this.next = null;
        this.prev = null;
        this.twin = null; // Se asigna cuando se construye la malla
    }

    /**
     *  Devuelve el vértice de origen de esta half-edge.
     */
    getSourceVertex() {
        return this.vertex;
    }

    // Devuelve el vértice de destino de esta half-edge.
    getDestinationVertex() {
        return this.next.vertex;
    }

    // Devuelve ambos vértices de esta half-edge como un array [origen, destino]
    getVertices() {
        return [this.getSourceVertex(), this.getDestinationVertex()];
    }

    // Comprueba si esta half-edge es una frontera (no tiene twin)
    isBoundary() {
        return (this.twin === null);
    }

    // Devuelve la longitud de esta half-edge. La longitud
    // la calculamos como la distancia entre los vértices de origen y destino.
    // Recordar que dado x, y en R3 la distancia d(x,y)= sqrt((x1-y1)^2 + (x2-y2)^2 + (x3-y3)^2)
    getLength() {
        const v1 = this.getSourceVertex().position;
        const v2 = this.getDestinationVertex().position;
        const dx = v1.x - v2.x;
        const dy = v1.y - v2.y;
        const dz = v1.z - v2.z;
        return Math.sqrt(dx * dx + dy * dy + dz * dz);
    }

    toString() {
        const vertexId = this.vertex ? this.vertex.id : 'null';
        const faceId = this.face ? this.face.id : 'null';
        const twinId = this.twin ? this.twin.id : 'null';
        return `HalfEdge ${this.id} (vertex: ${vertexId}, face: ${faceId}, twin: ${twinId})`;
    }
}

// Clase face - representa una cara (polígono) en la malla
// Implementar el constructor y los siguientes métodos:
//  - getVertices(): Devuelve un array con los vértices de esta cara en orden.
//  - getHalfEdges(): Devuelve un array con las half-edges de esta cara en orden.
//  - getAdjacentFaces(): Devuelve un array con las caras adyacentes (comparten una arista).
//  - getNumSides(): Devuelve el número de lados (vértices/edges) de esta cara.
//  - isTriangle(): Devuelve true si esta cara es un triángulo.
//  - isQuad(): Devuelve true si esta cara es un cuadrilátero.
//  - hasBoundaryEdge(): Devuelve true si esta cara tiene al menos una half-edge sin twin.
class Face {
    // El constructor debe guardar:
    //  - id: Identificador único de la cara
    //  - halfEdge: Una half-edge que pertenece a esta cara (objeto HalfEdge)
    constructor(id) {
        this.id = id;
        this.halfEdge = null; // Se asigna cuando se construye la malla
    }

    // Devuelve todos los vértices de esta cara en orden
    getVertices() {
        let vertices = [];
        let start = this.halfEdge;
        let current = start;
        while (true) {
            vertices.push(current.getSourceVertex());
            current = current.next;
            if (current === start) break;
        }
        return vertices;
    }

    // Devuelve todas las half-edges de esta cara en orden
    getHalfEdges() {
        let edges = [];
        let start = this.halfEdge;
        let current = start;   
        while (true) {
            edges.push(current);
            current = current.next;
            if (current === start) break;
        }
        return edges;
    }

    // Devuelve todas las caras adyacentes (comparten una arista) a esta cara
    getAdjacentFaces() {
        let adjacent = [];
        for(let i in this.getHalfEdges()) {
            if (i.twin !== null && !adjacent.includes(i.twin.face) && i.twin.face !== null) {
                adjacent.push(i.twin.face);
            }
        }
        return adjacent;
    }

    // Devuelve el número de vértices/edges en esta cara
    getNumSides() {
        return this.getVertices().length;
    }

    // Comprueba si esta cara es un triángulo
    isTriangle() {
        return this.getNumSides() === 3;
    }

    // Comprueba si esta cara es un cuadrilátero
    isQuad() {
        return this.getNumSides() === 4;
    }

    // Comprueba si esta cara tiene una arista de frontera
    hasBoundaryEdge() {
        for(let i in this.getHalfEdges()) {
            if (i.isBoundary()) return true;
        }
        return false;
    }

    toString() {
        const vertices = this.getVertices();
        const vertexIds = vertices.map(v => v.id).join(', ');
        return `Face ${this.id} [${vertexIds}]`;
    }
}

// ============================================================================
// Clase HalfEdgeMesh - Clase principal que maneja la estructura de datos half-edge
// ============================================================================

// Implementar el constructor y los siguientes métodos:
//  - buildFromOBJ(positions, faceIndices): Construye la estructura half-edge a partir de datos OBJ.
//    positions: Array de posiciones [x, y, z].
//    faceIndices: Array de arrays de índices de vértices para cada cara.
//  - validate(): Valida la estructura half-edge, devuelve un objeto con los resultados de la validación.
//  - getStats(): Devuelve estadísticas sobre la malla (número de vértices, half-edges, caras, edges).
//  - Métodos de consulta de conectividad (ver más abajo).
class HalfEdgeMesh {
    // La clase halfedge Mesh debe mantener una lista de: vértices, half-edges y caras; y un diccionario/mapa
    // para rastrear los pares de edges (para encontrar twins).
    constructor() {
        this.vertices = []; // Array de objetos Vertex
        this.halfEdges = []; // Array de objetos HalfEdge
        this.faces = [];    // Array de objetos Face   
        this.edges = new Map(); // Mapa para encontrar half-edge twins
    }

    // Construye la estructura half-edge a partir de datos OBJ
    // positions: Array de posiciones [x, y, z]
    // faceIndices: Array de índices de vértices para cada cara
    buildFromOBJ(positions, faceIndices) {
        for (let i = 0; i < positions.length; i++) {
            const [x, y, z] = positions[i];
            const vertex = new Vertex(x, y, z, i);
            this.vertices.push(vertex);
        } 
        let halfEdgeId = 0;
        for (let i = 0; i < faceIndices.length; i++) {
            const indices = faceIndices[i];
            const face = new Face(i);
            this.faces.push(face);
            const numVertices = indices.length;
            const faceHalfEdges = [];
            for (let j = 0; j < numVertices; j++) {
                const he = new HalfEdge(halfEdgeId++);
                this.halfEdges.push(he);
                faceHalfEdges.push(he);
                he.face = face;
                const vertexIndex = indices[j];
                he.vertex = this.vertices[vertexIndex];
                if (!he.vertex.halfEdge) {
                    he.vertex.halfEdge = he;
                }
                const nextIndex = indices[(j + 1) % numVertices];
                const edgeKey = this.getEdgeKey(vertexIndex, nextIndex);
                this.edges.set(edgeKey, he);
            }
            for (let j = 0; j < numVertices; j++) {
                const he = faceHalfEdges[j];
                he.next = faceHalfEdges[(j + 1) % numVertices];
                he.prev = faceHalfEdges[(j - 1 + numVertices) % numVertices];
            }
            face.halfEdge = faceHalfEdges[0];
        }
    }
    // ------ Sugerienca: completar estas funciones auxiliares para usarse en buildFromOBJ ------
    // Crea una key única para un edge dado sus dos vértices
    // Esta funcion puede ser útil para definir el mapa de edges
    getEdgeKey(v1, v2) {
        return `${v1}-${v2}`;
    }

    // Enlaza las half-edges gemelas (twin) basándose en el mapa de edges
    // Esta función se llama para construir las referencias twin después de crear todas las half-edges
    linkTwins() {
        for (let halfEdge of this.halfEdges) {
            const vStart = halfEdge.getSourceVertex().id;
            const vEnd = halfEdge.getDestinationVertex().id;
            const twinKey = this.getEdgeKey(vEnd, vStart);
            if (this.edges.has(twinKey)) {
                const twinHalfEdge = this.edges.get(twinKey);
                halfEdge.twin = twinHalfEdge;
                twinHalfEdge.twin = halfEdge;
            }
        }
    }
    // ---------------------------------------------------------------


    
    // Valida la estructura half-edge
    // Todos los vértices deben tener al menos una half-edge saliente
    // Todas las half-edges deben tener referencias válidas a vértices, caras, next, prev
    // next.prev debe ser this y prev.next debe ser this
    // twin.twin debe ser this (si twin existe)
    // Las half-edges en una cara deben formar un ciclo cerrado
    // Devuelve un objeto con los resultados de la validación: {valid: bool, errors: Array, warnings: Array}
    // 0 si no hay errores, 1 si los hay. 
    validate() {
        const errors = [];
        const warnings = [];
        const isValid = errors.length === 0;

            // Verificar que todos los vértices tengan al menos una half-edge saliente
            for (let vertex of this.vertices) {
                if (!vertex.halfEdge) {
                    errors.push(`Vertex ${vertex.id} has no outgoing half-edge.`);
                }
            }
            // Verificar que todas las half-edges tengan referencias válidas
            for (let halfEdge of this.halfEdges) {
                if (!halfEdge.vertex) {
                    errors.push(`HalfEdge ${halfEdge.id} has no source vertex.`);
                }
                if (!halfEdge.face) {
                    errors.push(`HalfEdge ${halfEdge.id} has no face.`);
                }
                if (!halfEdge.next) {
                    errors.push(`HalfEdge ${halfEdge.id} has no next half-edge.`);
                }
                if (!halfEdge.prev) {
                    errors.push(`HalfEdge ${halfEdge.id} has no previous half-edge.`);
                }
                if (halfEdge.next && halfEdge.next.prev !== halfEdge) {
                    errors.push(`HalfEdge ${halfEdge.id} next.prev does not point back to itself.`);
                }
                if (halfEdge.prev && halfEdge.prev.next !== halfEdge) {
                    errors.push(`HalfEdge ${halfEdge.id} prev.next does not point back to itself.`);
                }
                if (halfEdge.twin && halfEdge.twin.twin !== halfEdge) {
                    errors.push(`HalfEdge ${halfEdge.id} twin.twin does not point back to itself.`);
                }
                // Verificar que las half-edges en una cara formen un ciclo cerrado
                if (halfEdge.face) {
                    let start = halfEdge;
                    let current = start.next;
                    let count = 1;
                    while (current !== start) {
                        if (!current) {
                            errors.push(`Face ${halfEdge.face.id} has a half-edge that does not form a closed loop.`);
                            break;
                        }
                        current = current.next;
                        count++;
                        if (count > this.halfEdges.length) {
                            errors.push(`Face ${halfEdge.face.id} has a half-edge loop that is too long (possible infinite loop).`);
                            break;
                        }
                    }
                }
            }
        return {
            valid: isValid,
            errors,
            warnings
        };
    }

    // Devuelve la cantidad de vértices, half-edges, caras y edges (aproximado)
    // Para edges, contamos half-edges / 2 (las half-edges de frontera se cuentan una sola vez)
    getStats() {
        const numVertices = this.vertices.length;
        const numHalfEdges = this.halfEdges.length;
        const numFaces = this.faces.length;
        let numEdges = 0;
        const edgeSet = new Set();
        for (let halfEdge of this.halfEdges) {
            const vStart = halfEdge.getSourceVertex().id;
            const vEnd = halfEdge.getDestinationVertex().id;
            const edgeKey = this.getEdgeKey(Math.min(vStart, vEnd), Math.max(vStart, vEnd));
            edgeSet.add(edgeKey);
        }
        numEdges = edgeSet.size;
        return {
            vertices: numVertices,
            halfEdges: numHalfEdges,
            faces: numFaces,
            edges: numEdges
        };
    }

    // ========================================================================
    // Consultas de conectividad
    // Estos métodos permiten consultar la conectividad topológica de la malla
    // y navegar a través de sus elementos (vértices, half-edges, caras).
    // ========================================================================

    // Chequea si dos vértices son adyacentes (comparten una arista)
    areVerticesAdjacent(vertexId1, vertexId2) {
        const vertex1 = this.vertices[vertexId1];
        for (let halfEdge of vertex1.getOutgoingHalfEdges()) {
            if (halfEdge.getDestinationVertex().id === vertexId2) {
                return true;
            }
        }
        return false;
    }

    // Devuelve la half-edge entre dos vértices (si existe)
    getHalfEdgeBetween(vertexId1, vertexId2) {
        const vertex1 = this.vertices[vertexId1];
        for (let halfEdge of vertex1.getOutgoingHalfEdges()) {
            if (halfEdge.getDestinationVertex().id === vertexId2) {
                return halfEdge;
            }
        }
        return null;
    }

    // Chequea si dos caras son adyacentes (comparten una arista)
    areFacesAdjacent(faceId1, faceId2) {
        const face1 = this.faces[faceId1];
        for (let halfEdge of face1.getHalfEdges()) {
            if (halfEdge.twin && halfEdge.twin.face.id === faceId2) {
                return true;
            }
        }
        return false;
    }

    // Encuentra los vértices comunes entre dos caras
    getCommonVertices(faceId1, faceId2) {
        const face1 = this.faces[faceId1];
        const face2 = this.faces[faceId2];
        const vertices1 = new Set(face1.getVertices().map(v => v.id));
        const common = [];
        for (let v of face2.getVertices()) {
            if (vertices1.has(v.id)) {
                common.push(v);
            }
        }
        return common;
    }

    // Devuelve todos los vértices de frontera
    getBoundaryVertices() {
        boundaryVertices = [];
        for (let vertex of this.vertices) {
            if (vertex.isBoundary()) {
                boundaryVertices.push(vertex);
            }
        }
        return boundaryVertices;
    }

    // Devuelve todas las half-edges de frontera
    getBoundaryHalfEdges() {
        boundaryHalfEdges = [];
        for (let halfEdge of this.halfEdges) {
            if (halfEdge.isBoundary()) {
                boundaryHalfEdges.push(halfEdge);
            }
        }
        return boundaryHalfEdges;
    }

    // Devuelve todas las caras de frontera
    getBoundaryFaces() {
        boundaryFaces = [];
        for (let face of this.faces) {
            if (face.hasBoundaryEdge()) {
                boundaryFaces.push(face);
            }
        }
        return boundaryFaces;
    }


    // Encuentra los vecinos en k-ring de un vértice (vértices a distancia k)
    // k=1 da los vecinos directos, k=2 da los vecinos de los vecinos, etc.
    getKRingNeighbors(vertexId, k) {
        let currentRing = new Set([this.vertices[vertexId]]);
        let allNeighbors = new Set(currentRing);
        for (let i = 0; i < k; i++) {
            let nextRing = new Set();
            for (let vertex of currentRing) {
                for (let neighbor of vertex.getAdjacentVertices()) {
                    if (!allNeighbors.has(neighbor)) {
                        nextRing.add(neighbor);
                    }
                }
            }
            for (let v of nextRing) {
                allNeighbors.add(v);
            }
            currentRing = nextRing;
        }
        allNeighbors.delete(this.vertices[vertexId]);
        return Array.from(allNeighbors);
    }
}

// ============================================================================
// Lectura de archivos OBJ
// ============================================================================

// Implementar una función para parsear archivos OBJ simples
// Hint: ver qué hace String.split, trim, startsWith, parseFloat, parseInt
// 
function parseOBJ(text) {
    const positions = [];
    const faces = [];

    const lines = text.split('\n');
    for (let line of lines) {
        line = line.trim();
        if (line.startsWith('#') || line === '') {
            continue; // Saltar comentarios y líneas vacías
        }
        const parts = line.split(/\s+/);
        if (parts[0] === 'v') {
            // Línea de vértice
            const x = parseFloat(parts[1]);
            const y = parseFloat(parts[2]);
            const z = parseFloat(parts[3]);
            positions.push([x, y, z]);
        } else if (parts[0] === 'f') {
            // Línea de cara
            const faceIndices = parts.slice(1).map(part => {
                const idx = part.split('/')[0]; // Ignorar texturas y normales
                return parseInt(idx, 10) - 1; // OBJ usa índices base 1
            });
            faces.push(faceIndices);
        }
    }
    return {
        positions,
        faces
    };
}
