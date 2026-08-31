import express, { type Express, type Request, type Response } from "express";
import cors from "cors";
import vehicleRouter from "./modules/vehicles/vehicle.route";

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

export default app;
