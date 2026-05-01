import { useEffect, useState } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

function KycPanel({ token, user }) {
  const [kyc, setKyc] = useState(null);
  const [fullName, setFullName] = useState(user?.full_name || "");
  const [country, setCountry] = useState(user?.country || "");
  const [idType, setIdType] = useState("");
  const [idNumber, setIdNumber] = useState("");
  const [documentUrl, setDocumentUrl] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadKyc();
  }, []);

  async function loadKyc() {
    try {
      const res = await axios.get(`${API_URL}/api/kyc/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setKyc(res.data);
    } catch {
      setMessage("Failed to load KYC status");
    }
  }

  async function submitKyc() {
    try {
      const res = await axios.post(
        `${API_URL}/api/kyc/submit`,
        { fullName, country, idType, idNumber, documentUrl },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessage(res.data.message);
      loadKyc();
    } catch (error) {
      setMessage(error.response?.data?.message || "KYC submission failed");
    }
  }

  if (kyc) {
    return (
      <div style={card}>
        <h3>KYC Verification</h3>
        <p><strong>Status:</strong> <span style={badge(kyc.status)}>{kyc.status}</span></p>
        <p><strong>Full Name:</strong> {kyc.full_name}</p>
        <p><strong>Country:</strong> {kyc.country}</p>
        <p><strong>ID Type:</strong> {kyc.id_type}</p>
        <p><strong>ID Number:</strong> {kyc.id_number}</p>
        {kyc.admin_note && <p><strong>Admin Note:</strong> {kyc.admin_note}</p>}
      </div>
    );
  }

  return (
    <div style={card}>
      <h3>KYC Verification</h3>
      <p style={muted}>Submit your identity details for account verification.</p>

      <input placeholder="Full Name *" value={fullName} onChange={(e) => setFullName(e.target.value)} style={input} />
      <input placeholder="Country *" value={country} onChange={(e) => setCountry(e.target.value)} style={input} />

      <select value={idType} onChange={(e) => setIdType(e.target.value)} style={input}>
        <option value="">-- Select ID Type * --</option>
        <option value="Passport">Passport</option>
        <option value="National ID">National ID</option>
        <option value="Driver License">Driver License</option>
        <option value="Voter Card">Voter Card</option>
      </select>

      <input placeholder="ID Number *" value={idNumber} onChange={(e) => setIdNumber(e.target.value)} style={input} />
      <input placeholder="Document URL / uploaded file link" value={documentUrl} onChange={(e) => setDocumentUrl(e.target.value)} style={input} />

      <button onClick={submitKyc} style={button}>Submit KYC</button>

      {message && <p style={muted}>{message}</p>}
    </div>
  );
}

const badge = (status) => ({
  background: status === "APPROVED" ? "#16a34a" : status === "REJECTED" ? "#dc2626" : "#ca8a04",
  color: "white",
  padding: "5px 10px",
  borderRadius: "999px",
  fontSize: "12px",
  fontWeight: "bold",
});

const card = {
  background: "rgba(30, 41, 59, 0.65)",
  padding: "16px",
  borderRadius: "14px",
  marginBottom: "18px",
  border: "1px solid rgba(255,255,255,0.08)",
};

const input = {
  display: "block",
  width: "100%",
  maxWidth: "420px",
  padding: "12px",
  marginBottom: "12px",
  borderRadius: "10px",
  border: "1px solid #334155",
  background: "#020617",
  color: "white",
};

const button = {
  padding: "12px 16px",
  background: "#2563eb",
  color: "white",
  border: "none",
  borderRadius: "10px",
  cursor: "pointer",
};

const muted = { color: "#94a3b8" };

export default KycPanel;