console.log("=== INICIO DE TEST SUITE PARA Half-Edge ===\n");

// Step 1: Test de clases (Vertex, HalfEdge, Face)
function testStep1() {
    console.log("Step 1: Testing de clases...");

    try {
        // Test Vertex class exists and can be instantiated
        const v = new Vertex(1, 2, 3, 0);
        if (!v || v.position.x !== 1 || v.position.y !== 2 || v.position.z !== 3) {
            throw new Error("Vertex class no definida correctamente");
        }
        console.log("✓ Vertex class passed");

        // Test HalfEdge class exists and can be instantiated
        const he = new HalfEdge(0);
        if (!he || he.id !== 0) {
            throw new Error("HalfEdge class no definida correctamente");
        }
        console.log("✓ HalfEdge class passed");

        // Test Face class exists and can be instantiated
        const f = new Face(0);
        if (!f || f.id !== 0) {
            throw new Error("Face class no definida correctamente");
        }
        console.log("✓ Face class passed");

        console.log("✅ Step 1: PASSED\n");
        return true;
    } catch (error) {
        console.log("❌ Step 1: FAILED -", error.message, "\n");
        return false;
    }
}

// Step 2: Test de HalfEdgeMesh 
function testStep2() {
    console.log("Step 2: Testing de HalfEdgeMesh...");

    try {
        // Test HalfEdgeMesh class exists and can be instantiated
        const mesh = new HalfEdgeMesh();
        if (!mesh) {
            throw new Error("HalfEdgeMesh class no definida correctamente");
        }

        // Test that mesh has the required properties
        if (!Array.isArray(mesh.vertices)) {
            throw new Error("HalfEdgeMesh debe tener un array de vértices");
        }
        if (!Array.isArray(mesh.halfEdges)) {
            throw new Error("HalfEdgeMesh debe tener un array de halfEdges");
        }
        if (!Array.isArray(mesh.faces)) {
            throw new Error("HalfEdgeMesh debe tener un array de caras");
        }
        if (!(mesh.edges instanceof Map)) {
            throw new Error("HalfEdgeMesh debe tener un Map de edges");
        }

        console.log("✅ Step 2: PASSED\n");
        return true;
    } catch (error) {
        console.log("❌ Step 2: FAILED -", error.message, "\n");
        return false;
    }
}

// Step 3: Test de parsing de OBJ y construcción de mallas
function testStep3() {
    console.log("Step 3: Testing de parsing de OBJ y construcción de mallas...");

    try {
        if (typeof parseOBJ !== 'function') {
            throw new Error("parseOBJ función no definida");
        }

        const mesh = new HalfEdgeMesh();
        if (typeof mesh.buildFromOBJ !== 'function') {
            throw new Error("HalfEdgeMesh.buildFromOBJ no definida");
        }

        // Test con un triángulo simple
        const positions = [
            [0, 0, 0],
            [1, 0, 0],
            [0, 1, 0]
        ];
        const faces = [[0, 1, 2]];

        mesh.buildFromOBJ(positions, faces);

        if (mesh.vertices.length !== 3) {
            throw new Error(`Expected 3 vertices, got ${mesh.vertices.length}`);
        }
        if (mesh.faces.length !== 1) {
            throw new Error(`Expected 1 face, got ${mesh.faces.length}`);
        }
        if (mesh.halfEdges.length !== 3) {
            throw new Error(`Expected 3 half-edges, got ${mesh.halfEdges.length}`);
        }
        console.log("✓ Malla de triángulo simple construida correctamente");

        // Test de que cada vértice tiene un half-edge asignado
        for (let i = 0; i < mesh.vertices.length; i++) {
            if (!mesh.vertices[i].halfEdge) {
                throw new Error(`Vertex ${i} no tiene half-edge asignado`);
            }
        }
        console.log("✓ Todos los vértices tienen half-edges asignados");

        // Test de que los half-edges están correctamente conectados
        const he0 = mesh.halfEdges[0];
        if (!he0.next || !he0.prev) {
            throw new Error("Half-edges no están correctamente conectados (next/prev)");
        }
        console.log("✓ Half-edges correctamente conectados (next/prev)");

        console.log("✅ Step 3: PASSED\n");
        return true;
    } catch (error) {
        console.log("❌ Step 3: FAILED -", error.message, "\n");
        console.error(error);
        return false;
    }
}

// Step 4: Test de funciones de consultas
function testStep4() {
    console.log("Step 4: Testing de funciones de consultas...");

    try {
        // Triángulo simple
        const positions = [
            [0, 0, 0],
            [1, 0, 0],
            [0, 1, 0]
        ];
        const faces = [[0, 1, 2]];

        const mesh = new HalfEdgeMesh();
        mesh.buildFromOBJ(positions, faces);

        console.log(`  Mesh info: ${mesh.vertices.length} vertices, ${mesh.halfEdges.length} half-edges, ${mesh.faces.length} faces`);

        console.log("  Testing de funciones de vértices...");

        const v0 = mesh.vertices[0];

        console.log(`    Debug: Chequeando estructura del vertex 0...`);
        console.log(`    Debug: v0.halfEdge = ${v0.halfEdge ? v0.halfEdge.id : 'null'}`);
        if (v0.halfEdge) {
            console.log(`    Debug: v0.halfEdge.next.vertex.id = ${v0.halfEdge.next.vertex.id}`);
            console.log(`    Debug: v0.halfEdge.prev.vertex.id = ${v0.halfEdge.prev.vertex.id}`);
            console.log(`    Debug: v0.halfEdge.twin = ${v0.halfEdge.twin ? v0.halfEdge.twin.id : 'null'}`);
            console.log(`    Debug: v0.halfEdge.prev.twin = ${v0.halfEdge.prev.twin ? v0.halfEdge.prev.twin.id : 'null'}`);
        }

        // Test getAdjacentVertices
        const adjacent = v0.getAdjacentVertices();
        console.log(`    Debug: v0 tiene ${adjacent.length} vértices adyacentes (espero 2)`);
        console.log(`    Debug: ID de los vértices adyacentes: [${adjacent.map(v => v.id).join(', ')}]`);
        if (!Array.isArray(adjacent) || adjacent.length !== 2) {
            throw new Error(`getAdjacentVertices should return array with 2 vertices for triangle vertex, got ${adjacent.length}`);
        }
        console.log("    ✓ Vertex.getAdjacentVertices()");

        // Test getOutgoingHalfEdges
        const outgoing = v0.getOutgoingHalfEdges();
        if (!Array.isArray(outgoing) || outgoing.length === 0) {
            throw new Error("getOutgoingHalfEdges should return array of half-edges");
        }
        console.log("    ✓ Vertex.getOutgoingHalfEdges()");

        // Test getIncidentFaces
        const incidentFaces = v0.getIncidentFaces();
        if (!Array.isArray(incidentFaces) || incidentFaces.length !== 1) {
            throw new Error("getIncidentFaces should return array with 1 face for single triangle");
        }
        console.log("    ✓ Vertex.getIncidentFaces()");

        // Test getValence
        const valence = v0.getValence();
        if (valence !== 2) {
            throw new Error(`getValence should return 2 for triangle vertex, got ${valence}`);
        }
        console.log("    ✓ Vertex.getValence()");

        // Test isBoundary
        const isBoundary = v0.isBoundary();
        if (typeof isBoundary !== 'boolean') {
            throw new Error("isBoundary debe retornar boolean");
        }
        console.log("    ✓ Vertex.isBoundary()");

        // Test HalfEdge query methods
        console.log("  Testing HalfEdge methods...");

        const he = mesh.halfEdges[0];

        // Test getSourceVertex
        const src = he.getSourceVertex();
        if (!src || !(src instanceof Vertex)) {
            throw new Error("getSourceVertex debe retornar un Vertex");
        }
        console.log("    ✓ HalfEdge.getSourceVertex()");

        // Test getDestinationVertex
        const dst = he.getDestinationVertex();
        if (!dst || !(dst instanceof Vertex)) {
            throw new Error("getDestinationVertex debe retornar un Vertex");
        }
        console.log("    ✓ HalfEdge.getDestinationVertex()");

        // Test getVertices
        const vertices = he.getVertices();
        if (!Array.isArray(vertices) || vertices.length !== 2) {
            throw new Error("getVertices debe retornar un array con 2 vértices");
        }
        console.log("    ✓ HalfEdge.getVertices()");

        // Test isBoundary
        const heIsBoundary = he.isBoundary();
        if (typeof heIsBoundary !== 'boolean') {
            throw new Error("HalfEdge.isBoundary debe retornar boolean");
        }
        console.log("    ✓ HalfEdge.isBoundary()");

        // Test getLength
        const length = he.getLength();
        if (typeof length !== 'number' || length < 0) {
            throw new Error("getLength debe retornar un número positivo");
        }
        console.log("    ✓ HalfEdge.getLength()");

        // Test Face query methods
        console.log("  Testing de consultas de Face...");

        const face = mesh.faces[0];

        // Test getVertices
        const faceVertices = face.getVertices();
        if (!Array.isArray(faceVertices) || faceVertices.length !== 3) {
            throw new Error("Face.getVertices debe retornar un array con 3 vértices para un triángulo");
        }
        console.log("    ✓ Face.getVertices()");

        // Test getHalfEdges
        const faceHalfEdges = face.getHalfEdges();
        if (!Array.isArray(faceHalfEdges) || faceHalfEdges.length !== 3) {
            throw new Error("Face.getHalfEdges debe retornar un array con 3 half-edges para un triángulo");
        }
        console.log("    ✓ Face.getHalfEdges()");

        // Test getAdjacentFaces
        const adjacentFaces = face.getAdjacentFaces();
        if (!Array.isArray(adjacentFaces)) {
            throw new Error("Face.getAdjacentFaces debe retornar un array");
        }
        console.log("    ✓ Face.getAdjacentFaces()");

        // Test getNumSides
        const numSides = face.getNumSides();
        if (numSides !== 3) {
            throw new Error(`Face.getNumSides debe retornar 3 para un triángulo, got ${numSides}`);
        }
        console.log("    ✓ Face.getNumSides()");

        // Test isTriangle
        const isTriangle = face.isTriangle();
        if (isTriangle !== true) {
            throw new Error("Face.isTriangle debe retornar true para un triángulo");
        }
        console.log("    ✓ Face.isTriangle()");

        // Test isQuad
        const isQuad = face.isQuad();
        if (isQuad !== false) {
            throw new Error("Face.isQuad debe retornar false para un triángulo");
        }
        console.log("    ✓ Face.isQuad()");

        // Test hasBoundaryEdge
        const hasBoundary = face.hasBoundaryEdge();
        if (typeof hasBoundary !== 'boolean') {
            throw new Error("Face.hasBoundaryEdge debe retornar boolean");
        }
        console.log("    ✓ Face.hasBoundaryEdge()");

        // Test HalfEdgeMesh query methods
        console.log("  Testing HalfEdgeMesh methods...");

        // Test areVerticesAdjacent
        const areAdjacent = mesh.areVerticesAdjacent(0, 1);
        if (areAdjacent !== true) {
            throw new Error("areVerticesAdjacent debe retornar true para vértices adyacentes");
        }
        console.log("    ✓ HalfEdgeMesh.areVerticesAdjacent()");

        // Test getHalfEdgeBetween
        const heBetween = mesh.getHalfEdgeBetween(0, 1);
        if (!heBetween || !(heBetween instanceof HalfEdge)) {
            throw new Error("getHalfEdgeBetween debe retornar HalfEdge");
        }
        console.log("    ✓ HalfEdgeMesh.getHalfEdgeBetween()");

        // Test getBoundaryVertices
        const boundaryVertices = mesh.getBoundaryVertices();
        if (!Array.isArray(boundaryVertices)) {
            throw new Error("getBoundaryVertices debe retornar un array");
        }
        console.log("    ✓ HalfEdgeMesh.getBoundaryVertices()");

        // Test getBoundaryHalfEdges
        const boundaryEdges = mesh.getBoundaryHalfEdges();
        if (!Array.isArray(boundaryEdges)) {
            throw new Error("getBoundaryHalfEdges debe retornar un array");
        }
        console.log("    ✓ HalfEdgeMesh.getBoundaryHalfEdges()");

        // Test getBoundaryFaces
        const boundaryFaces = mesh.getBoundaryFaces();
        if (!Array.isArray(boundaryFaces)) {
            throw new Error("getBoundaryFaces debe retornar un array");
        }
        console.log("    ✓ HalfEdgeMesh.getBoundaryFaces()");

        // Test getKRingNeighbors
        const kRing = mesh.getKRingNeighbors(0, 1);
        if (!Array.isArray(kRing)) {
            throw new Error("getKRingNeighbors debe retornar un array");
        }
        console.log("    ✓ HalfEdgeMesh.getKRingNeighbors()");

        console.log("✅ Step 4: PASSED\n");
        return true;
    } catch (error) {
        console.log("❌ Step 4: FAILED -", error.message, "\n");
        console.error(error);
        return false;
    }
}

// Step 4b: Test de consultas en el cubo
function testStep4Cube() {
    console.log("Step 4 (Cubo): Testing de funciones de consultas en un cubo...");

    try {
        // Creo un cubo simple
        // 8 vértices del cubo
        const positions = [
            [-0.5, -0.5, -0.5], // 0
            [ 0.5, -0.5, -0.5], // 1
            [ 0.5,  0.5, -0.5], // 2
            [-0.5,  0.5, -0.5], // 3
            [-0.5, -0.5,  0.5], // 4
            [ 0.5, -0.5,  0.5], // 5
            [ 0.5,  0.5,  0.5], // 6
            [-0.5,  0.5,  0.5]  // 7
        ];

        // 6 caras del cubo (cada cara es un quad)
        const faces = [
            [0, 1, 2, 3], // back face
            [4, 7, 6, 5], // front face
            [0, 4, 5, 1], // bottom face
            [2, 6, 7, 3], // top face
            [0, 3, 7, 4], // left face
            [1, 5, 6, 2]  // right face
        ];

        const mesh = new HalfEdgeMesh();
        mesh.buildFromOBJ(positions, faces);

        console.log(`  Cube mesh: ${mesh.vertices.length} vertices, ${mesh.halfEdges.length} half-edges, ${mesh.faces.length} faces`);

        // Test 1: Valencia del vértice del cubo (debería ser 3)
        const v0 = mesh.vertices[0];
        const valence = v0.getValence();
        if (valence !== 3) {
            throw new Error(`La valencia del vértice del cubo debería ser 3, got ${valence}`);
        }
        console.log("  ✓ El vértice del cubo tiene la valencia correcta (3)");

        // Test 2: El vértice del cubo debería tener 3 vértices adyacentes
        const adjacent = v0.getAdjacentVertices();
        if (adjacent.length !== 3) {
            throw new Error(`El vértice del cubo debería tener 3 vértices adyacentes, got ${adjacent.length}`);
        }
        console.log(`  ✓ El vértice del cubo tiene 3 vértices adyacentes: [${adjacent.map(v => v.id).join(', ')}]`);

        // Test 3: El vértice del cubo debería tener 3 caras incidentes
        const incidentFaces = v0.getIncidentFaces();
        if (incidentFaces.length !== 3) {
            throw new Error(`El vértice del cubo debería tener 3 caras incidentes, got ${incidentFaces.length}`);
        }
        console.log("  ✓ El vértice del cubo tiene 3 caras incidentes");

        // Test 4: El vértice del cubo no debería estar en la frontera
        const isBoundary = v0.isBoundary();
        if (isBoundary) {
            throw new Error("El vértice del cubo no debería estar en la frontera (malla cerrada)");
        }
        console.log("  ✓ El vértice del cubo no está en la frontera");

        // Test 5: Todas las caras deberían ser quads
        for (let i = 0; i < mesh.faces.length; i++) {
            const face = mesh.faces[i];
            if (!face.isQuad()) {
                throw new Error(`La cara ${i} debería ser un quad`);
            }
            if (face.getNumSides() !== 4) {
                throw new Error(`La cara ${i} debería tener 4 lados, got ${face.getNumSides()}`);
            }
        }
        console.log("  ✓ Todas las caras son quads");

        // Test 6: Las caras adyacentes deberían compartir exactamente 2 vértices
        const face0 = mesh.faces[0];
        const adjacentFaces = face0.getAdjacentFaces();
        if (adjacentFaces.length !== 4) {
            throw new Error(`La cara quad debería tener 4 caras adyacentes, got ${adjacentFaces.length}`);
        }
        console.log("  ✓ La cara quad tiene 4 caras adyacentes");

        // Test 7: Test areVerticesAdjacent
        if (!mesh.areVerticesAdjacent(0, 1)) {
            throw new Error("Los vértices 0 y 1 deberían ser adyacentes");
        }
        if (mesh.areVerticesAdjacent(0, 6)) {
            throw new Error("Los vértices 0 y 6 no deberían ser adyacentes (esquinas opuestas)");
        }
        console.log("  ✓ areVerticesAdjacent funciona correctamente");

        // Test 8: Test areFacesAdjacent
        if (!mesh.areFacesAdjacent(0, 2)) {
            throw new Error("Las caras 0 y 2 deberían ser adyacentes (frente y abajo)");
        }
        console.log("  ✓ areFacesAdjacent funciona correctamente");

        // Test 9: Test getCommonVertices
        const commonVerts = mesh.getCommonVertices(0, 2);
        if (commonVerts.length !== 2) {
            throw new Error(`Las caras adyacentes deberían compartir 2 vértices, got ${commonVerts.length}`);
        }
        console.log(`  ✓ Vértices comunes entre caras adyacentes: [${commonVerts.map(v => v.id).join(', ')}]`);

        // Test 10: Cube should have no boundary edges
        const boundaryEdges = mesh.getBoundaryHalfEdges();
        if (boundaryEdges.length !== 0) {
            throw new Error(`El cubo cerrado no debería tener bordes de frontera, got ${boundaryEdges.length}`);
        }
        console.log("  ✓ El cubo no tiene bordes de frontera (malla cerrada)");

        // Test 11: Test k-ring neighbors
        const kRing1 = mesh.getKRingNeighbors(0, 1);
        if (kRing1.length !== 3) {
            throw new Error(`El 1-ring del vértice del cubo debería tener 3 vértices, got ${kRing1.length}`);
        }
        console.log(`  ✓ 1-ring neighbors: ${kRing1.length} vertices`);

        const kRing2 = mesh.getKRingNeighbors(0, 2);
        if (kRing2.length !== 3) {
            throw new Error(`El 2-ring del vértice del cubo debería tener 3 vértices, got ${kRing2.length}`);
        }
        console.log(`  ✓ 2-ring neighbors: ${kRing2.length} vertices`);

        // Test 12: Validate mesh structure
        const validation = mesh.validate();
        if (!validation.valid) {
            throw new Error(`La validación de la malla del cubo falló: ${validation.errors.join(', ')}`);
        }
        console.log("  ✓ La estructura de la malla del cubo es válida");

        console.log("✅ Step 4 (Cube): PASSED\n");
        return true;
    } catch (error) {
        console.log("❌ Step 4 (Cube): FAILED -", error.message, "\n");
        console.error(error);
        return false;
    }
}

// Run tests
if (testStep1()) {
    if (testStep2()) {
        if (testStep3()) {
            if (testStep4()) {
                testStep4Cube();
            }
        }
    }
}

console.log("=== FIN DE TEST SUITE PARA Half-Edge ===");