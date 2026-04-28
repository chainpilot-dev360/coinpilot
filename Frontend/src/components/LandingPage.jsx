import { useEffect, useState } from "react";

const slides = [
  {
    title: "Satisfied Investors",
    text: "Join a growing community of users managing digital wealth with confidence.",
    image:
      "https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1600&q=80",
  },
  {
    title: "Crypto Trading Intelligence",
    text: "Monitor opportunities, track portfolio activity, and manage investment growth.",
    image:
      "https://images.unsplash.com/photo-1640340434855-6084b1f4901c?auto=format&fit=crop&w=1600&q=80",
  },
  {
    title: "Stock Market Inspired Analytics",
    text: "A premium dashboard experience designed for modern finance users.",
    image:
      "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1600&q=80",
  },
];

function LandingPage({ onLoginClick, onRegisterClick }) {
  const [activeSlide, setActiveSlide] = useState(0);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    {
      from: "support",
      text: "Hello 👋 Welcome to ChainPilot. How can we assist you today?",
    },
  ]);
  const [chatInput, setChatInput] = useState("");

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((current) => (current + 1) % slides.length);
    }, 4500);

    return () => clearInterval(timer);
  }, []);

  function sendChatMessage() {
    if (!chatInput.trim()) return;

    setChatMessages((messages) => [
      ...messages,
      { from: "visitor", text: chatInput },
      {
        from: "support",
        text: "Thank you for contacting us. A support representative will respond shortly.",
      },
    ]);

    setChatInput("");
  }

  const slide = slides[activeSlide];

  return (
    <div style={page}>
      <section
        style={{
          ...hero,
          backgroundImage: `linear-gradient(rgba(2,6,23,0.55), rgba(2,6,23,0.95)), url(${slide.image})`,
        }}
      >
        <div style={heroOverlay}>
          <nav style={nav}>
            <h2>ChainPilot</h2>

            <div>
              <button onClick={onLoginClick} style={navButton}>
                Login
              </button>

              <button onClick={onRegisterClick} style={navPrimary}>
                Get Started
              </button>
            </div>
          </nav>

          <div style={floatingCard}>
            <p style={badge}>{slide.title}</p>

            <h1 style={heroTitle}>
              Build Wealth With Smart Digital Asset Investing
            </h1>

            <p style={heroText}>{slide.text}</p>

            <div>
              <button onClick={onRegisterClick} style={primaryButton}>
                Create Account
              </button>

              <button onClick={onLoginClick} style={secondaryButton}>
                Access Dashboard
              </button>
            </div>

            <div style={dots}>
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveSlide(index)}
                  style={{
                    ...dot,
                    background:
                      index === activeSlide
                        ? "#38bdf8"
                        : "rgba(255,255,255,0.35)",
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section style={section}>
        <h2 style={sectionTitle}>A Premium Finance Experience</h2>

        <div style={grid}>
          <Card
            title="Investor-Focused Platform"
            text="A modern experience built for users who want clarity, performance, and simple portfolio control."
          />
          <Card
            title="Crypto & Stock Inspired Design"
            text="Professional visuals inspired by trading desks, digital assets, and financial analytics."
          />
          <Card
            title="Live Dashboard"
            text="Track wallet balances, investment activity, transactions, and portfolio updates from one place."
          />
        </div>
      </section>

      <section style={imageBand}>
        <div style={imageCard}>
          <img
            src="https://images.unsplash.com/photo-1560472355-536de3962603?auto=format&fit=crop&w=900&q=80"
            alt="investors"
            style={image}
          />
          <h3 style={imageTitle}>Trusted by Modern Investors</h3>
        </div>

        <div style={imageCard}>
          <img
            src="https://images.unsplash.com/photo-1642104704074-907c0698cbd9?auto=format&fit=crop&w=900&q=80"
            alt="crypto"
            style={image}
          />
          <h3 style={imageTitle}>Built for Digital Assets</h3>
        </div>

        <div style={imageCard}>
          <img
            src="https://images.unsplash.com/photo-1535320903710-d993d3d77d29?auto=format&fit=crop&w=900&q=80"
            alt="stock chart"
            style={image}
          />
          <h3 style={imageTitle}>Market-Ready Analytics</h3>
        </div>
      </section>

      <section style={darkSection}>
        <h2 style={sectionTitle}>Investment Plans</h2>

        <div style={grid}>
          <Plan title="Starter" amount="$100" returnText="5% daily" />
          <Plan title="Growth" amount="$10,000" returnText="7.5% daily" />
          <Plan title="Premium" amount="$100,000" returnText="12% daily" />
        </div>
      </section>

      <section style={cta}>
        <h2>Start Managing Your Crypto Portfolio Today</h2>
        <p style={heroText}>
          Create an account and access your investment dashboard in minutes.
        </p>

        <button onClick={onRegisterClick} style={primaryButton}>
          Get Started Now
        </button>
      </section>

      {/* LIVE CHAT */}
      {chatOpen && (
        <div style={chatBox}>
          <div style={chatHeader}>
            <div>
              <strong>ChainPilot Support</strong>
              <p style={chatStatus}>Online now</p>
            </div>

            <button onClick={() => setChatOpen(false)} style={chatClose}>
              ×
            </button>
          </div>

          <div style={chatBody}>
            {chatMessages.map((message, index) => (
              <div
                key={index}
                style={
                  message.from === "visitor"
                    ? visitorMessage
                    : supportMessage
                }
              >
                {message.text}
              </div>
            ))}
          </div>

          <div style={chatInputRow}>
            <input
              placeholder="Type your message..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") sendChatMessage();
              }}
              style={chatInputStyle}
            />

            <button onClick={sendChatMessage} style={chatSend}>
              Send
            </button>
          </div>
        </div>
      )}

      {!chatOpen && (
        <button onClick={() => setChatOpen(true)} style={chatButton}>
          💬 Live Chat
        </button>
      )}
    </div>
  );
}

function Card({ title, text }) {
  return (
    <div style={card}>
      <h3>{title}</h3>
      <p style={cardText}>{text}</p>
    </div>
  );
}

function Plan({ title, amount, returnText }) {
  return (
    <div style={planCard}>
      <p style={badge}>{title} Plan</p>
      <h2>{amount}</h2>
      <p style={cardText}>Minimum investment</p>
      <h3>{returnText}</h3>
      <p style={cardText}>Projected daily return</p>
    </div>
  );
}

const page = {
  background: "#020617",
  color: "white",
  fontFamily: "Arial, sans-serif",
};

const hero = {
  minHeight: "100vh",
  backgroundSize: "cover",
  backgroundPosition: "center",
  backgroundAttachment: "fixed",
  transition: "background-image 0.8s ease-in-out",
};

const heroOverlay = {
  minHeight: "100vh",
  padding: "24px",
  display: "flex",
  flexDirection: "column",
};

const nav = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  maxWidth: "1200px",
  width: "100%",
  margin: "0 auto",
};

const floatingCard = {
  maxWidth: "780px",
  margin: "110px auto 0",
  padding: "52px",
  borderRadius: "30px",
  background: "rgba(15, 23, 42, 0.72)",
  backdropFilter: "blur(20px)",
  border: "1px solid rgba(255,255,255,0.16)",
  boxShadow: "0 35px 100px rgba(0,0,0,0.55)",
  textAlign: "center",
};

const badge = {
  color: "#38bdf8",
  fontWeight: "bold",
  textTransform: "uppercase",
  letterSpacing: "1px",
  fontSize: "13px",
};

const heroTitle = {
  fontSize: "56px",
  lineHeight: "1.05",
  margin: "15px 0",
};

const heroText = {
  color: "#cbd5e1",
  fontSize: "18px",
  lineHeight: "1.6",
  marginBottom: "28px",
};

const section = {
  padding: "80px 24px",
  maxWidth: "1200px",
  margin: "0 auto",
  textAlign: "center",
};

const darkSection = {
  padding: "80px 24px",
  background: "#0f172a",
  textAlign: "center",
};

const sectionTitle = {
  fontSize: "36px",
  marginBottom: "30px",
};

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
  gap: "22px",
};

const card = {
  background: "#1e293b",
  padding: "28px",
  borderRadius: "18px",
  boxShadow: "0 20px 45px rgba(0,0,0,0.25)",
};

const imageBand = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
  gap: "22px",
  padding: "80px 24px",
  maxWidth: "1200px",
  margin: "0 auto",
};

const imageCard = {
  background: "#0f172a",
  borderRadius: "22px",
  overflow: "hidden",
  border: "1px solid #1e293b",
  boxShadow: "0 25px 60px rgba(0,0,0,0.35)",
};

const imageTitle = {
  padding: "0 18px 18px",
};

const image = {
  width: "100%",
  height: "220px",
  objectFit: "cover",
  display: "block",
};

const planCard = {
  background: "linear-gradient(180deg, #1e293b, #020617)",
  padding: "32px",
  borderRadius: "22px",
  border: "1px solid #334155",
  boxShadow: "0 20px 45px rgba(0,0,0,0.3)",
};

const cardText = {
  color: "#94a3b8",
  lineHeight: "1.6",
};

const cta = {
  padding: "90px 24px",
  textAlign: "center",
};

const primaryButton = {
  padding: "14px 24px",
  background: "#2563eb",
  color: "white",
  border: "none",
  borderRadius: "12px",
  marginRight: "12px",
  cursor: "pointer",
  fontWeight: "bold",
};

const secondaryButton = {
  padding: "14px 24px",
  background: "rgba(255,255,255,0.12)",
  color: "white",
  border: "1px solid rgba(255,255,255,0.2)",
  borderRadius: "12px",
  cursor: "pointer",
};

const navButton = {
  ...secondaryButton,
  padding: "10px 16px",
};

const navPrimary = {
  ...primaryButton,
  padding: "10px 16px",
};

const dots = {
  marginTop: "28px",
  display: "flex",
  justifyContent: "center",
  gap: "10px",
};

const dot = {
  width: "12px",
  height: "12px",
  borderRadius: "50%",
  border: "none",
  cursor: "pointer",
};

const chatButton = {
  position: "fixed",
  right: "22px",
  bottom: "22px",
  background: "#2563eb",
  color: "white",
  border: "none",
  borderRadius: "999px",
  padding: "15px 22px",
  fontWeight: "bold",
  boxShadow: "0 20px 45px rgba(0,0,0,0.45)",
  cursor: "pointer",
  zIndex: 9999,
};

const chatBox = {
  position: "fixed",
  right: "22px",
  bottom: "22px",
  width: "340px",
  maxWidth: "calc(100vw - 44px)",
  background: "#0f172a",
  border: "1px solid #334155",
  borderRadius: "20px",
  boxShadow: "0 30px 80px rgba(0,0,0,0.55)",
  overflow: "hidden",
  zIndex: 9999,
};

const chatHeader = {
  background: "#2563eb",
  padding: "16px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
};

const chatStatus = {
  margin: "4px 0 0",
  fontSize: "13px",
  color: "#dbeafe",
};

const chatClose = {
  background: "transparent",
  border: "none",
  color: "white",
  fontSize: "26px",
  cursor: "pointer",
};

const chatBody = {
  padding: "16px",
  height: "260px",
  overflowY: "auto",
  background: "#020617",
};

const supportMessage = {
  background: "#1e293b",
  color: "white",
  padding: "10px 12px",
  borderRadius: "12px",
  marginBottom: "10px",
  maxWidth: "85%",
};

const visitorMessage = {
  background: "#2563eb",
  color: "white",
  padding: "10px 12px",
  borderRadius: "12px",
  marginBottom: "10px",
  maxWidth: "85%",
  marginLeft: "auto",
};

const chatInputRow = {
  display: "flex",
  gap: "8px",
  padding: "12px",
  background: "#0f172a",
};

const chatInputStyle = {
  flex: 1,
  padding: "11px",
  borderRadius: "10px",
  border: "1px solid #334155",
  background: "#020617",
  color: "white",
};

const chatSend = {
  padding: "11px 14px",
  background: "#16a34a",
  color: "white",
  border: "none",
  borderRadius: "10px",
  cursor: "pointer",
};

export default LandingPage;