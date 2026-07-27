import mongoose from "mongoose";

const buildMongoUri = (baseUri, dbName) => {
  if (!dbName) return baseUri;
  // Insert db name before any '?' query params to avoid malformed URI
  const qIdx = baseUri.indexOf("?");
  if (qIdx === -1) {
    return baseUri.endsWith("/") ? `${baseUri}${dbName}` : `${baseUri}/${dbName}`;
  }
  const path = baseUri.slice(0, qIdx);
  const query = baseUri.slice(qIdx);
  const withDb = path.endsWith("/") ? `${path}${dbName}` : `${path}/${dbName}`;
  return `${withDb}${query}`;
};

const connectDb = async () => {
  try {
    const uri = buildMongoUri(process.env.MONGO_URI, process.env.MONGO_DB);
    await mongoose.connect(uri);
    console.log("MongoDB connected ✅");
  } catch (error) {
    console.error("Mongo connection failed ❌:", error.message);
    process.exit(1);
  }
};

export default connectDb;

