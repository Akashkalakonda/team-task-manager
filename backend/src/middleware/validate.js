import { ZodError } from "zod";
import { HttpError } from "../utils/httpError.js";

export const validate = (schema) => (req, _res, next) => {
  try {
    const parsed = schema.parse({
      body: req.body,
      params: req.params,
      query: req.query
    });

    req.body = parsed.body;
    req.params = parsed.params;
    req.query = parsed.query;
    next();
  } catch (error) {
    if (error instanceof ZodError) {
      const message = error.errors.map((issue) => issue.message).join(", ");
      return next(new HttpError(400, message));
    }

    next(error);
  }
};
