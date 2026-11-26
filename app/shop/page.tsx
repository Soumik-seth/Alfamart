
"use client";

import { useMemo, useState } from "react";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

import ShopBreadcrumb from "@/shopcomponents/shop/ShopBreadcrumb";

import ShopSidebar, {
  DEFAULT_CATEGORY,
  MAX_PRICE_LIMIT,
  type SortOption,
} from "@/shopcomponents/shop/ShopSidebar";

import ShopToolbar from "@/shopcomponents/shop/ShopToolbar";
import ProductGrid from "@/shopcomponents/shop/ProductGrid";
import ShopPromoBanner from "@/shopcomponents/shop/ShopPromoBanner";

import "../../shopcomponentscss/shop/ShopPage.css";

// PRODUCT TYPE
export type Product = {
  id: number;
  name: string;
  image: string;
  category: string;
  weight: string;
  price: number;
  originalPrice: number;
  stock: number;
  badge?: string;
};

// DEMO PRODUCT DATA
// Later, replace this array with products from Neon Database.

const products: Product[] = [
  {
    id: 1,
    name: "A2 Gir Cow Ghee",
    image: "/images/gee.png",
    category: "ghee",
    weight: "500 gm",
    price: 799,
    originalPrice: 899,
    stock: 10,
    badge: "Bestseller",
  },
  {
    id: 2,
    name: "Pure Natural Honey",
    image: "/images/honey.png",
    category: "honey",
    weight: "250 gm",
    price: 299,
    originalPrice: 349,
    stock: 15,
    badge: "New",
  },
  {
    id: 3,
    name: "Wood Pressed Oil",
    image: "/images/oil.png",
    category: "oil",
    weight: "1 Litre",
    price: 499,
    originalPrice: 599,
    stock: 8,
  },
  {
    id: 4,
    name: "Premium Floral Tea",
    image: "/images/tea.png",
    category: "tea",
    weight: "100 gm",
    price: 349,
    originalPrice: 399,
    stock: 12,
    badge: "Premium",
  },
  {
    id: 5,
    name: "Natural Fruit Juice",
    image: "/images/juice.png",
    category: "juice",
    weight: "300 ml",
    price: 199,
    originalPrice: 249,
    stock: 0,
  },
  {
    id: 6,
    name: "Seeds & Dry Fruits",
    image: "/images/seeds.png",
    category: "seeds",
    weight: "250 gm",
    price: 399,
    originalPrice: 449,
    stock: 20,
  },
  {
    id: 7,
    name: "Traditional Mithai",
    image: "/images/mithi.png",
    category: "mithai",
    weight: "500 gm",
    price: 450,
    originalPrice: 500,
    stock: 7,
  },
];

export default function ShopPage() {
  // FILTER STATES

  const [selectedCategory, setSelectedCategory] =
    useState(DEFAULT_CATEGORY);

  const [maxPrice, setMaxPrice] =
    useState(MAX_PRICE_LIMIT);

  const [inStockOnly, setInStockOnly] =
    useState(false);

  const [searchQuery, setSearchQuery] =
    useState("");

  const [sortBy, setSortBy] =
    useState<SortOption>("default");

  // CLEAR ALL FILTERS

  const clearFilters = () => {
    setSelectedCategory(DEFAULT_CATEGORY);
    setMaxPrice(MAX_PRICE_LIMIT);
    setInStockOnly(false);
    setSearchQuery("");
    setSortBy("default");
  };

  // FILTER AND SORT PRODUCTS

  const filteredProducts = useMemo(() => {
    let result = [...products];

    // CATEGORY FILTER
    if (selectedCategory !== DEFAULT_CATEGORY) {
      result = result.filter(
        (product) => product.category === selectedCategory
      );
    }

    // PRICE FILTER
    result = result.filter(
      (product) => product.price <= maxPrice
    );

    // STOCK FILTER
    if (inStockOnly) {
      result = result.filter(
        (product) => product.stock > 0
      );
    }

    // SEARCH FILTER
    if (searchQuery.trim()) {
      const query = searchQuery.trim().toLowerCase();

      result = result.filter(
        (product) =>
          product.name.toLowerCase().includes(query) ||
          product.category.toLowerCase().includes(query) ||
          product.weight.toLowerCase().includes(query)
      );
    }

    // SORT PRODUCTS
    if (sortBy === "price-asc") {
      result.sort((a, b) => a.price - b.price);
    }

    if (sortBy === "price-desc") {
      result.sort((a, b) => b.price - a.price);
    }

    if (sortBy === "name-asc") {
      result.sort((a, b) =>
        a.name.localeCompare(b.name)
      );
    }

    return result;
  }, [
    selectedCategory,
    maxPrice,
    inStockOnly,
    searchQuery,
    sortBy,
  ]);

  // SHOP PAGE UI

  return (
    <main className="shop-page">

      {/* NAVBAR */}
      <Navbar />

      {/* SHOP CONTAINER */}
      <div className="shop-page-container">

        {/* BREADCRUMB */}
        <ShopBreadcrumb />

        <div className="shop-layout">

          {/* LEFT SIDEBAR */}
          <ShopSidebar
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            maxPrice={maxPrice}
            onMaxPriceChange={setMaxPrice}
            inStockOnly={inStockOnly}
            onInStockChange={setInStockOnly}
            onClearFilters={clearFilters}
          />

          {/* RIGHT PRODUCT SECTION */}
          <section className="shop-main">

            {/* TOOLBAR */}
            <ShopToolbar
              selectedCategory={selectedCategory}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              sortBy={sortBy}
              onSortChange={setSortBy}
              productCount={filteredProducts.length}
            />

            {/* PRODUCT GRID */}
            <ProductGrid
              products={filteredProducts}
            />

          </section>

        </div>
      </div>

      {/* PROMOTIONAL BANNER */}
      <ShopPromoBanner />

      {/* FOOTER */}
      <Footer />

    </main>
  );
}
