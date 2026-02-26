/* eslint-disable import/no-extraneous-dependencies */
import 'dotenv/config';
import { defineConfig, env } from 'prisma/config';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!, // make sure .env has this
});

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url: env('DATABASE_URL'),
    // Prisma 7 does not support direct URLs for PostgreSQL
    // directUrl: env('POSTGRES_URL_NON_POOLING'),
  },
  migrations: {
    seed: 'ts-node --compiler-options {"module":"CommonJS"} prisma/seed.ts',
  },
});
