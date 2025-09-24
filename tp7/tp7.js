function createInitialCube() {
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
  const faces = [
    new Face([v0, v1, v2, v3]), // front
    new Face([v0, v3, v4, v5]), // right
    new Face([v0, v5, v6, v1]), // top
    new Face([v1, v6, v7, v2]), // left
    new Face([v2, v7, v4, v3]), // bottom
    new Face([v5, v4, v7, v6])  // back
  ];

  return facesToMeshData(faces);
}

function hslToRgb(h, s, l) {
  let r, g, b;

  if (s === 0) {
    r = g = b = l; // achromatic
  } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }

  return [r, g, b];
}

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


// Función que compila los shaders que se le pasan por parámetro (vertex & fragment shaders)
// Recibe los strings de cada shader y retorna un programa
function InitShaderProgram(gl, vsSource, fsSource )
{
	// Función que compila cada shader individualmente
	const vs = CompileShader(gl, gl.VERTEX_SHADER,   vsSource );
	const fs = CompileShader(gl, gl.FRAGMENT_SHADER, fsSource );

	// Crea y linkea el programa 
	const prog = gl.createProgram();
	gl.attachShader(prog, vs);
	gl.attachShader(prog, fs);
	gl.linkProgram(prog);

	if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) 
	{
		alert('No se pudo inicializar el programa: ' + gl.getProgramInfoLog(prog));
		return null;
	}
	return prog;
}

// Función para compilar shaders, recibe el tipo (gl.VERTEX_SHADER o gl.FRAGMENT_SHADER)
// y el código en forma de string. Es llamada por InitShaderProgram()
function CompileShader(gl, type, source )
{
	// Creamos el shader
	const shader = gl.createShader(type);

	// Lo compilamos
	gl.shaderSource(shader, source);
	gl.compileShader(shader);

	// 	Verificamos si la compilación fue exitosa
	if (!gl.getShaderParameter( shader, gl.COMPILE_STATUS) ) 
	{
		alert('Ocurrió un error durante la compilación del shader:' + gl.getShaderInfoLog(shader));
		gl.deleteShader(shader);
		return null;
	}
	return shader;
}


  
window.onload = function() 
{   
    /******* INICIALIZACIÓN DEL CANVAS *******/
	// Inicializamos el canvas y WebGL
    const canvas = document.getElementById('mycanvas');
    gl = canvas.getContext('webgl');
    if (!gl) { alert('WebGL not supported'); return; }

    // Actualizar el tamaño de la ventana cada vez que se hace resize
    UpdateCanvasSize(canvas);

    /******* INICIALIZACIÓN DE LA ESCENA *******/
    //
    //  (-1,  1, -1) ← v6----- v5 → ( 1,  1, -1)              
    //                 /|      /|
    // (-1,  1, 1)  ← v1------v0| → ( 1,  1,  1)
    //                | |     | |
    // (-1, -1, -1) ← | |v7---|-|v4 → ( 1, -1, -1)
    //                |/      |/
    // (-1, -1,  1) ← v2------v3 → ( 1, -1,  1)

  
    // Initial cube mesh data and current faces for subdivision
    let meshData = createInitialCube();
    let currentFaces = createInitialCubeFaces();

    // Creación y binding de los buffers:
    // Buffer para posición
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, meshData.positions, gl.STATIC_DRAW);

    // Buffer para colores
    const colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, meshData.colors, gl.STATIC_DRAW);
    
    /******* SHADERS *******/
    const vshader = `
        attribute vec3 position;
        attribute vec3 color;
        uniform mat4 camera;
        varying vec4 v_color;
        void main() {
            gl_Position = camera * vec4(position, 1.0);
            v_color = vec4(color, 1.0);
        }`;

    const fshader = `
        precision mediump float;
        varying vec4 v_color;
        void main() {
            gl_FragColor = v_color;
        }`;

    /******* COMPILAMOS LOS SHADERS *******/
    const program = InitShaderProgram(gl, vshader, fshader);
    gl.useProgram(program);

    /******* LINKEAMOS LOS BUFFERS DE LA ESCENA *******/
    const aPos = gl.getAttribLocation(program, 'position'); 
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer); 
    gl.vertexAttribPointer( 
        aPos, // A qué atributo se lo asigno
        3, // tomo 3 componentes por vértice
        gl.FLOAT, // cada número es un float de 32 bits
        false,  // no normalizar
        0, // stride
        0 // offset
    );
    gl.enableVertexAttribArray(aPos);

    const aCol = gl.getAttribLocation(program, 'color');
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.vertexAttribPointer(aCol, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(aCol);

    /******* REENDERIZAMOS  *******/
    // Configuración de la escena
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST); 

    const uCam = gl.getUniformLocation(program, 'camera');
  
    let cameraMatrix;
    function DrawScene() {
        gl.uniformMatrix4fv(uCam, false, cameraMatrix);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.drawArrays(gl.TRIANGLES, 0, meshData.vertexCount);
    }
    // Función para actualizar la malla después de la subdivisión
    function updateMesh(newFaces) {
        currentFaces = newFaces;
        meshData = facesToMeshData(newFaces);

        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, meshData.positions, gl.STATIC_DRAW);

        gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, meshData.colors, gl.STATIC_DRAW);

        updateQuadCount(newFaces.length);

        DrawScene();
    }

    function updateQuadCount(count) {
        const quadCountElement = document.getElementById('quadCount');
        if (quadCountElement) {
            quadCountElement.textContent = `Quads: ${count}`;
        }
    }

    // Wrapper para la función de subdivisión
    function performSubdivision() {
        const subdividedFaces = catmull_clark_surface_subdivision(currentFaces);
        updateMesh(subdividedFaces);
    }

    // Control de la cámara
    let transZ = -15;
    let rotX = 0;
    let rotY = 0;

    cameraMatrix = UpdateProjectionMatrix(canvas, rotX, rotY, transZ);

    updateQuadCount(currentFaces.length);

    DrawScene();
    
    function handleResize() {
        UpdateCanvasSize(canvas);
        cameraMatrix = UpdateProjectionMatrix(canvas, rotX, rotY, transZ);
        DrawScene();
    }
    
    window.addEventListener('resize', handleResize);

    // Eventos de mouse
    // Evento de zoom (ruedita)
    canvas.zoom = function( s ) {
        transZ *= s/canvas.height + 1;
        cameraMatrix = UpdateProjectionMatrix(canvas, rotX, rotY, transZ);
        DrawScene();
    }
    canvas.onwheel = function(event) { 
        event.preventDefault();
        canvas.zoom(0.3*event.deltaY); 
    } 

    // Evento de click 
    canvas.onmousedown = function(event) {
        event.preventDefault();
        var cx = event.clientX;
        var cy = event.clientY;
        
        if ( event.ctrlKey ) {
        canvas.onmousemove = function(event) {
            canvas.zoom(5*(event.clientY - cy));
            cy = event.clientY;
        }
        } else {
        // Si se mueve el mouse, actualizo las matrices de rotación
        canvas.onmousemove = function(event) {
            rotY -= (cx - event.clientX)/canvas.width*500;
            rotX -= (cy - event.clientY)/canvas.height*500;
            cx = event.clientX;
            cy = event.clientY;
            cameraMatrix = UpdateProjectionMatrix(canvas, rotX, rotY, transZ);
            DrawScene();
        }
        }
    }

    // Evento soltar el mouse
    canvas.onmouseup = canvas.onmouseleave = function() {
        canvas.onmousemove = null;
    }

    // Make subdivision functions globally accessible
    window.performSubdivision = performSubdivision;
    window.resetCube = function() {
        currentFaces = createInitialCubeFaces();
        updateMesh(currentFaces);
    };

};


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
