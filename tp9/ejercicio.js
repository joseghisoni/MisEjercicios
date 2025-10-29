// <============================================ EJERCICIOS ============================================>
// a) Implementar la función:
//
//      GetModelViewProjection( projectionMatrix, translationX, translationY, translationZ, rotationX, rotationY )
//
//    Si la implementación es correcta, podrán hacer rotar la caja correctamente (como en el video). IMPORTANTE: No
//    es recomendable avanzar con los ejercicios b) y c) si este no funciona correctamente. 
// b) Implementar los métodos:
//
//      setMesh( vertPos, texCoords )
//      swapYZ( swap )
//      draw( trans )
//
//    Si la implementación es correcta, podrán visualizar el objeto 3D que hayan cargado, asi como también intercambiar 
//    sus coordenadas yz. Para reenderizar cada fragmento, en vez de un color fijo, pueden retornar: 
//
//      gl_FragColor = vec4(1,0,gl_FragCoord.z*gl_FragCoord.z,1);
//
//    que pintará cada fragmento con un color proporcional a la distancia entre la cámara y el fragmento (como en el video).
//    IMPORTANTE: No es recomendable avanzar con el ejercicio c) si este no funciona correctamente. 
//
// c) Implementar los métodos:
//
//      setTexture( img )
//      showTexture( show )
//
//    Si la implementación es correcta, podrán visualizar el objeto 3D que hayan cargado y su textura.
//
// Notar que los shaders deberán ser modificados entre el ejercicio b) y el c) para incorporar las texturas.  
// <=====================================================================================================>



// Esta función recibe la matriz de proyección (ya calculada), una traslación y dos ángulos de rotación
// (en radianes). Cada una de las rotaciones se aplican sobre el eje x e y, respectivamente. La función
// debe retornar la combinación de las transformaciones 3D (rotación, traslación y proyección) en una matriz
// de 4x4, representada por un arreglo en formato column-major. El parámetro projectionMatrix también es 
// una matriz de 4x4 alamcenada como un arreglo en orden column-major. En el archivo project4.html ya está
// implementada la función MatrixMult, pueden reutilizarla. 
// El orden de las transformaciones es: rotacion en Y, rotacion en X, traslación.
//   Ayuda: matriz de rotación en X:
//
//      var rotX = [
//          1, 0, 0, 0,
//          0, cos(theta), sin(theta), 0,
//          0, -sin(theta), cos(theta), 0,
//          0, 0, 0, 1 ]; 
//	Ayuda: matriz de rotación en Y:
//
//      var rotY = [
//          cos(theta), 0, -sin(theta), 0,
//          0, 1, 0, 0,
//          sin(theta), 0, cos(theta), 0,
//          0, 0, 0, 1
//      ];
function GetModelViewProjection( projectionMatrix, translationX, translationY, translationZ, rotationX, rotationY )
{
	// [COMPLETAR] Modificar el código para formar la matriz de transformación.

	// Matriz de traslación
	var trans = [
		1, 0, 0, 0,
		0, 1, 0, 0,
		0, 0, 1, 0,
		translationX, translationY, translationZ, 1
	];

	var mvp = MatrixMult( projectionMatrix, trans );
	return mvp;
}

// [COMPLETAR] Completar la implementación de esta clase.
// Ayuda: ver la clase BoxDrawer y entender qué hace. 
class MeshDrawer
{
	// El constructor es donde nos encargamos de realizar las inicializaciones necesarias. 
	constructor()
	{
		// [COMPLETAR] inicializaciones

		// 1. Compilamos el programa de shaders
		
		// 2. Obtenemos los IDs de las variables uniformes en los shaders

		// 3. Obtenemos los IDs de los atributos de posición de los vértices en los shaders

		// 4. Obtenemos los IDs de los atributos de textura de los vértices en los shaders

		// 5. Creamos el buffer para los vertices de posición de la malla

		// 6. Creamos el buffer para las coordenadas de la textura

		// 7. Creamos la textura

	}
	
	// Esta función se llama cada vez que el usuario carga un nuevo archivo OBJ.
	// En los argumentos de esta función llegan un areglo con las posiciones 3D de los vértices
	// y un arreglo 2D con las coordenadas de textura. Todos los items en estos arreglos son del tipo float. 
	// Los vértices se componen de a tres elementos consecutivos en el arreglo vertexPos [x0,y0,z0,x1,y1,z1,..,xn,yn,zn]
	// De manera similar, las cooredenadas de textura se componen de a 2 elementos consecutivos y se 
	// asocian a cada vértice en orden. 
	setMesh( vertPos, texCoords )
	{
		this.numTriangles = vertPos.length / 3 / 3;
		// [COMPLETAR] Actualizar el contenido del buffer de vértices

		// 1. Binding y seteo del buffer de vértices de posiciones

		// 2. Binding y seteo del buffer de coordenadas de textura

	}
	
	// Esta función se llama cada vez que el usuario cambia el estado del checkbox 'Intercambiar Y-Z'
	// El argumento es un boleano que indica si el checkbox está tildado
	swapYZ( swap )
	{
		// [COMPLETAR] Setear variables uniformes en el vertex shader

		// ...
		
		// DrawScene();
	}
	
	// Esta función se llama para dibujar la malla de triángulos
	// El argumento es la matriz de transformación, la misma matriz que retorna GetModelViewProjection
	draw( trans )
	{
		// [COMPLETAR] Completar con lo necesario para dibujar la colección de triángulos en WebGL
		
		// 1. Seleccionamos el shader
		
		// *** TRANSFORMACION
		// 2. Setear matriz de transformacion


		// *** VERTICES
	    // 3.Binding de los buffers
		
		// 4. Habilitamos el atributo de posición de los vértices:
		// O sea, le decimos a la GPU cómo debe leer la data del buffer de posiciones
		// y lo activamos. 

		// *** TEXTURAS
		// 5.Binding del buffer de coordenadas de texturas

		// 6. Habilitamos el atributo de coordenadas de texturas

		// 7.  Dibujamos
		// gl.clear( gl.COLOR_BUFFER_BIT );
		// gl.drawArrays( gl.TRIANGLES, 0, this.numTriangles * 3 );
	}
	
	// Esta función se llama para setear una textura sobre la malla
	// El argumento es un componente <img> de html que contiene la textura. 
	// Ayuda: ver los slides.
	setTexture( img )
	{
		// [COMPLETAR] Binding de la textura y cargo la textura

		// Mipmap

		// [COMPLETAR] Ahora que la textura ha sido cargada, es necesario que la 
		// pasemos al fragment shader mediante variables uniformes, para que pueda ser usada. 

		// Mando la textura al shader a través del Texture Unit 0

	}
	
	// Esta función se llama cada vez que el usuario cambia el estado del checkbox 'Mostrar textura'
	// El argumento es un boleano que indica si el checkbox está tildado
	showTexture( show )
	{
		// [COMPLETAR] Setear variables uniformes en el fragment shader
		
		// ...
		
		// DrawScene();
	}
}

// Vertex Shader
// Si declaras las variables pero no las usas es como que no las declaraste y va a tirar error. Siempre va punto y coma al finalizar la sentencia. 
// Las constantes en punto flotante necesitan ser expresadas como x.y, incluso si son enteros: ejemplo, para 4 escribimos 4.0
// [COMPLETAR] Modificar el shader agregando texturas y swap YZ
var meshVS = `
	attribute vec3 pos;
	uniform mat4 mvp;
	void main()
	{ 
		gl_Position = mvp * vec4(pos,1);
	}
`;
// [COMPLETAR] Modificar el shader agregando texturas y useTex
// Fragment Shader
var meshFS = `
	precision mediump float;
	void main()
	{		
		gl_FragColor = vec4(1,0,gl_FragCoord.z*gl_FragCoord.z,1);
	}
`;
