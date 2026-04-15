import { Router } from "express";

import { messageController } from "./message.controller";
const router = Router();

// GET /api/messages/:conversationId
router.get("/:conversationId", messageController);

export default router;
