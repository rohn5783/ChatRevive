import mongoose from "mongoose";

let connectionPromise;

export const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return true;
  }

  const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
  if (!uri) {
    throw new Error("MONGODB_URI or MONGO_URI must be configured.");
  }

  if (!connectionPromise) {
    connectionPromise = mongoose
      .connect(uri, {
        serverSelectionTimeoutMS: 3000,
      })
      .then(() => {
        connectionPromise = undefined;
        return true;
      })
      .catch(() => {
        connectionPromise = undefined;
        throw new Error(
          "MongoDB connection failed. Check the database URI and network access settings."
        );
      });
  }

  return connectionPromise;
};

export default connectDB;
