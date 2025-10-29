// Test suite para la función GetModelViewProjection
function matricesEqual(a, b, tolerance = 1e-10) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
        if (Math.abs(a[i] - b[i]) > tolerance) {
            return false;
        }
    }
    return true;
}

// Test 1: Identity 
function testIdentityTransformation() {
    const identityProjection = [
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
    ];

    const result = GetModelViewProjection(identityProjection, 0, 0, 0, 0, 0);

    if (matricesEqual(result, identityProjection)) {
        console.log("✓ Test 1 passed: Identity transformation");
        return true;
    } else {
        console.error("✗ Test 1 failed: Identity transformation");
        console.log("Expected:", identityProjection);
        console.log("Got:", result);
        return false;
    }
}

// Test 2: Translation 
function testTranslationOnly() {
    const identityProjection = [
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
    ];

    const expected = [
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        2, 3, 4, 1
    ];

    const result = GetModelViewProjection(identityProjection, 2, 3, 4, 0, 0);

    if (matricesEqual(result, expected)) {
        console.log("✓ Test 2 passed: Translation only");
        return true;
    } else {
        console.error("✗ Test 2 failed: Translation only");
        console.log("Expected:", expected);
        console.log("Got:", result);
        return false;
    }
}

// Test 3: Rotation X 90
function testRotationX() {
    const identityProjection = [
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
    ];

    const result = GetModelViewProjection(identityProjection, 0, 0, 0, Math.PI / 2, 0);

    const expected = [
        1, 0, 0, 0,
        0, 0, 1, 0,
        0, -1, 0, 0,
        0, 0, 0, 1
    ];

    if (matricesEqual(result, expected, 1e-6)) {
        console.log("✓ Test 3 passed: 90° rotation around X axis");
        return true;
    } else {
        console.error("✗ Test 3 failed: 90° rotation around X axis");
        console.log("Expected:", expected);
        console.log("Got:", result);
        return false;
    }
}

// Test 4: Rotation Y 90
function testRotationY() {
    const identityProjection = [
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
    ];

    const result = GetModelViewProjection(identityProjection, 0, 0, 0, 0, Math.PI / 2);

    const expected = [
        0, 0, -1, 0,
        0, 1, 0, 0,
        1, 0, 0, 0,
        0, 0, 0, 1
    ];

    if (matricesEqual(result, expected, 1e-6)) {
        console.log("✓ Test 4 passed: 90° rotation around Y axis");
        return true;
    } else {
        console.error("✗ Test 4 failed: 90° rotation around Y axis");
        console.log("Expected:", expected);
        console.log("Got:", result);
        return false;
    }
}

// Test 5: Combinar transformaciones
function testCombinedTransformation() {
    const identityProjection = [
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
    ];

    const result = GetModelViewProjection(identityProjection, 1, 2, 3, Math.PI / 4, Math.PI / 6);

    // Should have 16 elements and be a valid 4x4 matrix
    if (result.length === 16 && !result.some(isNaN)) {
        console.log("✓ Test 5 passed: Combined transformation produces valid matrix");
        return true;
    } else {
        console.error("✗ Test 5 failed: Combined transformation");
        console.log("Got:", result);
        return false;
    }
}


// Run all tests
console.log("Running tests for GetModelViewProjection...\n");

const results = [
    testIdentityTransformation(),
    testTranslationOnly(),
    testRotationX(),
    testRotationY(),
    testCombinedTransformation(),
];

const passed = results.filter(r => r).length;
const total = results.length;

console.log(`\n${passed}/${total} tests passed`);

if (passed === total) {
    console.log("All tests passed! ✓");
} else {
    console.log(`${total - passed} test(s) failed ✗`);
}
