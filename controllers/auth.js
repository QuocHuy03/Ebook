const User = require("../models/user");
const bcrypt = require("bcrypt");
const random = require("random-token");

// register
exports.createUser = (req, res, next) => {
  const { fullname, password, repassword, email } = req.body;
  if (fullname == "" || password == "" || repassword == "" || email == "") {
    res.status(200).json({ status: false, message: "Không Được Để Trống" });
  } else {
    if (password !== repassword) {
      return res
        .status(200)
        .json({ status: false, message: "Mật khẩu nhập lại không khớp!" });
    } else {
      // Mã hóa mật khẩu
      bcrypt.hash(password, 10, (err, hash) => {
        if (err) {
          return res.status(500).json({
            status: false,
            message: "Có lỗi xảy ra trong quá trình mã hóa mật khẩu",
          });
        }
        var token = random(24);
        const users = new User({
          fullname,
          password: hash,
          email,
          token: token,
        });
        console.log("Register : ", users);
        users
          .save()
          .then((result) => {
            res.status(201).json({
              status: true,
              message: "Đăng Ký Thành Công",
              info: result,
            });
          })
          .catch((err) => {
            if (!err.statusCode) {
              err.statusCode = 500;
            }
            next(err);
          });
      });
    }
  }
};
// login

exports.loginUser = (req, res, next) => {
  const { email, password } = req.body;
  console.log(req.body);
  if (email == "" || password == "") {
    res.status(200).json({ status: false, message: "Không Được Để Trống" });
  } else {
    User.findOne({ email: email })
      .then((user) => {
        if (!user) {
          return res.status(200).json({
            status: false,
            message: "Tài khoản không tồn tại",
          });
        }
        bcrypt.compare(password, user.password, (err, result) => {
          if (err) {
            return res
              .status(401)
              .json({ status: false, message: "Đăng nhập thất bại" });
          }
          if (result) {
            req.session.loggedin = true;
            req.session.email = email;

            res.locals.email = email; // lưu trữ email đã đăng nhập và truyền vào một biến locals

            console.log(res.locals.email);
            return res.status(200).json({
              status: true,
              message: "Đăng nhập thành công",
              info: user,
            });
          } else {
            return res
              .status(200)
              .json({ status: false, message: "Đăng nhập thất bại" });
          }
        });
      })
      .catch((err) => {
        if (!err.statusCode) {
          err.statusCode = 500;
        }
        next(err);
      });
  }
};
