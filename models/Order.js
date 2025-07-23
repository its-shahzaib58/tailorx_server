const mongoose = require("mongoose");

// Define sub-schema for custom measurements
const customMeasurementSchema = new mongoose.Schema({
  name: { type: String, required: true },
  value: { type: String, required: true },
});

// Main Order Schema
const orderSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client", // reference to Client model
      required: true,
    },
    orderId: {
      type: String,
      unique: true,
    },
    item: {
      type: String,
      required: true,
    },
    notes: {
      type: String,
    },
    deliveryDate: {
      type: Date,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    stitchCategory: {
      type: String,
      required: true,
    },
    customMeasurements: {
      type: [customMeasurementSchema],
      default: [],
    },
    orderStatus: {
      type: String,
      required: true,
      default: "Pending",
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt
  }
);

module.exports = mongoose.model("Order", orderSchema);
