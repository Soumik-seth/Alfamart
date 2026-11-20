
"use client";
import "../componentscss/FeaturedProducts.css";
import Link from "next/link";
import Image from "next/image";
import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const products = [
  {
    id: 1,
    name: "A2 Gir Cow Ghee",
    image: "/images/gee.png",
    weight: "500g",
    price: 499,
    originalPrice: 599,
    discount: "17% OFF",
    category: "ghee",
  },
  {
    id: 2,
    name: "Natural Pure Honey",
    image: "/images/honey.png",
    weight: "500g",
    price: 349,
    originalPrice: 399,
    discount: "13% OFF",
    category: "honey",
  },
  {
    id: 3,
    name: "Cold Pressed Oil",
    image: "/images/oil.png",
    weight: "1 Litre",
    price: 399,
    originalPrice: 499,
    discount: "20% OFF",
    category: "oil",
  },
  {
    id: 4,
    name: "Premium Floral Tea",
    image: "/images/tea.png",
    weight: "250g",
    price: 249,
    originalPrice: 299,
    discount: "17% OFF",
    category: "tea",
  },
  {
    id: 5,
    name: "Natural Fruit Juice",
    image: "/images/juice.png",
    weight: "500ml",
    price: 199,
    originalPrice: 249,
    discount: "20% OFF",
    category: "juice-jams-chutney",
  },
  {
    id: 6,
    name: "Healthy Seeds & Dryfruits",
    image: "/images/seeds.png",
    weight: "250g",
    price: 299,
    originalPrice: 349,
    discount: "14% OFF",
    category: "seeds-dryfruits",
  },
  {
    id: 7,
    name: "Traditional Homemade Mithai",
    image: "/images/mithi.png",
    weight: "500g",
    price: 449,
    originalPrice: 499,
    discount: "10% OFF",
    category: "mithai",
  },
];

export default function FeaturedProducts() {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const scrollToProduct = (index: number) => {
    const slider = sliderRef.current;
    if (!slider) return;

    const cards =
      slider.querySelectorAll<HTMLElement>(".featured-card");

    const target = cards[index];
    if (!target) return;

    slider.scrollTo({
      left: target.offsetLeft - slider.offsetLeft,
      behavior: "smooth",
    });

    setActiveIndex(index);
  };

  const handlePrevious = () => {
    scrollToProduct(Math.max(0, activeIndex - 1));
  };

  const handleNext = () => {
    scrollToProduct(
      Math.min(products.length - 1, activeIndex + 1)
    );
  };

  const handleScroll = () => {
    const slider = sliderRef.current;
    if (!slider) return;

    const cards =
      slider.querySelectorAll<HTMLElement>(".featured-card");

    let nearestIndex = 0;
    let smallestDistance = Infinity;

    cards.forEach((card, index) => {
      const distance = Math.abs(
        card.offsetLeft -
        slider.offsetLeft -
        slider.scrollLeft
      );

      if (distance < smallestDistance) {
        smallestDistance = distance;
        nearestIndex = index;
      }
    });

    setActiveIndex(nearestIndex);
  };

  return (
    <section className="featured-section">
      <div className="featured-container">

        <div className="featured-heading">
          <span className="featured-subtitle">
            HANDPICKED FOR YOU
          </span>

          <h2>
            Our <span>Featured Products</span>
          </h2>

          <p>
            Explore our most loved natural and authentic products,
            carefully selected for your everyday needs.
          </p>
        </div>

        <div
          className="featured-grid"
          ref={sliderRef}
          onScroll={handleScroll}
        >
          {products.map((product) => (
            <div className="featured-card" key={product.id}>

              <div className="featured-image">
                <span className="discount-badge">
                  {product.discount}
                </span>

                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  sizes="(max-width: 600px) 48vw, (max-width: 900px) 30vw, 22vw"
                  className="featured-img"
                />
              </div>

              <div className="featured-details">
                <h3>{product.name}</h3>

                <span className="product-weight">
                  {product.weight}
                </span>

                <div className="product-price">
                  <span className="current-price">
                    ₹{product.price}
                  </span>

                  <span className="original-price">
                    ₹{product.originalPrice}
                  </span>
                </div>

                <Link
                  href={`/shop?category=${product.category}`}
                  className="buy-now-btn"
                >
                  Buy Now
                </Link>
              </div>

            </div>
          ))}
        </div>

        <div className="featured-slider-controls">

          <button
            type="button"
            className="slider-arrow"
            onClick={handlePrevious}
            disabled={activeIndex === 0}
            aria-label="Previous product"
          >
            <ChevronLeft />
          </button>

          <div className="slider-dots">
            {products.map((product, index) => (
              <button
                key={product.id}
                type="button"
                className={`slider-dot ${
                  activeIndex === index ? "active" : ""
                }`}
                onClick={() => scrollToProduct(index)}
                aria-label={`Go to product ${index + 1}`}
              />
            ))}
          </div>

          <button
            type="button"
            className="slider-arrow"
            onClick={handleNext}
            disabled={activeIndex === products.length - 1}
            aria-label="Next product"
          >
            <ChevronRight />
          </button>

        </div>

        <div className="featured-footer">
          <Link href="/shop" className="view-all-btn">
            View All Products
          </Link>
        </div>

      </div>
    </section>
  );
}
