import { drizzle } from 'drizzle-orm/postgres-js';
import pg from 'postgres';
import { env } from './env.config';
import * as schema from '@/schema';

const client = pg(env.DATABASE_URL);
export const db = drizzle(client, { schema });
