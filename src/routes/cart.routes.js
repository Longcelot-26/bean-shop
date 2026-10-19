
const router = require('express').Router();
const cart = require('../controllers/cartController');
const { apiLoginRequired } = require('../middlewares/auth');

router.get('/cart', cart.page);


router.get('/api/cart', apiLoginRequired, cart.apiGet);
router.post('/api/cart/add', apiLoginRequired, cart.apiAdd);
router.post('/api/cart/update', apiLoginRequired, cart.apiUpdate);
router.post('/api/cart/remove', apiLoginRequired, cart.apiRemove);
router.post('/api/cart/clear', apiLoginRequired, cart.apiClear);

module.exports = router;
