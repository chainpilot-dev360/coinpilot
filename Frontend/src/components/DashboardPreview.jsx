import { useEffect, useState } from "react";
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
      const res = await axios.get(
        `${API_URL}/api/users/${user.id}/balances`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setData(res.data);
    } catch (error) {
      console.error("Dashboard load error", error);
    }
  }

  if (!data) return <p>Loading dashboard...</p>;

  const chartData = data.investments.map((inv) => ({
    name: inv.plan_name,
    value:
      inv.status === "ACTIVE"
        ? Number(inv.current_value || inv.amount)
        : Number(inv.expected_return),
  }));

  return (
    <div>
      <h2>Dashboard</h2>

      {/* CHART */}
      <h3>Portfolio Growth</h3>
      <div style={{ height: 300 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="value" stroke="#2563eb" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* BALANCES */}
      <h3>Your Wallet</h3>
      {data.balances.map((b) => (
        <div key={b.id} style={card}>
          {b.currency}: {b.available}
        </div>
      ))}

      {/* INVESTMENTS */}
      <h3>Your Investments</h3>
      {data.investments.map((inv) => (
        <div key={inv.id} style={card}>
          <p><strong>{inv.plan_name}</strong></p>
          <p>Invested: {inv.amount}</p>
          <p>Status: {inv.status}</p>

          {inv.status === "ACTIVE" && (
            <>
              <p>Progress: {inv.progress}%</p>
              <p>Current Value: <AnimatedNumber value={inv.current_value} /></p>
            </>
          )}
        </div>
      ))}

      {/* LEDGER */}
      <h3>Recent Transactions</h3>
      {data.ledger.slice(0, 5).map((entry) => (
        <div key={entry.id} style={card}>
          <p>{entry.type}</p>
          <p>{entry.amount}</p>
        </div>
      ))}
    </div>
  );
}

const card = {
  background: "#1e293b",
  padding: "15px",
  borderRadius: "10px",
  marginBottom: "10px",
};

export default DashboardPreview;