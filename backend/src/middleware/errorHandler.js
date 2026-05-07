export const notFoundHandler = (req, _res, next) => {
  const error = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

export const errorHandler = (error, _req, res, _next) => {
  let statusCode = error.statusCode || 500;
  let message = error.message;

  if (error.code === "P2025") {
    statusCode = 404;
    message = "Resource not found";
  }

  if (error.code === "P2002") {
    statusCode = 409;
    message = "A record with this value already exists";
  }

  if (error.code === "P2003") {
    statusCode = 400;
    message = "Invalid related resource";
  }

  res.status(statusCode).json({
    message: statusCode === 500 ? "Internal server error" : message
  });
};
