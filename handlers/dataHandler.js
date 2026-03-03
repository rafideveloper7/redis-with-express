// handlers/dataHandler.js
export const getData = async (req, res) => {
  try {
    const key = "data:main";
    
    // Use global redisClient from server.js
    const redisClient = global.redisClient;
    
    if (!redisClient || !redisClient.isOpen) {
      return res.status(503).json({
        source: "error",
        message: "Redis not connected"
      });
    }
    
    const cachedData = await redisClient.get(key);
    
    if (cachedData) {
      console.log("Data from Redis 🔥");
      return res.status(200).json({
        source: "redis",
        data: JSON.parse(cachedData)
      });
    }
    
    console.log("Generating fresh data...");
    const freshData = {
      message: "Hello from Server",
      time: new Date()
    };
    
    await redisClient.setEx(key, 60, JSON.stringify(freshData));
    
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