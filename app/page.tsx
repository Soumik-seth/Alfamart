
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import ProductCategories from "@/components/ProductCategories";
import FeaturedProducts from "@/components/FeaturedProducts";
import Footer from "@/components/Footer";
import AlfaMartPromise from "@/components/AlfaMartPromise";
import StoryElixir from "@/components/StoryElixir";
export default function Home() {
  return (
    <main>
      <Navbar />
      <Hero />
      <ProductCategories />
      <FeaturedProducts />
      <AlfaMartPromise />
      <StoryElixir />
      <Footer />
    </main>
  );
}
