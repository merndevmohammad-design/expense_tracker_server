const Category = require("../models/category-model");
const jwt = require("jsonwebtoken");

const {
  sendSuccessResponse,
  sendErrorResponse,
} = require("../utils/sendJSONResponse");

const { GETJoiSchema,PATCHJoiSchema } = require("../validators/categoryValidation");

const SORT_BY_FIELDS = ["createdAt"];



const createCategory = async (req, res, next) => {
  try {
    const { name } = req.body;

    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return sendErrorResponse(res, 401, "Authorization required");
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;

    const exist = await Category.findOne({ name, user: userId });

    if (exist) {
      return sendErrorResponse(res, 400, "Category already exists");
    }

    const category = await Category.create({
      name,
      user: userId,
      isDefault: false,
    });

    return sendSuccessResponse(res, 201, {
      message: "Category created successfully",
      doc: category,
    });
  } catch (error) {
    next(error);
  }
};



const getCategories = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return sendErrorResponse(res, 401, "Authorization required");
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;

   
    const { value: validData, error } = GETJoiSchema.validate(req.query);
    if (error) {
      return sendErrorResponse(res, 422, error.details[0].message);
    }

    const page = parseInt(validData.page) || 1;
    const pageSize = parseInt(validData.pageSize) || 10;

    const queryFilterDoc = {
      $or: [{ isDefault: true }, { user: userId }],
    };


    if (validData.keyword) {
      queryFilterDoc.name = {
        $regex: validData.keyword,
        $options: "i",
      };
    }

    
    let sortDoc = {};
    if (validData.sortBy) {
      for (let field of SORT_BY_FIELDS) {
        if (validData.sortBy === `${field}_ascending`) {
          sortDoc[field] = 1;
        }
        if (validData.sortBy === `${field}_descending`) {
          sortDoc[field] = -1;
        }
      }
    }

    const docs = await Category.find(queryFilterDoc)
      .skip(pageSize * (page - 1))
      .limit(pageSize)
      .sort(sortDoc);

    const docsCount = await Category.countDocuments(queryFilterDoc);
    const pages = Math.ceil(docsCount / pageSize);

    return sendSuccessResponse(res, 200, {
      message: "All categories fetched",
      docs,
      docsCount,
      pages,
      page,
      pageSize,
    });
  } catch (error) {
    next(error);
  }
};


const getCategoryById = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return sendErrorResponse(res, 401, "Authorization required");
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;

    const { id } = req.params;

    const category = await Category.findOne({
      _id: id,
      $or: [{ isDefault: true }, { user: userId }],
    });

    if (!category) {
      return sendErrorResponse(res, 404, "Category not found");
    }

    return sendSuccessResponse(res, 200, {
      message: "Category fetched successfully",
      doc: category,
    });
  } catch (error) {
    next(error);
  }
};



const deleteCategory = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return sendErrorResponse(res, 401, "Authorization required");
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;

    const { id } = req.params;

    const category = await Category.findById(id);

    if (!category) {
      return sendErrorResponse(res, 404, "Category not found");
    }

    if (category.isDefault) {
      return sendErrorResponse(res, 403, "Default category cannot be deleted");
    }

    if (category.user.toString() !== userId) {
      return sendErrorResponse(res, 403, "Not allowed");
    }

    await category.deleteOne();

    return sendSuccessResponse(res, 200, {
      message: "Category deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

const updateCategory = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return sendErrorResponse(res, 401, "Authorization required");
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;

    const { id } = req.params;

    
    const { value: validData, error } = PATCHJoiSchema.validate(req.body);
    if (error) {
      return sendErrorResponse(res, 422, error.details[0].message);
    }

    const category = await Category.findById(id);

    if (!category) {
      return sendErrorResponse(res, 404, "Category not found");
    }

  
    if (category.isDefault) {
      return sendErrorResponse(res, 403, "Default category cannot be updated");
    }

    if (category.user.toString() !== userId) {
      return sendErrorResponse(res, 403, "Not allowed");
    }

    Object.keys(validData).forEach((key) => {
      category[key] = validData[key];
    });

    await category.save();

    return sendSuccessResponse(res, 200, {
      message: "Category updated successfully",
      doc: category,
    });

  } catch (error) {
    next(error);
  }
};

module.exports = {
  createCategory,
  getCategories,
  getCategoryById,
  deleteCategory,
   updateCategory,
};