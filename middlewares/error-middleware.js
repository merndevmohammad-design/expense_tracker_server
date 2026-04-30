const { sendErrorResponse } = require("../utils/sendJSONResponse");

const errorMiddleware = (err, req, res, next) => {


  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return sendErrorResponse(res, 400, `${field} already exists`);
  }

  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map(
      (val) => val.message
    );
    return sendErrorResponse(res, 400, messages.join(", "));
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    return sendErrorResponse(res, 401, "Invalid token");
  }

  if (err.name === "TokenExpiredError") {
    return sendErrorResponse(res, 401, "Token expired");
  }

  // Default fallback
  return sendErrorResponse(
    res,
    err.status || 500,
    err.message || "Internal Server Error"
  );
};

module.exports = errorMiddleware;