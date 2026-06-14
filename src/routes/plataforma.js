import { Router } from "express";
import { obtenerPlataformas, crearPlataforma, actualizarPlataforma, eliminarPlataforma, activarPlataforma, obtenerPlataformasDesactivadas } from "../controllers/plataforma_controller.js";
import { asynHandler } from "../middlewares/avanzado.js";
import { verifyToken } from "../middlewares/verifyToken.js";

const router = Router();

router.get("/obtenerPlataformas", asynHandler(obtenerPlataformas));
router.get("/desactivadas", verifyToken, asynHandler(obtenerPlataformasDesactivadas));
router.post("/crearPlataforma", verifyToken, asynHandler(crearPlataforma));
router.put("/actualizarPlataforma/:id", verifyToken, asynHandler(actualizarPlataforma));
router.delete("/eliminarPlataforma/:id", verifyToken, asynHandler(eliminarPlataforma));
router.patch("/activarPlataforma/:id", verifyToken, asynHandler(activarPlataforma));

export default router;
