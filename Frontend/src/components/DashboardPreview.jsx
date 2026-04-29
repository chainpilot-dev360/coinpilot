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

  useEffect(() => {
    loadDashboard();
    loadNotifications();

    const interval = setInterval(() => {
      loadDashboard();
      loadNotifications();
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

  async function submitDeposit() {
  if (!depositAmount || !depositCurrency) {
    alert("Enter amount and currency");
    return;
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

    alert("Deposit submitted");
    setDepositAmount("");
    setDepositFile(null);
    loadDashboard();
  } catch (error) {
    alert(error.response?.data?.message || "Deposit failed");
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
            onMouseEnter={(e) =>
              (e.currentTarget.style.transform = "scale(1.08)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.transform = "scale(1)")
            }
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
  <input
    type="number"
    placeholder="Amount"
    value={depositAmount}
    onChange={(e) => setDepositAmount(e.target.value)}
    style={inputStyle}
  />

  <input
    type="text"
    placeholder="Currency (e.g. USD)"
    value={depositCurrency}
    onChange={(e) => setDepositCurrency(e.target.value)}
    style={inputStyle}
  />

  <input
    type="file"
    onChange={(e) => setDepositFile(e.target.files[0])}
    style={{ marginBottom: "10px" }}
  />

  <button onClick={submitDeposit} style={buttonStyle}>
    Submit Deposit
  </button>
</div>

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
    </div>
  );
}

function SummaryCard({ title, value }) {
  return (
    <div
      style={summaryCard}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-6px)";
        e.currentTarget.style.boxShadow = "0 25px 60px rgba(37,99,235,0.25)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 15px 40px rgba(0,0,0,0.4)";
      }}
    >
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
  right: 0,
  top: "55px",
  width: "340px",
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