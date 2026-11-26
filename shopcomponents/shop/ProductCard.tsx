
"use client";

import { useCart } from "@/context/CartContext";
import type { Product } from "@/app/shop/page";

import "../../shopcomponentscss/shop/ProductCard.css";

type ProductCardProps = {
  product: Product;
};

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart, cartItems } = useCart();

  const discount =
    product.originalPrice > product.price
      ? Math.round(
          ((product.originalPrice - product.price) /
            product.originalPrice) *
            100
        )
      : 0;

  const isOutOfStock = product.stock <= 0;

  const cartItem = cartItems.find(
    (item) => item.id === product.id
  );

  const quantityInCart = cartItem?.quantity ?? 0;

  const isCartLimitReached =
    quantityInCart >= product.stock;

  const handleAddToCart = () => {
    if (isOutOfStock || isCartLimitReached) return;

    addToCart(product);
  };

  return (
    <article className="product-card">
      <div className="product-card-image">
        {product.badge && (
          <span className="product-badge">
            {product.badge}
          </span>
        )}

        {discount > 0 && (
          <span className="product-discount">
            {discount}% OFF
          </span>
        )}

        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
        />

        <button
          type="button"
          className="product-wishlist"
          aria-label={`Add ${product.name} to wishlist`}
          onClick={() => alert("Wishlist feature coming soon!")}
        >
          ♡
        </button>
      </div>

      <div className="product-card-content">
        <span className="product-category-label">
          {product.category}
        </span>

        <h3>{product.name}</h3>

        <p className="product-weight">
          {product.weight}
        </p>

        <div className="product-price">
          <strong>
            ₹{product.price.toLocaleString("en-IN")}
          </strong>

          {product.originalPrice > product.price && (
            <del>
              ₹{product.originalPrice.toLocaleString("en-IN")}
            </del>
          )}
        </div>

        <p
          className={`product-stock ${
            isOutOfStock ? "out-of-stock" : ""
          }`}
        >
          {isOutOfStock
            ? "Currently unavailable"
            : `In Stock (${product.stock} available)`}
        </p>

        {quantityInCart > 0 && (
          <p className="cart-added-message">
            {quantityInCart} already in cart
          </p>
        )}

        <button
          type="button"
          className="add-to-cart-btn"
          disabled={isOutOfStock || isCartLimitReached}
          onClick={handleAddToCart}
        >
          {isOutOfStock
            ? "Out of Stock"
            : isCartLimitReached
              ? "Maximum Quantity Added"
              : quantityInCart > 0
                ? "Add More"
                : "Add to Cart"}
        </button>
      </div>
    </article>
  );
}
