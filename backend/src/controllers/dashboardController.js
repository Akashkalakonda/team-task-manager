import { prisma } from "../prisma/client.js";

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

export const getDashboard = async (req, res, next) => {
  try {
    const now = new Date();
    const where = taskAccessWhere(req.user);

    const [totalTasks, todoTasks, inProgressTasks, doneTasks, overdueTasks, recentTasks, projectCount] =
      await Promise.all([
        prisma.task.count({ where }),
        prisma.task.count({ where: { ...where, status: "TODO" } }),
        prisma.task.count({ where: { ...where, status: "IN_PROGRESS" } }),
        prisma.task.count({ where: { ...where, status: "DONE" } }),
        prisma.task.count({
          where: {
            ...where,
            dueDate: { lt: now },
            status: { not: "DONE" }
          }
        }),
        prisma.task.findMany({
          where,
          include: {
            project: { select: { id: true, name: true } },
            assignedTo: { select: { id: true, name: true, email: true, role: true } }
          },
          orderBy: { createdAt: "desc" },
          take: 6
        }),
        prisma.project.count({
          where:
            req.user.role === "ADMIN"
              ? {}
              : { OR: [{ ownerId: req.user.id }, { members: { some: { userId: req.user.id } } }] }
        })
      ]);

    res.json({
      summary: {
        projectCount,
        totalTasks,
        todoTasks,
        inProgressTasks,
        doneTasks,
        overdueTasks
      },
      recentTasks
    });
  } catch (error) {
    next(error);
  }
};
