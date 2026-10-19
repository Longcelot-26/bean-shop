
require('dotenv/config');
const { defineConfig } = require('prisma/config');

if (!process.env.DATABASE_URL) {
  console.warn('[prisma] Thiếu DATABASE_URL.');
}

module.exports = defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'node prisma/seed.js',
  },
  datasource: {
    url: process.env.DATABASE_URL || 'postgresql://user:password@localhost:5432/chubbylung',
  },
});
