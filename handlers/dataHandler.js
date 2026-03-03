// Redis client
import redisClient from "../config/redis.js";

export const getData = async (req, res) => {

  try {

    const key = "data:main";


    const cachedData = await redisClient.get(key);

    // Agar Redis mein data mil gaya
    if (cachedData) {

      console.log("Data from Redis 🔥");

      return res.status(200).json({
        source: "redis",
        data: JSON.parse(cachedData)
      });
    }

    // Agar Redis mein data nahi mila
    console.log("Generating fresh data...");

    const freshData = {
      message: "Hello from Server",
      time: new Date()
    };

    // Fresh data Redis mein save kar rahe hain
    await redisClient.setEx(
      key,                
      60,                  
      JSON.stringify(freshData) 
    );

    // Client ko fresh data bhej rahe hain
    return res.status(200).json({
      source: "server",
      data: freshData
    });

  } catch (error) {

    console.error("Handler Error:", error);

    return res.status(500).json({
      message: "Internal Server Error"
    });
  }
};