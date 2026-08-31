import { Request, Response } from "express";
import { signupService, signinService } from "./auth.service";

export const signupController = async (req: Request, res: Response) => {
  try {
    const user = await signupService(req.body);
    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: user,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: "Registration failed",
      errors: error.message,
    });
  }
};

export const signinController = async (req: Request, res: Response) => {
  try {
    const data = await signinService(req.body);
    res.status(200).json({
      success: true,
      message: "Login successful",
      data: data,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: "Login failed",
      errors: error.message,
    });
  }
};
