import { drizzle } from 'drizzle-orm/postgres-js';
import pg from 'postgres';
import { env } from './env.config';

const client = pg(env.DATABASE_URL);
export const db = drizzle(client);
