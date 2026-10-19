
const toInt = (v, fallback) => {
  const n = Math.trunc(Number(v));
  return Number.isFinite(n) ? n : (fallback === undefined ? 0 : fallback);
};

function productData(p) {
  return {
    id: String(p.id),
    name: String(p.name || ''),
    price: toInt(p.price),
    originalPrice: toInt(p.original_price, toInt(p.price)),
    category: String(p.category || 'thubong').slice(0, 30),
    stock: Math.max(0, toInt(p.stock)),
    sold: Math.max(0, toInt(p.sold)),
    imgFile: p.img_file || null,
    description: String(p.desc || ''),
    tags: Array.isArray(p.tags) ? p.tags.map(String) : [],
    characterName: p.nhan_vat || null,
    sizeLabel: p.kich_thuoc || null,
    brand: p.thuong_hieu || 'CHOEARTH / Hypergryph',
  };
}

module.exports = { toInt, productData };
