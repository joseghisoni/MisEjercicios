// ********** Render/WebGL y utilidades de shaders **********

var lineDrawer;   // Dibujo de líneas
var curveDrawer;  // Dibujo de curva (Catmull-Rom)
var animation;    // Animación de la pelota
var currentDrawingMode = "lines"; // "lines" o "curve"

function InitWebGL()
{
    const canvas = document.getElementById("canvas");
    canvas.oncontextmenu = function() {return false;};

    gl = canvas.getContext("webgl", {antialias: true, depth: false});
    if (!gl) { alert("No se pudo inicializar WebGL. Es probable que tu navegador no lo soporte."); return; }

    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    gl.lineWidth(1.0);

    lineDrawer  = new LineDrawer();
    curveDrawer = new CurveDrawer();
    animation   = new Animation();

    UpdateCanvasSize();
}

function UpdateCanvasSize()
{
    const canvas = document.getElementById("canvas");
    canvas.style.width  = '100%';
    const pixelRatio    = window.devicePixelRatio || 1;
    canvas.width        = pixelRatio * canvas.clientWidth;
    canvas.height       = pixelRatio * canvas.clientHeight;
    const width         = (canvas.width  / pixelRatio);
    const height        = (canvas.height / pixelRatio);
    canvas.style.width  = width  + 'px';
    canvas.style.height = height + 'px';
    gl.viewport( 0, 0, canvas.width, canvas.height );
    lineDrawer.setViewport( width, height );
    curveDrawer.setViewport( width, height );
    animation.setViewport( width, height );
}

function UpdatePoints()
{
    lineDrawer.updatePoints(pt);
    curveDrawer.updatePoints(pt);
}

function DrawScene()
{
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    if (currentDrawingMode === "curve") curveDrawer.draw(); else lineDrawer.draw();
    animation.draw();
}

function InitShaderProgram( vsSource, fsSource )
{
    const vs = CompileShader( gl.VERTEX_SHADER,   vsSource );
    const fs = CompileShader( gl.FRAGMENT_SHADER, fsSource );
    const prog = gl.createProgram();
    gl.attachShader(prog, vs); gl.attachShader(prog, fs); gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { 
        alert('No se pudo inicializar el programa: ' + gl.getProgramInfoLog(prog)); 
        return null; 
    }
    return prog;
}

function CompileShader( type, source )
{
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source); gl.compileShader(shader);
    if (!gl.getShaderParameter( shader, gl.COMPILE_STATUS) ) { 
        alert('Ocurrió un error durante la compilación del shader:\n' + gl.getShaderInfoLog(shader)); 
        gl.deleteShader(shader); 
        return null; 
    }
    return shader;
}

