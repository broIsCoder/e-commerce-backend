const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { sendResponse, handleBadRequest, handleServerError } = require("../utils/helperFunctions");

const loginController = async (req, res) => {
  const { email, password } = req.body;

  // Check if email and password are provided
  if (!email || !password) {
    return handleBadRequest(res, 401, "Email and Password are required");
  }

  try {
    // Search for existing user by email
    const foundUser = await User.findOne({ email: email }).exec();
    if (!foundUser) {
      return handleBadRequest(res, 401, "User with given email does not exist");
    }

    // Compare the provided password with the stored password
    const authentication = await bcrypt.compare(password, foundUser.password);
    if (!authentication) {
      return handleBadRequest(res, 401, "Password is incorrect");
    }

    const roles = Object.values(foundUser.roles); // Eg: {"Users":2000,"Employee":3000} --> [2000, 3000]

    // Generate authToken
    const authToken = jwt.sign(
      {
        userInfo: {
          id: foundUser._id,
          email: foundUser.email,
          roles: roles,
        },
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "30m" }
    );

    // Generate refreshToken
    const refreshToken = jwt.sign(
      { id: foundUser._id },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "7d" }
    );

    // Store refreshToken in MongoDB
    foundUser.refreshToken = refreshToken;
    await foundUser.save();
    
    // Set refreshToken as http-only-cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Set to true if using HTTPS or localhost(chrome)
      sameSite: 'None', // Use 'None' if frontend and backend are on different domains
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
    });    

    // Respond with authToken
    return sendResponse(res, 200, { authToken }, "Login successful");
  } catch (error) {
    return handleServerError(res, `loginController: ${error.message}`);
  }
};

module.exports = loginController;
