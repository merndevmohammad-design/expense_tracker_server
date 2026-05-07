// // utils/alertEngine.js

// const Alert = require("../models/alert-model");
// const Budget = require("../models/budget-model");
// // ✅ Do NOT require expense-model here at the top level — it causes a
// //    circular dependency (expense-model → alertEngine → expense-model).
// //    Instead we lazy-require it inside the function, by which time
// //    Node.js has fully loaded expense-model.js.

// const NEAR_LIMIT_THRESHOLD = 0.8;
// const UNUSUAL_THRESHOLD = 0.5;

// async function checkAndCreateAlerts(expense) {
//   // Lazy require — safe here because the post-save hook only runs after
//   // expense-model.js has been fully evaluated.
//   const Expense = require("../models/expense-model");

//   const { userId, categoryId, amount, date } = expense;

//   const d = new Date(date);
//   const month = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;

//   const budget = await Budget.findOne({
//     userId,
//     month,
//     categoryId: categoryId ?? null,
//   });

//   if (!budget) return;

//   // Build month boundaries using Date constructor (no string math)
//   const [year, mon] = month.split("-").map(Number);
//   const startOfMonth    = new Date(year, mon - 1, 1);
//   const startOfNextMonth = new Date(year, mon, 1);   // mon is already 1-based, so this = next month

//   const matchFilter = {
//     userId,
//     categoryId: categoryId ?? null,
//     date: { $gte: startOfMonth, $lt: startOfNextMonth },
//   };

//   const aggregation = await Expense.aggregate([
//     { $match: matchFilter },
//     { $group: { _id: null, total: { $sum: "$amount" } } },
//   ]);

//   const totalSpent = aggregation[0]?.total ?? 0;
//   const limit = budget.limit;
//   const ratio = totalSpent / limit;

//   // Helper: avoid duplicate alerts of the same type for the same budget/month
//   const alreadyAlerted = async (type) => {
//     const exists = await Alert.findOne({
//       userId,
//       categoryId: categoryId ?? null,
//       month,
//       type,
//     });
//     return !!exists;
//   };

//   // ── 1. EXCEEDED ──────────────────────────────────────────────────────────
//   if (ratio > 1) {
//     if (!(await alreadyAlerted("EXCEEDED"))) {
//       const label = categoryId ? `category budget` : `monthly budget`;
//       await Alert.create({
//         userId,
//         categoryId: categoryId ?? null,
//         month,
//         type: "EXCEEDED",
//         message: `⚠️ You have exceeded your ${label} for ${month}. Spent: ${totalSpent.toFixed(2)}, Limit: ${limit.toFixed(2)}.`,
//       });
//     }
//     // EXCEEDED supersedes NEAR_LIMIT — skip that check
//     return;
//   }

//   // ── 2. NEAR_LIMIT ────────────────────────────────────────────────────────
//   if (ratio >= NEAR_LIMIT_THRESHOLD) {
//     if (!(await alreadyAlerted("NEAR_LIMIT"))) {
//       const label = categoryId ? `category budget` : `monthly budget`;
//       const percent = Math.round(ratio * 100);
//       await Alert.create({
//         userId,
//         categoryId: categoryId ?? null,
//         month,
//         type: "NEAR_LIMIT",
//         message: `🔔 You have used ${percent}% of your ${label} for ${month}. Spent: ${totalSpent.toFixed(2)}, Limit: ${limit.toFixed(2)}.`,
//       });
//     }
//   }

//   // ── 3. UNUSUAL ───────────────────────────────────────────────────────────
//   // Fires every time a single expense is unusually large (no dedup needed —
//   // each expense is a separate event worth flagging)
//   if (amount > limit * UNUSUAL_THRESHOLD) {
//     await Alert.create({
//       userId,
//       categoryId: categoryId ?? null,
//       month,
//       type: "UNUSUAL",
//       message: `🚨 Unusual expense detected: ${amount.toFixed(2)} is more than ${Math.round(UNUSUAL_THRESHOLD * 100)}% of your ${categoryId ? "category" : "monthly"} budget limit (${limit.toFixed(2)}) for ${month}.`,
//     });
//   }
// }

// module.exports = { checkAndCreateAlerts };