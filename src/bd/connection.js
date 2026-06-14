// Importa el módulo mysql2 específicamente la versión que soporta Promises
// Esto permite usar async/await en lugar de callbacks para manejar las respuestas de la base de datos.
import mysql from 'mysql2/promise';

//Se define una constante pool que crea un grupo de conexiones automáticas.
//En lugar de una sola conexión fija el pool gestiona varias conexiones según la demanda.
const pool = mysql.createPool({
    //process.env.: permite establecer un enlace con el archivo .env
    // host: La dirección IP o dominio donde está alojado el servidor de MySQL.
    host: process.env.DB_HOST,
    // user: El nombre del usuario con permisos para acceder a esa base de datos.
    user: process.env.DB_USER,
    // password: La clave de acceso del usuario.
    password: process.env.DB_PASSWORD,
    // database: El nombre específico de la base de datos a la que te vas a conectar.
    database: process.env.DB_NAME,
    // port: El puerto de red por donde escucha MySQL.
    port: process.env.DB_PORT,

    // waitForConnections: Si está en true cuando todas las conexiones estén ocupadas, 
    // la siguiente petición esperará en cola en lugar de dar un error inmediato.
    waitForConnections: true,

    // connectionLimit: El número máximo de conexiones simultáneas que el pool puede abrir.
    // En este caso no habrá más de 10 conexiones abiertas al mismo tiempo.
    connectionLimit: 10,

    // queueLimit: Define cuántas peticiones pueden esperar en cola cuando el pool está lleno.
    // '0' significa que la cola es infinita no hay límite para las peticiones en espera.
    queueLimit: 0
})

// Exporta el objeto pool para que pueda ser utilizado en otros archivos del proyecto.
// Al usar export default se puede importar con cualquier nombre en otros módulos.
export default pool;