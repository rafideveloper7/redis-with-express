import express from "express";
import dotenv from "dotenv";
import serverless from "serverless-http";
import { connectRedis } from "./config/redis.js";
import dataRoutes from "./routes/dataRoutes.js";

dotenv.config();

const app = express();
app.use(express.json());
app.use("/api", dataRoutes);

let isRedisConnected = false;

const initRedis = async () => {
  if (!isRedisConnected) {
    await connectRedis();
    isRedisConnected = true;
  }
};

const handler = async (req, res) => {
  try {
    await initRedis();
    return app(req, res);
  } catch (error) {
    console.error("Redis connection error:", error);
    res.status(500).send("Internal Server Error");
  }
};

export const serverlessHandler = serverless(handler);