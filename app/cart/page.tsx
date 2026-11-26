"use client";

import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
  ShieldCheck,
} from "lucide-react";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCart } from "@/context/CartContext";

import "../../cartcomponentscss/CartPage.css";

export default function CartPage() {
  const {
    cartItems,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
    cartTotal,
  } = useCart();

  const formatPrice = (price: number) =>
    `₹${price.toLocaleString("en-IN")}`;

  const handleCheckout = () => {
    alert("Checkout and payment integration will be added next.");
  };

  return (
    <main className="cart-page">
      <Navbar />

      <div className="cart-container">
        <div className="cart-breadcrumb">
          <Link href="/">Home</Link>
          <span>›</span>
          <span>Shopping Cart</span>
        </div>

        <div className="cart-heading">
          <div>
            <p className="cart-eyebrow">YOUR SHOPPING BAG</p>
            <h1>Shopping Cart</h1>
            <p className="cart-heading-description">
              Review your selected products before checkout.
            </p>
          </div>

          <Link href="/shop" className="continue-shopping-top">
            <ArrowLeft size={17} />
            Continue Shopping
          </Link>
        </div>

        {cartItems.length === 0 ? (
          <div className="empty-cart">
            <div className="empty-cart-icon">
              <ShoppingBag size={42} strokeWidth={1.5} />
            </div>

            <h2>Your Cart is Empty</h2>

            <p>
              Looks like you haven&apos;t added anything to your cart yet.
              Explore our natural and authentic products.
            </p>

            <Link href="/shop" className="shop-now-btn">
              Explore Products
            </Link>
          </div>
        ) : (
          <div className="cart-layout">
            <section className="cart-items-section">
              <div className="cart-items-header">
                <h2>Your Items</h2>
                <span>
                  {cartItems.reduce(
                    (total, item) => total + item.quantity,
                    0
                  )}{" "}
                  items
                </span>
              </div>

              <div className="cart-items-list">
                {cartItems.map((item) => (
                  <article className="cart-item" key={item.id}>
                    <div className="cart-item-image">
                      <Image
                        src={item.image}
                        alt={item.name}
                        width={130}
                        height={130}
                      />
                    </div>

                    <div className="cart-item-details">
                      <div className="cart-item-info">
                        <span className="cart-item-category">
                          {item.category}
                        </span>

                        <h3>{item.name}</h3>

                        <p className="cart-item-weight">{item.weight}</p>

                        <strong className="cart-item-price">
                          {formatPrice(item.price)}
                        </strong>
                      </div>

                      <div className="cart-item-actions">
                        <div className="quantity-control">
                          <button
                            type="button"
                            onClick={() => decreaseQuantity(item.id)}
                            aria-label={`Decrease ${item.name} quantity`}
                          >
                            <Minus size={15} />
                          </button>

                          <span>{item.quantity}</span>

                          <button
                            type="button"
                            onClick={() => increaseQuantity(item.id)}
                            disabled={item.quantity >= item.stock}
                            aria-label={`Increase ${item.name} quantity`}
                          >
                            <Plus size={15} />
                          </button>
                        </div>

                        <button
                          type="button"
                          className="remove-cart-item"
                          onClick={() => removeFromCart(item.id)}
                        >
                          <Trash2 size={15} />
                          Remove
                        </button>
                      </div>

                      <div className="cart-item-subtotal">
                        <span>Subtotal</span>
                        <strong>
                          {formatPrice(item.price * item.quantity)}
                        </strong>
                      </div>
                    </div>
                  </article>
                ))}
              </div>

              <Link href="/shop" className="continue-shopping-bottom">
                <ArrowLeft size={17} />
                Continue Shopping
              </Link>
            </section>

            <aside className="cart-summary">
              <h2>Order Summary</h2>

              <div className="summary-row">
                <span>Subtotal</span>
                <strong>{formatPrice(cartTotal)}</strong>
              </div>

              <div className="summary-row">
                <span>Shipping</span>
                <span className="shipping-note">
                  Calculated at checkout
                </span>
              </div>

              <div className="summary-divider" />

              <div className="summary-total">
                <span>Total</span>
                <strong>{formatPrice(cartTotal)}</strong>
              </div>

              <p className="summary-tax-note">
                Shipping charges, if applicable, will be calculated at checkout.
              </p>

              <button
                type="button"
                className="checkout-btn"
                onClick={handleCheckout}
              >
                Proceed to Checkout
              </button>

              <div className="secure-checkout">
                <ShieldCheck size={19} />
                <span>Secure checkout experience</span>
              </div>

              <div className="cart-benefit">
                <ShoppingBag size={20} />
                <div>
                  <strong>Thoughtfully Selected</strong>
                  <p>Natural products for everyday living.</p>
                </div>
              </div>
            </aside>
          </div>
        )}
      </div>

      <Footer />
    </main>
  );
}