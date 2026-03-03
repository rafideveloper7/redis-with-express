
import express from "express";
import dotenv from "dotenv";
import { connectRedis } from "./config/redis.js";

import dataRoutes from "./routes/dataRoutes.js";
dotenv.config();

const app = express();

app.use(express.json());


app.use("/api", dataRoutes);

const PORT = process.env.PORT;

// Server start function
const startServer = async () => {

  try {
    await connectRedis();

    // app.listen(PORT, () => {
    //   console.log(`Server running on http://localhost:${PORT}`);
    // });

    module.exports = app;

  } catch (error) {
    console.error("Startup Error:", error);
    process.exit(1);
  }
};


startServer();