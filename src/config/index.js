
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const ROOT = path.resolve(__dirname, '..', '..');
require('dotenv').config({ path: path.join(ROOT, '.env'), quiet: true });


function loadSessionSecret() {
  if (process.env.SESSION_SECRET) return process.env.SESSION_SECRET;
  const file = path.join(ROOT, '.secret_key');
  try {
    const saved = fs.readFileSync(file, 'utf8').trim();
    if (saved) return saved;
  } catch (e) {
    
  }
  const secret = crypto.randomBytes(32).toString('hex');
  try {
    fs.writeFileSync(file, secret, { mode: 0o600 });
  } catch (e) {
    
  }
  return secret;
}

function parseTrustProxy(v) {
  if (v === undefined || v === '') return 1;
  if (v === 'true') return true;
  if (v === 'false') return false;
  return /^\d+$/.test(v) ? parseInt(v, 10) : v;
}

module.exports = {
  ROOT,
  NODE_ENV: process.env.NODE_ENV || 'development',
  HOST: process.env.HOST || '0.0.0.0',
  PORT: parseInt(process.env.PORT || '5000', 10),
  SESSION_SECRET: loadSessionSecret(),
  SESSION_MAX_AGE: 7 * 24 * 60 * 60 * 1000, 
  COOKIE_SECURE: process.env.COOKIE_SECURE === 'true', 
  TRUST_PROXY: parseTrustProxy(process.env.TRUST_PROXY), 

  ADMIN_USER: process.env.ADMIN_USER || 'admin',
  ADMIN_PASS: process.env.ADMIN_PASS || 'admin123',
  USING_DEFAULT_ADMIN_PASS: !process.env.ADMIN_PASS,

  DATABASE_URL: process.env.DATABASE_URL || '',
  IMAGE_DIR: process.env.IMAGE_DIR || path.join(ROOT, 'imgs'),
  LOG_DIR: process.env.LOG_DIR || path.join(ROOT, 'logs'),
  PUBLIC_DIR: path.join(ROOT, 'public'),

  MAX_QTY_PER_ITEM: 99,
  LOGIN_MAX_ATTEMPTS: parseInt(process.env.LOGIN_MAX_ATTEMPTS || '10', 10),
  LOGIN_WINDOW_MS: 15 * 60 * 1000,
};
