import { useEffect } from "react";

function LandingPage({ setView }) {
  useEffect(() => {
    const cards = document.querySelectorAll(".fade-in");

    cards.forEach((card, i) => {
      card.style.animationDelay = `${i * 0.15}s`;
    });
  }, []);

  return (
    <div style={page}>
      {/* HERO */}
      <section style={hero}>
        <div style={heroOverlay} />

        <div style={heroContent}>
          <h1 style={heroTitle}>
            Smart Investing <span style={highlight}>Made Simple</span>
          </h1>

          <p style={heroText}>
            Grow your portfolio with automated crypto, forex, and stock
            strategies.
          </p>

          <button style={ctaButton} onClick={() => setView("register")}>
            Get Started
          </button>
        </div>
      </section>

      {/* FEATURES */}
      <section style={section}>
        <h2 style={sectionTitle}>Why Choose Us</h2>

        <div style={grid}>
          <Feature title="Secure Platform" text="Advanced protection systems." />
          <Feature title="Daily Growth" text="Automated profit generation." />
          <Feature title="Real Markets" text="Crypto, forex, and stocks." />
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section style={section}>
        <h2 style={sectionTitle}>How It Works</h2>

        <div style={grid}>
          <Step number="1" title="Register" text="Create your account." />
          <Step number="2" title="Deposit" text="Fund your wallet." />
          <Step number="3" title="Invest" text="Choose a plan." />
          <Step number="4" title="Withdraw" text="Get your profits." />
        </div>
      </section>

      {/* FAQ */}
      <section style={darkSection}>
        <h2 style={sectionTitle}>FAQ</h2>

        <FAQItem
          q="How do I start?"
          a="Register, deposit funds, and start investing."
        />
        <FAQItem
          q="Is it secure?"
          a="Yes, all data is protected and encrypted."
        />
        <FAQItem
          q="How do withdrawals work?"
          a="Submit request, admin processes it."
        />
      </section>

      {/* CTA */}
      <section style={cta}>
        <h2>Start Growing Your Investment Today</h2>
        <button style={ctaButton} onClick={() => setView("register")}>
          Create Account
        </button>
      </section>
    </div>
  );
}

/* COMPONENTS */

function Feature({ title, text }) {
  return (
    <div className="fade-in" style={card}>
      <h3>{title}</h3>
      <p style={muted}>{text}</p>
    </div>
  );
}

function Step({ number, title, text }) {
  return (
    <div className="fade-in" style={card}>
      <h2 style={{ color: "#38bdf8" }}>{number}</h2>
      <h3>{title}</h3>
      <p style={muted}>{text}</p>
    </div>
  );
}

function FAQItem({ q, a }) {
  return (
    <div className="fade-in" style={card}>
      <strong>{q}</strong>
      <p style={muted}>{a}</p>
    </div>
  );
}

/* STYLES */

const page = {
  color: "white",
};

const hero = {
  height: "80vh",
  backgroundImage:
    "url('https://images.unsplash.com/photo-1642543492481-44e81e3914a7')",
  backgroundSize: "cover",
  backgroundPosition: "center",
  position: "relative",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const heroOverlay = {
  position: "absolute",
  inset: 0,
  background: "rgba(0,0,0,0.6)",
};

const heroContent = {
  position: "relative",
  textAlign: "center",
  animation: "fadeIn 1s ease",
};

const heroTitle = {
  fontSize: "42px",
  marginBottom: "10px",
};

const highlight = {
  color: "#38bdf8",
};

const heroText = {
  marginBottom: "20px",
  color: "#cbd5e1",
};

const ctaButton = {
  padding: "14px 28px",
  borderRadius: "10px",
  border: "none",
  background: "linear-gradient(90deg,#2563eb,#38bdf8)",
  color: "white",
  cursor: "pointer",
  fontWeight: "bold",
  transition: "all 0.3s ease",
};

const section = {
  padding: "60px 20px",
};

const darkSection = {
  padding: "60px 20px",
  background: "#020617",
};

const sectionTitle = {
  textAlign: "center",
  marginBottom: "30px",
};

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))",
  gap: "20px",
};

const card = {
  background: "rgba(30,41,59,0.6)",
  padding: "20px",
  borderRadius: "14px",
  backdropFilter: "blur(10px)",
  border: "1px solid rgba(255,255,255,0.08)",
  transition: "all 0.3s ease",
};

const muted = {
  color: "#94a3b8",
};

const cta = {
  padding: "60px 20px",
  textAlign: "center",
};

export default LandingPage;