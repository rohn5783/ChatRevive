import mongoose from "mongoose";

let isConnected = false;

export const connectDB = async () => {
  if (isConnected || mongoose.connection.readyState === 1) {
    return true;
  }

  const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
  if (!uri) {
    return false;
  }

  try {
    const db = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000,
    });
    isConnected = db.connections[0].readyState === 1;
    return isConnected;
  } catch (error) {
    console.warn("MongoDB connection failed. Using local fallback store:", error.message);
    return false;
  }
};

export default connectDB;

