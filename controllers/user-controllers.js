const jwt = require("jsonwebtoken");
const User = require("../models/user-model");
const { sendSuccessResponse, sendErrorResponse } = require("../utils/sendJSONResponse");

const myProfile = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // 1. Check token exists
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return sendErrorResponse(res, 401, "Authorization required. Please login first.");
    }

    const token = authHeader.split(" ")[1];

    // 2. Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return sendErrorResponse(res, 401, "Invalid or expired token");
    }

    const userId = decoded.userId;

    if (!userId) {
      return sendErrorResponse(res, 401, "Unauthorized");
    }

    // 3. Get user
    const user = await User.findById(userId).select("-password");

    if (!user) {
      return sendErrorResponse(res, 404, "User not found");
    }

    // 4. Response
    return sendSuccessResponse(res, 200, {
      message: "Profile fetched successfully",
      doc: {
        id: user._id,
        firstName: user.firstName || null,
        lastName: user.lastName || null,
        username: user.username || null,
        email: user.email || null,
        phone: user.phone || null,
        isAdmin: user.isAdmin,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });

  } catch (error) {
    next(error);
  }
};

module.exports = { myProfile };