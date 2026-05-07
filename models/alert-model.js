const mongoose = require("mongoose");

const AlertSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, required: true },
    categoryId: { type: mongoose.Schema.Types.ObjectId, default: null },
    month: { type: String, required: true },
    expenseDate: { type: Date, default: Date.now },

    type: {
      type: String,
      enum: ["NEAR_LIMIT", "EXCEEDED", "UNUSUAL", "TEST_ALERT"], 
      required: true,
    },

    message: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Alert", AlertSchema);