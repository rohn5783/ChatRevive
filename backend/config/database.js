import mongoose from "mongoose";

export const connectDB = async () => {
  if (!process.env.MONGO_URI) {
    console.warn("MONGO_URI is not configured. Using local auth fallback store.");
    return false;
  }

  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log("Connected to MongoDB");
    return true;
  } catch (error) {
    console.warn(
      "MongoDB connection failed. Using local auth fallback store:",
      error.message
    );
    return false;
  }
};

export default connectDB;
