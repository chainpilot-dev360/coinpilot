function LandingPage({ onLoginClick, onRegisterClick }) {
  return (
    <div style={page}>
      {/* HERO */}
      <section style={hero}>
        <h1 style={heroTitle}>ChainPilot</h1>
        <p style={heroText}>
          Smart crypto investment platform designed for consistent daily growth.
        </p>

        <div>
          <button onClick={onRegisterClick} style={primaryButton}>
            Get Started
          </button>

          <button onClick={onLoginClick} style={secondaryButton}>
            Login
          </button>
        </div>
      </section>

      {/* FEATURES */}
      <section style={section}>
        <h2>Why Choose ChainPilot</h2>

        <div style={grid}>
          <Card title="Automated Earnings" text="Invest once and earn daily profits automatically." />
          <Card title="Secure Wallet" text="Your funds are managed with secure backend systems." />
          <Card title="Real-time Dashboard" text="Track your investments and profits live." />
        </div>
      </section>

      {/* PLANS */}
      <section style={sectionDark}>
        <h2>Investment Plans</h2>

        <div style={grid}>
          <Card title="Starter Plan" text="5% daily return. Entry from $100." />
          <Card title="Growth Plan" text="7.5% daily return. From $10,000." />
          <Card title="Premium Plan" text="12% daily return. From $100,000." />
        </div>
      </section>

      {/* CTA */}
      <section style={hero}>
        <h2>Start Growing Your Capital Today</h2>
        <button onClick={onRegisterClick} style={primaryButton}>
          Create Account
        </button>
      </section>
    </div>
  );
}

function Card({ title, text }) {
  return (
    <div style={card}>
      <h3>{title}</h3>
      <p>{text}</p>
    </div>
  );
}

const page = {
  background: "#020617",
  color: "white",
};

const hero = {
  textAlign: "center",
  padding: "80px 20px",
};

const heroTitle = {
  fontSize: "48px",
  marginBottom: "10px",
};

const heroText = {
  color: "#94a3b8",
  marginBottom: "20px",
};

const section = {
  padding: "60px 20px",
  textAlign: "center",
};

const sectionDark = {
  padding: "60px 20px",
  background: "#0f172a",
  textAlign: "center",
};

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: "20px",
  marginTop: "30px",
};

const card = {
  background: "#1e293b",
  padding: "20px",
  borderRadius: "12px",
};

const primaryButton = {
  padding: "12px 20px",
  background: "#2563eb",
  color: "white",
  border: "none",
  borderRadius: "8px",
  marginRight: "10px",
  cursor: "pointer",
};

const secondaryButton = {
  padding: "12px 20px",
  background: "#334155",
  color: "white",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
};

export default LandingPage;