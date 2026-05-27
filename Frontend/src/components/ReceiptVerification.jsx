import { useState } from "react";

export default function ReceiptVerification() {
  const [reference, setReference] = useState("");
  const [result, setResult] = useState(null);

  const handleVerify = async () => {
  try {
    setResult(null);

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/api/verify-receipt/${reference}`
    );

    const data = await response.json();

    if (data.valid) {
      setResult({
        success: true,
        data: data.receipt,
      });
    } else {
      setResult({
        success: false,
      });
    }
  } catch (error) {
    console.error("Receipt verification failed:", error);
    setResult({
      success: false,
    });
  }
};

  return (
    <div style={page}>
      <div style={card}>
        <h1 style={title}>
          Receipt Verification
        </h1>

        <p style={subtitle}>
          Verify CoinPilot transaction receipts
        </p>

        <input
          type="text"
          placeholder="Enter Receipt ID"
          value={reference}
          onChange={(e) =>
            setReference(e.target.value)
          }
          style={input}
        />

        <button
          onClick={handleVerify}
          style={button}
        >
          Verify Receipt
        </button>

        {result && result.success && (
          <div style={successBox}>
            <h3>Receipt Verified</h3>

            <p>
              <strong>Amount:</strong>{" "}
              {result.data.amount}
            </p>

            <p>
              <strong>Status:</strong>{" "}
              {result.data.status}
            </p>

            <p>
              <strong>Reference:</strong>{" "}
              {result.data.reference ||
                result.data.receipt_reference}
            </p>

            <p>
              <strong>Date:</strong>{" "}
              {new Date(
                result.data.created_at
              ).toLocaleString()}
            </p>
          </div>
        )}

        {result && !result.success && (
          <div style={errorBox}>
            Invalid or unrecognized receipt.
          </div>
        )}
      </div>
    </div>
  );
}

const page = {
  minHeight: "100vh",
  background: "#f1f5f9",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  padding: "20px",
};

const card = {
  background: "#fff",
  width: "450px",
  padding: "35px",
  borderRadius: "18px",
  boxShadow:
    "0 10px 25px rgba(0,0,0,0.08)",
};

const title = {
  margin: 0,
  color: "#0f172a",
};

const subtitle = {
  color: "#64748b",
  marginBottom: "25px",
};

const input = {
  width: "100%",
  padding: "14px",
  borderRadius: "10px",
  border: "1px solid #cbd5e1",
  marginBottom: "15px",
};

const button = {
  width: "100%",
  padding: "14px",
  border: "none",
  background: "#0f172a",
  color: "#fff",
  borderRadius: "10px",
  fontWeight: "bold",
  cursor: "pointer",
};

const successBox = {
  marginTop: "25px",
  background: "#ecfdf5",
  border: "1px solid #86efac",
  padding: "18px",
  borderRadius: "12px",
  color: "#166534",
};

const errorBox = {
  marginTop: "25px",
  background: "#fef2f2",
  border: "1px solid #fca5a5",
  padding: "18px",
  borderRadius: "12px",
  color: "#991b1b",
};
