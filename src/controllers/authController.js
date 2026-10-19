
const userService = require('../services/userService');
const { ServiceError } = require('../services/errors');
const { safeNext } = require('./helpers');

function loginForm(req, res) {
  res.render('login', { title: 'Đăng nhập', hideNav: true, error: '' });
}

function login(req, res, next) {
  const body = req.body || {};
  const username = String(body.username || '').trim();
  userService.authenticate(username, body.password, (err, ok) => {
    if (err) return next(err);
    if (!ok) {
      return res.status(401).render('login', {
        title: 'Đăng nhập', hideNav: true, error: 'Tên đăng nhập hoặc mật khẩu không đúng',
      });
    }
    req.session = { user: username }; 
    res.redirect(safeNext(req, '/'));
  });
}

function registerForm(req, res) {
  res.render('register', { title: 'Đăng ký', hideNav: true, error: '' });
}

function register(req, res, next) {
  const body = req.body || {};
  userService.register(body.username, body.password, body.password2, (err, username) => {
    if (err instanceof ServiceError) {
      return res.status(err.status).render('register', { title: 'Đăng ký', hideNav: true, error: err.message });
    }
    if (err) return next(err);
    req.session = { user: username };
    res.redirect('/');
  });
}

function logout(req, res) {
  req.session = null;
  res.redirect('/');
}

module.exports = { loginForm, login, registerForm, register, logout };
