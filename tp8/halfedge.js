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
        // COMPLETAR
    }

    /**
     * Devuelve un array con los vértices adyacentes
     */
    getAdjacentVertices() {
        // COMPLETAR
        return adjacent;
    }

    /**
     * Devuelve un array con las half-edges que salen de este vértice
     */
    getOutgoingHalfEdges() {
        // COMPLETAR
        return edges;
    }

    /**
     * Devuelve un array con las caras incidentes a este vértice
     */
    getIncidentFaces() {
       // COMPLETAR
        return faces;
    }

    /**
     * Devuelve la valencia del vértice (número de edges/caras conectadas)
     */
    getValence() {
        // COMPLETAR
    }

    /*
    * Devuelve true si el vértice está en la frontera (tiene al menos una half-edge sin twin)
    */
    isBoundary() {
       // COMPLETAR
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
       // COMPLETAR
    }

    /**
     *  Devuelve el vértice de origen de esta half-edge.
     */
    getSourceVertex() {
        // COMPLETAR
    }

    // Devuelve el vértice de destino de esta half-edge.
    getDestinationVertex() {
        // COMPLETAR
    }

    // Devuelve ambos vértices de esta half-edge como un array [origen, destino]
    getVertices() {
        // COMPLETAR
    }

    // Comprueba si esta half-edge es una frontera (no tiene twin)
    isBoundary() {
        // COMPLETAR
    }

    // Devuelve la longitud de esta half-edge. La longitud
    // la calculamos como la distancia entre los vértices de origen y destino.
    // Recordar que dado x, y en R3 la distancia d(x,y)= sqrt((x1-y1)^2 + (x2-y2)^2 + (x3-y3)^2)
    getLength() {
        // COMPLETAR
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
      // COMPLETAR
    }

    // Devuelve todos los vértices de esta cara en orden
    getVertices() {
        // COMPLETAR

        return vertices;
    }

    // Devuelve todas las half-edges de esta cara en orden
    getHalfEdges() {
        // COMPLETAR
        return edges;
    }

    // Devuelve todas las caras adyacentes (comparten una arista) a esta cara
    getAdjacentFaces() {
        // COMPLETAR
        return adjacent;
    }

    // Devuelve el número de vértices/edges en esta cara
    getNumSides() {
        // COMPLETAR
    }

    // Comprueba si esta cara es un triángulo
    isTriangle() {
        // COMPLETAR
    }

    // Comprueba si esta cara es un cuadrilátero
    isQuad() {
        // COMPLETAR
    }

    // Comprueba si esta cara tiene una arista de frontera
    hasBoundaryEdge() {
        // COMPLETAR
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
        // COMPLETAR
    }

    // Construye la estructura half-edge a partir de datos OBJ
    // positions: Array de posiciones [x, y, z]
    // faceIndices: Array de índices de vértices para cada cara
    buildFromOBJ(positions, faceIndices) {
        // COMPLETAR
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
        // COMPLETAR
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

        // COMPLETAR
        return {
            valid: isValid,
            errors,
            warnings
        };
    }

    // Devuelve la cantidad de vértices, half-edges, caras y edges (aproximado)
    // Para edges, contamos half-edges / 2 (las half-edges de frontera se cuentan una sola vez)
    getStats() {
        // COMPLETAR
    }

    // ========================================================================
    // Consultas de conectividad
    // Estos métodos permiten consultar la conectividad topológica de la malla
    // y navegar a través de sus elementos (vértices, half-edges, caras).
    // ========================================================================

    // Chequea si dos vértices son adyacentes (comparten una arista)
    areVerticesAdjacent(vertexId1, vertexId2) {
       // COMPLETAR
    }

    // Devuelve la half-edge entre dos vértices (si existe)
    getHalfEdgeBetween(vertexId1, vertexId2) {
        // COMPLETAR
    }

    // Chequea si dos caras son adyacentes (comparten una arista)
    areFacesAdjacent(faceId1, faceId2) {
       // COMPLETAR
    }

    // Encuentra los vértices comunes entre dos caras
    getCommonVertices(faceId1, faceId2) {
        // COMPLETAR
    }

    // Devuelve todos los vértices de frontera
    getBoundaryVertices() {
        // COMPLETAR
    }

    // Devuelve todas las half-edges de frontera
    getBoundaryHalfEdges() {
        // COMPLETAR
    }

    // Devuelve todas las caras de frontera
    getBoundaryFaces() {
        // COMPLETAR
    }


    // Encuentra los vecinos en k-ring de un vértice (vértices a distancia k)
    // k=1 da los vecinos directos, k=2 da los vecinos de los vecinos, etc.
    getKRingNeighbors(vertexId, k) {
        // COMPLETAR
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

    // COMPLETAR
    return {
        positions,
        faces
    };
}
