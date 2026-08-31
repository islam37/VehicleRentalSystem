import { Response } from "express";
import { AuthRequest } from "../../middlewares/auth.middleware";
import {
  getAllUsersService,
  updateUserService,
  deleteUserService,
} from "./user.service";

// GET /api/v1/users
export const getAllUsersController = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const users = await getAllUsersService();
    res.status(200).json({
      success: true,
      message: "Users retrieved successfully",
      data: users,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve users",
      errors: error.message,
    });
  }
};

// PUT /api/v1/users/:userId
export const updateUserController = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const targetUserId = Number(req.params.userId);
    const updatedUser = await updateUserService(
      targetUserId,
      req.user!,
      req.body,
    );

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: updatedUser,
    });
  } catch (error: any) {
    const statusCode = error.message.includes("Forbidden") ? 403 : 400;
    res.status(statusCode).json({
      success: false,
      message: "Failed to update user",
      errors: error.message,
    });
  }
};

// DELETE /api/v1/users/:userId
export const deleteUserController = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const targetUserId = Number(req.params.userId);
    await deleteUserService(targetUserId);

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: "Failed to delete user",
      errors: error.message,
    });
  }
};
