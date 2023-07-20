exports.loginUser = (req, res, next) => {
  const { email, password } = req.body;
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
   
        if (password === user.password) {
          
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
        })
        .catch((err) => {
          if (!err.statusCode) {
            err.statusCode = 500;
          }
          next(err);
        });
      }

  }
