import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";

// ---- In-memory "database" -------------------------------------------------
// This is a mock store for prototype purposes only. Restarting the server
// resets all data. Swap this module out for a real database (Postgres,
// Mongo, etc.) when moving past the prototype stage.

const now = () => new Date().toISOString();

const hash = (pw) => bcrypt.hashSync(pw, 8);

export const CURRENCIES = ["USD", "EUR", "GBP", "NGN", "KES", "INR", "JPY"];

export const users = [
  {
    id: "admin-1",
    name: "Ada Okoye",
    email: "admin@recnuviapro.demo",
    password: hash("admin123"),
    role: "admin",
    country: "NG",
    currency: "USD",
    balance: 0,
    createdAt: now(),
  },
  {
    id: "user-1",
    name: "Sarah Chen",
    email: "sarah@recnuviapro.demo",
    password: hash("password123"),
    role: "individual",
    country: "US",
    currency: "USD",
    balance: 4200.5,
    createdAt: now(),
  },
  {
    id: "user-2",
    name: "Tunde Bakare",
    email: "tunde@recnuviapro.demo",
    password: hash("password123"),
    role: "individual",
    country: "NG",
    currency: "USD",
    balance: 3150.75,
    createdAt: now(),
  },
  {
    id: "biz-1",
    name: "Lagos Textiles Ltd",
    email: "biz@recnuviapro.demo",
    password: hash("password123"),
    role: "business",
    country: "NG",
    currency: "USD",
    balance: 248000,
    createdAt: now(),
  },
];

export const transactions = [];

export function seedTransactions() {
  transactions.push(
    {
      id: nanoid(10),
      type: "send",
      fromUserId: "user-1",
      toUserId: "user-2",
      amount: 500,
      currency: "USD",
      convertedAmount: 500,
      convertedCurrency: "USD",
      note: "Rent contribution",
      status: "approved",
      createdAt: now(),
      decidedAt: now(),
      decidedBy: "admin-1",
    },
    {
      id: nanoid(10),
      type: "send",
      fromUserId: "biz-1",
      toUserId: "user-1",
      amount: 15000,
      currency: "USD",
      convertedAmount: 15000,
      convertedCurrency: "USD",
      note: "Invoice #4471 payout",
      status: "pending",
      createdAt: now(),
    }
  );
}

seedTransactions();

export function findUserByEmail(email) {
  return users.find((u) => u.email.toLowerCase() === email.toLowerCase());
}

export function findUserById(id) {
  return users.find((u) => u.id === id);
}

export function publicUser(u) {
  if (!u) return null;
  const { password, ...rest } = u;
  return rest;
}

export function createUser({ name, email, password, role, country, currency }) {
  const user = {
    id: nanoid(10),
    name,
    email,
    password: hash(password),
    role,
    country,
    currency,
    balance: 0,
    createdAt: now(),
  };
  users.push(user);
  return user;
}

export function createTransaction(data) {
  const tx = {
    id: nanoid(10),
    status: "pending",
    createdAt: now(),
    ...data,
  };
  transactions.push(tx);
  return tx;
}

export function getTransactionsForUser(userId) {
  return transactions
    .filter((t) => t.fromUserId === userId || t.toUserId === userId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export function getPendingTransactions() {
  return transactions
    .filter((t) => t.status === "pending")
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
}

export function getAllTransactions() {
  return [...transactions].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );
}

export function findTransactionById(id) {
  return transactions.find((t) => t.id === id);
}

export const verifyPassword = (plain, hashed) => bcrypt.compareSync(plain, hashed);
