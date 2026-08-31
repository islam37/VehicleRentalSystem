import app from "./app";
import dotenv from "dotenv";
import { initDB, testDBConnection } from "./config/db";
import type { Server } from "node:http";

dotenv.config();

const PORT: number = Number(process.env.PORT) || 3000;

const startServer = async (): Promise<void> => {
  try {
    // Initialize database
    await initDB();

    // Test database connection
    await testDBConnection();

    // Start HTTP server
    const server: Server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

    console.log(`HTTP server started: ${server.address()}`);
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
