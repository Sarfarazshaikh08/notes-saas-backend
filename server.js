import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import authRoutes from "./routes/auth.js";
import noteRoutes from "./routes/notes.js";
import tenantRoutes from "./routes/tenants.js";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// Health check
app.get("/health", (req, res) => res.json({ status: "ok" }));

// Routes
app.use("/auth", authRoutes);
app.use("/notes", noteRoutes);
app.use("/tenants", tenantRoutes);

const PORT = process.env.PORT || 3000;

// Local/dev mode → connect & start
async function start() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Mongo connected");
    app.listen(PORT, () => console.log("Server running on", PORT));
  } catch (err) {
    console.error("Mongo connection error:", err);
  }
}

if (process.env.VERCEL !== "1") {
  start();
}

// Always export app for Vercel
export default app;
