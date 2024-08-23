const Product = require("../models/Product");
const { sendResponse, handleServerError } = require("../utils/helperFunctions");

const searchProducts = async (req, res) => {
  try {
     const { productName, category, minPrice, maxPrice } = req.query;
     
    // Build the search query
    let query = {};

    if (productName) {
      query.productName = { $regex: productName, $options: 'i' };
    }

    if (category) {
      query.category = category;
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) {
        query.price.$gte = parseFloat(minPrice);
      }
      if (maxPrice) {
        query.price.$lte = parseFloat(maxPrice);
      }
    }

    // If no filters are provided, return all products
    if (Object.keys(query).length === 0) {
      query = {};
    }
    
    // Fetch the products based on the search query and return them
    const products = await Product.find(query);
  
    return sendResponse(
      res,
      200,
      { success: true, count: products.length, products },
      "Search results retrieved successfully"
    );
  } catch (error) {
    console.error("Error in searchProducts:", error);
    return handleServerError(res, `searchProducts() :: ${error.message}`);
  }
};

module.exports = searchProducts;
