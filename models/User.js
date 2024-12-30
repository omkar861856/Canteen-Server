import mongoose from "mongoose";

// User Schema
const UserSchema = new mongoose.Schema({
    firstName: { type: String, required: true},
    lastName: { type: String, required: true },
    phone: { type: String, required: true},
    otp: { type: String, required: true },
    otpExpiresAt: { type: Date, required: true},
    token:{ type: String, required: true}, 
    isLoggedIn:{type:Boolean, required: true},
    isRegistered: {type: Boolean, required: true},
    connectedKitchen: {type:String},
    isKitchen: {type: Boolean},
    kitchenId: {type: String},
    kitchenName: {type: String},
    isKitchenOnline: {type: Boolean}
}, { collection: "Users" });

export const User = mongoose.model('User', UserSchema); 
