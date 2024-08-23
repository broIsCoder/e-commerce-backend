const {
  sendResponse,
  handleServerError,
  handleBadRequest,
} = require("../utils/helperFunctions");
const mongoose = require('mongoose');
const Product = require("../models/Product");
const User = require("../models/User");

const getCart = async (req, res) => {
  try {
    const userId = req.userId;
    if(!userId){
      return handleBadRequest(res,400,"User ID was not provided")
    }
    const foundUser = await User.findById(userId).exec();
    if(!foundUser){
      return handleBadRequest(res,400,"User was not found")
    }
    return sendResponse(res, 200, { cart: foundUser.cart },'');
  } catch (error) {
    return handleServerError(res, `getCart() :: ${error.message}`);
  }
};

const addToCart = async (req, res) => {
  try {
    const { items } = req.body;
    const userId = req.userId;
    if(!userId){
      return handleBadRequest(res,400,"User ID was not provided")
    }
    const foundUser = await User.findById(userId).exec();
    if(!foundUser){
      return handleBadRequest(res,400,"User was not found")
    }
    for (const item of items) {
      const existingCartItem = foundUser.cart.items.find(
        (cartItem) =>
          cartItem.productId.toString() === item.productId.toString()
      );

      if (existingCartItem) {
        existingCartItem.quantity += item.quantity;
      } else {
        const newItem = {
          _id: new mongoose.Types.ObjectId(), // Generate new ObjectId
          productId: item.productId,
          quantity: item.quantity,
        };
        foundUser.cart.items.push(newItem);
      }
    }

    await foundUser.save();
    return sendResponse(res, 200, { newCart:foundUser.cart.items }, "Added To Cart");
  } catch (error) {
    return handleBadRequest(res, 400, `addToCart() :: ${error.message}`);
  }
};

const editCart = async (req, res) => {
  try {
    const { items } = req.body;
    const userId = req.userId;
    if(!userId){
      return handleBadRequest(res,400,"User ID was not provided")
    }
    const foundUser = await User.findById(userId).exec();
    if(!foundUser){
      return handleBadRequest(res,400,"User was not found")
    }

    for (const item of items) {
      const existingCartItem = foundUser.cart.items.find(
        (o) => o._id.toString() === item.cartId.toString()
      );
      if (existingCartItem) {
        const foundProduct = await Product.findById(existingCartItem.productId)
        if(foundProduct.availableQuantity >= item.quantity){
          foundProduct.quantity = item.quantity;
        }else{
          return handleBadRequest(
            res,
            400,
            `Out of Stock : ${foundProduct.productName}. Remaining ${foundProduct.availableQuantity}`
          );
        }
      } else {
        return handleBadRequest(
          res,
          400,
          `Cart items with Id :${item.productId} does not exist in your cart`
        );
      }
    }

    await foundUser.save();
    return sendResponse(res, 200, { cart: foundUser.cart.items }, "Cart Updated");
  } catch (error) {
    return handleBadRequest(res, 400, `editCart() :: ${error.message}`);
  }
};

const deleteCartItems = async (req, res) => {
  try {
    const {cartIds} = req.body;
    const userId = req.userId
    if(!userId){
      return handleBadRequest(res,400,"User ID was not provided")
    }
    const foundUser = await User.findById(userId).exec();
    if(!foundUser){
      return handleBadRequest(res,400,"User was not found")
    }

    for (const cartId of cartIds) {
      const cartItem = foundUser.cart.items.find(
        (o) => o._id.toString() === cartId
      );

      if (!cartItem) {
        return handleBadRequest(res, 400, `Cart ID: ${cartId} does not exist`);
      } else {
        foundUser.cart.items = foundUser.cart.items.filter(
          (i) => i._id.toString() !== cartId
        );
      }
    }

    await foundUser.save();
    return sendResponse(res, 200, {cart:foundUser.cart.items}, "Deleted from Cart");
  } catch (error) {
    return handleBadRequest(res, 400, `deleteCartItems() :: ${error.message}`);
  }
};

module.exports = { getCart, addToCart, editCart, deleteCartItems };
