const Joi = require("joi");

const POSTJoiSchema = Joi.object({
  categoryId: Joi.string().allow(null).optional(),

  month: Joi.string()
    .pattern(/^\d{4}-\d{2}$/) // YYYY-MM format
    .required(),

  limit: Joi.number().positive().required(),
});

const PATCHJoiSchema = Joi.object({
  categoryId: Joi.string().allow(null).optional(),

  month: Joi.string().pattern(/^\d{4}-\d{2}$/).optional(),

  limit: Joi.number().positive().optional(),
});

const GETJoiSchema = Joi.object({
  month: Joi.string().optional(),
  categoryId: Joi.string().optional(),

  page: Joi.number().min(1).optional(),
  pageSize: Joi.number().min(1).max(100).optional(),
   sortBy: Joi.string().valid(
      "createdAt_ascending",
      "createdAt_descending"
    ).optional(),
});

module.exports = {
  POSTJoiSchema,
  PATCHJoiSchema,
  GETJoiSchema,
};