const express = require("express");
require("dotenv").config();

const app = express();

const connectDb = require("./utils/db");
const authRouter = require("./router/auth-router");
const userRouter = require("./router/user-router");
const categoryRoutes = require("./router/category-route");
const expenseRoutes = require("./router/expense-router");
const budgetRoutes = require("./router/budget-router");

const errorMiddleware = require("./middlewares/error-middleware");
const notFound = require("./middlewares/not-found");

app.use(express.json());




app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/category", categoryRoutes);
app.use("/api/expense", expenseRoutes);
app.use("/api/budget", budgetRoutes);


app.use(notFound);
app.use(errorMiddleware);

connectDb().then(() => {
  const PORT = 5000;
  app.listen(PORT, () => {
    console.log(`Server is running at port: ${PORT}`);
  });
});