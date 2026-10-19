



const crypto = require('crypto');
const bcrypt = require('bcryptjs');

const BCRYPT_ROUNDS = 10;

function hash(plain, cb) {
  bcrypt.hash(plain, BCRYPT_ROUNDS, cb);
}

function sameBytes(a, b) {
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}


function verifyWerkzeugScrypt(stored, plain, cb) {
  const [method, salt, hex] = stored.split('$');
  const [, n, r, p] = (method || '').split(':');
  const N = parseInt(n, 10), R = parseInt(r, 10), P = parseInt(p, 10);
  if (!salt || !hex || !N || !R || !P) return cb(null, false, false);
  const keylen = hex.length / 2;
  crypto.scrypt(plain, salt, keylen, { N, r: R, p: P, maxmem: 256 * N * R * P }, (err, derived) => {
    if (err) return cb(null, false, false);
    cb(null, sameBytes(derived, Buffer.from(hex, 'hex')), true);
  });
}


function verifyWerkzeugPbkdf2(stored, plain, cb) {
  const [method, salt, hex] = stored.split('$');
  const [, digest, iterations] = (method || '').split(':');
  const iter = parseInt(iterations, 10);
  if (!salt || !hex || !digest || !iter) return cb(null, false, false);
  try {
    crypto.pbkdf2(plain, salt, iter, hex.length / 2, digest, (err, derived) => {
      if (err) return cb(null, false, false);
      cb(null, sameBytes(derived, Buffer.from(hex, 'hex')), true);
    });
  } catch (e) {
    cb(null, false, false);
  }
}


function verify(stored, plain, cb) {
  if (typeof stored !== 'string' || typeof plain !== 'string') return cb(null, false, false);
  if (stored.startsWith('$2')) return bcrypt.compare(plain, stored, (err, ok) => cb(err, ok, false));
  if (stored.startsWith('scrypt:')) return verifyWerkzeugScrypt(stored, plain, cb);
  if (stored.startsWith('pbkdf2:')) return verifyWerkzeugPbkdf2(stored, plain, cb);
  cb(null, false, false);
}


function safeEqual(a, b) {
  const ha = crypto.createHash('sha256').update(String(a || '')).digest();
  const hb = crypto.createHash('sha256').update(String(b || '')).digest();
  return crypto.timingSafeEqual(ha, hb);
}

module.exports = { hash, verify, safeEqual };
