
const router = require('express').Router();
const order = require('../controllers/orderController');
const { loginRequired } = require('../middlewares/auth');

router.get('/checkout', loginRequired, order.checkoutForm);
router.post('/checkout', loginRequired, order.checkoutSubmit);
router.get('/order/success/:oid', loginRequired, order.success);
router.get('/orders', order.myOrders);

module.exports = router;
