
const router = require('express').Router();
const admin = require('../controllers/adminController');
const { adminRequired } = require('../middlewares/auth');
const { loginLimiter } = require('../middlewares/rateLimit');

router.get('/login', admin.loginForm);
router.post('/login', loginLimiter, admin.login);
router.get('/logout', admin.logout);

router.get('/', adminRequired, admin.dashboard);
router.post('/update_order', adminRequired, admin.updateOrder);
router.get('/products', adminRequired, admin.products);
router.get('/orders', adminRequired, admin.orders);
router.get('/users', adminRequired, admin.users);

module.exports = router;
