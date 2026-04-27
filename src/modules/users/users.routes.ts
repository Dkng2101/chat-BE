import { Router } from "express";
import {
  createUserController,
  getUsersController,
} from "./users.controller";

const router = Router();

// GET /api/users
router.get("/", getUsersController);

// POST /api/users
router.post("/", createUserController);

export default router;
