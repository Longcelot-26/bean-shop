
const fs = require('fs');
const path = require('path');
const config = require('../config');

try {
  fs.mkdirSync(config.LOG_DIR, { recursive: true });
} catch (e) {
  
}

const COLORS = { INFO: '\x1b[32m', WARN: '\x1b[33m', ERROR: '\x1b[31m', DEBUG: '\x1b[90m' };
const RESET = '\x1b[0m';
const streams = {};

function today() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

function write(prefix, text) {
  const name = `${prefix}-${today()}.log`;
  if (!streams[name]) {
    
    Object.keys(streams).forEach((k) => {
      if (k.startsWith(prefix + '-') && k !== name) {
        streams[k].end();
        delete streams[k];
      }
    });
    const s = fs.createWriteStream(path.join(config.LOG_DIR, name), { flags: 'a' });
    s.on('error', () => {}); 
    streams[name] = s;
  }
  streams[name].write(text + '\n');
}

function stamp() {
  return new Date().toISOString().replace('T', ' ').slice(0, 19);
}

function log(level, msg, extra) {
  const detail = extra instanceof Error ? (extra.stack || String(extra)) : extra ? JSON.stringify(extra) : '';
  const line = `[${stamp()}] ${level} | ${msg}${detail ? '\n' + detail : ''}`;
  console.log(`${COLORS[level] || ''}${line}${RESET}`);
  write('app', line);
  if (level === 'ERROR') write('error', line + '\n' + '-'.repeat(60));
}

module.exports = {
  info: (m, x) => log('INFO', m, x),
  warn: (m, x) => log('WARN', m, x),
  error: (m, x) => log('ERROR', m, x),
  access: (line) => write('access', `[${stamp()}] ${line}`),
};
