import "../componentscss/AnnouncementBar.css";

const messages = [
  { icon: "👥", text: "10,000+ Happy Customers" },
  { icon: "🔒", text: "100% Secure Checkout" },
  { icon: "💵", text: "Cash On Delivery Available" },
  { icon: "⭐", text: "10,000+ Happy Customers" },
];

export default function AnnouncementBar() {
  const loop = [...messages, ...messages];

  return (
    <div className="ann-bar">
      <div className="ann-track">
        {loop.map((item, i) => (
          <span key={i} className="ann-item">
            <span>{item.icon}</span>
            {item.text}
          </span>
        ))}
      </div>
    </div>
  );
}