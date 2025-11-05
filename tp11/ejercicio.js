// Clase responsable de dibujar un quad de pantalla completa y realizar el ray tracing en el fragment shader
// Mantiene una API mínima: setLightDir, setShininess y draw().
class RayTracer
{

	constructor(gl, meshVS, meshFS)
	{
		// 1) Compilar el programa de shaders (fullscreen quad + ray tracing en el fragment)
		this.prog = InitShaderProgram( meshVS, meshFS );
		
		// 2) IDs de uniforms necesarios del fragment shader
		this.uResolution = gl.getUniformLocation( this.prog, 'uResolution' );
		this.uTanHalfFov = gl.getUniformLocation( this.prog, 'uTanHalfFov' );
		this.uCamRot     = gl.getUniformLocation( this.prog, 'uCamRot' );
		this.uCamPos     = gl.getUniformLocation( this.prog, 'uCamPos' );
		this.uLightDir   = gl.getUniformLocation( this.prog, 'lightdir' );
		this.uAlpha       = gl.getUniformLocation( this.prog, 'alpha' );
		
		// 3) Atributo del quad del vertex shader
		this.aPos = gl.getAttribLocation( this.prog, 'pos' );

		// 4) Buffer del quad: array buffer con las posiciones de los 4 vértices
		this.fullscreenBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.fullscreenBuffer);
		const quad = new Float32Array([
			-1, -1,
			 1, -1,
			-1,  1,
			 1,  1,
		]);
		gl.bufferData(gl.ARRAY_BUFFER, quad, gl.STATIC_DRAW);

		// 5) Estado inicial
		this._tanHalfFov = Math.tan( (60.0 * Math.PI/180.0) * 0.5 );
		this._lightdir = new Float32Array([-0.4, 0.6, -0.7]); // dirección de luz por defecto
		this._alpha = 32.0; // brillo especular, default
	}

	// Dibuja el quad de pantalla y setea todos los uniforms que usa el fragment shader
	draw( matrixMVP, matrixMV, matrixNormal )
	{
		gl.useProgram( this.prog );

		// Evitar escribir/chequear profundidad para no depender del estado previo
		const wasDepthEnabled = gl.isEnabled(gl.DEPTH_TEST);
		if (wasDepthEnabled) gl.disable(gl.DEPTH_TEST);

		// Tamaño y FOV
		gl.uniform2f( this.uResolution, gl.canvas.width, gl.canvas.height );
		gl.uniform1f( this.uTanHalfFov, this._tanHalfFov );

		// Luz y material
		gl.uniform3fv( this.uLightDir, this._lightdir );
		gl.uniform1f( this.uAlpha, this._alpha );

		// Cámara en modo órbita (a partir de rotX, rotY, transZ definidos en project11.js)
		const cy = Math.cos(rotY), sy = Math.sin(rotY);
		const cx = Math.cos(rotX), sx = Math.sin(rotX);
		// Matriz de rotación 3x3 R = Ry * Rx (column-major)
		const R = new Float32Array([
			cy,   0.0, -sy,
			sy*sx, cx,  cy*sx,
			sy*cx, -sx, cy*cx
		]);
		gl.uniformMatrix3fv(this.uCamRot, false, R);

		// Posición de la cámara orbitando alrededor del objetivo (target)
		const target = [0.0, 0.0, -2.5];
		const d = transZ; // distancia a la cámara
		const offset = [ sy*cx*d, -sx*d, cy*cx*d ];
		const camPos = new Float32Array([ target[0]+offset[0], target[1]+offset[1], target[2]+offset[2] ]);
		gl.uniform3fv(this.uCamPos, camPos);

		// Dibujar el quad del canvas: dibujamos con TRIANGLE_STRIP los vértices del triángulo
		gl.bindBuffer(gl.ARRAY_BUFFER, this.fullscreenBuffer);
		gl.vertexAttribPointer(this.aPos, 2, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(this.aPos);
		gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

		if (wasDepthEnabled) gl.enable(gl.DEPTH_TEST);
	}

	// Configura la dirección de la luz direccional (en espacio mundo)
	setLightDir( x, y, z )
	{
		this._lightdir = new Float32Array([x,y,z]);
		gl.useProgram( this.prog );
		gl.uniform3fv( this.uLightDir, this._lightdir );
		DrawScene();
	}

	// Configura el exponente de brillo (alpha) del modelo de Phong
	setShininess( alpha )
	{
		this._alpha = alpha;
		gl.useProgram( this.prog );
		gl.uniform1f( this.uAlpha, this._alpha );
		DrawScene();
	}
}
