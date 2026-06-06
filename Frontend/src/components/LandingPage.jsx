import { useEffect, useState } from "react";
import { siteConfig } from "../config/siteConfig";
import useSystemSettings from "../hooks/useSystemSettings";

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
  const settings = useSystemSettings();
  const [activeSlide, setActiveSlide] = useState(0);
  const slide = slides[activeSlide];
  const [menuOpen, setMenuOpen] = useState(false);

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
            <img
              src={settings.company_logo}
              alt={`${settings.site_name} Logo`}
              style={logoImage}
            />
            <div>
              <h2 style={brandName}>{settings.site_name}</h2>
              <small style={brandTag}>{siteConfig.tagline}</small>
            </div>
          </div>

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            style={mobileMenuButton}
          >
            ☰
          </button>

          <div style={desktopNav}>
            <button onClick={() => (window.location.href = "/")} style={navButton}>
              Home
            </button>

            <button onClick={() => (window.location.href = "/about")} style={navButton}>
              About
            </button>

            <button onClick={() => (window.location.href = "/services")} style={navButton}>
              Services
            </button>

            <button onClick={() => (window.location.href = "/contact")} style={navButton}>
              Contact
            </button>

            <button onClick={onLoginClick} style={navButton}>
              Login
            </button>

            <button onClick={onRegisterClick} style={navPrimary}>
              Get Started
            </button>
          </div>

          {menuOpen && (
            <div style={mobileDropdown}>
              <button onClick={() => (window.location.href = "/")} style={mobileNavItem}>
                Home
              </button>

              <button onClick={() => (window.location.href = "/about")} style={mobileNavItem}>
                About
              </button>

              <button onClick={() => (window.location.href = "/services")} style={mobileNavItem}>
                Services
              </button>

              <button onClick={() => (window.location.href = "/contact")} style={mobileNavItem}>
                Contact
              </button>

              <button onClick={onLoginClick} style={mobileNavItem}>
                 Login
              </button>

              <button onClick={onRegisterClick} style={mobileNavPrimary}>
                 Get Started
              </button>
            </div>
          )}
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
        <Stat number="2.5M+" label="Active Users" />
        <Stat number="$10.8M+" label="Processed Deposits" />
        <Stat number="2M+" label="Investments Created" />
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

      <section style={section}>
  <h2 style={sectionTitle}>About {settings.site_name} Investments</h2>

  <div
    style={{
      maxWidth: "900px",
      margin: "0 auto",
      textAlign: "left",
      lineHeight: "1.9",
      color: "#cbd5e1",
      fontSize: "17px",
    }}
  >
    <p>
      {settings.site_name} is a digital asset investment platform designed to provide
      investors with access to professionally managed opportunities across
      multiple financial markets.
    </p>

    <p>
      Through strategic market participation, portfolio diversification,
      and disciplined risk management, our platform aims to help investors
      grow their capital while maintaining transparency and control over
      their investment activities.
    </p>

    <p>
      Members can monitor their account balances, track investment
      performance, submit deposits and withdrawals, and receive real-time
      notifications through a secure investor dashboard.
    </p>

    <p>
      Our mission is to provide a simple, reliable, and professional
      environment where individuals can participate in modern digital
      investment opportunities with confidence.
    </p>
  </div>
</section>

      <section style={section}>
        <h2 style={sectionTitle}>What Our Investors Say</h2>

        <div style={grid}>
          <Testimonial
            name="Michael Johnson"
            location="United States"
            text={`${settings.site_name} provides a straightforward investment experience with an excellent dashboard and responsive support.`}
           />

          <Testimonial
            name="Sarah Williams"
            location="United Kingdom"
            text="The platform is easy to navigate and gives me full visibility into my portfolio performance."
           />

          <Testimonial
            name="David Cooper"
            location="Canada"
            text="I appreciate the transparency and professional approach. Everything is organized and easy to understand."
           />
         </div>
      </section>

      <section style={darkSection}>
        <h2 style={sectionTitle}>Built for Security and Transparency</h2>

        <div style={grid}>
          <Card
            title="Account Protection"
            text="Email verification and secure authentication help protect every investor account."
          />

          <Card
            title="Transparent Activity"
            text="Users can track deposits, withdrawals, investments, balances, and notifications from one dashboard."
          />

          <Card
            title="Admin Review Process"
            text="Deposits, withdrawals, KYC requests, and investment activities are reviewed through secure admin controls."
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
        <h2 style={sectionTitle}>Why Choose {settings.site_name}</h2>
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
        <p style={heroText}>Create your {settings.site_name} account and access your dashboard in minutes.</p>
        <button onClick={onRegisterClick} style={primaryButton}>
          Get Started Now
        </button>
      </section>

      <footer style={footer}>
        <div style={footerBrand}>
         <img
           src={settings.company_logo}
           alt={`${settings.site_name} Logo`}
           style={logoImage}
         />
          <div>
            <h3 style={{ margin: 0 }}>{settings.site_name}</h3>
            <p style={footerText}>Premium digital asset portfolio platform.</p>
          </div>
        </div>

        <div style={footerLinks}>
          <button onClick={onRegisterClick} style={footerLink}>
            Create Account
          </button>

          <button onClick={onLoginClick} style={footerLink}>
            Login
          </button>

          <button
            onClick={() => (window.location.href = "/privacy-policy")}
            style={footerLink}
          >
            Privacy Policy
          </button>

          <button
            onClick={() => (window.location.href = "/terms")}
            style={footerLink}
          >
            Terms & Conditions
          </button>

          <button
            onClick={() => (window.location.href = "/risk-disclosure")}
            style={footerLink}
          >
             Risk Disclosure
          </button>

          <button
            onClick={() => (window.location.href = "/aml-policy")}
            style={footerLink}
          >
             AML Policy
          </button>

          <a href={`mailto:${settings.support_email}`} style={footerAnchor}>
            {settings.support_email}
          </a>
        </div>

        <p style={footerBottom}>
          © {new Date().getFullYear()} {settings.site_name}. All rights reserved.
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

function Testimonial({ name, location, text }) {
  return (
    <div className="fade-in" style={testimonialCard}>
      <div style={stars}>★★★★★</div>

      <p style={testimonialText}>
        "{text}"
      </p>

      <h4 style={{ marginBottom: "5px" }}>{name}</h4>

      <small style={{ color: "#94a3b8" }}>
        {location}
      </small>
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

const logoImage = {
  width: "60px",
  height: "60px",
  objectFit: "contain",
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

const testimonialCard = {
  background: "rgba(30,41,59,0.75)",
  padding: "28px",
  borderRadius: "18px",
  border: "1px solid rgba(255,255,255,0.08)",
  textAlign: "left",
  boxShadow: "0 20px 45px rgba(0,0,0,0.25)",
};

const testimonialText = {
  color: "#cbd5e1",
  lineHeight: "1.7",
  marginBottom: "18px",
};

const stars = {
  color: "#fbbf24",
  fontSize: "18px",
  marginBottom: "14px",
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

const desktopNav = {
  display: window.innerWidth < 768 ? "none" : "flex",
  alignItems: "center",
  gap: "12px",
};

const mobileMenuButton = {
  display: window.innerWidth < 768 ? "block" : "none",
  background: "transparent",
  border: "1px solid rgba(255,255,255,0.2)",
  color: "white",
  fontSize: "24px",
  borderRadius: "10px",
  padding: "8px 12px",
  cursor: "pointer",
};

const mobileDropdown = {
  position: "absolute",
  top: "70px",
  right: "20px",
  background: "rgba(2,6,23,0.98)",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: "14px",
  padding: "14px",
  width: "220px",
  display: "flex",
  flexDirection: "column",
  gap: "10px",
  zIndex: 100,
  boxShadow: "0 20px 50px rgba(0,0,0,0.45)",
};

const mobileNavItem = {
  background: "transparent",
  color: "#cbd5e1",
  border: "none",
  textAlign: "left",
  padding: "10px",
  cursor: "pointer",
  fontSize: "15px",
};

const mobileNavPrimary = {
  background: "#2563eb",
  color: "white",
  border: "none",
  padding: "12px",
  borderRadius: "10px",
  cursor: "pointer",
  fontWeight: "bold",
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
