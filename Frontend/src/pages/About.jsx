export default function About() {
  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h1 style={styles.title}>About Us</h1>

        <p style={styles.text}>
          We are a modern digital investment platform focused on secure crypto
          asset management, investment growth, and transparent financial
          operations.
        </p>

        <p style={styles.text}>
          Our mission is to provide users worldwide with secure and scalable
          digital investment opportunities backed by professional portfolio
          monitoring systems.
        </p>

        <div style={styles.grid}>
          <div style={styles.card}>
            <h3>Security</h3>

            <p>
              Advanced protection systems for transactions, balances, and
              digital assets.
            </p>
          </div>

          <div style={styles.card}>
            <h3>Transparency</h3>

            <p>
              Clear tracking of investments, withdrawals, deposits, and
              portfolio performance.
            </p>
          </div>

          <div style={styles.card}>
            <h3>Growth</h3>

            <p>
              Scalable investment opportunities designed for both beginners and
              advanced investors.
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
    maxWidth: "1000px",
    margin: "0 auto",
  },

  title: {
    fontSize: "48px",
    marginBottom: "30px",
  },

  text: {
    fontSize: "18px",
    lineHeight: "1.8",
    opacity: 0.9,
    marginBottom: "20px",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "20px",
    marginTop: "60px",
  },

  card: {
    background: "#111827",
    padding: "30px",
    borderRadius: "16px",
    border: "1px solid #1f2937",
  },
};
