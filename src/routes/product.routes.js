
const router = require('express').Router();
const product = require('../controllers/productController');

router.get('/products', product.listPage);
router.get('/product/:pid', product.detailPage);


router.get('/api/products', product.apiList);
router.get('/api/product/:pid', product.apiDetail);

module.exports = router;
