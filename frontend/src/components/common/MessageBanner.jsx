export default function MessageBanner({ type = "success", message, subMessage }) {
  if (!message) return null;
  return (
    <div className={`message-banner ${type}`}>
      <p>{message}</p>
      {subMessage && <p className="redirect-message">{subMessage}</p>}
    </div>
  );
}