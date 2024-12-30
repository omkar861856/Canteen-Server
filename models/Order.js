import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  
  orderId: { type: String, required: true, unique: true },
  userFullName: {type: String, required: true},
  userPhoneNumber: {type: String, required: true},
  items: { type: Array, required: true },
  totalPrice: { type: Number, required: true },
  status: { type: String, default: "pending" },
  orderedAt: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  totalPreparationTime: {type: Number, required: true},
  completedAt: {type: Date},
  razorpayPaymentId: {type: String, required: true},
  cabinName: {type: String, required: true},
  extraInfo: {type: String},
  specialInstructions: {type: String},
  kitchenId: {type:String, required: true}

}, { collection: "Orders" });

const Order = mongoose.model("Orders", orderSchema); 
export default Order;
