


const path = require('path');
const fs = require('fs');
const esbuild = require('esbuild');

const root = path.resolve(__dirname, '..');
const entry = path.join(root, 'src', 'generated', 'prisma', 'client.ts');
const outfile = path.join(root, 'src', 'generated', 'client.cjs');

if (!fs.existsSync(entry)) {
  console.error('Không tìm thấy src/generated/prisma/client.ts.');
  process.exit(1);
}

esbuild.buildSync({
  entryPoints: [entry],
  outfile,
  bundle: true,
  platform: 'node',
  format: 'cjs',
  packages: 'external', 
  logLevel: 'warning',
});
console.log(`Đã biên dịch Prisma Client -> ${path.relative(root, outfile)}`);
