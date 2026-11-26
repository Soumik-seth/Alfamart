
"use client";

import "../../shopcomponentscss/shop/ShopToolbar.css";

import type { SortOption } from "./ShopSidebar";

type ShopToolbarProps = {
  selectedCategory: string;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  sortBy: SortOption;
  onSortChange: (value: SortOption) => void;
  productCount: number;
};

const categoryTitles: Record<string, string> = {
  all: "All Products",
  ghee: "A2 Gir Cow Ghee",
  honey: "Honey",
  oil: "Cold Pressed / Wood Pressed Oil",
  tea: "CTC & Floral Tea",
  juice: "Juice, Jams & Chutney",
  seeds: "Seeds, Spreads & Dryfruits",
  mithai: "Mithai",
};

export default function ShopToolbar({
  selectedCategory,
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  productCount,
}: ShopToolbarProps) {
  const heading = categoryTitles[selectedCategory] || "All Products";

  return (
    <div className="shop-toolbar">
      <div className="shop-toolbar-top">
        <div className="shop-toolbar-heading">
          <span className="shop-section-eyebrow">EXPLORE OUR COLLECTION</span>
          <h1>{heading}</h1>
          <p>
            Discover naturally sourced products for a healthier lifestyle.
          </p>
        </div>

        <div className="shop-search-box">
          <span className="shop-search-icon">⌕</span>
          <input
            type="search"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            aria-label="Search products"
          />
        </div>
      </div>

      <div className="shop-toolbar-bottom">
        <p className="shop-product-count">
          Showing <strong>{productCount}</strong> products
        </p>

        <div className="shop-sort-wrapper">
          <label htmlFor="shop-sort">Sort by:</label>

          <select
            id="shop-sort"
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as SortOption)}
          >
            <option value="default">Featured</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="name-asc">Name: A to Z</option>
          </select>
        </div>
      </div>
    </div>
  );
}
