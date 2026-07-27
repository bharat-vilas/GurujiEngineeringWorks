import mongoose from "mongoose";

const AttendanceSchema = new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
  date: { type: Date, required: true },
  status: {
    type: String,
    enum: ["present", "absent", "half-day", "leave"],
    required: true,
  },
  extraHours: { type: Number, default: 0 },
  note: { type: String, trim: true, default: "" },
}, { timestamps: true });

// One record per employee per day
AttendanceSchema.index({ employee: 1, date: 1 }, { unique: true });

const Attendance = mongoose.model("Attendance", AttendanceSchema);
export default Attendance;
