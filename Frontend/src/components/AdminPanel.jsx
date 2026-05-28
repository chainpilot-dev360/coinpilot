import { useEffect, useState } from "react";
import axios from "axios";
import SystemSettings from "./SystemSettings";

const API_URL = import.meta.env.VITE_API_URL;
const COMPANY_LOGO =
  "https://res.cloudinary.com/dlvtuijb1/image/upload/v1779874195/WhatsApp_Image_2026-05-27_at_10.29.15_AM_llqpmg.jpg";

function AdminPanel() {
  const token = localStorage.getItem("token");
  
  const [analytics, setAnalytics] = useState(null);
  const [deposits, setDeposits] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);

  const [depositSearch, setDepositSearch] = useState("");
  const [depositStatusFilter, setDepositStatusFilter] = useState("ALL");
  
  const [withdrawalSearch, setWithdrawalSearch] = useState("");
  const [withdrawalStatusFilter, setWithdrawalStatusFilter] = useState("ALL");

  const [depositLimit, setDepositLimit] = useState(10);
  const [withdrawalLimit, setWithdrawalLimit] = useState(10);
  
  const [users, setUsers] = useState([]);
  const [adminLogs, setAdminLogs] = useState([]);
  const [adminLogLimit, setAdminLogLimit] = useState(10);

  const [selectedUserData, setSelectedUserData] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState(null);

  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("Loading admin data...");

  const [balanceAmount, setBalanceAmount] = useState("");
  const [balanceReason, setBalanceReason] = useState("");

  const [inputs, setInputs] = useState({});
  const [stats, setStats] = useState(null);

  const [kycList, setKycList] = useState([]);

  useEffect(() => {
  loadData();
  loadStats();
  loadKyc();

  const interval = setInterval(() => {
    loadData();
    loadStats();
    loadKyc();
  }, 30000);

  return () => clearInterval(interval);
}, [token]);

async function loadStats() {
  try {
    const res = await axios.get(`${API_URL}/api/admin/stats`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    setStats(res.data);
  } catch (error) {
    console.error("Failed to load stats", error);
  }
}

  function exportDepositsCSV() {
  if (!deposits || deposits.length === 0) {
    alert("No deposits to export");
    return;
  }

  const headers = [
    "ID",
    "User",
    "Email",
    "Amount",
    "Currency",
    "Status",
    "Receipt Reference",
    "Created At",
  ];

  const rows = deposits.map((deposit) => [
    deposit.id,
    deposit.full_name || "",
    deposit.email || "",
    deposit.amount || "",
    deposit.currency || "",
    deposit.status || "",
    deposit.receipt_reference || "",
    deposit.created_at || "",
  ]);

  const csvContent =
    [headers, ...rows]
      .map((row) =>
        row
          .map((value) => `"${String(value).replace(/"/g, '""')}"`)
          .join(",")
      )
      .join("\n");

  const blob = new Blob([csvContent], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = "deposits-report.csv";
  link.click();

  URL.revokeObjectURL(url);
}

  function exportWithdrawalsCSV() {
  if (!withdrawals || withdrawals.length === 0) {
    alert("No withdrawals to export");
    return;
  }

  const headers = [
    "ID",
    "User",
    "Email",
    "Amount",
    "Currency",
    "Status",
    "Wallet Address",
    "Reference",
    "Receipt Reference",
    "Created At",
  ];

  const rows = withdrawals.map((withdrawal) => [
    withdrawal.id,
    withdrawal.full_name || "",
    withdrawal.email || "",
    withdrawal.amount || "",
    withdrawal.currency || "",
    withdrawal.status || "",
    withdrawal.wallet_address || "",
    withdrawal.reference || "",
    withdrawal.receipt_reference || "",
    withdrawal.created_at || "",
  ]);

  const csvContent =
    [headers, ...rows]
      .map((row) =>
        row
          .map((value) => `"${String(value).replace(/"/g, '""')}"`)
          .join(",")
      )
      .join("\n");

  const blob = new Blob([csvContent], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = "withdrawals-report.csv";
  link.click();

  URL.revokeObjectURL(url);
}

  function exportUsersCSV() {
  if (!users || users.length === 0) {
    alert("No users to export");
    return;
  }

  const headers = [
    "ID",
    "Full Name",
    "Email",
    "Country",
    "Currency",
    "Referral Code",
    "Role",
    "KYC Status",
    "Created At",
  ];

  const rows = users.map((user) => [
    user.id,
    user.full_name || "",
    user.email || "",
    user.country || "",
    user.account_currency || "",
    user.referral_code || "",
    user.role || "",
    user.kyc_status || "",
    user.created_at || "",
  ]);

  const csvContent =
    [headers, ...rows]
      .map((row) =>
        row
          .map((value) => `"${String(value).replace(/"/g, '""')}"`)
          .join(",")
      )
      .join("\n");

  const blob = new Blob([csvContent], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = "users-report.csv";
  link.click();

  URL.revokeObjectURL(url);
}
  
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

      const logsRes = await axios.get(`${API_URL}/api/admin/logs`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setAnalytics(analyticsRes.data);
      setDeposits(pendingRes.data.deposits || []);
      setWithdrawals(pendingRes.data.withdrawals || []);
      setUsers(usersRes.data || []);
      setAdminLogs(logsRes.data || []);
      setMessage("");
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to load admin data");
    }
  }

  function getProofUrl(proofUrl) {
    if (!proofUrl) return null;
    if (proofUrl.startsWith("http")) return proofUrl;
    return `${API_URL}${proofUrl}`;
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
    if (!confirm("Are you sure you want to permanently delete this user?")) return;

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

 async function toggleFreeze(userId, freeze) {
  try {
    await axios.put(
      `${API_URL}/api/admin/users/${userId}/freeze`,
      {
        is_frozen: freeze,
        freeze_reason: freeze ? "Access to this account has been temporarily restricted. Please contact support for further assistance." : null,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    alert(freeze ? "Account frozen successfully" : "Account unfrozen successfully");

    loadData();
  } catch (error) {
    console.error(error);
    alert("Failed to update freeze status");
  }
}

  async function toggleWithdrawals(userId, disabled) {
  try {
    await axios.put(
      `${API_URL}/api/admin/users/${userId}/withdrawals`,
      {
        withdrawals_disabled: disabled,
        withdrawal_disable_reason: disabled
          ? "Withdrawals on this account have been temporarily restricted. Please contact support for assistance."
          : null,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    alert(
      disabled
        ? "Withdrawals disabled successfully"
        : "Withdrawals enabled successfully"
    );

    loadData();
  } catch (error) {
    console.error(error);

    alert(
      error.response?.data?.message ||
      "Failed to update withdrawal restriction"
    );
  }
}

  async function toggleDeposits(userId, disabled) {
  try {
    await axios.put(
      `${API_URL}/api/admin/users/${userId}/deposits`,
      {
        deposits_disabled: disabled,
        deposit_disable_reason: disabled
          ? "Deposits on this account have been temporarily restricted. Please contact support for assistance."
          : null,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    alert(
      disabled
        ? "Deposits disabled successfully"
        : "Deposits enabled successfully"
    );

    loadData();
  } catch (error) {
    console.error(error);

    alert(
      error.response?.data?.message ||
      "Failed to update deposit restriction"
    );
  }
}

  async function saveAdminNote(userId, note) {
  try {
    await axios.put(
      `${API_URL}/api/admin/users/${userId}/notes`,
      {
        admin_notes: note,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  } catch (error) {
    console.error(error);

    alert(
      error.response?.data?.message ||
      "Failed to save admin note"
    );
  }
}

  async function stopInvestment(investmentId) {
  if (!confirm("Are you sure you want to stop this investment?")) return;

  try {
    await axios.put(
      `${API_URL}/api/admin/investments/${investmentId}/stop`,
      {
        is_stopped: true,
        stop_reason: "Stopped by administrator",
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    alert("Investment stopped successfully");

    loadData();
  } catch (error) {
    alert(
      error.response?.data?.message ||
      "Failed to stop investment"
    );
  }
}
  
  async function adjustBalance() {
    if (!selectedUserId) return alert("Select a user first");
    if (!balanceAmount) return alert("Enter amount");

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
    if (!confirm("Stop this investment and return the principal?")) return;

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
      console.error("Reject deposit error:", error);

      if (error.response?.status === 500) {
        alert("Deposit rejected successfully");
        loadData();
        return;
      }

      alert(error.response?.data?.message || "Error rejecting deposit");
    }
  }

  async function approveWithdrawal(id) {
  try {
    await axios.post(
      `${API_URL}/api/admin/withdrawals/${id}/approve`,
      {
        reference: inputs[id]?.reference,
        admin_note: inputs[id]?.adminNote,
      },
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

  async function loadKyc() {
  try {
    const res = await axios.get(`${API_URL}/api/admin/kyc`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setKycList(res.data);
  } catch {
    alert("Failed to load KYC");
  }
}

async function updateKyc(id, status) {
  try {
    await axios.post(
      `${API_URL}/api/admin/kyc/update`,
      { id, status },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    alert("KYC updated");
    loadKyc();
  } catch {
    alert("Failed to update KYC");
  }
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

      <img
        src={COMPANY_LOGO}
        alt="CoinPilot Logo"
        style={{
          width: "120px",
          height: "120px",
          borderRadius: "20px",
          display: "block",
          margin: "0 auto 20px",
          objectFit: "cover",
          boxShadow: "0 4px 15px rgba(0,0,0,0.3)"
        }}
      />
      
      <h2>Admin Control Center</h2>
      
      <SystemSettings token={token} />

      <button onClick={loadData} style={buttonStyle}>
        Refresh Admin Data
      </button>

      {message && <p>{message}</p>}

      {stats && (
        <div style={statsGrid}>
          <div style={statsCard}>
            <h4>Total Users</h4>
            <h2>{stats.totalUsers}</h2>
          </div>

          <div style={statsCard}>
            <h4>Total Deposits</h4>
            <h2>${stats.totalDeposits.toFixed(2)}</h2>
          </div>

         <div style={statsCard}>
           <h4>Total Withdrawals</h4>
           <h2>${stats.totalWithdrawals.toFixed(2)}</h2>
         </div>

         <div style={statsCard}>
           <h4>Pending Deposits</h4>
           <h2>{stats.pendingDeposits}</h2>
         </div>

         <div style={statsCard}>
           <h4>Pending Withdrawals</h4>
           <h2>{stats.pendingWithdrawals}</h2>
         </div>

         <div style={statsCard}>
           <h4>Active Investments</h4>
           <h2>{stats.activeInvestments}</h2>
         </div>

         <div style={statsCard}>
           <h4>Platform Balance</h4>
           <h2>${stats.platformBalance.toFixed(2)}</h2>
         </div>
       </div>
     )}

      {analytics && (
        <div style={grid}>
          <Stat title="Total Deposits" value={analytics.totalDeposits} />
          <Stat title="Total Withdrawals" value={analytics.totalWithdrawals} />
          <Stat title="Platform Profit" value={analytics.platformProfit} />
          <Stat title="Active Investments" value={analytics.activeInvestments} />
          <Stat title="Completed Investments" value={analytics.completedInvestments} />
        </div>
      )}

      <h3>All Users</h3>

      <div style={{ marginBottom: "15px" }}>
        <button
          onClick={exportUsersCSV}
          style={{
          padding: "10px 14px",
          borderRadius: "8px",
          border: "none",
          background: "#16a34a",
          color: "white",
          cursor: "pointer",
        }}
       >
        Export Users CSV
      </button>
    </div>

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
            <p><strong>ID:</strong> {user.id}</p>
            <p><strong>Name:</strong> {user.full_name}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Password:</strong> Protected / Not visible for security</p>
            <p><strong>Role:</strong> {user.role}</p>

            <button onClick={() => viewUser(user.id)} style={buttonStyle}>
              View / Manage User
            </button>

            <button onClick={() => deleteUser(user.id)} style={dangerButton}>
              Delete User
            </button>

            <button
              onClick={() => toggleFreeze(user.id, !user.is_frozen)}
              style={{
                background: user.is_frozen ? "#16a34a" : "#dc2626",
                color: "#fff",
                border: "none",
                padding: "10px",
                borderRadius: "8px",
                cursor: "pointer",
                marginTop: "10px",
                marginLeft: "10px"
              }}
             >
              {user.is_frozen ? "Unfreeze Account" : "Freeze Account"}
             </button>

            <button
              onClick={() =>
                toggleWithdrawals(
                  user.id,
                  !user.withdrawals_disabled
                )
               }
               style={{
                 background: user.withdrawals_disabled
                   ? "#16a34a"
                   : "#f59e0b",
                 color: "#fff",
                 border: "none",
                 padding: "10px",
                 borderRadius: "8px",
                 cursor: "pointer",
                 marginTop: "10px",
                 marginLeft: "10px"
               }}
             >
               {user.withdrawals_disabled
                 ? "Enable Withdrawals"
                 : "Disable Withdrawals"}
             </button>

            <button
              onClick={() =>
                toggleDeposits(
                  user.id,
                  !user.deposits_disabled
                )
              }
              style={{
                background: user.deposits_disabled
                  ? "#16a34a"
                  : "#7c3aed",
                color: "#fff",
                border: "none",
                padding: "10px",
                borderRadius: "8px",
                cursor: "pointer",
                marginTop: "10px",
                marginLeft: "10px"
              }}
             >
              {user.deposits_disabled
                ? "Enable Deposits"
                : "Disable Deposits"}
             </button>

            <textarea
              placeholder="Admin internal notes..."
              defaultValue={user.admin_notes || ""}
              onBlur={(e) =>
                saveAdminNote(user.id, e.target.value)
              }
              style={{
                width: "100%",
                minHeight: "80px",
                marginTop: "12px",
                padding: "10px",
                borderRadius: "8px",
                border: "1px solid #cbd5e1",
                fontSize: "14px",
                resize: "vertical",
              }}
            />
            
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
                <p><strong>{investment.plan_name}</strong></p>
                <p>Amount: {investment.amount} {investment.currency}</p>
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
                <p><strong>{entry.type}</strong></p>
                <p>{entry.amount} {entry.currency}</p>
                <small>{entry.reason}</small>
              </div>
            ))
          )}
        </div>
      )}

      <h3>KYC Requests</h3>

<div style={cardStyle}>
  {kycList.length === 0 ? (
    <p>No KYC requests</p>
  ) : (
    kycList.map((k) => (
      <div key={k.id} style={kycRow}>
        <div>
          <p>
            <strong>{k.full_name}</strong> ({k.email})
          </p>
          <p>
            <strong>Country:</strong> {k.country}
          </p>
          <p>
            <strong>ID Type:</strong> {k.id_type}
          </p>
          <p>
            <strong>ID Number:</strong> {k.id_number}
          </p>
          <p>
            <strong>Status:</strong> {k.status}
          </p>

          {k.document_url && (
            <a href={k.document_url} target="_blank" rel="noreferrer">
              View Document
            </a>
          )}
        </div>

        <div>
          <button
            onClick={() => updateKyc(k.id, "APPROVED")}
            style={approveButton}
          >
            Approve
          </button>

          <button
            onClick={() => updateKyc(k.id, "REJECTED")}
            style={dangerButton}
          >
            Reject
          </button>
        </div>
      </div>
    ))
  )}
</div>

      <h3>Pending Deposits</h3>

      <div style={{ marginBottom: "15px" }}>
        <button
          onClick={exportDepositsCSV}
          style={{
          padding: "10px 14px",
          borderRadius: "8px",
          border: "none",
          background: "#16a34a",
          color: "white",
          cursor: "pointer",
        }}
       >
        Export Deposits CSV
       </button>
      </div>

      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "15px" }}>
         <input
           type="text"
           placeholder="Search by name, email, amount, currency..."
           value={depositSearch}
           onChange={(e) => setDepositSearch(e.target.value)}
           style={{ padding: "10px", borderRadius: "8px", marginBottom: "10px" }}
          />

          <select
            value={depositStatusFilter}
            onChange={(e) => setDepositStatusFilter(e.target.value)}
            style={{ padding: "10px", borderRadius: "8px", marginBottom: "10px" }}
           >
            <option value="ALL">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
           </select>
         </div>

      {deposits.length === 0 ? (
        <p>No pending deposits</p>
      ) : (
        deposits
          .filter((deposit) => {
            const searchText = `${deposit.full_name || ""} ${deposit.email || ""} ${deposit.amount || ""} ${deposit.currency || ""}`.toLowerCase();

            const matchesSearch = searchText.includes(depositSearch.toLowerCase());

            const matchesStatus =
              depositStatusFilter === "ALL" ||
              String(deposit.status || "").toUpperCase() === depositStatusFilter;

           return matchesSearch && matchesStatus;
              })
              .slice(0, depositLimit)
              .map((deposit) => {
          const proofLink = getProofUrl(
            deposit.proof_url ||
            deposit.proof_image ||
            deposit.proof ||
            deposit.payment_proof
          );

          return (
            <div key={deposit.id} style={depositReviewCard}>
              <div style={depositHeader}>
                <div>
                  <p style={mutedSmall}>Deposit Request</p>
                  <h3 style={{ margin: "4px 0" }}>
                    {deposit.amount} {deposit.currency}
                  </h3>
                </div>

                <span style={pendingBadge}>Pending Review</span>
              </div>

              <p>
                <strong>User:</strong> {deposit.full_name} ({deposit.email})
              </p>

              {deposit.receipt_reference && (
                <p>
                  <strong>Receipt:</strong> {deposit.receipt_reference}
                </p>
              )}

              {proofLink && (
                <div style={{ marginTop: "10px" }}>
                  <a
                    href={proofLink}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      display: "inline-block",
                      padding: "8px 12px",
                      background: "#2563eb",
                      color: "white",
                      borderRadius: "8px",
                      textDecoration: "none",
                      marginRight: "10px"
                    }}
                  >
                    View Proof
                  </a>

                  <a
                    href={proofLink}
                    download
                    style={{
                      display: "inline-block",
                      padding: "8px 12px",
                      background: "#16a34a",
                      color: "white",
                      borderRadius: "8px",
                      textDecoration: "none"
                     }}
                   >
                     Download Proof
                   </a>
                 </div>
               )}

              <p>
                <strong>Status:</strong> {deposit.status}
              </p>

              <div style={proofBox}>
                <h4 style={{ marginTop: 0 }}>Payment Proof</h4>

                {proofLink ? (
                  <div style={proofGrid}>
                    <img src={proofLink} alt="Deposit proof" style={proofImage} />

                    <div>
                      <p style={muted}>
                        Review the uploaded payment screenshot before approving this deposit.
                      </p>

                      <a
                        href={proofLink}
                        target="_blank"
                        rel="noreferrer"
                        style={proofLinkStyle}
                      >
                        Open Full Proof
                      </a>
                    </div>
                  </div>
                ) : (
                  <div style={noProofBox}>
                    <p style={{ margin: 0 }}>No proof uploaded for this deposit.</p>
                  </div>
                )}
              </div>

              <div style={actionRow}>
                <button onClick={() => approveDeposit(deposit.id)} style={approveButton}>
                  Approve Deposit
                </button>

                <button onClick={() => rejectDeposit(deposit.id)} style={dangerButton}>
                  Reject Deposit
                </button>
              </div>
            </div>
          );
        })
      )}
      
      {deposits.length > depositLimit && (
        <div style={{ marginTop: "15px" }}>
          <button
            onClick={() => setDepositLimit((prev) => prev + 10)}
            style={{
              padding: "10px 14px",
              borderRadius: "8px",
              border: "none",
              background: "#2563eb",
              color: "white",
              cursor: "pointer"
            }}
          >
            Load More Deposits
         </button>
       </div>
     )}

      <h3>Pending Withdrawals</h3>

      <div style={{ marginBottom: "15px" }}>
        <button
          onClick={exportWithdrawalsCSV}
          style={{
          padding: "10px 14px",
          borderRadius: "8px",
          border: "none",
          background: "#16a34a",
          color: "white",
          cursor: "pointer",
        }}
       >
        Export Withdrawals CSV
       </button>
     </div>

      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "15px" }}>
        <input
          type="text"
          placeholder="Search withdrawals..."
          value={withdrawalSearch}
          onChange={(e) => setWithdrawalSearch(e.target.value)}
          style={{ padding: "10px", borderRadius: "8px", marginBottom: "10px" }}
         />

         <select
           value={withdrawalStatusFilter}
           onChange={(e) => setWithdrawalStatusFilter(e.target.value)}
           style={{ padding: "10px", borderRadius: "8px", marginBottom: "10px" }}
         >
           <option value="ALL">All Status</option>
           <option value="PENDING">Pending</option>
           <option value="APPROVED">Approved</option>
           <option value="REJECTED">Rejected</option>
         </select>
       </div>

      {withdrawals.length === 0 ? (
        <p>No pending withdrawals</p>
      ) : (
        withdrawals
          .filter((withdrawal) => {
            const searchText = `${withdrawal.full_name || ""} ${withdrawal.email || ""} ${withdrawal.amount || ""} ${withdrawal.currency || ""}`.toLowerCase();

            const matchesSearch = searchText.includes(withdrawalSearch.toLowerCase());

            const matchesStatus =
              withdrawalStatusFilter === "ALL" ||
              String(withdrawal.status || "").toUpperCase() === withdrawalStatusFilter;

            return matchesSearch && matchesStatus;
          })
          .map((withdrawal) => (
          <div key={withdrawal.id} style={cardStyle}>
            <p><strong>User:</strong> {withdrawal.full_name} ({withdrawal.email})</p>
            <p><strong>Amount:</strong> {withdrawal.amount} {withdrawal.currency}</p>
            <p><strong>Wallet:</strong> {withdrawal.wallet_address}</p>
            <p><strong>Status:</strong> {withdrawal.status}</p>

           <input
             placeholder="Transaction Reference"
             value={inputs[withdrawal.id]?.reference || ""}
             onChange={(e) =>
               setInputs({
                 ...inputs,
                 [withdrawal.id]: {
                  ...inputs[withdrawal.id],
                  reference: e.target.value,
                 },
               })
              }
           />

            <textarea
              placeholder="Admin Note"
              value={inputs[withdrawal.id]?.adminNote || ""}
              onChange={(e) =>
                setInputs({
                  ...inputs,
                  [withdrawal.id]: {
                    ...inputs[withdrawal.id],
                    adminNote: e.target.value,
                  },
                })
               }
            />

            <button onClick={() => approveWithdrawal(withdrawal.id)} style={approveButton}>
              Approve Withdrawal
            </button>

            <button onClick={() => rejectWithdrawal(withdrawal.id)} style={dangerButton}>
              Reject Withdrawal
            </button>
          </div>
         ))
        )}

    {withdrawals.length > withdrawalLimit && (
      <div style={{ marginTop: "15px" }}>
        <button
          onClick={() => setWithdrawalLimit((prev) => prev + 10)}
          style={{
            padding: "10px 14px",
            borderRadius: "8px",
            border: "none",
            background: "#2563eb",
            color: "white",
            cursor: "pointer"
          }}
        >
          Load More Withdrawals
        </button>
      </div>
 )}
      
   <h3>Admin Activity Log</h3>

      {adminLogs.length === 0 ? (
        <p>No admin activity yet</p>
      ) : (
        adminLogs.slice(0, adminLogLimit).map((log) => (
          <div key={log.id} style={logCard}>
            <div style={logHeader}>
              <strong>{log.action}</strong>
              <span style={logBadge}>{log.target_type || "system"}</span>
            </div>

            <p>{log.details}</p>

            <small style={muted}>
              Admin ID: {log.admin_id || "N/A"} • Target ID:{" "}
              {log.target_id || "N/A"} •{" "}
              {new Date(log.created_at).toLocaleString()}
            </small>
          </div>
        ))
      )}

       {adminLogs.length > adminLogLimit && (
         <div style={{ marginTop: "15px" }}>
           <button
             onClick={() => setAdminLogLimit((prev) => prev + 10)}
             style={{
               padding: "10px 14px",
               borderRadius: "8px",
               border: "none",
               background: "#2563eb",
               color: "white",
               cursor: "pointer"
             }}
           >
             Load More Logs
           </button>
         </div>
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

const depositReviewCard = {
  background: "linear-gradient(180deg, #1e293b, #0f172a)",
  padding: "18px",
  borderRadius: "16px",
  marginBottom: "18px",
  border: "1px solid #334155",
  boxShadow: "0 18px 45px rgba(0,0,0,0.28)",
};

const depositHeader = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "12px",
  flexWrap: "wrap",
};

const pendingBadge = {
  background: "#ca8a04",
  color: "white",
  padding: "6px 10px",
  borderRadius: "999px",
  fontSize: "12px",
  fontWeight: "bold",
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
  padding: "14px",
  borderRadius: "12px",
  marginBottom: "14px",
  border: "1px solid #334155",
};

const proofGrid = {
  display: "grid",
  gridTemplateColumns: "minmax(160px, 320px) 1fr",
  gap: "16px",
  alignItems: "start",
};

const proofImage = {
  width: "100%",
  maxHeight: "260px",
  objectFit: "cover",
  borderRadius: "12px",
  border: "1px solid #334155",
};

const proofLinkStyle = {
  display: "inline-block",
  color: "white",
  background: "#2563eb",
  padding: "10px 14px",
  borderRadius: "10px",
  textDecoration: "none",
  marginTop: "8px",
};

const noProofBox = {
  background: "#111827",
  border: "1px dashed #64748b",
  padding: "14px",
  borderRadius: "10px",
  color: "#94a3b8",
};

const actionRow = {
  display: "flex",
  gap: "10px",
  flexWrap: "wrap",
};

const logCard = {
  background: "#020617",
  padding: "14px",
  borderRadius: "12px",
  border: "1px solid #334155",
  marginBottom: "10px",
};

const logHeader = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "10px",
  flexWrap: "wrap",
};

const logBadge = {
  background: "#334155",
  color: "white",
  padding: "4px 8px",
  borderRadius: "999px",
  fontSize: "12px",
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

const mutedSmall = {
  color: "#94a3b8",
  fontSize: "14px",
  margin: 0,
};

const kycRow = {
  display: "flex",
  justifyContent: "space-between",
  gap: "12px",
  padding: "14px",
  borderBottom: "1px solid #334155",
  flexWrap: "wrap",
};

const statsGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: "16px",
  marginBottom: "30px",
};

const statsCard = {
  background: "rgba(15,23,42,0.85)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: "16px",
  padding: "20px",
  color: "white",
  boxShadow: "0 12px 35px rgba(0,0,0,0.3)",
};

export default AdminPanel;
