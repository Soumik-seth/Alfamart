
import { 
  Leaf,
  ShieldCheck,
  BadgeCheck,
  Truck,
  HeartPulse,
  Sprout,
} from "lucide-react";

import "../componentscss/AlfaMartPromise.css";

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
    <section className="promise-section">
      <div className="promise-container">
        <div className="promise-grid">
          {promises.map((item, index) => {
            const Icon = item.icon;

            return (
              <div className="promise-item" key={index}>
                <div className="promise-icon">
                  <Icon size={30} strokeWidth={1.7} />
                </div>

                <h3>{item.title}</h3>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
