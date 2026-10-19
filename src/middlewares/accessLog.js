
const logger = require('../utils/logger');

module.exports = function accessLog(req, res, next) {
  res.on('finish', () => {
    const s = res.statusCode;
    const flag = s < 300 ? 'OK ' : s < 400 ? 'RDR' : s < 500 ? 'ERR' : 'SRV';
    const user = (req.session && req.session.user) || '-';
    logger.access(`${flag} ${s} | ${req.method.padEnd(6)} ${req.originalUrl.slice(0, 80).padEnd(38)} | ${(req.ip || '-').padEnd(15)} | user=${user} | ${res.get('Content-Length') || 0}B`);
  });
  next();
};
