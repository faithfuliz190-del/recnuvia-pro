import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.js";
import transactionRoutes from "./routes/transactions.js";
import adminRoutes from "./routes/admin.js";
import { CURRENCIES } from "./data/store.js";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => res.json({ ok: true, currencies: CURRENCIES }));
app.use("/api/auth", authRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/admin", adminRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Something went wrong on the server" });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`GlobalPay backend running at http://localhost:${PORT}`);
  console.log("Demo accounts (password in parentheses):");
  console.log("  admin@recnuviapro.demo (admin123) - admin");
  console.log("  sarah@recnuviapro.demo (password123) - individual, USD");
  console.log("  tunde@recnuviapro.demo (password123) - individual, NGN");
  console.log("  biz@recnuviapro.demo (password123) - business, NGN");
});
