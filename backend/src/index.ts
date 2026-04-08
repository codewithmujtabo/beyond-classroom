import express from "express";
import cors from "cors";
import { env } from "./config/env";
import { errorHandler } from "./middleware/error-handler";
import authRoutes from "./routes/auth.routes";
import usersRoutes from "./routes/users.routes";
import registrationsRoutes from "./routes/registrations.routes";
import documentsRoutes from "./routes/documents.routes";
import competitionsRoutes from "./routes/competitions.routes";

const app = express();

app.use(cors());
app.use(express.json());

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/registrations", registrationsRoutes);
app.use("/api/documents", documentsRoutes);
app.use("/api/competitions", competitionsRoutes);

// Error handler
app.use(errorHandler);

app.listen(env.PORT, () => {
  console.log(`Beyond Classroom API running on port ${env.PORT}`);
});

export default app;
