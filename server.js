
const os = require('os');
const config = require('./src/config');
const logger = require('./src/utils/logger');
const DB = require('./src/config/DB');
const createApp = require('./app');

process.on('unhandledRejection', (reason) => logger.error('unhandledRejection', reason instanceof Error ? reason : new Error(String(reason))));
process.on('uncaughtException', (err) => {
  logger.error('uncaughtException', err);
  process.exit(1);
});

function shutdown(signal) {
  logger.info(`Nhận ${signal}, đang đóng kết nối...`);
  DB.disconnect(() => process.exit(0));
}
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

DB.check((checkErr) => {
  if (checkErr) {
    logger.error('Không kết nối được PostgreSQL', checkErr);
    process.exit(1);
  }
  DB.toCallback(Promise.all([DB.prisma.product.count(), DB.prisma.user.count(), DB.prisma.order.count()]), (countErr, counts) => {
    if (countErr) {
      logger.error('Không đọc được dữ liệu', countErr);
      process.exit(1);
    }
    const server = createApp().listen(config.PORT, config.HOST, () => {
      logger.info('='.repeat(48));
      logger.info(`CHUBBY LUNG SHOP ${config.NODE_ENV}`);
      logger.info(`http://${config.HOST}:${config.PORT}   host=${os.hostname()}`);
      logger.info(`Sản phẩm: ${counts[0]}   Users: ${counts[1]}  Orders: ${counts[2]}`);
      logger.info(`Ảnh: ${config.IMAGE_DIR}`);
      logger.info(`Log: ${config.LOG_DIR}`);
      logger.info('Admin: /admin/login');
      if (counts[0] === 0) logger.warn('Chưa có sản phẩm nào');
      if (config.USING_DEFAULT_ADMIN_PASS) {
        logger.warn('Đang dùng mật khẩu admin mặc định');
      }
      logger.info('='.repeat(48));
    });
    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        logger.error(`Cổng ${config.PORT} đang được sử dụng`);
      } else {
        logger.error('Lỗi server', err);
      }
      process.exit(1);
    });
  });
});
