const mongoose = require("mongoose");
const Alert = require("./alert-model");
const Budget = require("./budget-model");

const expenseSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: null,
    },

    date: {
      type: Date,
      required: true,
      default: Date.now,
    },

    note: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);




expenseSchema.post("save", async function (doc) {
  try {
    console.log("🔥 Expense Saved");

    const expenseDate = new Date(doc.date);

    const month = `${expenseDate.getFullYear()}-${String(
      expenseDate.getMonth() + 1
    ).padStart(2, "0")}`;


    let budget;

    if (!doc.categoryId) {
      budget = await Budget.findOne({
        userId: doc.userId,
        month,
        categoryId: null,
      });
    }

    else {
      budget = await Budget.findOne({
        userId: doc.userId,
        month,
        categoryId: doc.categoryId,
      });
    }

    if (!budget) {
      console.log("❌ No Budget Found");
      return;
    }


    const Expense = mongoose.model("Expense");

    let totalExpense;

    if (!doc.categoryId) {
      const result = await Expense.aggregate([
        {
          $match: {
            userId: doc.userId,
            categoryId: null,
            date: {
              $gte: new Date(`${month}-01`),
              $lt: new Date(
                new Date(`${month}-01`).setMonth(
                  new Date(`${month}-01`).getMonth() + 1
                )
              ),
            },
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: "$amount" },
          },
        },
      ]);

      totalExpense = result[0]?.total || 0;
    }

    
    else {
      const result = await Expense.aggregate([
        {
          $match: {
            userId: doc.userId,
            categoryId: doc.categoryId,
            date: {
              $gte: new Date(`${month}-01`),
              $lt: new Date(
                new Date(`${month}-01`).setMonth(
                  new Date(`${month}-01`).getMonth() + 1
                )
              ),
            },
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: "$amount" },
          },
        },
      ]);

      totalExpense = result[0]?.total || 0;
    }

    console.log("💰 TOTAL:", totalExpense);
    console.log("🎯 LIMIT:", budget.limit);


    let alertType = null;
    let message = "";

    if (totalExpense > budget.limit) {
      alertType = "EXCEEDED";

      message = `Budget exceeded! Limit: ${budget.limit}, Current Expense: ${totalExpense}`;
    }

    // near limit (80%)
    else if (totalExpense >= budget.limit * 0.8) {
      alertType = "NEAR_LIMIT";

      message = `You are near your budget limit. Used: ${totalExpense} of ${budget.limit}`;
    }

    // unusual expense
    else if (doc.amount > budget.limit * 0.5) {
      alertType = "UNUSUAL";

      message = `Unusual expense detected: ${doc.amount}`;
    }

    // no alert
    if (!alertType) {
      console.log("✅ No Alert Needed");
      return;
    }


    const alert = await Alert.create({
      userId: doc.userId,
      categoryId: doc.categoryId || null,
      month,
      expenseDate: doc.date,
      type: alertType,
      message,
    });

    console.log("✅ ALERT CREATED:", alert);
  } catch (err) {
    console.error("❌ ALERT ERROR:");
    console.error(err);
  }
});

module.exports = mongoose.model("Expense", expenseSchema);