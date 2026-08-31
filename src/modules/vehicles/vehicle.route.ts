import { Router } from "express";
import {
  createVehicleController,
  getAllVehiclesController,
  getVehicleByIdController,
  updateVehicleController,
  deleteVehicleController,
} from "./vehicle.controller";

const router = Router();

// Endpoint Mapping
router.post("/", createVehicleController);
router.get("/", getAllVehiclesController);
router.get("/:vehicleId", getVehicleByIdController);
router.put("/:vehicleId", updateVehicleController);
router.delete("/:vehicleId", deleteVehicleController);

export default router;
