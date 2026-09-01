import { pool } from "../../config/db";

// Auto-mark expired bookings as returned
export const checkAndAutoReturnBookings = async () => {
  const expiredBookingsQuery = `
    SELECT id, vehicle_id 
    FROM bookings 
    WHERE status = 'active' AND rent_end_date < CURRENT_DATE;
  `;
  const expired = await pool.query(expiredBookingsQuery);

  for (const booking of expired.rows) {
    await pool.query("UPDATE bookings SET status = 'returned' WHERE id = $1;", [
      booking.id,
    ]);
    await pool.query(
      "UPDATE vehicles SET availability_status = 'available' WHERE id = $1;",
      [booking.vehicle_id],
    );
  }
};

// 1. Create Booking
export const createBookingService = async (bookingData: {
  customer_id: number;
  vehicle_id: number;
  rent_start_date: string;
  rent_end_date: string;
}) => {
  await checkAndAutoReturnBookings();

  const { customer_id, vehicle_id, rent_start_date, rent_end_date } =
    bookingData;

  const start = new Date(rent_start_date);
  const end = new Date(rent_end_date);

  const diffTime = end.getTime() - start.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) {
    throw new Error("rent_end_date must be after rent_start_date");
  }

  // Check vehicle
  const vehicleResult = await pool.query(
    "SELECT id, vehicle_name, daily_rent_price, availability_status FROM vehicles WHERE id = $1;",
    [vehicle_id],
  );

  if (vehicleResult.rows.length === 0) {
    throw new Error("Vehicle not found");
  }

  const vehicle = vehicleResult.rows[0];

  if (vehicle.availability_status !== "available") {
    throw new Error("Vehicle is not available for booking");
  }

  const dailyPrice = Number(vehicle.daily_rent_price);
  const totalPrice = dailyPrice * diffDays;

  // Use database transaction
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const insertQuery = `
      INSERT INTO bookings (customer_id, vehicle_id, rent_start_date, rent_end_date, total_price, status)
      VALUES ($1, $2, $3, $4, $5, 'active')
      RETURNING id, customer_id, vehicle_id, rent_start_date, rent_end_date, total_price, status;
    `;
    const bookingRes = await client.query(insertQuery, [
      customer_id,
      vehicle_id,
      rent_start_date,
      rent_end_date,
      totalPrice,
    ]);

    // Update vehicle to booked
    await client.query(
      "UPDATE vehicles SET availability_status = 'booked' WHERE id = $1;",
      [vehicle_id],
    );

    await client.query("COMMIT");

    const created = bookingRes.rows[0];
    return {
      id: created.id,
      customer_id: created.customer_id,
      vehicle_id: created.vehicle_id,
      rent_start_date: new Date(created.rent_start_date)
        .toISOString()
        .split("T")[0],
      rent_end_date: new Date(created.rent_end_date)
        .toISOString()
        .split("T")[0],
      total_price: Number(created.total_price),
      status: created.status,
      vehicle: {
        vehicle_name: vehicle.vehicle_name,
        daily_rent_price: Number(vehicle.daily_rent_price),
      },
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

// 2. Get Bookings based on role
export const getBookingsService = async (currentUser: {
  id: number;
  role: "admin" | "customer";
}) => {
  await checkAndAutoReturnBookings();

  if (currentUser.role === "admin") {
    const query = `
      SELECT 
        b.id, b.customer_id, b.vehicle_id, b.rent_start_date, b.rent_end_date, b.total_price, b.status,
        u.name AS customer_name, u.email AS customer_email,
        v.vehicle_name, v.registration_number
      FROM bookings b
      JOIN users u ON b.customer_id = u.id
      JOIN vehicles v ON b.vehicle_id = v.id
      ORDER BY b.id ASC;
    `;
    const result = await pool.query(query);

    return result.rows.map((row) => ({
      id: row.id,
      customer_id: row.customer_id,
      vehicle_id: row.vehicle_id,
      rent_start_date: new Date(row.rent_start_date)
        .toISOString()
        .split("T")[0],
      rent_end_date: new Date(row.rent_end_date).toISOString().split("T")[0],
      total_price: Number(row.total_price),
      status: row.status,
      customer: {
        name: row.customer_name,
        email: row.customer_email,
      },
      vehicle: {
        vehicle_name: row.vehicle_name,
        registration_number: row.registration_number,
      },
    }));
  } else {
    const query = `
      SELECT 
        b.id, b.vehicle_id, b.rent_start_date, b.rent_end_date, b.total_price, b.status,
        v.vehicle_name, v.registration_number, v.type
      FROM bookings b
      JOIN vehicles v ON b.vehicle_id = v.id
      WHERE b.customer_id = $1
      ORDER BY b.id ASC;
    `;
    const result = await pool.query(query, [currentUser.id]);

    return result.rows.map((row) => ({
      id: row.id,
      vehicle_id: row.vehicle_id,
      rent_start_date: new Date(row.rent_start_date)
        .toISOString()
        .split("T")[0],
      rent_end_date: new Date(row.rent_end_date).toISOString().split("T")[0],
      total_price: Number(row.total_price),
      status: row.status,
      vehicle: {
        vehicle_name: row.vehicle_name,
        registration_number: row.registration_number,
        type: row.type,
      },
    }));
  }
};

// 3. Update Booking (Cancel / Return)
export const updateBookingStatusService = async (
  bookingId: number,
  currentUser: { id: number; role: "admin" | "customer" },
  newStatus: "cancelled" | "returned",
) => {
  const checkQuery = `SELECT * FROM bookings WHERE id = $1;`;
  const res = await pool.query(checkQuery, [bookingId]);

  if (res.rows.length === 0) {
    throw new Error("Booking not found");
  }

  const booking = res.rows[0];

  // Customer cancellation rule
  if (currentUser.role === "customer") {
    if (booking.customer_id !== currentUser.id) {
      throw new Error(
        "Forbidden: You cannot modify another customer's booking",
      );
    }
    if (newStatus !== "cancelled") {
      throw new Error("Customers can only cancel bookings");
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startDate = new Date(booking.rent_start_date);
    startDate.setHours(0, 0, 0, 0);

    if (today >= startDate) {
      throw new Error("Bookings can only be cancelled before the start date");
    }
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const updateRes = await client.query(
      "UPDATE bookings SET status = $1 WHERE id = $2 RETURNING *;",
      [newStatus, bookingId],
    );

    // Make vehicle available again
    await client.query(
      "UPDATE vehicles SET availability_status = 'available' WHERE id = $1;",
      [booking.vehicle_id],
    );

    await client.query("COMMIT");

    const updated = updateRes.rows[0];
    return {
      id: updated.id,
      customer_id: updated.customer_id,
      vehicle_id: updated.vehicle_id,
      rent_start_date: new Date(updated.rent_start_date)
        .toISOString()
        .split("T")[0],
      rent_end_date: new Date(updated.rent_end_date)
        .toISOString()
        .split("T")[0],
      total_price: Number(updated.total_price),
      status: updated.status,
      ...(newStatus === "returned" && {
        vehicle: {
          availability_status: "available",
        },
      }),
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};
