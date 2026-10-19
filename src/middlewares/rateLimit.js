
const { rateLimit } = require('express-rate-limit');
const config = require('../config');

const loginLimiter = rateLimit({
  windowMs: config.LOGIN_WINDOW_MS,
  limit: config.LOGIN_MAX_ATTEMPTS,
  skipSuccessfulRequests: true,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).render('error', {
      title: 'Thử quá nhiều lần',
      code: 429,
      message: 'Bạn đã thử đăng nhập sai quá nhiều lần. Vui lòng thử lại sau 15 phút.',
    });
  },
});

module.exports = { loginLimiter };
