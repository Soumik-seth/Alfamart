
import Image from "next/image";

export default function StoryElixir() {
  return (
    <section className="w-full bg-[#F8F5E9] py-8 sm:py-12">
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-6">
        <div className="relative w-full">
          <Image
            src="/images/story-elixir.png"
            alt="Our Story and Nature's Golden Elixir"
            width={1600}
            height={750}
            priority={false}
            className="w-full h-auto object-contain"
            sizes="100vw"
          />
        </div>
      </div>
    </section>
  );
}
