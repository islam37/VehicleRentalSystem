import { Router } from "express";
import {
  createBookingController,
  getBookingsController,
  updateBookingStatusController,
} from "./booking.controller";
import { authenticate } from "../../middlewares/auth.middleware";

const router = Router();

router.post("/", authenticate, createBookingController);
router.get("/", authenticate, getBookingsController);
router.put("/:bookingId", authenticate, updateBookingStatusController);

export default router;
