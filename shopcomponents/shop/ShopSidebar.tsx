
"use client";

import { useState } from "react";
import "../../shopcomponentscss/shop/ShopSidebar.css";

export type SortOption =
  | "default"
  | "price-asc"
  | "price-desc"
  | "name-asc";

export const DEFAULT_CATEGORY = "all";
export const MAX_PRICE_LIMIT = 10000;

export const categories = [
  { name: "All Products", value: "all" },
  { name: "A2 Gir Cow Ghee", value: "ghee" },
  { name: "Honey", value: "honey" },
  {
    name: "Cold Pressed / Wood Pressed Oil",
    value: "oil",
  },
  { name: "CTC & Floral Tea", value: "tea" },
  { name: "Juice, Jams & Chutney", value: "juice" },
  {
    name: "Seeds, Spreads & Dryfruits",
    value: "seeds",
  },
  { name: "Mithai", value: "mithai" },
];

type ShopSidebarProps = {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;

  maxPrice: number;
  onMaxPriceChange: (price: number) => void;

  inStockOnly: boolean;
  onInStockChange: (checked: boolean) => void;

  onClearFilters: () => void;
};

export default function ShopSidebar({
  selectedCategory,
  onCategoryChange,
  maxPrice,
  onMaxPriceChange,
  inStockOnly,
  onInStockChange,
  onClearFilters,
}: ShopSidebarProps) {
  const [isOpen, setIsOpen] = useState(false);

  const activeFilterCount =
    (selectedCategory !== DEFAULT_CATEGORY ? 1 : 0) +
    (maxPrice < MAX_PRICE_LIMIT ? 1 : 0) +
    (inStockOnly ? 1 : 0);

  return (
    <aside className="shop-sidebar">

      {/* MOBILE FILTER BUTTON */}
      <button
        type="button"
        className="sidebar-toggle"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
      >
        <span>
          <span className="filter-icon">☷</span>
          Filters

          {activeFilterCount > 0 && (
            <span className="sidebar-toggle-badge">
              {activeFilterCount}
            </span>
          )}
        </span>

        <span className="filter-arrow">
          {isOpen ? "−" : "+"}
        </span>
      </button>

      <div
        className={`sidebar-content ${isOpen ? "open" : ""}`}
      >

        {/* CLEAR FILTERS */}
        {activeFilterCount > 0 && (
          <button
            type="button"
            className="clear-filters-btn"
            onClick={onClearFilters}
          >
            ✕ Clear Filters ({activeFilterCount})
          </button>
        )}

        {/* PRODUCT CATEGORIES */}
        <div className="sidebar-section">

          <h3 className="sidebar-title">
            <span className="sidebar-title-icon">✿</span>
            Product Categories
          </h3>

          <div className="category-list">

            {categories.map((category) => (
              <button
                key={category.value}
                type="button"
                className={`category-item ${
                  selectedCategory === category.value
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  onCategoryChange(category.value)
                }
                aria-pressed={
                  selectedCategory === category.value
                }
              >
                {category.name}
              </button>
            ))}

          </div>
        </div>

        {/* PRICE RANGE */}
        <div className="sidebar-section">

          <h3 className="sidebar-title">
            <span className="sidebar-title-icon">₹</span>
            Price Range
          </h3>

          <input
            type="range"
            min="0"
            max={MAX_PRICE_LIMIT}
            step="100"
            value={maxPrice}
            onChange={(e) =>
              onMaxPriceChange(Number(e.target.value))
            }
            className="price-range-input"
            aria-label="Maximum product price"
          />

          <div className="price-range-labels">
            <span>₹0</span>

            <span>
              {maxPrice >= MAX_PRICE_LIMIT
                ? "₹10,000+"
                : `₹${maxPrice.toLocaleString("en-IN")}`}
            </span>
          </div>

        </div>

        {/* AVAILABILITY */}
        <div className="sidebar-section">

          <h3 className="sidebar-title">
            <span className="sidebar-title-icon">✓</span>
            Availability
          </h3>

          <label className="availability-option">

            <input
              type="checkbox"
              checked={inStockOnly}
              onChange={(e) =>
                onInStockChange(e.target.checked)
              }
            />

            <span>In Stock Only</span>

          </label>

        </div>

        {/* SHIPPING BANNER */}
        <div className="sidebar-shipping-banner">

          <div className="shipping-icon">
            🚚
          </div>

          <h3>PAN India Shipping</h3>

          <p>
            Healthy products,
            <br />
            now at your doorstep.
          </p>

          <span className="shipping-decoration">
            ✿
          </span>

        </div>

      </div>

    </aside>
  );
}
