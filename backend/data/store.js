import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";
import { pool } from "../db.js";

export const CURRENCIES = ["USD", "EUR", "GBP", "NGN", "KES", "INR", "JPY"];

const hash = (pw) => bcrypt.hashSync(pw, 8);
export const verifyPassword = (plain, hashed) => bcrypt.compareSync(plain, hashed);

function mapUser(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    password: row.password,
    role: row.role,
    country: row.country,
    currency: row.currency,
    balance: Number(row.balance),
    createdAt: row.created_at,
  };
}

function mapTx(row) {
  if (!row) return null;
  return {
    id: row.id,
    type: row.type,
    fromUserId: row.from_user_id,
    toUserId: row.to_user_id,
    amount: Number(row.amount),
    currency: row.currency,
    convertedAmount: row.converted_amount == null ? undefined : Number(row.converted_amount),
    convertedCurrency: row.converted_currency || undefined,
    note: row.note || "",
    status: row.status,
    createdAt: row.created_at,
    decidedAt: row.decided_at,
    decidedBy: row.decided_by,
    rejectionReason: row.rejection_reason,
  };
}

export function publicUser(u) {
  if (!u) return null;
  const { password, ...rest } = u;
  return rest;
}

export async function findUserByEmail(email) {
  const { rows } = await pool.query("SELECT * FROM users WHERE lower(email) = lower($1)", [email]);
  return mapUser(rows[0]);
}

export async function findUserById(id) {
  const { rows } = await pool.query("SELECT * FROM users WHERE id = $1", [id]);
  return mapUser(rows[0]);
}

export async function getAllUsers() {
  const { rows } = await pool.query("SELECT * FROM users ORDER BY created_at ASC");
  return rows.map(mapUser);
}

export async function createUser({ name, email, password, role, country, currency }) {
  const id = nanoid(10);
  const { rows } = await pool.query(
    `INSERT INTO users (id, name, email, password, role, country, currency, balance)
     VALUES ($1,$2,$3,$4,$5,$6,$7,0) RETURNING *`,
    [id, name, email, hash(password), role, country, currency]
  );
  return mapUser(rows[0]);
}

export async function updateUserBalance(id, newBalance) {
  await pool.query("UPDATE users SET balance = $1 WHERE id = $2", [newBalance, id]);
}

export async function createTransaction(data) {
  const id = nanoid(10);
  const { rows } = await pool.query(
    `INSERT INTO transactions
       (id, type, from_user_id, to_user_id, amount, currency, converted_amount, converted_currency, note, status)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,'pending') RETURNING *`,
    [
      id, data.type, data.fromUserId || null, data.toUserId || null,
      data.amount, data.currency, data.convertedAmount ?? null,
      data.convertedCurrency ?? null, data.note || "",
    ]
  );
  return mapTx(rows[0]);
}

export async function getTransactionsForUser(userId) {
  const { rows } = await pool.query(
    `SELECT * FROM transactions WHERE from_user_id = $1 OR to_user_id = $1 ORDER BY created_at DESC`,
    [userId]
  );
  return rows.map(mapTx);
}

export async function getPendingTransactions() {
  const { rows } = await pool.query(
    `SELECT * FROM transactions WHERE status = 'pending' ORDER BY created_at ASC`
  );
  return rows.map(mapTx);
}

export async function getAllTransactions() {
  const { rows } = await pool.query(`SELECT * FROM transactions ORDER BY created_at DESC`);
  return rows.map(mapTx);
}

export async function findTransactionById(id) {
  const { rows } = await pool.query("SELECT * FROM transactions WHERE id = $1", [id]);
  return mapTx(rows[0]);
}

export async function decideTransaction(id, { status, decidedBy, rejectionReason }) {
  const { rows } = await pool.query(
    `UPDATE transactions
     SET status = $1, decided_at = now(), decided_by = $2, rejection_reason = $3
     WHERE id = $4 RETURNING *`,
    [status, decidedBy, rejectionReason || null, id]
  );
  return mapTx(rows[0]);
}
