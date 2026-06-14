import pool from "../bd/connection.js";

// Obtener plataformas activas
export const obtenerPlataformas = async (req, res) => {
    const [row] = await pool.query('SELECT id_plataforma, nombre_plataforma, estado_plataforma FROM plataforma WHERE estado_plataforma = true');
    res.json({ total: row.length, plataformas: row });
}

// Crear nueva plataforma
export const crearPlataforma = async (req, res) => {
    const { nombre_plataforma } = req.body;

    if (!nombre_plataforma) {
        return res.status(400).json({ error: "El nombre de la plataforma es obligatorio" });
    }

    const [resultado] = await pool.query(
        "INSERT INTO plataforma(nombre_plataforma) VALUES (?)",
        [nombre_plataforma]
    );
    res.status(201).json({ mensaje: "Plataforma creada exitosamente", id: resultado.insertId });
}

// Actualizar plataforma
export const actualizarPlataforma = async (req, res) => {
    const { id } = req.params;
    const { nombre_plataforma, estado_plataforma } = req.body;

    if (!nombre_plataforma) {
        return res.status(400).json({ error: "El nombre de la plataforma es obligatorio" });
    }
    if (estado_plataforma === undefined) {
        return res.status(400).json({ error: "El campo estado_plataforma es obligatorio" });
    }

    await pool.query(
        "UPDATE plataforma SET nombre_plataforma=?, estado_plataforma=? WHERE id_plataforma=?",
        [nombre_plataforma, estado_plataforma, id]
    );
    res.json({ mensaje: "Plataforma actualizada exitosamente", id });
}

// Desactivar plataforma (Borrado lógico)
export const eliminarPlataforma = async (req, res) => {
    const { id } = req.params;
    const [resultado] = await pool.query(
        "UPDATE plataforma SET estado_plataforma = false WHERE id_plataforma = ?",
        [id]
    );
    if (resultado.affectedRows === 0) {
        return res.status(404).json({ error: "Plataforma no encontrada" });
    }
    res.json({ mensaje: "Plataforma desactivada exitosamente", id });
}

// Activar plataforma
export const activarPlataforma = async (req, res) => {
    const { id } = req.params;
    const [resultado] = await pool.query("UPDATE plataforma SET estado_plataforma = true WHERE id_plataforma = ?", [id]);
    if (resultado.affectedRows === 0) return res.status(404).json({ error: "Plataforma no encontrada" });
    res.json({ mensaje: "Plataforma activada exitosamente", id });
}

// Obtener plataformas desactivadas
export const obtenerPlataformasDesactivadas = async (req, res) => {
    const [row] = await pool.query('SELECT id_plataforma, nombre_plataforma, estado_plataforma FROM plataforma WHERE estado_plataforma = false');
    res.json({ total: row.length, plataformasDesactivadas: row });
}
