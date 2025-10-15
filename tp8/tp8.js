// ============================================================================
// Variables globales
// ============================================================================

const state = {
    scene: null,
    camera: null,
    renderer: null,
    mesh: null,
    halfEdgeMesh: null,
    gui: null,
    visualizations: {
        verticesPoints: null,
        halfEdgesLines: null,
        faceCenters: null,
        vertexLabels: [],
        faceLabels: [],
        halfEdgeLabels: []
    },
    cameraControl: {
        isDragging: false,
        previousMouse: { x: 0, y: 0 },
        rotation: { theta: Math.PI / 4, phi: Math.PI / 4 },
        distance: 5
    }
};

const renderSettings = {
    showWireframe: true,
    wireframeColor: '#000000',
    meshColor: '#4a9eff',
    meshOpacity: 0.5,
    showGrid: true,
    showAxes: true,
    showVertices: false,
    vertexSize: 5.0,
    vertexColor: '#ff0000',
    showVertexLabels: false,
    showHalfEdges: false,
    halfEdgeColor: '#00ff00',
    showHalfEdgeLabels: false,
    showFaces: false,
    showFaceLabels: false
};

// ============================================================================
// Funciones auxiliares para threejs
// ============================================================================

function disposeObject(obj) {
    if (!obj) return;
    if (obj.parent) obj.parent.remove(obj);
    if (obj.geometry) obj.geometry.dispose();
    if (obj.material) {
        if (obj.material.map) obj.material.map.dispose();
        obj.material.dispose();
    }
}

function clearLabels(labelArray) {
    labelArray.forEach(disposeObject);
    labelArray.length = 0;
}

// Cálculo de la normal 
function calculateNormal(v0, v1, v2) {
    const e1 = { x: v1.x - v0.x, y: v1.y - v0.y, z: v1.z - v0.z };
    const e2 = { x: v2.x - v0.x, y: v2.y - v0.y, z: v2.z - v0.z };

    let normal = {
        x: e1.y * e2.z - e1.z * e2.y,
        y: e1.z * e2.x - e1.x * e2.z,
        z: e1.x * e2.y - e1.y * e2.x
    };

    const len = Math.sqrt(normal.x ** 2 + normal.y ** 2 + normal.z ** 2);
    if (len > 0) {
        normal.x /= len;
        normal.y /= len;
        normal.z /= len;
    }
    return normal;
}

// Defino un offset para las etiquetas basado en el tamaño del mesh
function getLabelOffset() {
    if (!state.mesh) return 0.1;
    const box = new THREE.Box3().setFromObject(state.mesh);
    const size = box.getSize(new THREE.Vector3());
    return Math.max(size.x, size.y, size.z) * 0.05;
}

function createTextSprite(text, color = '#ffffff', fontSize = 32) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 128;
    canvas.height = 64;

    ctx.font = `Bold ${fontSize}px Arial`;
    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 64, 32);

    const texture = new THREE.Texture(canvas);
    texture.needsUpdate = true;

    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, transparent: true }));
    sprite.scale.set(0.5 * fontSize / 48, 0.25 * fontSize / 48, 1);
    return sprite;
}

function addToScene(object) {
    (state.mesh || state.scene).add(object);
}

// ============================================================================
// Three.js Setup
// ============================================================================

function initThreeJS() {
    const container = document.getElementById('canvas-container');

    state.scene = new THREE.Scene();
    state.scene.background = new THREE.Color(0x0a0a0a);

    state.camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    state.camera.position.set(3, 3, 3);
    state.camera.lookAt(0, 0, 0);

    state.renderer = new THREE.WebGLRenderer({ antialias: true });
    state.renderer.setSize(container.clientWidth, container.clientHeight);
    state.renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(state.renderer.domElement);

    window.addEventListener('resize', () => {
        state.camera.aspect = container.clientWidth / container.clientHeight;
        state.camera.updateProjectionMatrix();
        state.renderer.setSize(container.clientWidth, container.clientHeight);
    });

    setupControls();
    updateHelpers();
}

function updateHelpers() {
    state.scene.children.filter(c => c.type === 'GridHelper' || c.type === 'AxesHelper')
        .forEach(h => state.scene.remove(h));

    if (renderSettings.showGrid) {
        state.scene.add(new THREE.GridHelper(10, 10, 0x444444, 0x222222));
    }
    if (renderSettings.showAxes) {
        state.scene.add(new THREE.AxesHelper(2));
    }
}

function setupControls() {
    const canvas = state.renderer.domElement;

    canvas.addEventListener('mousedown', (e) => {
        state.cameraControl.isDragging = true;
        state.cameraControl.previousMouse = { x: e.clientX, y: e.clientY };
    });

    canvas.addEventListener('mousemove', (e) => {
        if (!state.cameraControl.isDragging) return;

        const deltaX = e.clientX - state.cameraControl.previousMouse.x;
        const deltaY = e.clientY - state.cameraControl.previousMouse.y;

        state.cameraControl.rotation.theta -= deltaX * 0.01;
        state.cameraControl.rotation.phi = Math.max(0.1, Math.min(Math.PI - 0.1,
            state.cameraControl.rotation.phi - deltaY * 0.01));

        updateCameraPosition();
        state.cameraControl.previousMouse = { x: e.clientX, y: e.clientY };
    });

    canvas.addEventListener('mouseup', () => state.cameraControl.isDragging = false);

    canvas.addEventListener('wheel', (e) => {
        e.preventDefault();
        state.cameraControl.distance = Math.max(1, Math.min(20,
            state.cameraControl.distance + e.deltaY * 0.01));
        updateCameraPosition();
    });
}

function updateCameraPosition() {
    const { theta, phi } = state.cameraControl.rotation;
    const dist = state.cameraControl.distance;

    state.camera.position.set(
        dist * Math.sin(phi) * Math.cos(theta),
        dist * Math.cos(phi),
        dist * Math.sin(phi) * Math.sin(theta)
    );
    state.camera.lookAt(0, 0, 0);
}

function resetCamera() {
    state.cameraControl.rotation = { theta: Math.PI / 4, phi: Math.PI / 4 };
    state.cameraControl.distance = 5;
    updateCameraPosition();
}

function animate() {
    requestAnimationFrame(animate);
    state.renderer.render(state.scene, state.camera);
}

// ============================================================================
// Funcion para cargar y rasterizar mallas
// ============================================================================

// Devuelve un objeto con arrays de posiciones y caras. Un promise en 
// javascript es un objeto que representa la eventual finalización (o falla) 
// de una operación asíncrona y su valor resultante.
async function loadOBJ(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = function(e) {
            const text = e.target.result;
            const result = parseOBJ(text);
            resolve(result);
        };

        reader.onerror = function(e) {
            reject(new Error('Failed to read file'));
        };

        reader.readAsText(file);
    });
}

async function loadMeshFromFile() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.obj';

    input.onchange = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        try {
            const objData = await loadOBJ(file);

            state.halfEdgeMesh = new HalfEdgeMesh();
            state.halfEdgeMesh.buildFromOBJ(objData.positions, objData.faces);

            storeOriginalMesh(state.halfEdgeMesh);

            updateMeshInfo();
            renderMesh(objData.positions, objData.faces);
            updateAllVisualizations();

            console.log('File loaded and half-edge structure built successfully');
        } catch (error) {
            console.error('Error loading file:', error);
            alert('Error loading file: ' + error.message);
        }
    };

    input.click();
}

function updateMeshInfo() {
    if (!state.halfEdgeMesh) return;

    const stats = state.halfEdgeMesh.getStats();
    document.getElementById('vertexCount').textContent = stats.vertices;
    document.getElementById('edgeCount').textContent = Math.floor(stats.edges);
    document.getElementById('faceCount').textContent = stats.faces;
    document.getElementById('halfEdgeCount').textContent = stats.halfEdges;
}

function renderMesh(positions, faces) {
    disposeObject(state.mesh);

    const geometry = new THREE.BufferGeometry();

    const vertices = positions.flatMap(p => p);

    const indices = faces.flatMap(face => {
        const tris = [];
        for (let i = 1; i < face.length - 1; i++) {
            tris.push(face[0], face[i], face[i + 1]);
        }
        return tris;
    });

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();

    const material = new THREE.MeshBasicMaterial({
        color: renderSettings.meshColor,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: renderSettings.meshOpacity
    });

    state.mesh = new THREE.Mesh(geometry, material);
    state.scene.add(state.mesh);

    if (renderSettings.showWireframe) {
        const wireframe = new THREE.LineSegments(
            new THREE.EdgesGeometry(geometry),
            new THREE.LineBasicMaterial({ color: renderSettings.wireframeColor })
        );
        state.mesh.add(wireframe);
    }

    centerAndScaleMesh(state.mesh);
}

function centerAndScaleMesh(mesh) {
    const box = new THREE.Box3().setFromObject(mesh);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());

    mesh.position.sub(center);
    mesh.scale.setScalar(2 / Math.max(size.x, size.y, size.z));
}

function updateMeshMaterial() {
    if (!state.mesh) return;

    state.mesh.material.color.setStyle(renderSettings.meshColor);
    state.mesh.material.opacity = renderSettings.meshOpacity;

    state.mesh.children.forEach(child => {
        if (child.type === 'LineSegments') {
            child.material.color.setStyle(renderSettings.wireframeColor);
            child.visible = renderSettings.showWireframe;
        }
    });
}

// ============================================================================
// Updeteamos visualizaciones
// ============================================================================

function updateAllVisualizations() {
    updateVerticesVisibility();
    updateHalfEdgesVisibility();
    updateFacesVisibility();
}

function updateVerticesVisibility() {
    if (!state.halfEdgeMesh) return;

    disposeObject(state.visualizations.verticesPoints);
    clearLabels(state.visualizations.vertexLabels);
    state.visualizations.verticesPoints = null;

    if (!renderSettings.showVertices) return;

    const positions = state.halfEdgeMesh.vertices.flatMap(v => [v.position.x, v.position.y, v.position.z]);
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));

    state.visualizations.verticesPoints = new THREE.Points(geometry, new THREE.PointsMaterial({
        color: renderSettings.vertexColor,
        size: renderSettings.vertexSize,
        sizeAttenuation: false
    }));

    addToScene(state.visualizations.verticesPoints);
    updateVertexLabels();
}

function updateVertexLabels() {
    clearLabels(state.visualizations.vertexLabels);
    if (!state.halfEdgeMesh || !renderSettings.showVertices || !renderSettings.showVertexLabels) return;

    const offset = getLabelOffset();

    for (const vertex of state.halfEdgeMesh.vertices) {
        const label = createTextSprite(`v${vertex.id + 1}`, '#ffff00');
        const normal = getVertexNormal(vertex);

        label.position.set(
            vertex.position.x + normal.x * offset,
            vertex.position.y + normal.y * offset,
            vertex.position.z + normal.z * offset
        );

        addToScene(label);
        state.visualizations.vertexLabels.push(label);
    }
}

function getVertexNormal(vertex) {
    const faces = vertex.getIncidentFaces();
    let normal = { x: 0, y: 0, z: 0 };

    if (faces.length > 0) {
        for (const face of faces) {
            const verts = face.getVertices();
            if (verts.length >= 3) {
                const n = calculateNormal(verts[0].position, verts[1].position, verts[2].position);
                normal.x += n.x;
                normal.y += n.y;
                normal.z += n.z;
            }
        }

        const len = Math.sqrt(normal.x ** 2 + normal.y ** 2 + normal.z ** 2);
        if (len > 0) {
            normal.x /= len;
            normal.y /= len;
            normal.z /= len;
        }
    } else {
        normal.y = 1;
    }

    return normal;
}

function updateVertexStyle() {
    if (!state.visualizations.verticesPoints) return;
    state.visualizations.verticesPoints.material.color.setStyle(renderSettings.vertexColor);
    state.visualizations.verticesPoints.material.size = renderSettings.vertexSize;
}

function updateHalfEdgesVisibility() {
    if (!state.halfEdgeMesh) return;

    disposeObject(state.visualizations.halfEdgesLines);
    clearLabels(state.visualizations.halfEdgeLabels);
    state.visualizations.halfEdgesLines = null;

    if (!renderSettings.showHalfEdges) return;

    const positions = [];
    const box = state.mesh ? new THREE.Box3().setFromObject(state.mesh) : null;
    const meshSize = box ? box.getSize(new THREE.Vector3()) : new THREE.Vector3(1, 1, 1);
    const arrowHeadSize = (meshSize.x + meshSize.y + meshSize.z) / 3 * 0.03;
    const insetScale = 0.9;

    for (const he of state.halfEdgeMesh.halfEdges) {
        if (!he.face) continue;

        const src = he.getSourceVertex();
        const dst = he.getDestinationVertex();
        if (!src || !dst) continue;

        const faceVerts = he.face.getVertices();
        if (faceVerts.length < 3) continue;

        const faceCenter = {
            x: faceVerts.reduce((sum, v) => sum + v.position.x, 0) / faceVerts.length,
            y: faceVerts.reduce((sum, v) => sum + v.position.y, 0) / faceVerts.length,
            z: faceVerts.reduce((sum, v) => sum + v.position.z, 0) / faceVerts.length
        };

        const start = lerpPosition(src.position, faceCenter, 1 - insetScale);
        const end = lerpPosition(dst.position, faceCenter, 1 - insetScale);

        addArrow(positions, start, end, arrowHeadSize, faceVerts);
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));

    state.visualizations.halfEdgesLines = new THREE.LineSegments(geometry,
        new THREE.LineBasicMaterial({ color: renderSettings.halfEdgeColor, linewidth: 2 }));

    addToScene(state.visualizations.halfEdgesLines);
    updateHalfEdgeLabels();
}

function lerpPosition(pos, center, t) {
    return {
        x: pos.x + (center.x - pos.x) * t,
        y: pos.y + (center.y - pos.y) * t,
        z: pos.z + (center.z - pos.z) * t
    };
}

function addArrow(positions, start, end, arrowHeadSize, faceVerts) {
    const dir = {
        x: end.x - start.x,
        y: end.y - start.y,
        z: end.z - start.z
    };
    const len = Math.sqrt(dir.x ** 2 + dir.y ** 2 + dir.z ** 2);
    if (len === 0) return;

    dir.x /= len;
    dir.y /= len;
    dir.z /= len;

    const midPoint = {
        x: start.x + dir.x * len * 0.95,
        y: start.y + dir.y * len * 0.95,
        z: start.z + dir.z * len * 0.95
    };

    positions.push(start.x, start.y, start.z, midPoint.x, midPoint.y, midPoint.z);

    const normal = calculateNormal(faceVerts[0].position, faceVerts[1].position, faceVerts[2].position);
    const arrowBack = arrowHeadSize * 0.4;
    const arrowWidth = arrowHeadSize * 0.3;

    const p1 = {
        x: midPoint.x - dir.x * arrowBack + normal.x * arrowWidth,
        y: midPoint.y - dir.y * arrowBack + normal.y * arrowWidth,
        z: midPoint.z - dir.z * arrowBack + normal.z * arrowWidth
    };

    const p2 = {
        x: midPoint.x - dir.x * arrowBack - normal.x * arrowWidth,
        y: midPoint.y - dir.y * arrowBack - normal.y * arrowWidth,
        z: midPoint.z - dir.z * arrowBack - normal.z * arrowWidth
    };

    positions.push(midPoint.x, midPoint.y, midPoint.z, p1.x, p1.y, p1.z);
    positions.push(midPoint.x, midPoint.y, midPoint.z, p2.x, p2.y, p2.z);
}

function updateHalfEdgeLabels() {
    clearLabels(state.visualizations.halfEdgeLabels);
    if (!state.halfEdgeMesh || !renderSettings.showHalfEdges || !renderSettings.showHalfEdgeLabels) return;

    const offset = getLabelOffset();

    for (const he of state.halfEdgeMesh.halfEdges) {
        if (!he.face) continue;

        const src = he.getSourceVertex();
        const dst = he.getDestinationVertex();
        if (!src || !dst) continue;

        const faceVerts = he.face.getVertices();
        if (faceVerts.length < 3) continue;

        const faceCenter = {
            x: faceVerts.reduce((sum, v) => sum + v.position.x, 0) / faceVerts.length,
            y: faceVerts.reduce((sum, v) => sum + v.position.y, 0) / faceVerts.length,
            z: faceVerts.reduce((sum, v) => sum + v.position.z, 0) / faceVerts.length
        };

        const start = lerpPosition(src.position, faceCenter, 0.3);
        const end = lerpPosition(dst.position, faceCenter, 0.3);

        const labelPos = {
            x: start.x + (end.x - start.x) * 0.4,
            y: start.y + (end.y - start.y) * 0.4,
            z: start.z + (end.z - start.z) * 0.4
        };

        const normal = calculateNormal(faceVerts[0].position, faceVerts[1].position, faceVerts[2].position);

        const label = createTextSprite(`h${he.id + 1}`, '#00ff00', 24);
        label.position.set(
            labelPos.x + normal.x * offset * 0.3,
            labelPos.y + normal.y * offset * 0.3,
            labelPos.z + normal.z * offset * 0.3
        );

        addToScene(label);
        state.visualizations.halfEdgeLabels.push(label);
    }
}

function updateHalfEdgeStyle() {
    if (!state.visualizations.halfEdgesLines) return;
    state.visualizations.halfEdgesLines.material.color.setStyle(renderSettings.halfEdgeColor);
}

function updateFacesVisibility() {
    if (!state.halfEdgeMesh) return;

    disposeObject(state.visualizations.faceCenters);
    clearLabels(state.visualizations.faceLabels);
    state.visualizations.faceCenters = null;

    if (!renderSettings.showFaces) return;

    const positions = [];

    for (const face of state.halfEdgeMesh.faces) {
        const vertices = face.getVertices();
        if (vertices.length === 0) continue;

        const cx = vertices.reduce((sum, v) => sum + v.position.x, 0) / vertices.length;
        const cy = vertices.reduce((sum, v) => sum + v.position.y, 0) / vertices.length;
        const cz = vertices.reduce((sum, v) => sum + v.position.z, 0) / vertices.length;

        positions.push(cx, cy, cz);
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));

    state.visualizations.faceCenters = new THREE.Points(geometry, new THREE.PointsMaterial({
        color: '#0000ff',
        size: 3.0,
        sizeAttenuation: false
    }));

    addToScene(state.visualizations.faceCenters);
    updateFaceLabels();
}

function updateFaceLabels() {
    clearLabels(state.visualizations.faceLabels);
    if (!state.halfEdgeMesh || !renderSettings.showFaces || !renderSettings.showFaceLabels) return;

    const offset = getLabelOffset();

    for (const face of state.halfEdgeMesh.faces) {
        const vertices = face.getVertices();
        if (vertices.length < 3) continue;

        const cx = vertices.reduce((sum, v) => sum + v.position.x, 0) / vertices.length;
        const cy = vertices.reduce((sum, v) => sum + v.position.y, 0) / vertices.length;
        const cz = vertices.reduce((sum, v) => sum + v.position.z, 0) / vertices.length;

        const normal = calculateNormal(vertices[0].position, vertices[1].position, vertices[2].position);

        const label = createTextSprite(`f${face.id + 1}`, '#00ffff');
        label.position.set(
            cx + normal.x * offset,
            cy + normal.y * offset,
            cz + normal.z * offset
        );

        addToScene(label);
        state.visualizations.faceLabels.push(label);
    }
}

// ============================================================================
// Validaci[on]
// ============================================================================

function handleValidate() {
    if (!state.halfEdgeMesh) {
        alert('Debe cargar una malla primero.');
        return;
    }

    const result = state.halfEdgeMesh.validate();

    if (!result.valid) {
        console.error('Validation errors:', result.errors);
        alert(`❌ Error de validación.`);
    } else if (result.warnings.length > 0) {
        console.warn('Validation warnings:', result.warnings);
        alert(`✓ Validación Passed con ${result.warnings.length} advertencias (hay edges de borde).`);
    } else {
        alert('✓ Validación Passed! La estructura half-edge es válida.');
    }
}

// ============================================================================
// GUI Setup
// ============================================================================

function initGUI() {
    state.gui = new dat.GUI({ width: 320 });

    state.gui.add({ loadOBJ: loadMeshFromFile }, 'loadOBJ').name('📁 Load OBJ File');
    state.gui.add({ validate: handleValidate }, 'validate').name('✓ Validate Structure');

    const meshFolder = state.gui.addFolder('Mesh');
    meshFolder.addColor(renderSettings, 'meshColor').name('Mesh Color').onChange(updateMeshMaterial);
    meshFolder.add(renderSettings, 'meshOpacity', 0, 1).name('Mesh Opacity').onChange(updateMeshMaterial);
    meshFolder.add(renderSettings, 'showWireframe').name('Show Wireframe').onChange(updateMeshMaterial);
    meshFolder.addColor(renderSettings, 'wireframeColor').name('Wireframe Color').onChange(updateMeshMaterial);
    meshFolder.open();

    const verticesFolder = state.gui.addFolder('Vertices');
    verticesFolder.add(renderSettings, 'showVertices').name('Show Vertices').onChange(updateVerticesVisibility);
    verticesFolder.add(renderSettings, 'showVertexLabels').name('Show Vertex IDs').onChange(updateVertexLabels);
    verticesFolder.addColor(renderSettings, 'vertexColor').name('Vertex Color').onChange(updateVertexStyle);
    verticesFolder.add(renderSettings, 'vertexSize', 1, 20).name('Vertex Size').onChange(updateVertexStyle);

    const halfEdgesFolder = state.gui.addFolder('Half-Edges');
    halfEdgesFolder.add(renderSettings, 'showHalfEdges').name('Show Half-Edges').onChange(updateHalfEdgesVisibility);
    halfEdgesFolder.add(renderSettings, 'showHalfEdgeLabels').name('Show Half-Edge IDs').onChange(updateHalfEdgeLabels);
    halfEdgesFolder.addColor(renderSettings, 'halfEdgeColor').name('Half-Edge Color').onChange(updateHalfEdgeStyle);

    const facesFolder = state.gui.addFolder('Faces');
    facesFolder.add(renderSettings, 'showFaces').name('Show Face Centers').onChange(updateFacesVisibility);
    facesFolder.add(renderSettings, 'showFaceLabels').name('Show Face IDs').onChange(updateFaceLabels);

    const displayFolder = state.gui.addFolder('Display');
    displayFolder.add(renderSettings, 'showGrid').name('Show Grid').onChange(updateHelpers);
    displayFolder.add(renderSettings, 'showAxes').name('Show Axes').onChange(updateHelpers);
    displayFolder.open();

    // Catmull-Clark Subdivision [(~)_(~)]
    const subdivisionFolder = state.gui.addFolder('Catmull-Clark Subdivision');
    subdivisionFolder.add(subdivisionSettings, 'iterations', 1, 5, 1).name('Iterations');
    subdivisionFolder.add({ apply: applySubdivisionFromGUI }, 'apply').name('🔄 Apply Subdivision');
    subdivisionFolder.add({ reset: resetToOriginal }, 'reset').name('↩️ Reset to Original');

    // control de cam
    const cameraFolder = state.gui.addFolder('Camera');
    cameraFolder.add({ reset: resetCamera }, 'reset').name('Reset Camera');
}

// ============================================================================
// Initialization   
// ============================================================================

document.addEventListener('DOMContentLoaded', function() {
    initThreeJS();
    initGUI();
    animate();
});

Object.defineProperty(window, 'halfEdgeMesh', {
    get: () => state.halfEdgeMesh,
    set: (value) => { state.halfEdgeMesh = value; }
});

window.renderMesh = renderMesh;
window.updateMeshInfo = updateMeshInfo;
window.updateVerticesVisibility = updateVerticesVisibility;
window.updateHalfEdgesVisibility = updateHalfEdgesVisibility;
window.updateFacesVisibility = updateFacesVisibility;
window.updateAllVisualizations = updateAllVisualizations;
