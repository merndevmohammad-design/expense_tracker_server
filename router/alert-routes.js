const express = require("express");
const router = express.Router();

const { getMyAlerts } = require("../controllers/alert-controllers");

router.get("/", getMyAlerts);

module.exports = router;