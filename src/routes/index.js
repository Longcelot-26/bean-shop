
module.exports = function registerRoutes(app) {
  app.use(require('./home.routes'));
  app.use(require('./product.routes'));
  app.use(require('./cart.routes'));
  app.use(require('./order.routes'));
  app.use(require('./auth.routes'));
  app.use('/admin', require('./admin.routes'));
};
