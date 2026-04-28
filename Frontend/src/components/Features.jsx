const cardStyle = {
  background: "#1e293b",
  padding: "24px",
  borderRadius: "16px",
};

const muted = {
  color: "#cbd5e1",
};

export default function Features() {
  return (
    <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "20px", marginBottom: "60px" }}>
      <div style={cardStyle}>
        <h3>Portfolio Balance</h3>
        <p style={muted}>Track USD, EUR, BTC, and other assets in one dashboard.</p>
      </div>

      <div style={cardStyle}>
        <h3>Investment Plans</h3>
        <p style={muted}>View active investments, returns, and maturity dates.</p>
      </div>

      <div style={cardStyle}>
        <h3>Ledger History</h3>
        <p style={muted}>Every deposit, withdrawal, profit, and adjustment is recorded.</p>
      </div>
    </section>
  );
}