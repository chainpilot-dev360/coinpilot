export default function Home() {
  return (
    <div style={styles.page}>
      <section style={styles.hero}>
        <h1 style={styles.title}>
          Modern Digital Investment Platform
        </h1>

        <p style={styles.subtitle}>
          Secure crypto investments, portfolio growth, and smart digital asset
          management for modern investors worldwide.
        </p>

        <div style={styles.buttonRow}>
          <button onClick={() => (window.location.href = "/")} style={styles.primaryBtn}>
            Get Started
          </button>

          <button onClick={() => (window.location.href = "/services")} style={styles.secondaryBtn}>
            Explore Services
          </button>
        </div>
      </section>

      <section style={styles.features}>
        <div style={styles.card}>
          <h3>Secure Investments</h3>

          <p>
            Protected infrastructure with monitored digital asset investment
            systems.
          </p>
        </div>

        <div style={styles.card}>
          <h3>Fast Withdrawals</h3>

          <p>
            Professional withdrawal processing with tracking references and
            admin approval.
          </p>
        </div>

        <div style={styles.card}>
          <h3>Portfolio Management</h3>

          <p>
            Track balances, investments, profits, and transaction history in
            real time.
          </p>
        </div>
      </section>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#050816",
    color: "white",
    padding: "40px 20px",
  },

  hero: {
    textAlign: "center",
    paddingTop: "100px",
    maxWidth: "900px",
    margin: "0 auto",
  },

  title: {
    fontSize: "56px",
    fontWeight: "bold",
    lineHeight: "1.2",
    marginBottom: "20px",
  },

  subtitle: {
    fontSize: "20px",
    opacity: 0.85,
    lineHeight: "1.7",
    marginBottom: "40px",
  },

  buttonRow: {
    display: "flex",
    justifyContent: "center",
    gap: "20px",
    flexWrap: "wrap",
  },

  primaryBtn: {
    background: "#2563eb",
    color: "white",
    padding: "14px 30px",
    borderRadius: "10px",
    textDecoration: "none",
    fontWeight: "bold",
  },

  secondaryBtn: {
    border: "1px solid #2563eb",
    color: "#2563eb",
    padding: "14px 30px",
    borderRadius: "10px",
    textDecoration: "none",
    fontWeight: "bold",
  },

  features: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "20px",
    marginTop: "100px",
  },

  card: {
    background: "#111827",
    padding: "30px",
    borderRadius: "16px",
    border: "1px solid #1f2937",
  },
};
