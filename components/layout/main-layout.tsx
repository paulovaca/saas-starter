'use client';

import Link from 'next/link';
import { useState, Suspense } from 'react';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ToastProvider } from '@/components/ui/toast';
import { 
  CircleIcon, 
  Home, 
  LogOut, 
  Users, 
  FileText, 
  Settings, 
  BarChart3, 
  UserCog,
  Menu,
  X,
  Target,
  Package,
  Building2,
  User
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ThemeToggle } from '@/components/shared/theme-toggle';
import { signOutSimple } from '@/app/(login)/actions';
import { useRouter } from 'next/navigation';
import { User as UserType } from '@/lib/db/schema';
import { usePermissions } from '@/hooks/use-permissions';
import useSWR, { mutate } from 'swr';
import styles from './main-layout.module.css';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface NavigationItem {
  href: string;
  label: string;
  icon: React.ComponentType<any>;
  requiredPermission?: string;
}

// Itens de navegação principais (visíveis para todos)
const mainNavigationItems: NavigationItem[] = [
  {
    href: '/',
    label: 'Dashboard',
    icon: Home,
  },
  {
    href: '/clients',
    label: 'Clientes',
    icon: Users,
  },
  {
    href: '/proposals',
    label: 'Propostas',
    icon: FileText,
  },
  {
    href: '/reports',
    label: 'Relatórios',
    icon: BarChart3,
  },
];

// Itens administrativos (visíveis apenas para MASTER e ADMIN)
const adminNavigationItems: NavigationItem[] = [
  {
    href: '/users',
    label: 'Usuários',
    icon: UserCog,
    requiredPermission: 'canAccessUsers',
  },
  {
    href: '/funnels',
    label: 'Funis de Venda',
    icon: Target,
    requiredPermission: 'canManageFunnels',
  },
  {
    href: '/catalog',
    label: 'Itens Base',
    icon: Package,
    requiredPermission: 'canManageBaseItems',
  },
  {
    href: '/operators',
    label: 'Operadoras',
    icon: Building2,
    requiredPermission: 'canManageOperators',
  },
];

function UserMenu() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const { data: user } = useSWR<UserType>('/api/user', fetcher);
  const router = useRouter();

  async function handleSignOut() {
    setIsSigningOut(true);
    
    try {
      await mutate('/api/user', null, false);
      
      try {
        await signOutSimple();
      } catch (serverActionError) {
        console.log('Server action failed, trying API route:', serverActionError);
        
        const response = await fetch('/api/auth/logout', {
          method: 'POST',
          credentials: 'include'
        });
        
        if (response.ok) {
          window.location.href = '/sign-in';
        } else {
          throw new Error('API logout failed');
        }
      }
      
    } catch (error) {
      console.error('Error during sign out:', error);
      window.location.href = '/sign-in';
    } finally {
      setIsSigningOut(false);
    }
  }

  if (!user) {
    return null;
  }

  return (
    <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
      <DropdownMenuTrigger className={styles.userMenuTrigger}>
        <Avatar className={styles.avatar}>
          <AvatarImage alt={user.name || ''} src={user.avatar || ''} />
          <AvatarFallback>
            {(user.name || user.email)
              .split(' ')
              .map((n: string) => n[0])
              .join('')
              .toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className={styles.userInfo}>
          <span className={styles.userName}>{user.name}</span>
          <span className={styles.userRole}>{user.role}</span>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className={styles.dropdownContent}>
        <DropdownMenuItem className={styles.dropdownItem} onClick={() => setIsMenuOpen(false)}>
          <Link href="/profile" className={styles.dropdownLink}>
            <User className={styles.dropdownIcon} />
            <span>Meu Perfil</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem className={styles.dropdownItem} onClick={() => setIsMenuOpen(false)}>
          <Link href="/settings" className={styles.dropdownLink}>
            <Settings className={styles.dropdownIcon} />
            <span>Configurações</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem 
          className={styles.signOutItem}
          onClick={handleSignOut}
          disabled={isSigningOut}
        >
          <LogOut className={styles.dropdownIcon} />
          <span>{isSigningOut ? 'Saindo...' : 'Sair'}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function Sidebar({ isOpen, onToggle }: { isOpen: boolean; onToggle: () => void }) {
  const pathname = usePathname();
  const permissions = usePermissions();

  const isActiveLink = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  const hasPermission = (permission?: string) => {
    if (!permission) return true;
    return (permissions as any)[permission]?.();
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className={styles.mobileOverlay}
          onClick={onToggle}
        />
      )}
      
      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${isOpen ? styles.sidebarOpen : ''}`}>
        {/* Logo */}
        <div className={styles.sidebarHeader}>
          <Link href="/" className={styles.logoContainer}>
            <CircleIcon className={styles.logoIcon} />
            <span className={styles.logoText}>CRM Travel</span>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className={styles.mobileCloseButton}
          >
            <X className={styles.closeIcon} />
          </Button>
        </div>

        {/* Navigation */}
        <nav className={styles.navigation}>
          {/* Navegação Principal */}
          {mainNavigationItems.map((item) => {
            if (!hasPermission(item.requiredPermission)) {
              return null;
            }

            const Icon = item.icon;
            const isActive = isActiveLink(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`${styles.navLink} ${isActive ? styles.navLinkActive : ''}`}
                onClick={() => {
                  // Close mobile menu when link is clicked
                  if (window.innerWidth < 768) {
                    onToggle();
                  }
                }}
              >
                <Icon className={styles.navIcon} />
                <span className={styles.navLabel}>{item.label}</span>
              </Link>
            );
          })}

          {/* Funções Administrativas (apenas para MASTER e ADMIN) */}
          {hasPermission('canAccessUsers') && (
            <>
              <div className={styles.navigationSeparator}>
                <span className={styles.separatorText}>Funções Administrativas</span>
              </div>
              {adminNavigationItems.map((item) => {
                if (!hasPermission(item.requiredPermission)) {
                  return null;
                }

                const Icon = item.icon;
                const isActive = isActiveLink(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`${styles.navLink} ${isActive ? styles.navLinkActive : ''}`}
                    onClick={() => {
                      // Close mobile menu when link is clicked
                      if (window.innerWidth < 768) {
                        onToggle();
                      }
                    }}
                  >
                    <Icon className={styles.navIcon} />
                    <span className={styles.navLabel}>{item.label}</span>
                  </Link>
                );
              })}
            </>
          )}
        </nav>

        {/* User Menu */}
        <div className={styles.sidebarFooter}>
          <Suspense fallback={<div />}>
            <UserMenu />
          </Suspense>
        </div>
      </aside>
    </>
  );
}

function Header({ onMenuToggle }: { onMenuToggle: () => void }) {
  return (
    <header className={styles.header}>
      <div className={styles.headerContent}>
        <Button
          variant="ghost"
          size="sm"
          onClick={onMenuToggle}
          className={styles.menuToggle}
        >
          <Menu className={styles.menuIcon} />
        </Button>
        
        <div className={styles.headerActions}>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <ToastProvider>
      <div className={styles.layoutContainer}>
        <Sidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />
        
        <div className={styles.mainContent}>
          <Header onMenuToggle={toggleSidebar} />
          
          <main className={styles.pageContent}>
            {children}
          </main>
        </div>
      </div>
    </ToastProvider>
  );
}
