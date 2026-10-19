
const config = require('../config');
const { prisma, toCallback } = require('../config/DB');
const { NotFoundError, ServiceError, ValidationError } = require('./errors');

function cleanQty(value) {
  const n = typeof value === 'string' && value.trim() !== '' ? Number(value) : value;
  if (typeof n !== 'number' || !Number.isInteger(n)) throw new ValidationError('Số lượng không hợp lệ');
  return Math.max(1, Math.min(n, config.MAX_QTY_PER_ITEM));
}

function totalQty(cart) {
  return cart.reduce((s, x) => s + x.qty, 0);
}

function lineFromItem(item) {
  return {
    pid: item.productId,
    name: item.product.name,
    price: item.product.price,
    imgFile: item.product.imgFile || '',
    qty: item.quantity,
  };
}

function cartPromise(username) {
  return prisma.cartItem
    .findMany({ where: { user: { username: String(username) } }, include: { product: true }, orderBy: { id: 'asc' } })
    .then((items) => items.map(lineFromItem));
}

function userIdPromise(username) {
  return prisma.user.findUnique({ where: { username: String(username) }, select: { id: true } }).then((user) => {
    if (!user) throw new ServiceError('Tài khoản không tồn tại', 401);
    return user.id;
  });
}


function getCart(username, cb) {
  toCallback(cartPromise(username), cb);
}

function addItem(username, pid, qty, cb) {
  let n;
  try {
    n = cleanQty(qty === undefined ? 1 : qty);
  } catch (e) {
    return cb(e);
  }
  const productId = String(pid);

  const work = Promise.all([userIdPromise(username), prisma.product.findUnique({ where: { id: productId } })])
    .then(([userId, product]) => {
      if (!product) throw new NotFoundError('Sản phẩm không tồn tại');
      if (product.stock <= 0) throw new ValidationError('Sản phẩm đã hết hàng');
      const cap = Math.min(product.stock, config.MAX_QTY_PER_ITEM);
      
      return prisma.$transaction([
        prisma.cartItem.upsert({
          where: { userId_productId: { userId, productId } },
          create: { userId, productId, quantity: Math.min(n, cap) },
          update: { quantity: { increment: n } },
        }),
        prisma.cartItem.updateMany({
          where: { userId, productId, quantity: { gt: cap } },
          data: { quantity: cap },
        }),
      ]);
    })
    .then(() => cartPromise(username));
  toCallback(work, cb);
}

function updateItem(username, pid, qty, cb) {
  let n;
  try {
    n = cleanQty(qty);
  } catch (e) {
    return cb(e);
  }
  const productId = String(pid);
  const work = userIdPromise(username)
    .then((userId) => prisma.product.findUnique({ where: { id: productId } }).then((product) => {
      const cap = product ? Math.max(1, Math.min(product.stock, config.MAX_QTY_PER_ITEM)) : config.MAX_QTY_PER_ITEM;
      return prisma.cartItem.updateMany({ where: { userId, productId }, data: { quantity: Math.min(n, cap) } });
    }))
    .then(() => cartPromise(username));
  toCallback(work, cb);
}

function removeItem(username, pid, cb) {
  const work = userIdPromise(username)
    .then((userId) => prisma.cartItem.deleteMany({ where: { userId, productId: String(pid) } }))
    .then(() => cartPromise(username));
  toCallback(work, cb);
}

function clear(username, cb) {
  const work = userIdPromise(username)
    .then((userId) => prisma.cartItem.deleteMany({ where: { userId } }))
    .then(() => true);
  toCallback(work, cb);
}

module.exports = { totalQty, getCart, addItem, updateItem, removeItem, clear };
