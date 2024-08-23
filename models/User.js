const mongoose = require("mongoose");
const { Schema, model } = mongoose;
const roles = require("../config/roles");

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      minlength: 3,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      match: [/^\S+@\S+\.\S+$/, "Please use a valid email address"],
      index: true,
    },
    roles: {
      user: {
        type: Number,
        default: roles.user,
      },
      employee: {
        type: Number,
        default: null,
      },
    },
    password: {
      type: String,
      required: true,
      minlength: 4,
    },
    refreshToken: {
      type: String,
      default: null,
    },
    cart: {
      items: [
        {
          productId: {
            type: mongoose.Types.ObjectId,
            ref: "Product",
            required: true,
          },
          quantity: {
            type: Number,
            required: true,
            min: 1,
          },
        },
      ],
    },
    orders: [
      {
        items: [
          {
            productId: {
              type: mongoose.Types.ObjectId,
              ref: "Product",
              required: true,
            },
            quantity: {
              type: Number,
              required: true,
              min: 1,
            },
            price: {
              type: Number,
              required: true,
              min: 0,
            },
          },
        ],
        totalAmount: {
          type: Number,
          required: true,
          min: 0,
        },
        orderStatus: {
          type: String,
          enum: ["Pending", "Delivered", "Cancelled"],
          default: "Pending",
        },
        orderDate: {
          type: Date,
          default: Date.now,
        },
        deliveredDate: {
          type: Date,
          default: null, 
        },
      },
    ],
    totalRevenue: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = model("User", userSchema);
