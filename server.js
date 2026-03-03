// server.js - THE COMPLETE FIX
import express from "express";
import dotenv from "dotenv";
import { createClient } from "redis";
import serverless from "serverless-http";

dotenv.config();

const app = express();
app.use(express.json());

// HEALTH CHECK ENDPOINT (always works)
app.get("/health", (req, res) => {
  res.json({ 
    status: "alive", 
    time: new Date().toISOString(),
    redis: global.redisClient ? "configured" : "not configured"
  });
});

// SIMPLE TEST ENDPOINT
app.get("/test", (req, res) => {
  res.json({ message: "API is working!" });
});

// LAZY REDIS CONNECTION - only connects when needed
async function getRedisClient() {
  if (!global.redisClient) {
    try {
      const client = createClient({ 
        url: process.env.REDIS_URL,
        socket: {
          reconnectStrategy: false, // Don't retry in serverless
          connectTimeout: 5000 // 5 second timeout
        }
      });
      
      client.on('error', (err) => {
        console.error("Redis client error:", err.message);
        global.redisClient = null;
      });
      
      await client.connect();
      global.redisClient = client;
      console.log("Redis connected");
    } catch (err) {
      console.error("Redis connection failed:", err.message);
      global.redisClient = null;
      throw err; // Re-throw so caller knows
    }
  }
  return global.redisClient;
}

// YOUR ACTUAL ROUTES - with Redis error handling
app.get("/api/data/:key", async (req, res) => {
  try {
    const client = await getRedisClient().catch(() => null);
    
    if (!client) {
      return res.status(503).json({ 
        error: "Redis unavailable",
        note: "Try again later"
      });
    }
    
    const value = await client.get(req.params.key);
    res.json({ key: req.params.key, value });
    
  } catch (error) {
    console.error("Route error:", error.message);
    res.status(500).json({ error: "Internal error" });
  }
});

// EXPORT for Vercel - THIS IS CRITICAL
export default serverless(app);