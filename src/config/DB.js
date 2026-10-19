
const { PrismaPg } = require('@prisma/adapter-pg');
const config = require('./index');

if (!config.DATABASE_URL) {
  throw new Error('Thiếu DATABASE_URL trong .env');
}

let PrismaClient;
try {
  ({ PrismaClient } = require('../generated/client.cjs'));
} catch (err) {
  if (err.code === 'MODULE_NOT_FOUND') {
    throw new Error('Chưa sinh Prisma Client');
  }
  throw err;
}

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: config.DATABASE_URL }) });



function toCallback(promise, cb) {
  promise.then(
    (result) => process.nextTick(cb, null, result),
    (err) => process.nextTick(cb, err),
  );
}


function check(cb) {
  toCallback(prisma.$queryRaw`SELECT 1`, (err) => cb(err || null));
}

function disconnect(cb) {
  toCallback(prisma.$disconnect(), (err) => cb && cb(err || null));
}


const isUniqueViolation = (err) => !!err && err.code === 'P2002';
const isNotFound = (err) => !!err && err.code === 'P2025';

module.exports = { prisma, toCallback, check, disconnect, isUniqueViolation, isNotFound };
