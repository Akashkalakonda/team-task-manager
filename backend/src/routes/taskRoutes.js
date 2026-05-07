import { Router } from "express";
import {
  createTask,
  createTaskSchema,
  deleteTask,
  getTask,
  listTasks,
  taskIdSchema,
  updateStatusSchema,
  updateTask,
  updateTaskSchema,
  updateTaskStatus
} from "../controllers/taskController.js";
import { requireAuth } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validate.js";

const router = Router();

router.use(requireAuth);
router.get("/", listTasks);
router.post("/", validate(createTaskSchema), createTask);
router.get("/:id", validate(taskIdSchema), getTask);
router.put("/:id", validate(updateTaskSchema), updateTask);
router.patch("/:id/status", validate(updateStatusSchema), updateTaskStatus);
router.delete("/:id", validate(taskIdSchema), deleteTask);

export default router;
