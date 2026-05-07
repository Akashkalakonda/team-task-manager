import { Router } from "express";
import {
  addMemberSchema,
  addProjectMember,
  createProject,
  createProjectSchema,
  deleteProject,
  getProject,
  listProjects,
  projectIdSchema,
  removeMemberSchema,
  removeProjectMember,
  updateProject,
  updateProjectSchema
} from "../controllers/projectController.js";
import { requireAdmin, requireAuth } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validate.js";

const router = Router();

router.use(requireAuth);
router.get("/", listProjects);
router.post("/", requireAdmin, validate(createProjectSchema), createProject);
router.get("/:id", validate(projectIdSchema), getProject);
router.put("/:id", validate(updateProjectSchema), updateProject);
router.delete("/:id", validate(projectIdSchema), deleteProject);
router.post("/:id/members", validate(addMemberSchema), addProjectMember);
router.delete("/:id/members/:userId", validate(removeMemberSchema), removeProjectMember);

export default router;
