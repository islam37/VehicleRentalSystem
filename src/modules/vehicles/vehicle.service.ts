import { pool } from "../../config/db";

//  CREATE VEHICLE SERVICE FUNCTION
export const createVehicleService = async (bodyData: any) => {
  const {
    vehicle_name,
    type,
    registration_number,
    daily_rent_price,
    availability_status = "available",
  } = bodyData;

  // INSERT DATA INTO DB
  const query = `
    INSERT INTO vehicles (vehicle_name, type, registration_number, daily_rent_price, availability_status)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING id, vehicle_name, type, registration_number, daily_rent_price, availability_status;
  `;

  const values = [
    vehicle_name,
    type,
    registration_number,
    daily_rent_price,
    availability_status,
  ];

  const result = await pool.query(query, values);
  const createdVehicle = result.rows[0];

  // PostgreSQL STRING TO NUMBER
  return {
    ...createdVehicle,
    daily_rent_price: Number(createdVehicle.daily_rent_price),
  };
};

//  GET ALL VEHICLES SERVICE FUNCTION
export const getAllVehiclesService = async () => {
  const query = `SELECT id, vehicle_name, type, registration_number, daily_rent_price, availability_status FROM vehicles ORDER BY id ASC;`;
  const result = await pool.query(query);

  //STRING TO NUMBER CONVERSION FOR daily_rent_price

  return result.rows.map((vehicle) => ({
    ...vehicle,
    daily_rent_price: Number(vehicle.daily_rent_price),
  }));
};

//  GET VEHICLE BY ID SERVICE FUNCTION
export const getVehicleByIdService = async (vehicleId: number) => {
  const query = `SELECT id, vehicle_name, type, registration_number, daily_rent_price, availability_status FROM vehicles WHERE id = $1;`;
  const result = await pool.query(query, [vehicleId]);

  // STRING TO NUMBER CONVERSION FOR daily_rent_price
  if (result.rows.length === 0) {
    return null;
  }

  const vehicle = result.rows[0];
  return {
    ...vehicle,
    daily_rent_price: Number(vehicle.daily_rent_price),
  };
};

// UPDATE VEHICLE FUNCTION
export const updateVehicleService = async (
  vehicleId: number,
  updateData: any,
) => {
  // Check if the vehicle exists in the database
  const existingVehicle = await getVehicleByIdService(vehicleId);
  if (!existingVehicle) {
    throw new Error("Vehicle not found");
  }

  // Use the new data if provided, otherwise keep the existing data
  const vehicle_name = updateData.vehicle_name || existingVehicle.vehicle_name;
  const type = updateData.type || existingVehicle.type;
  const registration_number =
    updateData.registration_number || existingVehicle.registration_number;
  const daily_rent_price =
    updateData.daily_rent_price || existingVehicle.daily_rent_price;
  const availability_status =
    updateData.availability_status || existingVehicle.availability_status;

  const query = `
    UPDATE vehicles
    SET vehicle_name = $1, type = $2, registration_number = $3, daily_rent_price = $4, availability_status = $5
    WHERE id = $6
    RETURNING id, vehicle_name, type, registration_number, daily_rent_price, availability_status;
  `;

  const values = [
    vehicle_name,
    type,
    registration_number,
    daily_rent_price,
    availability_status,
    vehicleId,
  ];

  const result = await pool.query(query, values);
  const updatedVehicle = result.rows[0];

  return {
    ...updatedVehicle,
    daily_rent_price: Number(updatedVehicle.daily_rent_price),
  };
};

//  DELETE VEHICLE FUNCTION
export const deleteVehicleService = async (vehicleId: number) => {
  // Check if the vehicle has any active bookings
  const checkActiveBooking = await pool.query(
    "SELECT id FROM bookings WHERE vehicle_id = $1 AND status = 'active';",
    [vehicleId],
  );

  if (checkActiveBooking.rows.length > 0) {
    throw new Error("Cannot delete vehicle with active bookings");
  }

  // If no active bookings, delete the vehicle
  const result = await pool.query(
    "DELETE FROM vehicles WHERE id = $1 RETURNING id;",
    [vehicleId],
  );

  if (result.rowCount === 0) {
    throw new Error("Vehicle not found");
  }

  return true;
};
