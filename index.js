const express = require("express");
const session = require("express-session");
const RedisStore = require("connect-redis")(session);
const redis = require("redis");
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const webRoutes = require("./routes/web");
const adminRoutes = require("./routes/admin");
const apiRoutes = require("./routes/api");

const app = express();
const port = process.env.PORT || 1234;

// Session store
const sessionStore = new RedisStore({
  url: process.env.REDIS_URL,
  ttl: 86400, // 1 day expiration
});

app.use(
  session({
    secret: "mysecretkey",
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 24 * 60 * 60 * 1000 },
    store: sessionStore,
  })
);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.set("view engine", "ejs");
app.set("views", "./views");
app.use(express.static("public"));

app.use(cors());

app.use(function (req, res, next) {
  res.locals.loggedin = req.session.loggedin;
  res.locals.email = req.session.email;
  res.locals.totalPrice = req.session.totalPrice;
  next();
});

app.use(function (req, res, next) {
  const redisClient = redis.createClient({
    url: process.env.REDIS_URL,
  });
  const cart = req.session.cart;
  const huyitem = [];
  if (cart) {
    for (const key in cart.huydev) {
      huyitem.push(cart.huydev[key]);
    }
  }
  res.locals.huyitem = huyitem;
  redisClient.quit(); // Quit Redis client after use
  next();
});

app.use("/", webRoutes);
app.use("/admin", adminRoutes);
app.use("/api", apiRoutes);

app.use((req, res) => {
  return res.render("404");
});

mongoose
  .connect(process.env.MONGODB)
  .then(() => {
    app.listen(port, () => {
      console.log(`Server is running on port: ${port}`);
    });
  })
  .catch((err) => {
    console.log(err);
  });
