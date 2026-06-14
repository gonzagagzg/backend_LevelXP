import pool from "../bd/connection.js";

// GET - Obtener todos los soportes activos
export const obtenerSoportes = async (req, res) => {
    try {
        const [rows] = await pool.query(
            `SELECT s.*, u.nombre_usuario 
             FROM soporte s 
             JOIN usuarios u ON s.usuario_id = u.id_usuario 
             ORDER BY s.fecha_soporte DESC`
        );
        res.json({
            total: rows.length,
            soportes: rows
        });
    } catch (error) {
        res.status(500).json({ error: "Error al obtener la lista de soportes", details: error.message });
    }
};

// GET - Obtener soporte específico por ID
export const obtenerSoportePorId = async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await pool.query(
            `SELECT s.*, u.nombre_usuario 
             FROM soporte s 
             JOIN usuarios u ON s.usuario_id = u.id_usuario 
             WHERE s.id_soporte = ?`,
            [id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: "Soporte no encontrado" });
        }
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: "Error al obtener el soporte", details: error.message });
    }
};

// GET - Obtener soportes de un usuario específico
export const obtenerSoportesPorUsuario = async (req, res) => {
    const { usuario_id } = req.params;
    try {
        const [rows] = await pool.query(
            "SELECT * FROM soporte WHERE usuario_id = ? AND estado_soporte = true ORDER BY fecha_soporte DESC",
            [usuario_id]
        );
        res.json({
            total: rows.length,
            usuario_id,
            soportes: rows
        });
    } catch (error) {
        res.status(500).json({ error: "Error al obtener los soportes del usuario", details: error.message });
    }
};

// POST - Crear un nuevo soporte
export const crearSoporte = async (req, res) => {
    const { tipo_soporte, info_soporte } = req.body;

    if (!req.usuario || !req.usuario.id) {
        return res.status(401).json({ error: "Debes iniciar sesión para enviar un ticket de soporte" });
    }

    if (!tipo_soporte || !info_soporte) {
        return res.status(400).json({ error: "Todos los campos son obligatorios (tipo_soporte, info_soporte)" });
    }

    try {
        const [resultado] = await pool.query(
            "INSERT INTO soporte (usuario_id, tipo_soporte, info_soporte) VALUES (?, ?, ?)",
            [req.usuario.id, tipo_soporte, info_soporte]
        );
        res.status(201).json({ mensaje: "Tu ticket ha sido enviado al Gremio. Pronto nos contactaremos contigo.", id_soporte: resultado.insertId });
    } catch (error) {
        res.status(500).json({ error: "Error al crear el soporte", details: error.message });
    }
};

// PATCH - Editar un soporte (Actualización parcial)
export const actualizarSoporte = async (req, res) => {
    const { id } = req.params;
    const { tipo_soporte, info_soporte, estado_soporte } = req.body;

    try {
        const [resultado] = await pool.query(
            `UPDATE soporte SET 
                tipo_soporte = COALESCE(?, tipo_soporte), 
                info_soporte = COALESCE(?, info_soporte), 
                estado_soporte = COALESCE(?, estado_soporte) 
             WHERE id_soporte = ?`,
            [tipo_soporte, info_soporte, estado_soporte, id]
        );

        if (resultado.affectedRows === 0) {
            return res.status(404).json({ error: "Soporte no encontrado" });
        }
        res.json({ mensaje: "Soporte actualizado exitosamente", id_soporte: id });
    } catch (error) {
        res.status(500).json({ error: "Error al actualizar el soporte", details: error.message });
    }
};

// DELETE - Soft Delete (Desactivar soporte)
export const eliminarSoporte = async (req, res) => {
    const { id } = req.params;
    try {
        const [resultado] = await pool.query(
            "UPDATE soporte SET estado_soporte = false WHERE id_soporte = ?",
            [id]
        );

        if (resultado.affectedRows === 0) {
            return res.status(404).json({ error: "Soporte no encontrado" });
        }
        res.json({ mensaje: "Soporte desactivado exitosamente", id_soporte: id });
    } catch (error) {
        res.status(500).json({ error: "Error al realizar el borrado lógico", details: error.message });
    }
};