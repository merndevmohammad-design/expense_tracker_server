const Expense = require("../models/expense-model");
const Category = require("../models/category-model");
const Budget = require("../models/budget-model");
const jwt = require("jsonwebtoken");

const {
  sendSuccessResponse,
  sendErrorResponse,
} = require("../utils/sendJSONResponse");

const {
  POSTJoiSchema,
  PATCHJoiSchema,
  GETJoiSchema,
} = require("../validators/expense-validator");

const {
  convertFromToPlusTime2CreatedAt,
} = require("../utils/datesManipulations");

const SORT_BY_FIELDS = ["createdAt"];



  const createExpense = async (req, res, next) => {
  try {
    const { value, error } = POSTJoiSchema.validate(req.body);
    if (error) {
      return sendErrorResponse(res, 422, error.details[0].message);
    }

    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return sendErrorResponse(res, 401, "Authorization required");
    }

    const { userId } = jwt.verify(token, process.env.JWT_SECRET);

    const date = new Date(value.date || new Date());
    const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

    let budget;

  
    if (!value.categoryId) {
      budget = await Budget.findOne({
        userId,
        month,
        categoryId: null,
      });

      if (!budget) {
        return sendErrorResponse(
          res,
          404,
          `No monthly budget found for ${month}. Please create budget first.`
        );
      }
    }

 
    else {
      budget = await Budget.findOne({
        userId,
        month,
        categoryId: value.categoryId,
      });

      if (!budget) {
        return sendErrorResponse(
          res,
          404,
          `No budget found for this category in ${month}`
        );
      }
    }

    const expense = await Expense.create({
      userId,
      amount: value.amount,
      categoryId: value.categoryId || null,
      date,
      note: value.note,
    });

    return sendSuccessResponse(res, 201, {
      message: "Expense created successfully",
      doc: expense,
    });

  } catch (err) {
    next(err);
  }
};


const getExpenses = async (req, res, next) => {
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


    if (value.categoryId) {
      query.categoryId = value.categoryId;
    }

   
    if (value.from || value.to) {
      const dateFilter = convertFromToPlusTime2CreatedAt(
        value.from,
        value.to
      );
      if (dateFilter) query.date = dateFilter;
    }

    let sortDoc = {};
    if (value.sortBy) {
      for (let field of SORT_BY_FIELDS) {
        if (value.sortBy === `${field}_ascending`) sortDoc[field] = 1;
        if (value.sortBy === `${field}_descending`) sortDoc[field] = -1;
      }
    }

    const docs = await Expense.find(query)
      .populate("categoryId", "name") 
      .skip(pageSize * (page - 1))
      .limit(pageSize)
      .sort(sortDoc);

    const docsCount = await Expense.countDocuments(query);

    return sendSuccessResponse(res, 200, {
      message: "All expenses fetched",
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






const updateExpense = async (req, res, next) => {
  try {
    const { value, error } = PATCHJoiSchema.validate(req.body);
    if (error) {
      return sendErrorResponse(res, 422, error.details[0].message);
    }

    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return sendErrorResponse(res, 401, "Authorization required");
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;

    const { id } = req.params;

    const updated = await Expense.findOneAndUpdate(
      { _id: id, userId },
      value,
      { new: true }
    );

    if (!updated) {
      return sendErrorResponse(res, 404, "Expense not found");
    }

    return sendSuccessResponse(res, 200, {
      message: "Expense updated successfully",
      doc: updated,
    });
  } catch (err) {
    next(err);
  }
};



const getExpenseById = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return sendErrorResponse(res, 401, "Authorization required");
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;

    const { id } = req.params;

   
    const expense = await Expense.findOne({
      _id: id,
      userId,
    });

    if (!expense) {
      return sendErrorResponse(res, 404, "Expense not found");
    }

    const category = await Category.findById(expense.categoryId);

    return sendSuccessResponse(res, 200, {
      message: "Expense fetched successfully",
      doc: {
        _id: expense._id,
        amount: expense.amount,
        date: expense.date,
        note: expense.note,
        category: {
          _id: category?._id,
          name: category?.name,
        },
        createdAt: expense.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};



const deleteExpense = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return sendErrorResponse(res, 401, "Authorization required");
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;

    const { id } = req.params;

    const deleted = await Expense.findOneAndDelete({
      _id: id,
      userId,
    });

    if (!deleted) {
      return sendErrorResponse(res, 404, "Expense not found");
    }

    return sendSuccessResponse(res, 200, {
      message: "Expense deleted successfully",
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createExpense,
  getExpenses,
  updateExpense,
  deleteExpense,
    getExpenseById,
};