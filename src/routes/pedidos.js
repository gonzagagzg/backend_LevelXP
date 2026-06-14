import { Router } from "express";
import { realizarPedido, obtenerPedidos, editarPedido, eliminarPedido, actualizarEstadoPedido } from "../controllers/pedidos_controller.js";
import { verifyToken } from "../middlewares/verifyToken.js";

const router = Router();


router.post("/realizarPedido",verifyToken, realizarPedido);
router.get("/obtenerPedidos",verifyToken, obtenerPedidos);
router.put("/actualizarPedido/:id", verifyToken, editarPedido);
router.patch("/actualizarEstado/:id", verifyToken, actualizarEstadoPedido);
router.delete("/eliminarPedido/:id", verifyToken, eliminarPedido);

export default router;
