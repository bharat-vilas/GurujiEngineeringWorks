import mongoose from "mongoose";

// OAuth Token schema to store Google OAuth tokens
const OAuthTokenSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Admin",
    required: true,
    unique: true,
  },
  accessToken: {
    type: String,
    required: true,
  },
  refreshToken: {
    type: String,
    required: true,
  },
  expiryDate: {
    type: Date,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

OAuthTokenSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

const OAuthToken = mongoose.model("OAuthToken", OAuthTokenSchema);

export default OAuthToken;
