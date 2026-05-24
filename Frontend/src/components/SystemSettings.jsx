import { useEffect, useState } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

export default function SystemSettings({ token }) {
  const [settings, setSettings] = useState({
    site_name: "",
    company_short_name: "",
    support_email: "",
    investment_email: "",
    btc_wallet: "",
    eth_wallet: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    try {
      const res = await axios.get(`${API_URL}/api/admin/system-settings`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setSettings({
        site_name: res.data.site_name || "",
        company_short_name: res.data.company_short_name || "",
        support_email: res.data.support_email || "",
        investment_email: res.data.investment_email || "",
        btc_wallet: res.data.btc_wallet || "",
        eth_wallet: res.data.eth_wallet || "",
      });
    } catch (error) {
      alert(error.response?.data?.message || "Failed to load system settings");
    } finally {
      setLoading(false);
    }
  }

  async function saveSettings() {
    try {
      setSaving(true);

      await axios.put(`${API_URL}/api/admin/system-settings`, settings, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      alert("System settings saved successfully");
    } catch (error) {
      alert(error.response?.data?.message || "Failed to save system settings");
    } finally {
      setSaving(false);
    }
  }

  function updateField(field, value) {
    setSettings((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  if (loading) {
    return <div style={card}>Loading system settings...</div>;
  }

  return (
    <div style={card}>
      <h2>System Settings</h2>

      <p style={muted}>
        Manage platform branding, support emails, and deposit wallet addresses.
      </p>

      <label style={label}>Platform Name</label>
      <input
        value={settings.site_name}
        onChange={(e) => updateField("site_name", e.target.value)}
        style={input}
      />

      <label style={label}>Short Brand Name</label>
      <input
        value={settings.company_short_name}
        onChange={(e) => updateField("company_short_name", e.target.value)}
        style={input}
      />

      <label style={label}>Support Email</label>
      <input
        value={settings.support_email}
        onChange={(e) => updateField("support_email", e.target.value)}
        style={input}
      />

      <label style={label}>Investment Email</label>
      <input
        value={settings.investment_email}
        onChange={(e) => updateField("investment_email", e.target.value)}
        style={input}
      />

      <label style={label}>BTC Wallet Address</label>
      <input
        value={settings.btc_wallet}
        onChange={(e) => updateField("btc_wallet", e.target.value)}
        style={input}
      />

      <label style={label}>ETH Wallet Address</label>
      <input
        value={settings.eth_wallet}
        onChange={(e) => updateField("eth_wallet", e.target.value)}
        style={input}
      />

      <button onClick={saveSettings} style={button} disabled={saving}>
        {saving ? "Saving..." : "Save Settings"}
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
  marginBottom: "24px",
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
