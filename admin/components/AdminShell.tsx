
"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Layers,
  ShoppingCart,
  Users,
  Ticket,
  Warehouse,
  Gift,
  Truck,
  Star,
  FileText,
  Image,
  Settings,
  LogOut,
  Menu,
  X,
  Store,
  ChevronRight,
} from "lucide-react";
import styles from "@/admin/styles/AdminLayout.module.css";

const navigation = [
  {
    title: "MAIN MENU",
    items: [
      { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
      { name: "Products", href: "/admin/products", icon: Package },
      { name: "Categories", href: "/admin/categories", icon: Layers },
      { name: "Orders", href: "/admin/orders", icon: ShoppingCart },
      { name: "Customers", href: "/admin/customers", icon: Users },
    ],
  },
  {
    title: "STORE MANAGEMENT",
    items: [
      { name: "Coupons", href: "/admin/coupons", icon: Ticket },
      { name: "Inventory", href: "/admin/inventory", icon: Warehouse },
      { name: "Gift Hampers", href: "/admin/gift-hampers", icon: Gift },
      { name: "Shipping", href: "/admin/shipping", icon: Truck },
      { name: "Reviews", href: "/admin/reviews", icon: Star },
    ],
  },
  {
    title: "WEBSITE",
    items: [
      { name: "Policy Management", href: "/admin/policies", icon: FileText },
      { name: "Homepage", href: "/admin/homepage", icon: Image },
      { name: "Settings", href: "/admin/settings", icon: Settings },
    ],
  },
];

export default function AdminShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    if (loggingOut) return;

    setLoggingOut(true);

    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Logout failed");
      }

      router.replace("/login");
      router.refresh();
    } catch (error) {
      console.error("Logout error:", error);
      setLoggingOut(false);
      alert("Unable to logout. Please try again.");
    }
  }

  function closeSidebar() {
    setSidebarOpen(false);
  }

  return (
    <div className={styles.adminLayout}>
      {sidebarOpen && (
        <button
          className={styles.overlay}
          onClick={closeSidebar}
          aria-label="Close sidebar"
        />
      )}

      <aside
        className={`${styles.sidebar} ${
          sidebarOpen ? styles.sidebarOpen : ""
        }`}
      >
        <div className={styles.logoArea}>
          <div className={styles.logoIcon}>
            <Store size={25} />
          </div>

          <div className={styles.logoText}>
            <h2>ALFAMART</h2>
            <span>ADMIN PANEL</span>
          </div>

          <button
            className={styles.closeButton}
            onClick={closeSidebar}
            aria-label="Close menu"
          >
            <X size={21} />
          </button>
        </div>

        <div className={styles.sidebarContent}>
          {navigation.map((group) => (
            <div className={styles.navGroup} key={group.title}>
              <p className={styles.groupTitle}>{group.title}</p>

              {group.items.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={closeSidebar}
                    className={`${styles.navLink} ${
                      active ? styles.activeLink : ""
                    }`}
                  >
                    <Icon size={19} strokeWidth={1.9} />

                    <span>{item.name}</span>

                    {active && (
                      <ChevronRight
                        size={16}
                        className={styles.activeArrow}
                      />
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </div>

        <div className={styles.sidebarBottom}>
          <div className={styles.storeNote}>
            <div className={styles.storeNoteIcon}>
              <Store size={19} />
            </div>
            <div>
              <strong>AlfaMart Store</strong>
              <span>Manage your business</span>
            </div>
          </div>

          <button
            className={styles.logoutButton}
            onClick={handleLogout}
            disabled={loggingOut}
          >
            <LogOut size={19} />
            <span>{loggingOut ? "Logging out..." : "Logout"}</span>
          </button>
        </div>
      </aside>

      <div className={styles.mainArea}>
        <header className={styles.topbar}>
          <div className={styles.topbarLeft}>
            <button
              className={styles.menuButton}
              onClick={() => setSidebarOpen(true)}
              aria-label="Open sidebar"
            >
              <Menu size={23} />
            </button>

            <div>
              <p className={styles.topbarTitle}>Admin Dashboard</p>
              <span className={styles.breadcrumb}>
                AlfaMart <span>/</span> Admin Panel
              </span>
            </div>
          </div>

          <div className={styles.topbarRight}>
            <div className={styles.adminAvatar}>A</div>
            <div className={styles.topbarProfile}>
              <strong>Administrator</strong>
              <span>Store Manager</span>
            </div>
          </div>
        </header>

        <div className={styles.pageContent}>{children}</div>
      </div>
    </div>
  );
}
