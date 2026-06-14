import pool from "../bd/connection.js";

// Obtener todos los detalles de un pedido específico (con nombres de juegos y plataformas)
export const obtenerDetallesPorPedido = async (req, res) => {
    const { pedido_id } = req.params;

    try {
        const [detalles] = await pool.query(
            `SELECT dp.*, v.nombre_vjuego, v.imagen_vjuego, p.nombre_plataforma, c.nombre_categoria 
             FROM detalle_pedido dp
             INNER JOIN videojuego v ON dp.vjuego_id = v.id_vjuego
             INNER JOIN plataforma p ON dp.plataforma_id = p.id_plataforma
             INNER JOIN categorias c ON dp.categoria_id = c.id_categoria
             WHERE dp.pedido_id = ?`,
            [pedido_id]
        );

        if (detalles.length === 0) {
            return res.status(404).json({ error: "No se encontraron detalles para este pedido" });
        }

        res.json({ total_items: detalles.length, detalles });
    } catch (error) {
        res.status(500).json({ error: "Error al obtener los detalles del pedido", message: error.message });
    }
};

// Insertar un nuevo detalle de pedido (usado generalmente dentro de un bucle al finalizar compra)
export const crearDetallePedido = async (req, res) => {
    const { pedido_id, vjuego_id, plataforma_id, categoria_id, precio_unitario, cantidad, ipo_vjuego } = req.body;
    const usuario_id = req.usuario.id; // Obtenido del token

    if (!pedido_id || !vjuego_id || !plataforma_id || !categoria_id || !precio_unitario || !cantidad) {
        return res.status(400).json({ error: "Faltan campos obligatorios para el detalle del pedido" });
    }

    try {
        const [resultado] = await pool.query(
            `INSERT INTO detalle_pedido 
            (usuario_id, pedido_id, vjuego_id, plataforma_id, categoria_id, precio_unitario, cantidad, ipo_vjuego) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [usuario_id, pedido_id, vjuego_id, plataforma_id, categoria_id, precio_unitario, cantidad, ipo_vjuego || 'fisico']
        );

        res.status(201).json({ 
            mensaje: "Detalle de pedido registrado", 
            id_dpedido: resultado.insertId 
        });
    } catch (error) {
        res.status(500).json({ error: "Error al registrar el detalle", message: error.message });
    }
};

// Obtener el historial detallado de compras de un usuario
export const obtenerMisDetallesCompras = async (req, res) => {
    const usuario_id = req.usuario.id;

    try {
        const [rows] = await pool.query(
            `SELECT dp.*, v.nombre_vjuego, v.imagen_vjuego, v.descripcion_vjuego, v.opinioc_vjuego, p.nombre_plataforma as plataforma, c.nombre_categoria as categoria
             FROM detalle_pedido dp
             INNER JOIN videojuego v ON dp.vjuego_id = v.id_vjuego
             INNER JOIN plataforma p ON dp.plataforma_id = p.id_plataforma
             INNER JOIN categorias c ON dp.categoria_id = c.id_categoria
             WHERE dp.usuario_id = ? 
             ORDER BY dp.creacion_dpedido DESC`,
            [usuario_id]
        );
        res.json({ total: rows.length, historial_detallado: rows });
    } catch (error) {
        res.status(500).json({ error: "Error al obtener el historial", message: error.message });
    }
};

export const obtenerMisDetallesCompras2 = async (req, res) => {
    const usuario_id = req.usuario.id;

    try {
        const [rows] = await pool.query(
            `SELECT 
                p.id_pedido AS numero_compra, 
                v.nombre_vjuego, 
                plat.nombre_plataforma AS plataforma, 
                cat.nombre_categoria AS categoria, 
                v.precio_vjuego AS precio, 
                dp.ipo_vjuego AS tipo_juego, 
                dp.cantidad, 
                p.creacion_pedido AS fecha_compra, 
                dp.precio_unitario
             FROM detalle_pedido dp
             INNER JOIN pedidos p ON dp.pedido_id = p.id_pedido
             INNER JOIN videojuego v ON dp.vjuego_id = v.id_vjuego
             INNER JOIN plataforma plat ON dp.plataforma_id = plat.id_plataforma
             INNER JOIN categorias cat ON dp.categoria_id = cat.id_categoria
             WHERE dp.usuario_id = ?
             ORDER BY p.creacion_pedido DESC`,
            [usuario_id]
        );
        res.json({ total: rows.length, historial: rows });
    } catch (error) {
        res.status(500).json({ error: "Error al obtener el historial", message: error.message });
    }
}
