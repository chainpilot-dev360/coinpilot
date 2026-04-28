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

  if (!data) return <p>Loading dashboard...</p>;

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
    <div>
      <div style={dashboardHeader}>
        <div>
          <h2>Dashboard</h2>
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
          <div key={b.id} style={card}>
            <strong>{b.currency}</strong>: {b.available}
          </div>
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
          <div key={inv.id} style={card}>
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
          </div>
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
          <div key={entry.id} style={card}>
            <p>
              <strong>{entry.type}</strong>
            </p>
            <p>
              {entry.amount} {entry.currency}
            </p>
            <small>{entry.reason}</small>
          </div>
        ))
      )}
    </div>
  );
}

function SummaryCard({ title, value }) {
  return (
    <div style={summaryCard}>
      <p style={mutedSmall}>{title}</p>
      <h2>{value}</h2>
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
  background: "#1e293b",
  color: "white",
  border: "1px solid #334155",
  borderRadius: "12px",
  padding: "12px 15px",
  cursor: "pointer",
  fontSize: "18px",
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
};

const notificationBox = {
  position: "absolute",
  right: 0,
  top: "55px",
  width: "340px",
  maxWidth: "90vw",
  background: "#020617",
  border: "1px solid #334155",
  borderRadius: "16px",
  padding: "15px",
  zIndex: 20,
  boxShadow: "0 20px 50px rgba(0,0,0,0.45)",
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
  background: "linear-gradient(180deg, #1e293b, #0f172a)",
  padding: "20px",
  borderRadius: "16px",
  border: "1px solid #334155",
};

const marketChartBox = {
  height: "420px",
  background: "#020617",
  borderRadius: "16px",
  overflow: "hidden",
  marginBottom: "28px",
  border: "1px solid #334155",
};

const chartBox = {
  height: "300px",
  background: "#020617",
  borderRadius: "16px",
  padding: "15px",
  marginBottom: "28px",
};

const card = {
  background: "#1e293b",
  padding: "15px",
  borderRadius: "10px",
  marginBottom: "10px",
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
  background: "#38bdf8",
  borderRadius: "999px",
};

const emptyState = {
  background: "#020617",
  border: "1px dashed #334155",
  padding: "18px",
  borderRadius: "12px",
  marginBottom: "18px",
};

const muted = {
  color: "#94a3b8",
};

const mutedSmall = {
  color: "#94a3b8",
  fontSize: "14px",
};

export default DashboardPreview;