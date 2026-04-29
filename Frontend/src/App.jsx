import { useEffect, useState } from "react";
import axios from "axios";
import DashboardPreview from "./components/DashboardPreview";
import AdminPanel from "./components/AdminPanel";
import Notification from "./components/Notification";
import LandingPage from "./components/LandingPage";
import VerifyEmail from "./components/VerifyEmail";
import ForgotPassword from "./components/ForgotPassword";
import ResetPassword from "./components/ResetPassword";

const API_URL = import.meta.env.VITE_API_URL;

function App() {
  const isVerifyPage = window.location.pathname === "/verify-email";
  const isForgotPasswordPage = window.location.pathname === "/forgot-password";
  const isResetPasswordPage = window.location.pathname === "/reset-password";

  const [authMode, setAuthMode] = useState("login");
  const [showAuth, setShowAuth] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("dashboard");

  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const [notification, setNotification] = useState({
    message: "",
    type: "success",
  });

  const [balances, setBalances] = useState([]);
  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [walletAddress, setWalletAddress] = useState("");

  const [plans, setPlans] = useState([]);
  const [selectedPlanId, setSelectedPlanId] = useState("");
  const [investmentAmount, setInvestmentAmount] = useState("");

  function showNotification(message, type = "success") {
    setNotification({ message, type });

    setTimeout(() => {
      setNotification({ message: "", type: "success" });
    }, 3000);
  }

  useEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth < 768);
    }

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!token) return;

    axios
      .get(`${API_URL}/api/auth/me`, {
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
      .get(`${API_URL}/api/users/${user.id}/balances`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setBalances(res.data.balances || []))
      .catch(() => {});
  }, [user, token]);

  useEffect(() => {
    axios
      .get(`${API_URL}/api/investment-plans`)
      .then((res) => {
        setPlans(res.data || []);

        if (res.data && res.data.length > 0) {
          setSelectedPlanId(String(res.data[0].id));
        }
      })
      .catch(() => {});
  }, []);

  async function register() {
    try {
      const res = await axios.post(`${API_URL}/api/auth/register`, {
        fullName: name,
        email,
        password,
      });

      localStorage.setItem("token", res.data.token);
      setToken(res.data.token);
      showNotification("Registration successful", "success");
    } catch (error) {
      showNotification(
        error.response?.data?.message || "Registration failed",
        "error"
      );
    }
  }

  async function login() {
    try {
      const res = await axios.post(`${API_URL}/api/auth/login`, {
        email,
        password,
      });

      localStorage.setItem("token", res.data.token);
      setToken(res.data.token);
      showNotification("Login successful", "success");
    } catch (error) {
      showNotification(error.response?.data?.message || "Login failed", "error");
    }
  }

  function logout() {
    localStorage.removeItem("token");
    setToken("");
    setUser(null);
    setShowAuth(false);
    showNotification("Logged out", "success");
  }

  function openTab(tab) {
    setActiveTab(tab);
    setMenuOpen(false);
  }

  function openLogin() {
    setAuthMode("login");
    setShowAuth(true);
  }

  function openRegister() {
    setAuthMode("register");
    setShowAuth(true);
  }

  async function refreshBalances() {
    if (!user) return;

    try {
      const res = await axios.get(`${API_URL}/api/users/${user.id}/balances`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setBalances(res.data.balances || []);
    } catch {
      showNotification("Failed to refresh balances", "error");
    }
  }

  async function createDeposit() {
    try {
      await axios.post(
        `${API_URL}/api/deposits`,
        { currency: "USD", amount: Number(depositAmount) },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      showNotification("Deposit request created", "success");
      setDepositAmount("");
    } catch (error) {
      showNotification(error.response?.data?.message || "Deposit failed", "error");
    }
  }

  async function createWithdrawal() {
    try {
      await axios.post(
        `${API_URL}/api/withdrawals`,
        {
          currency: "USD",
          amount: Number(withdrawAmount),
          walletAddress,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      showNotification("Withdrawal request created", "success");
      setWithdrawAmount("");
      setWalletAddress("");
    } catch (error) {
      showNotification(
        error.response?.data?.message || "Withdrawal failed",
        "error"
      );
    }
  }

  async function startInvestment() {
    try {
      await axios.post(
        `${API_URL}/api/investments`,
        {
          planId: Number(selectedPlanId),
          amount: Number(investmentAmount),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      showNotification("Investment started successfully", "success");
      setInvestmentAmount("");
      refreshBalances();
    } catch (error) {
      showNotification(
        error.response?.data?.message || "Investment failed",
        "error"
      );
    }
  }

  async function processInvestments() {
    try {
      const res = await axios.post(
        `${API_URL}/api/admin/process-investments`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      showNotification(
        `Processed ${res.data.count} matured investments`,
        "success"
      );
    } catch (error) {
      showNotification(
        error.response?.data?.message || "Processing failed",
        "error"
      );
    }
  }

  if (isVerifyPage) {
    return <VerifyEmail onLoginClick={openLogin} />;
  }

  if (isForgotPasswordPage) {
    return <ForgotPassword />;
  }

  if (isResetPasswordPage) {
    return <ResetPassword />;
  }

  if (!user && !showAuth) {
    return (
      <>
        <Notification message={notification.message} type={notification.type} />
        <LandingPage onLoginClick={openLogin} onRegisterClick={openRegister} />
      </>
    );
  }

  if (!user && showAuth) {
    return (
      <div style={authPage}>
        <Notification message={notification.message} type={notification.type} />

        <div style={authCard}>
          <button onClick={() => setShowAuth(false)} style={backButton}>
            ← Back to Home
          </button>

          <h1 style={{ marginBottom: 5 }}>ChainPilot</h1>
          <p style={muted}>Crypto investment dashboard</p>

          <div style={{ marginBottom: 20 }}>
            <button
              onClick={() => setAuthMode("login")}
              style={authMode === "login" ? activeButton : secondaryButton}
            >
              Login
            </button>

            <button
              onClick={() => setAuthMode("register")}
              style={authMode === "register" ? activeButton : secondaryButton}
            >
              Register
            </button>
          </div>

          {authMode === "register" && (
            <input
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={input}
            />
          )}

          <input
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={input}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={input}
          />

{authMode === "login" ? (
  <>
    <button onClick={login} style={primaryButton}>
      Login
    </button>

    <p style={forgotWrapper}>
      <span
        onClick={() => {
          window.location.href = "/forgot-password";
        }}
        style={forgotLink}
      >
        Forgot Password?
      </span>
    </p>
  </>
) : (
  <button onClick={register} style={primaryButton}>
    Register
  </button>
)}
        </div>
      </div>
    );
  }

  return (
    <div style={layout}>
      <Notification message={notification.message} type={notification.type} />

      {isMobile && (
        <div style={mobileTopBar}>
          <button onClick={() => setMenuOpen(!menuOpen)} style={menuButton}>
            ☰
          </button>
          <h3>ChainPilot</h3>
        </div>
      )}

      {isMobile && menuOpen && (
        <div style={overlay} onClick={() => setMenuOpen(false)} />
      )}

      <aside
        style={{
          ...sidebar,
          transform: isMobile
            ? menuOpen
              ? "translateX(0)"
              : "translateX(-100%)"
            : "translateX(0)",
        }}
      >
        <h2 style={{ marginBottom: 4 }}>ChainPilot</h2>
        <p style={mutedSmall}>{user.role}</p>

        <nav style={{ marginTop: 30 }}>
          <button
            onClick={() => openTab("dashboard")}
            style={activeTab === "dashboard" ? activeMenu : menu}
          >
            Dashboard
          </button>

          <button
            onClick={() => openTab("wallet")}
            style={activeTab === "wallet" ? activeMenu : menu}
          >
            Wallet
          </button>

          <button
            onClick={() => openTab("invest")}
            style={activeTab === "invest" ? activeMenu : menu}
          >
            Invest
          </button>

          {user.role === "ADMIN" && (
            <button
              onClick={() => openTab("admin")}
              style={activeTab === "admin" ? activeMenu : menu}
            >
              Admin
            </button>
          )}
        </nav>

        <button onClick={logout} style={logoutButton}>
          Logout
        </button>
      </aside>

      <main
        style={{
          ...main,
          marginLeft: isMobile ? "0" : "240px",
          marginTop: isMobile ? "60px" : "0",
          padding: isMobile ? "16px" : "32px",
        }}
      >
        <header style={header}>
          <h1 style={{ marginBottom: 5 }}>Welcome, {user.full_name}</h1>
          <p style={muted}>Manage your wallet, investments, and transactions.</p>
        </header>

        {activeTab === "dashboard" && (
          <section style={panel}>
            <DashboardPreview token={token} user={user} />
          </section>
        )}

        {activeTab === "wallet" && (
          <section style={panel}>
            <h2>Wallet</h2>

            <button onClick={refreshBalances} style={secondaryButton}>
              Refresh Balance
            </button>

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
                <input
                  placeholder="Deposit Amount"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  style={input}
                />
                <button onClick={createDeposit} style={primaryButton}>
                  Create Deposit
                </button>
              </div>

              <div style={miniPanel}>
                <h3>Withdrawal Request</h3>
                <input
                  placeholder="Withdrawal Amount"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  style={input}
                />
                <input
                  placeholder="Wallet Address"
                  value={walletAddress}
                  onChange={(e) => setWalletAddress(e.target.value)}
                  style={input}
                />
                <button onClick={createWithdrawal} style={dangerButton}>
                  Create Withdrawal
                </button>
              </div>
            </div>
          </section>
        )}

        {activeTab === "invest" && (
          <section style={panel}>
            <h2>Investment Plans</h2>
            <p style={muted}>
              Choose a plan based on your capital and preferred return structure.
            </p>

            <div style={cardGrid}>
              {plans.map((plan) => (
                <div key={plan.id} style={statCard}>
                  <h3>{plan.name}</h3>
                  <p>
                    <strong>Minimum:</strong> ${plan.min_amount}
                  </p>
                  <p>
                    <strong>Projected Daily Return:</strong>{" "}
                    {plan.expected_return_percent}%
                  </p>
                  <p>
                    <strong>Duration:</strong> {plan.duration_days} day(s)
                  </p>
                </div>
              ))}
            </div>

            <div style={miniPanel}>
              <h3>Start Investment</h3>

              <select
                value={selectedPlanId}
                onChange={(e) => setSelectedPlanId(e.target.value)}
                style={input}
              >
                {plans.map((plan) => (
                  <option key={plan.id} value={plan.id}>
                    {plan.name}
                  </option>
                ))}
              </select>

              <input
                placeholder="Enter Amount"
                value={investmentAmount}
                onChange={(e) => setInvestmentAmount(e.target.value)}
                style={input}
              />

              <button onClick={startInvestment} style={primaryButton}>
                Start Investment
              </button>

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
  position: "fixed",
  height: "100vh",
  left: 0,
  top: 0,
  transition: "transform 0.3s ease",
  zIndex: 1001,
  boxSizing: "border-box",
};

const main = {
  flex: 1,
  overflowY: "auto",
  width: "100%",
  boxSizing: "border-box",
};

const mobileTopBar = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  height: "60px",
  background: "#020617",
  display: "flex",
  alignItems: "center",
  padding: "0 16px",
  zIndex: 1000,
  boxSizing: "border-box",
};

const menuButton = {
  fontSize: "26px",
  background: "transparent",
  border: "none",
  color: "white",
  marginRight: "14px",
  cursor: "pointer",
};

const overlay = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: "rgba(0,0,0,0.55)",
  zIndex: 1000,
};

const header = {
  marginBottom: "24px",
};

const panel = {
  background: "#111827",
  padding: "24px",
  borderRadius: "18px",
  boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
  overflowX: "auto",
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
  gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
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

const input = {
  display: "block",
  width: "100%",
  maxWidth: "360px",
  padding: "12px",
  marginBottom: "12px",
  borderRadius: "10px",
  border: "1px solid #334155",
  background: "#020617",
  color: "white",
  boxSizing: "border-box",
};

const primaryButton = {
  padding: "12px 16px",
  background: "#2563eb",
  color: "white",
  border: "none",
  borderRadius: "10px",
  cursor: "pointer",
  marginRight: "10px",
  marginBottom: "10px",
};

const secondaryButton = {
  padding: "12px 16px",
  background: "#334155",
  color: "white",
  border: "none",
  borderRadius: "10px",
  cursor: "pointer",
  marginRight: "10px",
  marginBottom: "10px",
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

const backButton = {
  background: "transparent",
  color: "#94a3b8",
  border: "none",
  marginBottom: "16px",
  cursor: "pointer",
};

const forgotPasswordButton = {
  background: "transparent",
  color: "#38bdf8",
  border: "none",
  marginBottom: "16px",
  cursor: "pointer",
  display: "block",
  padding: 0,
};

const authPage = {
  minHeight: "100vh",
  background: "#0f172a",
  color: "white",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "16px",
  boxSizing: "border-box",
};

const authCard = {
  width: "100%",
  maxWidth: "380px",
  background: "#111827",
  padding: "30px",
  borderRadius: "18px",
  boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
  boxSizing: "border-box",
};

const muted = {
  color: "#94a3b8",
};

const mutedSmall = {
  color: "#94a3b8",
  fontSize: "14px",
};

export default App;