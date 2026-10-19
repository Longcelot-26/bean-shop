

const seed = require('./seed.json');
const { prisma, toCallback, disconnect } = require('../src/config/DB');
const { productData } = require('./legacy');

function series(items, fn) {
  return items.reduce((p, item) => p.then(() => fn(item)), Promise.resolve());
}

toCallback(
  series(seed, (p) => {
    const data = productData(p);
    return prisma.product.upsert({ where: { id: data.id }, create: data, update: {} });
  }).then(() => prisma.product.count()),
  (err, count) => {
    if (err) {
      console.error('Lỗi seed:', err.message);
      return disconnect(() => process.exit(1));
    }
    console.log(`Đã nạp sản phẩm mẫu. Tổng số sản phẩm trong DB: ${count}`);
    return disconnect(() => process.exit(0));
  },
);
