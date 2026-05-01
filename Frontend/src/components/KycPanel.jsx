import { useEffect, useState } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

function KycPanel({ token, user }) {
  const [kyc, setKyc] = useState(null);
  const [fullName, setFullName] = useState(user?.full_name || "");
  const [country, setCountry] = useState(user?.country || "");
  const [idType, setIdType] = useState("");
  const [idNumber, setIdNumber] = useState("");
  const [documentFile, setDocumentFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
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

  function handleDocumentChange(e) {
    const file = e.target.files[0];

    setDocumentFile(file);

    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setPreviewUrl("");
    }
  }

  async function submitKyc() {
    try {
      const formData = new FormData();

      formData.append("fullName", fullName);
      formData.append("country", country);
      formData.append("idType", idType);
      formData.append("idNumber", idNumber);

      if (documentFile) {
        formData.append("document", documentFile);
      }

      const res = await axios.post(`${API_URL}/api/kyc/submit`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setMessage(res.data.message);
      loadKyc();
    } catch (error) {
      setMessage(error.response?.data?.message || "KYC submission failed");
    }
  }

  function getDocumentUrl(url) {
    if (!url) return null;
    if (url.startsWith("http")) return url;
    return `${API_URL}${url}`;
  }

  if (kyc) {
    const approved = kyc.status === "APPROVED";
    const rejected = kyc.status === "REJECTED";
    const documentLink = getDocumentUrl(kyc.document_url);

    return (
      <div style={card}>
        <div style={headerRow}>
          <div>
            <h3 style={{ marginBottom: 4 }}>Identity Verification</h3>
            <p style={muted}>
              {approved
                ? "Your account is verified. Withdrawals are unlocked."
                : rejected
                ? "Your KYC was rejected. Please contact support or resubmit when enabled."
                : "Your KYC is under review. Withdrawals remain locked until approval."}
            </p>
          </div>

          <span style={badge(kyc.status)}>
            {approved ? "✅ Approved" : rejected ? "❌ Rejected" : "⏳ Pending"}
          </span>
        </div>

        <div style={infoGrid}>
          <Info label="Full Name" value={kyc.full_name} />
          <Info label="Country" value={kyc.country} />
          <Info label="ID Type" value={kyc.id_type} />
          <Info label="ID Number" value={kyc.id_number} />
        </div>

        {documentLink && (
          <div style={documentBox}>
            <strong>Submitted Document</strong>

            <a
              href={documentLink}
              target="_blank"
              rel="noreferrer"
              style={documentLinkStyle}
            >
              Open Document
            </a>

            <img
              src={documentLink}
              alt="KYC document"
              style={submittedImage}
            />
          </div>
        )}

        {kyc.admin_note && (
          <div style={noteBox}>
            <strong>Admin Note</strong>
            <p>{kyc.admin_note}</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={card}>
      <div style={headerRow}>
        <div>
          <h3 style={{ marginBottom: 4 }}>Identity Verification</h3>
          <p style={muted}>
            Complete KYC to unlock withdrawals and improve account trust.
          </p>
        </div>

        <span style={badge("NOT_SUBMITTED")}>Not Submitted</span>
      </div>

      <input
        placeholder="Full Name *"
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
        style={input}
      />

      <input
        placeholder="Country *"
        value={country}
        onChange={(e) => setCountry(e.target.value)}
        style={input}
      />

      <select
        value={idType}
        onChange={(e) => setIdType(e.target.value)}
        style={input}
      >
        <option value="">-- Select ID Type * --</option>
        <option value="Passport">Passport</option>
        <option value="National ID">National ID</option>
        <option value="Driver License">Driver License</option>
        <option value="Voter Card">Voter Card</option>
      </select>

      <input
        placeholder="ID Number *"
        value={idNumber}
        onChange={(e) => setIdNumber(e.target.value)}
        style={input}
      />

      <label style={uploadLabel}>Upload ID Document *</label>

      <input
        type="file"
        accept="image/*"
        onChange={handleDocumentChange}
        style={{ marginBottom: "12px", color: "white" }}
      />

      {previewUrl && (
        <div style={previewBox}>
          <p style={muted}>Document Preview:</p>
          <img src={previewUrl} alt="Document preview" style={submittedImage} />
        </div>
      )}

      <button onClick={submitKyc} style={button}>
        Submit KYC for Review
      </button>

      {message && <p style={muted}>{message}</p>}
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div style={infoBox}>
      <small>{label}</small>
      <strong>{value || "N/A"}</strong>
    </div>
  );
}

const badge = (status) => {
  const clean = String(status || "").toUpperCase();

  const background =
    clean === "APPROVED"
      ? "#16a34a"
      : clean === "REJECTED"
      ? "#dc2626"
      : clean === "PENDING"
      ? "#ca8a04"
      : "#334155";

  return {
    background,
    color: "white",
    padding: "7px 11px",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: "bold",
    whiteSpace: "nowrap",
  };
};

const card = {
  background: "linear-gradient(135deg, rgba(30,41,59,0.85), rgba(2,6,23,0.9))",
  padding: "18px",
  borderRadius: "16px",
  marginBottom: "22px",
  border: "1px solid rgba(255,255,255,0.1)",
};

const headerRow = {
  display: "flex",
  justifyContent: "space-between",
  gap: "14px",
  alignItems: "flex-start",
  flexWrap: "wrap",
  marginBottom: "16px",
};

const infoGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
  gap: "12px",
};

const infoBox = {
  background: "#020617",
  padding: "12px",
  borderRadius: "12px",
  border: "1px solid #334155",
};

const documentBox = {
  background: "#020617",
  padding: "12px",
  borderRadius: "12px",
  border: "1px solid #334155",
  marginTop: "14px",
};

const documentLinkStyle = {
  display: "inline-block",
  marginTop: "10px",
  marginBottom: "10px",
  color: "#38bdf8",
  textDecoration: "none",
};

const submittedImage = {
  display: "block",
  width: "100%",
  maxWidth: "320px",
  maxHeight: "240px",
  objectFit: "cover",
  borderRadius: "12px",
  border: "1px solid #334155",
};

const noteBox = {
  background: "#020617",
  padding: "12px",
  borderRadius: "12px",
  border: "1px solid #334155",
  marginTop: "14px",
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

const uploadLabel = {
  display: "block",
  color: "#cbd5e1",
  marginBottom: "8px",
};

const previewBox = {
  marginBottom: "14px",
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