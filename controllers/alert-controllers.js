const Alert = require("../models/alert-model");
const jwt = require("jsonwebtoken");
const { GETJoiSchema } = require("../validators/alert-validator");
const { sendSuccessResponse, sendErrorResponse } = require("../utils/sendJSONResponse");
const { convertFromToPlusTime2CreatedAt } = require("../utils/datesManipulations");

const SORT_BY_FIELDS = ["createdAt"];

const getMyAlerts = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return sendErrorResponse(res, 401, "Authorization required");
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;

    const { value, error } = GETJoiSchema.validate(req.query);
    if (error) {
      return sendErrorResponse(res, 422, error.details[0].message);
    }

    const page = parseInt(value.page) || 1;
    const pageSize = parseInt(value.pageSize) || 10;

    const query = { userId };

    // 🔍 filters
    if (value.categoryId) {
      query.categoryId = value.categoryId;
    }

    if (value.month) {
      query.month = value.month;
    }

    // 📅 date filter
    if (value.from || value.to) {
      const dateFilter = convertFromToPlusTime2CreatedAt(
        value.from,
        value.to
      );
      if (dateFilter) query.createdAt = dateFilter;
    }

    // 📊 sorting
    let sortDoc = {};
    if (value.sortBy) {
      for (let field of SORT_BY_FIELDS) {
        if (value.sortBy === `${field}_ascending`) sortDoc[field] = 1;
        if (value.sortBy === `${field}_descending`) sortDoc[field] = -1;
      }
    }

    // 📦 data fetch
    const docs = await Alert.find(query)
      .skip(pageSize * (page - 1))
      .limit(pageSize)
      .sort(sortDoc);

    const docsCount = await Alert.countDocuments(query);

    return sendSuccessResponse(res, 200, {
      message: "Alerts fetched successfully",
      docs,
      docsCount,
      pages: Math.ceil(docsCount / pageSize),
      page,
      pageSize,
    });

  } catch (err) {
    next(err);
  }
};

module.exports = { getMyAlerts };