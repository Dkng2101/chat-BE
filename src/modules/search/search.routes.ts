import { Router } from "express";
import { searchMessagesController } from "./search.controller";

const router = Router();

router.get("/messages", searchMessagesController);

export default router;
