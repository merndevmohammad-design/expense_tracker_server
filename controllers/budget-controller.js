const Budget = require("../models/budget-model");
const Expense = require("../models/expense-model");
const jwt = require("jsonwebtoken");

const {
  sendSuccessResponse,
  sendErrorResponse,
} = require("../utils/sendJSONResponse");

const {
  POSTJoiSchema,
  PATCHJoiSchema,
  GETJoiSchema,
} = require("../validators/budget-validator");



const SORT_BY_FIELDS = ["createdAt"];


const createBudget = async (req, res, next) => {
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

    const categoryId = value.categoryId || null;

  
    const existingBudget = await Budget.findOne({
      userId,
      month: value.month,
      categoryId, 
    });

    if (existingBudget) {
      return sendErrorResponse(
        res,
        400,
        categoryId
          ? "Budget already exists for this category in this month"
          : "Monthly budget already exists for this month"
      );
    }

   
    const budget = await Budget.create({
      userId,
      categoryId,
      month: value.month,
      limit: value.limit,
    });

    return sendSuccessResponse(res, 201, {
      message: "Budget created successfully",
      doc: budget,
    });

  } catch (err) {
    next(err);
  }
};


     const getBudgets = async (req, res, next) => {
  try {
    // 🔐 auth
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return sendErrorResponse(res, 401, "Authorization required");
    }

    const { userId } = jwt.verify(token, process.env.JWT_SECRET);

    const { value, error } = GETJoiSchema.validate(req.query);
    if (error) {
      return sendErrorResponse(res, 422, error.details[0].message);
    }

    const query = { userId };

    if (value.month) query.month = value.month;
    if (value.categoryId) query.categoryId = value.categoryId;

    const page = Number(value.page) || 1;
    const pageSize = Number(value.pageSize) || 10;

   
    let sortDoc = {};
    if (value.sortBy) {
      const [field, order] = value.sortBy.split("_");
      if (SORT_BY_FIELDS.includes(field)) {
        sortDoc[field] = order === "ascending" ? 1 : -1;
      }
    }

    const docs = await Budget.find(query)
      .populate("categoryId", "name") 
      .sort(sortDoc)
      .skip((page - 1) * pageSize)
      .limit(pageSize);

    const count = await Budget.countDocuments(query);

    return sendSuccessResponse(res, 200, {
      message: "Budgets fetched successfully",
      docs,
      count,
      pages: Math.ceil(count / pageSize),
      page,
      pageSize,
    });

  } catch (err) {
    next(err);
  }
};

const getBudgetById = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return sendErrorResponse(res, 401, "Authorization required");
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;

    const { id } = req.params;


    const budget = await Budget.findOne({
      _id: id,
      userId,
    }).populate("categoryId", "name"); 

    if (!budget) {
      return sendErrorResponse(res, 404, "Budget not found");
    }

    return sendSuccessResponse(res, 200, {
      message: "Budget fetched successfully",
      doc: budget,
    });

  } catch (error) {
    next(error);
  }
};


const updateBudget = async (req, res, next) => {
  try {
    const { value } = PATCHJoiSchema.validate(req.body);

    const token = req.headers.authorization?.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const budget = await Budget.findOneAndUpdate(
      { _id: req.params.id, userId: decoded.userId },
      value,
      { new: true }
    );

    if (!budget) {
      return sendErrorResponse(res, 404, "Budget not found");
    }

    return sendSuccessResponse(res, 200, {
      message: "Budget updated successfully",
      doc: budget,
    });
  } catch (err) {
    next(err);
  }
};

const deleteBudget = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const budget = await Budget.findOneAndDelete({
      _id: req.params.id,
      userId: decoded.userId,
    });

    if (!budget) {
      return sendErrorResponse(res, 404, "Budget not found");
    }

    return sendSuccessResponse(res, 200, {
      message: "Budget deleted successfully",
    });
  } catch (err) {
    next(err);
  }
};




const getBudgetsTracking = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return sendErrorResponse(res, 401, "Authorization required");
    }

    const { userId } = jwt.verify(token, process.env.JWT_SECRET);

    const { value, error } = GETJoiSchema.validate(req.query);
    if (error) {
      return sendErrorResponse(res, 422, error.details[0].message);
    }

    const page = Number(value.page) || 1;
    const pageSize = Number(value.pageSize) || 10;

    const query = { userId };

    if (value.month) query.month = value.month;
    if (value.categoryId) query.categoryId = value.categoryId;

    let sortDoc = {};
    if (value.sortBy) {
      const [field, order] = value.sortBy.split("_");
      sortDoc[field] = order === "ascending" ? 1 : -1;
    }

    const budgets = await Budget.find(query)
      .populate("categoryId", "name")
      .sort(sortDoc)
      .skip((page - 1) * pageSize)
      .limit(pageSize);

    const count = await Budget.countDocuments(query);

    // ⚡ FIX: handle NULL category ALSO
    const categoryIds = budgets
      .map(b => b.categoryId?._id)
      .filter(Boolean);

    // 🔥 IMPORTANT: also fetch null-category expenses
    const expenses = await Expense.find({
      userId,
      $or: [
        { categoryId: { $in: categoryIds } },
        { categoryId: null }
      ],
    });

    // 🧠 group expenses
    const expenseMap = {};

    expenses.forEach((e) => {
      const key = e.categoryId ? e.categoryId.toString() : "null";

      if (!expenseMap[key]) expenseMap[key] = 0;
      expenseMap[key] += e.amount;
    });

    // 📊 result
    const result = budgets.map((budget) => {
      const catId = budget.categoryId?._id?.toString() || "null";

      const totalExpense = expenseMap[catId] || 0;
      const remaining = budget.limit - totalExpense;

      return {
        user: userId,
        expense: totalExpense,
        budget: budget.limit,
        remaining,
        category: budget.categoryId?.name || "General",
        month: budget.month,
      };
    });

    return sendSuccessResponse(res, 200, {
      message: "Budget tracking fetched successfully",
      docs: result,
      count,
      pages: Math.ceil(count / pageSize),
      page,
      pageSize,
    });

  } catch (err) {
    next(err);
  }
};

module.exports = {
  createBudget,
  getBudgets,
  updateBudget,
  deleteBudget,
  getBudgetById,
    getBudgetsTracking,
};