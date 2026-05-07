// const getTotalExpenses = async ({ userId, month, categoryId }) => {
//   const start = new Date(`${month}-01`);
//   const end = new Date(start);
//   end.setMonth(end.getMonth() + 1);

//   const match = {
//     userId,
//     date: { $gte: start, $lt: end },
//   };

//   match.categoryId = categoryId === null ? null : categoryId;

//   const result = await Expense.aggregate([
//     { $match: match },
//     {
//       $group: {
//         _id: null,
//         total: { $sum: "$amount" },
//       },
//     },
//   ]);

//   return result[0]?.total || 0;
// };

// module.exports = { getTotalExpenses };