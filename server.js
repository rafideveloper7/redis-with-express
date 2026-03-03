import express from "express";
import dotenv from "dotenv";
import serverless from "serverless-http";
import { connectRedis } from "./config/redis.js";
import dataRoutes from "./routes/dataRoutes.js";

dotenv.config();

const app = express();
app.use(express.json());
app.use("/api", dataRoutes);

let redisConnected = false;
const initRedis = async () => {
  if (!redisConnected) {
    await connectRedis();
    redisConnected = true;
    console.log("Redis connected");
  }
};

const handler = async (req, res) => {
  try {
    await initRedis();
    return app(req, res);
  } catch (err) {
    console.error("Redis error:", err);
    res.status(500).send("Internal Server Error");
  }
};

// Export the serverless handler for Vercel
export const serverlessHandler = serverless(handler);