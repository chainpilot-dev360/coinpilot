import { useState } from "react";
import { siteConfig } from "../config/siteConfig";
export default function About() {
  const [menuOpen, setMenuOpen] = useState(false);
  
  return (
    <div style={styles.page}>
      <div style={styles.overlay}>
        <nav style={styles.nav}>
          <h2 style={styles.logo}>{siteConfig.siteName}</h2>

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            style={styles.mobileMenuButton}
          >
            ☰
          </button>

          <div style={styles.desktopNav}>
          <button onClick={() => (window.location.href = "/")} style={styles.navButton}>
            Home
          </button>

          <button onClick={() => (window.location.href = "/services")} style={styles.navButton}>
            Services
          </button>

            <button onClick={() => (window.location.href = "/contact")} style={styles.navButton}>
            Contact
          </button>
   </div>

  {menuOpen && (
    <div style={styles.mobileDropdown}>
      <button onClick={() => (window.location.href = "/")} style={styles.mobileNavItem}>
        Home
      </button>

      <button onClick={() => (window.location.href = "/services")} style={styles.mobileNavItem}>
        Services
      </button>
    </div>
  )}
</nav>

        <section style={styles.hero}>
          <h1 style={styles.title}>About {siteConfig.siteName}</h1>

          <p style={styles.subtitle}>
            {siteConfig.siteName} is a premium digital asset investment platform focused on
            helping users grow wealth through modern cryptocurrency investment
            strategies, portfolio management, and advanced financial technology.
          </p>
        </section>

        <section style={styles.section}>
          <div style={styles.card}>
            <h2>Who We Are</h2>

            <p>
              {siteConfig.siteName} was created to simplify digital investing for users
              around the world. We combine modern blockchain infrastructure,
              investment automation, and real-time analytics to provide a secure
              and transparent investment experience.
            </p>

            <p>
              Our platform supports cryptocurrency portfolio management,
              automated investment plans, secure wallet systems, and detailed
              account analytics for both beginner and advanced investors.
            </p>
          </div>

          <div style={styles.card}>
            <h2>Our Mission</h2>

            <p>
              Our mission is to make digital asset investing accessible,
              secure, and profitable for everyone by building a platform that
              combines innovation, transparency, and long-term financial growth.
            </p>

            <p>
              We aim to provide investors with a reliable ecosystem where they
              can manage assets confidently while benefiting from modern fintech
              solutions and strategic investment tools.
            </p>
          </div>

          <div style={styles.card}>
            <h2>Why Investors Choose Us</h2>

            <ul style={styles.list}>
              <li>Secure wallet and transaction system</li>
              <li>Professional investment management</li>
              <li>Automated investment growth tracking</li>
              <li>Transparent transaction monitoring</li>
              <li>Fast withdrawal processing</li>
              <li>24/7 customer support assistance</li>
              <li>Modern investment dashboard experience</li>
            </ul>
          </div>

          <div style={styles.card}>
            <h2>Global Investment Vision</h2>

            <p>
              {siteConfig.siteName} continues to expand its infrastructure to support
              investors globally with secure financial technology solutions,
              improved investment intelligence, and scalable digital asset
              management systems.
            </p>

            <p>
              We believe the future of finance belongs to secure decentralized
              technology combined with professional investment systems.
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
      "linear-gradient(rgba(2,6,23,0.88), rgba(2,6,23,0.95)), url('https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&w=1600&q=80')",
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

  section: {
    maxWidth: "1100px",
    margin: "0 auto",
    padding: "20px",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
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

  list: {
    paddingLeft: "20px",
    lineHeight: 2,
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
