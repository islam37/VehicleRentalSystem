import express, { type Express, type Request, type Response } from "express";

const app: Express = express();

app.use(express.json());

type ApiResponse = {
  success: boolean;
  message: string;
};

app.get("/", (req: Request, res: Response<ApiResponse>) => {
  res.json({
    success: true,
    message: "Vehicle Rental API is running",
  });
});

export default app;
