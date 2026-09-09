import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle(pool, { schema });

/** Ensure a freshly provisioned deployment has the table required by every item route. */
export async function ensureDatabaseReady(): Promise<void> {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS items (
      id SERIAL PRIMARY KEY,
      type TEXT NOT NULL,
      category TEXT NOT NULL,
      color TEXT NOT NULL,
      brand TEXT NOT NULL,
      description TEXT NOT NULL,
      image_url TEXT,
      location_description TEXT,
      date_of_loss TEXT,
      status TEXT NOT NULL DEFAULT 'open',
      reporter_name TEXT NOT NULL,
      reporter_contact TEXT NOT NULL,
      student_id TEXT,
      grade TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
}

export * from "./schema";
