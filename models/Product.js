const mongoose = require("mongoose");
const { Schema, model } = mongoose;
const allowedCategories = require("./allowedCategory");

const productSchema = new Schema({
  productName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  description: String,
  price: {
    type: Number,
    required: true,
  },
  images: [
    {
      type: String,
      default: null,
    },
  ],
  category: {
    type: String,
    enum: allowedCategories,
    default: "General",
  },
  availableQuantity: {
    type: Number,
    required: true,
  },
  rating: {
    type: Number,
    default: 0,
  },
  productQuantitySold: {
    type: Number,
    required: true,
    default: 0,
    min: 0,
  },
  delieveredBuyers: [
    {
      userId: {
        type: mongoose.Types.ObjectId,
        ref: "User",
      },
      userRating: {
        type: Number,
        default: 0,
      },
    },
  ],
  productTotalRevenue: {
    type: Number,
    required: true,
    min: 0,
    default: 0,
  },
  orders: [
    {
      userId: {
        type: mongoose.Types.ObjectId,
        ref: "User",
      },
    },
  ],
});

module.exports = model("product", productSchema);
