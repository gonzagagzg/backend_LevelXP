import {Router} from "express";
import { obtenerCategorias,crearCategoria,actualizarCategoria,eliminarCategoria, activarCategoria, obtenerCategoriasDesactivadas } from "../controllers/categoria_controller.js";
import {validarCampos, asynHandler} from "../middlewares/avanzado.js";
import { verifyToken } from "../middlewares/verifyToken.js";


const router = Router();
router.get("/obtenerCategorias", asynHandler(obtenerCategorias));
router.get("/desactivadas", verifyToken, asynHandler(obtenerCategoriasDesactivadas));
router.post("/crearCategoria", verifyToken, asynHandler(crearCategoria));
router.put("/actualizarCategoria/:id", verifyToken, asynHandler(actualizarCategoria));
router.delete("/eliminarCategoria/:id", verifyToken, asynHandler(eliminarCategoria));
router.patch("/activarCategoria/:id", verifyToken, asynHandler(activarCategoria));
export default router;