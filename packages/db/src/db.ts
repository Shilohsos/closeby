import { drizzle } from 'drizzle-orm/postgres';
import postgres from 'postgres';
import * as schema from './schema.js';

const queryClient = postgres(process.env.DATABASE_URL!);
export const db = drizzle(queryClient, { schema });
export default db;
