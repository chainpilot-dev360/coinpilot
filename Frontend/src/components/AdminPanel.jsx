import { useEffect, useState } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

function AdminPanel({ token }) {
  const [analytics, setAnalytics] = useState(null);
  const [deposits, setDeposits] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUserData, setSelectedUserData] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState(null);

  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("Loading admin data...");

  const [balanceAmount, setBalanceAmount] = useState("");
  const [balanceReason, setBalanceReason] = useState("");

  useEffect(() => {
    loadData();
  }, [token]);

  async function loadData() {
    try {
      setMessage("Loading admin data...");

      const analyticsRes = await axios.get(`${API_URL}/api/admin/analytics`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const pendingRes = await axios.get(`${API_URL}/api/admin/pending`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const usersRes = await axios.get(`${API_URL}/api/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setAnalytics(analyticsRes.data);
      setDeposits(pendingRes.data.deposits || []);
      setWithdrawals(pendingRes.data.withdrawals || []);
      setUsers(usersRes.data || []);
      setMessage("");
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to load admin data");
    }
  }

  async function viewUser(userId) {
    try {
      const res = await axios.get(`${API_URL}/api/users/${userId}/balances`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setSelectedUserId(userId);
      setSelectedUserData({
        userId,
        balances: res.data.balances || [],
        ledger: res.data.ledger || [],
        investments: res.data.investments || [],
      });
    } catch (error) {
      alert(error.response?.data?.message || "Failed to load user data");
    }
  }

  async function deleteUser(userId) {
    const confirmDelete = confirm(
      "Are you sure you want to permanently delete this user account?"
    );

    if (!confirmDelete) return;

    try {
      await axios.delete(`${API_URL}/api/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert("User deleted successfully");

      if (selectedUserId === userId) {
        setSelectedUserId(null);
        setSelectedUserData(null);
      }

      loadData();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to delete user");
    }
  }

  async function adjustBalance() {
    if (!selectedUserId) {
      alert("Select a user first");
      return;
    }

    if (!balanceAmount) {
      alert("Enter amount");
      return;
    }

    try {
      await axios.post(
        `${API_URL}/api/admin/adjust-balance`,
        {
          userId: selectedUserId,
          currency: "USD",
          amount: Number(balanceAmount),
          reason: balanceReason || "Manual admin balance adjustment",
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("Balance updated");
      setBalanceAmount("");
      setBalanceReason("");
      viewUser(selectedUserId);
      loadData();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to update balance");
    }
  }

  async function stopInvestment(investmentId) {
    const confirmStop = confirm(
      "Are you sure you want to stop this investment and return the principal?"
    );

    if (!confirmStop) return;

    try {
      await axios.post(
        `${API_URL}/api/admin/investments/${investmentId}/stop`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("Investment stopped");
      viewUser(selectedUserId);
      loadData();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to stop investment");
    }
  }

  async function approveDeposit(id) {
    try {
      await axios.post(
        `${API_URL}/api/admin/deposits/${id}/approve`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("Deposit approved");
      loadData();
    } catch (error) {
      alert(error.response?.data?.message || "Error approving deposit");
    }
  }

  async function rejectDeposit(id) {
    try {
      await axios.post(
        `${API_URL}/api/admin/deposits/${id}/reject`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("Deposit rejected");
      loadData();
    } catch (error) {
      alert(error.response?.data?.message || "Error rejecting deposit");
    }
  }

  async function approveWithdrawal(id) {
    try {
      await axios.post(
        `${API_URL}/api/admin/withdrawals/${id}/approve`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("Withdrawal approved");
      loadData();
    } catch (error) {
      alert(error.response?.data?.message || "Error approving withdrawal");
    }
  }

  async function rejectWithdrawal(id) {
    try {
      await axios.post(
        `${API_URL}/api/admin/withdrawals/${id}/reject`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("Withdrawal rejected");
      loadData();
    } catch (error) {
      alert(error.response?.data?.message || "Error rejecting withdrawal");
    }
  }

  function getProofUrl(proofUrl) {
    if (!proofUrl) return null;

    if (proofUrl.startsWith("http")) {
      return proofUrl;
    }

    return `${API_URL}${proofUrl}`;
  }

  const filteredUsers = users.filter((user) => {
    const name = user.full_name || "";
    const email = user.email || "";

    return (
      name.toLowerCase().includes(search.toLowerCase()) ||
      email.toLowerCase().includes(search.toLowerCase()) ||
      String(user.id).includes(search)
    );
  });

  const selectedUser = users.find((u) => u.id === selectedUserId);

  return (
    <div>
      <h2>Admin Control Center</h2>

      <button onClick={loadData} style={buttonStyle}>
        Refresh Admin Data
      </button>

      {message && <p>{message}</p>}

      {analytics && (
        <div style={grid}>
          <Stat title="Total Deposits" value={analytics.totalDeposits} />
          <Stat title="Total Withdrawals" value={analytics.totalWithdrawals} />
          <Stat title="Platform Profit" value={analytics.platformProfit} />
          <Stat title="Active Investments" value={analytics.activeInvestments} />
          <Stat
            title="Completed Investments"
            value={analytics.completedInvestments}
          />
        </div>
      )}

      <h3>All Users</h3>

      <input
        placeholder="Search by name, email, or ID"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={inputStyle}
      />

      {filteredUsers.length === 0 ? (
        <p>No users found</p>
      ) : (
        filteredUsers.map((user) => (
          <div key={user.id} style={cardStyle}>
            <p>
              <strong>ID:</strong> {user.id}
            </p>
            <p>
              <strong>Name:</strong> {user.full_name}
            </p>
            <p>
              <strong>Email:</strong> {user.email}
            </p>
            <p>
              <strong>Password:</strong> Protected / Not visible for security
            </p>
            <p>
              <strong>Role:</strong> {user.role}
            </p>

            <button onClick={() => viewUser(user.id)} style={buttonStyle}>
              View / Manage User
            </button>

            <button onClick={() => deleteUser(user.id)} style={dangerButton}>
              Delete User
            </button>
          </div>
        ))
      )}

      {selectedUserData && (
        <div style={sectionStyle}>
          <h3>
            Managing User — ID {selectedUserData.userId}
            {selectedUser ? ` (${selectedUser.email})` : ""}
          </h3>

          <h4>Manual Balance Adjustment</h4>
          <p style={muted}>
            Use positive amount to add balance. Use negative amount to subtract.
          </p>

          <input
            placeholder="Amount e.g. 500 or -100"
            value={balanceAmount}
            onChange={(e) => setBalanceAmount(e.target.value)}
            style={inputStyle}
          />

          <input
            placeholder="Reason e.g. Admin correction"
            value={balanceReason}
            onChange={(e) => setBalanceReason(e.target.value)}
            style={inputStyle}
          />

          <button onClick={adjustBalance} style={approveButton}>
            Update User Balance
          </button>

          <h4>Balances</h4>
          {selectedUserData.balances.length === 0 ? (
            <p>No balances</p>
          ) : (
            selectedUserData.balances.map((balance) => (
              <div key={balance.id} style={miniCard}>
                {balance.currency}: {balance.available}
              </div>
            ))
          )}

          <h4>Investments</h4>
          {selectedUserData.investments.length === 0 ? (
            <p>No investments</p>
          ) : (
            selectedUserData.investments.map((investment) => (
              <div key={investment.id} style={miniCard}>
                <p>
                  <strong>{investment.plan_name}</strong>
                </p>
                <p>
                  Amount: {investment.amount} {investment.currency}
                </p>
                <p>Expected Return: {investment.expected_return}</p>
                <p>Status: {investment.status}</p>

                {investment.status === "ACTIVE" && (
                  <button
                    onClick={() => stopInvestment(investment.id)}
                    style={dangerButton}
                  >
                    Stop Investment
                  </button>
                )}
              </div>
            ))
          )}

          <h4>Recent Ledger</h4>
          {selectedUserData.ledger.length === 0 ? (
            <p>No ledger entries</p>
          ) : (
            selectedUserData.ledger.slice(0, 10).map((entry) => (
              <div key={entry.id} style={miniCard}>
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
      )}

      <h3>Pending Deposits</h3>

      {deposits.length === 0 ? (
        <p>No pending deposits</p>
      ) : (
        deposits.map((deposit) => {
          const proofLink = getProofUrl(deposit.proof_url);

          return (
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

              <div style={proofBox}>
                <p>
                  <strong>Payment Proof:</strong>
                </p>

                {proofLink ? (
                  <>
                    <a
                      href={proofLink}
                      target="_blank"
                      rel="noreferrer"
                      style={proofLinkStyle}
                    >
                      Open Proof in New Tab
                    </a>

                    <img
                      src={proofLink}
                      alt="Deposit proof"
                      style={proofImage}
                    />
                  </>
                ) : (
                  <p style={muted}>No proof uploaded</p>
                )}
              </div>

              <button
                onClick={() => approveDeposit(deposit.id)}
                style={approveButton}
              >
                Approve Deposit
              </button>

              <button
                onClick={() => rejectDeposit(deposit.id)}
                style={dangerButton}
              >
                Reject Deposit
              </button>
            </div>
          );
        })
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
              <strong>Amount:</strong> {withdrawal.amount}{" "}
              {withdrawal.currency}
            </p>
            <p>
              <strong>Wallet:</strong> {withdrawal.wallet_address}
            </p>
            <p>
              <strong>Status:</strong> {withdrawal.status}
            </p>

            <button
              onClick={() => approveWithdrawal(withdrawal.id)}
              style={approveButton}
            >
              Approve Withdrawal
            </button>

            <button
              onClick={() => rejectWithdrawal(withdrawal.id)}
              style={dangerButton}
            >
              Reject Withdrawal
            </button>
          </div>
        ))
      )}
    </div>
  );
}

function Stat({ title, value }) {
  return (
    <div style={statCard}>
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

const statCard = {
  background: "#1e293b",
  padding: "20px",
  borderRadius: "12px",
};

const cardStyle = {
  background: "#1e293b",
  padding: "16px",
  borderRadius: "12px",
  marginBottom: "12px",
};

const sectionStyle = {
  background: "#020617",
  padding: "20px",
  borderRadius: "12px",
  marginBottom: "25px",
};

const miniCard = {
  background: "#1e293b",
  padding: "12px",
  borderRadius: "10px",
  marginBottom: "10px",
};

const proofBox = {
  background: "#020617",
  padding: "12px",
  borderRadius: "10px",
  marginBottom: "12px",
  border: "1px solid #334155",
};

const proofLinkStyle = {
  display: "inline-block",
  color: "#38bdf8",
  marginBottom: "10px",
  textDecoration: "none",
};

const proofImage = {
  display: "block",
  width: "100%",
  maxWidth: "320px",
  maxHeight: "220px",
  objectFit: "cover",
  borderRadius: "10px",
  border: "1px solid #334155",
};

const inputStyle = {
  padding: "12px",
  width: "100%",
  maxWidth: "400px",
  marginBottom: "15px",
  borderRadius: "10px",
  border: "1px solid #334155",
  background: "#020617",
  color: "white",
};

const buttonStyle = {
  padding: "10px 14px",
  background: "#2563eb",
  color: "white",
  border: "none",
  borderRadius: "8px",
  marginBottom: "10px",
  marginRight: "10px",
  cursor: "pointer",
};

const approveButton = {
  padding: "10px 14px",
  background: "#16a34a",
  color: "white",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
  marginRight: "10px",
  marginBottom: "10px",
};

const dangerButton = {
  padding: "10px 14px",
  background: "#dc2626",
  color: "white",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
  marginRight: "10px",
  marginBottom: "10px",
};

const muted = {
  color: "#94a3b8",
};

export default AdminPanel;