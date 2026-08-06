import { Router } from "express";
import {
  users,
  publicUser,
  findUserById,
  findTransactionById,
  getPendingTransactions,
  getAllTransactions,
} from "../data/store.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();

router.use(requireAuth, requireRole("admin"));

router.get("/users", (req, res) => {
  res.json(users.map(publicUser));
});

router.get("/transactions", (req, res) => {
  res.json(getAllTransactions());
});

router.get("/transactions/pending", (req, res) => {
  res.json(getPendingTransactions());
});

router.post("/transactions/:id/approve", (req, res) => {
  const tx = findTransactionById(req.params.id);
  if (!tx) return res.status(404).json({ error: "Transaction not found" });
  if (tx.status !== "pending") {
    return res.status(400).json({ error: `Transaction is already ${tx.status}` });
  }

  if (tx.type === "deposit") {
    const to = findUserById(tx.toUserId);
    to.balance += tx.amount;
  } else if (tx.type === "withdraw") {
    const from = findUserById(tx.fromUserId);
    if (from.balance < tx.amount) {
      return res.status(400).json({ error: "User no longer has sufficient balance" });
    }
    from.balance -= tx.amount;
  } else if (tx.type === "send") {
    const from = findUserById(tx.fromUserId);
    const to = findUserById(tx.toUserId);
    if (from.balance < tx.amount) {
      return res.status(400).json({ error: "Sender no longer has sufficient balance" });
    }
    from.balance -= tx.amount;
    to.balance += tx.convertedAmount;
  }

  tx.status = "approved";
  tx.decidedAt = new Date().toISOString();
  tx.decidedBy = req.user.id;
  res.json(tx);
});

router.post("/transactions/:id/reject", (req, res) => {
  const tx = findTransactionById(req.params.id);
  if (!tx) return res.status(404).json({ error: "Transaction not found" });
  if (tx.status !== "pending") {
    return res.status(400).json({ error: `Transaction is already ${tx.status}` });
  }

  tx.status = "rejected";
  tx.decidedAt = new Date().toISOString();
  tx.decidedBy = req.user.id;
  tx.rejectionReason = req.body?.reason || "";
  res.json(tx);
});

export default router;
