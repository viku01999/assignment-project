import express from "express";
import { errorMiddleware } from "./middleware/error.middleware";
import insightRoutes from "./routes/insight.routes"

const app = express();

app.use(express.json());

app.use("/api/insights", insightRoutes);

app.use(errorMiddleware);

export default app;
