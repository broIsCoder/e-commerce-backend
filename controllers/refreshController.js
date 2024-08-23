const jwt = require("jsonwebtoken");
const User = require("../models/User");
const {
  sendResponse,
  handleBadRequest,
  handleServerError,
} = require("../utils/helperFunctions");

const refreshController = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    return handleBadRequest(
      res,
      401,
      'No refresh token provided'
    );
  }

  try {
    // search user with refreshToken
    const foundUser = await User.findOne({ refreshToken }).exec();

    // if user with such refreshToken is not founded
    if (!foundUser) {
      return handleBadRequest(
        res,
        401,
        "User not found"
      );
    }

    // verify refreshToken with secret
    jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET,
      (err, decoded) => {
        if (err) {
          return handleBadRequest(res, 401, "Invalid RefreshToken");
        }
        const roles = Object.values(foundUser.roles); // Eg: {"Users":2000,"Employee":3000} --> [2000,3000]

        const newAuthToken = jwt.sign(
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

        // Respond with authToken
        return sendResponse(res, 200, { authToken:newAuthToken }, "AuthToken has been refreshed");
      });
  } catch (error) {
    return handleServerError(res, `refreshController: ${error.message}`);
  }
};

module.exports = refreshController;
