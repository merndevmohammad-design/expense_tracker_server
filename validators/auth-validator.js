const Joi = require("joi");

const registerSchema = Joi.object({
  firstName: Joi.string().trim().min(2).max(30).required(),

  lastName: Joi.string().trim().min(2).max(30).allow("", null).optional(),
  username: Joi.string().trim().min(3).max(30).required(),

  email: Joi.string().email().required(),

   phone: Joi.string().min(10).max(15).allow("", null).optional(),


  password: Joi.string().min(6).required(),

  confirmPassword: Joi.string()
    .valid(Joi.ref("password"))
    .required()
    .messages({
      "any.only": "Passwords do not match",
    }),
   
});
const loginSchema = Joi.object({
  identifier: Joi.string().required().messages({
    "any.required": "Email, username or phone is required",
  }),

  password: Joi.string().min(6).required(),
});
const updateProfileSchema = Joi.object({
  firstName: Joi.string().min(2).max(30).optional(),
  lastName: Joi.string().min(2).max(30).allow("", null).optional(),
  username: Joi.string().min(3).max(30).optional(),
  email: Joi.string().email().optional(),
  phone: Joi.string().min(10).max(15).allow("", null).optional(),
});
const updatePasswordSchema = Joi.object({
  oldPassword: Joi.string().min(6).required(),

  newPassword: Joi.string().min(6).required(),

  confirmPassword: Joi.string()
    .valid(Joi.ref("newPassword"))
    .required()
    .messages({
      "any.only": "Passwords do not match",
    }),
});

module.exports = { registerSchema,loginSchema,updateProfileSchema,updatePasswordSchema };