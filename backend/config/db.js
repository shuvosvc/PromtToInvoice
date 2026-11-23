import mongoose from "mongoose";

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/PromptToInvoice";

let isConnected = false;

export const connectDB = async () => {
  if (mongoose.connection.readyState >= 1 || isConnected) {
    return;
  }
  try {
    const db = await mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
    });
    isConnected = db.connections[0].readyState === 1;
    console.log("DB CONNECTED");
  } catch (err) {
    console.error("DB connection failed:", err.message);
    if (!process.env.VERCEL) {
      process.exit(1);
    }
  }
};
