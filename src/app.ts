import express, { type Express, type Request, type Response } from "express";
import cors from "cors";
import vehicleRouter from "./modules/vehicles/vehicle.route";
import authRouter from "./modules/auth/auth.route";
import userRouter from "./modules/user/user.route";
import bookingRouter from "./modules/booking/booking.route";
import {
  notFoundHandler,
  globalErrorHandler,
} from "./middlewares/error.middleware";

const app: Express = express();

// Middleware
app.use(cors());
app.use(express.json());

type ApiResponse = {
  success: boolean;
  message: string;
};

// Root route
app.get("/", (req: Request, res: Response<ApiResponse>) => {
  res.json({
    success: true,
    message: "Vehicle Rental API is running",
  });
});

// Vehicles API Route Mount
app.use("/api/v1/vehicles", vehicleRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/bookings", bookingRouter);
app.use(notFoundHandler);
app.use(globalErrorHandler);

export default app;
