import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import authRoutes from "./routes/auth.js";
import noteRoutes from "./routes/notes.js";
import tenantRoutes from "./routes/tenants.js";
import testRoutes from "./routes/test.js";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// Health check
app.get("/health", (req, res) => res.json({ status: "ok" }));

// --- MongoDB Connection (cached for Vercel) ---
let isConnected = false;

async function connectDB() {
  if (isConnected) return;
  try {
    const db = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    isConnected = db.connections[0].readyState === 1;
    console.log("MongoDB connected ✅");
  } catch (err) {
    console.error("MongoDB connection error ❌:", err);
  }
}

// Middleware to ensure DB is connected
app.use(async (req, res, next) => {
  if (!isConnected) {
    await connectDB();
  }
  next();
});

// Routes
app.use("/auth", authRoutes);
app.use("/notes", noteRoutes);
app.use("/tenants", tenantRoutes);
app.use("/test", testRoutes);

const PORT = process.env.PORT || 3000;

// Local/dev mode → connect & start
if (process.env.VERCEL !== "1") {
  connectDB().then(() => {
    app.listen(PORT, () => console.log("Server running on", PORT));
  });
}

// Always export app for Vercel
export default app;
