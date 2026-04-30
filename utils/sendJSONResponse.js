"use strict";

const sendSuccessResponse = (res, statusCode, data) => {
  return res.status(statusCode).json({
    status: "success",
    success: true,
    data,
  });
};

const sendErrorResponse = (res, statusCode, message) => {
  return res.status(statusCode).json({
    status: "failed",
    success: false,
    data: message,
  });
};

module.exports = {
  sendSuccessResponse,
  sendErrorResponse,
};