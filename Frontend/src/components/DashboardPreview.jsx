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

  useEffect(() => {
    loadDashboard();

    const interval = setInterval(() => {
      loadDashboard();
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

  if (!data) return <p>Loading dashboard...</p>;

  const chartData = data.investments.map((inv) => ({
    name: inv.plan_name || "Investment",
    value:
      inv.status === "ACTIVE"
        ? Number(inv.current_value || inv.amount)
        : Number(inv.expected_return || inv.amount),
  }));

  return (
    <div>
      <h2>Dashboard</h2>

      <h3>Live Forex Market Chart</h3>
      <p style={muted}>
        Real-time market chart powered by TradingView. Users can switch symbols
        inside the chart.
      </p>
      <MarketChart />

      <h3>Portfolio Growth</h3>
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

      <h3>Your Wallet</h3>
      {data.balances.length === 0 ? (
        <p>No balances yet</p>
      ) : (
        data.balances.map((b) => (
          <div key={b.id} style={card}>
            <strong>{b.currency}</strong>: {b.available}
          </div>
        ))
      )}

      <h3>Your Investments</h3>
      {data.investments.length === 0 ? (
        <p>No investments yet</p>
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
        <p>No transactions yet</p>
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

const muted = {
  color: "#94a3b8",
};

export default DashboardPreview;