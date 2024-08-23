const Product = require("../models/Product");
const User = require("../models/User");
const {
  handleServerError,
  handleBadRequest,
  sendResponse,
} = require("../utils/helperFunctions");

const getOrders = async (req, res) => {
  try {
    const userId = req.userId;
    if(!userId){
      handleBadRequest(res,400,"User ID was not provided")
    }
    const foundUser = await User.findById(userId).exec();
    if(!foundUser){
      handleBadRequest(res,400,"User was not found")
    }

    return sendResponse(
      res,
      200,
      { orders: foundUser.orders },
      "All Your Orders"
    );
  } catch (error) {
    return handleServerError(res, `getOrders() :: ${error.message}`);
  }
};

const orderProducts = async (req, res) => {
  try {
    const { orders } = req.body;
    const userId = req.userId;
    if(!userId){
      handleBadRequest(res,400,"User ID was not provided")
    }
    const foundUser = await User.findById(userId).exec();
    if(!foundUser){
      handleBadRequest(res,400,"User was not found")
    }

    for (const order of orders) {
      let totalAmount = 0;
      const items = [];

      for (const item of order.items) {
        if (!item.productId) {
          return handleBadRequest(res, 400, "Product ID was not provided");
        }
        const foundProduct = await Product.findById(item.productId).exec();
    
        if (!foundProduct) {
          return handleBadRequest(res, 404, "Product not found");
        }

        if (foundProduct.availableQuantity >= item.quantity) {
          foundProduct.availableQuantity -= item.quantity;
          foundProduct.orders.push({userId:foundUser._id})
          await foundProduct.save();
          items.push({ ...item, price: foundProduct.price });
          totalAmount += item.quantity * foundProduct.price;
        } else {
          return handleBadRequest(
            res,
            400,
            `Out of Stock ${foundProduct.productName}. Remaining: ${foundProduct.availableQuantity}`
          );
        }
      }

      foundUser.orders.push({ items, totalAmount });
    }

    await foundUser.save();
    return sendResponse(
      res,
      200,
      { orders: foundUser.orders },
      "Products have been ordered"
    );
  } catch (error) {
    return handleServerError(res, `orderProducts() :: ${error.message}`);
  }
};

const orderCart = async (req, res) => {
  try {
    const { orders } = req.body;
    const userId = req.userId;
    if(!userId){
      handleBadRequest(res,400,"User ID was not provided")
    }
    const foundUser = await User.findById(userId).exec();
    if(!foundUser){
      handleBadRequest(res,400,"User was not found")
    }

    let items = [];
    let totalAmount = 0;
    for (const cartId of orders) {
      const cartItem = foundUser.cart.items.find(
        (o) => o._id.toString() === cartId.toString()
      );
      if (!cartItem) {
        return handleBadRequest(res, 400, `Cart ID: ${cartId} does not exist`);
      } else {
        if (!cartItem.productId) {
          return handleBadRequest(res, 400, "Product ID was not provided");
        }
        const foundProduct = await Product.findById(cartItem.productId).exec();
    
        if (!foundProduct) {
          return handleBadRequest(res, 404, "Product not found");
        }

        if (foundProduct.availableQuantity >= cartItem.quantity) {
          foundProduct.availableQuantity -= cartItem.quantity;
          foundProduct.orders.push({userId:foundUser._id})
          await foundProduct.save();
          totalAmount += cartItem.quantity * foundProduct.price;
          items.push({
            productId: cartItem.productId,
            quantity: cartItem.quantity,
            price: foundProduct.price,
          });

          foundUser.cart.items = foundUser.cart.items.filter(
            (i) => i._id.toString() !== cartId
          );
        } else {
          return handleBadRequest(
            res,
            400,
            `Out of Stock ${foundProduct.productName}. Remaining: ${foundProduct.availableQuantity}`
          );
        }
      }
    }

    foundUser.orders.push({ items, totalAmount });
    await foundUser.save();
    return sendResponse(
      res,
      200,
      { orders: foundUser.orders },
      "Your Cart has been ordered"
    );
  } catch (error) {
    return handleServerError(res, `orderCart() :: ${error.message}`);
  }
};

const cancelOrders = async (req, res) => {
  try {
    const userId = req.userId;
    const { cancelOrders } = req.body;
    if(!userId){
      handleBadRequest(res,400,"User ID was not provided")
    }
    const foundUser = await User.findById(userId).exec();
    if(!foundUser){
      handleBadRequest(res,400,"User was not found")
    }

    for (const orderId of cancelOrders) {
      if (!orderId) {
        return handleBadRequest(res, 400, "Order ID was not provided");
      }
      const orderToCancel = foundUser.orders.find(
        (o) => o._id.toString() === orderId
      );

      if (!orderToCancel) {
        return handleBadRequest(
          res,
          400,
          `Order with ID: ${orderId} doesn't exist`
        );
      }

      if (orderToCancel.orderStatus === "Cancelled") {
        return handleBadRequest(
          res,
          400,
          `Order with ID: ${orderId} is already cancelled`
        );
      }

      orderToCancel.orderStatus = "Cancelled";

      // Recover cancelled products in market
      for (const item of orderToCancel.items) {
        try {
          if (!item.productId) {
            return handleBadRequest(res, 400, "Product ID was not provided");
          }
          const cancelledProduct = await Product.findById(item.productId).exec();
      
          if (!cancelledProduct) {
            return handleBadRequest(res, 404, "Product not found");
          }
          cancelledProduct.availableQuantity += item.quantity;
          await cancelledProduct.save();
        } catch (error) {
          return handleServerError(res, `cancelOrder() :: ${error.message}`);
        }
      }
    }

    await foundUser.save();
    return sendResponse(
      res,
      200,
      { orders: foundUser.orders },
      "Orders were cancelled"
    );
  } catch (error) {
    return handleServerError(res, `cancelOrders() :: ${error.message}`);
  }
};

module.exports = {
  getOrders,
  orderProducts,
  orderCart,
  cancelOrders,
};
