import { useEffect, useState } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

function AdminPanel({ token }) {
  const [analytics, setAnalytics] = useState(null);
  const [deposits, setDeposits] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);

  useEffect(() => {
    loadData();
  }, [token]);

  async function loadData() {
    try {
      const analyticsRes = await axios.get(`${API_URL}/api/admin/analytics`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const pendingRes = await axios.get(`${API_URL}/api/admin/pending`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setAnalytics(analyticsRes.data);
      setDeposits(pendingRes.data.deposits || []);
      setWithdrawals(pendingRes.data.withdrawals || []);
    } catch (error) {
      console.error("Admin load error", error);
    }
  }

  async function approveDeposit(id) {
    await axios.post(
      `${API_URL}/api/admin/deposits/${id}/approve`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    loadData();
  }

  async function rejectDeposit(id) {
    await axios.post(
      `${API_URL}/api/admin/deposits/${id}/reject`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    loadData();
  }

  async function approveWithdrawal(id) {
    await axios.post(
      `${API_URL}/api/admin/withdrawals/${id}/approve`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    loadData();
  }

  async function rejectWithdrawal(id) {
    await axios.post(
      `${API_URL}/api/admin/withdrawals/${id}/reject`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    loadData();
  }

  return (
    <div>
      <h2>Admin Dashboard</h2>

      {/* 🔥 ANALYTICS */}
      {analytics && (
        <div style={grid}>
          <Card title="Total Deposits" value={analytics.totalDeposits} />
          <Card title="Total Withdrawals" value={analytics.totalWithdrawals} />
          <Card title="Platform Profit" value={analytics.platformProfit} />
          <Card title="Active Investments" value={analytics.activeInvestments} />
          <Card
            title="Completed Investments"
            value={analytics.completedInvestments}
          />
        </div>
      )}

      <h3>Pending Deposits</h3>

      {deposits.map((d) => (
        <div key={d.id} style={card}>
          <p>{d.full_name} — {d.amount}</p>

          <button onClick={() => approveDeposit(d.id)}>Approve</button>
          <button onClick={() => rejectDeposit(d.id)}>Reject</button>
        </div>
      ))}

      <h3>Pending Withdrawals</h3>

      {withdrawals.map((w) => (
        <div key={w.id} style={card}>
          <p>{w.full_name} — {w.amount}</p>

          <button onClick={() => approveWithdrawal(w.id)}>Approve</button>
          <button onClick={() => rejectWithdrawal(w.id)}>Reject</button>
        </div>
      ))}
    </div>
  );
}

function Card({ title, value }) {
  return (
    <div style={cardStat}>
      <p>{title}</p>
      <h2>{value}</h2>
    </div>
  );
}

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
  gap: "15px",
  marginBottom: "25px",
};

const cardStat = {
  background: "#1e293b",
  padding: "20px",
  borderRadius: "12px",
};

const card = {
  background: "#1e293b",
  padding: "15px",
  marginBottom: "10px",
  borderRadius: "10px",
};

export default AdminPanel;