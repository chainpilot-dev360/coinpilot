import { useState } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

function ResetPassword() {
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  async function resetPassword() {
    try {
      const params = new URLSearchParams(window.location.search);
      const token = params.get("token");

      if (!token) {
        setMessage("Reset token is missing.");
        return;
      }

      const res = await axios.post(`${API_URL}/api/auth/reset-password`, {
        token,
        password,
      });

      setMessage(res.data.message || "Password reset successful.");
    } catch (error) {
      setMessage(error.response?.data?.message || "Password reset failed.");
    }
  }

  return (
    <div style={page}>
      <div style={card}>
        <h1>Reset Password</h1>
        <p style={text}>Enter your new password below.</p>

        <input
          type="password"
          placeholder="New password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={input}
        />

        <button onClick={resetPassword} style={button}>
          Reset Password
        </button>

        {message && <p style={text}>{message}</p>}

        <button onClick={() => (window.location.href = "/")} style={backButton}>
          Back to Login
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
};

const text = {
  color: "#94a3b8",
};

const input = {
  width: "100%",
  padding: "12px",
  marginBottom: "12px",
  borderRadius: "10px",
  border: "1px solid #334155",
  background: "#020617",
  color: "white",
  boxSizing: "border-box",
};

const button = {
  padding: "12px 18px",
  background: "#2563eb",
  color: "white",
  border: "none",
  borderRadius: "10px",
  cursor: "pointer",
  width: "100%",
};

const backButton = {
  marginTop: "14px",
  background: "transparent",
  color: "#94a3b8",
  border: "none",
  cursor: "pointer",
};

export default ResetPassword;