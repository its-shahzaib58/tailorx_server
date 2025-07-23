const mongoose = require("mongoose");

const messageTemplateSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true, // e.g., "ready", "delivered"
    },
    name: {
      type: String,
      required: true, // e.g., "Order Ready"
    },
    template: {
      type: String,
      required: true, // e.g., "Hello [Customer Name]..."
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("MessageTemplate", messageTemplateSchema);
