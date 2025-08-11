// La imagen que tienen que modificar viene en el parámetro image y contiene inicialmente los datos originales
// es objeto del tipo ImageData ( más info acá https://mzl.la/3rETTC6  )
// Factor indica la cantidad de intensidades permitidas (sin contar el 0)

const { version } = require("react");

function get_index(image, x, y) {
    var red = (y * image.width + x) * 4;
    var green = red + 1;
    var blue = red + 2;
    var alpha = red + 3;
    return [red , green, blue, alpha];
}

function find_closest_pallete_color(pixel, factor, image) {
    var red = image.data[pixel[0]];
    var green = image.data[pixel[1]];
    var blue = image.data[pixel[2]];

    var step = Math.floor(255 / (factor));
    
    var closest_red = Math.round(red / step) * step;
    var closest_green = Math.round(green / step) * step; 
    var closest_blue = Math.round(blue / step) * step;

    return [closest_red, closest_green, closest_blue, image.data[pixel[3]]];
}

function dither(image, factor, algorithm)
{
    for (let i = 1; i < image.width - 1; i++) {
        for (let j = 0; j < image.height - 1; j++) {
            var old_pixel = get_index(image, i, j);

            var new_pixel = find_closest_pallete_color(old_pixel, factor, image);

            //La transparencia no se modifica asi que el ultimo termino de la suma va a ser 0
            let errores_canales = [image.data[old_pixel[0]]- new_pixel[0], image.data[old_pixel[1]] - new_pixel[1], image.data[old_pixel[2]] - new_pixel[2]];

           
            //ACTUALIZO LA IMAGEN
            image.data[old_pixel[0]] = new_pixel[0];
            image.data[old_pixel[1]] = new_pixel[1];
            image.data[old_pixel[2]] = new_pixel[2];

            if (algorithm === "floyd-steinberg"){
                //CONSIGO LOS INDICES EN IMAGE DE LOS PIXELES ADECUADOS
                var right_pixel = get_index(image, i + 1, j);
                var down_right_pixel = get_index(image, i + 1, j + 1);
                var down_pixel = get_index(image, i, j + 1);
                var down_left_pixel = get_index(image, i - 1, j + 1)

                
                // ACTUALIZO LOS PIXELES VECINOS CON LOS ERRORES DEL CANAL
                for(let k = 0; k < 3; k++){
                    image.data[right_pixel[k]] =  image.data[right_pixel[k]] + errores_canales[k] * (7/16)
                    image.data[down_left_pixel[k]] =  image.data[down_left_pixel[k]] + errores_canales[k] * (3/16)
                    image.data[down_pixel[k]] =  image.data[down_pixel[k]] + errores_canales[k] * (5/16)
                    image.data[down_right_pixel[k]] =  image.data[down_right_pixel[k]] + errores_canales[k] * (1/16)
                }
            }
            else if (algorithm == "jarvis-judice"){

                if( i == 1 || i == image.width - 2 || j == image.height - 2){
                    continue
                }
                var right_pixel = get_index(image, i + 1, j);
                var two_right_pixel = get_index(image, i + 2, j)

                var down_two_right_pixel = get_index(image, i + 2, j + 1)
                var down_right_pixel = get_index(image, i + 1, j + 1);
                var down_pixel = get_index(image, i, j + 1);
                var down_left_pixel = get_index(image, i - 1, j + 1)
                var down_two_left_pixel = get_index(image, i - 2, j + 1)

                var two_down_two_right_pixel = get_index(image, i + 2, j + 2)
                var two_down_right_pixel = get_index(image, i + 1, j + 2)
                var two_down_pixel = get_index(image, i, j + 2)
                var two_down_left_pixel = get_index(image, i - 1, j + 2)
                var two_down_two_left_pixel = get_index(image, i - 2, j + 2)

                
                // ACTUALIZO LOS PIXELES VECINOS CON LOS ERRORES DEL CANAL
                for(let k = 0; k < 3; k++){
                    image.data[right_pixel[k]] =  image.data[right_pixel[k]] + errores_canales[k] * (7/48)
                    image.data[two_right_pixel[k]] =  image.data[two_right_pixel[k]] + errores_canales[k] * (5/48)

                    image.data[down_two_left_pixel[k]] = image.data[down_two_left_pixel[k]] + errores_canales[k] * (3/48)
                    image.data[down_left_pixel[k]] =  image.data[down_left_pixel[k]] + errores_canales[k] * (5/48)
                    image.data[down_pixel[k]] =  image.data[down_pixel[k]] + errores_canales[k] * (7/48)
                    image.data[down_right_pixel[k]] =  image.data[down_right_pixel[k]] + errores_canales[k] * (5/48)
                    image.data[down_two_right_pixel[k]] = image.data[down_two_right_pixel[k]] + errores_canales[k] * (3/48)
                    
                    image.data[two_down_two_left_pixel[k]] = image.data[two_down_two_left_pixel[k]] + errores_canales[k] * (1/48)
                    image.data[two_down_left_pixel[k]] =  image.data[two_down_left_pixel[k]] + errores_canales[k] * (3/48)
                    image.data[two_down_pixel[k]] =  image.data[two_down_pixel[k]] + errores_canales[k] * (5/48)
                    image.data[two_down_right_pixel[k]] =  image.data[two_down_right_pixel[k]] + errores_canales[k] * (3/48)
                    image.data[two_down_two_right_pixel[k]] = image.data[two_down_two_right_pixel[k]] + errores_canales[k] * (1/48)
                }

            }
        }

    }
}

// Imágenes a restar (imageA y imageB) y el retorno en result
function substraction(imageA,imageB,result) 
{
    for (let i = 0; i < result.data.length; i++){
        if ((i + 1) % 4 != 0){
            result.data[i] = Math.abs(imageA.data[i] - imageB.data[i]);
        }
    }  
}
