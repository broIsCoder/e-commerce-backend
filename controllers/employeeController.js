const Product = require("../models/Product");
const {
  sendResponse,
  handleServerError,
  handleBadRequest,
} = require("../utils/helperFunctions");
const {extractPublicId, deleteCloudinaryImage} = require("../config/cloudinary");
const allowedCategory = require("../models/allowedCategory");

const getMyProducts = async (req, res) => {
  try {
    if (!req.email) {
      return handleBadRequest(res, 400, "Email was not provided");
    }

    const foundProducts = await Product.find({ email: req.email }).exec();

    if (foundProducts.length === 0) {
      return sendResponse(res, 200, { myProducts: [] }, `No Products sold by ${req.email}`);
    }

    return sendResponse(res, 200, { myProducts: foundProducts });
  } catch (error) {
    return handleServerError(res, `getMyProducts: ${error.message}`);
  }
};

const getAllowedCategory = async(req,res)=>{
  try {
    return sendResponse(
    res,
    201,
    { categories: allowedCategory },
    "All Allowed Categories for Products"
  );
  } catch (error) {
    return handleServerError(res, `getAllowedCategory () :: ${error.message}`);
  }
}
const sellProduct = async (req, res) => {
  try {
    const email = req.email;
    const images = req.files ;
    const {
      productName,
      description,
      price,
      category,
      availableQuantity,
    } = req.body;

    const missingFields = [];

    if (!productName) missingFields.push("productName");
    if (!email) missingFields.push("email");
    if (!price) missingFields.push("price");
    if (!category) missingFields.push("category");
    if (!availableQuantity) missingFields.push("availableQuantity");
    if (!images || images.length === 0) missingFields.push("images");

    if (missingFields.length > 0) {
      return handleBadRequest(res, 400, `Required: ${missingFields.join(", ")}`);
    }
    
    const imageUrls = req.files.map(file => file.path);

    const newProduct = await Product.create({
      productName,
      email,
      description,
      price,
      images: imageUrls, // Use the array of image URLs
      category,
      availableQuantity,
    });

    return sendResponse(
      res,
      201,
      { product: newProduct },
      "New Product has been added to sales"
    );
  } catch (error) {
    return handleServerError(res, `sellProduct() :: ${error.message}`);
  }
};


const removeProduct = async (req, res) => {
  try {
    const email = req.email;
    const { productId } = req.body;

    if (!productId) {
      return handleBadRequest(res, 400, "Product ID was not provided");
    }

    const foundProduct = await Product.findById(productId).exec();

    if (!foundProduct) {
      return handleBadRequest(res, 404, "Product with given ID does not exist");
    }

    if (foundProduct.email !== email) {
      return handleBadRequest(
        res,
        403,
        "You are not authorized to remove this product"
      );
    }

    // Delete images from Cloudinary
    const deletePromises = foundProduct.images.map(imageUrl => {
      const publicId = extractPublicId(imageUrl);
      return publicId ? deleteCloudinaryImage(publicId) : Promise.resolve();
    });

    await Promise.all(deletePromises);

    // Remove product from database
    const result = await Product.findByIdAndDelete(productId);

    return sendResponse(
      res,
      200,
      { removedProduct: result },
      "The Product and its images have been removed"
    );
  } catch (error) {
    return handleServerError(res, `removeProduct() :: ${error.message}`);
  }
};

module.exports = {
  getMyProducts,
  getAllowedCategory,
  sellProduct,
  removeProduct,
};