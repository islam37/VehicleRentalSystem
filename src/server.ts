import app from "./app";
import dotenv from "dotenv";
import { testDBConnection } from "./config/db";
import type { Server } from "node:http";

dotenv.config();

const PORT: number = Number(process.env.PORT) || 3000;

void testDBConnection().then(() => {
  const server: Server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });

  console.log(`HTTP server started: ${server.address()}`);
});
