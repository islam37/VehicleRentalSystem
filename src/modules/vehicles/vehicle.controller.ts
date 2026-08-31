import { Request, Response } from "express";
import {
  createVehicleService,
  getAllVehiclesService,
  getVehicleByIdService,
  updateVehicleService,
  deleteVehicleService,
} from "./vehicle.service";

// POST NEW VEHICLE FUNCTION
export const createVehicleController = async (req: Request, res: Response) => {
  try {
    const data = await createVehicleService(req.body);

    res.status(201).json({
      success: true,
      message: "Vehicle created successfully",
      data: data,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: "Vehicle creation failed",
      errors: error.message,
    });
  }
};

// GET ALL VEHICLES FUNCTION
export const getAllVehiclesController = async (req: Request, res: Response) => {
  try {
    const data = await getAllVehiclesService();

    if (data.length === 0) {
      res.status(200).json({
        success: true,
        message: "No vehicles found",
        data: [],
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Vehicles retrieved successfully",
      data: data,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve vehicles",
      errors: error.message,
    });
  }
};

//GET: ONE VEHICLE BY ID FUNCTION
export const getVehicleByIdController = async (req: Request, res: Response) => {
  try {
    const vehicleId = Number(req.params.vehicleId);
    const data = await getVehicleByIdService(vehicleId);

    if (!data) {
      res.status(404).json({
        success: false,
        message: "Vehicle not found",
        errors: "Not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Vehicle retrieved successfully",
      data: data,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve vehicle",
      errors: error.message,
    });
  }
};

//. PUT: UPDATE VEHICLE FUNCTION
export const updateVehicleController = async (req: Request, res: Response) => {
  try {
    const vehicleId = Number(req.params.vehicleId);
    const data = await updateVehicleService(vehicleId, req.body);

    res.status(200).json({
      success: true,
      message: "Vehicle updated successfully",
      data: data,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: "Failed to update vehicle",
      errors: error.message,
    });
  }
};

// . DELETE:
export const deleteVehicleController = async (req: Request, res: Response) => {
  try {
    const vehicleId = Number(req.params.vehicleId);
    await deleteVehicleService(vehicleId);

    res.status(200).json({
      success: true,
      message: "Vehicle deleted successfully",
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: "Failed to delete vehicle",
      errors: error.message,
    });
  }
};
