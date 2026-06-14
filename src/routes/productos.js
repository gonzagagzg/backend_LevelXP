import {Router} from "express";
import { obtenerProductos,obtenerProductos2,crearProducto,actualizarProducto,eliminarProducto,obtenerProductobyId, actualizarStock, activarProducto, obtenerProductosDesactivados } from "../controllers/productos_controller.js";
import {validarCampos, asynHandler} from "../middlewares/avanzado.js";
import {verifyToken} from "../middlewares/verifyToken.js";

const router = Router();
router.get("/obtenerProductos",asynHandler(obtenerProductos));
router.get("/obtenerProductos2",asynHandler(obtenerProductos2));
router.get("/desactivados", verifyToken, asynHandler(obtenerProductosDesactivados));
router.get("/obtenerProductos/:id",asynHandler(obtenerProductobyId));
router.post("/crearProducto",verifyToken,validarCampos(["categoria_id","plataforma_id","nombre_vjuego","descripcion_vjuego","precio_vjuego","stock_vjuego"]),
asynHandler(crearProducto));

router.put("/actualizarProducto/:id", verifyToken, asynHandler(actualizarProducto));
router.delete("/eliminarProducto/:id", verifyToken, asynHandler(eliminarProducto));
router.patch("/actualizarStock/:id", verifyToken, asynHandler(actualizarStock));
router.patch("/activarProducto/:id", verifyToken, asynHandler(activarProducto));
export default router;


 
 
