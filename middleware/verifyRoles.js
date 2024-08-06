const { handleBadRequest, handleServerError } = require("../utils/helperFunctions");

const verifyRoles = (requiredRoles) => {
  return (req, res, next) => {
    try {
      const userRoles = req.roles;
      // verify roles
      const verifying = requiredRoles.map((role) => userRoles.includes(role));
      
      // if not eligible role
      if (!verifying.includes(false)) {
        return next();
      }
      return handleBadRequest(res, 403, "Unathorized To Access");
    } catch (error) {
      return handleServerError(res,`verifyRoles() : ${error.message}`)
    }
  };
};

module.exports = verifyRoles;
