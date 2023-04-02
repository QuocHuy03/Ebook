const express = require("express");
var bodyParser = require("body-parser");
const app = express();
const { default: mongoose } = require("mongoose");
const morgan = require("morgan");
const cors = require("cors");
require("dotenv").config();
const port = process.env.PORT || 2003;
const webRoutes = require("./routes/web");
const adminRoutes = require("./routes/admin");
const apiRoutes = require("./routes/api");
const session = require("express-session");

app.use(
  session({
    secret: "mysecretkey",
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 24 * 60 * 60 * 1000 },
  })
);

app.use(morgan("combined"));
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
