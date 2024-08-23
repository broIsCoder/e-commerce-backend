const express = require("express");
const router = express.Router();
const multer = require("multer");
const { storage } = require("../../config/cloudinary");
const upload = multer({
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024, files: 5 }, // 50 MB file size limit, max 5 files
});

const {
  sellProduct,
  removeProduct,
  getMyProducts,
  getAllowedCategory
} = require("../../controllers/employeeController");

const verifyRoles = require("../../middleware/verifyRoles");
const roles = require("../../config/roles");
const { handleBadRequest, handleServerError } = require("../../utils/helperFunctions");

router.get("/getMyProducts", verifyRoles([roles.user, roles.employee]), getMyProducts)
      .get("/getAllowedCategory",verifyRoles([roles.user,roles.employee]),getAllowedCategory)

router.post(
  "/sellProduct",
  (req, res, next) => {
    //multer middleware to upload file to storage(cloudinary) with callback to handle error
    upload.array("images", 5)(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_UNEXPECTED_FILE") {
          return handleBadRequest(res,400,"You can only upload up to 5 images")
        }
        return handleBadRequest(res,400,err.message + ", You can only upload up to 5 images")
      } else if (err) {
        return handleServerError(res, `multer Upload :: ${err.message}`);
      }
      next();
    });
  },
  verifyRoles([roles.employee]),
  sellProduct
);

router.delete("/removeProduct", verifyRoles([roles.employee]), removeProduct);

module.exports = router;
