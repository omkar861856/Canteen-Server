// models/Payment.js
import { Schema, model } from 'mongoose';

const paymentSchema = new Schema({
  id: { type: String, required: true },
  entity: { type: String, required: true },
  amount: { type: Number, required: true },
  currency: { type: String, required: true },
  status: { type: String, required: true },
  order_id: { type: String, required: true },
  invoice_id: { type: String, default: null },
  international: { type: Boolean, required: true },
  method: { type: String, required: true },
  amount_refunded: { type: Number, default: 0 },
  refund_status: { type: String, default: null },
  captured: { type: Boolean, required: true },
  description: { type: String, required: true },
  card_id: { type: String, default: null },
  bank: { type: String, default: null },
  wallet: { type: String, default: null },
  vpa: { type: String, default: null },
  email: { type: String, required: true },
  contact: { type: String, required: true },
  notes: { type: Object, required: true },
  fee: { type: Number, required: true },
  tax: { type: Number, required: true },
  error_code: { type: String, default: null },
  error_description: { type: String, default: null },
  error_source: { type: String, default: null },
  error_step: { type: String, default: null },
  error_reason: { type: String, default: null },
  acquirer_data: {
    bank_transaction_id: { type: String, required: true },
  },
  created_at: { type: Number, required: true },
  kitchenId: {type: String, required: true}
},{ collection: "Payments" });

export default model('Payment', paymentSchema);