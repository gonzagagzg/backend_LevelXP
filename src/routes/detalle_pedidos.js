import { Router } from "express";
import { obtenerDetallesPorPedido, crearDetallePedido, obtenerMisDetallesCompras,obtenerMisDetallesCompras2 } from "../controllers/detalle_pedidos_controller.js";
import { verifyToken } from "../middlewares/verifyToken.js";
import { asynHandler } from "../middlewares/avanzado.js";

const router = Router();

router.get("/pedido/:pedido_id", verifyToken, asynHandler(obtenerDetallesPorPedido));
router.get("/mis-compras", verifyToken, asynHandler(obtenerMisDetallesCompras));
router.get("/mis-compras2", verifyToken, asynHandler(obtenerMisDetallesCompras2));
router.post("/crear", verifyToken, asynHandler(crearDetallePedido));

export default router;
