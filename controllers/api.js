const Product = require("../models/product");

exports.apiGetISBN = async (req, res) => {
  try {
    const isbn = req.params.isbn;
    if (isbn == "") {
      res
        .status(200)
        .json({ status: false, message: "ISBN Không Được Để Trống" });
    } else {
      const product = await Product.findOne({ isbn: isbn });
      if (!product) {
        res.render("404");
      } else {
        res.status(200).json({
          status: true,
          message: `Tìm thấy sản phẩm với ISBN: ${isbn}`,
          product: product,
        });
      }
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ status: false, message: "Lỗi hệ thống" });
  }
};
