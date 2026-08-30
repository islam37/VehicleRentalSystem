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
