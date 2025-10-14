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
        this.prog = InitShaderProgram( catmullRomVS, catmullRomFS );
        
        // [TODO] Obtener ubicaciones de las variables uniformes
        this.uMVP = gl.getUniformLocation(this.prog, 'mvp');

        // [TODO] Obtener ubicaciones para los 4 puntos de control utilizados en cada segmento
       
        
        // Obtenemos la ubicación de los atributos de los vértices
		// en este caso, tendremos que enviar los valores de t0, t1, t2 y t3
        this.uP0 = gl.getUniformLocation(this.prog, 'p0');
        this.uP1 = gl.getUniformLocation(this.prog, 'p1');
        this.uP2 = gl.getUniformLocation(this.prog, 'p2');
        this.uP3 = gl.getUniformLocation(this.prog, 'p3');
        this.uT0 = gl.getUniformLocation(this.prog, 't0');
        this.uT1 = gl.getUniformLocation(this.prog, 't1');
        this.uT2 = gl.getUniformLocation(this.prog, 't2');
        this.uT3 = gl.getUniformLocation(this.prog, 't3');

        
        // Atributo de los vértices: tParam
        this.aT = gl.getAttribLocation(this.prog, 'tParam');

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
        var trans = [ 2/width,0,0,0,  0,-2/height,0,0, 0,0,1,0, -1,1,0,1 ];
        gl.useProgram(this.prog);
        gl.uniformMatrix4fv(this.uMVP, false, trans);
    }
    updatePoints( pt )
    {
        // Convertir atributos SVG a lista de puntos {x,y}
        this.controlPoints = [];
        for (let i = 0; i < pt.length; ++i) {
            const x = parseFloat(pt[i].getAttribute('cx'));
            const y = parseFloat(pt[i].getAttribute('cy'));
            this.controlPoints.push({x:x, y:y});
        }

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
        if (this.buffers && this.buffers.length > 0) {
            for (let b of this.buffers) { try { gl.deleteBuffer(b); } catch(e) {} }
        }
        this.buffers = [];

        
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
        gl.useProgram(this.prog);

        
        // [TODO] Dibujar cada segmento:
        // Tomamos 4 puntos consecutivos de paddedPoints
        // Calculamos los valores de t0, t1, t2 y t3
        // Seteamos los valores de los puntos y de t0..t3 en los uniformes
        // Linkeamos el buffer y seteamos el atributo
        for (let seg = 0; seg < this.segCount; seg++) {
            // Get the 4 points for this segment
            const p0 = this.paddedPoints[seg+0];
            const p1 = this.paddedPoints[seg+1];
            const p2 = this.paddedPoints[seg+2];
            const p3 = this.paddedPoints[seg+3];

            // Knots (centrípeta, alpha=0.5)
            let t0 = 0.0;
            let t1 = this.calculateKnot(t0, p0, p1);
            let t2 = this.calculateKnot(t1, p1, p2);
            let t3 = this.calculateKnot(t2, p2, p3);

            // Set uniforms
            gl.uniform2fv(this.uP0, new Float32Array([p0.x, p0.y]));
            gl.uniform2fv(this.uP1, new Float32Array([p1.x, p1.y]));
            gl.uniform2fv(this.uP2, new Float32Array([p2.x, p2.y]));
            gl.uniform2fv(this.uP3, new Float32Array([p3.x, p3.y]));
            gl.uniform1f(this.uT0, t0);
            gl.uniform1f(this.uT1, t1);
            gl.uniform1f(this.uT2, t2);
            gl.uniform1f(this.uT3, t3);

            // Bind buffer with sampled t in [0,1] and draw
            gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers[seg]);
            gl.vertexAttribPointer(this.aT, 1, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(this.aT);
            gl.drawArrays(gl.LINE_STRIP, 0, this.stepsPerSegment);

           
        }
    }
}

// [TODO] Completar los shaders para Catmull-Rom
var catmullRomVS = `
   attribute float tParam;
   uniform mat4 mvp;
   uniform vec2 p0;
   uniform vec2 p1;
   uniform vec2 p2;
   uniform vec2 p3;
   uniform float t0;
   uniform float t1;
   uniform float t2;
   uniform float t3;
   void main()
   {
       // Map normalized parameter to knot interval [t1, t2]
       float t = mix(t1, t2, tParam);

       vec2 A1 = ((t1 - t)/(t1 - t0)) * p0 + ((t - t0)/(t1 - t0)) * p1;
       vec2 A2 = ((t2 - t)/(t2 - t1)) * p1 + ((t - t1)/(t2 - t1)) * p2;
       vec2 A3 = ((t3 - t)/(t3 - t2)) * p2 + ((t - t2)/(t3 - t2)) * p3;

       vec2 B1 = ((t2 - t)/(t2 - t0)) * A1 + ((t - t0)/(t2 - t0)) * A2;
       vec2 B2 = ((t3 - t)/(t3 - t1)) * A2 + ((t - t1)/(t3 - t1)) * A3;

       vec2 C  = ((t2 - t)/(t2 - t1)) * B1 + ((t - t1)/(t2 - t1)) * B2;
       gl_Position = mvp * vec4(C, 0.0, 1.0);
   }

`;

// Fragment Shader 
var catmullRomFS = `
precision mediump float;
  void main()
  {
    gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
  }
`;
