
const productService = require('../services/productService');
const { NotFoundError } = require('../services/errors');

function listPage(req, res, next) {
  const q = String(req.query.q || '').trim();
  const cat = String(req.query.cat || 'all');
  const sort = String(req.query.sort || 'default');
  productService.getAll((err, products) => {
    if (err) return next(err);
    res.render('products', {
      title: 'Sản phẩm - Chubby Lung',
      active: 'products',
      items: productService.search(products, { q, cat, sort }),
      q, cat, sort,
    });
  });
}

function detailPage(req, res, next) {
  productService.getAll((err, products) => {
    if (err) return next(err);
    const p = productService.findById(products, req.params.pid);
    if (!p) return next(new NotFoundError('Không tìm thấy sản phẩm'));
    res.render('product-detail', {
      title: `${p.name} - Chubby Lung`,
      p,
      related: productService.related(products, p),
      scripts: ['product-detail.js'],
    });
  });
}

function apiList(req, res, next) {
  productService.getAll((err, products) => (err ? next(err) : res.json(products)));
}

function apiDetail(req, res, next) {
  productService.getAll((err, products) => {
    if (err) return next(err);
    const p = productService.findById(products, req.params.pid);
    if (!p) return res.status(404).json({ error: 'Not found' });
    res.json(p);
  });
}

module.exports = { listPage, detailPage, apiList, apiDetail };
