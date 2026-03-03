import express from "express";
import dotenv from "dotenv";
import { connectRedis } from "./config/redis.js";

dotenv.config();

const app = express();
app.use(express.json());

import serverless from "serverless-http";
// Your routes
import dataRoutes from "./routes/dataRoutes.js";
export const serverlessHandler = serverless(handler);
app.use("/api", dataRoutes);

// Redis connection
let redisConnected = false;
const initRedis = async () => {
  if (!redisConnected) {
    await connectRedis();
    redisConnected = true;
    console.log("Redis connected");
  }
};

// Check if running on Vercel serverless
const isServerless = !!process.env.VERCEL;

if (isServerless) {
  // SERVERLESS HANDLER FOR VERCEL

  const handler = async (req, res) => {
    try {
      await initRedis();
      return app(req, res);
    } catch (err) {
      console.error("Redis error:", err);
      res.status(500).send("Internal Server Error");
    }
  };


} else {
  // LOCAL DEVELOPMENT
  const PORT = process.env.PORT || 5000;
  const start = async () => {
    try {
      await initRedis();
      app.listen(PORT, () => {
        console.log(`Server running locally on http://localhost:${PORT}`);
      });
    } catch (err) {
      console.error("Startup error:", err);
      process.exit(1);
    }
  };

  start();
}