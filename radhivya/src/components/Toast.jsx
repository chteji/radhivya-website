import "./Toast.css";

export default function Toast({ message, type = "success" }) {
  if (!message) return null;

  return (
    <div className={`toast-popup toast-${type}`}>
      <div className="toast-icon">✓</div>

      <div>
        <strong>Yeah!</strong>
        <p>{message}</p>
      </div>
    </div>
  );
}