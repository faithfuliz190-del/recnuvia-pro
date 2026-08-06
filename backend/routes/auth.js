import { Router } from "express";
import jwt from "jsonwebtoken";
import {
  createUser,
  findUserByEmail,
  publicUser,
  verifyPassword,
  CURRENCIES,
} from "../data/store.js";
import { JWT_SECRET } from "../middleware/auth.js";

const router = Router();

router.post("/register", (req, res) => {
  const { name, email, password, role, country, currency } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: "Name, email, and password are required" });
  }
  if (role && !["individual", "business"].includes(role)) {
    return res.status(400).json({ error: "Role must be 'individual' or 'business'" });
  }
  if (currency && !CURRENCIES.includes(currency)) {
    return res.status(400).json({ error: `Currency must be one of ${CURRENCIES.join(", ")}` });
  }
  if (findUserByEmail(email)) {
    return res.status(409).json({ error: "An account with that email already exists" });
  }

  const user = createUser({
    name,
    email,
    password,
    role: role || "individual",
    country: country || "US",
    currency: currency || "USD",
  });

  const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: "12h" });
  res.status(201).json({ token, user: publicUser(user) });
});

router.post("/login", (req, res) => {
  const { email, password } = req.body;
  const user = findUserByEmail(email || "");

  if (!user || !verifyPassword(password || "", user.password)) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: "12h" });
  res.json({ token, user: publicUser(user) });
});

export default router;
