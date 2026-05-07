import { prisma } from "../prisma/client.js";
import { publicUser } from "../utils/auth.js";

export const listUsers = async (_req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { name: "asc" }
    });

    res.json({ users: users.map(publicUser) });
  } catch (error) {
    next(error);
  }
};
