// #TODO Función que compila los shaders que se le pasan por parámetro (vertex & fragment shaders)
// Recibe los strings de cada shader y retorna un programa
function InitShaderProgram(gl, vsSource, fsSource )
{
	// Completar
	return prog;
}

//#TODO Función para compilar shaders, recibe el tipo (gl.VERTEX_SHADER o gl.FRAGMENT_SHADER)
// y el código en forma de string. Es llamada por InitShaderProgram()
function CompileShader(gl, type, source )
{
	// Completar
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

  
    // 6 caras para el cubo
    // Cada cara compuesta de 2 triángulos, con 3 puntos en cada triángulo
    const positions = new Float32Array([
        // cara frontal: (v0, v1, v2) y (v0, v2, v3)
        1,  1,  1,   -1,  1,  1,   -1, -1,  1,
        1,  1,  1,   -1, -1,  1,    1, -1,  1,
        // cara derecha: (v0, v3, v4) y (v0, v4, v5)
        1,  1,  1,    1, -1,  1,    1, -1, -1,
        1,  1,  1,    1, -1, -1,    1,  1, -1,
        // cara superior: (v0, v5, v6) y (v0, v6, v1)
        1,  1,  1,    1,  1, -1,   -1,  1, -1,
        1,  1,  1,   -1,  1, -1,   -1,  1,  1,
        // cara izquierda: (v1, v6, v7) y (v1, v7, v2)
        -1,  1,  1,   -1,  1, -1,   -1, -1, -1,
        -1,  1,  1,   -1, -1, -1,   -1, -1,  1,
        // cara inferior: (v7, v4, v3) y (v7, v3, v2)
        -1, -1, -1,    1, -1, -1,    1, -1,  1,
        -1, -1, -1,    1, -1,  1,   -1, -1,  1,
        // cara posterior: (v4, v7, v6) y (v4, v6, v5)
        1, -1, -1,   -1, -1, -1,   -1,  1, -1,
        1, -1, -1,   -1,  1, -1,    1,  1, -1,
    ]);

    // Colores de vértices (r, g, b)
    // [
    //     1.0, 1.0, 1.0,  // v0 blanco
    //     1.0, 0.0, 1.0,  // v1 magenta
    //     1.0, 0.0, 0.0,  // v2 rojo
    //     1.0, 1.0, 0.0,  // v3 amarillo
    //     0.0, 1.0, 0.0,  // v4 verde
    //     0.0, 1.0, 1.0,  // v5 cian
    //     0.0, 0.0, 1.0,  // v6 azul
    //     0.0, 0.0, 0.0   // v7 negro
    // ]
    const colors = new Float32Array([
        // cara frontal: (v0 blanco, v1 magenta, v2 rojo, v3 amarillo)
        1,1,1,   1,0,1,   1,0,0,
        1,1,1,   1,0,0,   1,1,0,
        // cara derecha: (v0 blanco, v3 amarillo, v4 verde, v5 cian)
        1,1,1,   1,1,0,   0,1,0,
        1,1,1,   0,1,0,   0,1,1,
        // cara superior: (v0 blanco, v5 cian, v6 azul, v1 magenta)
        1,1,1,   0,1,1,   0,0,1,
        1,1,1,   0,0,1,   1,0,1,
        // cara izquierda: (v1 magenta, v6 azul, v7 negro, v2 rojo)
        1,0,1,   0,0,1,   0,0,0,
        1,0,1,   0,0,0,   1,0,0,
        // cara inferior: (v7 negro, v4 verde, v3 amarillo, v2 rojo)
        0,0,0,   0,1,0,   1,1,0,
        0,0,0,   1,1,0,   1,0,0,
        // cara trasera: (v4 verde, v7 negro, v6 azul, v5 cian)
        0,1,0,   0,0,0,   0,0,1,
        0,1,0,   0,0,1,   0,1,1,
    ]);

    // Creación y binding de los buffers:
    // Buffer para posición
    // Completar

    // Buffer para colores
    // Completar
    
    /******* SHADERS *******/
    const vshader = `
        Completar
        `;

    const fshader = `
        Completar
    `;

    /******* COMPILAMOS LOS SHADERS *******/
    const program = InitShaderProgram(gl, vshader, fshader);
    gl.useProgram(program);

    /******* LINKEAMOS LOS BUFFERS DE LA ESCENA *******/
    // Completar: linkear shaders para posición y color

    /******* REENDERIZAMOS  *******/
    // Configuración de la escena
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST); // ¿Qué pasa si desactivamos esto ?

    const uCam = gl.getUniformLocation(program, 'camera');
  
    let cameraMatrix;
    function DrawScene() {
        gl.uniformMatrix4fv(uCam, false, cameraMatrix);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.drawArrays(gl.TRIANGLES, 0, 3*2*6);
    }

    // Control de la cámara
    let transZ = -15;
    let rotX = 0;
    let rotY = 0;

    cameraMatrix = UpdateProjectionMatrix(canvas, rotX, rotY, transZ);
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

    
};

