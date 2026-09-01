import { Response } from "express";
import { AuthRequest } from "../../middlewares/auth.middleware";
import {
  createBookingService,
  getBookingsService,
  updateBookingStatusService,
} from "./booking.service";

// POST /api/v1/bookings
export const createBookingController = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const customerId =
      req.user!.role === "admin" && req.body.customer_id
        ? req.body.customer_id
        : req.user!.id;

    const data = await createBookingService({
      ...req.body,
      customer_id: customerId,
    });

    res.status(201).json({
      success: true,
      message: "Booking created successfully",
      data,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: "Booking creation failed",
      errors: error.message,
    });
  }
};

// GET /api/v1/bookings
export const getBookingsController = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const data = await getBookingsService(req.user!);
    const message =
      req.user!.role === "admin"
        ? "Bookings retrieved successfully"
        : "Your bookings retrieved successfully";

    res.status(200).json({
      success: true,
      message,
      data,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve bookings",
      errors: error.message,
    });
  }
};

// PUT /api/v1/bookings/:bookingId
export const updateBookingStatusController = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const bookingId = Number(req.params.bookingId);
    const { status } = req.body;

    const data = await updateBookingStatusService(bookingId, req.user!, status);

    const message =
      status === "returned"
        ? "Booking marked as returned. Vehicle is now available"
        : "Booking cancelled successfully";

    res.status(200).json({
      success: true,
      message,
      data,
    });
  } catch (error: any) {
    const statusCode = error.message.includes("Forbidden") ? 403 : 400;
    res.status(statusCode).json({
      success: false,
      message: "Booking update failed",
      errors: error.message,
    });
  }
};
