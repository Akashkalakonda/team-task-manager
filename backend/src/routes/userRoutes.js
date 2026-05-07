import { Router } from "express";
import { listUsers } from "../controllers/userController.js";
import { requireAdmin, requireAuth } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/", requireAuth, requireAdmin, listUsers);

export default router;
