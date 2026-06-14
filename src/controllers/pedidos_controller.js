import pool from "../bd/connection.js";


//POST REALIZAR PEDIDO
export const realizarPedido = async(req,res) => {
    const{carrito} = req.body;

    if (!carrito || !Array.isArray(carrito) || carrito.length === 0) {
        return res.status(400).json({ error: "El carrito está vacío o es inválido" });
    }

    if (!req.usuario || !req.usuario.id) {
        return res.status(401).json({ error: "Usuario no autenticado correctamente" });
    }

    const usuario_id = req.usuario.id;
    let total_pedido = 0;
    const conexion = await pool.getConnection();

    try {
        await conexion.beginTransaction();
        const itemsProcesados = [];

        // 1. Validar productos y recuperar IDs técnicos (plataforma_id, categoria_id) de la BD
        // Esto soluciona el error "plataforma_id cannot be null" de forma definitiva
        for (const item of carrito) {
            const [rows] = await conexion.query(
                "SELECT id_vjuego, nombre_vjuego, plataforma_id, categoria_id, precio_vjuego, stock_vjuego FROM videojuego WHERE id_vjuego = ?",
                [item.id_vjuego]
            );

            if (rows.length === 0) {
                return res.status(404).json({ error: `Producto con ID ${item.id_vjuego} no encontrado` });
            }

            const dbProd = rows[0];
            
            // Lógica Digital: Máximo 1 y verificar si ya lo posee
            if (item.tipo === 'digital') {
                const [propiedad] = await conexion.query(
                    "SELECT 1 FROM detalle_pedido WHERE usuario_id = ? AND vjuego_id = ? AND ipo_vjuego = 'digital'",
                    [usuario_id, item.id_vjuego]
                );
                if (propiedad.length > 0) {
                    throw new Error(`Ya posees la licencia digital de ${dbProd.nombre_vjuego}`);
                }
                if (item.cantidad > 1) throw new Error("Solo puedes adquirir una licencia digital por juego.");
            }

            // Validamos que haya suficiente stock antes de continuar
            if (item.tipo === 'fisico' && dbProd.stock_vjuego < item.cantidad) {
                throw new Error(`Stock insuficiente para el videojuego con ID ${item.id_vjuego}`);
            }

            // Usamos el precio de la BD por seguridad y sumamos al total
            total_pedido += (dbProd.precio_vjuego * item.cantidad);
            
            // Guardamos el item con sus IDs reales para la inserción posterior
            itemsProcesados.push({ ...item, ...dbProd });
        }

        // 2. Insertar cabecera del pedido con el total calculado
        const [resPedido] = await conexion.query(
            "INSERT INTO pedidos (usuario_id, total_pedido, estado_pedido) VALUES (?, ?, 'pagado')",
            [usuario_id, total_pedido]
        );
        const id_pedido = resPedido.insertId;

        // 3. Insertar detalles usando los datos verificados de la base de datos
        for (const item of itemsProcesados) {
            await conexion.query(
                "INSERT INTO detalle_pedido (usuario_id, pedido_id, vjuego_id, plataforma_id, categoria_id, precio_unitario, cantidad, ipo_vjuego) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                [usuario_id, id_pedido, item.id_vjuego, item.plataforma_id, item.categoria_id, item.precio_vjuego, item.cantidad, item.tipo || 'fisico']
            );

            // 4. DESCONTAR STOCK REAL SOLO SI ES FÍSICO
            if ((item.tipo || 'fisico') === 'fisico') {
                const [resStock] = await conexion.query(
                    "UPDATE videojuego SET stock_vjuego = stock_vjuego - ? WHERE id_vjuego = ? AND stock_vjuego >= ?",
                    [item.cantidad, item.id_vjuego, item.cantidad]
                );

                if (resStock.affectedRows === 0) {
                    throw new Error(`No se pudo actualizar el stock del videojuego ID ${item.id_vjuego}.`);
                }
            }
        }

        await conexion.commit();
        res.status(201).json({ mensaje: "Pedido creado exitosamente", id_pedido });

    } catch (error) {
        if (conexion) await conexion.rollback();
        console.error("Error técnico en realizarPedido:", error.message);
        const status = error.statusCode || 500;
        res.status(status).json({ error: "Error al procesar el pedido", details: error.message });
    } finally {
        if (conexion) conexion.release();
    }
}


//GET OBTENER PEDIDOS DE UN USUARIO
export const obtenerPedidos = async(req,res) => {
    try {
        const limit = parseInt(req.query.limit) || 100;
        const page = parseInt(req.query.page) || 1;
        const offset = (page - 1 ) *limit;
      
        const [pedidos] = await pool.query(
            `SELECT p.id_pedido, p.usuario_id, u.nombre_usuario, p.total_pedido, p.estado_pedido, p.creacion_pedido AS fecha 
             FROM pedidos p 
             JOIN usuarios u ON p.usuario_id = u.id_usuario 
             ORDER BY p.creacion_pedido DESC 
             LIMIT ? OFFSET ?`,
            [limit, offset]
        );
        res.json({
            pagina_actual: page,
            limite: limit,
            data : pedidos
        });
    } catch (error) {
        res.status(500).json({ error: "Error al obtener pedidos" });
    }
} 


// Editar pedido 
export const editarPedido = async (req, res) => {
    const { id } = req.params;
    const { total_pedido, estado_pedido } = req.body;

    const [resultado] = await pool.query(
        "UPDATE pedidos SET total_pedido = COALESCE(?, total_pedido), estado_pedido = COALESCE(?, estado_pedido) WHERE id_pedido = ?",
        [total_pedido, estado_pedido, id]
    );

    if (resultado.affectedRows === 0) {
        return res.status(404).json({ error: "Pedido no encontrado" });
    }
    res.json({ mensaje: "Pedido actualizado exitosamente", id_pedido: id });
}

// Eliminar pedido 
export const eliminarPedido = async (req, res) => {
    const { id } = req.params;
    
    const [resultado] = await pool.query(
        "UPDATE pedidos SET estado_pedido = 'cancelado' WHERE id_pedido = ?",
        [id]
    );

    if (resultado.affectedRows === 0) {
        return res.status(404).json({ error: "Pedido no encontrado" });
    }
    res.json({ mensaje: "Pedido cancelado exitosamente", id_pedido: id });
}


export const actualizarEstadoPedido = async (req, res) => {
    const { id } = req.params;
    const { estado_pedido } = req.body;

    const estadosValidos = ['pediente', 'pagado', 'enviado', 'cancelado'];

    if (!estado_pedido || !estadosValidos.includes(estado_pedido)) {
        return res.status(400).json({ error: "Estado de pedido inválido o no proporcionado" });
    }

    const [resultado] = await pool.query(
        "UPDATE pedidos SET estado_pedido = ? WHERE id_pedido = ?",
        [estado_pedido, id]
    );

    if (resultado.affectedRows === 0) {
        return res.status(404).json({ error: "Pedido no encontrado" });
    }

    res.json({ mensaje: "Estado del pedido actualizado exitosamente", id_pedido: id, nuevo_estado: estado_pedido });
}
