import { z } from "zod";
import { prisma } from "../prisma/client.js";
import { canManageProject, isProjectMember } from "../services/projectAccess.js";
import { HttpError } from "../utils/httpError.js";

const idParam = z.object({ id: z.string().min(1) });

export const createProjectSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Project name must be at least 2 characters"),
    description: z.string().optional().nullable()
  }),
  params: z.object({}).default({}),
  query: z.object({}).default({})
});

export const updateProjectSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Project name must be at least 2 characters").optional(),
    description: z.string().optional().nullable()
  }),
  params: idParam,
  query: z.object({}).default({})
});

export const projectIdSchema = z.object({
  body: z.object({}).default({}),
  params: idParam,
  query: z.object({}).default({})
});

export const addMemberSchema = z.object({
  body: z.object({
    userId: z.string().min(1, "User is required"),
    role: z.enum(["ADMIN", "MEMBER"]).default("MEMBER")
  }),
  params: idParam,
  query: z.object({}).default({})
});

export const removeMemberSchema = z.object({
  body: z.object({}).default({}),
  params: z.object({
    id: z.string().min(1),
    userId: z.string().min(1)
  }),
  query: z.object({}).default({})
});

const projectInclude = {
  owner: { select: { id: true, name: true, email: true, role: true } },
  members: {
    include: {
      user: { select: { id: true, name: true, email: true, role: true } }
    },
    orderBy: { createdAt: "asc" }
  },
  tasks: {
    include: {
      assignedTo: { select: { id: true, name: true, email: true, role: true } },
      createdBy: { select: { id: true, name: true, email: true, role: true } }
    },
    orderBy: { createdAt: "desc" }
  }
};

export const listProjects = async (req, res, next) => {
  try {
    const where =
      req.user.role === "ADMIN"
        ? {}
        : { OR: [{ ownerId: req.user.id }, { members: { some: { userId: req.user.id } } }] };

    const projects = await prisma.project.findMany({
      where,
      include: projectInclude,
      orderBy: { createdAt: "desc" }
    });

    res.json({ projects });
  } catch (error) {
    next(error);
  }
};

export const createProject = async (req, res, next) => {
  try {
    const project = await prisma.project.create({
      data: {
        name: req.body.name,
        description: req.body.description,
        ownerId: req.user.id,
        members: {
          create: {
            userId: req.user.id,
            role: "ADMIN"
          }
        }
      },
      include: projectInclude
    });

    res.status(201).json({ project });
  } catch (error) {
    next(error);
  }
};

export const getProject = async (req, res, next) => {
  try {
    const allowed = await isProjectMember(req.params.id, req.user.id);

    if (!allowed && req.user.role !== "ADMIN") {
      throw new HttpError(403, "You do not have access to this project");
    }

    const project = await prisma.project.findUnique({
      where: { id: req.params.id },
      include: projectInclude
    });

    if (!project) {
      throw new HttpError(404, "Project not found");
    }

    res.json({ project });
  } catch (error) {
    next(error);
  }
};

export const updateProject = async (req, res, next) => {
  try {
    if (!(await canManageProject(req.params.id, req.user))) {
      throw new HttpError(403, "Only admins can update this project");
    }

    const project = await prisma.project.update({
      where: { id: req.params.id },
      data: req.body,
      include: projectInclude
    });

    res.json({ project });
  } catch (error) {
    next(error);
  }
};

export const deleteProject = async (req, res, next) => {
  try {
    if (!(await canManageProject(req.params.id, req.user))) {
      throw new HttpError(403, "Only admins can delete this project");
    }

    await prisma.project.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export const addProjectMember = async (req, res, next) => {
  try {
    if (!(await canManageProject(req.params.id, req.user))) {
      throw new HttpError(403, "Only admins can manage members");
    }

    const user = await prisma.user.findUnique({ where: { id: req.body.userId } });

    if (!user) {
      throw new HttpError(404, "User not found");
    }

    const member = await prisma.projectMember.upsert({
      where: { projectId_userId: { projectId: req.params.id, userId: req.body.userId } },
      update: { role: req.body.role },
      create: {
        projectId: req.params.id,
        userId: req.body.userId,
        role: req.body.role
      },
      include: {
        user: { select: { id: true, name: true, email: true, role: true } }
      }
    });

    res.status(201).json({ member });
  } catch (error) {
    next(error);
  }
};

export const removeProjectMember = async (req, res, next) => {
  try {
    if (!(await canManageProject(req.params.id, req.user))) {
      throw new HttpError(403, "Only admins can manage members");
    }

    await prisma.projectMember.delete({
      where: { projectId_userId: { projectId: req.params.id, userId: req.params.userId } }
    });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
