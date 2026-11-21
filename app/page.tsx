
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import ProductCategories from "@/components/ProductCategories";
import FeaturedProducts from "@/components/FeaturedProducts";
import Footer from "@/components/Footer";
import AlfaMartPromise from "@/components/AlfaMartPromise";
import StoryElixir from "@/components/StoryElixir";
import Reviews from "@/components/Reviews";
import AnnouncementBar from "@/components/AnnouncementBar";
export default function Home() {
  return (
    <main>
      <AnnouncementBar />
      <Navbar />
      <Hero />
      <ProductCategories />
      <FeaturedProducts />
      <StoryElixir />
      <AlfaMartPromise />
      <Reviews />
      <Footer />
    </main>
  );
}
