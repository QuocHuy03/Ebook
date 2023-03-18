const mongoose = require("mongoose");
const Schema = mongoose.Schema;

//created schema for Order
const orderSchema = new Schema({
  codeOrder: {
    type: String,
    required: true,
  },
  emailOrder: {
    type: String,
    required: true,
  },
  products: [
    {
      item: {
        type: Object,
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
      },
    },
  ],
  address: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  comment: {
    type: String,
    required: true,
  },
  orderDate: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Order", orderSchema);
