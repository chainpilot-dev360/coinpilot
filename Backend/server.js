import express from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cors from "cors";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import rateLimit from "express-rate-limit";
import { pool } from "./db.js";
import {
  sendWelcomeEmail,
  sendVerificationEmail,
  sendPasswordResetEmail,
} from "./email.js";
import { logAdminAction } from "./utils/adminLogger.js";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "chainpilot_uploads",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
  },
});

const upload = multer({ storage });

const app = express();

app.use(cors());
app.use(express.json());

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: { message: "Too many requests. Please try again later." },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    message: "Too many login/register attempts. Please try again later.",
  },
});

app.use(generalLimiter);

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

async function createNotification(userId, title, message, type = "INFO") {
  try {
    await pool.query(
      `
      INSERT INTO notifications (user_id, title, message, type)
      VALUES ($1, $2, $3, $4)
      `,
      [userId, title, message, type]
    );
  } catch (error) {
    console.error("Create notification error:", error);
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

      await createNotification(
        investment.user_id,
        "Investment Completed",
        `Your investment #${investment.id} has completed. ${investment.expected_return} ${investment.currency} has been released.`,
        "SUCCESS"
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

app.post("/api/auth/register", authLimiter, async (req, res) => {
  try {
    const {
      username,
      firstName,
      lastName,
      sex,
      email,
      country,
      accountCurrency,
      password,
      confirmPassword,
      referral,
    } = req.body;

    if (
      !username ||
      !firstName ||
      !lastName ||
      !sex ||
      !email ||
      !country ||
      !accountCurrency ||
      !password ||
      !confirmPassword
    ) {
      return res.status(400).json({
        message: "Please fill all required fields",
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        message: "Passwords do not match",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters",
      });
    }

    const existingUser = await pool.query(
      `
      SELECT id FROM users
      WHERE LOWER(email) = LOWER($1)
         OR LOWER(username) = LOWER($2)
      `,
      [email, username]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({
        message: "Email or username already registered",
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const fullName = `${firstName} ${lastName}`;

    const result = await pool.query(
      `
      INSERT INTO users (
        username,
        first_name,
        last_name,
        full_name,
        sex,
        email,
        country,
        account_currency,
        referral,
        password_hash,
        role,
        email_verified,
        verification_token
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'USER', true, NULL)
      RETURNING
        id,
        username,
        first_name,
        last_name,
        full_name,
        sex,
        email,
        country,
        account_currency,
        referral,
        role,
        email_verified,
        created_at
      `,
      [
        username,
        firstName,
        lastName,
        fullName,
        sex,
        email,
        country,
        accountCurrency,
        referral || null,
        passwordHash,
      ]
    );

    const user = result.rows[0];
    const token = createToken(user);

    await createNotification(
      user.id,
      "Welcome to ChainPilot",
      "Your ChainPilot account has been created successfully.",
      "SUCCESS"
    );

    res.status(201).json({
      message: "Registration successful",
      token,
      user,
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({
      message: "Registration failed",
    });
  }
});

app.post("/api/auth/login", authLimiter, async (req, res) => {
  try {
    const { loginId, email, password } = req.body;

    const identifier = loginId || email;

    if (!identifier || !password) {
      return res.status(400).json({
        message: "Username/email and password are required",
      });
    }

    const result = await pool.query(
      `
      SELECT * FROM users
      WHERE LOWER(email) = LOWER($1)
         OR LOWER(username) = LOWER($1)
      `,
      [identifier]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        message: "Invalid username/email or password",
      });
    }

    const user = result.rows[0];

    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatch) {
      return res.status(401).json({
        message: "Invalid username/email or password",
      });
    }

    const token = createToken(user);

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        username: user.username,
        first_name: user.first_name,
        last_name: user.last_name,
        full_name: user.full_name,
        sex: user.sex,
        email: user.email,
        country: user.country,
        account_currency: user.account_currency,
        referral: user.referral,
        role: user.role,
        email_verified: user.email_verified,
        created_at: user.created_at,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      message: "Login failed",
    });
  }
});

app.get("/api/auth/verify-email", async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ message: "Verification token is required" });
    }

    const result = await pool.query(
      `
      UPDATE users
      SET email_verified = true, verification_token = NULL
      WHERE verification_token = $1
      RETURNING id, full_name, email, role, email_verified
      `,
      [token]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ message: "Invalid or expired verification link" });
    }

    res.json({ message: "Email verified successfully" });
  } catch (error) {
    console.error("Verify email error:", error);
    res.status(500).json({ message: "Email verification failed" });
  }
});

app.post("/api/auth/login", authLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const result = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const user = result.rows[0];

    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
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
        email_verified: user.email_verified,
        created_at: user.created_at,
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
      investments: investments.rows.map((inv) => {
        if (inv.status !== "ACTIVE") return inv;

        const start = new Date(inv.start_date);
        const now = new Date();
        const end = new Date(inv.end_date);

        const totalDuration = end - start;
        const elapsed = now - start;

        const progress =
          totalDuration <= 0 ? 100 : Math.min(elapsed / totalDuration, 1);

        const currentValue =
          Number(inv.amount) +
          (Number(inv.expected_return) - Number(inv.amount)) * progress;

        return {
          ...inv,
          progress: Math.floor(progress * 100),
          current_value: currentValue.toFixed(2),
        };
      }),
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

app.post("/api/deposits", requireAuth, upload.single("proof"), async (req, res) => {
  try {
    const currency = req.body?.currency || "USD";
    const amount = Number(req.body?.amount);
    const userId = req.user.userId;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Valid deposit amount is required" });
    }

    const proofUrl = req.file?.path || null;

    const result = await pool.query(
      `
      INSERT INTO deposits (user_id, currency, amount, status, proof_url)
      VALUES ($1, $2, $3, 'PENDING', $4)
      RETURNING *
      `,
      [userId, currency, amount, proofUrl]
    );

    await createNotification(
      userId,
      "Deposit Request Submitted",
      `Your deposit request of ${amount} ${currency} has been submitted.`,
      "INFO"
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
    const kycResult = await pool.query(
      "SELECT status FROM kyc_requests WHERE user_id = $1",
      [req.user.userId]
    );

    if (
      kycResult.rows.length === 0 ||
      kycResult.rows[0].status !== "APPROVED"
    ) {
      return res.status(403).json({
        message: "KYC verification must be approved before withdrawal.",
      });
    }
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

    await createNotification(
      userId,
      "Withdrawal Request Created",
      `Your withdrawal request of ${numericAmount} ${currency} has been submitted.`,
      "INFO"
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

      await createNotification(
        userId,
        "Balance Updated",
        `Your balance was updated by admin: ${numericAmount} ${currency}.`,
        numericAmount > 0 ? "SUCCESS" : "INFO"
      );

      await client.query("COMMIT");

      await logAdminAction(
        pool,
        req.user.id,
        "ADJUST_BALANCE",
        "user",
        userId,
        `Adjusted ${currency} balance by ${amount}. Reason: ${reason}`
      );

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

      await createNotification(
        deposit.user_id,
        "Deposit Approved",
        `Your deposit of ${deposit.amount} ${deposit.currency} has been approved.`,
        "SUCCESS"
      );

      await client.query("COMMIT");

      await logAdminAction(
        pool,
        req.user.id,
        "APPROVE_DEPOSIT",
        "deposit",
        depositId,
        `Approved deposit ID ${depositId}`
      );

      try {
        await logAdminAction(
          pool,
          req.user.userId,
          "APPROVE_DEPOSIT",
          "deposit",
          depositId,
          `Approved deposit ID ${depositId}`
        );
      } catch (logError) {
        console.error("Admin log failed after deposit approval:", logError);
      }

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

      const deposit = result.rows[0];

      await logAdminAction(
        pool,
        req.user.id,
        "REJECT_DEPOSIT",
        "deposit",
        depositId,
        `Rejected deposit ID ${depositId}`
      );

      await createNotification(
        deposit.user_id,
        "Deposit Rejected",
        `Your deposit of ${deposit.amount} ${deposit.currency} was rejected.`,
        "ERROR"
      );

      await logAdminAction(
        pool,
        req.user.id,
        "REJECT_WITHDRAWAL",
        "withdrawal",
        withdrawalId,
        `Rejected withdrawal ID ${withdrawalId}`
      );

      res.json({
        message: "Deposit rejected",
        deposit,
      });
    } catch (error) {
      console.error("Reject deposit error:", error);
      res.status(500).json({ message: "Failed to reject deposit" });
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

      await createNotification(
        withdrawal.user_id,
        "Withdrawal Approved",
        `Your withdrawal of ${withdrawal.amount} ${withdrawal.currency} has been approved.`,
        "SUCCESS"
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

      const withdrawal = result.rows[0];

      await createNotification(
        withdrawal.user_id,
        "Withdrawal Rejected",
        `Your withdrawal of ${withdrawal.amount} ${withdrawal.currency} was rejected.`,
        "ERROR"
      );

      res.json({
        message: "Withdrawal rejected",
        withdrawal,
      });
    } catch (error) {
      console.error("Reject withdrawal error:", error);
      res.status(500).json({ message: "Failed to reject withdrawal" });
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

    await createNotification(
      userId,
      "Investment Started",
      `Your ${plan.name} investment of ${numericAmount} ${plan.currency} has started.`,
      "SUCCESS"
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

app.post(
  "/api/admin/investments/:id/stop",
  requireAuth,
  requireAdmin,
  async (req, res) => {
    const client = await pool.connect();

    try {
      const investmentId = Number(req.params.id);

      await client.query("BEGIN");

      const result = await client.query(
        "SELECT * FROM user_investments WHERE id = $1 FOR UPDATE",
        [investmentId]
      );

      if (result.rows.length === 0) {
        await client.query("ROLLBACK");
        return res.status(404).json({ message: "Investment not found" });
      }

      const investment = result.rows[0];

      if (investment.status !== "ACTIVE") {
        await client.query("ROLLBACK");
        return res.status(400).json({ message: "Investment is not active" });
      }

      await client.query(
        "UPDATE user_investments SET status = 'STOPPED' WHERE id = $1",
        [investmentId]
      );

      await client.query(
        `
        INSERT INTO account_balances (user_id, currency, available, locked)
        VALUES ($1, $2, $3, 0)
        ON CONFLICT (user_id, currency)
        DO UPDATE SET
          available = account_balances.available + EXCLUDED.available,
          updated_at = CURRENT_TIMESTAMP
        `,
        [investment.user_id, investment.currency, investment.amount]
      );

      await client.query(
        `
        INSERT INTO ledger_entries (user_id, currency, amount, type, reason)
        VALUES ($1, $2, $3, 'INVESTMENT_STOPPED', $4)
        `,
        [
          investment.user_id,
          investment.currency,
          investment.amount,
          `Investment #${investmentId} stopped by admin. Principal returned.`,
        ]
      );

      await createNotification(
        investment.user_id,
        "Investment Stopped",
        `Your investment #${investmentId} was stopped by admin. Principal has been returned.`,
        "INFO"
      );

      await client.query("COMMIT");

      res.json({ message: "Investment stopped and principal returned" });
    } catch (error) {
      await client.query("ROLLBACK");
      console.error("Stop investment error:", error);
      res.status(500).json({ message: "Failed to stop investment" });
    } finally {
      client.release();
    }
  }
);

app.get("/api/notifications", requireAuth, async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT *
      FROM notifications
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT 20
      `,
      [req.user.userId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Fetch notifications error:", error);
    res.status(500).json({ message: "Failed to fetch notifications" });
  }
});

app.post("/api/notifications/read", requireAuth, async (req, res) => {
  try {
    await pool.query(
      `
      UPDATE notifications
      SET is_read = TRUE
      WHERE user_id = $1
      `,
      [req.user.userId]
    );

    res.json({ message: "Notifications marked as read" });
  } catch (error) {
    console.error("Mark notifications read error:", error);
    res.status(500).json({ message: "Failed to update notifications" });
  }
});

app.get("/api/auth/verify-email", async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ message: "Verification token is required" });
    }

    const result = await pool.query(
      `
      SELECT *
      FROM users
      WHERE verification_token = $1
      AND verification_token_expires > CURRENT_TIMESTAMP
      `,
      [token]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({
        message: "Invalid or expired verification link",
      });
    }

    const user = result.rows[0];

    await pool.query(
      `
      UPDATE users
      SET email_verified = TRUE,
          verification_token = NULL,
          verification_token_expires = NULL
      WHERE id = $1
      `,
      [user.id]
    );

    await createNotification(
      user.id,
      "Email Verified",
      "Your email address has been verified successfully.",
      "SUCCESS"
    );

    res.json({ message: "Email verified successfully" });
  } catch (error) {
    console.error("Verify email error:", error);
    res.status(500).json({ message: "Email verification failed" });
  }
});

app.delete("/api/admin/users/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    const userId = Number(req.params.id);

    if (!userId) {
      return res.status(400).json({ message: "Valid user ID is required" });
    }

    if (userId === req.user.userId) {
      return res.status(400).json({
        message: "You cannot delete your own admin account",
      });
    }

    const result = await pool.query(
      "DELETE FROM users WHERE id = $1 RETURNING id, full_name, email",
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    await logAdminAction(
      pool,
      req.user.id,
      "DELETE_USER",
      "user",
      userId,
      `Deleted user ID ${userId}`
    );

    res.json({
      message: "User account deleted successfully",
      deletedUser: result.rows[0],
    });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({ message: "Failed to delete user" });
  }
});

app.post("/api/auth/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const result = await pool.query(
      "SELECT id, full_name, email FROM users WHERE email = $1",
      [email]
    );

    if (result.rows.length === 0) {
      return res.json({
        message: "If this email exists, a reset link has been sent.",
      });
    }

    const user = result.rows[0];
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetExpires = new Date(Date.now() + 1000 * 60 * 30);

    await pool.query(
      `
      UPDATE users
      SET reset_password_token = $1,
          reset_password_expires = $2
      WHERE id = $3
      `,
      [resetToken, resetExpires, user.id]
    );

    sendPasswordResetEmail(user.email, user.full_name, resetToken);

    res.json({
      message: "If this email exists, a reset link has been sent.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ message: "Failed to request password reset" });
  }
});

app.post("/api/auth/reset-password", async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({
        message: "Token and new password are required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters",
      });
    }

    const result = await pool.query(
      `
      SELECT *
      FROM users
      WHERE reset_password_token = $1
      AND reset_password_expires > CURRENT_TIMESTAMP
      `,
      [token]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({
        message: "Invalid or expired reset link",
      });
    }

    const user = result.rows[0];
    const passwordHash = await bcrypt.hash(password, 10);

    await pool.query(
      `
      UPDATE users
      SET password_hash = $1,
          reset_password_token = NULL,
          reset_password_expires = NULL
      WHERE id = $2
      `,
      [passwordHash, user.id]
    );

    await createNotification(
      user.id,
      "Password Updated",
      "Your password was reset successfully.",
      "SUCCESS"
    );

    res.json({ message: "Password reset successful" });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ message: "Failed to reset password" });
  }
});

app.post(
  "/api/deposits",
  requireAuth,
  upload.single("proof"),
  async (req, res) => {
    try {
      const { amount, currency } = req.body;

      if (!amount || !currency) {
        return res.status(400).json({
          message: "Amount and currency are required",
        });
      }

      let proofUrl = null;

      if (req.file) {
        proofUrl = req.file.path;
      }

      const result = await pool.query(
        `
        INSERT INTO deposits (user_id, amount, currency, status, proof_url)
        VALUES ($1, $2, $3, 'PENDING', $4)
        RETURNING *
        `,
        [req.user.userId, amount, currency, proofUrl]
      );

      res.json({
        message: "Deposit submitted successfully",
        deposit: result.rows[0],
      });
    } catch (error) {
      console.error("Deposit upload error:", error);
      res.status(500).json({ message: "Failed to submit deposit" });
    }
  }
);

app.get("/api/admin/logs", requireAuth, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM admin_logs ORDER BY created_at DESC LIMIT 50"
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Admin logs error:", error);
    res.status(500).json({ message: "Failed to fetch admin logs" });
  }
});

app.post("/api/auth/change-password", requireAuth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        message: "Current password and new password are required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        message: "New password must be at least 6 characters",
      });
    }

    const result = await pool.query("SELECT * FROM users WHERE id = $1", [
      req.user.userId,
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = result.rows[0];

    const passwordMatches = await bcrypt.compare(
      currentPassword,
      user.password_hash
    );

    if (!passwordMatches) {
      return res.status(401).json({
        message: "Current password is incorrect",
      });
    }

    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    await pool.query(
      "UPDATE users SET password_hash = $1 WHERE id = $2",
      [newPasswordHash, req.user.userId]
    );

    await createNotification(
      req.user.userId,
      "Password Changed",
      "Your account password was changed successfully.",
      "SUCCESS"
    );

    res.json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({ message: "Failed to change password" });
  }
});

// Submit KYC
app.post("/api/kyc/submit", requireAuth, upload.single("document"), async (req, res) => {
  try {
    const { fullName, country, idType, idNumber } = req.body;

let documentUrl = null;

if (req.file) {
  documentUrl = req.file.path;
}

    if (!fullName || !country || !idType || !idNumber) {
      return res.status(400).json({
        message: "All required fields must be filled",
      });
    }

    const existing = await pool.query(
  "SELECT id, status FROM kyc_requests WHERE user_id = $1",
  [req.user.userId]
);

if (existing.rows.length > 0) {
  const current = existing.rows[0];

  if (current.status === "PENDING") {
    return res.status(400).json({
      message: "Your KYC is still under review.",
    });
  }

  if (current.status === "APPROVED") {
    return res.status(400).json({
      message: "Your account is already verified.",
    });
  }

  // If REJECTED → allow resubmission by updating
  if (current.status === "REJECTED") {
    await pool.query(
      `
      UPDATE kyc_requests
      SET full_name = $1,
          country = $2,
          id_type = $3,
          id_number = $4,
          document_url = $5,
          status = 'PENDING',
          admin_note = NULL,
          updated_at = CURRENT_TIMESTAMP
      WHERE user_id = $6
      `,
      [
        fullName,
        country,
        idType,
        idNumber,
        documentUrl,
        req.user.userId,
      ]
    );

    return res.json({ message: "KYC resubmitted successfully" });
  }
}

    await pool.query(
      `
      INSERT INTO kyc_requests (user_id, full_name, country, id_type, id_number, document_url)
      VALUES ($1, $2, $3, $4, $5, $6)
      `,
      [
        req.user.userId,
        fullName,
        country,
        idType,
        idNumber,
        documentUrl || null,
      ]
    );

    res.json({ message: "KYC submitted successfully" });
  } catch (error) {
    console.error("KYC submit error:", error);
    res.status(500).json({ message: "Failed to submit KYC" });
  }
});

// Get user KYC
app.get("/api/kyc/me", requireAuth, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM kyc_requests WHERE user_id = $1",
      [req.user.userId]
    );

    res.json(result.rows[0] || null);
  } catch (error) {
    console.error("Fetch KYC error:", error);
    res.status(500).json({ message: "Failed to fetch KYC" });
  }
});

// Admin: get all KYC
app.get("/api/admin/kyc", requireAuth, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT k.*, u.email
      FROM kyc_requests k
      JOIN users u ON u.id = k.user_id
      ORDER BY k.created_at DESC
      `
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Admin KYC fetch error:", error);
    res.status(500).json({ message: "Failed to fetch KYC list" });
  }
});

// Admin: update KYC status
app.post("/api/admin/kyc/update", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { id, status, adminNote } = req.body;

    if (!id || !status) {
      return res.status(400).json({
        message: "ID and status are required",
      });
    }

    await pool.query(
      `
      UPDATE kyc_requests
      SET status = $1, admin_note = $2, updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
      `,
      [status, adminNote || null, id]
    );

    res.json({ message: "KYC status updated" });
  } catch (error) {
    console.error("KYC update error:", error);
    res.status(500).json({ message: "Failed to update KYC" });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on http://127.0.0.1:${PORT}`);
});