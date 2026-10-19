
const config = require('../config');
const password = require('../utils/password');
const adminService = require('../services/adminService');
const orderService = require('../services/orderService');
const productService = require('../services/productService');
const userService = require('../services/userService');
const { ServiceError } = require('../services/errors');
const { safeBack } = require('./helpers');

function loginForm(req, res) {
  res.render('admin/login', { title: 'Admin Login', hideNav: true, error: '' });
}

function login(req, res) {
  const body = req.body || {};
  const userOk = password.safeEqual(body.username, config.ADMIN_USER);
  const passOk = password.safeEqual(body.password, config.ADMIN_PASS); // tính cả hai để thời gian xử lý không lộ thông tin
  if (!(userOk && passOk)) {
    return res.status(401).render('admin/login', {
      title: 'Admin Login', hideNav: true, error: 'Sai tên đăng nhập hoặc mật khẩu',
    });
  }
  req.session.isAdmin = true;
  res.redirect('/admin');
}

function logout(req, res) {
  if (req.session) req.session.isAdmin = false;
  res.redirect('/');
}

function dashboard(req, res, next) {
  adminService.dashboardStats((err, stats) => {
    if (err) return next(err);
    res.render('admin/dashboard', { title: 'Admin Dashboard', adminActive: 'dashboard', stats });
  });
}

function updateOrder(req, res, next) {
  const body = req.body || {};
  orderService.updateStatus(body.oid, body.status, (err) => {
    if (err && !(err instanceof ServiceError)) return next(err);
    res.redirect(safeBack(req, '/admin'));
  });
}

function products(req, res, next) {
  productService.getAll((err, items) => {
    if (err) return next(err);
    res.render('admin/products', { title: 'Quản lý sản phẩm', adminActive: 'products', items });
  });
}

function orders(req, res, next) {
  orderService.listAll((err, items) => {
    if (err) return next(err);
    res.render('admin/orders', { title: 'Quản lý đơn hàng', adminActive: 'orders', items });
  });
}

function users(req, res, next) {
  userService.listWithOrderCounts((err, items) => {
    if (err) return next(err);
    res.render('admin/users', { title: 'Quản lý người dùng', adminActive: 'users', items });
  });
}

module.exports = { loginForm, login, logout, dashboard, updateOrder, products, orders, users };
