
const productService = require('../services/productService');

function index(req, res, next) {
  productService.getAll((err, products) => {
    if (err) return next(err);
    res.render('home', {
      title: 'Chubby Lung Store',
      active: 'home',
      hot: productService.featuredByTag(products, 'hot'),
      fresh: productService.featuredByTag(products, 'mới'),
    });
  });
}

module.exports = { index };
