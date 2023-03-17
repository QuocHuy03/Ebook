exports.getAdmin = async (req, res) => {
  function formatNumber(num) {
    if (num == null) {
      return "0";
    }
    return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
  }

  return res.render("admin/index");
};
