const express = require("express");
const router = express.Router();
const userController = require("../controllers/auth");
const indexController = require("../controllers/index");

// check login
function checkLoggedIn(req, res, next) {
  if (!req.session.loggedin) {
    return res.redirect("/login");
  }
  next();
}

router.get("/", indexController.getIndex);
router.get("/detail/:slug", indexController.getDetail);
router.post("/postComment", indexController.postComment);
router.post("/addToCart", indexController.addToCart);
router.get("/cart", indexController.viewCart);
router.post("/updateCart", indexController.updateCart);
router.post("/deleteCart", indexController.deleteCart);


router.get("/register", (req, res, next) => {
  res.render("auth/register");
});

router.get("/login", (req, res, next) => {
  res.render("auth/login");
});
router.post("/postCreateUser", userController.createUser);
router.post("/postLoginUser", userController.loginUser);
router.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.log(err);
    } else {
      res.redirect("/login");
    }
  });
});


router.get("/checkout", (req, res, next) => {
  res.render("checkout");
});

module.exports = router;
