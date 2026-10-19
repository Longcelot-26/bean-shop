
const { prisma, toCallback, isUniqueViolation, isNotFound } = require('../config/DB');
const { ORDER_STATUS, PAYMENT_METHODS } = require('../utils/constants');
const { EmptyCartError, NotFoundError, ServiceError, ValidationError } = require('./errors');

const own = (obj, key) => Object.prototype.hasOwnProperty.call(obj, key);
const INCLUDE = { items: { orderBy: { id: 'asc' } }, user: { select: { username: true } } };
const NEWEST_FIRST = [{ createdAt: 'desc' }, { id: 'desc' }];

function clean(value, limit) {
  return String(value == null ? '' : value).trim().slice(0, limit || 200);
}

function newOrderId() {
  return `ORD${String(Date.now() % 10000000).padStart(7, '0')}`;
}


function toView(o) {
  return {
    id: o.id,
    user: o.user ? o.user.username : '',
    name: o.customerName,
    phone: o.phone,
    address: o.address,
    payment: o.payment,
    note: o.note,
    total: o.total,
    status: o.status,
    time: Math.floor(o.createdAt.getTime() / 1000),
    items: o.items.map((i) => ({ pid: i.productId || '', name: i.name, price: i.price, qty: i.quantity, imgFile: i.imgFile || '' })),
  };
}

function createOrder(username, form, cb) {
  const fullname = clean(form.fullname);
  const phone = clean(form.phone, 30);
  const street = clean(form.address);
  if (!fullname || !phone || !street) {
    return cb(new ValidationError('Vui lòng nhập đầy đủ họ tên, số điện thoại và địa chỉ'));
  }
  const address = [street, clean(form.district), clean(form.city)].filter(Boolean).join(', ');
  const payment = PAYMENT_METHODS.includes(form.payment) ? form.payment : 'cod';
  const note = clean(form.note, 500);

  function attempt(triesLeft) {
    return prisma
      .$transaction((tx) => tx.user
        .findUnique({ where: { username: String(username) }, select: { id: true } })
        .then((user) => {
          if (!user) throw new ServiceError('Tài khoản không tồn tại', 401);
          return tx.cartItem
            .findMany({ where: { userId: user.id }, include: { product: true }, orderBy: { id: 'asc' } })
            .then((lines) => {
              if (lines.length === 0) throw new EmptyCartError();
              const total = lines.reduce((s, l) => s + l.product.price * l.quantity, 0);
              return tx.order
                .create({
                  data: {
                    id: newOrderId(),
                    userId: user.id,
                    customerName: fullname,
                    phone,
                    address,
                    payment,
                    note,
                    total,
                    status: 'pending',
                    items: {
                      create: lines.map((l) => ({
                        productId: l.productId,
                        name: l.product.name,
                        price: l.product.price,
                        quantity: l.quantity,
                        imgFile: l.product.imgFile,
                      })),
                    },
                  },
                  include: INCLUDE,
                })
                .then((order) => tx.cartItem
                  .deleteMany({ where: { userId: user.id, id: { in: lines.map((l) => l.id) } } })
                  .then((deleted) => {
                    
                    
                    if (deleted.count !== lines.length) throw new EmptyCartError();
                    return order;
                  }));
            });
        }))
      .catch((err) => {
        if (isUniqueViolation(err) && triesLeft > 0) return attempt(triesLeft - 1); 
        throw err;
      });
  }

  toCallback(attempt(3).then(toView), cb);
}


function getOrdersForUser(username, cb) {
  if (!username) return cb(null, []);
  toCallback(
    prisma.order.findMany({ where: { user: { username: String(username) } }, include: INCLUDE, orderBy: NEWEST_FIRST })
      .then((rows) => rows.map(toView)),
    cb,
  );
}


function getOrderForUser(oid, username, cb) {
  toCallback(
    prisma.order.findFirst({ where: { id: String(oid), user: { username: String(username) } }, include: INCLUDE })
      .then((o) => (o ? toView(o) : null)),
    cb,
  );
}

function listAll(cb) {
  toCallback(prisma.order.findMany({ include: INCLUDE, orderBy: NEWEST_FIRST }).then((rows) => rows.map(toView)), cb);
}

function updateStatus(oid, status, cb) {
  if (!own(ORDER_STATUS, status)) return cb(new ValidationError('Trạng thái không hợp lệ'));
  toCallback(
    prisma.order.update({ where: { id: String(oid) }, data: { status }, include: INCLUDE })
      .then(toView)
      .catch((err) => {
        if (isNotFound(err)) throw new NotFoundError('Không tìm thấy đơn hàng');
        throw err;
      }),
    cb,
  );
}

module.exports = { toView, createOrder, getOrdersForUser, getOrderForUser, listAll, updateStatus };
