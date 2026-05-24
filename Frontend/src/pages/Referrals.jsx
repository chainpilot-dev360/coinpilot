import { useEffect, useState } from "react";
import axios from "axios";

export default function Referrals() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    fetchReferralData();
  }, []);

  async function fetchReferralData() {
    try {
      const token = localStorage.getItem("token");

      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/referrals/me`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setData(response.data);
    } catch (error) {
      console.error("Failed to load referrals:", error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div style={{ padding: "20px", color: "white" }}>
        Loading referrals...
      </div>
    );
  }

  return (
    <div style={{ padding: "20px", color: "white" }}>
      <h1>Referral Dashboard</h1>

      <div
        style={{
          background: "#111827",
          padding: "20px",
          borderRadius: "12px",
          marginBottom: "20px",
        }}
      >
        <h2>Your Referral Code</h2>

        <p
          style={{
            fontSize: "24px",
            fontWeight: "bold",
            color: "#22c55e",
          }}
        >
          {data?.user?.referral_code}
        </p>

        <button
          onClick={() => {
            navigator.clipboard.writeText(data?.user?.referral_code || "");
            alert("Referral code copied");
          }}
          style={{
            background: "#2563eb",
            color: "white",
            border: "none",
            padding: "10px 14px",
            borderRadius: "10px",
            cursor: "pointer",
            marginTop: "10px",
          }}
         >
          Copy Referral Code
         </button>

        <p style={{ marginTop: "20px" }}>Your Referral Link</p>

        <p
          style={{
            background: "#020617",
            padding: "12px",
            borderRadius: "10px",
            wordBreak: "break-all",
            color: "#38bdf8",
          }}
        >
          {`${window.location.origin}/?ref=${data?.user?.referral_code}`}
        </p>

        <button
          onClick={() => {
            navigator.clipboard.writeText(
               `${window.location.origin}/?ref=${data?.user?.referral_code}`
            );
            alert("Referral link copied");
           }}
           style={{
             background: "#16a34a",
             color: "white",
             border: "none",
             padding: "10px 14px",
             borderRadius: "10px",
             cursor: "pointer",
             marginTop: "10px",
            }}
          >
            Copy Referral Link
        </button>

        <p>Total Referral Earnings</p>

        <h2>
          ${Number(data?.totalEarnings || 0).toFixed(2)}
        </h2>
      </div>

      <div
        style={{
          background: "#111827",
          padding: "20px",
          borderRadius: "12px",
          marginBottom: "20px",
        }}
      >
        <h2>Referred Users</h2>

        {data?.referredUsers?.length === 0 ? (
          <p>No referrals yet.</p>
        ) : (
          data?.referredUsers?.map((user) => (
            <div
              key={user.id}
              style={{
                padding: "12px",
                borderBottom: "1px solid #374151",
              }}
            >
              <p>{user.username}</p>
              <p>{user.email}</p>
            </div>
          ))
        )}
      </div>

      <div
        style={{
          background: "#111827",
          padding: "20px",
          borderRadius: "12px",
        }}
      >
        <h2>Referral Earnings History</h2>

        {data?.earnings?.length === 0 ? (
          <p>No referral earnings yet.</p>
        ) : (
          data?.earnings?.map((earning) => (
            <div
              key={earning.id}
              style={{
                padding: "12px",
                borderBottom: "1px solid #374151",
              }}
            >
              <p>
                {earning.amount} {earning.currency}
              </p>

              <p>{earning.source}</p>

              <p>{earning.status}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
