
const router = require('express').Router();
const auth = require('../controllers/authController');
const { loginLimiter } = require('../middlewares/rateLimit');

router.get('/login', auth.loginForm);
router.post('/login', loginLimiter, auth.login);
router.get('/register', auth.registerForm);
router.post('/register', auth.register);
router.get('/logout', auth.logout);

module.exports = router;
