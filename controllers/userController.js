const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const {
  sendResponse,
  handleBadRequest,
  handleServerError,
} = require("../utils/helperFunctions");

const userController = async (req, res) => {
  try {
    // Search for existing user by email
    const foundUser = await User.findById(req.userId).exec();
    if (!foundUser) {
      return handleBadRequest(res, 401, "User with given id does not exist");
    }
    // Respond with authToken
    return sendResponse(
      res,
      200,
      { user: foundUser },
      "New Session Started"
    );
  } catch (error) {
    return handleServerError(res, `userController: ${error.message}`);
  }
};

module.exports = userController;
