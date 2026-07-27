import mongoose from "mongoose";

const EmployeeSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  designation: { type: String, required: true, trim: true },
  department: { type: String, trim: true },
  phone: { type: String, trim: true },
  email: { type: String, trim: true, lowercase: true },
  address: { type: String, trim: true },
  joiningDate: { type: Date },
  salary: { type: Number },
  employeeType: { type: String, enum: ["full-time", "part-time"], default: "full-time" },
  status: { type: String, enum: ["active", "inactive"], default: "active" },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

EmployeeSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

const Employee = mongoose.model("Employee", EmployeeSchema);
export default Employee;
