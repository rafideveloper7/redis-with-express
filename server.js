// server.js
import express from "express";
import dotenv from "dotenv";
import serverless from "serverless-http";
import { connectRedis } from "./config/redis.js"; // Use your config
import dataRoutes from "./routes/dataRoutes.js";

dotenv.config();

const app = express();
app.use(express.json());

// Health check
app.get("/health", (req, res) => {
  res.json({ 
    status: "alive", 
    time: new Date().toISOString()
  });
});

// Test endpoint
app.get("/test", (req, res) => {
  res.json({ message: "API is working!" });
});

// Mount your routes
app.use("/api", dataRoutes);

// Initialize Redis in the background (don't await)
connectRedis().catch(err => {
  console.error("Redis init error:", err);
});

// Export for Vercel
export default serverless(app);