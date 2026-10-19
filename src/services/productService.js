
const { prisma, toCallback } = require('../config/DB');


function toView(p) {
  return {
    id: p.id,
    name: p.name,
    price: p.price,
    original_price: p.originalPrice,
    category: p.category,
    stock: p.stock,
    sold: p.sold,
    image: '',
    img_file: p.imgFile || '',
    desc: p.description,
    tags: p.tags,
    nhan_vat: p.characterName || '',
    kich_thuoc: p.sizeLabel || '',
    thuong_hieu: p.brand,
  };
}

function getAll(cb) {
  const work = Promise.all([
    prisma.product.findMany({ orderBy: { id: 'asc' } }),
    prisma.orderItem.groupBy({
      by: ['productId'],
      where: { productId: { not: null } },
      _sum: { quantity: true },
    }),
  ]).then(([products, sales]) => {
    const soldByProduct = new Map(sales.map((sale) => [sale.productId, sale._sum.quantity || 0]));
    return products.map((product) => toView({
      ...product,
      sold: soldByProduct.get(product.id) || 0,
    }));
  });
  toCallback(work, cb);
}


function findById(products, pid) {
  return products.find((p) => p.id === pid) || null;
}

function discountPercent(p) {
  const original = Number(p.original_price) || 0;
  if (original <= 0) return 0;
  return Math.round((1 - p.price / original) * 100);
}

function featuredByTag(products, tag, limit) {
  return products.filter((p) => (p.tags || []).includes(tag)).slice(0, limit || 4);
}

function search(products, opts) {
  const q = ((opts && opts.q) || '').trim().toLowerCase();
  const cat = (opts && opts.cat) || 'all';
  const sort = (opts && opts.sort) || 'default';
  let items = products.slice();
  if (q) {
    items = items.filter((p) => p.name.toLowerCase().includes(q) || (p.desc || '').toLowerCase().includes(q));
  }
  if (cat === 'sale') items = items.filter((p) => (p.tags || []).includes('sale'));
  else if (cat === 'new' || cat === 'filter') items = items.filter((p) => (p.tags || []).includes('mới'));
  else if (cat !== 'all') items = items.filter((p) => p.category === cat);

  if (sort === 'price_asc') items.sort((a, b) => a.price - b.price);
  else if (sort === 'price_desc') items.sort((a, b) => b.price - a.price);
  else if (sort === 'popular') items.sort((a, b) => b.sold - a.sold);
  return items;
}

function related(products, product, limit) {
  return products.filter((x) => x.category === product.category && x.id !== product.id).slice(0, limit || 4);
}

module.exports = { toView, getAll, findById, discountPercent, featuredByTag, search, related };
