// Opcional - Implementar Catmull-Clark Subdivision en malla de half-edge

// Por ahora, solo para quad. 
function isQuadMesh(halfEdgeMesh) {
    // COMPLETAR
    return true;
}

// ============================================================================
// Catmull-Clark Subdivision
// ============================================================================

// Realiza una iteración de Catmull-Clark en la malla de half-edge dada
function catmullClarkSubdivision(halfEdgeMesh) {
    console.log('\n=== Catmull-Clark Subdivision ===');
    // COMPLETAR
    return newMesh;
}

// Aplica múltiples iteraciones de Catmull-Clark
function applyCatmullClark(halfEdgeMesh, iterations) {
    if (!isQuadMesh(halfEdgeMesh)) {
        console.error('Catmull-Clark subdivision requiere de una malla de quads pura');
        alert('❌ Error: Catmull-Clark subdivision solo funciona en mallas de quads puras.\nTodas las caras deben tener exactamente 4 vértices.');
        return null;
    }

    let currentMesh = halfEdgeMesh;

    for (let i = 0; i < iterations; i++) {
        console.log(`\n--- Iteration ${i + 1}/${iterations} ---`);
        const newMesh = catmullClarkSubdivision(currentMesh);

        if (!newMesh) {
            console.error(`Subdivision failed at iteration ${i + 1}`);
            return null;
        }

        currentMesh = newMesh;
    }

    return currentMesh;
}

// ============================================================================
// Variables globales
// ============================================================================

let originalMesh = null; 
let subdividedMesh = null; 


const subdivisionSettings = {
    iterations: 1
};

// ============================================================================
// GUI
// ============================================================================

function storeOriginalMesh(mesh) {
    originalMesh = mesh;
    subdividedMesh = null;
}

function applySubdivisionFromGUI() {
    if (!originalMesh) {
        console.error('Cargar una malla.');
        return;
    }

    const meshToSubdivide = subdividedMesh || originalMesh;

    if (!isQuadMesh(meshToSubdivide)) {
        console.error('❌ Error: Catmull-Clark subdivision solo funciona en mallas de quads puras.\nTodas las caras deben tener exactamente 4 vértices.');
        return;
    }

    console.log('Aplicando subdivisión con ' + subdivisionSettings.iterations + ' iteración(es)...');

    const result = applyCatmullClark(meshToSubdivide, subdivisionSettings.iterations);

    if (result) {
        subdividedMesh = result;

        halfEdgeMesh = subdividedMesh;

        const positions = subdividedMesh.vertices.map(v => [v.position.x, v.position.y, v.position.z]);
        const faces = subdividedMesh.faces.map(f => f.getVertices().map(v => v.id));

        renderMesh(positions, faces);
        updateMeshInfo();
        updateVerticesVisibility();
        updateHalfEdgesVisibility();
        updateFacesVisibility();

        console.log(`[1] Subdivision exitosa! ${subdivisionSettings.iterations} iteración(es) aplicada(s).`);
    } else {
        console.error('[0]  Subdivision fallida.');
    }
}


function resetToOriginal() {
    if (!originalMesh) {
        console.error('No original mesh stored.');
        return;
    }

    console.log('Resetting to original mesh...');

    halfEdgeMesh = originalMesh;
    subdividedMesh = null;

    const positions = originalMesh.vertices.map(v => [v.position.x, v.position.y, v.position.z]);
    const faces = originalMesh.faces.map(f => f.getVertices().map(v => v.id));

    renderMesh(positions, faces);
    updateMeshInfo();
    updateVerticesVisibility();
    updateHalfEdgesVisibility();
    updateFacesVisibility();

    console.log('✓ Reset to original mesh');
}

window.isQuadMesh = isQuadMesh;
window.catmullClarkSubdivision = catmullClarkSubdivision;
window.applyCatmullClark = applyCatmullClark;
window.storeOriginalMesh = storeOriginalMesh;
window.applySubdivisionFromGUI = applySubdivisionFromGUI;
window.resetToOriginal = resetToOriginal;
window.subdivisionSettings = subdivisionSettings;
