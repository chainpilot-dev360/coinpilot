import { useEffect, useState } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

function DashboardPreview({ token, user }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    loadDashboard();
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

  return (
    <div>
      <h2>Dashboard</h2>

      {/* BALANCES */}
      <h3>Your Wallet</h3>
      {data.balances.length === 0 ? (
        <p>No balances yet</p>
      ) : (
        data.balances.map((b) => (
          <div key={b.id} style={card}>
            {b.currency}: {b.available}
          </div>
        ))
      )}

      {/* INVESTMENTS */}
      <h3>Your Investments</h3>
      {data.investments.length === 0 ? (
        <p>No investments yet</p>
      ) : (
        data.investments.map((inv) => (
          <div key={inv.id} style={card}>
            <p>{inv.plan_name}</p>
            <p>
              {inv.amount} {inv.currency}
            </p>
            <p>Status: {inv.status}</p>
          </div>
        ))
      )}

      {/* LEDGER */}
      <h3>Recent Transactions</h3>
      {data.ledger.length === 0 ? (
        <p>No transactions yet</p>
      ) : (
        data.ledger.slice(0, 10).map((entry) => (
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

const card = {
  background: "#1e293b",
  padding: "15px",
  borderRadius: "10px",
  marginBottom: "10px",
};

export default DashboardPreview;