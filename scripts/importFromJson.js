
const fs = require('fs');
const path = require('path');
const { prisma, toCallback, disconnect } = require('../src/config/DB');
const { ORDER_STATUS, PAYMENT_METHODS } = require('../src/utils/constants');
const { productData, toInt } = require('../prisma/legacy');

const own = (obj, key) => Object.prototype.hasOwnProperty.call(obj, key);
const looksLikeFile = (s) => typeof s === 'string' && /\.[a-z0-9]{2,5}$/i.test(s);

function series(items, fn) {
  return items.reduce((p, item) => p.then(() => fn(item)), Promise.resolve());
}

function importData(legacy, tx) {
  const summary = {
    products: 0, users: 0, cartItems: 0, cartSkipped: 0,
    orders: 0, ordersAlreadyThere: 0, ordersWithoutUser: 0, statusFixed: 0,
  };
  const userIds = new Map();
  const productIds = new Set();

  return series(legacy.products || [], (p) => {
    const data = productData(p);
    productIds.add(data.id);
    summary.products += 1;
    return tx.product.upsert({ where: { id: data.id }, create: data, update: {} });
  })
    .then(() => series(Object.keys(legacy.users || {}), (username) => {
      const u = legacy.users[username];
      if (!u || !u.pw) return null;
      summary.users += 1;
      const createdAt = u.created ? new Date(toInt(u.created) * 1000) : new Date();
      return tx.user.upsert({
        where: { username },
        create: { username, passwordHash: u.pw, createdAt },
        update: {},
      });
    }))
    .then(() => tx.user.findMany({ select: { id: true, username: true } }))
    .then((rows) => {
      rows.forEach((r) => userIds.set(r.username, r.id));
      return tx.product.findMany({ select: { id: true } });
    })
    .then((rows) => {
      rows.forEach((r) => productIds.add(r.id));
      const lines = [];
      Object.keys(legacy.carts || {}).forEach((username) => {
        (legacy.carts[username] || []).forEach((line) => lines.push({ username, line }));
      });
      return series(lines, ({ username, line }) => {
        const userId = userIds.get(username);
        const productId = String(line && line.pid);
        if (!userId || !productIds.has(productId)) { summary.cartSkipped += 1; return null; }
        summary.cartItems += 1;
        return tx.cartItem.upsert({
          where: { userId_productId: { userId, productId } },
          create: { userId, productId, quantity: Math.max(1, toInt(line.qty, 1)) },
          update: {},
        });
      });
    })
    .then(() => series(legacy.orders || [], (o) => tx.order.findUnique({ where: { id: String(o.id) }, select: { id: true } })
      .then((exists) => {
        if (exists) { summary.ordersAlreadyThere += 1; return null; }
        const userId = userIds.get(o.user) || null;
        if (!userId) summary.ordersWithoutUser += 1;
        let status = o.status;
        if (!own(ORDER_STATUS, status)) { status = 'pending'; summary.statusFixed += 1; }
        const items = (o.items || []).map((it) => ({
          productId: productIds.has(String(it.pid)) ? String(it.pid) : null,
          name: String(it.name || ''),
          price: toInt(it.price),
          quantity: Math.max(1, toInt(it.qty !== undefined ? it.qty : it.quantity, 1)),
          imgFile: looksLikeFile(it.imgFile) ? it.imgFile : (looksLikeFile(it.img) ? it.img : null),
        }));
        summary.orders += 1;
        return tx.order.create({
          data: {
            id: String(o.id),
            userId,
            customerName: String(o.name || ''),
            phone: String(o.phone || '').slice(0, 30),
            address: String(o.address || ''),
            payment: PAYMENT_METHODS.includes(o.payment) ? o.payment : 'cod',
            note: String(o.note || ''),
            total: o.total !== undefined ? toInt(o.total) : items.reduce((s, i) => s + i.price * i.quantity, 0),
            status,
            createdAt: new Date((toInt(o.time) || Math.floor(Date.now() / 1000)) * 1000),
            items: { create: items },
          },
        });
      })))
    .then(() => summary);
}

function importLegacy(file, cb) {
  fs.readFile(file, 'utf8', (readErr, text) => {
    if (readErr) return cb(readErr);
    let legacy;
    try {
      legacy = JSON.parse(text);
    } catch (e) {
      return cb(new Error(`File ${file} không phải JSON hợp lệ: ${e.message}`));
    }
    return toCallback(
      prisma.$transaction((tx) => importData(legacy, tx), { timeout: 120000, maxWait: 10000 }),
      cb,
    );
  });
}

module.exports = { importLegacy };

if (require.main === module) {
  const file = path.resolve(process.argv[2] || 'shop_db.json');
  console.log(`Đang nhập dữ liệu từ ${file} ...`);
  importLegacy(file, (err, summary) => {
    if (err) {
      console.error('Lỗi:', err.message);
      return disconnect(() => process.exit(1));
    }
    console.log('✔ Xong:', summary);
    return disconnect(() => process.exit(0));
  });
}
