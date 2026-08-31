import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// Interface representing the decoded JWT payload
export interface AuthUser {
  id: number;
  email: string;
  role: "admin" | "customer";
}

// Extend Express Request interface to include the user property
export interface AuthRequest extends Request {
  user?: AuthUser;
}

// Middleware to authenticate JWT token from Authorization header
export const authenticate = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): void => {
  const authHeader = req.headers.authorization;

  // Check if authorization header exists and starts with 'Bearer '
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({
      success: false,
      message: "Unauthorized access",
      errors: "Authorization token is missing or invalid",
    });
    return;
  }

  const token = authHeader.split(" ")[1];

  // Validate that token string is present
  if (!token) {
    res.status(401).json({
      success: false,
      message: "Unauthorized access",
      errors: "Authorization token is missing",
    });
    return;
  }

  const jwtSecret = process.env.JWT_SECRET ?? "super_secret_jwt_key_12345";

  try {
    // Decode and verify token
    const decoded = jwt.verify(token, jwtSecret) as unknown as AuthUser;

    // Attach decoded user data to the request object for downstream handlers
    req.user = decoded;
    next();
  } catch (error: any) {
    res.status(401).json({
      success: false,
      message: "Unauthorized access",
      errors: error.message || "Invalid or expired token",
    });
  }
};

// Middleware to authorize specific user roles (e.g., 'admin', 'customer')
export const authorize = (roles: Array<"admin" | "customer">) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: "Forbidden access",
        errors: "You do not have permission to access this resource",
      });
      return;
    }
    next();
  };
};
