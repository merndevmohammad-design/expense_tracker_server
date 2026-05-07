const Joi = require("joi");

const GETJoiSchema = Joi.object({
  month: Joi.string().optional(),
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
  GETJoiSchema,
};