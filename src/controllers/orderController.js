
const orderService = require('../services/orderService');
const { EmptyCartError, NotFoundError, ServiceError } = require('../services/errors');

function checkoutForm(req, res) {
  res.render('checkout', { title: 'Thanh toán - Chubby Lung', error: '', scripts: ['checkout.js'] });
}

function checkoutSubmit(req, res, next) {
  orderService.createOrder(req.session.user, req.body || {}, (err, order) => {
    if (err instanceof EmptyCartError) return res.redirect('/cart');
    if (err instanceof ServiceError) {
      return res.status(err.status).render('checkout', {
        title: 'Thanh toán - Chubby Lung', error: err.message, scripts: ['checkout.js'],
      });
    }
    if (err) return next(err);
    res.redirect(`/order/success/${encodeURIComponent(order.id)}`);
  });
}

function success(req, res, next) {
  orderService.getOrderForUser(req.params.oid, req.session.user, (err, order) => {
    if (err) return next(err);
    if (!order) return next(new NotFoundError('Không tìm thấy đơn hàng'));
    res.render('order-success', { title: 'Đặt hàng thành công! - Chubby Lung', order });
  });
}

function myOrders(req, res, next) {
  const user = (req.session && req.session.user) || '';
  orderService.getOrdersForUser(user, (err, orders) => {
    if (err) return next(err);
    res.render('orders', { title: 'Đơn hàng - Chubby Lung', active: 'orders', orders, loggedIn: !!user });
  });
}

module.exports = { checkoutForm, checkoutSubmit, success, myOrders };
