const Product = require("../models/Product");
const {
  sendResponse,
  handleServerError,
  handleBadRequest,
  findUserInProduct
} = require("../utils/helperFunctions");

// Retrieve all products
const getAllProduct = async (req, res) => {
  try {
    const allProducts = await Product.find().exec();
    if (!allProducts) {
      return handleBadRequest(res, 400, "Not able to get all products");
    }
    const message = allProducts.length
      ? "All Products In Market"
      : "Market is Empty";
    return sendResponse(res, 200, { products: allProducts }, message);
  } catch (error) {
    return handleServerError(res, `getAllProduct() :: ${error.message}`);
  }
};

// Retrieve a specific product by ID
const getAProduct = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return handleBadRequest(res, 400, `Product ID was not provided : ${id}`);
    }
    const foundProduct = await Product.findById(id).exec();
    if (!foundProduct) {
      return handleBadRequest(res, 400, `Product ${id} does not exists`);
    } else {
      const currentUserActivityInProduct = await findUserInProduct(foundProduct._id,req.userId)
      return sendResponse(
        res,
        200,
        { product: foundProduct ,currentUserActivityInProduct},
        "Requested Product"
      );
    }
  } catch (error) {
    return handleServerError(res, `getAProduct() :: ${error.message}`);
  }
};

const rateAProduct = async (req, res) => {
  try {
    const userId = req.userId;
    const { productId, rating } = req.body;
    if (!productId) {
      return handleBadRequest(
        res,
        400,
        `Product productId was not provided : ${productId}`
      );
    }
    const foundProduct = await Product.findById(productId).exec();
    if (!foundProduct) {
      return handleBadRequest(res, 400, `Product ${productId} does not exists`);
    } else {
      const foundBuyer = foundProduct.delieveredBuyers.find(
        (buyer) => buyer.userId == userId
      );
      if (!foundBuyer) {
        return handleBadRequest(
          res,
          400,
          `You must purchase the product to rate it`
        );
      } else {
        foundBuyer.userRating = rating > 5 ? 5 : rating < 0 ? 0 : rating;
        const totalRating = foundProduct.delieveredBuyers.reduce(
          (sum, buyer) => sum + buyer.userRating,
          0
        );
        const numberOfRatings = foundProduct.delieveredBuyers.length;
        const averageRating =
          numberOfRatings > 0 ? totalRating / numberOfRatings : 0;
        const finalRating = Number(averageRating.toFixed(1)); // Rounds to one decimal place

        foundProduct.rating = finalRating;
        await foundProduct.save();
        return sendResponse(
          res,
          200,
          { product: foundProduct },
          "Product rated successfully"
        );
      }
    }
  } catch (error) {
    return handleServerError(res, `rateAProduct() :: ${error.message}`);
  }
};

module.exports = {
  getAProduct,
  getAllProduct,
  rateAProduct,
};
