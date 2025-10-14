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
		this.prog.uP3 = gl.getUniformLocation( this.prog, "p3" );
				
		// Muestreo del parámetro t
		this.steps = 10000;
		var tv = [];
		for ( var i=0; i<this.steps; ++i ) {
			tv.push( i / (this.steps-1) );
		}
		
		// [Completar] Creacion del vertex buffer y seteo de contenido
		this.tBuffer = gl.createBuffer();
		gl.bindBuffer( gl.ARRAY_BUFFER, this.tBuffer );
		gl.bufferData( gl.ARRAY_BUFFER, new Float32Array(tv), gl.STATIC_DRAW );
	}

	// Actualización del viewport (se llama al inicializar la web o al cambiar el tamaño de la pantalla)
	setViewport( width, height )
	{
		// [Completar] Matriz de transformación.
		var trans = [ 2/width,0,0,0,  0,-2/height,0,0, 0,0,1,0, -1,1,0,1 ];
		// [Completar] Binding del programa y seteo de la variable uniforme para la matriz. 
		gl.useProgram( this.prog );
		gl.uniformMatrix4fv( this.prog.uMVP, false, trans );
	}

	updatePoints( pt )
	{
		// [Completar] Actualización de las variables uniformes para los puntos de control
		gl.useProgram( this.prog );
		gl.uniform2f( this.prog.uP0, pt[0].getAttribute("cx"), pt[0].getAttribute("cy") );
		gl.uniform2f( this.prog.uP1, pt[1].getAttribute("cx"), pt[1].getAttribute("cy") );
		gl.uniform2f( this.prog.uP2, pt[2].getAttribute("cx"), pt[2].getAttribute("cy") );
		gl.uniform2f( this.prog.uP3, pt[3].getAttribute("cx"), pt[3].getAttribute("cy") );
		// [Completar] No se olviden de hacer el binding del programa antes de setear las variables 
		// [Completar] Pueden acceder a las coordenadas de los puntos de control consultando el arreglo pt[]:
		// var x = pt[i].getAttribute("cx");
		// var y = pt[i].getAttribute("cy");
	}

	draw()
	{
		// [Completar] Dibujamos la curva como una LINE_STRIP
		gl.useProgram( this.prog );

		gl.bindBuffer( gl.ARRAY_BUFFER, this.tBuffer );
		gl.enableVertexAttribArray( this.prog.aT );
		gl.vertexAttribPointer( this.prog.aT, 1, gl.FLOAT, false, 0, 0 );
		gl.drawArrays( gl.POINTS, 0, this.steps );
		gl.disableVertexAttribArray( this.prog.aT );
		// [Completar] No se olviden de hacer el binding del programa y de habilitar los atributos de los vértices
	}
}

// Vertex Shader
//[Completar] El vertex shader se ejecuta una vez por cada punto en mi curva (parámetro step). No confundir punto con punto de control.
// Deberán completar con la definición de una Bezier Cúbica para un punto t. Algunas consideraciones generales respecto a GLSL: si
// declarás las variables pero no las usás, no se les asigna espacio. Siempre poner ; al finalizar las sentencias. Las constantes
// en punto flotante necesitan ser expresadas como X.Y, incluso si son enteros: ejemplo, para 4 escribimos 4.0
var curvesVS = `
	attribute float t;
	varying float v_t;
	uniform mat4 mvp;
	uniform vec2 p0;
	uniform vec2 p1;
	uniform vec2 p2;
	uniform vec2 p3;
	void main()
	{ 
		gl_Position = vec4(0,0,0,1);
		float u = 1.0 - t;
		gl_Position.x = u*u*u*p0.x + 3.0*u*u*t*p1.x + 3.0*u*t*t*p2.x + t*t*t*p3.x;
		gl_Position.y = u*u*u*p0.y + 3.0*u*u*t*p1.y + 3.0*u*t*t*p2.y + t*t*t*p3.y;
		gl_Position = mvp * gl_Position;
		gl_PointSize = 70.0 * t;
		v_t = t;
	}
`;

// Fragment Shader
var curvesFS = `
	precision mediump float;
	varying float v_t;

	vec3 hsv2rgb(vec3 c){
		vec3 p = abs(fract(c.xxx + vec3(0.0, 2.0/3.0, 1.0/3.0))*6.0 - 3.0);
		vec3 rgb = c.z * mix(vec3(1.0), clamp(p - 1.0, 0.0, 1.0), c.y);
		return rgb;
	}

	void main() {
	// h rueda 0..1 con v_t, s y v fijos
	vec3 c = hsv2rgb(vec3(v_t, 0.8, 0.9));
	gl_FragColor = vec4(c, 1.0);
	}
`;
