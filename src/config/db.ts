import { Pool, type PoolClient } from "pg";
import dotenv from "dotenv";

dotenv.config();

const connectionString: string | undefined = process.env.DATABASE_URL;

export const pool: Pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false,
  },
});

//initialize the database

export const initDB = async (): Promise<void> => {
  try {
    // user table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL UNIQUE,
        password VARCHAR(100) NOT NULL,
        phone VARCHAR(15) NOT NULL,
        role VARCHAR(20) NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    // Vehicles Table

    await pool.query(`
      CREATE TABLE IF NOT EXISTS vehicles (
        id SERIAL PRIMARY KEY,
        vehicle_name VARCHAR(50) NOT NULL,
        type VARCHAR(30) NOT NULL Check (type IN ('car', 'bike', 'van', 'SUV')),
        registration_number VARCHAR(50) NOT NULL UNIQUE,
        daily_rent_price NUMERIC(10, 2) NOT NULL CHECK (daily_rent_price > 0),
        availability_status VARCHAR(20) NOT NULL DEFAULT 'available' CHECK (availability_status IN ('available', 'booked')),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Bookings Table

    await pool.query(`
      CREATE TABLE IF NOT EXISTS bookings (
        id SERIAL PRIMARY KEY,

        customer_id INTEGER NOT NULL
          REFERENCES users(id),

        vehicle_id INTEGER NOT NULL
          REFERENCES vehicles(id),

        rent_start_date DATE NOT NULL,

        rent_end_date DATE NOT NULL,

        total_price NUMERIC(10, 2) NOT NULL
          CHECK (total_price > 0),

        status VARCHAR(20) NOT NULL
          DEFAULT 'active'
          CHECK (status IN ('active', 'cancelled', 'returned')),

        CHECK (rent_end_date > rent_start_date)
      );
    `);
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Unknown database error";
    console.error("Failed to initialize database:", message);
  }
};

//TEST BD CONNECTION
export const testDBConnection = async (): Promise<void> => {
  try {
    const client: PoolClient = await pool.connect();
    console.log("Connected to NeonDB successfully");
    client.release();
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Unknown database error";
    console.error("Failed to connect to NeonDB:", message);
    process.exit(1);
  }
};
