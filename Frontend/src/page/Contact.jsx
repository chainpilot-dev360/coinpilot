import { useState } from "react";

export default function Contact() {
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

            <button
              onClick={() => (window.location.href = "/services")}
              style={styles.navButton}
            >
              Services
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

              <button
                onClick={() => (window.location.href = "/services")}
                style={styles.mobileNavItem}
              >
                Services
              </button>
            </div>
          )}
        </nav>

        <section style={styles.hero}>
          <h1 style={styles.title}>Contact Us</h1>

          <p style={styles.subtitle}>
            Our support and investment specialists are available to assist you
            with account management, investment guidance, withdrawals, and
            platform inquiries.
          </p>
        </section>

        <section style={styles.grid}>
          <div style={styles.card}>
            <h2>Email Support</h2>

            <p>
              support@chainpilot.com
            </p>

            <p>
              Contact our support team for account assistance and technical
              help.
            </p>
          </div>

          <div style={styles.card}>
            <h2>Investment Department</h2>

            <p>
              investments@chainpilot.com
            </p>

            <p>
              Reach our investment specialists for portfolio and growth
              consultations.
            </p>
          </div>

          <div style={styles.card}>
            <h2>Global Availability</h2>

            <p>
              ChainPilot operates globally and supports investors from multiple
              regions worldwide.
            </p>
          </div>

          <div style={styles.card}>
            <h2>24/7 Client Support</h2>

            <p>
              Our customer support infrastructure is designed to assist users at
              all times with fast response handling.
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
      "linear-gradient(rgba(2,6,23,0.88), rgba(2,6,23,0.95)), url('https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=1600&q=80')",
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
    maxWidth: "1100px",
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
