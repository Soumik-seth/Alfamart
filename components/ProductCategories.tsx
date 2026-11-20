
import Link from "next/link";
import Image from "next/image";

const categories = [
  {
    name: "A2 Gir Cow Ghee",
    image: "/images/gee.png",
    slug: "ghee",
  },
  {
    name: "Honey",
    image: "/images/honey.png",
    slug: "honey",
  },
  {
    name: "Cold Pressed / Wood Pressed Oil",
    image: "/images/oil.png",
    slug: "oil",
  },
  {
    name: "CTC & Floral Tea",
    image: "/images/tea.png",
    slug: "tea",
  },
  {
    name: "Juice, Jams & Chutney",
    image: "/images/juice.png",
    slug: "juice-jams-chutney",
  },
  {
    name: "Seeds, Spreads & Dryfruits",
    image: "/images/seeds.png",
    slug: "seeds-dryfruits",
  },
  {
    name: "Mithai",
    image: "/images/mithi.png",
    slug: "mithai",
  },
];

export default function ProductCategories() {
  return (
    <section className="categories-section">
      <div className="categories-container">

        <div className="categories-heading">
          <span className="categories-subtitle">
            EXPLORE OUR COLLECTION
          </span>

          <h2>
            Shop By <span>Categories</span>
          </h2>

          <p>
            Discover nature’s goodness through our carefully
            selected collection of authentic products.
          </p>
        </div>

        <div className="categories-grid">
          {categories.map((category) => (
            <Link
              href={`/shop?category=${category.slug}`}
              key={category.slug}
              className="category-card"
            >
              <div className="category-image">
                <Image
                  src={category.image}
                  alt={category.name}
                  fill
                  sizes="(max-width: 600px) 45vw, (max-width: 900px) 30vw, 22vw"
                  className="category-img"
                />
              </div>

              <h3>{category.name}</h3>
            </Link>
          ))}
        </div>

      </div>
    </section>
  );
}
