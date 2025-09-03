function GetModelViewProjection( projectionMatrix, translationX, translationY, translationZ, rotationX, rotationY )
{
    // Matriz de rotación x
    var rot_x = [ 
        1, 0, 0, 0,
        0,  Math.cos(rotationX), Math.sin(rotationX),0,
        0, -Math.sin(rotationX), Math.cos(rotationX),0,
        0, 0, 0, 1
    ];

    var rot_y = [ 
        Math.cos(rotationY), 0, -Math.sin(rotationY), 0,
        0, 1, 0, 0,
        Math.sin(rotationY), 0, Math.cos(rotationY), 0,
        0, 0, 0, 1
    ];

    // Matriz de traslación
    var trans = [
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        translationX, translationY, translationZ, 1
    ];

    // Compongo las transformaciones: primero rotación, luego traslación
    let transform = MatrixMult(trans, MatrixMult(rot_y, rot_x));

    var mvp = MatrixMult( projectionMatrix, transform );
    return mvp;
}

function UpdateCanvasSize(canvas) {
    const pixelRatio = window.devicePixelRatio || 1;
    canvas.width = pixelRatio * canvas.clientWidth;
    canvas.height = pixelRatio * canvas.clientHeight;
    gl.viewport(0, 0, canvas.width, canvas.height);
}

function UpdateProjectionMatrix(canvas, rotX, rotY, transZ) {
    const projMatrix = perspective({ fov: 30, aspect: canvas.width / canvas.height});
    const rotXRad = rotX * Math.PI / 180;
    const rotYRad = rotY * Math.PI / 180;
    return GetModelViewProjection(projMatrix, 0, 0, transZ, rotXRad, rotYRad);
}

function MatrixMult(A,B){
    const r = new Array(16).fill(0);
    for(let i=0;i<4;i++){
        for(let j=0;j<4;j++){
            for(let k=0;k<4;k++) r[j*4+i] += A[k*4+i]*B[j*4+k];
        }
    }
    return r;
}

function perspective(options = {}) {
    let fov = (options.fov ?? 60) * Math.PI / 180;  // en radianes
    const aspect = options.aspect ?? 1.0; 
    const znear = options.near ?? 0.01;
    const zfar  = options.far  ?? 100.0;
    const s = 1 / Math.tan(fov / 2);
    const z0 = (zfar + znear) / (znear - zfar);
    const z1 = (-2 * zfar * znear) / (zfar-znear);
    return [
        s / aspect, 0, 0, 0,
        0, s, 0, 0,
        0, 0, z0,-1,
        0, 0, z1, 0
    ];
};
