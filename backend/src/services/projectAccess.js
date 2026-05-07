import { prisma } from "../prisma/client.js";

export const isProjectMember = async (projectId, userId) => {
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      OR: [{ ownerId: userId }, { members: { some: { userId } } }]
    },
    select: { id: true }
  });

  return Boolean(project);
};

export const canManageProject = async (projectId, user) => {
  if (user.role === "ADMIN") {
    return true;
  }

  const project = await prisma.project.findFirst({
    where: { id: projectId, ownerId: user.id },
    select: { id: true }
  });

  return Boolean(project);
};
