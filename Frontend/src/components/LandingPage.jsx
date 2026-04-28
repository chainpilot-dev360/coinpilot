import { useEffect, useState } from "react";

const slides = [
  {
    title: "Satisfied Investors",
    text: "Join a growing community of users managing digital wealth with confidence.",
    image:
      "https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1600&q=80",
  },
  {
    title: "Crypto Trading Intelligence",
    text: "Monitor opportunities, track portfolio activity, and manage investment growth.",
    image:
      "https://images.unsplash.com/photo-1640340434855-6084b1f4901c?auto=format&fit=crop&w=1600&q=80",
  },
  {
    title: "Stock Market Inspired Analytics",
    text: "A premium dashboard experience designed for modern finance users.",
    image:
      "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1600&q=80",
  },
];

const testimonials = [
  {
    name: "Michael R.",
    text: "ChainPilot has completely changed how I manage my crypto investments.",
  },
  {
    name: "Sarah K.",
    text: "Clean dashboard, fast withdrawals, and consistent tracking.",
  },
  {
    name: "David L.",
    text: "Finally a platform that makes investing feel structured and professional.",
  },
];

function LandingPage({ onLoginClick, onRegisterClick }) {
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((current) => (current + 1) % slides.length);
    }, 4500);

    return () => clearInterval(timer);
  }, []);

  const slide = slides[activeSlide];

  return (
    <div style={page}>
      <section
        style={{
          ...hero,
          backgroundImage: `linear-gradient(rgba(2,6,23,0.55), rgba(2,6,23,0.95)), url(${slide.image})`,
        }}
      >
        <div style={heroOverlay}>
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

          <div style={floatingCard}>
            <p style={badge}>{slide.title}</p>

            <h1 style={heroTitle}>
              A Premium Platform for Digital Asset Growth
            </h1>

            <p style={heroText}>{slide.text}</p>

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

      <section style={statsSection}>
        <Stat number="12,500+" label="Active Users" />
        <Stat number="$2.8M+" label="Processed Deposits" />
        <Stat number="8,900+" label="Investments Created" />
      </section>

      <section style={section}>
        <h2 style={sectionTitle}>Built for Serious Investors</h2>

        <div style={grid}>
          <Card
            title="Automated Growth"
            text="Track projected daily portfolio growth through a clean dashboard."
          />
          <Card
            title="Secure Wallet"
            text="Monitor balances, deposits, withdrawals, and investment activity."
          />
          <Card
            title="Admin Verified"
            text="Platform transactions are controlled through a secure admin system."
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

      <section style={section}>
        <h2 style={sectionTitle}>What Investors Say</h2>

        <div style={grid}>
          {testimonials.map((item, index) => (
            <div key={index} style={testimonialCard}>
              <p style={cardText}>"{item.text}"</p>
              <h4>— {item.name}</h4>
            </div>
          ))}
        </div>
      </section>

      <section style={trustSection}>
        <h2 style={sectionTitle}>Platform Confidence</h2>

        <div style={grid}>
          <Trust title="SSL Protected" />
          <Trust title="Live Support" />
          <Trust title="Transaction Monitoring" />
          <Trust title="Admin Approval System" />
        </div>
      </section>

      <section style={cta}>
        <h2>Start Managing Your Portfolio Today</h2>
        <p style={heroText}>
          Create an account and access your ChainPilot dashboard in minutes.
        </p>

        <button onClick={onRegisterClick} style={primaryButton}>
          Get Started Now
        </button>
      </section>

      <footer style={footer}>
        <div style={footerBrand}>
          <div style={logoMark}>CP</div>
          <div>
            <h3 style={{ margin: 0 }}>ChainPilot</h3>
            <p style={footerText}>Digital asset portfolio management platform.</p>
          </div>
        </div>

        <div style={footerLinks}>
          <button onClick={onRegisterClick} style={footerLink}>
            Create Account
          </button>
          <button onClick={onLoginClick} style={footerLink}>
            Login
          </button>
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
    <div style={statBox}>
      <h2>{number}</h2>
      <p>{label}</p>
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

function Trust({ title }) {
  return (
    <div style={trustCard}>
      <span style={check}>✓</span>
      <strong>{title}</strong>
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
};

const heroOverlay = {
  minHeight: "100vh",
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
  width: "44px",
  height: "44px",
  borderRadius: "14px",
  background: "linear-gradient(135deg, #2563eb, #38bdf8)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontWeight: "bold",
};

const brandName = {
  margin: 0,
};

const brandTag = {
  color: "#94a3b8",
};

const floatingCard = {
  maxWidth: "760px",
  margin: "120px auto 0",
  padding: "52px",
  borderRadius: "30px",
  background: "rgba(15, 23, 42, 0.76)",
  backdropFilter: "blur(20px)",
  border: "1px solid rgba(255,255,255,0.16)",
  boxShadow: "0 35px 100px rgba(0,0,0,0.55)",
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

const statsSection = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: "20px",
  padding: "50px 24px",
  background: "#0f172a",
};

const statBox = {
  textAlign: "center",
  background: "#1e293b",
  padding: "24px",
  borderRadius: "18px",
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

const trustSection = {
  padding: "80px 24px",
  background: "#020617",
  maxWidth: "1200px",
  margin: "0 auto",
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

const testimonialCard = {
  ...card,
  fontStyle: "italic",
};

const planCard = {
  background: "linear-gradient(180deg, #1e293b, #020617)",
  padding: "32px",
  borderRadius: "22px",
  border: "1px solid #334155",
  boxShadow: "0 20px 45px rgba(0,0,0,0.3)",
};

const trustCard = {
  background: "#1e293b",
  padding: "20px",
  borderRadius: "16px",
  display: "flex",
  gap: "10px",
  alignItems: "center",
  justifyContent: "center",
};

const check = {
  color: "#22c55e",
  fontWeight: "bold",
};

const cardText = {
  color: "#94a3b8",
  lineHeight: "1.6",
};

const cta = {
  padding: "90px 24px",
  textAlign: "center",
  background: "#0f172a",
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