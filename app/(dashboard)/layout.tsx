'use client';

import Link from 'next/link';
import { use, useState, Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { CircleIcon, Home, LogOut, Users, FileText, Settings, BarChart3 } from 'lucide-react';
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
import { User } from '@/lib/db/schema';
import useSWR, { mutate } from 'swr';
import styles from './layout.module.css';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

function UserMenu() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const { data: user } = useSWR<User>('/api/user', fetcher);
  const router = useRouter();

  async function handleSignOut() {
    setIsSigningOut(true);
    
    try {
      // Clear user cache immediately for UI feedback
      await mutate('/api/user', null, false);
      
      // Try the server action first
      try {
        await signOutSimple();
      } catch (serverActionError) {
        console.log('Server action failed, trying API route:', serverActionError);
        
        // Fallback to API route
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
      
      // Force redirect as last resort
      window.location.href = '/sign-in';
    } finally {
      setIsSigningOut(false);
    }
  }

  if (!user) {
    return (
      <>
        <Link
          href="/pricing"
          className={styles.pricingLink}
        >
          Pricing
        </Link>
        <Button asChild className={styles.signUpButton}>
          <Link href="/sign-up">Sign Up</Link>
        </Button>
      </>
    );
  }

  return (
    <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
      <DropdownMenuTrigger>
        <Avatar className={styles.avatar}>
          <AvatarImage alt={user.name || ''} />
          <AvatarFallback>
            {(user.name || user.email)
              .split(' ')
              .map((n: string) => n[0])
              .join('')
              .toUpperCase()}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className={styles.dropdownContent}>
        <DropdownMenuItem className={styles.dropdownItem}>
          <Link href="/dashboard" className={styles.dropdownLink}>
            <Home className={styles.dropdownIcon} />
            <span>Dashboard</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem className={styles.dropdownItem}>
          <Link href="/dashboard/general" className={styles.dropdownLink}>
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

function Header() {
  const { data: user } = useSWR<User>('/api/user', fetcher);
  
  return (
    <header className={styles.header}>
      <div className={styles.headerContent}>
        <Link href="/dashboard" className={styles.logoContainer}>
          <CircleIcon className={styles.logoIcon} />
          <span className={styles.logoText}>CRM Travel</span>
        </Link>
        
        {/* Navigation Menu */}
        <nav className={styles.navigation}>
          <Link href="/dashboard" className={styles.navLink}>
            <Home className={styles.navIcon} />
            Dashboard
          </Link>
          <Link href="/dashboard/clients" className={styles.navLink}>
            <Users className={styles.navIcon} />
            Clientes
          </Link>
          <Link href="/dashboard/proposals" className={styles.navLink}>
            <FileText className={styles.navIcon} />
            Propostas
          </Link>
          <Link href="/dashboard/reports" className={styles.navLink}>
            <BarChart3 className={styles.navIcon} />
            Relatórios
          </Link>
        </nav>
        
        <div className={styles.userActions}>
          <ThemeToggle />
          <Suspense fallback={<div />}>
            <UserMenu />
          </Suspense>
        </div>
      </div>
    </header>
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <section className={styles.layoutContainer}>
      <Header />
      {children}
    </section>
  );
}
