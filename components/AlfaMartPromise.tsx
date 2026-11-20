
import {
  Leaf,
  ShieldCheck,
  BadgeCheck,
  Truck,
  HeartPulse,
  Sprout,
} from "lucide-react";

const promises = [
  {
    icon: Leaf,
    title: "Naturally Sourced",
  },
  {
    icon: ShieldCheck,
    title: "No Harmful Chemicals",
  },
  {
    icon: BadgeCheck,
    title: "Quality Assured",
  },
  {
    icon: Truck,
    title: "Pan India Shipping",
  },
  {
    icon: HeartPulse,
    title: "Supports Healthy Living",
  },
  {
    icon: Sprout,
    title: "Better Choices for a Greener Tomorrow",
  },
];

export default function AlfaMartPromise() {
  return (
    <section className="bg-[#F8F5E9] py-12 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
          {promises.map((item, index) => {
            const Icon = item.icon;

            return (
              <div
                key={index}
                className="flex flex-col items-center text-center gap-3"
              >
                <div className="w-16 h-16 rounded-full bg-[#E7EEDC] flex items-center justify-center">
                  <Icon
                    size={30}
                    strokeWidth={1.7}
                    className="text-[#426B3D]"
                  />
                </div>

                <h3 className="text-sm sm:text-base font-semibold text-[#315638] leading-snug">
                  {item.title}
                </h3>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
