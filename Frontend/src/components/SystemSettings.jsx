import { useState } from "react";

export default function SystemSettings() {
  const [siteName, setSiteName] = useState("ChainPilot");
  const [companyShortName, setCompanyShortName] = useState("CPX");
  const [supportEmail, setSupportEmail] = useState("support@chainpilot.com");
  const [investmentEmail, setInvestmentEmail] = useState(
    "investments@chainpilot.com"
  );
  const [btcWallet, setBtcWallet] = useState(
    "bc1qkqwr63l6x3rqskej75sqxvx74eew9w5smfn4p8"
  );
  const [ethWallet, setEthWallet] = useState(
    "0xd420b9bb7969b6c403e1e774be1d36fdb9c76aa3"
  );

  function saveSettings() {
    alert(
      "Settings UI ready. Next step: connect this form to backend/database."
    );
  }

  return (
    <div style={card}>
      <h2>System Settings</h2>

      <p style={muted}>
        Manage platform branding, support emails, and deposit wallet addresses.
      </p>

      <label style={label}>Platform Name</label>
      <input
        value={siteName}
        onChange={(e) => setSiteName(e.target.value)}
        style={input}
      />

      <label style={label}>Short Brand Name</label>
      <input
        value={companyShortName}
        onChange={(e) => setCompanyShortName(e.target.value)}
        style={input}
      />

      <label style={label}>Support Email</label>
      <input
        value={supportEmail}
        onChange={(e) => setSupportEmail(e.target.value)}
        style={input}
      />

      <label style={label}>Investment Email</label>
      <input
        value={investmentEmail}
        onChange={(e) => setInvestmentEmail(e.target.value)}
        style={input}
      />

      <label style={label}>BTC Wallet Address</label>
      <input
        value={btcWallet}
        onChange={(e) => setBtcWallet(e.target.value)}
        style={input}
      />

      <label style={label}>ETH Wallet Address</label>
      <input
        value={ethWallet}
        onChange={(e) => setEthWallet(e.target.value)}
        style={input}
      />

      <button onClick={saveSettings} style={button}>
        Save Settings
      </button>
    </div>
  );
}

const card = {
  background: "#1e293b",
  padding: "24px",
  borderRadius: "16px",
  border: "1px solid rgba(255,255,255,0.08)",
  color: "white",
};

const muted = {
  color: "#94a3b8",
  marginBottom: "20px",
};

const label = {
  display: "block",
  marginBottom: "6px",
  color: "#cbd5e1",
  fontWeight: "bold",
};

const input = {
  display: "block",
  width: "100%",
  maxWidth: "520px",
  padding: "12px",
  marginBottom: "16px",
  borderRadius: "10px",
  border: "1px solid #334155",
  background: "#020617",
  color: "white",
};

const button = {
  background: "#2563eb",
  color: "white",
  border: "none",
  padding: "12px 18px",
  borderRadius: "10px",
  cursor: "pointer",
  fontWeight: "bold",
};
