import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "../prisma/client.js";
import { publicUser, signToken } from "../utils/auth.js";
import { HttpError } from "../utils/httpError.js";

export const signupSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Valid email is required").toLowerCase(),
    password: z.string().min(6, "Password must be at least 6 characters"),
    role: z.enum(["ADMIN", "MEMBER"]).default("MEMBER")
  }),
  params: z.object({}).default({}),
  query: z.object({}).default({})
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email("Valid email is required").toLowerCase(),
    password: z.string().min(1, "Password is required")
  }),
  params: z.object({}).default({}),
  query: z.object({}).default({})
});

export const signup = async (req, res, next) => {
  try {
    const existingUser = await prisma.user.findUnique({ where: { email: req.body.email } });

    if (existingUser) {
      throw new HttpError(409, "Email is already registered");
    }

    const passwordHash = await bcrypt.hash(req.body.password, 12);
    const user = await prisma.user.create({
      data: {
        name: req.body.name,
        email: req.body.email,
        passwordHash,
        role: req.body.role
      }
    });

    res.status(201).json({ user: publicUser(user), token: signToken(user) });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({ where: { email: req.body.email } });

    if (!user) {
      throw new HttpError(401, "Invalid email or password");
    }

    const isValidPassword = await bcrypt.compare(req.body.password, user.passwordHash);

    if (!isValidPassword) {
      throw new HttpError(401, "Invalid email or password");
    }

    res.json({ user: publicUser(user), token: signToken(user) });
  } catch (error) {
    next(error);
  }
};

export const me = (req, res) => {
  res.json({ user: publicUser(req.user) });
};
