import { prisma } from "../prisma/client.js";
import { verifyToken } from "../utils/auth.js";
import { HttpError } from "../utils/httpError.js";

export const requireAuth = async (req, _res, next) => {
  try {
    const header = req.headers.authorization;
    const token = header?.startsWith("Bearer ") ? header.slice(7) : null;

    if (!token) {
      throw new HttpError(401, "Authentication token is required");
    }

    const payload = verifyToken(token);
    const user = await prisma.user.findUnique({ where: { id: payload.id } });

    if (!user) {
      throw new HttpError(401, "Authenticated user no longer exists");
    }

    req.user = user;
    next();
  } catch (error) {
    next(error.statusCode ? error : new HttpError(401, "Invalid or expired token"));
  }
};

export const requireAdmin = (req, _res, next) => {
  if (req.user?.role !== "ADMIN") {
    return next(new HttpError(403, "Admin access is required"));
  }

  next();
};
