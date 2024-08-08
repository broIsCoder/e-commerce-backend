const jwt = require("jsonwebtoken");
const { handleBadRequest, handleServerError } = require("../utils/helperFunctions");

const verifyJwt = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return handleBadRequest(res, 400, "Auth Header was not provided or is not in the correct format");
  }
  
  const accessToken = authHeader.split(" ")[1];
  if (!accessToken) {
    return handleBadRequest(res, 400, "AccessToken was not provided");
  }

  try {
    // Verify the accessToken
    jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
      if (err) {
        return handleBadRequest(res, 401, "Invalid accessToken");
      }

      // Pass roles to verify role
      req.roles = decoded.userInfo.roles;
      req.email = decoded.userInfo.email;
      req.userId = decoded.userInfo.id;

      // Proceed to the next middleware or route handler
      next();
    });
  } catch (error) {
    return handleServerError(res, `verifyJwt(): ${error.message}`);
  }
};

module.exports = verifyJwt;
