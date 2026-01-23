/* eslint-disable import/no-extraneous-dependencies */
 import 'dotenv/config';
import { defineConfig } from 'prisma/config';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!, // make sure .env has this
});

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    adapter,
  },
  migrations: {
    seed: 'ts-node --compiler-options {"module":"CommonJS"} prisma/seed.ts',
  },
});
