import { useEffect, useState } from "react";
import axios from "axios";
import DashboardPreview from "./components/DashboardPreview";
import AdminPanel from "./components/AdminPanel";

function App() {
  const [authMode, setAuthMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("dashboard");

  const [balances, setBalances] = useState([]);
  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [walletAddress, setWalletAddress] = useState("");

  const [plans, setPlans] = useState([]);
  const [selectedPlanId, setSelectedPlanId] = useState("");
  const [investmentAmount, setInvestmentAmount] = useState("");

  useEffect(() => {
    if (!token) return;

    axios
      .get("http://127.0.0.1:5000/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setUser(res.data))
      .catch(() => {
        setToken("");
        setUser(null);
        localStorage.removeItem("token");
      });
  }, [token]);

  useEffect(() => {
    if (!user) return;

    axios
      .get(`http://127.0.0.1:5000/api/users/${user.id}/balances`)
      .then((res) => setBalances(res.data.balances || []));
  }, [user]);

  useEffect(() => {
    axios.get("http://127.0.0.1:5000/api/investment-plans").then((res) => {
      setPlans(res.data);
      if (res.data.length > 0) setSelectedPlanId(String(res.data[0].id));
    });
  }, []);

  async function register() {
    const res = await axios.post("http://127.0.0.1:5000/api/auth/register", {
      fullName: name,
      email,
      password,
    });

    localStorage.setItem("token", res.data.token);
    setToken(res.data.token);
  }

  async function login() {
    const res = await axios.post("http://127.0.0.1:5000/api/auth/login", {
      email,
      password,
    });

    localStorage.setItem("token", res.data.token);
    setToken(res.data.token);
  }

  function logout() {
    localStorage.removeItem("token");
    setToken("");
    setUser(null);
  }

  async function createDeposit() {
    await axios.post(
      "http://127.0.0.1:5000/api/deposits",
      { currency: "USD", amount: Number(depositAmount) },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    alert("Deposit request created");
    setDepositAmount("");
  }

  async function createWithdrawal() {
    await axios.post(
      "http://127.0.0.1:5000/api/withdrawals",
      {
        currency: "USD",
        amount: Number(withdrawAmount),
        walletAddress,
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    alert("Withdrawal request created");
    setWithdrawAmount("");
    setWalletAddress("");
  }

  async function startInvestment() {
    await axios.post(
      "http://127.0.0.1:5000/api/investments",
      {
        planId: Number(selectedPlanId),
        amount: Number(investmentAmount),
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    alert("Investment started");
    setInvestmentAmount("");
  }

  async function processInvestments() {
    const res = await axios.post(
      "http://127.0.0.1:5000/api/admin/process-investments",
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );

    alert(`Processed ${res.data.count} matured investments`);
  }

  if (!user) {
    return (
      <div style={authPage}>
        <div style={authCard}>
          <h1 style={{ marginBottom: 5 }}>ChainPilot</h1>
          <p style={muted}>Crypto investment dashboard</p>

          <div style={{ marginBottom: 20 }}>
            <button onClick={() => setAuthMode("login")} style={authMode === "login" ? activeButton : secondaryButton}>
              Login
            </button>
            <button onClick={() => setAuthMode("register")} style={authMode === "register" ? activeButton : secondaryButton}>
              Register
            </button>
          </div>

          {authMode === "register" && (
            <input placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} style={inputStyle} />
          )}

          <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} />
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} style={inputStyle} />

          {authMode === "login" ? (
            <button onClick={login} style={primaryButton}>Login</button>
          ) : (
            <button onClick={register} style={primaryButton}>Register</button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={layout}>
      <aside style={sidebar}>
        <h2 style={{ marginBottom: 4 }}>ChainPilot</h2>
        <p style={mutedSmall}>{user.role}</p>

        <nav style={{ marginTop: 30 }}>
          <button onClick={() => setActiveTab("dashboard")} style={activeTab === "dashboard" ? activeMenu : menu}>
            Dashboard
          </button>
          <button onClick={() => setActiveTab("wallet")} style={activeTab === "wallet" ? activeMenu : menu}>
            Wallet
          </button>
          <button onClick={() => setActiveTab("invest")} style={activeTab === "invest" ? activeMenu : menu}>
            Invest
          </button>

          {user.role === "ADMIN" && (
            <button onClick={() => setActiveTab("admin")} style={activeTab === "admin" ? activeMenu : menu}>
              Admin
            </button>
          )}
        </nav>

        <button onClick={logout} style={logoutButton}>Logout</button>
      </aside>

      <main style={main}>
        <header style={header}>
          <div>
            <h1 style={{ marginBottom: 5 }}>Welcome, {user.full_name}</h1>
            <p style={muted}>Manage your wallet, investments, and transactions.</p>
          </div>
        </header>

        {activeTab === "dashboard" && (
          <section style={panel}>
            <DashboardPreview token={token} user={user} />
          </section>
        )}

        {activeTab === "wallet" && (
          <section style={panel}>
            <h2>Wallet</h2>

            <h3>Your Balances</h3>
            {balances.length === 0 ? (
              <p style={muted}>No balances yet</p>
            ) : (
              <div style={cardGrid}>
                {balances.map((b) => (
                  <div key={b.id} style={statCard}>
                    <p style={mutedSmall}>{b.currency}</p>
                    <h2>{b.available}</h2>
                  </div>
                ))}
              </div>
            )}

            <div style={twoColumns}>
              <div style={miniPanel}>
                <h3>Deposit Request</h3>
                <input placeholder="Deposit Amount" value={depositAmount} onChange={(e) => setDepositAmount(e.target.value)} style={inputStyle} />
                <button onClick={createDeposit} style={primaryButton}>Create Deposit</button>
              </div>

              <div style={miniPanel}>
                <h3>Withdrawal Request</h3>
                <input placeholder="Withdrawal Amount" value={withdrawAmount} onChange={(e) => setWithdrawAmount(e.target.value)} style={inputStyle} />
                <input placeholder="Wallet Address" value={walletAddress} onChange={(e) => setWalletAddress(e.target.value)} style={inputStyle} />
                <button onClick={createWithdrawal} style={dangerButton}>Create Withdrawal</button>
              </div>
            </div>
          </section>
        )}

        {activeTab === "invest" && (
          <section style={panel}>
            <h2>Investment Plans</h2>

            <div style={cardGrid}>
              {plans.map((plan) => (
                <div key={plan.id} style={statCard}>
                  <h3>{plan.name}</h3>
                  <p>Minimum: {plan.min_amount} {plan.currency}</p>
                  <p>Duration: {plan.duration_days} days</p>
                  <p>Expected Return: {plan.expected_return_percent}%</p>
                </div>
              ))}
            </div>

            <div style={miniPanel}>
              <h3>Start Investment</h3>

              <select value={selectedPlanId} onChange={(e) => setSelectedPlanId(e.target.value)} style={inputStyle}>
                {plans.map((plan) => (
                  <option key={plan.id} value={plan.id}>{plan.name}</option>
                ))}
              </select>

              <input placeholder="Investment Amount" value={investmentAmount} onChange={(e) => setInvestmentAmount(e.target.value)} style={inputStyle} />
              <button onClick={startInvestment} style={primaryButton}>Start Investment</button>

              {user.role === "ADMIN" && (
                <button onClick={processInvestments} style={secondaryButton}>
                  Process Matured Investments
                </button>
              )}
            </div>
          </section>
        )}

        {activeTab === "admin" && user.role === "ADMIN" && (
          <section style={panel}>
            <AdminPanel token={token} />
          </section>
        )}
      </main>
    </div>
  );
}

const layout = {
  display: "flex",
  minHeight: "100vh",
  background: "#0f172a",
  color: "white",
  fontFamily: "Arial, sans-serif",
};

const sidebar = {
  width: "240px",
  background: "#020617",
  padding: "24px",
  display: "flex",
  flexDirection: "column",
};

const main = {
  flex: 1,
  padding: "32px",
  overflowY: "auto",
};

const header = {
  marginBottom: "24px",
};

const panel = {
  background: "#111827",
  padding: "24px",
  borderRadius: "18px",
  boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
};

const miniPanel = {
  background: "#1e293b",
  padding: "20px",
  borderRadius: "14px",
  marginTop: "20px",
};

const cardGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: "16px",
  marginBottom: "24px",
};

const statCard = {
  background: "#1e293b",
  padding: "20px",
  borderRadius: "14px",
};

const twoColumns = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
  gap: "20px",
};

const menu = {
  display: "block",
  width: "100%",
  textAlign: "left",
  padding: "12px",
  marginBottom: "10px",
  borderRadius: "10px",
  border: "none",
  background: "transparent",
  color: "#cbd5e1",
  cursor: "pointer",
};

const activeMenu = {
  ...menu,
  background: "#2563eb",
  color: "white",
};

const inputStyle = {
  display: "block",
  width: "100%",
  maxWidth: "360px",
  padding: "12px",
  marginBottom: "12px",
  borderRadius: "10px",
  border: "1px solid #334155",
  background: "#020617",
  color: "white",
};

const primaryButton = {
  padding: "12px 16px",
  background: "#2563eb",
  color: "white",
  border: "none",
  borderRadius: "10px",
  cursor: "pointer",
  marginRight: "10px",
};

const secondaryButton = {
  padding: "12px 16px",
  background: "#334155",
  color: "white",
  border: "none",
  borderRadius: "10px",
  cursor: "pointer",
  marginRight: "10px",
};

const activeButton = {
  ...primaryButton,
  background: "#16a34a",
};

const dangerButton = {
  ...primaryButton,
  background: "#dc2626",
};

const logoutButton = {
  marginTop: "auto",
  padding: "12px",
  background: "#dc2626",
  color: "white",
  border: "none",
  borderRadius: "10px",
  cursor: "pointer",
};

const authPage = {
  minHeight: "100vh",
  background: "#0f172a",
  color: "white",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const authCard = {
  width: "380px",
  background: "#111827",
  padding: "30px",
  borderRadius: "18px",
  boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
};

const muted = {
  color: "#94a3b8",
};

const mutedSmall = {
  color: "#94a3b8",
  fontSize: "14px",
};

export default App;