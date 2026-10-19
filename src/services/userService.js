
const { prisma, toCallback, isUniqueViolation } = require('../config/DB');
const password = require('../utils/password');
const logger = require('../utils/logger');
const { RESERVED_USERNAMES } = require('../utils/constants');
const { ValidationError } = require('./errors');

const MIN_PASSWORD_LEN = 6;


function authenticate(username, plain, cb) {
  if (!username) return cb(null, false);
  toCallback(prisma.user.findUnique({ where: { username: String(username) } }), (err, user) => {
    if (err) return cb(err);
    if (!user) return cb(null, false);
    return password.verify(user.passwordHash, plain, (verifyErr, ok, needsUpgrade) => {
      if (verifyErr) return cb(verifyErr);
      if (ok && needsUpgrade) upgradeHash(user.id, user.username, plain); 
      return cb(null, ok);
    });
  });
}


function upgradeHash(id, username, plain) {
  password.hash(plain, (hashErr, newHash) => {
    if (hashErr) return logger.warn(`Không nâng cấp được mật khẩu của ${username}`, hashErr);
    return toCallback(prisma.user.update({ where: { id }, data: { passwordHash: newHash } }), (err) => {
      if (err) logger.warn(`Không lưu được mật khẩu nâng cấp của ${username}`, err);
    });
  });
}


function register(rawUsername, plain, plain2, cb) {
  const username = String(rawUsername == null ? '' : rawUsername).trim();
  plain = typeof plain === 'string' ? plain : '';
  if (!username || !plain) return cb(new ValidationError('Vui lòng nhập đầy đủ thông tin'));
  if (username.length > 50) return cb(new ValidationError('Tên đăng nhập tối đa 50 ký tự'));
  if (RESERVED_USERNAMES.includes(username)) return cb(new ValidationError('Tên đăng nhập không hợp lệ'));
  if (plain !== plain2) return cb(new ValidationError('Mật khẩu không khớp'));
  if (plain.length < MIN_PASSWORD_LEN) {
    return cb(new ValidationError(`Mật khẩu phải có ít nhất ${MIN_PASSWORD_LEN} ký tự`));
  }

  return password.hash(plain, (hashErr, passwordHash) => {
    if (hashErr) return cb(hashErr);
    return toCallback(
      prisma.user.create({ data: { username, passwordHash } }).then(() => username).catch((err) => {
        if (isUniqueViolation(err)) throw new ValidationError('Tên đăng nhập đã tồn tại');
        throw err;
      }),
      cb,
    );
  });
}


function listWithOrderCounts(cb) {
  toCallback(
    prisma.user.findMany({ orderBy: { id: 'asc' }, include: { _count: { select: { orders: true } } } }).then((users) =>
      users.map((u) => [u.username, { created: Math.floor(u.createdAt.getTime() / 1000) }, u._count.orders])),
    cb,
  );
}

module.exports = { authenticate, register, listWithOrderCounts };
