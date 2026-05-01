const Joi = require("joi");

const POSTJoiSchema = Joi.object({
  amount: Joi.number().positive().required(),
  categoryId: Joi.string().optional(),
  date: Joi.date().optional(),
  note: Joi.string().max(500).allow("").optional(),
});

const PATCHJoiSchema = Joi.object({
  amount: Joi.number().positive().optional(),

  categoryId: Joi.string().optional(),

  date: Joi.date().optional(),

  note: Joi.string().max(500).allow("").optional(),
});

const GETJoiSchema = Joi.object({
  categoryId: Joi.string().optional(),

  from: Joi.date().optional(),
  to: Joi.date().optional(),

  page: Joi.number().min(1).optional(),
  pageSize: Joi.number().min(1).max(100).optional(),

  sortBy: Joi.string()
    .valid("createdAt_ascending", "createdAt_descending")
    .optional(),
});

module.exports = {
  POSTJoiSchema,
  PATCHJoiSchema,
  GETJoiSchema,
};