const Joi = require("joi");


const POSTJoiSchema = Joi.object({
  name: Joi.string().min(2).max(50).required(),
});

const PATCHJoiSchema = Joi.object({
  name: Joi.string().min(2).max(50).optional(),
});

const GETJoiSchema = Joi.object({
  keyword: Joi.string().allow("").optional(),

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