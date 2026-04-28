import { useEffect, useState } from "react";
import axios from "axios";

function AdminPanel({ token }) {
  const [deposits, setDeposits] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [message, setMessage] = useState("Loading admin data...");

  useEffect(() => {
    loadData();
  }, [token]);

  async function loadData() {
    try {
      setMessage("Loading pending requests...");

      const res = await axios.get("http://127.0.0.1:5000/api/admin/pending", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setDeposits(res.data.deposits || []);
      setWithdrawals(res.data.withdrawals || []);
      setMessage("");
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to load admin data");
    }
  }

  async function approveDeposit(id) {
    try {
      await axios.post(
        `http://127.0.0.1:5000/api/admin/deposits/${id}/approve`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Deposit approved");
      loadData();
    } catch (error) {
      alert(error.response?.data?.message || "Error approving deposit");
    }
  }

  async function approveWithdrawal(id) {
    try {
      await axios.post(
        `http://127.0.0.1:5000/api/admin/withdrawals/${id}/approve`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Withdrawal approved");
      loadData();
    } catch (error) {
      alert(error.response?.data?.message || "Error approving withdrawal");
    }
  }

  return (
    <div>
      <h2>Admin Panel</h2>

      <button onClick={loadData} style={buttonStyle}>
        Refresh Pending Requests
      </button>

      {message && <p>{message}</p>}

      <h3>Pending Deposits</h3>

      {deposits.length === 0 ? (
        <p>No pending deposits</p>
      ) : (
        deposits.map((deposit) => (
          <div key={deposit.id} style={cardStyle}>
            <p>
              <strong>User:</strong> {deposit.full_name} ({deposit.email})
            </p>
            <p>
              <strong>Amount:</strong> {deposit.amount} {deposit.currency}
            </p>
            <p>
              <strong>Status:</strong> {deposit.status}
            </p>

            <button
              onClick={() => approveDeposit(deposit.id)}
              style={approveButton}
            >
              Approve Deposit
            </button>
          </div>
        ))
      )}

      <h3>Pending Withdrawals</h3>

      {withdrawals.length === 0 ? (
        <p>No pending withdrawals</p>
      ) : (
        withdrawals.map((withdrawal) => (
          <div key={withdrawal.id} style={cardStyle}>
            <p>
              <strong>User:</strong> {withdrawal.full_name} ({withdrawal.email})
            </p>
            <p>
              <strong>Amount:</strong> {withdrawal.amount} {withdrawal.currency}
            </p>
            <p>
              <strong>Wallet:</strong> {withdrawal.wallet_address}
            </p>
            <p>
              <strong>Status:</strong> {withdrawal.status}
            </p>

            <button
              onClick={() => approveWithdrawal(withdrawal.id)}
              style={dangerButton}
            >
              Approve Withdrawal
            </button>
          </div>
        ))
      )}
    </div>
  );
}

const cardStyle = {
  background: "#1e293b",
  padding: "16px",
  borderRadius: "12px",
  marginBottom: "12px",
};

const buttonStyle = {
  padding: "10px 14px",
  background: "#2563eb",
  color: "white",
  border: "none",
  borderRadius: "8px",
  marginBottom: "20px",
  cursor: "pointer",
};

const approveButton = {
  padding: "10px 14px",
  background: "#16a34a",
  color: "white",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
};

const dangerButton = {
  padding: "10px 14px",
  background: "#dc2626",
  color: "white",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
};

export default AdminPanel;