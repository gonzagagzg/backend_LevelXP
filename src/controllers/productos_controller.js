import pool from "../bd/connection.js";

//Get
export const obtenerProductos = async(req,res) => {
    const [rows] = await pool.query(
        'SELECT v.id_vjuego, v.nombre_vjuego, v.descripcion_vjuego, v.precio_vjuego, v.stock_vjuego, v.opinioc_vjuego, v.categoria_id, v.plataforma_id, ' +
        'c.nombre_categoria AS categoria, p.nombre_plataforma AS plataforma, v.estado_vjuego, v.imagen_vjuego, v.video_vjuego ' +
        'FROM videojuego v ' +
        'INNER JOIN categorias c ON v.categoria_id = c.id_categoria ' +
        'INNER JOIN plataforma p ON v.plataforma_id = p.id_plataforma ' +
        'WHERE v.estado_vjuego = true'
    );
    res.json({ total: rows.length, videojuegos: rows });
}
export const obtenerProductos2 = async(req,res) => {
    const [rows] = await pool.query(
        'SELECT v.id_vjuego, v.nombre_vjuego, v.descripcion_vjuego, v.precio_vjuego, v.stock_vjuego, v.opinioc_vjuego, v.categoria_id, v.plataforma_id, ' +
        'c.nombre_categoria AS categoria, p.nombre_plataforma AS plataforma, v.estado_vjuego, v.imagen_vjuego, v.video_vjuego  ' +
        'FROM videojuego v ' +
        'INNER JOIN categorias c ON v.categoria_id = c.id_categoria ' +
        'INNER JOIN plataforma p ON v.plataforma_id = p.id_plataforma '
    );
    res.json({ total: rows.length, videojuegos: rows });
}
export const obtenerProductobyId = async(req,res) => {
    const {id} = req.params;
    const [rows] = await pool.query(
        'SELECT v.id_vjuego, v.nombre_vjuego, v.descripcion_vjuego, v.precio_vjuego, v.stock_vjuego, ' +
        'v.opinioc_vjuego, v.categoria_id, v.plataforma_id, c.nombre_categoria AS categoria, ' +
        'p.nombre_plataforma AS plataforma, v.estado_vjuego, v.imagen_vjuego, v.video_vjuego  ' +
        'FROM videojuego v ' +
        'INNER JOIN categorias c ON v.categoria_id = c.id_categoria ' +
        'INNER JOIN plataforma p ON v.plataforma_id = p.id_plataforma ' +
        'WHERE v.id_vjuego = ?',
        [id]
    );
    
    if(rows.length === 0){
        return res.status(404).json({ error: "Videojuego no encontrado" });
    }
    res.json(rows[0]);
}

//Post 
export const crearProducto = async(req,res) => {
    const { categoria_id, plataforma_id, nombre_vjuego, descripcion_vjuego, precio_vjuego, stock_vjuego, opinioc_vjuego, imagen_vjuego, video_vjuego } = req.body;
    if (!categoria_id || !plataforma_id || !nombre_vjuego || !precio_vjuego) {
        return res.status(400).json({ error: "Nombre, precio, plataforma y categoría son obligatorios" });
    }
    const [resultado] = await pool.query(
        "INSERT INTO videojuego(categoria_id, plataforma_id, nombre_vjuego, descripcion_vjuego, precio_vjuego, stock_vjuego, opinioc_vjuego, imagen_vjuego, video_vjuego) VALUES (?,?,?,?,?,?,?,?,?)",
        [categoria_id, plataforma_id, nombre_vjuego, descripcion_vjuego, precio_vjuego, stock_vjuego || 0, opinioc_vjuego, imagen_vjuego, video_vjuego]
    );
    res.status(201).json({ mensaje: "Videojuego creado exitosamente", id: resultado.insertId });
}

//Put
export const actualizarProducto = async(req,res) => {
    const { id } = req.params;
    const { categoria_id, plataforma_id, nombre_vjuego, descripcion_vjuego, precio_vjuego, stock_vjuego, opinioc_vjuego, imagen_vjuego, video_vjuego, estado_vjuego } = req.body;
    if (!categoria_id || !plataforma_id || !nombre_vjuego || !precio_vjuego) {
        return res.status(400).json({ error: "Nombre, precio, plataforma y categoría son obligatorios" });
    }
    const [resultado] = await pool.query(
        "UPDATE videojuego SET categoria_id=?, plataforma_id=?, nombre_vjuego=?, descripcion_vjuego=?, precio_vjuego=?, stock_vjuego=?, opinioc_vjuego=?, imagen_vjuego=?, video_vjuego=?, estado_vjuego=COALESCE(?, estado_vjuego) WHERE id_vjuego=?",
        [categoria_id, plataforma_id, nombre_vjuego, descripcion_vjuego, precio_vjuego, stock_vjuego, opinioc_vjuego, imagen_vjuego, video_vjuego, estado_vjuego ?? null, id]
    );
    res.json({ mensaje: "Videojuego actualizado exitosamente", id });
}
// Patch 
export const actualizarStock = async(req, res) => {
    const { id } = req.params;
    const { stock_vjuego } = req.body;

    if (stock_vjuego === undefined || stock_vjuego < 0) {
        return res.status(400).json({ error: "El stock_vjuego es obligatorio y no puede ser negativo" });
    }

    const [resultado] = await pool.query(
        "UPDATE videojuego SET stock_vjuego = ? WHERE id_vjuego = ?",
        [stock_vjuego, id]
    );

    if (resultado.affectedRows === 0) {
        return res.status(404).json({ error: "Videojuego no encontrado" });
    }
    res.json({ mensaje: "Stock actualizado exitosamente", id, stock_vjuego });
}
//Delete
export const eliminarProducto = async(req,res) =>{
    const { id } = req.params;
    if (!id) {
        return res.status(400).json({ error: "El id es obligatorio" });
    }
    await pool.query(
        "UPDATE videojuego SET estado_vjuego = false WHERE id_vjuego = ?",
        [id]
    );
    res.json({ mensaje: "Videojuego desactivado exitosamente", id });
}

// Activar producto revertir borrado lógico
export const activarProducto = async(req, res) => {
    const { id } = req.params;
    const [resultado] = await pool.query(
        "UPDATE videojuego SET estado_vjuego = true WHERE id_vjuego = ?",
        [id]
    );
    if (resultado.affectedRows === 0) {
        return res.status(404).json({ error: "Videojuego no encontrado" });
    }
    res.json({ mensaje: "Videojuego activado exitosamente", id });
}

// Obtener productos desactivados (borrado lógico)
export const obtenerProductosDesactivados = async(req,res) => {
    const [rows] = await pool.query(
        'SELECT v.id_vjuego, v.nombre_vjuego, v.descripcion_vjuego, v.precio_vjuego, v.stock_vjuego, v.opinioc_vjuego, v.categoria_id, v.plataforma_id, ' +
        'c.nombre_categoria AS categoria, p.nombre_plataforma AS plataforma, v.estado_vjuego, v.imagen_vjuego, v.video_vjuego ' +
        'FROM videojuego v ' +
        'INNER JOIN categorias c ON v.categoria_id = c.id_categoria ' +
        'INNER JOIN plataforma p ON v.plataforma_id = p.id_plataforma ' +
        'WHERE v.estado_vjuego = false'
    );
    res.json({ total: rows.length, videojuegosDesactivados: rows });
}