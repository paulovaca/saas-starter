import './globals.css';
import type { Metadata, Viewport } from 'next';
import { Manrope } from 'next/font/google';
import { getUser, getAgencyForUser } from '@/lib/db/queries';
import { SWRConfig } from 'swr';
import { ThemeProvider } from '@/providers/theme-provider';
import styles from './layout.module.css';

export const metadata: Metadata = {
  title: 'CRM Travel - Sistema de Gestão para Agências de Viagem',
  description: 'Comece rapidamente com Next.js, Postgres e Stripe para sua agência de viagens.'
};

export const viewport: Viewport = {
  maximumScale: 1
};

const manrope = Manrope({ subsets: ['latin'] });

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="pt-BR"
      className={manrope.className}
      suppressHydrationWarning
    >
      <body className={styles.rootBody}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SWRConfig
            value={{
              fallback: {
                // We do NOT preload user data in root layout
                // Let components handle their own data loading
              }
            }}
          >
            {children}
          </SWRConfig>
        </ThemeProvider>
      </body>
    </html>
  );
}
