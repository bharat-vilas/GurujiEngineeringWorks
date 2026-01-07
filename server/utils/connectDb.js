import mongoose from "mongoose";

const connectDb = async () => {
  try {
    const instance = await mongoose.connect(
      `${process.env.MONGO_URI}/${process.env.MONGO_DB}`
    );
    console.log("MongoDB connected ✅");
  } catch (error) {
    console.error("Mongo connection failed ❌:", error.message);
  }
};

export default connectDb;

