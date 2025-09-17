// Pueden usar como referencia la clase de Curvas de Bezier del tp5
// solución acá: https://gist.github.com/noehsueh/2d2885f2955468dfd4f324e7de90ea12
class CurveDrawer 
{
    // Esta clase debe implementar el dibujo de curvas Catmull-Rom
    // dibuja cada segmento de la curva entre cuatro puntos de control
    // usando la parametrización centrípeta (α = 0.5)
    constructor()
    {
        // [TODO] Crear el programa WebGL con los shaders para Catmull-Rom
        
        
        // [TODO] Obtener ubicaciones de las variables uniformes

        // [TODO] Obtener ubicaciones para los 4 puntos de control utilizados en cada segmento
       
        
        // Obtenemos la ubicación de los atributos de los vértices
		// en este caso, tendremos que enviar los valores de t0, t1, t2 y t3
        
        
        // Atributo de los vértices: tParam
        
        // Número de pasos por segmento
        this.stepsPerSegment = 100;

        // Inicializar arreglos vacíos
        this.controlPoints = [];
        this.paddedPoints = [];
        this.buffers = [];
        this.segCount = 0;
    }
    
    setViewport( width, height )
    {
        // [TODO] Completar
       
    }
    updatePoints( pt )
    {
        // Convertir atributos SVG a lista de puntos {x,y}
        
        
        // Vamos a repetir el primer y último punto para "extender" la curva hasta los extremos
        this.paddedPoints = [];
        if (this.controlPoints.length >= 2) {
            const first = this.controlPoints[0];
            const last  = this.controlPoints[this.controlPoints.length - 1];
            this.paddedPoints.push({x:first.x, y:first.y});
            for (let i = 0; i < this.controlPoints.length; i++) {
                this.paddedPoints.push(this.controlPoints[i]);
            }
            this.paddedPoints.push({x:last.x, y:last.y});
        } else {
            // Si hay menos de 2 puntos, no podemos formar segmentos, pero igual copiamos los puntos
            this.paddedPoints = this.controlPoints.slice();
        }

        // [TODO] Limpiar buffers antiguos si existen
        
        
        // Creo buffers por segmento
        this.segCount = Math.max(0, this.paddedPoints.length - 3);
        if (this.segCount > 0) {
            for (let seg = 0; seg < this.segCount; seg++) {
                let tValues = [];
                for (let i = 0; i < this.stepsPerSegment; i++) {
                    tValues.push(i / (this.stepsPerSegment - 1));
                }
                
                let buffer = gl.createBuffer();
                gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
                gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(tValues), gl.STATIC_DRAW);
                this.buffers.push(buffer);
            }
        }
    }
    
    // Calcula el valor de ti para el punto pj dado pi y el valor previo ti
    calculateKnot(ti, pi, pj)
    {
        let dx = pj.x - pi.x;
        let dy = pj.y - pi.y;
        let dist = Math.sqrt(dx * dx + dy * dy);
        // Usamos α = 0.5 para parametrización centrípeta
        // Para evitar divisiones por cero, agregamos un pequeño epsilon
        const eps = 1e-1;
        return ti + Math.max(Math.sqrt(dist), eps);
    }
    
    draw()
    {
        
        if (this.segCount <= 0) return;
        // [TODO] completar
       
        
        // [TODO] Dibujar cada segmento:
        // Tomamos 4 puntos consecutivos de paddedPoints
        // Calculamos los valores de t0, t1, t2 y t3
        // Seteamos los valores de los puntos y de t0..t3 en los uniformes
        // Linkeamos el buffer y seteamos el atributo
        for (let seg = 0; seg < this.segCount; seg++) {
            // Get the 4 points for this segment
           
        }
    }
}

// [TODO] Completar los shaders para Catmull-Rom
var catmullRomVS = `
   
`;

// Fragment Shader 
var catmullRomFS = `
  
`;
