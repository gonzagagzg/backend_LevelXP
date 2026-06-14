// Esto lee tu archivo .env y pone las variables en memoria.
import 'dotenv/config'

//Importa el objeto pool que se configuro en tu archivo connection.js.
//Es el objeto que tiene los permisos y la dirección de la base de datos.
import pool from '../src/bd/connection.js'

//Define una función asíncrona o async para poder usar await.
async function probarConexion(){
    try {
        //Imprime el mensaje inicial para que se sepa que el código empezó a ejecutarse.
        console.log("Intento de conexión a MySQL");

        //Intenta pedir una conexión al Pool.
        //El await hace que el código espere aquí hasta que la base de datos responda.
        const connection = await pool.getConnection();

        //Si la línea anterior funcionó se ejecuta este mensaje.
        console.log("Conexión exitosa a MySQL");

        //Termina el proceso manualmente con código 0 que significa que todo salió bien
        process.exit(0);
        
    } catch (error) {
        //Si algo falló el código salta directamente aquí.
        console.log("Error de conexión a MySQL")
        
        //Muestra el mensaje técnico exacto de por qué falló 
        console.log(error.message);

        //Termina el proceso con código 1 que significa que hubo un error
        process.exit(1);
    }
}

//Ejecuta la función definida arriba.
probarConexion();