import { Router } from "express";
import {
  users,
  publicUser,
  findUserById,
  createTransaction,
  getTransactionsForUser,
  CURRENCIES,
} from "../data/store.js";
import { convert } from "../data/rates.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.use(requireAuth);

// Current user's profile + balance
router.get("/me", (req, res) => {
  const user = findUserById(req.user.id);
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json(publicUser(user));
});

// Directory of other users/businesses to send money to
router.get("/directory", (req, res) => {
  const list = users
    .filter((u) => u.id !== req.user.id && u.role !== "admin")
    .map(publicUser);
  res.json(list);
});

// A user's own transaction history (sent, received, deposits, withdrawals)
router.get("/", (req, res) => {
  const list = getTransactionsForUser(req.user.id).map((t) => ({
    ...t,
    direction:
      t.type !== "send" ? t.type : t.fromUserId === req.user.id ? "outgoing" : "incoming",
  }));
  res.json(list);
});

// Create a transaction: deposit, withdraw, or send (domestic or cross-border)
router.post("/", (req, res) => {
  const { type, amount, currency, toUserId, note } = req.body;
  const user = findUserById(req.user.id);

  if (!["deposit", "withdraw", "send"].includes(type)) {
    return res.status(400).json({ error: "Type must be 'deposit', 'withdraw', or 'send'" });
  }
  const amt = Number(amount);
  if (!amt || amt <= 0) {
    return res.status(400).json({ error: "Amount must be a positive number" });
  }
  const curr = currency || user.currency;
  if (!CURRENCIES.includes(curr)) {
    return res.status(400).json({ error: `Currency must be one of ${CURRENCIES.join(", ")}` });
  }

  if (type === "send") {
    const recipient = findUserById(toUserId);
    if (!recipient) {
      return res.status(400).json({ error: "Recipient not found" });
    }
    if (recipient.id === user.id) {
      return res.status(400).json({ error: "You can't send money to yourself" });
    }
    if (user.balance < amt) {
      return res.status(400).json({ error: "Insufficient balance" });
    }
    const tx = createTransaction({
      type: "send",
      fromUserId: user.id,
      toUserId: recipient.id,
      amount: amt,
      currency: curr,
      convertedAmount: convert(amt, curr, recipient.currency),
      convertedCurrency: recipient.currency,
      note: note || "",
    });
    return res.status(201).json(tx);
  }

  // deposit or withdraw
  if (type === "withdraw" && user.balance < amt) {
    return res.status(400).json({ error: "Insufficient balance" });
  }
  const tx = createTransaction({
    type,
    fromUserId: type === "withdraw" ? user.id : null,
    toUserId: type === "deposit" ? user.id : null,
    amount: amt,
    currency: curr,
    note: note || "",
  });
  res.status(201).json(tx);
});

export default router;
