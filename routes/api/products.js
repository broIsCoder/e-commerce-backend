const express = require("express");
const router = express.Router();

const {
  getCart,
  addToCart,
  editCart,
  deleteCartItems
} = require("../../controllers/cartController");

const {
  orderProducts,
  cancelOrders,
  getOrders,
  orderCart
} = require("../../controllers/orderController");

const {
  getAProduct,
  getAllProduct,
  rateAProduct
} = require("../../controllers/marketController");
const searchProducts = require("../../controllers/searchController")

const verifyRoles = require("../../middleware/verifyRoles");
const roles = require("../../config/roles");

router.get("/search", verifyRoles([roles.user]), searchProducts)
  .get("/getCart", verifyRoles([roles.user]), getCart)
  .post("/addToCart", verifyRoles([roles.user]), addToCart)
  .patch("/editCart", verifyRoles([roles.user]), editCart)
  .delete("/deleteCartItems", verifyRoles([roles.user]), deleteCartItems)
  .get("/getOrders", verifyRoles([roles.user]), getOrders)
  .post("/orderProducts", verifyRoles([roles.user]), orderProducts)
  .post("/orderCart", verifyRoles([roles.user]), orderCart)
  .post("/cancelOrders", verifyRoles([roles.user]), cancelOrders)
  .post("/rateProduct", verifyRoles([roles.user]), rateAProduct)
  .get("/", verifyRoles([roles.user]), getAllProduct)
  .get("/:id", verifyRoles([roles.user]), getAProduct)

module.exports = router;
