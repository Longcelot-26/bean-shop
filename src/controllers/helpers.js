
const { ServiceError } = require('../services/errors');


function safeNext(req, fallback) {
  const target = String(req.query.next || '');
  if (target.startsWith('/') && !target.startsWith('//')) return target;
  return fallback || '/';
}


function safeBack(req, fallback) {
  const ref = req.get('referer');
  if (ref) {
    try {
      const u = new URL(ref);
      if (u.host === req.get('host')) return u.pathname + u.search;
    } catch (e) {
      
    }
  }
  return fallback;
}


function apiError(err, res, next) {
  if (err instanceof ServiceError) return res.status(err.status).json({ error: err.message });
  return next(err);
}

module.exports = { safeNext, safeBack, apiError };
