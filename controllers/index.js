const Product = require("../models/product");
const Comment = require("../models/comment");

exports.getIndex = (req, res) => {
  Product.find({})
    .then((huyit) => res.render("index", { products: huyit }))
    .catch((err) => {
      console.log(err);
    });
};

exports.getDetail = async (req, res) => {
  try {
    const slug = req.params.slug;
    const product = await Product.findOne({ slugProduct: slug });
    const comments = await Comment.find({
      slugProduct: slug, // Bình luận theo slug của sản phẩm
    });
    console.log("Comments : ", comments);
    res.render("detail", { detailProducts: product, comments: comments });
  } catch (error) {
    console.log(error);
  }
};

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

// exports.viewCart = (req, res) => {
//   const cart = req.session.cart;
//   if (!cart) {
//     return res.render("cart", { products: [], totalPrice: 0 });
//   }

//   const products = [];
//   for (const key in cart.huydev) {
//     products.push(cart.huydev[key]);
//   }
//   console.log(products);

//   return res.render("cart", {
//     products: products,
//     totalPrice: cart.totalPrice,
//   });
// };

exports.viewCart = (req, res) => {
  const cart = req.session.cart;
  if (!cart) {
    return res.render("cart", { products: [], totalPrice: 0 });
  }

  const products = [];
  for (const key in cart.huydev) {
    products.push(cart.huydev[key]);
  }

  res.locals.products = products;
  console.log(products);
  return res.render("cart", {
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
