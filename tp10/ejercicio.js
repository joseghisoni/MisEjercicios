// <============================================ EJERCICIOS ============================================>
// a) Implementar la función:
//
//      GetModelViewMatrix( translationX, translationY, translationZ, rotationX, rotationY )
//
//    Si la implementación es correcta, podrán hacer rotar la caja correctamente (como en el video). Notar 
//    que esta función no es exactamente la misma que implementaron en el TP4, ya que no recibe por parámetro
//    la matriz de proyección. Es decir, deberá retornar solo la transformación antes de la proyección model-view (MV)
//    Es necesario completar esta implementación para que funcione el control de la luz en la interfaz. 
//    IMPORTANTE: No es recomendable avanzar con los ejercicios b) y c) si este no funciona correctamente. 
//
// b) Implementar los métodos:
//
//      setMesh( vertPos, texCoords, normals )
//      swapYZ( swap )
//      draw( matrixMVP, matrixMV, matrixNormal )
//
//    Si la implementación es correcta, podrán visualizar el objeto 3D que hayan cargado, asi como también intercambiar 
//    sus coordenadas yz. Notar que es necesario pasar las normales como atributo al VertexShader. 
//    La función draw recibe ahora 3 matrices en column-major: 
//
//       * model-view-projection (MVP de 4x4)
//       * model-view (MV de 4x4)
//       * normal transformation (MV_3x3)
//
//    Estas últimas dos matrices adicionales deben ser utilizadas para transformar las posiciones y las normales del 
//    espacio objeto al esapcio cámara. 
//
// c) Implementar los métodos:
//
//      setTexture( img )
//      showTexture( show )
//
//    Si la implementación es correcta, podrán visualizar el objeto 3D que hayan cargado y su textura.
//    Notar que los shaders deberán ser modificados entre el ejercicio b) y el c) para incorporar las texturas.
//  
// d) Implementar los métodos:
//
//      setLightDir(x,y,z)
//      setShininess(alpha)
//    
//    Estas funciones se llaman cada vez que se modifican los parámetros del modelo de iluminación en la 
//    interface. No es necesario transformar la dirección de la luz (x,y,z), ya viene en espacio cámara.
//
// Otras aclaraciones: 
//
//      * Utilizaremos una sola fuente de luz direccional en toda la escena
//      * La intensidad I para el modelo de iluminación debe ser seteada como blanca (1.0,1.0,1.0,1.0) en RGB
//      * Es opcional incorporar la componente ambiental (Ka) del modelo de iluminación
//      * Los coeficientes Kd y Ks correspondientes a las componentes difusa y especular del modelo 
//        deben ser seteados con el color blanco. En caso de que se active el uso de texturas, la 
//        componente difusa (Kd) será reemplazada por el valor de textura. 
//        
// <=====================================================================================================>

// Esta función recibe la matriz de proyección (ya calculada), una 
// traslación y dos ángulos de rotación (en radianes). Cada una de 
// las rotaciones se aplican sobre el eje x e y, respectivamente. 
// La función debe retornar la combinación de las transformaciones 
// 3D (rotación, traslación y proyección) en una matriz de 4x4, 
// representada por un arreglo en formato column-major. 

function GetModelViewMatrix( translationX, translationY, translationZ, rotationX, rotationY )
{
	// [COMPLETAR] Modificar el código para formar la matriz de transformación.
	var cosX = Math.cos( rotationX );
	var sinX = Math.sin( rotationX );
	var cosY = Math.cos( rotationY );
	var sinY = Math.sin( rotationY );

	// Matriz de rotación en X
	var rotX = [
		1,    0,     0, 0,
		0, cosX, sinX, 0,
		0,-sinX, cosX, 0,
		0,    0,     0, 1
	];
	// Matriz de rotación en Y
	var rotY = [
		cosY, 0,-sinY, 0,
		   0, 1,    0, 0,
		sinY, 0, cosY, 0,
		   0, 0,    0, 1
	];

	// Matriz de traslación
	var trans = [
		1, 0, 0, 0,
		0, 1, 0, 0,
		0, 0, 1, 0,
		translationX, translationY, translationZ, 1
	];

	var rotXY = MatrixMult( rotY, rotX );

	trans = MatrixMult(trans, rotXY)

	var mv = trans;
	return mv;
}

// [COMPLETAR] Completar la implementación de esta clase.
class MeshDrawer
{
	// El constructor es donde nos encargamos de realizar las inicializaciones necesarias. 
	constructor()
	{
		// 1. Compilamos el programa de shaders
		this.shaderProgram = InitShaderProgram( meshVS, meshFS );
		
		// 2. Obtenemos los IDs de las variables uniformes en los shaders
		this.mvp = gl.getUniformLocation( this.shaderProgram, 'mvp' );

		this.mv = gl.getUniformLocation( this.shaderProgram, 'mv' );

		this.mn = gl.getUniformLocation( this.shaderProgram, 'mn' );

		// 3. Obtenemos los IDs de los atributos de posición de los vértices en los shaders
		this.vertPos = gl.getAttribLocation( this.shaderProgram, 'pos' );

		// 4. Obtenemos los IDs de los atributos de textura de los vértices en los shaders
        this.texCoord = gl.getAttribLocation( this.shaderProgram, 'texCoord' );
       // 4.b Obtenemos el ID del atributo de normales
       this.normCoord = gl.getAttribLocation( this.shaderProgram, 'normal' );
        
        // 5. Creamos el buffer para los vertices de posición de la malla
        this.vertexBuffer = gl.createBuffer();
        
        // 6. Creamos el buffer para las coordenadas de la textura
        this.texCoordBuffer = gl.createBuffer();
        
        this.normalBuffer = gl.createBuffer();

		// 7. Creamos la textura
		this.texture = gl.createTexture();

		// 8. Configuramos el sampler de textura
		this.sampler = gl.getUniformLocation(this.shaderProgram, 'texGPU');
		gl.useProgram(this.shaderProgram);
		gl.uniform1i(this.sampler, 0); // Unidad de textura 0
	}
	
	// Esta función se llama cada vez que el usuario carga un nuevo
	// archivo OBJ. En los argumentos de esta función llegan un areglo
	// con las posiciones 3D de los vértices, un arreglo 2D con las
	// coordenadas de textura y las normales correspondientes a cada 
	// vértice. Todos los items en estos arreglos son del tipo float. 
	// Los vértices y normales se componen de a tres elementos 
	// consecutivos en el arreglo vertPos [x0,y0,z0,x1,y1,z1,..] y 
	// normals [n0,n0,n0,n1,n1,n1,...]. De manera similar, las 
	// cooredenadas de textura se componen de a 2 elementos 
	// consecutivos y se  asocian a cada vértice en orden. 
	setMesh( vertPos, texCoords, normals )
	{
		this.numTriangles = vertPos.length / 3 / 3;
		// [COMPLETAR] Actualizar el contenido del buffer de vértices

		// 1. Binding y seteo del buffer de vértices de posiciones
		gl.bindBuffer( gl.ARRAY_BUFFER, this.vertexBuffer );
		gl.bufferData( gl.ARRAY_BUFFER, new Float32Array( vertPos ), gl.STATIC_DRAW );

		// 2. Binding y seteo del buffer de coordenadas de textura
		gl.bindBuffer( gl.ARRAY_BUFFER, this.texCoordBuffer );
		gl.bufferData( gl.ARRAY_BUFFER, new Float32Array( texCoords ), gl.STATIC_DRAW );

		// 3 Binding y seteo del buffer de normales
		gl.bindBuffer( gl.ARRAY_BUFFER, this.normalBuffer );
		gl.bufferData( gl.ARRAY_BUFFER, new Float32Array( normals ), gl.STATIC_DRAW );

	}
	
	// Esta función se llama cada vez que el usuario cambia el estado del checkbox 'Intercambiar Y-Z'
	// El argumento es un boleano que indica si el checkbox está tildado
	swapYZ( swap )
	{
		// [COMPLETAR] Setear variables uniformes en el vertex shader

		gl.useProgram( this.shaderProgram );

		gl.uniform1i( gl.getUniformLocation( this.shaderProgram, 'swap' ), swap ? 1 : 0 );
		
		DrawScene();
	}
	
	// Esta función se llama para dibujar la malla de triángulos
	// El argumento es la matriz model-view-projection (matrixMVP),
	// la matriz model-view (matrixMV) que es retornada por 
	// GetModelViewProjection y la matriz de transformación de las 
	// normales (matrixNormal) que es la inversa transpuesta de matrixMV
    draw( matrixMVP, matrixMV, matrixNormal )
    {
        // Selecciono el shader
        gl.useProgram( this.shaderProgram );

        // Subo matrices (si existen las ubicaciones)
        if ( this.mvp ) gl.uniformMatrix4fv( this.mvp, false, new Float32Array( matrixMVP ) );
        if ( this.mv )  gl.uniformMatrix4fv( this.mv,  false, new Float32Array( matrixMV ) );
        if ( this.mn !== null && this.mn !== undefined ) gl.uniformMatrix3fv( this.mn, false, new Float32Array( matrixNormal ) );

        // Vértices
        gl.bindBuffer( gl.ARRAY_BUFFER, this.vertexBuffer );
        if ( this.vertPos >= 0 ) {
            gl.enableVertexAttribArray( this.vertPos );
            gl.vertexAttribPointer( this.vertPos, 3, gl.FLOAT, false, 0, 0 );
        }

        // Coordenadas de textura
        gl.bindBuffer( gl.ARRAY_BUFFER, this.texCoordBuffer );
        if ( this.texCoord >= 0 ) {
            gl.enableVertexAttribArray( this.texCoord );
            gl.vertexAttribPointer( this.texCoord, 2, gl.FLOAT, false, 0, 0 );
        }

        // Normales
        gl.bindBuffer( gl.ARRAY_BUFFER, this.normalBuffer );
        if ( this.normCoord >= 0 ) {
            gl.enableVertexAttribArray( this.normCoord );
            gl.vertexAttribPointer( this.normCoord, 3, gl.FLOAT, false, 0, 0 );
        }

        // Aseguro que la textura esté en la unidad 0 si existe
        if ( this.texture ) {
            gl.activeTexture( gl.TEXTURE0 );
            gl.bindTexture( gl.TEXTURE_2D, this.texture );
        }

        // Dibujar
        gl.drawArrays( gl.TRIANGLES, 0, this.numTriangles * 3 );

        // Limpiar / evitar fugas de estado (opcional pero recomendable)
        if ( this.vertPos >= 0 ) gl.disableVertexAttribArray( this.vertPos );
        if ( this.texCoord >= 0 ) gl.disableVertexAttribArray( this.texCoord );
        if ( this.normCoord >= 0 ) gl.disableVertexAttribArray( this.normCoord );

        // Desvincular buffer por higiene
        gl.bindBuffer( gl.ARRAY_BUFFER, null );
    }
	
	// Esta función se llama para setear una textura sobre la malla
	// El argumento es un componente <img> de html que contiene la textura. 
	setTexture( img )
	{
		// [COMPLETAR] Binding de la textura y cargo la textura
		gl.bindTexture( gl.TEXTURE_2D, this.texture );

		// Cargo la imagen en la textura
		gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img );

		// Mipmap

		// [COMPLETAR] Ahora que la textura ha sido cargada, es necesario que la 
		// pasemos al fragment shader mediante variables uniformes, para que pueda ser usada. 
		gl.generateMipmap( gl.TEXTURE_2D );

		// Mando la textura al shader a través del Texture Unit 0
		gl.activeTexture( gl.TEXTURE0 );
		gl.bindTexture( gl.TEXTURE_2D, this.texture );

	}
		
        // Esta función se llama cada vez que el usuario cambia el estado del checkbox 'Mostrar textura'
	// El argumento es un boleano que indica si el checkbox está tildado
	showTexture( show )
	{
		// [COMPLETAR] Setear variables uniformes en el fragment shader
		gl.useProgram( this.shaderProgram );
		if ( show ){
			gl.uniform1i( gl.getUniformLocation( this.shaderProgram, 'useTex' ), 1 );
		} else {
			gl.uniform1i( gl.getUniformLocation( this.shaderProgram, 'useTex' ), 0 );
		}
		
		DrawScene();
	}
	
	// Este método se llama al actualizar la dirección de la luz desde la interfaz
	setLightDir( x, y, z )
	{		
		// [COMPLETAR] Setear variables uniformes en el fragment shader para especificar la dirección de la luz
		gl.useProgram( this.shaderProgram );

		gl.uniform3f( gl.getUniformLocation( this.shaderProgram, 'lightDir' ), x, y, z );
	}
		
	// Este método se llama al actualizar el brillo del material 
	setShininess( shininess )
	{		
		// [COMPLETAR] Setear variables uniformes en el fragment shader para especificar el brillo.
		gl.useProgram( this.shaderProgram );

		gl.uniform1f( gl.getUniformLocation( this.shaderProgram, 'shininess' ), shininess );
	}
}



// [COMPLETAR] Calcular iluminación utilizando Blinn-Phong.

// Recordar que: 
// Si declarás las variables pero no las usás, es como que no las declaraste
// y va a tirar error. Siempre va punto y coma al finalizar la sentencia. 
// Las constantes en punto flotante necesitan ser expresadas como x.y, 
// incluso si son enteros: ejemplo, para 4 escribimos 4.0.

// Vertex Shader
var meshVS = `
    attribute vec3 pos;
    attribute vec3 normal;
    attribute vec2 texCoord;

    uniform mat4 mvp;
    uniform mat4 mv;
    uniform mat3 mn;
    uniform int swap;

    varying vec2 texCoordV;
    varying vec3 normalV;    // normal en espacio cámara
    varying vec3 posCamV;    // posición en espacio cámara

    void main()
    {
        vec3 p = pos;
        vec3 n = normal;

        if ( swap == 1 ){
            // intercambiar Y <-> Z en posición y normal antes de transformar
            p = vec3(pos.x, pos.z, pos.y);
            n = vec3(normal.x, normal.z, normal.y);
        }

        vec4 pCam = mv * vec4(p, 1.0);
        posCamV = pCam.xyz;
        normalV = normalize( mn * n );

        gl_Position = mvp * vec4(p, 1.0);
        texCoordV = texCoord;
    }
`;

// Fragment Shader
// Algunas funciones útiles para escribir este shader:
// Dot product: https://thebookofshaders.com/glossary/?search=dot
// Normalize:   https://thebookofshaders.com/glossary/?search=normalize
// Pow:         https://thebookofshaders.com/glossary/?search=pow

var meshFS = `
    precision mediump float;

    varying vec2 texCoordV;
    varying vec3 normalV;
    varying vec3 posCamV;

    uniform sampler2D texGPU;
    uniform int useTex;
    uniform vec3 lightDir;    // en espacio cámara
    uniform float shininess;

    void main()
    {
        // Normal, luz y vista en espacio cámara
        vec3 N = normalize(normalV);
        vec3 L = normalize(lightDir);
        vec3 V = normalize(-posCamV); // cámara en origen => vector hacia la cámara
        vec3 H = normalize(L + V);

        // Material / iluminación
        vec3 Ka = vec3(0.1);      // ambient (opcional)
        vec3 Ks = vec3(1.0);      // specular color (blanco)
        vec3 Kd = vec3(1.0);      // diffuse por defecto blanco

        if ( useTex == 1 ){
            Kd = texture2D(texGPU, texCoordV).rgb;
        }

        float diff = max(dot(N, L), 0.0);
        float spec = 0.0;
        if (diff > 0.0) {
            spec = pow( max(dot(N, H), 0.0), max(shininess, 1.0) );
        }

        vec3 color = Ka * Kd + Kd * diff + Ks * spec;
        gl_FragColor = vec4(color,1.0);
	}
`;