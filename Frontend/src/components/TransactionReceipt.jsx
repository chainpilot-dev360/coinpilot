const COMPANY = {
  name: "CoinPilot",
  tagline: "Digital Investment Platform",
  logo: "https://res.cloudinary.com/dlvtuijb1/image/upload/v1779874195/WhatsApp_Image_2026-05-27_at_10.29.15_AM_llqpmg.jpg",
  website: "www.coinpilot.com",
  email: "coinpilot@gmail.com",
  phone: "+1552174458",
  address: "125 Jefferson Avenue, Austin TX, USA",
  registration: "C1234567",
  ceo: "Peter Woods",
  currency: "USD",
};

export default function TransactionReceipt({
  type = "Deposit",
  user = {},
  transaction = {},
}) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      style={{
        background: "#f4f7fb",
        minHeight: "100vh",
        padding: "40px",
        fontFamily: "Arial",
      }}
    >
      <div
        style={{
          maxWidth: "900px",
          margin: "0 auto",
          background: "#fff",
          padding: "40px",
          borderRadius: "20px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
        }}
      >
        {/* HEADER */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            borderBottom: "3px solid #2563eb",
            paddingBottom: "20px",
          }}
        >
          <div style={{ display: "flex", gap: "20px" }}>
            <img
              src={COMPANY.logo}
              alt="logo"
              style={{
                width: "100px",
                height: "100px",
                borderRadius: "20px",
                objectFit: "cover",
              }}
            />

            <div>
              <h1 style={{ margin: 0, color: "#0f172a" }}>
                {COMPANY.name}
              </h1>

              <h3 style={{ margin: "10px 0", color: "#2563eb" }}>
                {COMPANY.tagline}
              </h3>

              <p style={{ color: "#475569" }}>
                Secure. Transparent. Profitable.
              </p>
            </div>
          </div>

          <div style={{ textAlign: "right", color: "#334155" }}>
            <p>{COMPANY.website}</p>
            <p>{COMPANY.email}</p>
            <p>{COMPANY.phone}</p>
            <p>{COMPANY.address}</p>
          </div>
        </div>

        {/* TITLE */}
        <div
          style={{
            marginTop: "40px",
            marginBottom: "30px",
          }}
        >
          <h1 style={{ color: "#1e293b" }}>
            {type.toUpperCase()} RECEIPT
          </h1>

          <p style={{ color: "#64748b" }}>
            Official transaction confirmation
          </p>
        </div>

        {/* CUSTOMER DETAILS */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "20px",
            marginBottom: "30px",
          }}
        >
          <div
            style={{
              border: "1px solid #e2e8f0",
              borderRadius: "12px",
              padding: "20px",
            }}
          >
            <h3 style={{ color: "#2563eb" }}>
              Customer Details
            </h3>

            <p>
              <strong>Name:</strong> {user.full_name}
            </p>

            <p>
              <strong>Email:</strong> {user.email}
            </p>

            <p>
              <strong>User ID:</strong> {user.id}
            </p>
          </div>

          <div
            style={{
              border: "1px solid #e2e8f0",
              borderRadius: "12px",
              padding: "20px",
            }}
          >
            <h3 style={{ color: "#2563eb" }}>
              Transaction Details
            </h3>

            <p>
              <strong>Amount:</strong>{" "}
              {COMPANY.currency} {transaction.amount}
            </p>

            <p>
              <strong>Status:</strong>{" "}
              {transaction.status}
            </p>

            <p>
              <strong>Reference:</strong>{" "}
              {transaction.reference}
            </p>

            <p>
              <strong>Date:</strong>{" "}
              {new Date().toLocaleString()}
            </p>
          </div>
        </div>

        {/* MESSAGE */}
        <div
          style={{
            background: "#ecfdf5",
            border: "1px solid #10b981",
            padding: "20px",
            borderRadius: "12px",
            marginBottom: "40px",
          }}
        >
          <h3 style={{ color: "#047857" }}>
            Transaction Successful
          </h3>

          <p style={{ color: "#065f46" }}>
            This document confirms that your transaction
            has been successfully processed on CoinPilot.
          </p>
        </div>

        {/* FOOTER */}
        <div
          style={{
            borderTop: "2px solid #e2e8f0",
            paddingTop: "30px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <h2
              style={{
                fontFamily: "cursive",
                color: "#1d4ed8",
              }}
            >
              Peter Woods
            </h2>

            <p>Chief Executive Officer</p>
          </div>

          <button
            onClick={handlePrint}
            style={{
              padding: "14px 24px",
              background: "#2563eb",
              color: "#fff",
              border: "none",
              borderRadius: "12px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            Print / Save PDF
          </button>
        </div>
      </div>
    </div>
  );
}
