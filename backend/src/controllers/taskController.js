import { z } from "zod";
import { prisma } from "../prisma/client.js";
import { canManageProject, isProjectMember } from "../services/projectAccess.js";
import { HttpError } from "../utils/httpError.js";

const createDate = z
  .string()
  .datetime()
  .optional()
  .nullable()
  .transform((value) => (value ? new Date(value) : null));

const updateDate = z
  .string()
  .datetime()
  .nullable()
  .optional()
  .transform((value) => {
    if (value === undefined) {
      return undefined;
    }

    return value ? new Date(value) : null;
  });

const idParam = z.object({ id: z.string().min(1) });

export const createTaskSchema = z.object({
  body: z.object({
    title: z.string().min(2, "Task title must be at least 2 characters"),
    description: z.string().optional().nullable(),
    status: z.enum(["TODO", "IN_PROGRESS", "DONE"]).default("TODO"),
    priority: z.enum(["LOW", "MEDIUM", "HIGH"]).default("MEDIUM"),
    dueDate: createDate,
    projectId: z.string().min(1, "Project is required"),
    assignedToId: z.string().optional().nullable()
  }),
  params: z.object({}).default({}),
  query: z.object({}).default({})
});

export const updateTaskSchema = z.object({
  body: z.object({
    title: z.string().min(2, "Task title must be at least 2 characters").optional(),
    description: z.string().optional().nullable(),
    status: z.enum(["TODO", "IN_PROGRESS", "DONE"]).optional(),
    priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
    dueDate: updateDate,
    assignedToId: z.string().optional().nullable()
  }),
  params: idParam,
  query: z.object({}).default({})
});

export const updateStatusSchema = z.object({
  body: z.object({
    status: z.enum(["TODO", "IN_PROGRESS", "DONE"])
  }),
  params: idParam,
  query: z.object({}).default({})
});

export const taskIdSchema = z.object({
  body: z.object({}).default({}),
  params: idParam,
  query: z.object({}).default({})
});

const taskInclude = {
  project: { select: { id: true, name: true, ownerId: true } },
  assignedTo: { select: { id: true, name: true, email: true, role: true } },
  createdBy: { select: { id: true, name: true, email: true, role: true } }
};

const taskAccessWhere = (user) =>
  user.role === "ADMIN"
    ? {}
    : {
        OR: [
          { assignedToId: user.id },
          { createdById: user.id },
          { project: { ownerId: user.id } },
          { project: { members: { some: { userId: user.id } } } }
        ]
      };

export const listTasks = async (req, res, next) => {
  try {
    const tasks = await prisma.task.findMany({
      where: taskAccessWhere(req.user),
      include: taskInclude,
      orderBy: [{ status: "asc" }, { dueDate: "asc" }, { createdAt: "desc" }]
    });

    res.json({ tasks });
  } catch (error) {
    next(error);
  }
};

export const createTask = async (req, res, next) => {
  try {
    if (!(await canManageProject(req.body.projectId, req.user))) {
      throw new HttpError(403, "Only admins can create tasks for this project");
    }

    const project = await prisma.project.findUnique({
      where: { id: req.body.projectId },
      select: { id: true }
    });

    if (!project) {
      throw new HttpError(404, "Project not found");
    }

    if (req.body.assignedToId) {
      const assigneeIsMember = await isProjectMember(req.body.projectId, req.body.assignedToId);

      if (!assigneeIsMember) {
        throw new HttpError(400, "Assignee must be a project member");
      }
    }

    const task = await prisma.task.create({
      data: {
        ...req.body,
        createdById: req.user.id
      },
      include: taskInclude
    });

    res.status(201).json({ task });
  } catch (error) {
    next(error);
  }
};

export const getTask = async (req, res, next) => {
  try {
    const task = await prisma.task.findFirst({
      where: { id: req.params.id, ...taskAccessWhere(req.user) },
      include: taskInclude
    });

    if (!task) {
      throw new HttpError(404, "Task not found");
    }

    res.json({ task });
  } catch (error) {
    next(error);
  }
};

export const updateTask = async (req, res, next) => {
  try {
    const existingTask = await prisma.task.findUnique({ where: { id: req.params.id } });

    if (!existingTask) {
      throw new HttpError(404, "Task not found");
    }

    if (!(await canManageProject(existingTask.projectId, req.user))) {
      throw new HttpError(403, "Only admins can edit task details");
    }

    if (req.body.assignedToId) {
      const assigneeIsMember = await isProjectMember(existingTask.projectId, req.body.assignedToId);

      if (!assigneeIsMember) {
        throw new HttpError(400, "Assignee must be a project member");
      }
    }

    const task = await prisma.task.update({
      where: { id: req.params.id },
      data: req.body,
      include: taskInclude
    });

    res.json({ task });
  } catch (error) {
    next(error);
  }
};

export const updateTaskStatus = async (req, res, next) => {
  try {
    const existingTask = await prisma.task.findFirst({
      where: { id: req.params.id, ...taskAccessWhere(req.user) }
    });

    if (!existingTask) {
      throw new HttpError(404, "Task not found");
    }

    const task = await prisma.task.update({
      where: { id: req.params.id },
      data: { status: req.body.status },
      include: taskInclude
    });

    res.json({ task });
  } catch (error) {
    next(error);
  }
};

export const deleteTask = async (req, res, next) => {
  try {
    const existingTask = await prisma.task.findUnique({ where: { id: req.params.id } });

    if (!existingTask) {
      throw new HttpError(404, "Task not found");
    }

    if (!(await canManageProject(existingTask.projectId, req.user))) {
      throw new HttpError(403, "Only admins can delete tasks");
    }

    await prisma.task.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
