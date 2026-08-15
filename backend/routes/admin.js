import { Router } from "express";
import {
  getAllUsers,
  publicUser,
  findUserById,
  findUserByEmail,
  createUser,
  findTransactionById,
  getPendingTransactions,
  getAllTransactions,
  updateUserBalance,
  decideTransaction,
  CURRENCIES,
} from "../data/store.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

const router = Router();

router.use(requireAuth, requireRole("admin"));

router.get("/users", asyncHandler(async (req, res) => {
  const users = await getAllUsers();
  res.json(users.map(publicUser));
}));

// Admin creates an account on behalf of a customer (e.g. onboarding a
// client directly instead of them self-registering).
router.post("/users", asyncHandler(async (req, res) => {
  const { name, email, password, role, country, currency } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: "Name, email, and password are required" });
  }
  if (!["individual", "business"].includes(role)) {
    return res.status(400).json({ error: "Role must be 'individual' or 'business'" });
  }
  if (!CURRENCIES.includes(currency)) {
    return res.status(400).json({ error: `Currency must be one of ${CURRENCIES.join(", ")}` });
  }
  if (await findUserByEmail(email)) {
    return res.status(409).json({ error: "An account with that email already exists" });
  }

  const user = await createUser({ name, email, password, role, country: country || "US", currency });
  res.status(201).json(publicUser(user));
}));

// Admin directly sets a user's balance (e.g. correcting a demo account, or
// crediting an account outside the normal transfer flow).
router.patch("/users/:id/balance", asyncHandler(async (req, res) => {
  const user = await findUserById(req.params.id);
  if (!user) return res.status(404).json({ error: "Account not found" });

  const balance = Number(req.body.balance);
  if (Number.isNaN(balance) || balance < 0) {
    return res.status(400).json({ error: "Balance must be a number of 0 or more" });
  }

  await updateUserBalance(user.id, balance);
  const updated = await findUserById(user.id);
  res.json(publicUser(updated));
}));

router.get("/transactions", asyncHandler(async (req, res) => {
  res.json(await getAllTransactions());
}));

router.get("/transactions/pending", asyncHandler(async (req, res) => {
  res.json(await getPendingTransactions());
}));

router.post("/transactions/:id/approve", asyncHandler(async (req, res) => {
  const tx = await findTransactionById(req.params.id);
  if (!tx) return res.status(404).json({ error: "Transaction not found" });
  if (tx.status !== "pending") {
    return res.status(400).json({ error: `Transaction is already ${tx.status}` });
  }

  if (tx.type === "deposit") {
    const to = await findUserById(tx.toUserId);
    await updateUserBalance(to.id, to.balance + tx.amount);
  } else if (tx.type === "withdraw") {
    const from = await findUserById(tx.fromUserId);
    if (from.balance < tx.amount) {
      return res.status(400).json({ error: "User no longer has sufficient balance" });
    }
    await updateUserBalance(from.id, from.balance - tx.amount);
  } else if (tx.type === "send") {
    const from = await findUserById(tx.fromUserId);
    const to = await findUserById(tx.toUserId);
    if (from.balance < tx.amount) {
      return res.status(400).json({ error: "Sender no longer has sufficient balance" });
    }
    await updateUserBalance(from.id, from.balance - tx.amount);
    await updateUserBalance(to.id, to.balance + tx.convertedAmount);
  }

  const updated = await decideTransaction(tx.id, { status: "approved", decidedBy: req.user.id });
  res.json(updated);
}));

router.post("/transactions/:id/reject", asyncHandler(async (req, res) => {
  const tx = await findTransactionById(req.params.id);
  if (!tx) return res.status(404).json({ error: "Transaction not found" });
  if (tx.status !== "pending") {
    return res.status(400).json({ error: `Transaction is already ${tx.status}` });
  }

  const updated = await decideTransaction(tx.id, {
    status: "rejected",
    decidedBy: req.user.id,
    rejectionReason: req.body?.reason || "",
  });
  res.json(updated);
}));

export default router;
