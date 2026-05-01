const express = require("express");
const router = express.Router();

const {
  createBudget,
  getBudgets,
  updateBudget,
  deleteBudget,
  getBudgetById,
    getBudgetsTracking,
} = require("../controllers/budget-controller");

router.post("/", createBudget);
router.get("/", getBudgets);
router.get("/tracking", getBudgetsTracking);

router.get("/:id", getBudgetById); 
router.patch("/:id", updateBudget);
router.delete("/:id", deleteBudget);

module.exports = router;