import mongoose from "mongoose";

const inventorySchema = new mongoose.Schema({
    itemId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    category: { type: String, required: true },
    price: { type: Number, required: true },
    availability: { type: Boolean, required: true },
    image: { type: String, required: true },
    createdAt: { type: String, required: true },
    updatedAt: { type: String, required: true },
    preparationTime: { type: Number, required: true },
    kitchenId: {type:String, required: true}
  }, { collection: "Inventory" });
  
  const Inventory = mongoose.model('Inventory', inventorySchema);

  export default Inventory;