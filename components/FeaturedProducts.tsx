
"use client";

import "../componentscss/FeaturedProducts.css";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

type Product = {
  id: number;
  name: string;
  image: string;
  weight: string;
  price: number;
  originalPrice: number;
  discount: string;
  category: string;
};

type CartItem = Product & {
  quantity: number;
};

const products: Product[] = [
  {
    id: 1,
    name: "A2 Gir Cow Ghee",
    image: "/images/gee.png",
    weight: "500 ml",
    price: 650,
    originalPrice: 800,
    discount: "19% OFF",
    category: "ghee",
  },
  {
    id: 2,
    name: "Pure Natural Honey",
    image: "/images/honey.png",
    weight: "500 gm",
    price: 350,
    originalPrice: 450,
    discount: "22% OFF",
    category: "honey",
  },
  {
    id: 3,
    name: "Wood Pressed Oil",
    image: "/images/oil.png",
    weight: "1 Litre",
    price: 450,
    originalPrice: 550,
    discount: "18% OFF",
    category: "oil",
  },
  {
    id: 4,
    name: "Premium Floral Tea",
    image: "/images/tea.png",
    weight: "250 gm",
    price: 280,
    originalPrice: 350,
    discount: "20% OFF",
    category: "tea",
  },
  {
    id: 5,
    name: "Juice, Jam & Chutney",
    image: "/images/juice.png",
    weight: "Combo Pack",
    price: 399,
    originalPrice: 499,
    discount: "20% OFF",
    category: "juice",
  },
  {
    id: 6,
    name: "Seeds & Dry Fruits",
    image: "/images/seeds.png",
    weight: "250 gm",
    price: 320,
    originalPrice: 400,
    discount: "20% OFF",
    category: "seeds",
  },
  {
    id: 7,
    name: "Traditional Mithai",
    image: "/images/mithi.png",
    weight: "500 gm",
    price: 450,
    originalPrice: 550,
    discount: "18% OFF",
    category: "mithai",
  },
];

export default function FeaturedProducts() {
  const sliderRef = useRef<HTMLDivElement>(null);

  const [activeIndex, setActiveIndex] = useState(0);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [lastAddedId, setLastAddedId] = useState<number | null>(null);

  // Load cart from localStorage
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem("alfamart-cart");

      if (savedCart) {
        setCartItems(JSON.parse(savedCart));
      }
    } catch (error) {
      console.error("Unable to load cart:", error);
    }
  }, []);

  // Save cart and notify Navbar / other components
  const saveCart = (updatedCart: CartItem[]) => {
    setCartItems(updatedCart);

    try {
      localStorage.setItem(
        "alfamart-cart",
        JSON.stringify(updatedCart)
      );

      window.dispatchEvent(new Event("cartUpdated"));
    } catch (error) {
      console.error("Unable to save cart:", error);
    }
  };

  // Add product to cart
  const handleAddToCart = (product: Product) => {
    const existingItem = cartItems.find(
      (item) => item.id === product.id
    );

    let updatedCart: CartItem[];

    if (existingItem) {
      updatedCart = cartItems.map((item) =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
    } else {
      updatedCart = [
        ...cartItems,
        {
          ...product,
          quantity: 1,
        },
      ];
    }

    saveCart(updatedCart);
    setLastAddedId(product.id);

    // Reset button text after 1.5 seconds
    setTimeout(() => {
      setLastAddedId((current) =>
        current === product.id ? null : current
      );
    }, 1500);
  };

  // Existing slider functionality
  const scrollToCard = (index: number) => {
    if (!sliderRef.current) return;

    const cards = sliderRef.current.querySelectorAll(
      ".featured-product-card"
    );

    if (!cards[index]) return;

    cards[index].scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });

    setActiveIndex(index % products.length);
  };

  const handleNext = () => {
    scrollToCard(activeIndex + 1);
  };

  const handlePrev = () => {
    scrollToCard(
      activeIndex === 0
        ? products.length - 1
        : activeIndex - 1
    );
  };

  // Existing mobile infinite slider
  const displayProducts = [
    ...products,
    ...products,
    ...products,
  ];

  useEffect(() => {
    const slider = sliderRef.current;

    if (!slider) return;

    const handleScroll = () => {
      const cards = slider.querySelectorAll(
        ".featured-product-card"
      );

      if (!cards.length) return;

      const sliderCenter =
        slider.getBoundingClientRect().left +
        slider.offsetWidth / 2;

      let closestIndex = 0;
      let closestDistance = Infinity;

      cards.forEach((card, index) => {
        const rect = card.getBoundingClientRect();
        const cardCenter = rect.left + rect.width / 2;
        const distance = Math.abs(sliderCenter - cardCenter);

        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = index;
        }
      });

      setActiveIndex(closestIndex % products.length);
    };

    slider.addEventListener("scroll", handleScroll);

    return () => {
      slider.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <section className="featured-products-section">

      <div className="featured-products-heading">
        <span className="featured-small-title">
          OUR COLLECTION
        </span>

        <h2>
          Featured <span>Products</span>
        </h2>

        <p>
          Discover our handpicked collection of natural
          and authentic products.
        </p>
      </div>

      <div className="featured-products-wrapper">

        <button
          className="featured-arrow featured-arrow-left"
          onClick={handlePrev}
          aria-label="Previous products"
        >
          <ChevronLeft size={22} />
        </button>

        <div
          className="featured-products-slider"
          ref={sliderRef}
        >
          {displayProducts.map((product, index) => (
            <div
              className="featured-product-card"
              key={`${product.id}-${index}`}
            >
              <div className="featured-product-image">

                <span className="featured-discount">
                  {product.discount}
                </span>

                <Image
                  src={product.image}
                  alt={product.name}
                  width={300}
                  height={300}
                />

              </div>

              <div className="featured-product-info">

                <h3>{product.name}</h3>

                <p className="featured-product-weight">
                  {product.weight}
                </p>

                <div className="featured-product-price">
                  <span className="current-price">
                    ₹{product.price}
                  </span>

                  <span className="original-price">
                    ₹{product.originalPrice}
                  </span>
                </div>

                {/* Product Buttons */}
                <div className="product-buttons">

                  <Link
                    href={`/shop?category=${product.category}`}
                    className="buy-now-btn"
                  >
                    Buy Now
                  </Link>

                  <button
                    type="button"
                    className="add-to-cart-btn"
                    onClick={() => handleAddToCart(product)}
                  >
                    {lastAddedId === product.id
                      ? "Added ✓"
                      : "Add to Cart"}
                  </button>

                </div>

              </div>
            </div>
          ))}
        </div>

        <button
          className="featured-arrow featured-arrow-right"
          onClick={handleNext}
          aria-label="Next products"
        >
          <ChevronRight size={22} />
        </button>

      </div>

      {/* Slider Dots */}
      <div className="featured-slider-dots">
        {products.map((product, index) => (
          <button
            key={product.id}
            className={
              activeIndex === index
                ? "featured-dot active"
                : "featured-dot"
            }
            onClick={() => scrollToCard(index)}
            aria-label={`Go to product ${index + 1}`}
          />
        ))}
      </div>

    </section>
  );
}
