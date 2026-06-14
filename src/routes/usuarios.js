import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { obtenerUsuarios, eliminarUsuario, activarUsuario, subirFotoPerfil, actualizarEmail, actualizarNombre, actualizarPassword } from "../controllers/usuarios_controller.js";
import { verifyToken } from "../middlewares/verifyToken.js";
import { asynHandler } from "../middlewares/avanzado.js";

const router = Router();

// Obtener la ruta absoluta del directorio actual (__dirname en ES Modules)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

router.get("/obtenerUsuarios", verifyToken, asynHandler(obtenerUsuarios));
router.delete("/eliminarUsuario/:id", verifyToken, asynHandler(eliminarUsuario));
router.patch("/activarUsuario/:id", verifyToken, asynHandler(activarUsuario));
router.patch("/actualizarEmail", verifyToken, asynHandler(actualizarEmail));
router.patch("/actualizarNombre", verifyToken, asynHandler(actualizarNombre));
router.patch("/actualizarPassword", verifyToken, asynHandler(actualizarPassword));

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const username = req.usuario.nombre_usuario;
        
        // Navegamos desde src/routes -> subimos uno a src -> entramos a uploads/user
        const dir = path.join(__dirname, '..', 'uploads', 'user', username);
        
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        
        // Limpiar la carpeta antes de guardar (evita acumular archivos si cambian de formato)
        if (fs.existsSync(dir)) {
            const files = fs.readdirSync(dir);
            for (const f of files) {
                fs.unlinkSync(path.join(dir, f));
            }
        }

        cb(null, dir);
    },
    filename: (req, file, cb) => {
        cb(null, 'foto_perfil.jpg'); 
    }
});

const upload = multer({ 
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // Aumentado a 5MB
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith("image/")) cb(null, true);
        else cb(new Error("Solo se permiten imágenes"));
    }
});

// Middleware para capturar errores específicos de Multer (como el tamaño de archivo)
router.post("/subirFoto", verifyToken, (req, res, next) => {
    upload.single("fotoPerfil")(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({ error: "La imagen es demasiado pesada. El límite es de 5MB." });
            }
            return res.status(400).json({ error: err.message });
        } else if (err) {
            return res.status(400).json({ error: err.message });
        }
        next();
    });
}, asynHandler(subirFotoPerfil));

export default router;
