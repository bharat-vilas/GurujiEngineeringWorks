import mongoose from "mongoose";

// billing number schema & model
 const BillingNumSchema = new mongoose.Schema({
  billing: {
    type: Number,
    required: true,
  },
  challan: {
    type: Number,
    required: true,
  },
  quotation: {
    type: Number,
    required: true,
  },
});


const billingNum = mongoose.model("billing", BillingNumSchema);

export default billingNum;