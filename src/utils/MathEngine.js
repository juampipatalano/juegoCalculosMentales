
//genera número aleatorio entre min y max, ambos incluidos
const getRandomInt = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

//genera opciones falsas creíbles para el modo "multiple choice"
const generarOpciones = (correcta) => {
    const opciones = new Set([correcta]);

    while (opciones.size < 4) {
        //genera un desvío de hasta +/- 10 respecto a la respuesta correcta
        const desvio = getRandomInt(-10, 10);
        if (desvio !== 0 && (correcta + desvio) >= 0) {
            opciones.add(correcta + desvio);
        }
    }
    //convertimos el Set a un array y lo mezclamos para que la respuesta correcta no esté siempre en la misma posición
    return Array.from(opciones).sort(() => Math.random() - 0.5);
}



/**genera una operación matemática según la dificultad
*@param {string} dificultad //- 'FACIl', 'MEDIO' o 'DIFICIL'
*@returns {object} { operacionTexto, resultadoCorrecto, opciones }
*/

export const generarOperacion = (dificultad) => {
    let num1, num2, operador, resultadoCorrecto;

    const operadoresFacil = ['+'];
    const operadoresMedio = ['+', '-', '*'];
    const operadoresDificil = ['+', '-', '*', '/'];

    let opElegido;

    switch (dificultad) {
        case 'FACIL':
            //sumas simples
            opElegido = operadoresFacil[0];
            num1 = getRandomInt(1, 20);
            num2 = getRandomInt(1, 20);
            break;
        
        case 'MEDIO':
            //sumas, restas y multiplicaciones con números más grandes
            opElegido = operadoresMedio[getRandomInt(0,2)];
            if (opElegido === '*') {
                num1 = getRandomInt(2, 20);
                num2 = getRandomInt(2, 20);
            } else {
                num1 = getRandomInt(10, 50);
                num2 = getRandomInt(1, 50);
            }
            break;

        case 'DIFICIL':
            //incluye divisiones exactas y multiplicaciones más grandes
            opElegido = operadoresDificil[getRandomInt(0,3)];
            if (opElegido === '*') {
                num1 = getRandomInt(5,15);
                num2 = getRandomInt(5,15);
            } else if (opElegido === '/') {
                //para asegurar que la división sea exacta y sin decimales
                num2 = getRandomInt(2, 12);
                resultadoCorrecto = getRandomInt(2, 20);
                num1 = num2 * resultadoCorrecto;
            } else {
                num1 = getRandomInt(20, 100);
                num2= getRandomInt(10,100);
            }

    }

    if (opElegido === '-' && num1 < num2) {
        //para evitar resultados negativos en restas
        const temp = num1;
        num1 = num2;
        num2 = temp;
    }

    
    //calculamos el resultado real si no fue precalculado (como en la división)
    if (opElegido !== '/') {
        if (opElegido === '+') {
            resultadoCorrecto = num1 + num2;
        } else if (opElegido === '-') {
            resultadoCorrecto = num1 - num2;
        } else{
            resultadoCorrecto = num1 * num2;
        }
    }

    //formatemaos para mostrar en pantalla
    const operacionTexto = `${num1} ${opElegido} ${num2}`;

    //para el modo True/False, a veces mandamos la correcta y a veces una falsa
    const esVerdadero = Math.random() > 0.5;
    const resultadoPropuestoTF = esVerdadero ? resultadoCorrecto : resultadoCorrecto + getRandomInt(1, 5) * (Math.random() > 0.5 ? 1 : -1); //desvío aleatorio para la opción falsa

    return {
        operacionTexto,
        resultadoCorrecto,
        opciones: generarOpciones(resultadoCorrecto), //Array de 4 opciones para multiple choice
        tfPropuesto: resultadoPropuestoTF, //Número a mostrar en modo True/False
        tfEsCorrecto: esVerdadero //Booleano para evaluar el True/false
    }

}

/**
 * Calcula el puntaje de una jugada en base a las reglas del juego
 * @param {boolean} esCorrecta - Si el usuario acertó
 * @param {number} tiempoTardado - Milisegundos que tardó en responder
 * @param {number} tiempoMaximo - Tiempo límite para esta pregunta
 * @returns {number} Puntaje a sumar (o restar)
 */

export const calcularPuntaje = (esCorrecta, tiempoTardado, tiempoMaximo) => {
  // Si no respondió a tiempo (tiempoTardado >= tiempoMaximo)
  if (tiempoTardado >= tiempoMaximo) {
    return -50; 
  }

  if (!esCorrecta) {
    return -30;
  }

  // Si es correcta, evaluamos la velocidad (75% del tiempo asignado)
  const limiteRapido = tiempoMaximo * 0.75;
  
  if (tiempoTardado <= limiteRapido) {
    return 100; // Respuesta correcta rápida
  } else {
    return 70;  // Respuesta correcta dentro del tiempo pero lenta
  }
};