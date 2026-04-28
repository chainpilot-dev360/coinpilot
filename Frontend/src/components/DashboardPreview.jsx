import { useEffect, useState } from "react";
import axios from "axios";

function DashboardPreview({ token, user }) {
  const [ledger, setLedger] = useState([]);
  const [message, setMessage] = useState("Loading transactions...");
  const [filter, setFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [visibleCount, setVisibleCount] = useState(5);

  useEffect(() => {
    if (!user || !token) return;
    loadData();
  }, [user, token]);

  async function loadData() {
    try {
      const res = await axios.get(
        `http://127.0.0.1:5000/api/users/${user.id}/balances`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setLedger(res.data.ledger || []);
      setMessage("");
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to load transactions");
    }
  }

  const filteredLedger = ledger.filter((entry) => {
    const type = entry.type || "";
    const reason = entry.reason || "";

    const matchesType =
      filter === "ALL" || type.toLowerCase().includes(filter.toLowerCase());

    const matchesSearch =
      type.toLowerCase().includes(search.toLowerCase()) ||
      reason.toLowerCase().includes(search.toLowerCase());

    return matchesType && matchesSearch;
  });

  const visibleLedger = filteredLedger.slice(0, visibleCount);

  function exportCSV() {
    if (filteredLedger.length === 0) {
      alert("No transactions to export");
      return;
    }

    const headers = ["Type", "Amount", "Currency", "Reason", "Date"];

    const rows = filteredLedger.map((entry) => [
      entry.type,
      entry.amount,
      entry.currency,
      entry.reason,
      new Date(entry.created_at).toLocaleString(),
    ]);

    const csvContent = [headers, ...rows]
      .map((row) =>
        row
          .map((value) => `"${String(value || "").replaceAll('"', '""')}"`)
          .join(",")
      )
      .join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.setAttribute("download", "transactions.csv");

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  }

  function resetFilters() {
    setFilter("ALL");
    setSearch("");
    setVisibleCount(5);
  }

  return (
    <div>
      <h2>Transaction Dashboard</h2>

      <div style={toolbar}>
        <button onClick={loadData} style={secondaryButton}>
          Refresh
        </button>

        <button onClick={exportCSV} style={greenButton}>
          Download CSV
        </button>
      </div>

      <div style={filters}>
        <select
          value={filter}
          onChange={(e) => {
            setFilter(e.target.value);
            setVisibleCount(5);
          }}
          style={input}
        >
          <option value="ALL">All Transactions</option>
          <option value="deposit">Deposits</option>
          <option value="withdrawal">Withdrawals</option>
          <option value="investment">Investments</option>
          <option value="admin">Admin Adjustments</option>
        </select>

        <input
          placeholder="Search transaction reason/type..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setVisibleCount(5);
          }}
          style={input}
        />

        <button onClick={resetFilters} style={resetButton}>
          Reset
        </button>
      </div>

      {message && <p>{message}</p>}

      <table style={table}>
        <thead>
          <tr>
            <th style={th}>Type</th>
            <th style={th}>Amount</th>
            <th style={th}>Currency</th>
            <th style={th}>Reason</th>
            <th style={th}>Date</th>
          </tr>
        </thead>

        <tbody>
          {visibleLedger.map((entry) => (
            <tr key={entry.id}>
              <td style={td}>{entry.type}</td>
              <td style={td}>{entry.amount}</td>
              <td style={td}>{entry.currency}</td>
              <td style={td}>{entry.reason}</td>
              <td style={td}>{new Date(entry.created_at).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {filteredLedger.length === 0 && !message && <p>No matching transactions</p>}

      {visibleCount < filteredLedger.length && (
        <button
          onClick={() => setVisibleCount((current) => current + 5)}
          style={loadMoreButton}
        >
          Load More
        </button>
      )}

      {filteredLedger.length > 0 && (
        <p style={{ color: "#94a3b8" }}>
          Showing {Math.min(visibleCount, filteredLedger.length)} of{" "}
          {filteredLedger.length} transactions
        </p>
      )}
    </div>
  );
}

const toolbar = {
  marginBottom: "15px",
};

const filters = {
  display: "flex",
  gap: "10px",
  flexWrap: "wrap",
  marginBottom: "15px",
};

const input = {
  padding: "10px",
  borderRadius: "8px",
  border: "1px solid #334155",
};

const greenButton = {
  padding: "10px 15px",
  marginRight: "10px",
  background: "#16a34a",
  color: "white",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
};

const secondaryButton = {
  padding: "10px 15px",
  marginRight: "10px",
  background: "#2563eb",
  color: "white",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
};

const resetButton = {
  padding: "10px 15px",
  background: "#334155",
  color: "white",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
};

const loadMoreButton = {
  marginTop: "15px",
  padding: "10px 16px",
  background: "#2563eb",
  color: "white",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
};

const table = {
  width: "100%",
  borderCollapse: "collapse",
  background: "#1e293b",
};

const th = {
  padding: "12px",
  borderBottom: "1px solid #334155",
  textAlign: "left",
};

const td = {
  padding: "12px",
  borderBottom: "1px solid #334155",
};

export default DashboardPreview;