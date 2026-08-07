import pg from "pg";
import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";

const { Pool } = pg;
const hash = (pw) => bcrypt.hashSync(pw, 8);

if (!process.env.DATABASE_URL) {
  console.warn(
    "\nWARNING: No DATABASE_URL set. Set it to a Postgres connection string " +
    "(e.g. from Neon or Render Postgres) before starting the server.\n"
  );
}

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Neon, Render Postgres, and most hosted providers require SSL. A plain
  // local Postgres on your own machine usually doesn't.
  ssl: process.env.DATABASE_URL?.includes("localhost") ? false : { rejectUnauthorized: false },
});

// Creates the tables if they don't exist yet, and fills them with the same
// demo accounts as before — but only the very first time, so real data
// entered later is never overwritten.
export async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL,
      country TEXT,
      currency TEXT NOT NULL,
      balance NUMERIC NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      from_user_id TEXT REFERENCES users(id),
      to_user_id TEXT REFERENCES users(id),
      amount NUMERIC NOT NULL,
      currency TEXT NOT NULL,
      converted_amount NUMERIC,
      converted_currency TEXT,
      note TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      decided_at TIMESTAMPTZ,
      decided_by TEXT,
      rejection_reason TEXT
    );
  `);

  const { rows } = await pool.query("SELECT COUNT(*)::int AS count FROM users");
  if (rows[0].count === 0) {
    await seedDemoData();
    console.log("Seeded demo accounts into the database.");
  }
}

async function seedDemoData() {
  const demoUsers = [
    { id: "admin-1", name: "Ada Okoye", email: "admin@recnuviapro.demo", password: "admin123", role: "admin", country: "NG", currency: "USD", balance: 0 },
    { id: "user-1", name: "Sarah Chen", email: "sarah@recnuviapro.demo", password: "password123", role: "individual", country: "US", currency: "USD", balance: 4200.5 },
    { id: "user-2", name: "Tunde Bakare", email: "tunde@recnuviapro.demo", password: "password123", role: "individual", country: "NG", currency: "USD", balance: 3150.75 },
    { id: "biz-1", name: "Lagos Textiles Ltd", email: "biz@recnuviapro.demo", password: "password123", role: "business", country: "NG", currency: "USD", balance: 248000 },
  ];

  for (const u of demoUsers) {
    await pool.query(
      `INSERT INTO users (id, name, email, password, role, country, currency, balance)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
      [u.id, u.name, u.email, hash(u.password), u.role, u.country, u.currency, u.balance]
    );
  }

  const demoTx = [
    { id: nanoid(10), type: "send", fromUserId: "user-1", toUserId: "user-2", amount: 500, currency: "USD", convertedAmount: 500, convertedCurrency: "USD", note: "Rent contribution", status: "approved", decidedBy: "admin-1" },
    { id: nanoid(10), type: "send", fromUserId: "biz-1", toUserId: "user-1", amount: 15000, currency: "USD", convertedAmount: 15000, convertedCurrency: "USD", note: "Invoice #4471 payout", status: "pending" },
  ];

  for (const t of demoTx) {
    await pool.query(
      `INSERT INTO transactions
         (id, type, from_user_id, to_user_id, amount, currency, converted_amount, converted_currency, note, status, decided_at, decided_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
      [
        t.id, t.type, t.fromUserId, t.toUserId, t.amount, t.currency,
        t.convertedAmount, t.convertedCurrency, t.note, t.status,
        t.status === "approved" ? new Date() : null, t.decidedBy || null,
      ]
    );
  }
}
