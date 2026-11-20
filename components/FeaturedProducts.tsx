"use client";
import "../componentscss/FeaturedProducts.css";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
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

  const total = products.length;
  const loopProducts = [...products, ...products, ...products];

  const absRef = useRef(total); // loop er bhetore current card er position
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const getCards = () =>
    sliderRef.current?.querySelectorAll<HTMLElement>(".featured-card");

  /* majhkhaner set e silently jump (user bujhte parbe na) */
  const recenter = () => {
    const slider = sliderRef.current;
    const cards = getCards();
    if (!slider || !cards) return;
    if (slider.scrollWidth <= slider.clientWidth) return; // desktop e kichu korbe na

    const abs = absRef.current;
    if (abs >= total && abs < total * 2) return; // already majhkhane

    const shift = abs < total ? total : -total;
    const from = cards[abs];
    const to = cards[abs + shift];
    if (!from || !to) return;

    slider.classList.add("no-anim");

    // jei card gulo dekha jachhe, tader twin ke age thekei visible kore rakho
    cards.forEach((card, i) => {
      if (card.classList.contains("is-visible")) {
        cards[i + shift]?.classList.add("is-visible");
      }
    });

    slider.style.scrollSnapType = "none";
    slider.style.scrollBehavior = "auto";
    slider.scrollLeft = slider.scrollLeft + (to.offsetLeft - from.offsetLeft);
    absRef.current = abs + shift;

    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        slider.style.scrollSnapType = "";
        slider.style.scrollBehavior = "";
        slider.classList.remove("no-anim");
      })
    );
  };

  /* shuru te majhkhaner set er prothom card e boshao + rotation observer */
  useEffect(() => {
    const slider = sliderRef.current;
    const cards = getCards();
    if (!slider || !cards) return;

    if (slider.scrollWidth > slider.clientWidth && cards[total]) {
      slider.style.scrollSnapType = "none";
      slider.style.scrollBehavior = "auto";
      slider.scrollLeft = cards[total].offsetLeft - slider.offsetLeft;
      requestAnimationFrame(() => {
        slider.style.scrollSnapType = "";
        slider.style.scrollBehavior = "";
      });
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.intersectionRatio >= 0.5) {
            entry.target.classList.add("is-visible");
          } else if (entry.intersectionRatio === 0) {
            // card bahire gele reset, jate abar ashle abar ghure
            entry.target.classList.remove("is-visible");
          }
        });
      },
      { root: slider, threshold: [0, 0.5] }
    );

    cards.forEach((card) => observer.observe(card));

    return () => {
      observer.disconnect();
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [total]);

  const scrollToCard = (abs: number) => {
    const slider = sliderRef.current;
    const cards = getCards();
    if (!slider || !cards) return;

    const safe = Math.max(0, Math.min(cards.length - 1, abs));
    const target = cards[safe];
    if (!target) return;

    slider.scrollTo({
      left: target.offsetLeft - slider.offsetLeft,
      behavior: "smooth",
    });

    absRef.current = safe;
    setActiveIndex(((safe % total) + total) % total);
  };

  /* dot click: nearest set er oi product e jabe */
  const scrollToProduct = (index: number) => {
    const base = Math.floor(absRef.current / total) * total;
    scrollToCard(base + index);
  };

  /* arrow: shesh e gele first e ashbe, first e gele last e */
  const handlePrevious = () => scrollToCard(absRef.current - 1);
  const handleNext = () => scrollToCard(absRef.current + 1);

  const handleScroll = () => {
    const slider = sliderRef.current;
    const cards = getCards();
    if (!slider || !cards) return;

    let nearestIndex = 0;
    let smallestDistance = Infinity;

    cards.forEach((card, index) => {
      const distance = Math.abs(
        card.offsetLeft - slider.offsetLeft - slider.scrollLeft
      );
      if (distance < smallestDistance) {
        smallestDistance = distance;
        nearestIndex = index;
      }
    });

    absRef.current = nearestIndex;
    setActiveIndex(nearestIndex % total);

    // scroll thamle majhkhane jump korbe
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(recenter, 150);
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
          {loopProducts.map((product, i) => (
            <div
              className={`featured-card ${
                i < total || i >= total * 2 ? "featured-clone" : ""
              }`}
              key={`${product.id}-${i}`}
            >
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