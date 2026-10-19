
const cartService = require('../services/cartService');
const { apiError } = require('./helpers');

function page(req, res) {
  res.render('cart', { title: 'Giỏ hàng - Chubby Lung', active: 'cart', scripts: ['cart.js'] });
}

function apiGet(req, res, next) {
  cartService.getCart(req.session.user, (err, cart) => (err ? apiError(err, res, next) : res.json(cart)));
}

function apiAdd(req, res, next) {
  const body = req.body || {};
  cartService.addItem(req.session.user, body.pid, body.qty, (err, cart) => {
    if (err) return apiError(err, res, next);
    res.json({ ok: true, total_qty: cartService.totalQty(cart), cart });
  });
}

function apiUpdate(req, res, next) {
  const body = req.body || {};
  cartService.updateItem(req.session.user, body.pid, body.qty === undefined ? 1 : body.qty, (err, cart) => {
    if (err) return apiError(err, res, next);
    res.json({ ok: true, cart });
  });
}

function apiRemove(req, res, next) {
  cartService.removeItem(req.session.user, (req.body || {}).pid, (err, cart) => {
    if (err) return apiError(err, res, next);
    res.json({ ok: true, cart });
  });
}

function apiClear(req, res, next) {
  cartService.clear(req.session.user, (err) => (err ? apiError(err, res, next) : res.json({ ok: true })));
}

module.exports = { page, apiGet, apiAdd, apiUpdate, apiRemove, apiClear };
