// Completar la implementación de esta clase y el correspondiente vertex shader. 
// No será necesario modificar el fragment shader a menos que, por ejemplo, quieran modificar el color de la curva.
class CurveDrawer 
{
	// Inicialización de los shaders y buffers
	constructor()
	{
		// Creamos el programa webgl con los shaders para los segmentos de recta
		this.prog   = InitShaderProgram( curvesVS, curvesFS );

		// [Completar] Incialización y obtención de las ubicaciones de los atributos y variables uniformes
		this.prog.aT = gl.getAttribLocation( this.prog, "t" );
		this.prog.uMVP = gl.getUniformLocation( this.prog, "mvp" );
		this.prog.uP0 = gl.getUniformLocation( this.prog, "p0" );
		this.prog.uP1 = gl.getUniformLocation( this.prog, "p1" );
		this.prog.uP2 = gl.getUniformLocation( this.prog, "p2" );
		this.prog.uP3 = gl.getUniformLocation( this.prog, "p3" );

		// Muestreo del parámetro t
		this.steps = 100;
		var tv = [];
		for ( var i=0; i<this.steps; ++i ) {
			tv.push( i / (this.steps-1) );
		}
		
		// [Completar] Creacion del vertex buffer y seteo de contenido
		this.buffer = gl.createBuffer();

		// Si bien creamos el buffer, no vamos a ponerle contenido en este
		// constructor. La actualziación de la información de los vértices
		// la haremos dentro de updatePoints().
	}

	// Actualización del viewport (se llama al inicializar la web o al cambiar el tamaño de la pantalla)
	setViewport( width, height )
	{
		// [Completar] Matriz de transformación.
		// [Completar] Binding del programa y seteo de la variable uniforme para la matriz. 
		// Calculamos la matriz de proyección.
		// Como nos vamos a manejar únicamente en 2D, no tiene sentido utilizar perspectiva. 
		// Simplemente inicializamos la matriz para que escale los elementos de la escena
		// al ancho y alto del canvas, invirtiendo la coordeanda y. La matriz está en formato 
		// column-major.
		var trans = [ 2/width,0,0,0,  0,-2/height,0,0, 0,0,1,0, -1,1,0,1 ];

		// Seteamos la matriz en la variable unforme del shader
		gl.useProgram( this.prog );
		gl.uniformMatrix4fv( this.uMVP, false, trans );
	}

	updatePoints( pt )
	{
		// [Completar] Actualización de las variables uniformes para los puntos de control
		// [Completar] No se olviden de hacer el binding del programa antes de setear las variables 
		// [Completar] Pueden acceder a las coordenadas de los puntos de control consultando el arreglo pt[]:
		// var x = pt[i].getAttribute("cx");
		// var y = pt[i].getAttribute("cy");
		var p = [];
		for ( var i=0; i<4; ++i ) 
		{
			var x = pt[i].getAttribute("cx");
			var y = pt[i].getAttribute("cy");
			
			p.push(x);
			p.push(y);
		}

		// Enviamos al buffer
		gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(p), gl.STATIC_DRAW);
	}

	draw()
	{
		// [Completar] Dibujamos la curva como una LINE_STRIP
		// [Completar] No se olviden de hacer el binding del programa y de habilitar los atributos de los vértices
		// Seleccionamos el shader
		gl.useProgram( this.prog );

		// Binding del buffer de posiciones
		gl.bindBuffer( gl.ARRAY_BUFFER, this.buffer );

		// Habilitamos el atributo 
		gl.vertexAttribPointer( this.uP0, 2, gl.FLOAT, false, 0, 0 );
		gl.enableVertexAttribArray( this.uP0 );
		gl.vertexAttribPointer( this.uP1, 2, gl.FLOAT, false, 0, 0 );
		gl.enableVertexAttribArray( this.uP1 );
		gl.vertexAttribPointer( this.uP2, 2, gl.FLOAT, false, 0, 0 );
		gl.enableVertexAttribArray( this.uP2 );
		gl.vertexAttribPointer( this.uP3, 2, gl.FLOAT, false, 0, 0 );
		gl.enableVertexAttribArray( this.uP3 );

		// Dibujamos lineas utilizando primitivas gl.LINE_STRIP 
		// https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/drawArrays
		gl.drawArrays( gl.LINE_STRIP, 0, 4 );
	}
}

// Vertex Shader
//[Completar] El vertex shader se ejecuta una vez por cada punto en mi curva (parámetro step). No confundir punto con punto de control.
// Deberán completar con la definición de una Bezier Cúbica para un punto t. Algunas consideraciones generales respecto a GLSL: si
// declarás las variables pero no las usás, no se les asigna espacio. Siempre poner ; al finalizar las sentencias. Las constantes
// en punto flotante necesitan ser expresadas como X.Y, incluso si son enteros: ejemplo, para 4 escribimos 4.0
var curvesVS = `
	attribute float t;
	uniform mat4 mvp;
	uniform vec2 p0;
	uniform vec2 p1;
	uniform vec2 p2;
	uniform vec2 p3;
	void main()
	{ 
		gl_Position = vec4(0,0,0,1);
		gl_Position = mvp * vec4(
			(1.0-t)*(1.0-t)*(1.0-t)*p0.x + 3.0*(1.0-t)*(1.0-t)*t*p1.x + 3.0*(1.0-t)*t*t*p2.x + t*t*t*p3.x,
			(1.0-t)*(1.0-t)*(1.0-t)*p0.y + 3.0*(1.0-t)*(1.0-t)*t*p1.y + 3.0*(1.0-t)*t*t*p2.y + t*t*t*p3.y,
			0, 1);
	}
`;

// Fragment Shader
var curvesFS = `
	precision mediump float;
	void main()
	{
		gl_FragColor = vec4(0,0,1,1);
	}
`;

