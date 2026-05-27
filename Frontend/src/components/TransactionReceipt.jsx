const COMPANY = {
  name: "CoinPilot",
  tagline: "Digital Investment Platform",
  logo:
    "https://res.cloudinary.com/dlvtuijb1/image/upload/v1779874195/WhatsApp_Image_2026-05-27_at_10.29.15_AM_llqpmg.jpg",
  website: "www.coinpilot.com",
  email: "coinpilot@gmail.com",
  phone: "+1552174458",
  address: "125 Jefferson Avenue, Austin TX, USA",
  registration: "C1234567",
  ceo: "Peter Woods",
};

export default function TransactionReceipt({
  type = "Deposit",
  user = {},
  transaction = {},
}) {
  const receiptId =
    transaction.receipt_reference ||
    transaction.reference ||
    `${type.toUpperCase()}-${transaction.id || Date.now()}`;

  const amount = transaction.amount || 0;
  const deposits = transaction.deposits || [];
const withdrawals = transaction.withdrawals || [];
const currentBalance = transaction.currentBalance || 0;

const allTransactions = [
  ...deposits.map((d) => ({
    date: d.created_at,
    description: "Deposit",
    type: "Credit",
    amount: d.amount,
    status: d.status,
  })),

  ...withdrawals.map((w) => ({
    date: w.created_at,
    description: "Withdrawal",
    type: "Debit",
    amount: w.amount,
    status: w.status,
  })),
].sort(
  (a, b) =>
    new Date(b.date) - new Date(a.date)
);

const totalDeposits = deposits.reduce(
  (sum, d) => sum + Number(d.amount || 0),
  0
);

const totalWithdrawals = withdrawals.reduce(
  (sum, w) => sum + Number(w.amount || 0),
  0
);
  const currency = transaction.currency || "USD";
  const status = transaction.status || "APPROVED";

  const date = transaction.created_at
    ? new Date(transaction.created_at).toLocaleString()
    : new Date().toLocaleString();

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={pageWrap}>
      <div style={actions} className="no-print">
        <button onClick={handlePrint} style={printBtn}>
          Print / Save PDF
        </button>
      </div>

      <div style={receiptPage}>
        <div style={topBar}></div>

        <div style={header}>
          <div style={brandLeft}>
            <img
              src={COMPANY.logo}
              alt="CoinPilot Logo"
              style={logo}
            />

            <div>
              <h1 style={brandName}>
                COIN
                <span style={{ color: "#c9972b" }}>
                  PILOT
                </span>
              </h1>

              <p style={tagline}>
                {COMPANY.tagline}
              </p>

              <p style={smallMuted}>
                Secure. Transparent. Profitable.
              </p>
            </div>
          </div>

          <div style={companyInfo}>
            <strong>{COMPANY.name}</strong>
            <span>{COMPANY.website}</span>
            <span>{COMPANY.email}</span>
            <span>{COMPANY.phone}</span>
            <span>{COMPANY.address}</span>
          </div>
        </div>

        <div style={goldLine}></div>

        <div style={titleRow}>
          <div>
            <h2 style={receiptTitle}>
              {type.toUpperCase()} RECEIPT
            </h2>

            <p style={subtitle}>
              Official Receipt for Your Transaction
            </p>
          </div>

          <div style={receiptMeta}>
            <p>
              <strong>Receipt No:</strong>{" "}
              {receiptId}
            </p>

            <p>
              <strong>Date Issued:</strong>{" "}
              {date}
            </p>

            <p>
              <strong>Status:</strong>{" "}
              <span style={statusBadge}>
                {status}
              </span>
            </p>
          </div>
        </div>

        <div style={twoCols}>
          <section style={box}>
            <h3 style={boxHeader}>
              CUSTOMER DETAILS
            </h3>

            <Detail
              label="Full Name"
              value={
                user.full_name ||
                user.name ||
                "Valued Client"
              }
            />

            <Detail
              label="Email Address"
              value={user.email || "N/A"}
            />

            <Detail
              label="User ID"
              value={user.id || "N/A"}
            />
          </section>

          <section style={box}>
            <h3 style={boxHeader}>
              TRANSACTION DETAILS
            </h3>

            <Detail
              label="Transaction Type"
              value={type}
            />

            <Detail
              label="Payment Method"
              value={
                transaction.payment_method ||
                "Crypto Transfer"
              }
            />

            <Detail
              label="Reference ID"
              value={receiptId}
            />

            <Detail
              label="Transaction Status"
              value={status}
            />
          </section>
        </div>
        {type === "Account Statement" ? (
  <section style={summaryBox}>
    <h3 style={summaryHeader}>
      ACCOUNT STATEMENT
    </h3>

    <div style={{ padding: "20px" }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: "15px",
          marginBottom: "25px",
        }}
      >
        <div style={statCard}>
          <strong>Current Balance</strong>
          <p>
            {currentBalance} {currency}
          </p>
        </div>

        <div style={statCard}>
          <strong>Total Deposits</strong>
          <p>
            {totalDeposits} {currency}
          </p>
        </div>

        <div style={statCard}>
          <strong>Total Withdrawals</strong>
          <p>
            {totalWithdrawals} {currency}
          </p>
        </div>
      </div>

      <table style={table}>
        <thead>
          <tr>
            <th style={th}>Date</th>
            <th style={th}>Description</th>
            <th style={th}>Type</th>
            <th style={th}>Amount</th>
            <th style={th}>Status</th>
          </tr>
        </thead>

        <tbody>
          {allTransactions.map((tx, index) => (
            <tr key={index}>
              <td style={td}>
                {new Date(
                  tx.date
                ).toLocaleString()}
              </td>

              <td style={td}>
                {tx.description}
              </td>

              <td style={td}>
                {tx.type}
              </td>

              <td style={td}>
                {tx.amount} {currency}
              </td>

              <td style={td}>
                {tx.status}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </section>
) : (
  <section style={summaryBox}>
    <h3 style={summaryHeader}>
      TRANSACTION SUMMARY
    </h3>

    <Detail
      label="Amount"
      value={`${amount} ${currency}`}
    />

    <Detail
      label="Currency"
      value={currency}
    />

    <Detail
      label="Transaction Hash"
      value={
        transaction.tx_hash ||
        transaction.hash ||
        "N/A"
      }
    />

    <Detail
      label="Wallet Address"
      value={
        transaction.wallet_address || "N/A"
      }
    />

    <Detail
      label="Admin Note"
      value={
        transaction.admin_note || "N/A"
      }
    />

    <Detail
      label="Date Completed"
      value={date}
    />
  </section>
)}

        <div style={successBox}>
          <strong>
            This is to confirm that this transaction has been successfully processed.
          </strong>

          <p>
            This receipt was generated by {COMPANY.name} and confirms the
            transaction record stored on our platform.
          </p>
        </div>

        <div style={thanks}>
          Thank you for choosing {COMPANY.name}.
          <p>Your trust drives our innovation.</p>
        </div>

        <div style={verification}>
          <div>
            <div style={signature}>
              Peter Woods
            </div>

            <strong>{COMPANY.ceo}</strong>

            <p>Chief Executive Officer</p>
            <p>{COMPANY.name}</p>
          </div>

          <div style={seal}>
            VERIFIED
          </div>

          <div style={verifyText}>
            <strong>Registration No:</strong>
            <p>{COMPANY.registration}</p>

            <strong>Verification:</strong>
            <p>{COMPANY.website}/verify</p>
          </div>
        </div>

        <footer style={footer}>
          <span>Bank-Level Security</span>
          <span>Encrypted Transaction</span>
          <span>Global Compliance</span>
          <span>Financial Integrity</span>
        </footer>
      </div>

      <style>
        {`
          @media print {
            body {
              margin: 0;
              background: white;
            }

            .no-print {
              display: none !important;
            }

            @page {
              size: A4;
              margin: 0;
            }
          }
        `}
      </style>
    </div>
  );
}

function Detail({ label, value }) {
  return (
    <div style={detailRow}>
      <span style={detailLabel}>
        {label}
      </span>

      <span style={detailValue}>
        {value}
      </span>
    </div>
  );
}

const pageWrap = {
  background: "#e5e7eb",
  minHeight: "100vh",
  padding: "30px",
  fontFamily: "Arial, sans-serif",
};

const actions = {
  textAlign: "center",
  marginBottom: "20px",
};

const printBtn = {
  padding: "12px 22px",
  background: "#0f172a",
  color: "#fff",
  border: "none",
  borderRadius: "10px",
  cursor: "pointer",
  fontWeight: "bold",
};

const receiptPage = {
  width: "794px",
  minHeight: "1123px",
  margin: "0 auto",
  background: "#fff",
  color: "#0f172a",
  padding: "35px",
  boxSizing: "border-box",
  position: "relative",
  borderRadius: "6px",
  overflow: "hidden",
};

const topBar = {
  position: "absolute",
  top: 0,
  right: 0,
  width: "190px",
  height: "150px",
  background:
    "linear-gradient(135deg, #0f172a 0%, #0f172a 60%, #d4af37 60%, #f7d774 100%)",
  clipPath: "polygon(25% 0, 100% 0, 100% 100%)",
};

const header = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: "20px",
};

const brandLeft = {
  display: "flex",
  gap: "18px",
  alignItems: "center",
};

const logo = {
  width: "90px",
  height: "90px",
  borderRadius: "18px",
  objectFit: "cover",
};

const brandName = {
  fontSize: "36px",
  margin: 0,
  letterSpacing: "1px",
  color: "#0f172a",
};

const tagline = {
  margin: "5px 0",
  color: "#2563eb",
  fontWeight: "bold",
};

const smallMuted = {
  margin: 0,
  color: "#64748b",
};

const companyInfo = {
  display: "flex",
  flexDirection: "column",
  gap: "5px",
  fontSize: "13px",
  color: "#334155",
  maxWidth: "250px",
  zIndex: 2,
};

const goldLine = {
  height: "3px",
  background: "linear-gradient(90deg, #c9972b, #2563eb)",
  margin: "30px 0",
};

const titleRow = {
  display: "flex",
  justifyContent: "space-between",
  marginBottom: "25px",
};

const receiptTitle = {
  fontSize: "34px",
  margin: 0,
  color: "#0f172a",
};

const subtitle = {
  color: "#64748b",
};

const receiptMeta = {
  fontSize: "14px",
  lineHeight: "1.6",
};

const statusBadge = {
  background: "#dcfce7",
  color: "#15803d",
  padding: "6px 12px",
  borderRadius: "999px",
  fontWeight: "bold",
};

const twoCols = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "20px",
  marginBottom: "25px",
};

const box = {
  border: "1px solid #dbe4f0",
  borderRadius: "14px",
  overflow: "hidden",
};

const boxHeader = {
  background: "#2563eb",
  color: "#fff",
  margin: 0,
  padding: "12px 16px",
  fontSize: "15px",
};

const summaryBox = {
  border: "1px solid #dbe4f0",
  borderRadius: "14px",
  overflow: "hidden",
  marginBottom: "25px",
};

const summaryHeader = {
  background: "#0f172a",
  color: "#f7d774",
  margin: 0,
  padding: "12px 16px",
};

const detailRow = {
  display: "grid",
  gridTemplateColumns: "180px 1fr",
  padding: "11px 16px",
  borderBottom: "1px solid #e5e7eb",
  fontSize: "14px",
};

const detailLabel = {
  fontWeight: "bold",
  color: "#334155",
};

const detailValue = {
  color: "#0f172a",
  wordBreak: "break-word",
};

const successBox = {
  background: "#f0fdf4",
  border: "1px solid #86efac",
  color: "#166534",
  borderRadius: "14px",
  padding: "18px",
  marginBottom: "25px",
};

const thanks = {
  textAlign: "center",
  color: "#2563eb",
  fontSize: "22px",
  fontFamily: "cursive",
  marginBottom: "25px",
};

const verification = {
  display: "grid",
  gridTemplateColumns: "1fr 130px 1fr",
  gap: "20px",
  alignItems: "center",
  border: "1px solid #f1d18a",
  borderRadius: "14px",
  padding: "20px",
  marginBottom: "25px",
};

const signature = {
  fontSize: "30px",
  fontFamily: "cursive",
  borderBottom: "1px solid #c9972b",
  marginBottom: "8px",
};

const seal = {
  width: "120px",
  height: "120px",
  borderRadius: "50%",
  background: "radial-gradient(circle, #f7d774, #c9972b)",
  color: "#0f172a",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontWeight: "bold",
  border: "6px double #8a6a13",
};

const verifyText = {
  fontSize: "13px",
  color: "#334155",
};

const footer = {
  background: "linear-gradient(90deg, #0f172a, #1e3a8a)",
  color: "#f7d774",
  padding: "18px",
  borderRadius: "12px",
  display: "flex",
  justifyContent: "space-between",
  fontSize: "12px",
  fontWeight: "bold",
};

const statCard = {
  background: "#f8fafc",
  border: "1px solid #dbe4f0",
  borderRadius: "12px",
  padding: "16px",
  textAlign: "center",
};

const table = {
  width: "100%",
  borderCollapse: "collapse",
  fontSize: "13px",
};

const th = {
  background: "#0f172a",
  color: "#fff",
  padding: "12px",
  textAlign: "left",
};

const td = {
  borderBottom: "1px solid #e5e7eb",
  padding: "10px",
};

const printStyles = `
@media print {
  body {
    background: white !important;
  }

  .no-print {
    display: none !important;
  }

  @page {
    size: A4;
    margin: 0;
  }
}
`;
