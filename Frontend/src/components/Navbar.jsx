export default function Navbar() {
  return (
    <nav style={{ display: "flex", justifyContent: "space-between", padding: "24px 40px", borderBottom: "1px solid #1e293b" }}>
      <h2>ChainPilot</h2>

      <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
        <span>Dashboard</span>
        <span>Markets</span>
        <span>Investments</span>
        <button style={{ background: "#2563eb", color: "white", border: "none", padding: "10px 16px", borderRadius: "8px" }}>
          Get Started
        </button>
      </div>
    </nav>
  );
}