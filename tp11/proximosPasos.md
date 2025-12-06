# Extensiones de Ray Tracing

Hasta ahora tenemos un Ray Tracer básico que puede renderizar esferas con iluminación puntual y sombras.
Lo que hace es: de cada pixel, lanza un rayo con origen en la cámara y dirección hacia el pixel, calcula 
la intersección con las esferas de la escena, determina el color en el punto de intersección considerando 
la iluminación y las sombras, y finalmente asigna ese color al pixel.

## Whitted-Style Ray tracing. 

Hasta ahora el camino que hace el rayo es: ojo/camara --> objeto --> luz. La luz es reflejado una única vez
en el objeto. Ahora, pensemos en que pasa si el objeto refleja ese rayo hacia otro objeto. Es decir:
un rayo que va desde la cámara, golpea un objeto, y luego se refleja hacia otro objeto, y esto se repite. Finalmente,
sumamos todas las contribuciones de luz que llegan al ojo. Además, vamos a considerar que ahora podemos tener objetos transparentes,
por lo que el rayo puede refractarse a través de ellos.



### Transparencia 

Para modelar la transparencia, necesitamos considerar que cuando un rayo golpea un objeto transparente, consideramos que un objeto es transparente si tiene un coeficiente de transparencia $k_t > 0$. El coeficiente $k_t$ puede ser interpretado como la fracción de luz que pasa a través del objeto. Un valor de $k_t = 0$ significa que el objeto es completamente opaco, mientras que $k_t = 1$ significa que es completamente transparente.

Primero, consideremos un modelo simple. Asumimos que el rayo sigue la misma dirección al atravesar el objeto (sin refracción real). Más adelante, podemos implementar la ley de Snell para calcular la dirección del rayo refractado basado en los índices de refracción de los materiales involucrados.

Una vez que llega el rayo, calculamos el color local en el punto de intersección como antes. Luego, dividimos la contribución del color en dos partes: la parte opaca y la parte transparente:
$$
color = (1 - k_t) * color\_local + k_t * color\_transmitido
$$
donde $color\_local$ es el color calculado en el punto de intersección, y $color\_transmitido$ es el color que se obtiene al continuar el rayo a través del objeto transparente.

En el fragment shader, implementamos un for loop que itera hasta un máximo de profundidades de transparencia (por ejemplo, 2 o 3). En cada iteración, calculamos la intersección del rayo con la escena, obtenemos el coeficiente de transparencia del objeto intersectado, y actualizamos el color acumulado y la dirección del rayo según lo descrito anteriormente. El pseudo código sería algo así:

```
para cada profundidad de transparencia:
    calcular intersección del rayo con la escena
    si no hay intersección:
        romper el loop
    obtener coeficiente de transparencia k_t del objeto intersectado
    calcular color_local en el punto de intersección
    acumular color: color += (1 - k_t) * color_local
    actualizar rayo para continuar a través del objeto transparente
```

Si se implementa esto, notaremos que los objetos transparentes se ven brillantes. Pensando un poco mejor, cuando la luz atraviesa un objeto transparente, parte de la luz se pierde debido a la absorción y dispersión dentro del material. Para modelar esto, podemos introducir un factor de atenuación `throughput` que reduce la intensidad de la luz que pasa a través del objeto transparente.

El pseudo código modificado sería:

```
inicializar throughput = 1.0
para cada profundidad de transparencia:
    calcular intersección del rayo con la escena
    si no hay intersección:
        romper el loop
    obtener coeficiente de transparencia k_t del objeto intersectado
    calcular color_local en el punto de intersección
    acumular color: color += throughput * (1 - k_t) * color_local
    actualizar throughput: throughput *= k_t
    actualizar rayo para continuar a través del objeto transparente
```

### Refracción (Ley de Snell)

En el modelo de transparencia anterior asumimos que el rayo “atraviesa” el objeto sin cambiar de dirección. Eso es una buena aproximación para arrancar, pero físicamente no es correcto: cuando la luz pasa de un medio a otro (aire → vidrio, aire → agua, vidrio → aire, etc.) **cambia de dirección**. A ese cambio le llamamos **refracción**, y está gobernado por la **Ley de Snell**.

La ley de Snell dice:

$$
n_1 \sin(\theta_1) = n_2 \sin(\theta_2)
$$

donde:

* $\eta_1$: índice de refracción del medio de donde viene el rayo (por ejemplo, aire ≈ 1.0)
* $\eta_2$: índice de refracción del medio al que entra el rayo (por ejemplo, vidrio ≈ 1.5)
* $\theta_1$: ángulo entre el rayo incidente y la normal a la superficie
* $\theta_2$: ángulo entre el rayo refractado y la normal

Cada material tendrá un índice de refracción `ior` (index of refraction). Ejemplos típicos:

* Aire: $\eta \approx 1.0$
* Agua: $\eta \approx 1.33$
* Vidrio: $\eta \approx 1.5$ – $1.7$
* Diamante: $\eta \approx 2.4$

En el Ray Tracer, esto significa que cuando un rayo golpea un objeto transparente, **no sólo seguimos el rayo “derecho”**, sino que calculamos una nueva dirección refractada en función de ($\eta_1$, $\eta_2$) y la normal.

Sea $r$ la dirección del rayo incidente (normalizada) y $n$ la normal en el punto de intersección (también normalizada), $r^\prime$ la dirección del rayo refractado que puede descomponerse en sus componentes paralela $r^\prime_{||}$ y perpendicular $r^\prime_{\perp}$ a la normal. Cada una se calcula así:
$$
r^\prime_{\perp} = \frac{\eta_1}{\eta_2} (r + \cos(\theta_1) n)
$$

$$
r^\prime_{||} = -\sqrt{1 - ||r^\prime_{||}||^2} n
$$

Luego, la dirección del rayo refractado es:
$$
r^\prime = r^\prime_{||} + r^\prime_{\perp}
$$

Ahora, lo único que resta es determinar si el rayo está entrando o saliendo del objeto, para saber cuáles índices de refracción usar ($eta_1$, $eta_2$). Recordemos que $cos(\theta_1) = -r \cdot n$ (el ángulo entre el rayo y la normal). Si $cos(\theta_1) > 0$, el rayo está entrando al objeto, y usamos ($eta_1 = 1.0$, $eta_2 = ior$). Si $cos(\theta_1) < 0$, el rayo está saliendo del objeto, y usamos ($eta_1 = ior$, $eta_2 = 1.0$).

El pseudo código para manejar la refracción en el Ray Tracer sería:

```
para cada profundidad de refracción:
    calcular intersección del rayo con la escena
    si no hay intersección:
        romper el loop
    obtener índice de refracción ior del objeto intersectado
    calcular color_local en el punto de intersección
    acumular color: color += throughput * color_local
    determinar si el rayo está entrando o saliendo del objeto
    calcular nueva dirección refractada usando la ley de Snell
    actualizar throughput: throughput *= k_t
    actualizar rayo para continuar con la nueva dirección refractada
```

### Reflexión [Ejercicio]

Ahora consideremos la reflexión, modelando un objeto como el espejo. Cuando un rayo golpea una superficie reflectante, parte de la luz se refleja en la misma dirección que el rayo entrante.
