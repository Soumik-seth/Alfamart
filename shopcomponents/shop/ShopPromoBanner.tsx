
import "../../shopcomponentscss/shop/ShopPromoBanner.css";

const promises = [
  {
    icon: "🚚",
    title: "PAN India Delivery",
    description: "We deliver goodness to your doorstep.",
  },
  {
    icon: "🌿",
    title: "100% Natural",
    description: "Carefully selected natural products.",
  },
  {
    icon: "✓",
    title: "Quality Assured",
    description: "Quality you can trust in every purchase.",
  },
];

export default function ShopPromoBanner() {
  return (
    <section className="shop-promo-banner">
      <div className="shop-promo-heading">
        <span>THE ALFAMART PROMISE</span>
        <h2>Goodness You Can Trust</h2>
        <p>
          Bringing authentic and naturally sourced products
          closer to your home.
        </p>
      </div>

      <div className="shop-promise-grid">
        {promises.map((promise) => (
          <div className="shop-promise-item" key={promise.title}>
            <div className="shop-promise-icon">{promise.icon}</div>

            <div>
              <h3>{promise.title}</h3>
              <p>{promise.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
