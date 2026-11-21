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

const CART_KEY = "alfamart-cart";

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

const COUNT = products.length;

// 3 copies: [clone][original][clone]
// Desktop/tablet e shudhu middle (original) set dekhay, clone gulo CSS e hidden.
// Mobile e 3 ta set-i thake, tai infinite loop hoy.
const loopProducts = [0, 1, 2].flatMap((setIndex) =>
  products.map((product) => ({
    product,
    setIndex,
    isClone: setIndex !== 1,
  }))
);

export default function FeaturedProducts() {
  const sliderRef = useRef<HTMLDivElement>(null);
  const addedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [activeIndex, setActiveIndex] = useState(0);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [lastAddedId, setLastAddedId] = useState<number | null>(null);

  // Load cart from localStorage
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem(CART_KEY);

      if (savedCart) {
        const parsed = JSON.parse(savedCart);
        if (Array.isArray(parsed)) setCartItems(parsed);
      }
    } catch (error) {
      console.error("Unable to load cart:", error);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (addedTimer.current) clearTimeout(addedTimer.current);
    };
  }, []);

  // Save cart and notify Navbar / other components
  const saveCart = (updatedCart: CartItem[]) => {
    setCartItems(updatedCart);

    try {
      localStorage.setItem(CART_KEY, JSON.stringify(updatedCart));
      window.dispatchEvent(new Event("cartUpdated"));
    } catch (error) {
      console.error("Unable to save cart:", error);
    }
  };

  // Add product to cart
  const handleAddToCart = (product: Product) => {
    // always read the latest cart, so other components' changes are not lost
    let currentCart: CartItem[] = cartItems;

    try {
      const saved = localStorage.getItem(CART_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) currentCart = parsed;
      }
    } catch {
      // fall back to state
    }

    const existingItem = currentCart.find((item) => item.id === product.id);

    const updatedCart: CartItem[] = existingItem
      ? currentCart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      : [...currentCart, { ...product, quantity: 1 }];

    saveCart(updatedCart);
    setLastAddedId(product.id);

    // Reset button text after 1.5 seconds
    if (addedTimer.current) clearTimeout(addedTimer.current);
    addedTimer.current = setTimeout(() => {
      setLastAddedId((current) => (current === product.id ? null : current));
    }, 1500);
  };

  // ---------- Slider helpers (mobile) ----------

  const getCards = () => {
    const slider = sliderRef.current;
    if (!slider) return [] as HTMLElement[];
    return Array.from(
      slider.querySelectorAll<HTMLElement>(".featured-card")
    );
  };

  const scrollByCard = (direction: 1 | -1) => {
    const slider = sliderRef.current;
    const cards = getCards();

    if (!slider || cards.length < 2) return;

    const step = cards[1].offsetLeft - cards[0].offsetLeft;

    slider.scrollBy({ left: direction * step, behavior: "smooth" });
  };

  const handleNext = () => scrollByCard(1);
  const handlePrev = () => scrollByCard(-1);

  // Dot click: sobcheye kachher copy te scroll korbe
  const scrollToProduct = (index: number) => {
    const slider = sliderRef.current;
    const cards = getCards();

    if (!slider || cards.length < COUNT * 3) return;

    const base = cards[0].offsetLeft;
    let target = 0;
    let bestDistance = Infinity;

    for (let set = 0; set < 3; set++) {
      const left = cards[set * COUNT + index].offsetLeft - base;
      const distance = Math.abs(left - slider.scrollLeft);

      if (distance < bestDistance) {
        bestDistance = distance;
        target = left;
      }
    }

    slider.scrollTo({ left: target, behavior: "smooth" });
  };

  // Infinite loop + active dot tracking (mobile only)
  useEffect(() => {
    const slider = sliderRef.current;
    if (!slider) return;

    const mq = window.matchMedia("(max-width: 600px)");
    let endTimer: ReturnType<typeof setTimeout> | undefined;
    let frame = 0;

    const cardsList = () =>
      Array.from(slider.querySelectorAll<HTMLElement>(".featured-card"));

    const getSetWidth = () => {
      const cards = cardsList();
      if (cards.length < COUNT * 2) return 0;
      return cards[COUNT].offsetLeft - cards[0].offsetLeft;
    };

    // simple instant jump (smooth scroll bondho kore)
    const jumpTo = (left: number) => {
      slider.style.scrollBehavior = "auto";
      slider.scrollLeft = left;
      slider.style.scrollBehavior = "";
    };

    // loop jump: ek set (+1 / -1) shorano hoy, ar card er
    // "is-visible" state ta copy hoye jay, tai kono blink / re-animation hoy na
    const jumpBySet = (direction: 1 | -1, setWidth: number) => {
      const cards = cardsList();
      const total = cards.length;
      const oldState = cards.map((card) =>
        card.classList.contains("is-visible")
      );

      slider.classList.add("is-jumping");

      jumpTo(slider.scrollLeft + direction * setWidth);

      const shift = direction * COUNT;

      cards.forEach((card, j) => {
        const was = oldState[(((j - shift) % total) + total) % total];
        card.classList.toggle("is-visible", was);
      });

      // style flush kore tarpor transition abar chalu
      void slider.offsetWidth;

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          slider.classList.remove("is-jumping");
        });
      });
    };

    // sob somoy middle set er moddhe rakhbe
    const normalize = () => {
      if (!mq.matches) return;

      const setWidth = getSetWidth();
      if (setWidth <= 0) return;

      const left = slider.scrollLeft;

      if (left < setWidth - 2) {
        jumpBySet(1, setWidth);
      } else if (left >= setWidth * 2 + 2) {
        jumpBySet(-1, setWidth);
      }
    };

    const updateActive = () => {
      if (!mq.matches) return;

      const cards = cardsList();
      if (!cards.length) return;

      const sliderLeft = slider.getBoundingClientRect().left;

      let closestIndex = 0;
      let closestDistance = Infinity;

      cards.forEach((card, index) => {
        const distance = Math.abs(
          card.getBoundingClientRect().left - sliderLeft
        );

        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = index;
        }
      });

      setActiveIndex(closestIndex % COUNT);
    };

    const onScroll = () => {
      if (!mq.matches) return;

      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(updateActive);

      clearTimeout(endTimer);
      endTimer = setTimeout(() => {
        normalize();
        updateActive();
      }, 140);
    };

    const setup = () => {
      if (mq.matches) {
        const setWidth = getSetWidth();

        if (setWidth > 0 && slider.scrollLeft < setWidth - 2) {
          // first load: middle set e niye jai (kono card ekhono visible na)
          jumpTo(slider.scrollLeft + setWidth);
        } else {
          normalize();
        }

        updateActive();
      } else {
        jumpTo(0);
        setActiveIndex(0);
      }
    };

    setup();

    slider.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", setup);
    mq.addEventListener("change", setup);

    return () => {
      clearTimeout(endTimer);
      cancelAnimationFrame(frame);
      slider.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", setup);
      mq.removeEventListener("change", setup);
    };
  }, []);

  // 360° rotate animation: card screen e ashle chalu hoy,
  // screen theke ber hole reset hoy, tai abar ashle abar rotate hoy
  useEffect(() => {
    const slider = sliderRef.current;
    if (!slider) return;

    const allCards = slider.querySelectorAll<HTMLElement>(".featured-card");

    if (typeof IntersectionObserver === "undefined") {
      allCards.forEach((card) => card.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const card = entry.target as HTMLElement;

          if (entry.intersectionRatio >= 0.35) {
            card.classList.add("is-visible");
          } else if (entry.intersectionRatio <= 0.05) {
            card.classList.remove("is-visible");
          }
        });
      },
      { threshold: [0, 0.05, 0.35] }
    );

    allCards.forEach((card) => observer.observe(card));

    return () => observer.disconnect();
  }, []);

  return (
    <section className="featured-section">
      <div className="featured-container">
        <div className="featured-heading">
          <span className="featured-subtitle">OUR COLLECTION</span>

          <h2>
            Featured <span>Products</span>
          </h2>

          <p>
            Discover our handpicked collection of natural and authentic
            products.
          </p>
        </div>

        <div className="featured-grid" ref={sliderRef}>
          {loopProducts.map(({ product, setIndex, isClone }) => (
            <div
              className={
                isClone ? "featured-card featured-clone" : "featured-card"
              }
              data-product={product.id}
              key={`${product.id}-${setIndex}`}
            >
              <div className="featured-image">
                <span className="discount-badge">{product.discount}</span>

                <Image
                  className="featured-img"
                  src={product.image}
                  alt={product.name}
                  width={300}
                  height={300}
                  sizes="(max-width: 600px) 50vw, (max-width: 900px) 33vw, 25vw"
                />
              </div>

              <div className="featured-details">
                <h3>{product.name}</h3>

                <span className="product-weight">{product.weight}</span>

                <div className="product-price">
                  <span className="current-price">₹{product.price}</span>

                  <span className="original-price">
                    ₹{product.originalPrice}
                  </span>
                </div>

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
                    {lastAddedId === product.id ? "Added ✓" : "Add to Cart"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Mobile arrows + dots */}
        <div className="featured-slider-controls">
          <button
            type="button"
            className="slider-arrow"
            onClick={handlePrev}
            aria-label="Previous products"
          >
            <ChevronLeft />
          </button>

          <div className="slider-dots">
            {products.map((product, index) => (
              <button
                type="button"
                key={product.id}
                className={
                  activeIndex === index ? "slider-dot active" : "slider-dot"
                }
                onClick={() => scrollToProduct(index)}
                aria-label={`Go to product ${index + 1}`}
              />
            ))}
          </div>

          <button
            type="button"
            className="slider-arrow"
            onClick={handleNext}
            aria-label="Next products"
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
