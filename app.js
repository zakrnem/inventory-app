const debug = require("debug")("app");
var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const compression = require("compression");
const helmet = require("helmet");
const multer = require("multer");
require("dotenv").config();

// Set up mongoose connection
const mongoose = require("mongoose");
mongoose.set("strictQuery", false);

const dev_db_url = `mongodb+srv://${process.env.USER_NAME}:${process.env.PASSWORD}@${process.env.URL}/inventory?retryWrites=true&w=majority`;

const mongoDB = process.env.MONGODB_URI || dev_db_url;
console.log("123", mongoDB);

main().catch((err) => debug(err));
async function main() {
  await mongoose.connect(mongoDB);
  debug("Connected to MongoDB Atlas");
}

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
const catalogRouter = require("./routes/catalog");

var app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/catalog", catalogRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  if (err instanceof multer.MulterError) {
    // Multer errors (e.g., file size exceeded, file type not allowed)
    res.status(400).render("error", {
      title: "Error",
      message: "File upload error: " + err.message,
      dev_mode: app.locals.devMode,
    });
  } else {
    // render the error page
    res.status(err.status || 500);
    res.render("error", {
      title: "Error",
      dev_mode: app.locals.devMode,
    });
  }
});

app.locals.admin = true;
app.locals.devMode = false;

module.exports = app;
