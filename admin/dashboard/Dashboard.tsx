
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { connection } from "next/server";
import styles from "@/admin/styles/AdminDashboard.module.css";

export default async function Dashboard() {
  await connection();
  const admin = await requireAdmin();

  const [totalUsers, totalCustomers, totalAdmins] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({
      where: { role: "CUSTOMER" },
    }),
    prisma.user.count({
      where: { role: "ADMIN" },
    }),
  ]);

  const stats = [
    {
      title: "Total Users",
      value: totalUsers,
      icon: "👥",
      description: "All registered accounts",
    },
    {
      title: "Customers",
      value: totalCustomers,
      icon: "🛍️",
      description: "Registered customers",
    },
    {
      title: "Administrators",
      value: totalAdmins,
      icon: "🛡️",
      description: "Admin accounts",
    },
  ];

  const actions = [
    {
      icon: "📦",
      title: "Products",
      description: "Add, edit and manage store products.",
      status: "Coming Soon",
    },
    {
      icon: "🧾",
      title: "Orders",
      description: "View and manage customer orders.",
      status: "Coming Soon",
    },
    {
      icon: "👤",
      title: "Customers",
      description: "View registered customer details.",
      status: "Coming Soon",
    },
    {
      icon: "⚙️",
      title: "Settings",
      description: "Manage your store settings.",
      status: "Coming Soon",
    },
  ];

  return (
    <main className={styles.dashboard}>
      <div className={styles.container}>
        <header className={styles.header}>
          <div>
            <p className={styles.brand}>ALFAMART · ADMIN PANEL</p>
            <h1 className={styles.title}>Dashboard</h1>
            <p className={styles.welcome}>
              Welcome back, {admin.name}!
            </p>
          </div>

          <div className={styles.profile}>
            <div className={styles.avatar}>
              {admin.name.charAt(0).toUpperCase()}
            </div>

            <div className={styles.profileInfo}>
              <strong>{admin.name}</strong>
              <span>Administrator</span>
            </div>
          </div>
        </header>

        <section className={styles.statsGrid}>
          {stats.map((stat) => (
            <article className={styles.statCard} key={stat.title}>
              <div className={styles.statIcon}>{stat.icon}</div>

              <div className={styles.statInfo}>
                <p>{stat.title}</p>
                <h2>{stat.value}</h2>
                <span>{stat.description}</span>
              </div>
            </article>
          ))}
        </section>

        <section className={styles.overview}>
          <div className={styles.sectionHeading}>
            <div>
              <p className={styles.eyebrow}>STORE MANAGEMENT</p>
              <h2>Quick Overview</h2>
              <p>Manage your AlfaMart store from one place.</p>
            </div>
          </div>

          <div className={styles.quickGrid}>
            {actions.map((item) => (
              <article className={styles.quickCard} key={item.title}>
                <div className={styles.quickIcon}>{item.icon}</div>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
                <span className={styles.status}>{item.status}</span>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.adminInfo}>
          <div>
            <p className={styles.eyebrow}>ACCOUNT INFORMATION</p>
            <h2>Admin Account</h2>
            <p className={styles.email}>{admin.email}</p>
          </div>

          <span className={styles.adminBadge}>ADMIN</span>
        </section>
      </div>
    </main>
  );
}
