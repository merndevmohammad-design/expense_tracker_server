const { sendErrorResponse } = require("../utils/sendJSONResponse");

const notFound = (req, res, next) => {
  return sendErrorResponse(res, 404, `Route not found: ${req.originalUrl}`);
};

module.exports = notFound;