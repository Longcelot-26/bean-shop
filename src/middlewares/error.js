
const logger = require('../utils/logger');
const { NotFoundError } = require('../services/errors');

function notFound(req, res, next) {
  next(new NotFoundError('Không tìm thấy trang'));
}


function errorHandler(err, req, res, next) {
  let status = err.status || err.statusCode || 500;
  if (status < 400 || status > 599) status = 500;
  const isApi = req.path.startsWith('/api/');

  if (status >= 500) {
    logger.error(`${req.method} ${req.originalUrl} (user=${(req.session && req.session.user) || 'guest'}) -> ${err.message}`, err);
  } else if (status === 404) {
    logger.warn(`404 Not Found: ${req.method} ${req.originalUrl} | ${req.ip}`);
  }

  
  const message = status < 500 && (err.expose || err.status) ? err.message : 'Đã xảy ra lỗi, vui lòng thử lại sau.';
  if (res.headersSent) return next(err);
  if (isApi) return res.status(status).json({ error: message });
  const titles = { 404: 'Không tìm thấy trang', 500: 'Lỗi máy chủ' };
  return res.status(status).render('error', { title: titles[status] || 'Có lỗi xảy ra', code: status, message });
}

module.exports = { notFound, errorHandler };
