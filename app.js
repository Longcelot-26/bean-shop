
const path = require('path');
const express = require('express');
const cookieSession = require('cookie-session');

const config = require('./src/config');
const locals = require('./src/middlewares/locals');
const accessLog = require('./src/middlewares/accessLog');
const { notFound, errorHandler } = require('./src/middlewares/error');
const registerRoutes = require('./src/routes');

function createApp() {
  const app = express();

  app.disable('x-powered-by');
  app.set('trust proxy', config.TRUST_PROXY);
  app.set('view engine', 'ejs');
  app.set('views', path.join(__dirname, 'src', 'views'));

  
  app.use('/static', express.static(config.PUBLIC_DIR, { maxAge: '10m' }));
  app.use('/imgs', express.static(config.IMAGE_DIR, {
    maxAge: '1h',
    index: false,
    setHeaders(res, filePath) {
      if (path.basename(filePath) === 'login1.png') res.setHeader('Cache-Control', 'no-cache');
    },
  }));

  app.use((req, res, next) => {
    res.set('X-Content-Type-Options', 'nosniff');
    next();
  });
  app.use(accessLog);
  app.use(express.urlencoded({ extended: false, limit: '100kb' }));
  app.use(express.json({ limit: '100kb' }));
  app.use(cookieSession({
    name: 'sid',
    keys: [config.SESSION_SECRET],
    maxAge: config.SESSION_MAX_AGE,
    httpOnly: true,
    sameSite: 'lax',
    secure: config.COOKIE_SECURE,
  }));
  app.use(locals);

  registerRoutes(app);

  app.use(notFound);
  app.use(errorHandler);
  return app;
}

module.exports = createApp;
