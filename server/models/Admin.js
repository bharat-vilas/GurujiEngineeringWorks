import mongoose from "mongoose";

// Admin schema & model
 const AdminSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  refreshToken: {
    type: String,
    default: null,
  },
});


const Admin = mongoose.model("Admin", AdminSchema);

export default Admin;
