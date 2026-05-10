import { useState } from "react";
export default function Services() {
  const [menuOpen, setMenuOpen] = useState(false);
  
  return (
    <div style={styles.page}>
      <div style={styles.overlay}>
        <nav style={styles.nav}>
  <h2 style={styles.logo}>ChainPilot</h2>

  <button
    onClick={() => setMenuOpen(!menuOpen)}
    style={styles.mobileMenuButton}
  >
    ☰
  </button>

  <div style={styles.desktopNav}>
    <button
      onClick={() => (window.location.href = "/")}
      style={styles.navButton}
    >
      Home
    </button>

    <button
      onClick={() => (window.location.href = "/about")}
      style={styles.navButton}
    >
      About
    </button>
  </div>

  {menuOpen && (
    <div style={styles.mobileDropdown}>
      <button
        onClick={() => (window.location.href = "/")}
        style={styles.mobileNavItem}
      >
        Home
      </button>

      <button
        onClick={() => (window.location.href = "/about")}
        style={styles.mobileNavItem}
      >
        About
      </button>
    </div>
  )}
</nav>

        <section style={styles.hero}>
          <h1 style={styles.title}>Our Services</h1>

          <p style={styles.subtitle}>
            ChainPilot provides advanced digital investment solutions designed
            for modern investors seeking secure portfolio growth and financial
            technology innovation.
          </p>
        </section>

        <section style={styles.grid}>
          <div style={styles.card}>
            <h2>Crypto Investment Plans</h2>
            <p>
              Access professionally managed cryptocurrency investment plans with
              structured returns and long-term portfolio growth strategies.
            </p>
          </div>

          <div style={styles.card}>
            <h2>Portfolio Analytics</h2>
            <p>
              Monitor account performance, asset growth, deposits,
              withdrawals, and investment history through real-time analytics.
            </p>
          </div>

          <div style={styles.card}>
            <h2>Automated Investment System</h2>
            <p>
              Our automated infrastructure processes investment cycles,
              maturity tracking, and balance management securely and efficiently.
            </p>
          </div>

          <div style={styles.card}>
            <h2>Secure Wallet Infrastructure</h2>
            <p>
              ChainPilot provides secure wallet architecture with protected
              transaction processing and advanced account management systems.
            </p>
          </div>

          <div style={styles.card}>
            <h2>Fast Withdrawal Processing</h2>
            <p>
              Investors benefit from transparent withdrawal systems with
              transaction references and real-time administrative processing.
            </p>
          </div>

          <div style={styles.card}>
            <h2>24/7 Client Support</h2>
            <p>
              Our support infrastructure helps investors receive assistance
              quickly while maintaining smooth investment operations globally.
            </p>
          </div>

          <div style={styles.card}>
            <h2>Investment Security</h2>
            <p>
              We implement secure authentication systems, encrypted APIs, and
              protected account structures to maintain investor safety.
            </p>
          </div>

          <div style={styles.card}>
            <h2>Financial Growth Solutions</h2>
            <p>
              ChainPilot helps users build long-term digital asset wealth
              through strategic investment management and scalable financial
              technology systems.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    backgroundImage:
      "linear-gradient(rgba(2,6,23,0.88), rgba(2,6,23,0.95)), url('https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1600&q=80')",
    backgroundSize: "cover",
    backgroundPosition: "center",
    color: "white",
    fontFamily: "Arial, sans-serif",
  },

  overlay: {
    minHeight: "100vh",
    paddingBottom: "60px",
  },

  nav: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "24px",
    flexWrap: "wrap",
  },

  logo: {
    margin: 0,
  },

  navButton: {
    background: "transparent",
    border: "none",
    color: "white",
    cursor: "pointer",
    marginLeft: "14px",
    fontSize: "15px",
  },

  hero: {
    textAlign: "center",
    padding: "70px 20px 40px",
    maxWidth: "900px",
    margin: "0 auto",
  },

  title: {
    fontSize: "52px",
    marginBottom: "20px",
  },

  subtitle: {
    color: "#cbd5e1",
    fontSize: "18px",
    lineHeight: 1.8,
  },

  grid: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "20px",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "24px",
  },

  card: {
    background: "rgba(15,23,42,0.82)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "18px",
    padding: "28px",
    lineHeight: 1.8,
    boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
  },

  desktopNav: {
  display: window.innerWidth < 768 ? "none" : "flex",
  alignItems: "center",
  gap: "14px",
},

mobileMenuButton: {
  display: window.innerWidth < 768 ? "block" : "none",
  background: "transparent",
  border: "1px solid rgba(255,255,255,0.2)",
  color: "white",
  fontSize: "24px",
  borderRadius: "10px",
  padding: "8px 12px",
  cursor: "pointer",
},

mobileDropdown: {
  position: "absolute",
  top: "70px",
  right: "20px",
  background: "rgba(2,6,23,0.98)",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: "14px",
  padding: "14px",
  width: "200px",
  display: "flex",
  flexDirection: "column",
  gap: "10px",
  zIndex: 100,
},

mobileNavItem: {
  background: "transparent",
  color: "#cbd5e1",
  border: "none",
  textAlign: "left",
  padding: "10px",
  cursor: "pointer",
  fontSize: "15px",
},
};
