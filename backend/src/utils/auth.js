import jwt from "jsonwebtoken";

const getJwtSecret = () => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured");
  }

  return process.env.JWT_SECRET;
};

export const signToken = (user) =>
  jwt.sign({ id: user.id, role: user.role }, getJwtSecret(), { expiresIn: "7d" });

export const verifyToken = (token) => jwt.verify(token, getJwtSecret());

export const publicUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  createdAt: user.createdAt
});
