const express = require("express");
const router = express.Router();

const {
  createExpense,
  getExpenses,
  updateExpense,
  deleteExpense,
  getExpenseById,
} = require("../controllers/expense-controllers");

router.post("/", createExpense);
router.get("/", getExpenses);
router.get("/:id", getExpenseById);
router.patch("/:id", updateExpense);
router.delete("/:id", deleteExpense);

module.exports = router;