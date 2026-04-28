import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { pool } from "./db.js";
import { sendWelcomeEmail } from "./email.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

function createToken(user) {
  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );
}

function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Missing token" });
  }

  try {
    const token = authHeader.split(" ")[1];
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
}

function requireAdmin(req, res, next) {
  if (req.user.role !== "ADMIN") {
    return res.status(403).json({ message: "Admin access required" });
  }

  next();
}

async function processMaturedInvestments() {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const matured = await client.query(`
      SELECT *
      FROM user_investments
      WHERE status = 'ACTIVE'
      AND end_date <= CURRENT_TIMESTAMP
      FOR UPDATE
    `);

    const processed = [];

    for (const investment of matured.rows) {
      await client.query(
        "UPDATE user_investments SET status = 'COMPLETED' WHERE id = $1",
        [investment.id]
      );

      const balanceResult = await client.query(
        `
        INSERT INTO account_balances (user_id, currency, available, locked)
        VALUES ($1, $2, $3, 0)
        ON CONFLICT (user_id, currency)
        DO UPDATE SET
          available = account_balances.available + EXCLUDED.available,
          updated_at = CURRENT_TIMESTAMP
        RETURNING *
        `,
        [investment.user_id, investment.currency, investment.expected_return]
      );

      const ledgerResult = await client.query(
        `
        INSERT INTO ledger_entries (user_id, currency, amount, type, reason)
        VALUES ($1, $2, $3, 'INVESTMENT_COMPLETED', $4)
        RETURNING *
        `,
        [
          investment.user_id,
          investment.currency,
          investment.expected_return,
          `Investment #${investment.id} completed. Principal and profit released.`,
        ]
      );

      processed.push({
        investmentId: investment.id,
        balance: balanceResult.rows[0],
        ledger: ledgerResult.rows[0],
      });
    }

    await client.query("COMMIT");
    return processed;
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Process investments error:", error);
    throw error;
  } finally {
    client.release();
  }
}

setInterval(async () => {
  try {
    const processed = await processMaturedInvestments();

    if (processed.length > 0) {
      console.log(`Auto-processed ${processed.length} matured investments`);
    }
  } catch {
    console.error("Auto investment processor failed");
  }
}, 60000);

app.get("/", (req, res) => {
  res.send("ChainPilot backend is running 🚀");
});

app.get("/api/message", (req, res) => {
  res.json({ message: "Hello from ChainPilot backend" });
});

app.post("/api/auth/register", async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({
        message: "Full name, email, and password are required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters",
      });
    }

    const existingUser = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        message: "Email already exists",
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `
      INSERT INTO users (full_name, email, password_hash, role)
      VALUES ($1, $2, $3, 'USER')
      RETURNING id, full_name, email, role, created_at
      `,
      [fullName, email, passwordHash]
    );

    const user = result.rows[0];
    const token = createToken(user);
    
    sendWelcomeEmail(user.email, user.full_name);

    res.status(201).json({
      message: "Registration successful",
      token,
      user,
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: "Registration failed" });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const result = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

    if (result.rows.length === 0) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const user = result.rows[0];

    if (!user.password_hash) {
      return res.status(400).json({
        message:
          "This user does not have a password yet. Please register a new account.",
      });
    }

    const passwordMatches = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatches) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const token = createToken(user);

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Login failed" });
  }
});

app.get("/api/auth/me", requireAuth, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, full_name, email, role, created_at FROM users WHERE id = $1",
      [req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(result.rows[0]);
  } catch {
    res.status(500).json({ message: "Failed to load user" });
  }
});

app.get("/api/users", requireAuth, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, full_name, email, role, created_at FROM users ORDER BY id DESC"
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Fetch users error:", error);
    res.status(500).json({ message: "Failed to fetch users" });
  }
});

app.get("/api/users/:id/balances", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;

    if (Number(id) !== req.user.userId && req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Access denied" });
    }

    const balances = await pool.query(
      "SELECT * FROM account_balances WHERE user_id = $1 ORDER BY currency ASC",
      [id]
    );

    const ledger = await pool.query(
      "SELECT * FROM ledger_entries WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50",
      [id]
    );

    const investments = await pool.query(
      `
      SELECT ui.*, ip.name AS plan_name, ip.expected_return_percent, ip.duration_days
      FROM user_investments ui
      JOIN investment_plans ip ON ui.plan_id = ip.id
      WHERE ui.user_id = $1
      ORDER BY ui.start_date DESC
      `,
      [id]
    );

    res.json({
      balances: balances.rows,
      ledger: ledger.rows,
      investments: investments.rows,
    });
  } catch (error) {
    console.error("Fetch balances error:", error);
    res.status(500).json({ message: "Failed to fetch balances" });
  }
});

app.get("/api/users/:id/deposits-withdrawals", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;

    if (Number(id) !== req.user.userId && req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Access denied" });
    }

    const deposits = await pool.query(
      "SELECT * FROM deposits WHERE user_id = $1 ORDER BY created_at DESC",
      [id]
    );

    const withdrawals = await pool.query(
      "SELECT * FROM withdrawals WHERE user_id = $1 ORDER BY created_at DESC",
      [id]
    );

    res.json({
      deposits: deposits.rows,
      withdrawals: withdrawals.rows,
    });
  } catch (error) {
    console.error("Fetch deposit/withdrawal error:", error);
    res.status(500).json({ message: "Failed to fetch records" });
  }
});

app.post("/api/deposits", requireAuth, async (req, res) => {
  try {
    const { currency, amount } = req.body;
    const userId = req.user.userId;
    const numericAmount = Number(amount);

    if (!currency || Number.isNaN(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({
        message: "Valid currency and amount are required",
      });
    }

    const result = await pool.query(
      `
      INSERT INTO deposits (user_id, currency, amount, status)
      VALUES ($1, $2, $3, 'PENDING')
      RETURNING *
      `,
      [userId, currency, numericAmount]
    );

    res.status(201).json({
      message: "Deposit request created",
      deposit: result.rows[0],
    });
  } catch (error) {
    console.error("Create deposit error:", error);
    res.status(500).json({ message: "Failed to create deposit request" });
  }
});

app.post("/api/withdrawals", requireAuth, async (req, res) => {
  try {
    const { currency, amount, walletAddress } = req.body;
    const userId = req.user.userId;
    const numericAmount = Number(amount);

    if (!currency || Number.isNaN(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({
        message: "Valid currency and amount are required",
      });
    }

    const result = await pool.query(
      `
      INSERT INTO withdrawals (user_id, currency, amount, wallet_address, status)
      VALUES ($1, $2, $3, $4, 'PENDING')
      RETURNING *
      `,
      [userId, currency, numericAmount, walletAddress || ""]
    );

    res.status(201).json({
      message: "Withdrawal request created",
      withdrawal: result.rows[0],
    });
  } catch (error) {
    console.error("Create withdrawal error:", error);
    res.status(500).json({ message: "Failed to create withdrawal request" });
  }
});

app.get("/api/admin/pending", requireAuth, requireAdmin, async (req, res) => {
  try {
    const deposits = await pool.query(
      `
      SELECT d.*, u.full_name, u.email
      FROM deposits d
      JOIN users u ON d.user_id = u.id
      WHERE d.status = 'PENDING'
      ORDER BY d.created_at DESC
      `
    );

    const withdrawals = await pool.query(
      `
      SELECT w.*, u.full_name, u.email
      FROM withdrawals w
      JOIN users u ON w.user_id = u.id
      WHERE w.status = 'PENDING'
      ORDER BY w.created_at DESC
      `
    );

    res.json({
      deposits: deposits.rows,
      withdrawals: withdrawals.rows,
    });
  } catch (error) {
    console.error("Fetch pending admin data error:", error);
    res.status(500).json({ message: "Failed to fetch pending requests" });
  }
});

app.post(
  "/api/admin/adjust-balance",
  requireAuth,
  requireAdmin,
  async (req, res) => {
    const client = await pool.connect();

    try {
      const { userId, currency, amount, reason } = req.body;
      const numericAmount = Number(amount);

      if (
        !userId ||
        !currency ||
        Number.isNaN(numericAmount) ||
        numericAmount === 0
      ) {
        return res.status(400).json({
          message: "Valid userId, currency, and amount are required",
        });
      }

      await client.query("BEGIN");

      const userCheck = await client.query(
        "SELECT id FROM users WHERE id = $1",
        [userId]
      );

      if (userCheck.rows.length === 0) {
        await client.query("ROLLBACK");
        return res.status(404).json({ message: "User not found" });
      }

      const balanceResult = await client.query(
        `
        INSERT INTO account_balances (user_id, currency, available, locked)
        VALUES ($1, $2, $3, 0)
        ON CONFLICT (user_id, currency)
        DO UPDATE SET
          available = account_balances.available + EXCLUDED.available,
          updated_at = CURRENT_TIMESTAMP
        RETURNING *
        `,
        [userId, currency, numericAmount]
      );

      const ledgerResult = await client.query(
        `
        INSERT INTO ledger_entries (user_id, currency, amount, type, reason)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
        `,
        [
          userId,
          currency,
          numericAmount,
          "ADMIN_ADJUSTMENT",
          reason || "Manual admin balance adjustment",
        ]
      );

      await client.query("COMMIT");

      res.json({
        message: "Balance adjusted successfully",
        balance: balanceResult.rows[0],
        ledger: ledgerResult.rows[0],
      });
    } catch (error) {
      await client.query("ROLLBACK");
      console.error("Adjust balance error:", error);
      res.status(500).json({ message: "Failed to adjust balance" });
    } finally {
      client.release();
    }
  }
);

app.post(
  "/api/admin/deposits/:id/approve",
  requireAuth,
  requireAdmin,
  async (req, res) => {
    const client = await pool.connect();

    try {
      const depositId = Number(req.params.id);

      await client.query("BEGIN");

      const depositResult = await client.query(
        "SELECT * FROM deposits WHERE id = $1 FOR UPDATE",
        [depositId]
      );

      if (depositResult.rows.length === 0) {
        await client.query("ROLLBACK");
        return res.status(404).json({ message: "Deposit not found" });
      }

      const deposit = depositResult.rows[0];

      if (deposit.status !== "PENDING") {
        await client.query("ROLLBACK");
        return res
          .status(400)
          .json({ message: "Deposit has already been processed" });
      }

      await client.query("UPDATE deposits SET status = 'APPROVED' WHERE id = $1", [
        depositId,
      ]);

      const balanceResult = await client.query(
        `
        INSERT INTO account_balances (user_id, currency, available, locked)
        VALUES ($1, $2, $3, 0)
        ON CONFLICT (user_id, currency)
        DO UPDATE SET
          available = account_balances.available + EXCLUDED.available,
          updated_at = CURRENT_TIMESTAMP
        RETURNING *
        `,
        [deposit.user_id, deposit.currency, deposit.amount]
      );

      const ledgerResult = await client.query(
        `
        INSERT INTO ledger_entries (user_id, currency, amount, type, reason)
        VALUES ($1, $2, $3, 'DEPOSIT_APPROVED', $4)
        RETURNING *
        `,
        [
          deposit.user_id,
          deposit.currency,
          deposit.amount,
          `Deposit #${depositId} approved`,
        ]
      );

      await client.query("COMMIT");

      res.json({
        message: "Deposit approved and balance updated",
        balance: balanceResult.rows[0],
        ledger: ledgerResult.rows[0],
      });
    } catch (error) {
      await client.query("ROLLBACK");
      console.error("Approve deposit error:", error);
      res.status(500).json({ message: "Failed to approve deposit" });
    } finally {
      client.release();
    }
  }
);

app.post(
  "/api/admin/deposits/:id/reject",
  requireAuth,
  requireAdmin,
  async (req, res) => {
    try {
      const depositId = Number(req.params.id);

      const result = await pool.query(
        `
        UPDATE deposits
        SET status = 'REJECTED'
        WHERE id = $1 AND status = 'PENDING'
        RETURNING *
        `,
        [depositId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          message: "Pending deposit not found",
        });
      }

      res.json({
        message: "Deposit rejected",
        deposit: result.rows[0],
      });
    } catch (error) {
      console.error("Reject deposit error:", error);
      res.status(500).json({ message: "Failed to reject deposit" });
    }
  }
);

app.post(
  "/api/admin/withdrawals/:id/reject",
  requireAuth,
  requireAdmin,
  async (req, res) => {
    try {
      const withdrawalId = Number(req.params.id);

      const result = await pool.query(
        `
        UPDATE withdrawals
        SET status = 'REJECTED'
        WHERE id = $1 AND status = 'PENDING'
        RETURNING *
        `,
        [withdrawalId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          message: "Pending withdrawal not found",
        });
      }

      res.json({
        message: "Withdrawal rejected",
        withdrawal: result.rows[0],
      });
    } catch (error) {
      console.error("Reject withdrawal error:", error);
      res.status(500).json({ message: "Failed to reject withdrawal" });
    }
  }
);

app.post(
  "/api/admin/withdrawals/:id/approve",
  requireAuth,
  requireAdmin,
  async (req, res) => {
    const client = await pool.connect();

    try {
      const withdrawalId = Number(req.params.id);

      await client.query("BEGIN");

      const withdrawalResult = await client.query(
        "SELECT * FROM withdrawals WHERE id = $1 FOR UPDATE",
        [withdrawalId]
      );

      if (withdrawalResult.rows.length === 0) {
        await client.query("ROLLBACK");
        return res.status(404).json({ message: "Withdrawal not found" });
      }

      const withdrawal = withdrawalResult.rows[0];

      if (withdrawal.status !== "PENDING") {
        await client.query("ROLLBACK");
        return res
          .status(400)
          .json({ message: "Withdrawal has already been processed" });
      }

      const balanceResult = await client.query(
        `
        SELECT * FROM account_balances
        WHERE user_id = $1 AND currency = $2
        FOR UPDATE
        `,
        [withdrawal.user_id, withdrawal.currency]
      );

      if (balanceResult.rows.length === 0) {
        await client.query("ROLLBACK");
        return res
          .status(400)
          .json({ message: "User has no balance for this currency" });
      }

      const balance = balanceResult.rows[0];

      if (Number(balance.available) < Number(withdrawal.amount)) {
        await client.query("ROLLBACK");
        return res.status(400).json({ message: "Insufficient balance" });
      }

      await client.query("UPDATE withdrawals SET status = 'APPROVED' WHERE id = $1", [
        withdrawalId,
      ]);

      const updatedBalance = await client.query(
        `
        UPDATE account_balances
        SET available = available - $1,
            updated_at = CURRENT_TIMESTAMP
        WHERE user_id = $2 AND currency = $3
        RETURNING *
        `,
        [withdrawal.amount, withdrawal.user_id, withdrawal.currency]
      );

      const ledgerResult = await client.query(
        `
        INSERT INTO ledger_entries (user_id, currency, amount, type, reason)
        VALUES ($1, $2, $3, 'WITHDRAWAL_APPROVED', $4)
        RETURNING *
        `,
        [
          withdrawal.user_id,
          withdrawal.currency,
          -Number(withdrawal.amount),
          `Withdrawal #${withdrawalId} approved`,
        ]
      );

      await client.query("COMMIT");

      res.json({
        message: "Withdrawal approved and balance updated",
        balance: updatedBalance.rows[0],
        ledger: ledgerResult.rows[0],
      });
    } catch (error) {
      await client.query("ROLLBACK");
      console.error("Approve withdrawal error:", error);
      res.status(500).json({ message: "Failed to approve withdrawal" });
    } finally {
      client.release();
    }
  }
);

app.get("/api/investment-plans", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM investment_plans WHERE is_active = TRUE ORDER BY min_amount ASC"
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Fetch plans error:", error);
    res.status(500).json({ message: "Failed to fetch investment plans" });
  }
});

app.post("/api/investments", requireAuth, async (req, res) => {
  const client = await pool.connect();

  try {
    const { planId, amount } = req.body;
    const userId = req.user.userId;
    const numericAmount = Number(amount);

    if (!planId || Number.isNaN(numericAmount) || numericAmount <= 0) {
      return res
        .status(400)
        .json({ message: "Valid planId and amount are required" });
    }

    await client.query("BEGIN");

    const planResult = await client.query(
      "SELECT * FROM investment_plans WHERE id = $1 AND is_active = TRUE",
      [planId]
    );

    if (planResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Investment plan not found" });
    }

    const plan = planResult.rows[0];

    if (numericAmount < Number(plan.min_amount)) {
      await client.query("ROLLBACK");
      return res
        .status(400)
        .json({ message: `Minimum amount is ${plan.min_amount}` });
    }

    const balanceResult = await client.query(
      `
      SELECT * FROM account_balances
      WHERE user_id = $1 AND currency = $2
      FOR UPDATE
      `,
      [userId, plan.currency]
    );

    if (
      balanceResult.rows.length === 0 ||
      Number(balanceResult.rows[0].available) < numericAmount
    ) {
      await client.query("ROLLBACK");
      return res.status(400).json({ message: "Insufficient available balance" });
    }

    await client.query(
      `
      UPDATE account_balances
      SET available = available - $1,
          updated_at = CURRENT_TIMESTAMP
      WHERE user_id = $2 AND currency = $3
      `,
      [numericAmount, userId, plan.currency]
    );

    const expectedReturn =
      numericAmount + (numericAmount * Number(plan.expected_return_percent)) / 100;

    const investmentResult = await client.query(
      `
      INSERT INTO user_investments
      (user_id, plan_id, currency, amount, expected_return, status, end_date)
      VALUES ($1, $2, $3, $4, $5, 'ACTIVE', CURRENT_TIMESTAMP + ($6 || ' days')::INTERVAL)
      RETURNING *
      `,
      [
        userId,
        planId,
        plan.currency,
        numericAmount,
        expectedReturn,
        plan.duration_days,
      ]
    );

    const ledgerResult = await client.query(
      `
      INSERT INTO ledger_entries (user_id, currency, amount, type, reason)
      VALUES ($1, $2, $3, 'INVESTMENT_STARTED', $4)
      RETURNING *
      `,
      [userId, plan.currency, -numericAmount, `Investment started: ${plan.name}`]
    );

    await client.query("COMMIT");

    res.status(201).json({
      message: "Investment started successfully",
      investment: investmentResult.rows[0],
      ledger: ledgerResult.rows[0],
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Create investment error:", error);
    res.status(500).json({ message: "Failed to create investment" });
  } finally {
    client.release();
  }
});

app.post(
  "/api/admin/process-investments",
  requireAuth,
  requireAdmin,
  async (req, res) => {
    try {
      const processed = await processMaturedInvestments();

      res.json({
        message: "Matured investments processed",
        count: processed.length,
        processed,
      });
    } catch {
      res.status(500).json({ message: "Failed to process matured investments" });
    }
  }
);

app.get(
  "/api/admin/analytics",
  requireAuth,
  requireAdmin,
  async (req, res) => {
    try {
      const deposits = await pool.query(
        "SELECT COALESCE(SUM(amount),0) AS total FROM deposits WHERE status = 'APPROVED'"
      );

      const withdrawals = await pool.query(
        "SELECT COALESCE(SUM(amount),0) AS total FROM withdrawals WHERE status = 'APPROVED'"
      );

      const activeInvestments = await pool.query(
        "SELECT COUNT(*) FROM user_investments WHERE status = 'ACTIVE'"
      );

      const completedInvestments = await pool.query(
        "SELECT COUNT(*) FROM user_investments WHERE status = 'COMPLETED'"
      );

      const totalDeposits = Number(deposits.rows[0].total);
      const totalWithdrawals = Number(withdrawals.rows[0].total);

      const platformProfit = totalDeposits - totalWithdrawals;

      res.json({
        totalDeposits,
        totalWithdrawals,
        platformProfit,
        activeInvestments: Number(activeInvestments.rows[0].count),
        completedInvestments: Number(completedInvestments.rows[0].count),
      });
    } catch (error) {
      console.error("Analytics error:", error);
      res.status(500).json({ message: "Failed to load analytics" });
    }
  }
);
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on http://127.0.0.1:${PORT}`);
});