import pool from "../bd/connection.js";
import bcrypt from 'bcryptjs';

export const obtenerUsuarios = async (req, res) => {
    try {
        const [rows] = await pool.query(
            `SELECT id_usuario, nombre_usuario, email_usuario, 
                    fecha_nacimiento_usuario, pais_usuario, rol_usuario, 
                    creacion_usuario, estado_usuario, foto_usuario 
             FROM usuarios 
             ORDER BY creacion_usuario DESC`
        );

        res.json({
            total: rows.length,
            usuarios: rows
        });
    } catch (error) {
        res.status(500).json({ error: "Error al obtener la lista de usuarios", message: error.message });
    }
};

export const eliminarUsuario = async (req, res) => {
    const { id } = req.params;
    const [resultado] = await pool.query(
        "UPDATE usuarios SET estado_usuario = false WHERE id_usuario = ?",
        [id]
    );
    if (resultado.affectedRows === 0) {
        return res.status(404).json({ error: "Usuario no encontrado" });
    }
    res.json({ mensaje: "Usuario desactivado exitosamente", id });
};

export const activarUsuario = async (req, res) => {
    const { id } = req.params;
    const [resultado] = await pool.query(
        "UPDATE usuarios SET estado_usuario = true WHERE id_usuario = ?",
        [id]
    );
    if (resultado.affectedRows === 0) {
        return res.status(404).json({ error: "Usuario no encontrado" });
    }
    res.json({ mensaje: "Usuario activado exitosamente", id });
};

export const subirFotoPerfil = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No se ha seleccionado ninguna imagen." });
        }
        const fotoUrl = `/uploads/user/${req.usuario.nombre_usuario}/${req.file.filename}`;

        // Actualizamos el campo foto_usuario en la base de datos
        const [resultado] = await pool.query(
            "UPDATE usuarios SET foto_usuario = ? WHERE id_usuario = ?",
            [fotoUrl, req.usuario.id]
        );

        res.json({ 
            mensaje: "Foto de perfil actualizada correctamente",
            path: fotoUrl
        });
    } catch (error) {
        console.error("Error en subirFotoPerfil:", error);
        res.status(500).json({ error: "Error interno al procesar la imagen." });
    }
};

export const actualizarEmail = async (req, res) => {
    const { nuevo_email, password_confirmacion } = req.body;
    const usuario_id = req.usuario.id;

    try {
        // 1. Verificar contraseña
        const [rows] = await pool.query("SELECT password_usuario FROM usuarios WHERE id_usuario = ?", [usuario_id]);
        const passwordValido = await bcrypt.compare(password_confirmacion, rows[0].password_usuario);
        if (!passwordValido) return res.status(401).json({ error: "La contraseña es incorrecta" });

        // 2. Verificar disponibilidad del nuevo email
        const [existe] = await pool.query("SELECT id_usuario FROM usuarios WHERE email_usuario = ? AND id_usuario != ?", [nuevo_email, usuario_id]);
        if (existe.length > 0) return res.status(409).json({ error: "Este correo ya está registrado por otro miembro" });

        // 3. Actualizar
        await pool.query("UPDATE usuarios SET email_usuario = ? WHERE id_usuario = ?", [nuevo_email, usuario_id]);
        res.json({ mensaje: "Correo electrónico actualizado con éxito" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al actualizar el correo" });
    }
};

export const actualizarNombre = async (req, res) => {
    const { nuevo_nombre, password_confirmacion } = req.body;
    const usuario_id = req.usuario.id;

    try {
        // Verificar contraseña
        const [rows] = await pool.query("SELECT password_usuario FROM usuarios WHERE id_usuario = ?", [usuario_id]);
        const passwordValido = await bcrypt.compare(password_confirmacion, rows[0].password_usuario);
        if (!passwordValido) return res.status(401).json({ error: "La contraseña es incorrecta" });

        //Verificar disponibilidad del nuevo nombre
        const [existe] = await pool.query("SELECT id_usuario FROM usuarios WHERE nombre_usuario = ? AND id_usuario != ?", [nuevo_nombre, usuario_id]);
        if (existe.length > 0) return res.status(409).json({ error: "Este nombre de usuario ya está en uso" });

        // Actualizar
        await pool.query("UPDATE usuarios SET nombre_usuario = ? WHERE id_usuario = ?", [nuevo_nombre, usuario_id]);
        res.json({ mensaje: "Nombre de usuario actualizado con éxito" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al actualizar el nombre de usuario" });
    }
};

export const actualizarPassword = async (req, res) => {
    const { password_actual, nueva_password, confirmar_password } = req.body;
    const usuario_id = req.usuario.id;

    try {
        if (nueva_password !== confirmar_password) {
            return res.status(400).json({ error: "Las nuevas contraseñas no coinciden" });
        }
        if (nueva_password.length < 8) {
            return res.status(400).json({ error: "La nueva contraseña debe tener al menos 8 caracteres" });
        }

        const [rows] = await pool.query("SELECT password_usuario FROM usuarios WHERE id_usuario = ?", [usuario_id]);
        const passwordValida = await bcrypt.compare(password_actual, rows[0].password_usuario);
        if (!passwordValida) return res.status(401).json({ error: "La contraseña actual es incorrecta" });

        const hashPassword = await bcrypt.hash(nueva_password, 12);
        await pool.query("UPDATE usuarios SET password_usuario = ? WHERE id_usuario = ?", [hashPassword, usuario_id]);

        res.json({ mensaje: "Contraseña actualizada con éxito" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al actualizar la contraseña" });
    }
};