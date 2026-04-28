import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pkg from "pg";

const { Pool } = pkg;

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// ---------------- AUTH ----------------

function createToken(user) {
  return jwt.sign(
    {
      userId: user.id,
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );
}

function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) return res.status(401).json({ message: "No token" });

  try {
    const token = authHeader.split(" ")[1];
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ message: "Invalid token" });
  }
}

function requireAdmin(req, res, next) {
  if (req.user.role !== "ADMIN") {
    return res.status(403).json({ message: "Admin only" });
  }
  next();
}

// ---------------- BASIC ----------------

app.get("/api/message", (req, res) => {
  res.json({ message: "Hello from ChainPilot backend" });
});

// ---------------- AUTH ROUTES ----------------

app.post("/api/auth/register", async (req, res) => {
  const { fullName, email, password } = req.body;

  const hash = await bcrypt.hash(password, 10);

  const result = await pool.query(
    "INSERT INTO users (full_name, email, password_hash) VALUES ($1,$2,$3) RETURNING *",
    [fullName, email, hash]
  );

  const token = createToken(result.rows[0]);

  res.json({ token });
});

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;

  const result = await pool.query(
    "SELECT * FROM users WHERE email=$1",
    [email]
  );

  const user = result.rows[0];

  if (!user) return res.status(400).json({ message: "Invalid login" });

  const valid = await bcrypt.compare(password, user.password_hash);

  if (!valid) return res.status(400).json({ message: "Invalid login" });

  const token = createToken(user);

  res.json({
    token,
    user: {
      id: user.id,
      full_name: user.full_name,
      role: user.role,
    },
  });
});

// ---------------- USER DATA ----------------

app.get("/api/users", requireAuth, requireAdmin, async (req, res) => {
  const result = await pool.query("SELECT * FROM users");
  res.json(result.rows);
});

app.get("/api/users/:id/balances", requireAuth, async (req, res) => {
  const id = req.params.id;

  const balances = await pool.query(
    "SELECT * FROM account_balances WHERE user_id=$1",
    [id]
  );

  const ledger = await pool.query(
    "SELECT * FROM ledger_entries WHERE user_id=$1 ORDER BY created_at DESC",
    [id]
  );

  const investments = await pool.query(
    "SELECT * FROM user_investments WHERE user_id=$1",
    [id]
  );

  res.json({
    balances: balances.rows,
    ledger: ledger.rows,
    investments: investments.rows,
  });
});

// ---------------- DEPOSITS ----------------

app.post("/api/deposits", requireAuth, async (req, res) => {
  const { amount } = req.body;

  const result = await pool.query(
    "INSERT INTO deposits (user_id, currency, amount) VALUES ($1,'USD',$2) RETURNING *",
    [req.user.userId, amount]
  );

  res.json(result.rows[0]);
});

// ---------------- WITHDRAWALS ----------------

app.post("/api/withdrawals", requireAuth, async (req, res) => {
  const { amount } = req.body;

  const result = await pool.query(
    "INSERT INTO withdrawals (user_id, currency, amount) VALUES ($1,'USD',$2) RETURNING *",
    [req.user.userId, amount]
  );

  res.json(result.rows[0]);
});

// ---------------- ADMIN ----------------

app.get("/api/admin/pending", requireAuth, requireAdmin, async (req, res) => {
  const deposits = await pool.query(
    "SELECT d.*, u.full_name, u.email FROM deposits d JOIN users u ON d.user_id=u.id WHERE d.status='PENDING'"
  );

  const withdrawals = await pool.query(
    "SELECT w.*, u.full_name, u.email FROM withdrawals w JOIN users u ON w.user_id=u.id WHERE w.status='PENDING'"
  );

  res.json({
    deposits: deposits.rows,
    withdrawals: withdrawals.rows,
  });
});

// APPROVE DEPOSIT
app.post(
  "/api/admin/deposits/:id/approve",
  requireAuth,
  requireAdmin,
  async (req, res) => {
    const id = req.params.id;

    const dep = await pool.query(
      "SELECT * FROM deposits WHERE id=$1",
      [id]
    );

    const d = dep.rows[0];

    await pool.query("UPDATE deposits SET status='APPROVED' WHERE id=$1", [
      id,
    ]);

    await pool.query(
      "INSERT INTO account_balances (user_id, currency, available) VALUES ($1,$2,$3) ON CONFLICT (user_id,currency) DO UPDATE SET available = account_balances.available + EXCLUDED.available",
      [d.user_id, d.currency, d.amount]
    );

    await pool.query(
      "INSERT INTO ledger_entries (user_id,currency,amount,type,reason) VALUES ($1,$2,$3,'DEPOSIT','Deposit approved')",
      [d.user_id, d.currency, d.amount]
    );

    res.json({ message: "Deposit approved" });
  }
);

// ❌ REJECT DEPOSIT
app.post(
  "/api/admin/deposits/:id/reject",
  requireAuth,
  requireAdmin,
  async (req, res) => {
    const id = req.params.id;

    await pool.query("UPDATE deposits SET status='REJECTED' WHERE id=$1", [
      id,
    ]);

    res.json({ message: "Deposit rejected" });
  }
);

// APPROVE WITHDRAWAL
app.post(
  "/api/admin/withdrawals/:id/approve",
  requireAuth,
  requireAdmin,
  async (req, res) => {
    const id = req.params.id;

    const wRes = await pool.query(
      "SELECT * FROM withdrawals WHERE id=$1",
      [id]
    );

    const w = wRes.rows[0];

    await pool.query("UPDATE withdrawals SET status='APPROVED' WHERE id=$1", [
      id,
    ]);

    await pool.query(
      "UPDATE account_balances SET available = available - $1 WHERE user_id=$2 AND currency=$3",
      [w.amount, w.user_id, w.currency]
    );

    await pool.query(
      "INSERT INTO ledger_entries (user_id,currency,amount,type,reason) VALUES ($1,$2,$3,'WITHDRAWAL','Withdrawal approved')",
      [w.user_id, w.currency, -w.amount]
    );

    res.json({ message: "Withdrawal approved" });
  }
);

// ❌ REJECT WITHDRAWAL
app.post(
  "/api/admin/withdrawals/:id/reject",
  requireAuth,
  requireAdmin,
  async (req, res) => {
    const id = req.params.id;

    await pool.query(
      "UPDATE withdrawals SET status='REJECTED' WHERE id=$1",
      [id]
    );

    res.json({ message: "Withdrawal rejected" });
  }
);

// ---------------- START SERVER ----------------

app.listen(process.env.PORT, () => {
  console.log("Server running...");
});