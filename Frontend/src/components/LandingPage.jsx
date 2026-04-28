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
      {/* HERO */}
      <section
        style={{
          ...hero,
          backgroundImage: `linear-gradient(rgba(2,6,23,0.55), rgba(2,6,23,0.95)), url(${slide.image})`,
        }}
      >
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
            <p style={badge}>{slide.title}</p>

            <h1 style={heroTitle}>
              Build Wealth With Smart Digital Asset Investing
            </h1>

            <p style={heroText}>{slide.text}</p>

            <button onClick={onRegisterClick} style={primaryButton}>
              Create Account
            </button>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section style={statsSection}>
        <Stat number="12,500+" label="Active Users" />
        <Stat number="$2.8M+" label="Processed Deposits" />
        <Stat number="8,900+" label="Investments Created" />
      </section>

      {/* FEATURES */}
      <section style={section}>
        <h2 style={sectionTitle}>Why Choose ChainPilot</h2>

        <div style={grid}>
          <Card title="Automated Growth" text="Daily profit tracking system." />
          <Card title="Secure Wallet" text="Encrypted user balances." />
          <Card title="Live Dashboard" text="Real-time performance updates." />
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section style={darkSection}>
        <h2 style={sectionTitle}>What Our Investors Say</h2>

        <div style={grid}>
          {testimonials.map((t, i) => (
            <div key={i} style={testimonialCard}>
              <p style={cardText}>"{t.text}"</p>
              <h4 style={{ marginTop: 10 }}>— {t.name}</h4>
            </div>
          ))}
        </div>
      </section>

      {/* TRUST */}
      <section style={section}>
        <h2 style={sectionTitle}>Platform Security</h2>

        <div style={grid}>
          <Card title="SSL Encrypted" text="All data is secured end-to-end." />
          <Card title="Admin Verified" text="Manual approval system in place." />
          <Card title="Secure Storage" text="User funds tracking protected." />
        </div>
      </section>

      {/* CTA */}
      <section style={cta}>
        <h2>Start Growing Your Portfolio Today</h2>

        <button onClick={onRegisterClick} style={primaryButton}>
          Get Started Now
        </button>
      </section>
    </div>
  );
}

function Stat({ number, label }) {
  return (
    <div style={statBox}>
      <h2>{number}</h2>
      <p style={cardText}>{label}</p>
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

const page = {
  background: "#020617",
  color: "white",
  fontFamily: "Arial",
};

const hero = {
  minHeight: "100vh",
  backgroundSize: "cover",
  backgroundPosition: "center",
};

const heroOverlay = {
  minHeight: "100vh",
  padding: "24px",
};

const nav = {
  display: "flex",
  justifyContent: "space-between",
};

const floatingCard = {
  marginTop: "120px",
  padding: "40px",
  background: "rgba(15,23,42,0.7)",
  borderRadius: "20px",
  textAlign: "center",
};

const badge = { color: "#38bdf8" };

const heroTitle = { fontSize: "48px" };

const heroText = { color: "#94a3b8" };

const statsSection = {
  display: "flex",
  justifyContent: "space-around",
  padding: "40px",
  background: "#0f172a",
};

const statBox = {
  textAlign: "center",
};

const section = {
  padding: "60px",
  textAlign: "center",
};

const darkSection = {
  padding: "60px",
  background: "#0f172a",
};

const sectionTitle = {
  fontSize: "32px",
  marginBottom: "20px",
};

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: "20px",
};

const card = {
  background: "#1e293b",
  padding: "20px",
  borderRadius: "12px",
};

const testimonialCard = {
  ...card,
  fontStyle: "italic",
};

const cardText = {
  color: "#94a3b8",
};

const cta = {
  padding: "60px",
  textAlign: "center",
};

const primaryButton = {
  padding: "12px 20px",
  background: "#2563eb",
  color: "white",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
};

const navButton = primaryButton;
const navPrimary = primaryButton;

export default LandingPage;