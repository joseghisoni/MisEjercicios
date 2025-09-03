
window.onload = function()
{
	/******* INICIALIZACIÓN DEL CANVAS *******/
	// Inicializamos el canvas y WebGL
	// Completar
	
	// Seteamos la resolución del viewport y lo ajustamos a la del canvas
	// Completar 

	// Inicializamos el color base (RGBA)
	// Completar
	
	/******* INICIALIZACIÓN DE LA ESCENA *******/
	// Inicialización de los buffers para los objetos de mi escena.
	// Este contenido podríamos modificarnlo en cualquier momento
	// sin necesidad de volver a crear los buffers.

	// Posiciones de los vértices
	// Completar


	// Colores para cada vértice
	// Completar

	// Creación y binding de los buffers
	// Completar
	
    /******* COMPILAMOS LOS SHADERS *******/
 	// Compilación del vertex shader y del fragment shader.
	// En caso de que quisieramos cambiar el código de los shaders en algún
	// punto de mi aplicación, deberíamos volver a compilarlos. 
	// Una aplicación puede tener varios shader y vincular cada uno a 
	// diferentes objetos de la escena. 


	// Vertex shader
	// Completar


	// Fragment shader
	// Completar



	// Creo mi "programa" con ambos shaders compilados
	// Completar


    /******* SETEAMOS LAS VARIABLES UNIFORMES  *******/
  	// Actualizamos las variables uniformes para los shaders. 
	// Antes de reenderizar la escena, es necesario setear las variables
	// uniformes. Estas variables las podemos actualizar todas las veces
	// que lo necesitemos. 

	// Completar

	
	
    /******* LINKEAMOS LOS BUFFERS DE LA ESCENA  *******/
	// Linkeamos los buffers que son necesarios para el rendering.
	// Antes de reenderizar, especificamos los buffers de vértices y 
	// de sus atributos. Es posible usar buffers diferentes para objetos
	// diferentes, cada uno con su propio set de atributos. 

	// Link atributo posición
	// Completar

	// Link atributo color
	// Completar

    /******* REENDERIZAMOS  *******/
	// Ahora que ya está todo seteado, renderizamos la escena. 
	// El primer paso es siempre limpiar la imagen. 
	// Cada vez que cambie la escena, tenemos que reenderizar nuevamente. 
	// Completar
}
