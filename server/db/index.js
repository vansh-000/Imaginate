import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/imaginate`);
    console.log("🟢 Connected to MongoDB !!! ",`The host is ${connectionInstance.connection.host}`);
  } catch (error) {
    console.log("🔴 Error connecting to MongoDB !!! ", error);
    process.exit(1);
  }
};

export default connectDB;