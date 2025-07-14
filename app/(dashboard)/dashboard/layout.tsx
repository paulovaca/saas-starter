'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Users, Settings, Shield, Activity, Menu } from 'lucide-react';
import styles from './layout.module.css';

export default function DashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navItems = [
    { href: '/dashboard', icon: Settings, label: 'Agência' },
    { href: '/dashboard/general', icon: Settings, label: 'Geral' },
    { href: '/dashboard/activity', icon: Activity, label: 'Atividade' },
    { href: '/dashboard/security', icon: Shield, label: 'Segurança' }
  ];

  return (
    <div className={styles.container}>
      {/* Mobile header */}
      <div className={styles.mobileHeader}>
        <div>
          <span className={styles.headerTitle}>Configurações</span>
        </div>
        <Button
          className={styles.menuButton}
          variant="ghost"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          <Menu className={styles.menuIcon} />
          <span className={styles.srOnly}>Toggle sidebar</span>
        </Button>
      </div>

      <div className={styles.content}>
        {/* Sidebar */}
        <aside
          className={`${styles.sidebar} ${
            isSidebarOpen ? styles.open : styles.closed
          }`}
        >
          <nav className={styles.nav}>
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} passHref>
                <Button
                  variant={pathname === item.href ? 'secondary' : 'ghost'}
                  className={`${styles.navButton} ${
                    pathname === item.href ? styles.active : ''
                  }`}
                  onClick={() => setIsSidebarOpen(false)}
                >
                  <item.icon className={styles.navIcon} />
                  {item.label}
                </Button>
              </Link>
            ))}
          </nav>
        </aside>

        {/* Main content */}
        <main className={styles.main}>{children}</main>
      </div>
    </div>
  );
}
