const express = require("express");
const router = express.Router();
const usercontrollers = require("../controllers/user-controllers");
const validate = require("../middlewares/validate-middleware");
const protect = require("../middlewares/error-middleware");




 router
  .route("/my-profile")
  .get(protect, usercontrollers.myProfile);







module.exports = router;