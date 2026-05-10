export default function Services() {
  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h1 style={styles.title}>Our Services</h1>

        <div style={styles.grid}>
          <div style={styles.card}>
            <h3>Crypto Investments</h3>

            <p>
              Flexible digital investment plans with monitored portfolio growth
              and analytics.
            </p>
          </div>

          <div style={styles.card}>
            <h3>Portfolio Management</h3>

            <p>
              Track deposits, withdrawals, balances, profits, and investments in
              real time.
            </p>
          </div>

          <div style={styles.card}>
            <h3>KYC Verification</h3>

            <p>
              Secure identity verification system for safer platform operations.
            </p>
          </div>

          <div style={styles.card}>
            <h3>Fast Withdrawals</h3>

            <p>
              Withdrawal approval system with transaction references and admin
              monitoring.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#050816",
    color: "white",
    padding: "60px 20px",
  },

  container: {
    maxWidth: "1100px",
    margin: "0 auto",
  },

  title: {
    fontSize: "48px",
    textAlign: "center",
    marginBottom: "50px",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "20px",
  },

  card: {
    background: "#111827",
    padding: "30px",
    borderRadius: "16px",
    border: "1px solid #1f2937",
  },
};
