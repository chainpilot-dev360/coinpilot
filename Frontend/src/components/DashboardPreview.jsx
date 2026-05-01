import { useEffect, useRef, useState } from "react";
import axios from "axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import KycPanel from "./KycPanel";

const API_URL = import.meta.env.VITE_API_URL;

const tickerItems = [
  { symbol: "BTC/USD", price: "$67,240", change: "+2.4%" },
  { symbol: "ETH/USD", price: "$3,420", change: "+1.8%" },
  { symbol: "EUR/USD", price: "1.0842", change: "-0.2%" },
  { symbol: "NASDAQ", price: "16,340", change: "+0.9%" },
  { symbol: "S&P 500", price: "5,218", change: "+0.6%" },
  { symbol: "GOLD", price: "$2,336", change: "+0.4%" },
];

function MarketTicker() {
  return (
    <div style={tickerWrap}>
      <div style={tickerTrack}>
        {[...tickerItems, ...tickerItems].map((item, index) => {
          const positive = item.change.startsWith("+");

          return (
            <div key={index} style={tickerItem}>
              <strong>{item.symbol}</strong>
              <span>{item.price}</span>
              <span style={{ color: positive ? "#22c55e" : "#ef4444" }}>
                {item.change}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AnimatedNumber({ value }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = Number(value || 0);
    const duration = 800;
    const increment = end / (duration / 16);

    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        start = end;
        clearInterval(timer);
      }
      setDisplay(start);
    }, 16);

    return () => clearInterval(timer);
  }, [value]);

  return <span>{display.toFixed(2)}</span>;
}

function HoverCard({ children }) {
  return (
    <div
      style={card}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-6px)";
        e.currentTarget.style.boxShadow = "0 20px 45px rgba(56,189,248,0.18)";
        e.currentTarget.style.borderColor = "rgba(56,189,248,0.35)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "none";
        e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
      }}
    >
      {children}
    </div>
  );
}

function MarketChart() {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    containerRef.current.innerHTML = "";

    const script = document.createElement("script");
    script.src =
      "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type = "text/javascript";
    script.async = true;

    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol: "FX:EURUSD",
      interval: "60",
      timezone: "Etc/UTC",
      theme: "dark",
      style: "1",
      locale: "en",
      enable_publishing: false,
      allow_symbol_change: true,
      calendar: false,
      support_host: "https://www.tradingview.com",
    });

    containerRef.current.appendChild(script);
  }, []);

  return (
    <div style={marketChartBox}>
      <div ref={containerRef} style={{ height: "420px", width: "100%" }} />
    </div>
  );
}

function DashboardPreview({ token, user }) {
  const [data, setData] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [notificationOpen, setNotificationOpen] = useState(false);

  const [depositAmount, setDepositAmount] = useState("");
  const [depositCurrency, setDepositCurrency] = useState("USD");
  const [depositFile, setDepositFile] = useState(null);
  const [previewImage, setPreviewImage] = useState("");

  const [depositHistory, setDepositHistory] = useState([]);
  const [withdrawalHistory, setWithdrawalHistory] = useState([]);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  async function changePassword() {
  if (!currentPassword || !newPassword || !confirmPassword) {
    alert("All fields are required");
    return;
  }

  if (newPassword !== confirmPassword) {
    alert("New passwords do not match");
    return;
  }

  try {
    await axios.post(
      `${API_URL}/api/auth/change-password`,
      {
        currentPassword,
        newPassword,
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    alert("Password changed successfully");

    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  } catch (error) {
    alert(error.response?.data?.message || "Failed to change password");
  }
}

  useEffect(() => {
    loadDashboard();
    loadNotifications();
    loadTransactionHistory();

    const interval = setInterval(() => {
      loadDashboard();
      loadNotifications();
      loadTransactionHistory();
    }, 5000);

    return () => clearInterval(interval);
  }, [token]);

  async function loadDashboard() {
    try {
      const res = await axios.get(`${API_URL}/api/users/${user.id}/balances`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setData(res.data);
    } catch (error) {
      console.error("Dashboard load error", error);
    }
  }

  async function loadNotifications() {
    try {
      const res = await axios.get(`${API_URL}/api/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setNotifications(res.data || []);
    } catch (error) {
      console.error("Notifications load error", error);
    }
  }

  async function loadTransactionHistory() {
    try {
      const res = await axios.get(
        `${API_URL}/api/users/${user.id}/deposits-withdrawals`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setDepositHistory(res.data.deposits || []);
      setWithdrawalHistory(res.data.withdrawals || []);
    } catch (error) {
      console.error("Transaction history error", error);
    }
  }

  async function markNotificationsRead() {
    try {
      await axios.post(
        `${API_URL}/api/notifications/read`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      loadNotifications();
    } catch (error) {
      console.error("Mark read error", error);
    }
  }

  function handleProofChange(e) {
    const file = e.target.files[0];
    setDepositFile(file);

    if (file) {
      setPreviewImage(URL.createObjectURL(file));
    } else {
      setPreviewImage("");
    }
  }

  async function submitDeposit() {
    if (!depositAmount || !depositCurrency) {
      alert("Enter amount and currency");
      return;
    }

    async function changePassword() {
      if (!currentPassword || !newPassword || !confirmPassword) {
        alert("All fields are required");
        return;
      }

      if (newPassword !== confirmPassword) {
        alert("New passwords do not match");
        return;
      }

      try {
        await axios.post(
          `${API_URL}/api/auth/change-password`,
          {
            currentPassword,
            newPassword,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        alert("Password changed successfully");

        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } catch (error) {
        alert(error.response?.data?.message || "Failed to change password");
      }
   }

    async function changePassword() {
  if (!currentPassword || !newPassword || !confirmPassword) {
    alert("All fields are required");
    return;
  }

  if (newPassword !== confirmPassword) {
    alert("New passwords do not match");
    return;
  }

  try {
    await axios.post(
      `${API_URL}/api/auth/change-password`,
      {
        currentPassword,
        newPassword,
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    alert("Password changed successfully");

    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  } catch (error) {
    alert(error.response?.data?.message || "Failed to change password");
  }
}

    const formData = new FormData();
    formData.append("amount", depositAmount);
    formData.append("currency", depositCurrency);

    if (depositFile) {
      formData.append("proof", depositFile);
    }

    try {
      await axios.post(`${API_URL}/api/deposits`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      alert("Deposit submitted successfully. Awaiting admin approval.");
      setDepositAmount("");
      setDepositCurrency("USD");
      setDepositFile(null);
      setPreviewImage("");
      loadDashboard();
      loadTransactionHistory();
    } catch (error) {
      alert(error.response?.data?.message || "Deposit failed");
    }
  }

  if (!data) return <SkeletonDashboard />;

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const totalBalance = data.balances.reduce(
    (sum, b) => sum + Number(b.available || 0),
    0
  );

  const activeInvestments = data.investments.filter(
    (inv) => inv.status === "ACTIVE"
  );

  const totalActiveInvested = activeInvestments.reduce(
    (sum, inv) => sum + Number(inv.amount || 0),
    0
  );

  const totalCurrentValue = activeInvestments.reduce(
    (sum, inv) => sum + Number(inv.current_value || inv.amount || 0),
    0
  );

  const totalProfit = totalCurrentValue - totalActiveInvested;

  const chartData = data.investments.map((inv) => ({
    name: inv.plan_name || "Investment",
    value:
      inv.status === "ACTIVE"
        ? Number(inv.current_value || inv.amount)
        : Number(inv.expected_return || inv.amount),
  }));

  return (
    <div style={pageFade}>
      <MarketTicker />

      <div style={dashboardHeader}>
        <div>
          <h2 style={{ marginBottom: 4 }}>Dashboard</h2>
          <p style={muted}>Track your wallet, investments, and notifications.</p>
        </div>

        <div style={notificationArea}>
          <button
            onClick={() => {
              setNotificationOpen(!notificationOpen);
              if (!notificationOpen) markNotificationsRead();
            }}
            style={bellButton}
          >
            🔔
            {unreadCount > 0 && <span style={badge}>{unreadCount}</span>}
          </button>

          {notificationOpen && (
            <div style={notificationBox}>
              <h4>Notifications</h4>

              {notifications.length === 0 ? (
                <p style={muted}>No notifications yet.</p>
              ) : (
                notifications.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      ...notificationItem,
                      borderLeft:
                        item.type === "SUCCESS"
                          ? "4px solid #16a34a"
                          : item.type === "ERROR"
                          ? "4px solid #dc2626"
                          : "4px solid #2563eb",
                    }}
                  >
                    <strong>{item.title}</strong>
                    <p>{item.message}</p>
                    <small style={muted}>
                      {new Date(item.created_at).toLocaleString()}
                    </small>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      <div style={profileCard}>
        <div style={avatarCircle}>
          {(user.full_name || user.email || "U").charAt(0).toUpperCase()}
        </div>

        <div style={{ flex: 1 }}>
          <h3 style={{ margin: "0 0 6px" }}>{user.full_name}</h3>
          <p style={mutedSmall}>{user.email}</p>

          <div style={profileBadges}>
            <span style={roleBadge}>{user.role}</span>
            <span
              style={{
                ...verifiedBadge,
                background: user.email_verified ? "#16a34a" : "#ca8a04",
              }}
            >
              {user.email_verified ? "Verified Email" : "Email Pending"}
            </span>
          </div>
        </div>

        <div style={profileMeta}>
          <small style={mutedSmall}>Member since</small>
          <strong>
            {user.created_at
              ? new Date(user.created_at).toLocaleDateString()
              : "N/A"}
          </strong>
        </div>
      </div>

      <div style={summaryGrid}>
        <SummaryCard title="Total Balance" value={`$${totalBalance.toFixed(2)}`} />
        <SummaryCard
          title="Active Investment"
          value={`$${totalActiveInvested.toFixed(2)}`}
        />
        <SummaryCard
          title="Current Value"
          value={<AnimatedNumber value={totalCurrentValue} />}
        />
        <SummaryCard title="Total Profit" value={`$${totalProfit.toFixed(2)}`} />
      </div>

      <h3>Live Forex Market Chart</h3>
      <p style={muted}>
        Real-time market chart powered by TradingView. Users can switch symbols
        inside the chart.
      </p>
      <MarketChart />

      <h3>Portfolio Growth</h3>
      {chartData.length === 0 ? (
        <EmptyState
          title="No investment chart yet"
          text="Start an investment to begin tracking portfolio growth."
        />
      ) : (
        <div style={chartBox}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#38bdf8" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
      <KycPanel token={token} user={user} />
      <h3>Your Wallet</h3>
      {data.balances.length === 0 ? (
        <EmptyState
          title="No wallet balance yet"
          text="Create a deposit request and wait for admin approval."
        />
      ) : (
        data.balances.map((b) => (
          <HoverCard key={b.id}>
            <strong>{b.currency}</strong>: {b.available}
          </HoverCard>
        ))
      )}

      <h3>Submit Deposit</h3>

      <div style={card}>
        <h4>Deposit Instructions</h4>

        <p style={muted}>
          Please follow these steps carefully before submitting your deposit
          request.
        </p>

        <ol style={{ color: "#cbd5e1", lineHeight: "1.8" }}>
          <li>Enter the amount you want to deposit.</li>
          <li>Send payment to the company wallet address below.</li>
          <li>Take a screenshot of your payment confirmation.</li>
          <li>Upload the screenshot as proof of payment.</li>
          <li>Submit your deposit request for admin approval.</li>
        </ol>

        <div style={depositInfoBox}>
          <strong>Company Wallet Address</strong>
          <p style={walletText}>BTC: bc1qkqwr63l6x3rqskej75sqxvx74eew9w5smfn4p8
            ETH: 0xd420b9bb7969b6c403e1e774be1d36fdb9c76aa3</p>
        </div>

        <input
          type="number"
          placeholder="Enter deposit amount"
          value={depositAmount}
          onChange={(e) => setDepositAmount(e.target.value)}
          style={input}
        />

        <input
          type="text"
          placeholder="Currency e.g. USD"
          value={depositCurrency}
          onChange={(e) => setDepositCurrency(e.target.value)}
          style={input}
        />

        <label style={uploadLabel}>Upload payment proof screenshot</label>

        <input
          type="file"
          accept="image/*"
          onChange={handleProofChange}
          style={{ marginBottom: "15px", color: "white" }}
        />

        {previewImage && (
          <div style={previewBox}>
            <p style={muted}>Proof Preview:</p>
            <img src={previewImage} alt="Proof preview" style={previewImageStyle} />
          </div>
        )}

        <button onClick={submitDeposit} style={buttonStyle}>
          Submit Deposit for Review
        </button>

        <p style={muted}>
          Your balance will be updated after admin confirms your payment proof.
        </p>
      </div>

      <h3>Deposit History</h3>

      {depositHistory.length === 0 ? (
        <EmptyState
          title="No deposits yet"
          text="Your submitted deposits will appear here."
        />
      ) : (
        depositHistory.map((deposit) => (
          <HoverCard key={deposit.id}>
            <p>
              <strong>Amount:</strong> {deposit.amount} {deposit.currency}
            </p>

            <p>
              <strong>Status:</strong> <StatusBadge status={deposit.status} />
            </p>

            <small style={muted}>
              Submitted: {new Date(deposit.created_at).toLocaleString()}
            </small>
          </HoverCard>
        ))
      )}

      <h3>Withdrawal History</h3>

      {withdrawalHistory.length === 0 ? (
        <EmptyState
          title="No withdrawals yet"
          text="Your withdrawal requests will appear here."
        />
      ) : (
        withdrawalHistory.map((withdrawal) => (
          <HoverCard key={withdrawal.id}>
            <p>
              <strong>Amount:</strong> {withdrawal.amount}{" "}
              {withdrawal.currency}
            </p>

            <p>
              <strong>Status:</strong> <StatusBadge status={withdrawal.status} />
            </p>

            {withdrawal.wallet_address && (
              <p>
                <strong>Wallet:</strong>{" "}
                <span style={walletSmall}>{withdrawal.wallet_address}</span>
              </p>
            )}

            <small style={muted}>
              Submitted: {new Date(withdrawal.created_at).toLocaleString()}
            </small>
          </HoverCard>
        ))
      )}

      <h3>Your Investments</h3>
      {data.investments.length === 0 ? (
        <EmptyState
          title="No investments yet"
          text="Choose a plan and start your first investment."
        />
      ) : (
        data.investments.map((inv) => (
          <HoverCard key={inv.id}>
            <p>
              <strong>{inv.plan_name}</strong>
            </p>
            <p>
              Invested: {inv.amount} {inv.currency}
            </p>
            <p>Status: {inv.status}</p>

            {inv.status === "ACTIVE" && (
              <>
                <p>Progress: {inv.progress || 0}%</p>

                <div style={progressTrack}>
                  <div
                    style={{
                      ...progressFill,
                      width: `${Math.min(Number(inv.progress || 0), 100)}%`,
                    }}
                  />
                </div>

                <p>
                  Current Value:{" "}
                  <AnimatedNumber value={inv.current_value || inv.amount} />
                </p>
              </>
            )}
          </HoverCard>
        ))
      )}

      <h3>Recent Transactions</h3>
      {data.ledger.length === 0 ? (
        <EmptyState
          title="No transactions yet"
          text="Deposits, withdrawals, and investments will appear here."
        />
      ) : (
        data.ledger.slice(0, 8).map((entry) => (
          <HoverCard key={entry.id}>
            <p>
              <strong>{entry.type}</strong>
            </p>
            <p>
              {entry.amount} {entry.currency}
            </p>
            <small>{entry.reason}</small>
          </HoverCard>
        ))
      )}
      
      <h3>Security Settings</h3>

      <div style={card}>
        <h4>Change Password</h4>

        <input
          type="password"
          placeholder="Current Password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          style={input}
        />

        <input
          type="password"
          placeholder="New Password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          style={input}
        />

        <input
          type="password"
          placeholder="Confirm New Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          style={input}
        />

        <button onClick={changePassword} style={buttonStyle}>
          Update Password
        </button>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const cleanStatus = String(status || "PENDING").toUpperCase();

  const background =
    cleanStatus === "APPROVED"
      ? "#16a34a"
      : cleanStatus === "REJECTED"
      ? "#dc2626"
      : "#ca8a04";

  const label =
    cleanStatus === "APPROVED"
      ? "✅ Approved"
      : cleanStatus === "REJECTED"
      ? "❌ Rejected"
      : "⏳ Pending";

  return <span style={{ ...statusBadge, background }}>{label}</span>;
}

function SummaryCard({ title, value }) {
  return (
    <div style={summaryCard}>
      <p style={mutedSmall}>{title}</p>
      <h2
        style={{
          color:
            typeof value === "string" && value.includes("-")
              ? "#ef4444"
              : "#22c55e",
        }}
      >
        {value}
      </h2>
    </div>
  );
}

function EmptyState({ title, text }) {
  return (
    <div style={emptyState}>
      <strong>{title}</strong>
      <p style={muted}>{text}</p>
    </div>
  );
}

function SkeletonDashboard() {
  return (
    <div style={pageFade}>
      <div style={skeletonTitle} />
      <div style={summaryGrid}>
        <div style={skeletonCard} />
        <div style={skeletonCard} />
        <div style={skeletonCard} />
        <div style={skeletonCard} />
      </div>
      <div style={skeletonChart} />
    </div>
  );
}

const pageFade = {
  animation: "fadeIn 0.6s ease",
};

const profileCard = {
  display: "flex",
  alignItems: "center",
  gap: "16px",
  background: "linear-gradient(135deg, rgba(30,41,59,0.9), rgba(2,6,23,0.9))",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: "18px",
  padding: "18px",
  marginBottom: "24px",
  flexWrap: "wrap",
  boxShadow: "0 18px 45px rgba(0,0,0,0.3)",
};

const avatarCircle = {
  width: "58px",
  height: "58px",
  borderRadius: "50%",
  background: "linear-gradient(135deg, #2563eb, #38bdf8)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "24px",
  fontWeight: "bold",
};

const profileBadges = {
  display: "flex",
  gap: "8px",
  flexWrap: "wrap",
  marginTop: "10px",
};

const roleBadge = {
  background: "#2563eb",
  color: "white",
  padding: "5px 10px",
  borderRadius: "999px",
  fontSize: "12px",
  fontWeight: "bold",
};

const verifiedBadge = {
  color: "white",
  padding: "5px 10px",
  borderRadius: "999px",
  fontSize: "12px",
  fontWeight: "bold",
};

const profileMeta = {
  textAlign: "right",
  marginLeft: "auto",
};

const tickerWrap = {
  overflow: "hidden",
  background: "rgba(2,6,23,0.9)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: "14px",
  marginBottom: "20px",
  padding: "12px 0",
};

const tickerTrack = {
  display: "flex",
  gap: "18px",
  width: "max-content",
  animation: "tickerMove 28s linear infinite",
};

const tickerItem = {
  display: "flex",
  gap: "8px",
  alignItems: "center",
  padding: "0 16px",
  whiteSpace: "nowrap",
  color: "#cbd5e1",
};

const dashboardHeader = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: "15px",
  marginBottom: "20px",
  flexWrap: "wrap",
};

const notificationArea = {
  position: "relative",
};

const bellButton = {
  position: "relative",
  background: "rgba(30, 41, 59, 0.75)",
  color: "white",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: "14px",
  padding: "12px 15px",
  cursor: "pointer",
  fontSize: "18px",
  transition: "all 0.25s ease",
  boxShadow: "0 15px 35px rgba(0,0,0,0.25)",
};

const badge = {
  position: "absolute",
  top: "-8px",
  right: "-8px",
  background: "#dc2626",
  color: "white",
  borderRadius: "999px",
  padding: "3px 7px",
  fontSize: "12px",
  animation: "pulse 1.4s infinite",
};

const notificationBox = {
  position: "absolute",
  right: window.innerWidth < 768 ? "50%" : 0,
  transform: window.innerWidth < 768 ? "translateX(50%)" : "none",
  top: "55px",
  width: window.innerWidth < 768 ? "90vw" : "340px",
  maxWidth: "90vw",
  background: "rgba(2, 6, 23, 0.96)",
  backdropFilter: "blur(16px)",
  border: "1px solid #334155",
  borderRadius: "16px",
  padding: "15px",
  zIndex: 20,
  boxShadow: "0 20px 50px rgba(0,0,0,0.45)",
  animation: "fadeIn 0.25s ease",
};

const notificationItem = {
  background: "#1e293b",
  padding: "12px",
  borderRadius: "10px",
  marginBottom: "10px",
};

const summaryGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
  gap: "15px",
  marginBottom: "28px",
};

const summaryCard = {
  background: "linear-gradient(135deg, #1e293b, #020617)",
  padding: "22px",
  borderRadius: "18px",
  border: "1px solid rgba(255,255,255,0.1)",
  boxShadow: "0 15px 40px rgba(0,0,0,0.4)",
  transition: "all 0.3s ease",
};

const marketChartBox = {
  height: "420px",
  background: "#020617",
  borderRadius: "18px",
  overflow: "hidden",
  marginBottom: "28px",
  border: "1px solid rgba(255,255,255,0.1)",
  boxShadow: "0 20px 60px rgba(0,0,0,0.35)",
};

const chartBox = {
  height: "300px",
  background: "rgba(2,6,23,0.75)",
  borderRadius: "18px",
  padding: "15px",
  marginBottom: "28px",
  border: "1px solid rgba(255,255,255,0.08)",
};

const card = {
  background: "rgba(30, 41, 59, 0.65)",
  backdropFilter: "blur(14px)",
  padding: "16px",
  borderRadius: "14px",
  marginBottom: "12px",
  border: "1px solid rgba(255,255,255,0.08)",
  transition: "all 0.3s ease",
};

const input = {
  display: "block",
  width: "100%",
  maxWidth: "360px",
  padding: "12px",
  marginBottom: "12px",
  borderRadius: "10px",
  border: "1px solid #334155",
  background: "#020617",
  color: "white",
  boxSizing: "border-box",
};

const buttonStyle = {
  padding: "12px 16px",
  background: "#2563eb",
  color: "white",
  border: "none",
  borderRadius: "10px",
  cursor: "pointer",
  marginRight: "10px",
  marginBottom: "10px",
};

const depositInfoBox = {
  background: "#020617",
  border: "1px solid #334155",
  padding: "14px",
  borderRadius: "12px",
  marginBottom: "15px",
};

const walletText = {
  color: "#38bdf8",
  wordBreak: "break-all",
  marginTop: "8px",
};

const walletSmall = {
  color: "#38bdf8",
  wordBreak: "break-all",
};

const uploadLabel = {
  display: "block",
  color: "#cbd5e1",
  marginBottom: "8px",
};

const previewBox = {
  marginBottom: "15px",
};

const previewImageStyle = {
  width: "100%",
  maxWidth: "320px",
  maxHeight: "240px",
  objectFit: "cover",
  borderRadius: "12px",
  border: "1px solid #334155",
};

const statusBadge = {
  color: "white",
  padding: "4px 9px",
  borderRadius: "999px",
  fontSize: "12px",
  fontWeight: "bold",
};

const progressTrack = {
  height: "10px",
  background: "#020617",
  borderRadius: "999px",
  overflow: "hidden",
  marginBottom: "10px",
};

const progressFill = {
  height: "100%",
  background: "linear-gradient(90deg, #2563eb, #38bdf8)",
  borderRadius: "999px",
  transition: "width 0.8s ease",
};

const emptyState = {
  background: "rgba(2,6,23,0.6)",
  border: "1px dashed #334155",
  padding: "18px",
  borderRadius: "14px",
  marginBottom: "18px",
};

const skeletonTitle = {
  width: "220px",
  height: "28px",
  background: "#1e293b",
  borderRadius: "10px",
  marginBottom: "20px",
  animation: "shimmer 1.4s infinite",
};

const skeletonCard = {
  height: "100px",
  background: "#1e293b",
  borderRadius: "16px",
  animation: "shimmer 1.4s infinite",
};

const skeletonChart = {
  height: "320px",
  background: "#1e293b",
  borderRadius: "18px",
  marginTop: "20px",
  animation: "shimmer 1.4s infinite",
};

const muted = {
  color: "#94a3b8",
};

const mutedSmall = {
  color: "#94a3b8",
  fontSize: "14px",
};

export default DashboardPreview;