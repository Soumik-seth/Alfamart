
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

      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 pt-20 pb-16">

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-16">

          {/* Brand Section */}
          <div className="lg:col-span-1">

            <Link href="/" className="inline-flex items-center gap-3 group">
              <span className="text-4xl text-[#D7C99B] transition-transform duration-300 group-hover:rotate-12">
                ✿
              </span>

              <span className="text-3xl font-bold tracking-wider">
                ALFA MART
              </span>
            </Link>

            <p className="text-sm text-[#E2E8D8] leading-8 mt-7 max-w-xs">
              Bringing nature&apos;s goodness to your everyday life.
              Discover authentic, natural and quality products
              for a healthier and happier lifestyle.
            </p>

            <div className="mt-7">
              <span className="inline-block text-xs tracking-[3px] uppercase text-[#D7C99B] border-b border-[#D7C99B] pb-2">
                Naturally Better Living
              </span>
            </div>

          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-7 text-[#D7C99B]">
              Quick Links
            </h3>

            <ul className="space-y-5 text-sm text-[#E2E8D8]">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="inline-flex items-center gap-2 hover:text-[#D7C99B] hover:translate-x-1 transition-all duration-300"
                  >
                    <span className="text-[#D7C99B]">›</span>
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Support */}
          <div>
            <h3 className="text-lg font-semibold mb-7 text-[#D7C99B]">
              Customer Support
            </h3>

            <ul className="space-y-5 text-sm text-[#E2E8D8]">
              {policyLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="inline-flex items-center gap-2 hover:text-[#D7C99B] hover:translate-x-1 transition-all duration-300"
                  >
                    <span className="text-[#D7C99B]">›</span>
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact & Social */}
          <div>
            <h3 className="text-lg font-semibold mb-7 text-[#D7C99B]">
              Get In Touch
            </h3>

            <p className="text-sm text-[#E2E8D8] leading-7 mb-5">
              Have a question? We&apos;d love to hear from you.
              Get in touch with our team.
            </p>

            {email && (
              <a
                href={`mailto:${email}`}
                className="flex items-center gap-3 text-sm text-[#E2E8D8] hover:text-[#D7C99B] break-all transition-colors"
              >
                <span className="text-xl text-[#D7C99B]">✉</span>
                {email}
              </a>
            )}

            <h4 className="text-sm font-semibold mt-9 mb-5 text-[#D7C99B]">
              Follow Us
            </h4>

            <div className="flex items-center gap-4">

              {socialLinks.instagram && (
                <a
                  href={socialLinks.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="w-11 h-11 rounded-full border border-[#789477] bg-[#365E42] flex items-center justify-center hover:bg-[#D7C99B] hover:text-[#244B32] hover:-translate-y-1 transition-all duration-300"
                >
                  <span className="text-2xl">◎</span>
                </a>
              )}

              {socialLinks.facebook && (
                <a
                  href={socialLinks.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="w-11 h-11 rounded-full border border-[#789477] bg-[#365E42] flex items-center justify-center hover:bg-[#D7C99B] hover:text-[#244B32] hover:-translate-y-1 transition-all duration-300"
                >
                  <span className="font-bold text-2xl">f</span>
                </a>
              )}

            </div>
          </div>

        </div>

        {/* Decorative Divider */}
        <div className="border-t border-[#54715B] mt-16 pt-8">

          <div className="flex flex-col sm:flex-row items-center justify-between gap-5">

            <p className="text-xs sm:text-sm text-[#D8E0D2] text-center">
              {"©"}{" "}
              <Suspense fallback={null}>
                <CopyrightYear />
              </Suspense>{" "}
              AlfaMart. All Rights Reserved.
            </p>

            <p className="text-xs sm:text-sm text-[#D8E0D2] tracking-wide">
              Made with <span className="text-[#D7C99B]">♥</span> for a healthier lifestyle
            </p>

          </div>
        </div>

      </div>
    </footer>
  );
}
