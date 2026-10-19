
const { fmt, fmtTime } = require('../utils/format');
const { CATEGORIES, ORDER_STATUS } = require('../utils/constants');
const productService = require('../services/productService');

const TAG_CLASS = { 'mới': 'new', hot: 'hot', sale: 'sale' };

module.exports = function locals(req, res, next) {
  res.locals.user = (req.session && req.session.user) || '';
  res.locals.isAdmin = !!(req.session && req.session.isAdmin);
  res.locals.fmt = fmt;
  res.locals.fmtTime = fmtTime;
  res.locals.CATEGORIES = CATEGORIES;
  res.locals.ORDER_STATUS = ORDER_STATUS;
  res.locals.discountPercent = productService.discountPercent;
  res.locals.tagClass = (t) => TAG_CLASS[t] || 'best';
  
  res.locals.active = '';
  res.locals.hideNav = false;
  res.locals.scripts = [];
  next();
};
