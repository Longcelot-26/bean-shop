
const CATEGORIES = {
  all: 'Tất cả',
  thubong: 'Thú Bông',
  mockey: 'Móc Khóa',
  phukien: 'Phụ Kiện',
};


const ORDER_STATUS = {
  pending: ['Chờ xác nhận', 'status-pending'],
  processing: ['Đang xử lý', 'status-processing'],
  shipped: ['Đang giao', 'status-shipped'],
  done: ['Hoàn thành', 'status-done'],
};

const PAYMENT_METHODS = ['cod', 'transfer', 'momo'];

const RESERVED_USERNAMES = ['__proto__', 'constructor', 'prototype', 'hasOwnProperty', 'toString'];

module.exports = { CATEGORIES, ORDER_STATUS, PAYMENT_METHODS, RESERVED_USERNAMES };
