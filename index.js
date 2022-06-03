const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const userRouter = require("./routes/userRoutes");

dotenv.config({ path: "./config.env" });

const app = express();
const port = 3000;

mongoose
  .connect(process.env.DATABASE, {
    useNewUrlParser: true,
  })
  .then(() => {
    console.log("DB connection successful!");
    app.listen(port, () => {
      console.log(`App running on port ${port}...`);
    });
  })
  .catch((e) => console.log("mongoose connection error : ", e));

// Body parser - reading data from body into "req.body"
app.use(express.json({ limit: "10kb" }));
// Parsing cookies via middleware
app.use(cookieParser());

// ROUTES
app.use("/users", userRouter);

app.all("*", (req, res, next) => {
  next(new Error(`Can't find anything on requested url : ${req.originalUrl}`));
});
