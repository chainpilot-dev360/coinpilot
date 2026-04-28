import { useEffect, useState } from "react";

const slides = [
  {
    title: "Digital Asset Growth",
    text: "A premium platform for crypto, forex, and portfolio-focused investors.",
    image:
      "https://images.unsplash.com/photo-1640340434855-6084b1f4901c?auto=format&fit=crop&w=1600&q=80",
  },
  {
    title: "Investor Dashboard",
    text: "Track balances, investments, notifications, and market activity in one place.",
    image:
      "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1600&q=80",
  },
  {
    title: "Professional Support",
    text: "Stay connected with real-time support and a clean investment experience.",
    image:
      "https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1600&q=80",
  },
];

function LandingPage({ onLoginClick, onRegisterClick }) {
  const [activeSlide, setActiveSlide] = useState(0);
  const slide = slides[activeSlide];

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((current) => (current + 1) % slides.length);
    }, 4500);

    return () => clearInterval(timer);
  }, []);

  return (
    <div style={page}>
      <section
        style={{
          ...hero,
          backgroundImage: `linear-gradient(rgba(2,6,23,0.55), rgba(2,6,23,0.95)), url(${slide.image})`,
        }}
      >
        <nav style={nav}>
          <div style={brand}>
            <div style={logoMark}>CP</div>
            <div>
              <h2 style={brandName}>ChainPilot</h2>
              <small style={brandTag}>Digital Asset Growth</small>
            </div>
          </div>

          <div>
            <button onClick={onLoginClick} style={navButton}>
              Login
            </button>
            <button onClick={onRegisterClick} style={navPrimary}>
              Get Started
            </button>
          </div>
        </nav>

        <div style={heroCard}>
          <p style={badge}>{slide.title}</p>
          <h1 style={heroTitle}>Premium Crypto Investment Dashboard</h1>
          <p style={heroText}>{slide.text}</p>

          <button onClick={onRegisterClick} style={primaryButton}>
            Create Account
          </button>
          <button onClick={onLoginClick} style={secondaryButton}>
            Access Dashboard
          </button>

          <div style={dots}>
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveSlide(index)}
                style={{
                  ...dot,
                  background:
                    index === activeSlide ? "#38bdf8" : "rgba(255,255,255,0.35)",
                }}
              />
            ))}
          </div>
        </div>
      </section>

      <section style={statsSection}>
        <Stat number="12,500+" label="Active Users" />
        <Stat number="$2.8M+" label="Processed Deposits" />
        <Stat number="8,900+" label="Investments Created" />
      </section>

      <section style={section}>
        <h2 style={sectionTitle}>How It Works</h2>
        <div style={grid}>
          <Card title="1. Create Account" text="Sign up and access your investor dashboard." />
          <Card title="2. Fund Wallet" text="Submit a deposit request for admin approval." />
          <Card title="3. Start Investment" text="Choose a plan and monitor projected growth." />
          <Card title="4. Track & Withdraw" text="Follow performance and request withdrawals." />
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

      <section style={section}>
        <h2 style={sectionTitle}>Why Choose ChainPilot</h2>
        <div style={grid}>
          <Card title="Live Market Dashboard" text="Forex, crypto, and portfolio visuals in one dashboard." />
          <Card title="Secure Admin Controls" text="Deposits, withdrawals, and balances are managed securely." />
          <Card title="Real Notifications" text="Users receive updates for key account activities." />
        </div>
      </section>

      <section style={darkSection}>
        <h2 style={sectionTitle}>Frequently Asked Questions</h2>
        <FAQ question="How do I start?" answer="Create an account, fund your wallet, and select an investment plan." />
        <FAQ question="How do withdrawals work?" answer="Submit a withdrawal request and wait for admin processing." />
        <FAQ question="Can I track my investments?" answer="Yes. Your dashboard shows balances, investments, charts, and notifications." />
      </section>

      <section style={cta}>
        <h2>Start Managing Your Portfolio Today</h2>
        <p style={heroText}>Create your ChainPilot account and access your dashboard in minutes.</p>
        <button onClick={onRegisterClick} style={primaryButton}>
          Get Started Now
        </button>
      </section>

      <footer style={footer}>
        <div style={footerBrand}>
          <div style={logoMark}>CP</div>
          <div>
            <h3 style={{ margin: 0 }}>ChainPilot</h3>
            <p style={footerText}>Premium digital asset portfolio platform.</p>
          </div>
        </div>

        <div style={footerLinks}>
          <button onClick={onRegisterClick} style={footerLink}>Create Account</button>
          <button onClick={onLoginClick} style={footerLink}>Login</button>
          <a href="mailto:support@chainpilot.com" style={footerAnchor}>
            support@chainpilot.com
          </a>
        </div>

        <p style={footerBottom}>
          © {new Date().getFullYear()} ChainPilot. All rights reserved.
        </p>
      </footer>
    </div>
  );
}

function Stat({ number, label }) {
  return (
    <div className="fade-in" style={statBox}>
      <h2>{number}</h2>
      <p>{label}</p>
    </div>
  );
}

function Card({ title, text }) {
  return (
    <div className="fade-in" style={card}>
      <h3>{title}</h3>
      <p style={muted}>{text}</p>
    </div>
  );
}

function Plan({ title, amount, returnText }) {
  return (
    <div className="fade-in" style={planCard}>
      <p style={badge}>{title} Plan</p>
      <h2>{amount}</h2>
      <p style={muted}>Minimum investment</p>
      <h3>{returnText}</h3>
      <p style={muted}>Projected daily return</p>
    </div>
  );
}

function FAQ({ question, answer }) {
  return (
    <div className="fade-in" style={faqItem}>
      <strong>{question}</strong>
      <p style={muted}>{answer}</p>
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
  backgroundSize: "cover",
  backgroundPosition: "center",
  backgroundAttachment: "fixed",
  padding: "24px",
};

const nav = {
  maxWidth: "1200px",
  margin: "0 auto",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
};

const brand = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
};

const logoMark = {
  width: "46px",
  height: "46px",
  borderRadius: "15px",
  background: "linear-gradient(135deg, #2563eb, #38bdf8)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontWeight: "bold",
  boxShadow: "0 15px 35px rgba(56,189,248,0.35)",
};

const brandName = {
  margin: 0,
};

const brandTag = {
  color: "#94a3b8",
};

const heroCard = {
  maxWidth: "780px",
  margin: "120px auto 0",
  padding: "52px",
  borderRadius: "30px",
  background: "rgba(15, 23, 42, 0.76)",
  backdropFilter: "blur(20px)",
  border: "1px solid rgba(255,255,255,0.16)",
  boxShadow: "0 35px 100px rgba(0,0,0,0.55)",
  textAlign: "center",
  animation: "fadeIn 0.8s ease",
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

const statsSection = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: "20px",
  padding: "50px 24px",
  background: "#0f172a",
};

const statBox = {
  textAlign: "center",
  background: "rgba(30,41,59,0.72)",
  padding: "24px",
  borderRadius: "18px",
  border: "1px solid rgba(255,255,255,0.08)",
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
  background: "rgba(30,41,59,0.65)",
  padding: "28px",
  borderRadius: "18px",
  border: "1px solid rgba(255,255,255,0.08)",
  backdropFilter: "blur(12px)",
  boxShadow: "0 20px 45px rgba(0,0,0,0.25)",
};

const planCard = {
  background: "linear-gradient(180deg, #1e293b, #020617)",
  padding: "32px",
  borderRadius: "22px",
  border: "1px solid #334155",
  boxShadow: "0 20px 45px rgba(0,0,0,0.3)",
};

const faqItem = {
  maxWidth: "850px",
  margin: "0 auto 14px",
  background: "#1e293b",
  padding: "18px",
  borderRadius: "14px",
  textAlign: "left",
};

const muted = {
  color: "#94a3b8",
  lineHeight: "1.6",
};

const cta = {
  padding: "90px 24px",
  textAlign: "center",
  background: "#020617",
};

const footer = {
  padding: "40px 24px",
  background: "#020617",
  borderTop: "1px solid #1e293b",
};

const footerBrand = {
  maxWidth: "1200px",
  margin: "0 auto 24px",
  display: "flex",
  gap: "12px",
  alignItems: "center",
};

const footerText = {
  color: "#94a3b8",
  margin: "6px 0 0",
};

const footerLinks = {
  maxWidth: "1200px",
  margin: "0 auto",
  display: "flex",
  flexWrap: "wrap",
  gap: "14px",
};

const footerLink = {
  background: "transparent",
  color: "#cbd5e1",
  border: "none",
  cursor: "pointer",
};

const footerAnchor = {
  color: "#38bdf8",
  textDecoration: "none",
};

const footerBottom = {
  maxWidth: "1200px",
  margin: "24px auto 0",
  color: "#64748b",
};

const primaryButton = {
  padding: "14px 24px",
  background: "linear-gradient(90deg,#2563eb,#38bdf8)",
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

const dots = {
  marginTop: "28px",
  display: "flex",
  justifyContent: "center",
  gap: "10px",
};

const dot = {
  width: "12px",
  height: "12px",
  borderRadius: "50%",
  border: "none",
  cursor: "pointer",
};

export default LandingPage;