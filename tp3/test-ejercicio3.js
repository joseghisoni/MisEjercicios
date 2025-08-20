/*
test-ejercicio3.js — Test unitario para funciones core del TP3
*/

// Utils
function assertArraysEqual(actual, expected, tolerance = 1e-6, message = '') {
  if (actual.length !== expected.length) {
    throw new Error(`${message}: Array lengths differ. Expected ${expected.length}, got ${actual.length}`);
  }
  for (let i = 0; i < actual.length; i++) {
    if (Math.abs(actual[i] - expected[i]) > tolerance) {
      throw new Error(`${message}: Arrays differ at index ${i}. Expected ${expected[i]}, got ${actual[i]}`);
    }
  }
}

function assertEqual(actual, expected, tolerance = 1e-6, message = '') {
  if (Math.abs(actual - expected) > tolerance) {
    throw new Error(`${message}: Expected ${expected}, got ${actual}`);
  }
}

// ======================= Test: operaciones vectoriales =======================

function testVecAdd() {
  console.log('Testing Vec.add...');
  
  // Suma
  assertArraysEqual(Vec.add([1, 2, 3], [4, 5, 6]), [5, 7, 9], 1e-6, 'Vec.add basic test');

  // Suma con vector cero
  assertArraysEqual(Vec.add([1, 2, 3], [0, 0, 0]), [1, 2, 3], 1e-6, 'Vec.add with zero vector');

  // Números negativos
  assertArraysEqual(Vec.add([1, -2, 3], [-1, 2, -3]), [0, 0, 0], 1e-6, 'Vec.add with negative numbers');
  
  console.log('✓ Vec.add tests passed');
}

function testVecSub() {
  console.log('Testing Vec.sub...');
  
  // Resta simple
  assertArraysEqual(Vec.sub([5, 7, 9], [1, 2, 3]), [4, 5, 6], 1e-6, 'Vec.sub basic test');

  // Resta de sí mismo (debería ser cero)
  assertArraysEqual(Vec.sub([1, 2, 3], [1, 2, 3]), [0, 0, 0], 1e-6, 'Vec.sub same vectors');
  
  // Resta de vector cero
  assertArraysEqual(Vec.sub([1, 2, 3], [0, 0, 0]), [1, 2, 3], 1e-6, 'Vec.sub with zero vector');
  
  console.log('✓ Vec.sub tests passed');
}

function testVecDot() {
  console.log('Testing Vec.dot...');
  
  // Producto punto
  assertEqual(Vec.dot([1, 2, 3], [4, 5, 6]), 32, 1e-6, 'Vec.dot basic test');

  // Vectores ortogonales (el producto punto debería ser 0)
  assertEqual(Vec.dot([1, 0, 0], [0, 1, 0]), 0, 1e-6, 'Vec.dot orthogonal vectors');

  // Vectores idénticos (el producto punto debería ser igual a la longitud al cuadrado)
  assertEqual(Vec.dot([3, 4, 0], [3, 4, 0]), 25, 1e-6, 'Vec.dot same vector');
  
  console.log('✓ Vec.dot tests passed');
}

function testVecCross() {
  console.log('Testing Vec.cross...');

  // Producto cruz básico con regla de la mano derecha
  assertArraysEqual(Vec.cross([1, 0, 0], [0, 1, 0]), [0, 0, 1], 1e-6, 'Vec.cross basic test');
  
  // Consigo mismo
  assertArraysEqual(Vec.cross([1, 2, 3], [1, 2, 3]), [0, 0, 0], 1e-6, 'Vec.cross same vectors');
  
  // Propiedad anti-comutativa: a × b = -(b × a)
  const a = [1, 2, 3];
  const b = [4, 5, 6];
  const axb = Vec.cross(a, b);
  const bxa = Vec.cross(b, a);
  assertArraysEqual(axb, [-bxa[0], -bxa[1], -bxa[2]], 1e-6, 'Vec.cross anti-commutative');
  
  console.log('✓ Vec.cross tests passed');
}

function testVecNorm() {
  console.log('Testing Vec.norm...');
  
  // Vectores unitarios
  assertEqual(Vec.norm([1, 0, 0]), 1, 1e-6, 'Vec.norm unit vector');
  assertEqual(Vec.norm([0, 1, 0]), 1, 1e-6, 'Vec.norm unit vector Y');
  assertEqual(Vec.norm([0, 0, 1]), 1, 1e-6, 'Vec.norm unit vector Z');

  assertEqual(Vec.norm([3, 4, 0]), 5, 1e-6, 'Vec.norm 3-4-5 triangle');

  // Vector cero
  assertEqual(Vec.norm([0, 0, 0]), 0, 1e-6, 'Vec.norm vector cero');

  console.log('✓ Vec.norm tests passed');
}

function testVecNormalize() {
  console.log('Testing Vec.normalize...');

  // Normalizar un vector
  const normalized = Vec.normalize([3, 4, 0]);
  assertEqual(Vec.norm(normalized), 1, 1e-6, 'Vec.normalize produces unit vector');
  assertArraysEqual(normalized, [0.6, 0.8, 0], 1e-6, 'Vec.normalize correct values');

  // Vector unitario
  assertArraysEqual(Vec.normalize([1, 0, 0]), [1, 0, 0], 1e-6, 'Vec.normalize unit vector');

  // Vector cero
  assertArraysEqual(Vec.normalize([0, 0, 0]), [0, 0, 0], 1e-6, 'Vec.normalize zero vector');
  
  console.log('✓ Vec.normalize tests passed');
}

function testVecScale() {
  console.log('Testing Vec.scale...');

  // Escalado básico
  assertArraysEqual(Vec.scale([1, 2, 3], 2), [2, 4, 6], 1e-6, 'Vec.scale basic test');

  // Escalar por cero
  assertArraysEqual(Vec.scale([1, 2, 3], 0), [0, 0, 0], 1e-6, 'Vec.scale by zero');

  // Escalar por número negativo
  assertArraysEqual(Vec.scale([1, -2, 3], -1), [-1, 2, -3], 1e-6, 'Vec.scale by negative');
  
  console.log('✓ Vec.scale tests passed');
}

// ======================= Test: Operaciones de Matrices =======================

function testMat4Mul() {
  console.log('Testing mat4Mul...');

  // Test 1: Multiplicación por la matriz identidad
  const identity = [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1];
  const testMatrix = [2,0,0,0, 0,3,0,0, 0,0,4,0, 1,2,3,1];
  
  assertArraysEqual(mat4Mul(identity, testMatrix), testMatrix, 1e-6, 'mat4Mul with identity');
  assertArraysEqual(mat4Mul(testMatrix, identity), testMatrix, 1e-6, 'mat4Mul identity commutative');

  // Test 2: Multiplicación de matrices de escalado
  const scale2 = [2,0,0,0, 0,2,0,0, 0,0,2,0, 0,0,0,1];
  const scale3 = [3,0,0,0, 0,3,0,0, 0,0,3,0, 0,0,0,1];
  const scale6 = [6,0,0,0, 0,6,0,0, 0,0,6,0, 0,0,0,1];
  
  assertArraysEqual(mat4Mul(scale2, scale3), scale6, 1e-6, 'mat4Mul scaling matrices');

  // Test 3: Multiplicación de matrices de traslación
  const translateX = [1,0,0,0, 0,1,0,0, 0,0,1,0, 2,0,0,1];
  const translateY = [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,3,0,1];
  const translateXY = [1,0,0,0, 0,1,0,0, 0,0,1,0, 2,3,0,1];
  
  assertArraysEqual(mat4Mul(translateX, translateY), translateXY, 1e-6, 'mat4Mul translation matrices');

  // Test 4: Multiplicación de matrices específicas
  const A = [1,2,3,0, 4,5,6,0, 7,8,9,0, 0,0,0,1];
  const B = [1,0,0,0, 0,2,0,0, 0,0,3,0, 1,2,3,1];
  const expectedAB = [1, 2, 3, 0, 8, 10, 12, 0, 21, 24, 27, 0, 30, 36, 42, 1];

  assertArraysEqual(mat4Mul(A, B), expectedAB, 1e-6, 'mat4Mul specific calculation');
  
  // Test 5: No conmutatividad de la multiplicación de matrices
  const resultAB = mat4Mul(A, B);
  const resultBA = mat4Mul(B, A);

  // Deberían ser diferentes (solo comprobamos un elemento para probar la no conmutatividad)
  if (Math.abs(resultAB[1] - resultBA[1]) < 1e-6) {
    throw new Error('Matrix multiplication should not be commutative for general matrices');
  }
  
  console.log('✓ mat4Mul tests passed');
}

function testMat4Vec4() {
  console.log('Testing mat4Vec4...');

  // Identidad
  const identity = [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1];
  const testVec = [1, 2, 3, 1];
  
  assertArraysEqual(mat4Vec4(identity, testVec), testVec, 1e-6, 'mat4Vec4 with identity');

  // Transformación de escalado
  const scale2 = [2,0,0,0, 0,2,0,0, 0,0,2,0, 0,0,0,1];
  assertArraysEqual(mat4Vec4(scale2, [1, 2, 3, 1]), [2, 4, 6, 1], 1e-6, 'mat4Vec4 scaling');

  // Transformación de traslación (formato por columnas)
  const translate = [1,0,0,0, 0,1,0,0, 0,0,1,0, 5,6,7,1];
  assertArraysEqual(mat4Vec4(translate, [1, 2, 3, 1]), [6, 8, 10, 1], 1e-6, 'mat4Vec4 translation');
  
  console.log('✓ mat4Vec4 tests passed');
}

// ======================= Camera Matrix Tests =======================

function testLookAt() {
  console.log('Testing lookAt...');

  // Test 1: Identidad: cámara en el origen mirando hacia el eje Z negativo
  const eye = [0, 0, 0];
  const center = [0, 0, -1];
  const up = [0, 1, 0];
  
  const viewMatrix = lookAt(eye, center, up);

  // Debería ser la identidad para esta configuración (estilo OpenGL)
  const expectedIdentity = [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1];
  assertArraysEqual(viewMatrix, expectedIdentity, 1e-6, 'lookAt identity case');

  // Test 2: Transformación de traslación
  const viewMatrix2 = lookAt([0,0,5], [0,0,0], [0,1,0]);

  // Debería ser una traslación de -5 en Z
  const expectedTranslation = [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,-5,1];
  assertArraysEqual(viewMatrix2, expectedTranslation, 1e-6, 'lookAt translation case');

  // Punto en el origen debería transformarse a (0,0,-5) en el espacio de vista
  const origin = mat4Vec4(viewMatrix2, [0,0,0,1]);
  assertArraysEqual(origin, [0,0,-5,1], 1e-6, 'lookAt point transformation');

  // Test 3: Rotación
  const viewMatrix3 = lookAt([5,0,0], [0,0,0], [0,1,0]);

  // Debería transformar la posición de la cámara a (0,0,0)
  const cameraPos = mat4Vec4(viewMatrix3, [5,0,0,1]);
  assertArraysEqual(cameraPos, [0,0,0,1], 1e-6, 'lookAt rotation case');

  // Punto en el origen debería estar en (0,0,-5) en el espacio de vista
  const originRotated = mat4Vec4(viewMatrix3, [0,0,0,1]);
  assertArraysEqual(originRotated, [0,0,-5,1], 1e-6, 'lookAt rotated origin');

  // Test 4: Validación de la estructura de la matriz (sistema de coordenadas de la mano derecha)
  // Para la cámara en (0,0,5) mirando hacia el origen:
  // - El vector derecho debería ser [1,0,0]
  // - El vector hacia arriba debería ser [0,1,0]
  // - El vector hacia adelante debería ser [0,0,-1] (Z negativo)
  assertEqual(viewMatrix2[0], 1, 1e-6, 'lookAt right vector X');
  assertEqual(viewMatrix2[4], 0, 1e-6, 'lookAt right vector Y');
  assertEqual(viewMatrix2[8], 0, 1e-6, 'lookAt right vector Z');
  assertEqual(viewMatrix2[1], 0, 1e-6, 'lookAt up vector X');
  assertEqual(viewMatrix2[5], 1, 1e-6, 'lookAt up vector Y');
  assertEqual(viewMatrix2[9], 0, 1e-6, 'lookAt up vector Z');
  assertEqual(viewMatrix2[2], 0, 1e-6, 'lookAt forward vector X');
  assertEqual(viewMatrix2[6], 0, 1e-6, 'lookAt forward vector Y');
  assertEqual(viewMatrix2[10], 1, 1e-6, 'lookAt forward vector Z');
  assertEqual(viewMatrix2[15], 1, 1e-6, 'lookAt homogeneous coordinate');

  // Test 5: Ortonormalidad - los vectores base deberían ser de longitud unidad y perpendiculares
  const right = [viewMatrix2[0], viewMatrix2[1], viewMatrix2[2]];
  const upVec = [viewMatrix2[4], viewMatrix2[5], viewMatrix2[6]];
  const forward = [viewMatrix2[8], viewMatrix2[9], viewMatrix2[10]];
  
  assertEqual(Vec.norm(right), 1, 1e-6, 'lookAt right vector normalized');
  assertEqual(Vec.norm(upVec), 1, 1e-6, 'lookAt up vector normalized');
  assertEqual(Vec.norm(forward), 1, 1e-6, 'lookAt forward vector normalized');
  assertEqual(Vec.dot(right, upVec), 0, 1e-6, 'lookAt right⊥up');
  assertEqual(Vec.dot(right, forward), 0, 1e-6, 'lookAt right⊥forward');
  assertEqual(Vec.dot(upVec, forward), 0, 1e-6, 'lookAt up⊥forward');
  
  console.log('✓ lookAt tests passed');
}

// ======================= Test: Perspectiva y Ortográfica =======================

function testPerspective() {
  console.log('Testing perspective...');
  
  // Test 1: Valores estándar
  const fov = 90; // 90 deg 
  const aspect = 1; // viewport cuadrado
  const near = 1;
  const far = 10;
  
  const projMatrix = perspective(fov, aspect, near, far);
  
  // Valores esperados en column major
  // f = 1/tan(45°) = 1
  // [1, 0, 0, 0,
  //  0, 1, 0, 0,
  //  0, 0, -11/9, -1,
  //  0, 0, -20/9, 0]
  
  const expectedMatrix = [
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, -11/9, -1,
    0, 0, -20/9, 0
  ];
  
  assertArraysEqual(projMatrix, expectedMatrix, 1e-6, 'perspective matrix values');

  // Test 2: Diferente aspect ratio
  const projMatrix2 = perspective(60, 16/9, 0.1, 100);
  const f2 = 1/Math.tan((60*Math.PI/180)/2); // ~1.732
  assertEqual(projMatrix2[0], f2/(16/9), 1e-6, 'perspective aspect ratio correction');
  assertEqual(projMatrix2[5], f2, 1e-6, 'perspective focal length Y');

  // Test 3: Funcionalidad - transformaciones de puntos
  const nearPoint = mat4Vec4(projMatrix, [0, 0, -near, 1]);
  assertArraysEqual([nearPoint[0]/nearPoint[3], nearPoint[1]/nearPoint[3], nearPoint[2]/nearPoint[3]], 
                   [0, 0, -1], 1e-6, 'perspective near plane mapping');
  
  const farPoint = mat4Vec4(projMatrix, [0, 0, -far, 1]);
  assertArraysEqual([farPoint[0]/farPoint[3], farPoint[1]/farPoint[3], farPoint[2]/farPoint[3]], 
                   [0, 0, 1], 1e-6, 'perspective far plane mapping');
  
  // Test 4: Frustum
  const cornerPoint = mat4Vec4(projMatrix, [1, 1, -near, 1]);
  assertEqual(cornerPoint[0]/cornerPoint[3], 1, 1e-6, 'perspective frustum corner X');
  assertEqual(cornerPoint[1]/cornerPoint[3], 1, 1e-6, 'perspective frustum corner Y');

  // Test 5: Estructura de la matriz
  assertEqual(projMatrix[3], 0, 1e-6, 'perspective [0,3] should be 0');
  assertEqual(projMatrix[7], 0, 1e-6, 'perspective [1,3] should be 0');
  assertEqual(projMatrix[11], -1, 1e-6, 'perspective [2,3] should be -1');
  assertEqual(projMatrix[15], 0, 1e-6, 'perspective [3,3] should be 0');
  
  console.log('✓ perspective tests passed');
}

function testOrthographic() {
  console.log('Testing orthographic...');

  // Test 1: Proyección ortográfica estándar con valores negativos para near/far
  const left = -2, right = 2, bottom = -2, top = 2;
  const near = -1, far = -10;  // Valores negativos según la nueva convención
  
  const orthoMatrix = orthographic(left, right, bottom, top, near, far);

  // Valores esperados con near=-1, far=-10
  // w = right - left = 4
  // h = top - bottom = 4  
  // d = near - far = -1 - (-10) = 9
  // [2/4,  0,    0,    0,
  //  0,    2/4,  0,    0,
  //  0,    0,   2/9,   0,
  //  0,    0,   11/9,  1]
  
  const expectedMatrix = [
    0.5, 0, 0, 0,
    0, 0.5, 0, 0,
    0, 0, 2/9, 0,
    0, 0, 11/9, 1
  ];
  
  assertArraysEqual(orthoMatrix, expectedMatrix, 1e-10, 'orthographic matrix values');

  // Test 2: Frustum asimétrico con valores negativos
  const orthoMatrix2 = orthographic(-1, 3, -2, 1, -0.1, -50);  // near/far negativos
  const width = 4, height = 3, depth = -0.1 - (-50); // depth = 49.9
  assertEqual(orthoMatrix2[0], 2/width, 1e-6, 'orthographic width scaling');
  assertEqual(orthoMatrix2[5], 2/height, 1e-6, 'orthographic height scaling');
  assertEqual(orthoMatrix2[10], 2/depth, 1e-6, 'orthographic depth scaling'); // positivo ahora
  assertEqual(orthoMatrix2[12], -0.5, 1e-6, 'orthographic X translation'); // -(right+left)/w = -(3+(-1))/4 = -0.5
  assertEqual(orthoMatrix2[13], 1/3, 1e-6, 'orthographic Y translation');

  
  // Test 4: punto central
  const centerZ = (near + far) / 2; // (-1 + -10)/2 = -5.5
  const center = mat4Vec4(orthoMatrix, [0, 0, centerZ, 1]);
  assertArraysEqual([center[0], center[1], center[2]], [0, 0, 0], 1e-6, 'orthographic center mapping');

  // Test 5: Estructura de la matriz
  assertEqual(orthoMatrix[1], 0, 1e-6, 'orthographic [0,1] should be 0');
  assertEqual(orthoMatrix[2], 0, 1e-6, 'orthographic [0,2] should be 0');
  assertEqual(orthoMatrix[4], 0, 1e-6, 'orthographic [1,0] should be 0');
  assertEqual(orthoMatrix[6], 0, 1e-6, 'orthographic [1,2] should be 0');
  assertEqual(orthoMatrix[8], 0, 1e-6, 'orthographic [2,0] should be 0');
  assertEqual(orthoMatrix[9], 0, 1e-6, 'orthographic [2,1] should be 0');
  assertEqual(orthoMatrix[11], 0, 1e-6, 'orthographic [2,3] should be 0');
  assertEqual(orthoMatrix[15], 1, 1e-6, 'orthographic [3,3] should be 1');
  
  console.log('✓ orthographic tests passed');
}

// ======================= Test: NDC a Screen  =======================

function testNdcToScreen() {
  console.log('Testing ndcToScreen...');
  
  const width = 800;
  const height = 600;

  // Centro de NDC (0,0) debería mapearse al centro de la pantalla
  const center = ndcToScreen([0, 0, 0], width, height);
  assertArraysEqual(center, [(width-1)/2, (height-1)/2, 0], 1e-6, 'ndcToScreen center mapping');
  
  // Esquinas de NDC deberían mapearse a las esquinas de la pantalla
  const topLeft = ndcToScreen([-1, 1, 0], width, height);
  assertArraysEqual(topLeft, [0, 0, 0], 1e-6, 'ndcToScreen top-left corner');
  
  const bottomRight = ndcToScreen([1, -1, 0], width, height);
  assertArraysEqual(bottomRight, [width-1, height-1, 0], 1e-6, 'ndcToScreen bottom-right corner');
  
  // La coordenada Z debería pasar sin cambios
  const withDepth = ndcToScreen([0, 0, 0.5], width, height);
  assertEqual(withDepth[2], 0.5, 1e-6, 'ndcToScreen preserves Z');
  
  console.log('✓ ndcToScreen tests passed');
}

// ======================= Tests: funciones de configuración =======================

function testSetupCamera() {
  console.log('Testing setupCamera...');
  
  // Test 1: cámara estándar
  const ui1 = {
    az: 0,        // 0 degrees azimuth
    el: 0,        // 0 degrees elevation
  };
  
  const result1 = setupCamera(ui1);
  
  // con azimut=0, elevación=0: la cámara debería estar en (3, 0, 0)
  // NOTAR usamos radio=3.
  const expectedEye1 = [3, 0, 0];
  const expectedCenter1 = [0, 0, 0];
  const expectedUp1 = [0, 1, 0];
  
  assertArraysEqual(result1.eye, expectedEye1, 1e-6, 'setupCamera azimuth=0, elevation=0');
  assertArraysEqual(result1.center, expectedCenter1, 1e-6, 'setupCamera center at origin');
  assertArraysEqual(result1.up, expectedUp1, 1e-6, 'setupCamera up vector');

  // Test 2: rotación de 90 grados en azimuth
  const ui2 = {
    az: Math.PI/2,  // 90 degrees azimuth
    el: 0,          // 0 degrees elevation
  };
  
  const result2 = setupCamera(ui2);

  // Con azimut=90°, elevación=0: la cámara debería estar en (0, 0, 3)
  const expectedEye2 = [0, 0, 3];
  assertArraysEqual(result2.eye, expectedEye2, 1e-6, 'setupCamera azimuth=90°, elevation=0');

  // Test 3: rotación de 90 grados en elevación
  const ui3 = {
    az: 0,          // 0 degrees azimuth  
    el: Math.PI/2,  // 90 degrees elevation
  };
  
  const result3 = setupCamera(ui3);

  // Con azimut=0, elevación=90°: la cámara debería estar en (0, 3, 0)
  const expectedEye3 = [0, 3, 0];
  assertArraysEqual(result3.eye, expectedEye3, 1e-6, 'setupCamera azimuth=0, elevation=90°');

  // Test 4: Distancia desde el origen
  const distance1 = Vec.norm(result1.eye);
  const distance2 = Vec.norm(result2.eye);
  const distance3 = Vec.norm(result3.eye);
  
  assertEqual(distance1, 3.0, 1e-6, 'setupCamera distance from origin 1');
  assertEqual(distance2, 3.0, 1e-6, 'setupCamera distance from origin 2');
  assertEqual(distance3, 3.0, 1e-6, 'setupCamera distance from origin 3');

  // Test 5: rotación combinada
  const ui4 = {
    az: Math.PI/4,   // 45 degrees azimuth
    el: Math.PI/6,   // 30 degrees elevation
  };
  
  const result4 = setupCamera(ui4);

  // Verificar distancia
  const distance4 = Vec.norm(result4.eye);
  assertEqual(distance4, 3.0, 1e-6, 'setupCamera distance with combined rotation');

  // Verificar componente Y
  const expectedY = 3.0 * Math.sin(Math.PI/6);
  assertEqual(result4.eye[1], expectedY, 1e-6, 'setupCamera elevation calculation');
  
  console.log('✓ setupCamera tests passed');
}

function testSetupProjection() {
  console.log('Testing setupProjection...');

  // Test 1: Perspectiva
  const ui1 = {
    fov: 60,
    near: 0.1,
    far: 10.0,
  };
  
  const result1 = setupProjection(800, 600, ui1, 'perspective');
  
  assertEqual(result1.fov, 60, 1e-6, 'setupProjection returns fov');
  assertEqual(result1.zn, 0.1, 1e-6, 'setupProjection returns zn');
  assertEqual(result1.zf, 10.0, 1e-6, 'setupProjection returns zf');
  
  if (!result1.P || result1.P.length !== 16) {
    throw new Error('setupProjection should return 4x4 projection matrix');
  }
  
  const aspect = 800/600;
  const expectedF = 1/Math.tan((60*Math.PI/180)/2);
  assertEqual(result1.P[0], expectedF/aspect, 1e-6, 'setupProjection perspective matrix [0,0]');
  assertEqual(result1.P[5], expectedF, 1e-6, 'setupProjection perspective matrix [1,1]');
  assertEqual(result1.P[11], -1, 1e-6, 'setupProjection perspective matrix [2,3]');

  // Test 2: Proyección ortográfica con valores negativos
  const ui2 = {
    near: -0.5,
    far: -20.0,
    orthoLeft: 2.0,
    orthoBottom: 1.5,
  };
  
  const result2 = setupProjection(1920, 1080, ui2, 'orthographic');
  
  assertEqual(result2.zn, -0.5, 1e-6, 'setupProjection orthographic zn');
  assertEqual(result2.zf, -20.0, 1e-6, 'setupProjection orthographic zf');
  
  const aspect2 = 1920/1080;
  const right = ui2.orthoLeft * aspect2;
  const expectedScaleX = 2 / (2 * right);
  const expectedScaleY = 2 / (2 * ui2.orthoBottom);
  
  assertEqual(result2.P[0], expectedScaleX, 1e-6, 'setupProjection orthographic matrix [0,0]');
  assertEqual(result2.P[5], expectedScaleY, 1e-6, 'setupProjection orthographic matrix [1,1]');
  assertEqual(result2.P[15], 1, 1e-6, 'setupProjection orthographic matrix [3,3]');
  
  // Test 3: Near/far clamping para perspectiva (usa valores absolutos)
  const ui3 = {
    fov: 45,
    near: -0.1,  // Para perspectiva se toma valor absoluto
    far: -0.05,  // Para perspectiva se toma valor absoluto, pero debe ser mayor que near
  };
  
  const result3 = setupProjection(640, 480, ui3, 'perspective');
  
  assertEqual(result3.zn, 0.1, 1e-6, 'setupProjection uses absolute value for perspective near');
  if (result3.zf <= result3.zn) {
    throw new Error('setupProjection should ensure far > near for perspective');
  }

  // Test 4: Extracción de parámetros de UI
  const ui4 = {
    fov: 75,
    near: 2.0,
    far: 50.0,
  };
  
  const result4 = setupProjection(1024, 768, ui4, 'perspective');
  
  assertEqual(result4.fov, 75, 1e-6, 'setupProjection extracts fov from ui');
  assertEqual(result4.zn, 2.0, 1e-6, 'setupProjection extracts near from ui');
  assertEqual(result4.zf, 50.0, 1e-6, 'setupProjection extracts far from ui');
  
  console.log('✓ setupProjection tests passed');
}

// ======================= Test de integración =======================

function testIntegration() {
  console.log('Testing integration (MVP pipeline)...');
  
  // 
  const eye = [0, 0, 5];
  const center = [0, 0, 0];
  const up = [0, 1, 0];
  
  const V = lookAt(eye, center, up);
  const P = perspective(60, 1, 1, 10);
  const M = [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1]; // Identidad
  
  // MVP = P * V * M
  const MV = mat4Mul(V, M);
  const MVP = mat4Mul(P, MV);
  
  // Test: punto en origen
  const worldPoint = [0, 0, 0, 1];
  const clipSpace = mat4Vec4(MVP, worldPoint);
  const ndc = [clipSpace[0]/clipSpace[3], clipSpace[1]/clipSpace[3], clipSpace[2]/clipSpace[3]];
  
  // Punto en origen debería estar visible (Z entre -1 y 1)
  if (ndc[2] < -1 || ndc[2] > 1) {
    throw new Error('Integration test: Point at origin not in NDC range');
  }
  
  // Convertir a espacio de pantalla
  const screen = ndcToScreen(ndc, 800, 600);

  // Debería estar cerca del centro de la pantalla
  assertEqual(screen[0], 399.5, 1e-6, 'Integration test screen X');
  assertEqual(screen[1], 299.5, 1e-6, 'Integration test screen Y');
  
  console.log('✓ Integration tests passed');
}

// ======================= Test Runner =======================

function runAllTests() {
  console.log('='.repeat(50));
  console.log('Running TP3 Core Function Tests');
  console.log('='.repeat(50));
  
  let passedTests = 0;
  let totalTests = 0;
  let failedTests = [];
  

  const testGroups = [
    {
      name: 'Vec Object Tests',
      condition: () => typeof Vec !== 'undefined',
      tests: [
        { name: 'testVecAdd', fn: testVecAdd },
        { name: 'testVecSub', fn: testVecSub },
        { name: 'testVecDot', fn: testVecDot },
        { name: 'testVecCross', fn: testVecCross },
        { name: 'testVecNorm', fn: testVecNorm },
        { name: 'testVecNormalize', fn: testVecNormalize },
        { name: 'testVecScale', fn: testVecScale }
      ]
    },
    {
      name: 'Matrix Tests',
      condition: () => typeof mat4Mul !== 'undefined' && typeof mat4Vec4 !== 'undefined',
      tests: [
        { name: 'testMat4Mul', fn: testMat4Mul },
        { name: 'testMat4Vec4', fn: testMat4Vec4 }
      ]
    },
    {
      name: 'Camera and Projection Tests',
      condition: () => typeof lookAt !== 'undefined' || typeof perspective !== 'undefined' || typeof orthographic !== 'undefined',
      tests: [
        { name: 'testLookAt', fn: testLookAt, condition: () => typeof lookAt !== 'undefined' },
        { name: 'testPerspective', fn: testPerspective, condition: () => typeof perspective !== 'undefined' },
        { name: 'testOrthographic', fn: testOrthographic, condition: () => typeof orthographic !== 'undefined' }
      ]
    },
    {
      name: 'Screen Mapping Tests',
      condition: () => typeof ndcToScreen !== 'undefined',
      tests: [
        { name: 'testNdcToScreen', fn: testNdcToScreen }
      ]
    },
    {
      name: 'Setup Function Tests',
      condition: () => typeof setupCamera !== 'undefined' || typeof setupProjection !== 'undefined',
      tests: [
        { name: 'testSetupCamera', fn: testSetupCamera, condition: () => typeof setupCamera !== 'undefined' },
        { name: 'testSetupProjection', fn: testSetupProjection, condition: () => typeof setupProjection !== 'undefined' }
      ]
    },
    {
      name: 'Integration Tests',
      condition: () => typeof lookAt !== 'undefined' && typeof perspective !== 'undefined' && typeof mat4Mul !== 'undefined',
      tests: [
        { name: 'testIntegration', fn: testIntegration }
      ]
    }
  ];
  
  testGroups.forEach(group => {
    if (group.condition()) {
      console.log(`\n📂 ${group.name}`);
      
      group.tests.forEach(test => {
        totalTests++;
        
        if (test.condition && !test.condition()) {
          console.log(`  ${test.name} - SKIPPED (function not implemented)`);
          return;
        }
        
        try {
          test.fn();
          passedTests++;
        } catch (error) {
          failedTests.push({ name: test.name, error: error.message });
          console.error(` ${test.name} - FAILED: ${error.message}`);
        }
      });
    } else {
      console.log(`\n📂 ${group.name} - SKIPPED (required functions not implemented)`);
      totalTests += group.tests.length;
    }
  });
  
  // Resumen
  console.log('\n' + '='.repeat(50));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(50));
  console.log(`✅ Passed: ${passedTests}/${totalTests}`);
  console.log(`❌ Failed: ${failedTests.length}`);
  console.log(`⏭️  Skipped: ${totalTests - passedTests - failedTests.length}`);
  
  if (failedTests.length > 0) {
    console.log('\n🚨 Failed Tests:');
    failedTests.forEach(test => {
      console.log(`   - ${test.name}: ${test.error}`);
    });
  }
  
  const percentage = totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0;
  
  if (passedTests === totalTests) {
    console.log('\n🎉 ALL TESTS PASSED! 🎉');
  } else if (passedTests > 0) {
    console.log(`\n⚡ ${percentage}% TESTS PASSED - Keep implementing!`);
  } else {
    console.log('\n🔴 NO TESTS PASSED - Start implementing the functions!');
  }
  
  console.log('='.repeat(50));
  
  return passedTests > 0;
}


if (typeof window !== 'undefined') {
  document.addEventListener('DOMContentLoaded', function() {
    console.log('TP3 Test Suite loaded. Run runAllTests() to execute tests.');
  });
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    runAllTests,
    testVecAdd, testVecSub, testVecDot, testVecCross, testVecNorm, testVecNormalize,
    testMat4Mul, testMat4Vec4,
    testLookAt, testPerspective, testOrthographic,
    testNdcToScreen, testIntegration
  };
}