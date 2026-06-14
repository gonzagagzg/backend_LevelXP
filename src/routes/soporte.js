import { Router } from "express";
import {
    obtenerSoportes,
    obtenerSoportePorId,
    obtenerSoportesPorUsuario,
    crearSoporte,
    actualizarSoporte,
    eliminarSoporte
} from "../controllers/soporte_controller.js";
import { verifyToken } from "../middlewares/verifyToken.js";
import { asynHandler, esAdmin } from "../middlewares/avanzado.js";

const router = Router();

router.get("/obtenerSoportes", verifyToken, esAdmin, asynHandler(obtenerSoportes));
router.get("/obtenerSoporte/:id", verifyToken, esAdmin, asynHandler(obtenerSoportePorId));
router.get("/obtenerSoportes/usuario/:usuario_id", verifyToken, esAdmin, asynHandler(obtenerSoportesPorUsuario));
router.post("/crearSoporte", verifyToken, asynHandler(crearSoporte));
router.patch("/actualizarSoporte/:id", verifyToken, esAdmin, asynHandler(actualizarSoporte));
router.delete("/eliminarSoporte/:id", verifyToken, esAdmin, asynHandler(eliminarSoporte)); 

export default router;