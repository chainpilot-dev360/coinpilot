import { useEffect, useState } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

function Support({ token }) {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [tickets, setTickets] = useState([]);

  async function loadTickets() {
    try {
      const res = await axios.get(
        `${API_URL}/api/support/tickets/me`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setTickets(res.data || []);
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    loadTickets();
  }, []);

  async function createTicket() {
    try {
      await axios.post(
        `${API_URL}/api/support/tickets`,
        {
          subject,
          message,
          priority: "NORMAL",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSubject("");
      setMessage("");

      loadTickets();

      alert("Ticket created successfully");
    } catch (error) {
      alert(
        error.response?.data?.message ||
        "Failed to create ticket"
      );
    }
  }

  return (
    <div>
      <h2>Support Center</h2>

      <div
        style={{
          background: "#1e293b",
          padding: "20px",
          borderRadius: "12px",
          marginBottom: "20px",
        }}
      >
        <h3>Create Support Ticket</h3>

        <input
          placeholder="Subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          style={{
            width: "100%",
            padding: "12px",
            marginBottom: "10px",
          }}
        />

        <textarea
          placeholder="Describe your issue"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={5}
          style={{
            width: "100%",
            padding: "12px",
            marginBottom: "10px",
          }}
        />

        <button onClick={createTicket}>
          Submit Ticket
        </button>
      </div>

      <h3>My Tickets</h3>

      {tickets.map((ticket) => (
        <div
          key={ticket.id}
          style={{
            background: "#1e293b",
            padding: "15px",
            borderRadius: "10px",
            marginBottom: "10px",
          }}
        >
          <h4>{ticket.subject}</h4>

          <p>{ticket.message}</p>

          <strong>Status:</strong> {ticket.status}
        </div>
      ))}
    </div>
  );
}

export default Support;
