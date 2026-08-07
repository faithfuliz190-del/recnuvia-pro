import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.js";
import transactionRoutes from "./routes/transactions.js";
import adminRoutes from "./routes/admin.js";
import { CURRENCIES } from "./data/store.js";
import { initDb } from "./db.js";

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

// Set up the database (creates tables + demo accounts if they don't exist
// yet) before we start accepting requests.
initDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Recnuvia Pro backend running at http://localhost:${PORT}`);
      console.log("Demo accounts (password in parentheses):");
      console.log("  admin@recnuviapro.demo (admin123) - admin");
      console.log("  sarah@recnuviapro.demo (password123) - individual, USD");
      console.log("  tunde@recnuviapro.demo (password123) - individual, USD");
      console.log("  biz@recnuviapro.demo (password123) - business, USD");
    });
  })
  .catch((err) => {
    console.error("Failed to set up the database. Is DATABASE_URL set correctly?");
    console.error(err);
    process.exit(1);
  });
