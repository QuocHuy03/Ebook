const random = require("random-token");
const Product = require("../models/product");
const Comment = require("../models/comment");
const Order = require("../models/order");
const User = require("../models/user");
const Category = require("../models/category");

exports.getIndex = async (req, res) => {
  try {
    const categories = await Category.find({});
    const products = await Product.find({});
    res.render("index", { products: products, categories: categories });
  } catch (err) {
    console.log(err);
  }
};

exports.getDetail = async (req, res) => {
  try {
    const slug = req.params.slug;
    const product = await Product.findOne({ slugProduct: slug });
    const categories = await Category.find({});
    const comments = await Comment.find({
      slugProduct: slug, // Bình luận theo slug của sản phẩm
    });
    console.log("Comments : ", comments);

    res.render("detail", {
      detailProducts: product,
      comments: comments,
      categories: categories,
    });
  } catch (error) {
    console.log(error);
  }
};

// get slug category

exports.getProductOfCategory = async (req, res) => {
  try {
    const slugCate = req.params.slug;
    const productOfCategory = await Product.find({ categoryName: slugCate });
    const categories = await Category.find({});

    if (!productOfCategory) {
      // Trường hợp không tìm thấy sản phẩm tương ứng, trả về thông báo hoặc chuyển hướng đến trang 404
      res.status(404).render("404", { pageTitle: "Không tìm thấy sản phẩm" });
    } else {
      // Trường hợp tìm thấy sản phẩm tương ứng, render template categories và truyền các biến
      res.render("categories", {
        products: productOfCategory,
        categories: categories,
      });
    }
  } catch (error) {
    console.log(error);
  }
};

// post comment

exports.postComment = (req, res) => {
  if (!req.session.loggedin) {
    return res
      .status(200)
      .json({ status: false, message: "Vui Lòng Đăng Nhập Để Tiếp Tục" });
  } else {
    if (req.body.star == "" || req.body.message == "") {
      res.status(200).json({ status: false, message: "Không Được Để Trống" });
    } else {
      const comment = new Comment({
        email: req.session.email,
        rating: req.body.star,
        comment: req.body.message,
        slugProduct: req.body.slugProduct,
      });
      comment
        .save()
        .then((result) => {
          console.log(result);
          res.json({ status: true, message: "Comment saved successfully" });
        })
        .catch((error) => {
          console.error(error);
          res
            .status(500)
            .json({ status: false, message: "Failed to save comment" });
        });
    }
  }
};

// add to cart

exports.addToCart = (req, res) => {
  const slug = req.body.slugProduct;
  const quantity = Number(req.body.quantity || 1);

  Product.findOne({ slugProduct: slug })
    .then((product) => {
      if (!product) {
        return res.status(400).json({ message: "Không tìm thấy sản phẩm" });
      }

      let cart = req.session.cart;
      // Nếu giỏ hàng không tồn tại thì tạo mới
      if (!cart) {
        cart = { huydev: {}, totalQuantity: 0, totalPrice: 0 };
      }
      // +1 và đoạn này khó , đói nhưng vẫn cố gắn fix hic
      if (cart.huydev[product._id]) {
        cart.huydev[product._id].quantity += quantity;
        cart.totalQuantity += quantity;
        cart.totalPrice += Number(product.price) * quantity;
      } else {
        // Thêm mới sản phẩm vào giỏ hàng
        cart.huydev[product._id] = {
          item: product,
          quantity: quantity,
        };
        cart.totalQuantity += quantity;
        cart.totalPrice += Number(product.price) * quantity;
      }
      req.session.cart = cart;
      return res.status(200).json({
        status: true,
        message: "Thêm Sản Phẩm Thành Công",
      });
    })
    .catch((err) => {
      console.log(err);
      return res.status(500).json({
        status: false,
        message: "Thêm Sản Phẩm Thất Bại",
      });
    });
};

exports.viewCart = async (req, res) => {
  const categories = await Category.find({});

  const cart = req.session.cart;

  if (!cart) {
    return res.render("cart", {
      products: [],
      totalPrice: 0,
      categories: categories,
    });
  }

  const products = [];
  for (const key in cart.huydev) {
    products.push(cart.huydev[key]);
  }

  res.locals.products = products;
  res.locals.totalPrice = cart.totalPrice;
  console.log(products);
  return res.render("cart", {
    categories: categories,
    products: products,
    totalPrice: cart.totalPrice,
  });
};

exports.updateCart = (req, res) => {
  const { idProduct, quantity } = req.body;
  const carts = req.session.cart;

  if (!carts) {
    return res.status(200).json({
      status: false,
      message: "Không Có Sản Phẩm Nào Ở Đây Huy Nha",
    });
  } else {
    console.log(Object.keys(carts.huydev));
    const cartItems = Object.keys(carts.huydev);

    // Khởi tạo số lượng tổng giá trị sản phẩm trong giỏ hàng
    let totalQuantity = 0;
    let totalPrice = 0;

    // tìm thấy sản phẩm có id trùng với id được truyền vào
    for (let itemId of cartItems) {
      const productToUpdate = carts.huydev[itemId];
      if (itemId == idProduct) {
        productToUpdate.quantity = quantity;
        totalQuantity += parseInt(quantity);
        totalPrice += parseInt(productToUpdate.item.price) * parseInt(quantity);
      } else {
        totalQuantity += parseInt(productToUpdate.quantity);
        totalPrice +=
          parseInt(productToUpdate.item.price) *
          parseInt(productToUpdate.quantity);
      }
    }

    // Update Money Quantity
    carts.totalQuantity = totalQuantity;
    carts.totalPrice = totalPrice;

    return res.status(200).json({
      status: true,
      message: `Cập Nhật Sản Phẩm Với ID [${idProduct}] Thành Công`,
    });
  }
};

exports.deleteCart = (req, res) => {
  const { deleteIDProduct } = req.body;
  const carts = req.session.cart;

  if (!carts) {
    return res.status(200).json({
      status: false,
      message: "Không Có Sản Phẩm Nào Ở Đây Huy Nha",
    });
  } else {
    const cartItems = Object.keys(carts.huydev);

    for (let itemId of cartItems) {
      if (itemId == deleteIDProduct) {
        const productToDelete = carts.huydev[itemId];
        carts.totalPrice -=
          productToDelete.item.price * productToDelete.quantity;
        carts.totalQuantity -= productToDelete.quantity;
        delete carts.huydev[itemId];

        return res.status(200).json({
          status: true,
          message: `Xóa Sản Phẩm Với ID [${deleteIDProduct}] Thành Công`,
        });
      }
    }

    return res.status(200).json({
      status: true,
      message: `Xóa Sản Phẩm Thất Bại`,
    });
  }
};

// show view session cart

exports.getviewCheckOut = async (req, res) => {
  const categories = await Category.find({});

  const cart = req.session.cart;
  const email = req.session.email;

  if (!cart) {
    return res.render("checkout", {
      products: [],
      userOrder: {},
      totalPrice: 0,
      categories: categories,
    });
  }

  User.findOne({ email: email })
    .then((user) => {
      const userOrder = {
        fullname: user.fullname,
        email: user.email,
      };

      const products = [];
      if (cart && cart.huydev && Object.keys(cart.huydev).length !== 0) {
        for (const key in cart.huydev) {
          products.push(cart.huydev[key]);
        }
      }

      res.render("checkout", {
        categories: categories,
        products: products,
        totalPrice: cart.totalPrice,
        userOrder: userOrder,
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

// odder
exports.orderCart = async (req, res) => {
  const { email, cart } = req.session;

  if (
    req.body.address == "" ||
    req.body.phone == "" ||
    req.body.comment == ""
  ) {
    return res.status(200).json({
      status: false,
      message: `Không Được Để Trống`,
    });
  } else {
    try {
      const productsList = Object.values(cart.huydev); // lấy ra giá trị các sản phẩm
      console.log("Sản Phẩm Item Order :", productsList);

      const orderData = new Order({
        emailOrder: email,
        codeOrder: random(5).toUpperCase(),
        products: productsList,
        totalPrice: cart.totalPrice || 0,
        status: "Processed",
        address: req.body.address,
        phone: req.body.phone,
        comment: req.body.comment,
      });

      await orderData.save(); // lưu
      req.session.cart = null; // xóa session giỏ hàng sau khi đặt hàng thành công
      return res.status(200).json({
        status: true,
        message: `Đặt Hàng Với Email [${email}] Thành Công`,
      });
    } catch (error) {
      console.log(error);
      return res.status(200).json({
        status: false,
        message: `Đã có lỗi xảy ra trong quá trình đặt hàng.`,
      });
    }
  }
};

// list order
exports.getListOrder = async (req, res) => {
  const categories = await Category.find({});
  const email = req.session.email;
  Order.find({ emailOrder: email })
    .then((order) => {
      // order.products.forEach((product) => {
      //   console.log("Tên sản phẩm:", product.item.title);
      //   console.log("Số lượng:", product.quantity);
      //   console.log("Giá:", product.item.price * product.quantity);
      // });
      res.render("listOrder", { orders: order, categories: categories });
      console.log(order);
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getDetailOrder = async (req, res, next) => {
  const categories = await Category.find({});

  const codeOrder = req.params.codeOrder;
  Order.findOne({ codeOrder: codeOrder })
    .then((huydev) => {
      res.render("listDetailOrder", {
        detailOrders: huydev,
        categories: categories,
      });
      console.log(huydev);
    })
    .catch((err) => {
      console.log(err);
    });
};
