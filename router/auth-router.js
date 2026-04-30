const express = require("express");
const router = express.Router();
const authcontrollers = require("../controllers/auth-controllers");
const validate = require("../middlewares/validate-middleware");
const { registerSchema,loginSchema,updateProfileSchema,updatePasswordSchema } = require("../validators/auth-validator");
const protect = require("../middlewares/error-middleware");


router.route("/register").post(validate(registerSchema), authcontrollers.register);
router
  .route("/login")
  .post(validate(loginSchema), authcontrollers.login);
 router
  .route("/logout")
  .post(protect, authcontrollers.logout);


  router
  .route("/update-my-profile")
  .patch(validate(updateProfileSchema), authcontrollers.updateMyProfile);


  router.route("/update-password").patch(
  protect,
  validate(updatePasswordSchema),
  authcontrollers.updateMyPassword
);


module.exports = router;