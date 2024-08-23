const Product = require("../models/Product");

const sendResponse = (res, status, data, message) => {
  return res.status(status).json({
    success: true,
    ...data,
    message,
  });
};

const handleBadRequest = (res, status, message) => {
  return res.status(status).json({
    success: false,
    message,
  });
};
const handleServerError = (res, message) => {
  return res.status(500).json({
    success: false,
    message,
  });
};

async function findUserInProduct(productId, userId) {
  try {
    const product = await Product.findOne({
      _id: productId,
      "delieveredBuyers.userId": userId,
    });
    if (product) {
      const currentUserActivity = product.delieveredBuyers.find(
        (buyer) => buyer.userId.toString() === userId.toString()
      );
      return currentUserActivity;
    } else {
      return null; // Product or user not found
    }
  } catch (error) {
    console.error("Error finding user in product:", error);
    throw error;
  }
}

module.exports = {
  sendResponse,
  handleBadRequest,
  handleServerError,
  findUserInProduct
};
