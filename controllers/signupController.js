const User = require("../models/User");
const bcrypt = require("bcryptjs");
const { sendResponse, handleBadRequest, handleServerError } = require("../utils/helperFunctions");

const signupController = async (req, res) => {
  const { username, roles, password, email } = req.body;

  // Check if username, password, or email is provided
  if (!username || !password || !email) {
    return handleBadRequest(res, 400, "Username, Password, and Email are required");
  }

  try {
    // Search for duplicate email
    const duplicate = await User.findOne({ email: email }).exec();
    if (duplicate) {
      return handleBadRequest(res, 400, "User with given email already exists");
    }

    // Encrypt password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user and store in MongoDB
    const newUser = await User.create({
      username: username,
      email: email,
      roles: roles,
      password: hashedPassword,
    });

    // Respond with new User
    return sendResponse(res, 200, { user: newUser }, "New User has been created");
  } catch (error) {
    return handleServerError(res, `signupController: ${error.message}`);
  }
};

module.exports = signupController;
