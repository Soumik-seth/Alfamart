
import Image from "next/image";
import Link from "next/link";
import "../componentscss/Hero.css";

export default function Hero() {
  return (
    <section className="hero-section">

      <Image
        src="/images/hero.png"
        alt="Nature's Goodness - Alfa Mart"
        fill
        priority
        sizes="100vw"
        className="hero-image"
      />

      <div className="hero-content">
        <Link href="/shop" className="hero-button">
          Shop Now
        </Link>
      </div>

    </section>
  );
}
