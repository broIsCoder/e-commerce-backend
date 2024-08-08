const User = require("../models/User");
const {
  sendResponse,
  handleBadRequest,
  handleServerError,
} = require("../utils/helperFunctions");

const logoutController = async (req, res) => {
  try {
    // NOTE : clear accessToken on client-side from (localstorage,sessionstorage,...)
    const cookies = req.cookies;

    // If refreshToken is not provided
    if (!cookies?.refreshToken) {
      return handleBadRequest(res, 401, "Refresh token was not provided");
    }

    const refreshToken = cookies.refreshToken;

    const foundUser = await User.findOne({ refreshToken }).exec();
    if (!foundUser) {
      return handleBadRequest(res, 401, "Invalid refresh token");
    }

    // Clear refreshToken of user from MongoDB
    foundUser.refreshToken = "";
    await foundUser.save(); // Save changes

    // Clear cookies on the client side
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",    // Set to true if using HTTPS or localhost(chrome)
      sameSite: "None",          // Use 'None' if frontend and backend are on different domains
    });

    return sendResponse(res, 200, {}, "You have logged out");
  } catch (error) {
    return handleServerError(res, `logoutController: ${error.message}`);
  }
};

module.exports = logoutController;
