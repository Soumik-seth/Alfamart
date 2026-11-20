
import Link from "next/link";
import { Suspense } from "react";
import { connection } from "next/server";

const email = process.env.NEXT_PUBLIC_CONTACT_EMAIL || "";

const socialLinks = {
  instagram: process.env.NEXT_PUBLIC_INSTAGRAM_URL || "",
  facebook: process.env.NEXT_PUBLIC_FACEBOOK_URL || "",
};

const quickLinks = [
  { name: "Home", href: "/" },
  { name: "Shop", href: "/shop" },
  { name: "Gift Hamper", href: "/gift-hamper" },
];

const policyLinks = [
  { name: "Privacy Policy", href: "/privacy-policy" },
  { name: "Refund Policy", href: "/refund-policy" },
  { name: "Shipping Policy", href: "/shipping-policy" },
  { name: "Terms & Conditions", href: "/terms-conditions" },
];

async function CopyrightYear() {
  await connection();
  return new Date().getFullYear();
}

export default function Footer() {
  return (
    <footer className="bg-[#244B32] text-[#F8F5E9]">
      <div className="max-w-7xl mx-auto px-6 pt-14 pb-8">

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Brand */}
          <div>
            <Link href="/" className="inline-flex items-center gap-2">
              <span className="text-3xl text-[#D7C99B]">✿</span>
              <span className="text-2xl font-bold tracking-wide">
                ALFA MART
              </span>
            </Link>

            <p className="text-sm text-[#E2E8D8] leading-7 mt-5 max-w-xs">
              Bringing nature&apos;s goodness to your everyday life.
              Discover authentic, natural and quality products
              for a healthier lifestyle.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-5">Quick Links</h3>

            <ul className="space-y-3 text-sm text-[#E2E8D8]">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="hover:text-[#D7C99B] transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Policies */}
          <div>
            <h3 className="text-lg font-semibold mb-5">
              Customer Support
            </h3>

            <ul className="space-y-3 text-sm text-[#E2E8D8]">
              {policyLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="hover:text-[#D7C99B] transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact & Social */}
          <div>
            <h3 className="text-lg font-semibold mb-5">
              Get In Touch
            </h3>

            {email && (
              <a
                href={`mailto:${email}`}
                className="flex items-center gap-3 text-sm text-[#E2E8D8] hover:text-[#D7C99B] break-all"
              >
                <span>✉</span>
                {email}
              </a>
            )}

            <h4 className="text-sm font-semibold mt-7 mb-4">
              Follow Us
            </h4>

            <div className="flex items-center gap-4">

              {socialLinks.instagram && (
                <a
                  href={socialLinks.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="w-10 h-10 rounded-full bg-[#365E42] flex items-center justify-center hover:bg-[#D7C99B] hover:text-[#244B32] transition"
                >
                  <span className="text-xl">◎</span>
                </a>
              )}

              {socialLinks.facebook && (
                <a
                  href={socialLinks.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="w-10 h-10 rounded-full bg-[#365E42] flex items-center justify-center hover:bg-[#D7C99B] hover:text-[#244B32] transition"
                >
                  <span className="font-bold text-xl">f</span>
                </a>
              )}

            </div>
          </div>
        </div>

       {/* Copyright */}
<div className="border-t border-[#54715B] mt-12 pt-6 text-center">
  <p className="text-xs sm:text-sm text-[#D8E0D2]">
    {"©"}{" "}
    <Suspense fallback={null}>
      <CopyrightYear />
    </Suspense>{" "}
    AlfaMart. All Rights Reserved.
  </p>
</div>

      </div>
    </footer>
  );
}
