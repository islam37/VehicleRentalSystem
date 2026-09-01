import { Request, Response, NextFunction } from "express";

// 1. 404 Not Found Handler (When a requested route does not exist)
export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    errors: `Cannot ${req.method} ${req.originalUrl}`,
  });
};

// 2. Global Error Handler (Catches all unhandled server errors)
export const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  res.status(statusCode).json({
    success: false,
    message,
    errors: process.env.NODE_ENV === "development" ? err.stack : message,
  });
};
