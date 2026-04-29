import { useEffect, useState } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

function VerifyEmail({ onLoginClick }) {
  const [message, setMessage] = useState("Verifying your email...");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    verifyEmail();
  }, []);

  async function verifyEmail() {
    try {
      const params = new URLSearchParams(window.location.search);
      const token = params.get("token");

      if (!token) {
        setMessage("Verification token is missing.");
        setSuccess(false);
        return;
      }

      const res = await axios.get(`${API_URL}/api/auth/verify-email?token=${token}`);

      setMessage(res.data.message || "Email verified successfully.");
      setSuccess(true);
    } catch (error) {
      setMessage(error.response?.data?.message || "Email verification failed.");
      setSuccess(false);
    }
  }

  return (
    <div style={page}>
      <div style={card}>
        <h1>{success ? "Email Verified ✅" : "Verification Failed"}</h1>

        <p style={text}>{message}</p>

        <button
  onClick={() => {
    window.location.href = "/";
  }}
  style={button}
>
  Go to Login
</button>
      </div>
    </div>
  );
}

const page = {
  minHeight: "100vh",
  background: "#0f172a",
  color: "white",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "20px",
};

const card = {
  maxWidth: "420px",
  width: "100%",
  background: "#111827",
  padding: "32px",
  borderRadius: "18px",
  textAlign: "center",
  boxShadow: "0 20px 60px rgba(0,0,0,0.35)",
};

const text = {
  color: "#94a3b8",
  lineHeight: "1.6",
};

const button = {
  marginTop: "20px",
  padding: "12px 18px",
  background: "#2563eb",
  color: "white",
  border: "none",
  borderRadius: "10px",
  cursor: "pointer",
};

export default VerifyEmail;