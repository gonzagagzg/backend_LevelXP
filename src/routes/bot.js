import { Router } from "express";

import { consultarBot } from "../controllers/bot_controller.js";

const router = Router();

router.post("/preguntar", consultarBot);

export default router;