function LandingPage({ onLoginClick, onRegisterClick }) {
  return (
    <div style={page}>
      <section style={hero}>
        <div style={heroOverlay}>
          <nav style={nav}>
            <h2>ChainPilot</h2>

            <div>
              <button onClick={onLoginClick} style={navButton}>
                Login
              </button>

              <button onClick={onRegisterClick} style={navPrimary}>
                Get Started
              </button>
            </div>
          </nav>

          <div style={floatingCard}>
            <p style={badge}>Crypto Investment Platform</p>

            <h1 style={heroTitle}>
              Build Wealth With Smart Digital Asset Investing
            </h1>

            <p style={heroText}>
              Track your wallet, grow your portfolio, monitor investments, and
              manage earnings from one secure dashboard.
            </p>

            <div>
              <button onClick={onRegisterClick} style={primaryButton}>
                Create Account
              </button>

              <button onClick={onLoginClick} style={secondaryButton}>
                Access Dashboard
              </button>
            </div>
          </div>
        </div>
      </section>

      <section style={section}>
        <h2 style={sectionTitle}>Why Investors Choose ChainPilot</h2>

        <div style={grid}>
          <Card
            title="Daily Growth Plans"
            text="Choose investment plans designed around projected daily portfolio growth."
          />
          <Card
            title="Live Dashboard"
            text="Monitor wallet balances, investments, transactions, and performance from one place."
          />
          <Card
            title="Admin-Controlled Security"
            text="Deposits and withdrawals are reviewed through a secure admin approval system."
          />
        </div>
      </section>

      <section style={darkSection}>
        <h2 style={sectionTitle}>Investment Plans</h2>

        <div style={grid}>
          <Plan title="Starter" amount="$100" returnText="5% daily" />
          <Plan title="Growth" amount="$10,000" returnText="7.5% daily" />
          <Plan title="Premium" amount="$100,000" returnText="12% daily" />
        </div>
      </section>

      <section style={cta}>
        <h2>Start Managing Your Crypto Portfolio Today</h2>
        <p style={heroText}>
          Create an account and access your investment dashboard in minutes.
        </p>

        <button onClick={onRegisterClick} style={primaryButton}>
          Get Started Now
        </button>
      </section>
    </div>
  );
}

function Card({ title, text }) {
  return (
    <div style={card}>
      <h3>{title}</h3>
      <p style={cardText}>{text}</p>
    </div>
  );
}

function Plan({ title, amount, returnText }) {
  return (
    <div style={planCard}>
      <p style={badge}>{title} Plan</p>
      <h2>{amount}</h2>
      <p style={cardText}>Minimum investment</p>
      <h3>{returnText}</h3>
      <p style={cardText}>Projected daily return</p>
    </div>
  );
}

const page = {
  background: "#020617",
  color: "white",
  fontFamily: "Arial, sans-serif",
};

const hero = {
  minHeight: "100vh",
  backgroundImage:
    "linear-gradient(rgba(2,6,23,0.65), rgba(2,6,23,0.95)), url('https://images.unsplash.com/photo-1640340434855-6084b1f4901c?auto=format&fit=crop&w=1600&q=80')",
  backgroundSize: "cover",
  backgroundPosition: "center",
  backgroundAttachment: "fixed",
};

const heroOverlay = {
  minHeight: "100vh",
  padding: "24px",
  display: "flex",
  flexDirection: "column",
};

const nav = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  maxWidth: "1200px",
  width: "100%",
  margin: "0 auto",
};

const floatingCard = {
  maxWidth: "760px",
  margin: "120px auto 0",
  padding: "50px",
  borderRadius: "28px",
  background: "rgba(15, 23, 42, 0.72)",
  backdropFilter: "blur(18px)",
  border: "1px solid rgba(255,255,255,0.14)",
  boxShadow: "0 30px 90px rgba(0,0,0,0.45)",
  textAlign: "center",
};

const badge = {
  color: "#38bdf8",
  fontWeight: "bold",
  textTransform: "uppercase",
  letterSpacing: "1px",
  fontSize: "13px",
};

const heroTitle = {
  fontSize: "56px",
  lineHeight: "1.05",
  margin: "15px 0",
};

const heroText = {
  color: "#cbd5e1",
  fontSize: "18px",
  lineHeight: "1.6",
  marginBottom: "28px",
};

const section = {
  padding: "80px 24px",
  maxWidth: "1200px",
  margin: "0 auto",
  textAlign: "center",
};

const darkSection = {
  padding: "80px 24px",
  background: "#0f172a",
  textAlign: "center",
};

const sectionTitle = {
  fontSize: "36px",
  marginBottom: "30px",
};

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
  gap: "22px",
};

const card = {
  background: "#1e293b",
  padding: "28px",
  borderRadius: "18px",
  boxShadow: "0 20px 45px rgba(0,0,0,0.25)",
};

const planCard = {
  background: "linear-gradient(180deg, #1e293b, #020617)",
  padding: "32px",
  borderRadius: "22px",
  border: "1px solid #334155",
  boxShadow: "0 20px 45px rgba(0,0,0,0.3)",
};

const cardText = {
  color: "#94a3b8",
  lineHeight: "1.6",
};

const cta = {
  padding: "90px 24px",
  textAlign: "center",
};

const primaryButton = {
  padding: "14px 24px",
  background: "#2563eb",
  color: "white",
  border: "none",
  borderRadius: "12px",
  marginRight: "12px",
  cursor: "pointer",
  fontWeight: "bold",
};

const secondaryButton = {
  padding: "14px 24px",
  background: "rgba(255,255,255,0.12)",
  color: "white",
  border: "1px solid rgba(255,255,255,0.2)",
  borderRadius: "12px",
  cursor: "pointer",
};

const navButton = {
  ...secondaryButton,
  padding: "10px 16px",
};

const navPrimary = {
  ...primaryButton,
  padding: "10px 16px",
};

export default LandingPage;