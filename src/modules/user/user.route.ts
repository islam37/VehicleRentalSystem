import { Router } from "express";
import {
  getAllUsersController,
  updateUserController,
  deleteUserController,
} from "./user.controller";
import { authenticate, authorize } from "../../middlewares/auth.middleware";

const router = Router();

// GET all users: Admin only
router.get("/", authenticate, authorize(["admin"]), getAllUsersController);

// UPDATE user: Admin or Own profile (Permission check inside service)
router.put("/:userId", authenticate, updateUserController);

// DELETE user: Admin only
router.delete(
  "/:userId",
  authenticate,
  authorize(["admin"]),
  deleteUserController,
);

export default router;
