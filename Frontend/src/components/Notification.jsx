function Notification({ message, type }) {
  if (!message) return null;

  const background =
    type === "success" ? "#16a34a" : type === "error" ? "#dc2626" : "#2563eb";

  return (
    <div
      style={{
        position: "fixed",
        top: "20px",
        right: "20px",
        background,
        color: "white",
        padding: "14px 18px",
        borderRadius: "10px",
        zIndex: 9999,
        boxShadow: "0 10px 25px rgba(0,0,0,0.3)",
      }}
    >
      {message}
    </div>
  );
}

export default Notification;