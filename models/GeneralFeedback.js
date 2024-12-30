import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema(
  {
    feedback: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    fullName: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    kitchenId:{type:String, required:true},
    userId:{type:String, required:true}
  },
  { collection: "Feedbacks" } // Set the collection name explicitly
);

const GeneralFeedback = mongoose.model("Feedback", feedbackSchema);
export default GeneralFeedback;