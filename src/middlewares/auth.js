
function loginRequired(req, res, next) {
  if (req.session && req.session.user) return next();
  res.redirect('/login?next=' + encodeURIComponent(req.originalUrl));
}

function apiLoginRequired(req, res, next) {
  if (req.session && req.session.user) return next();
  res.status(401).json({ error: 'unauthorized' });
}

function adminRequired(req, res, next) {
  if (req.session && req.session.isAdmin) return next();
  res.redirect('/admin/login');
}

module.exports = { loginRequired, apiLoginRequired, adminRequired };
