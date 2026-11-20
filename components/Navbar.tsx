
"use client";
import "../componentscss/Navbar.css";
import Link from "next/link";
import { useState } from "react";
import {
  Search,
  UserRound,
  ShoppingBag,
  Menu,
  X,
} from "lucide-react";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      <header className="site-header">
        <nav className="navbar">

          {/* BRAND */}
          <Link href="/" className="brand">
            <img
              src="/images/alfamartlogo.jpeg"
              alt="Alfa Mart Logo"
            />

            <div className="brand-text">
              <h2>ALFA MART</h2>
              <span>ORGANIC & MORE...</span>
            </div>
          </Link>

          {/* DESKTOP LINKS */}
          <div className="nav-links">
            <Link href="/">Home</Link>
            <Link href="/shop">Shop</Link>
            <Link href="/gift-hamper">Gift Hamper</Link>
          </div>

          {/* RIGHT SIDE */}
          <div className="nav-right">

            <div className="nav-actions">
              <Link href="/shop" aria-label="Search">
                <Search />
              </Link>

              <Link href="/login" aria-label="Login">
                <UserRound />
              </Link>

              <Link href="/cart" aria-label="Cart">
                <ShoppingBag />
              </Link>
            </div>

            <button
              className="mobile-menu-btn"
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
              aria-expanded={menuOpen}
            >
              <Menu />
            </button>

          </div>
        </nav>
      </header>

      {/* MOBILE DRAWER */}
      {menuOpen && (
        <div
          className="drawer-overlay"
          onClick={closeMenu}
        >
          <div
            className="mobile-drawer"
            onClick={(e) => e.stopPropagation()}
          >

            <div className="drawer-header">
              <h3>Menu</h3>

              <button
                className="drawer-close"
                onClick={closeMenu}
                aria-label="Close menu"
              >
                <X />
              </button>
            </div>

            <div className="drawer-links">
              <Link href="/" onClick={closeMenu}>
                Home
              </Link>

              <Link href="/shop" onClick={closeMenu}>
                Shop
              </Link>

              <Link
                href="/gift-hamper"
                onClick={closeMenu}
              >
                Gift Hamper
              </Link>
            </div>

            <div className="drawer-actions">
              <Link href="/shop" onClick={closeMenu}>
                <Search />
                <span>Search</span>
              </Link>

              <Link href="/login" onClick={closeMenu}>
                <UserRound />
                <span>Login</span>
              </Link>

              <Link href="/cart" onClick={closeMenu}>
                <ShoppingBag />
                <span>Cart</span>
              </Link>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
