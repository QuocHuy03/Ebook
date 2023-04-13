const express = require("express");
const session = require("express-session");
const RedisStore = require("connect-redis")(session);
const redis = require("redis");
const bodyParser = require("body-parser");
// const morgan = require("morgan");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const webRoutes = require("./routes/web");
const adminRoutes = require("./routes/admin");
const apiRoutes = require("./routes/api");

const app = express();
const port = process.env.PORT || 1234;



app.use(
  session({
    secret: "mysecretkey",
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 24 * 60 * 60 * 1000 },
  })
);

// app.use(morgan("combined"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// views

app.set("view engine", "ejs");
app.set("views", "./views");
app.use(express.static("public"));

// Thêm middleware để cấu hình CORS
app.use(cors());

app.use(function (req, res, next) {
  res.locals.loggedin = req.session.loggedin;
  res.locals.email = req.session.email;
  res.locals.totalPrice = req.session.totalPrice;
  next();
});

app.use(function (req, res, next) {
  const cart = req.session.cart;
  const huyitem = [];
  if (cart) {
    for (const key in cart.huydev) {
      huyitem.push(cart.huydev[key]);
    }
  }
  res.locals.huyitem = huyitem;
  next();
});

// routes

app.use("/", webRoutes);
app.use("/admin", adminRoutes);
app.use("/api", apiRoutes);

// middleware

app.use((req, res) => {
  return res.render("404");
});

// connect

mongoose
  .connect(process.env.MONGODB)
  .then((result) => {
    app.listen(port, () => {
      console.log(`ứng dụng đang chạy với port: ${port}`);
    });
  })
  .catch((err) => {
    console.log(err);
  });
