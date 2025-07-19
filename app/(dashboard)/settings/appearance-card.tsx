'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Palette, Sun, Moon, Monitor } from 'lucide-react';
import styles from './settings.module.css';

export function AppearanceCard() {
  const { theme, setTheme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className={styles.cardTitle}>
            <Palette className={styles.cardIcon} />
            Aparência
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className={styles.appearanceOptions}>
            <div className={styles.optionSkeleton} />
            <div className={styles.optionSkeleton} />
            <div className={styles.optionSkeleton} />
          </div>
        </CardContent>
      </Card>
    );
  }

  const currentTheme = theme === 'system' ? systemTheme : theme;

  const themeOptions = [
    {
      value: 'light',
      label: 'Claro',
      icon: Sun,
      description: 'Tema claro sempre ativo'
    },
    {
      value: 'dark',
      label: 'Escuro',
      icon: Moon,
      description: 'Tema escuro sempre ativo'
    },
    {
      value: 'system',
      label: 'Sistema',
      icon: Monitor,
      description: 'Segue a configuração do sistema'
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className={styles.cardTitle}>
          <Palette className={styles.cardIcon} />
          Aparência
        </CardTitle>
        <p className={styles.cardDescription}>
          Escolha o tema que deseja usar na aplicação
        </p>
      </CardHeader>
      <CardContent>
        <div className={styles.appearanceOptions}>
          {themeOptions.map((option) => {
            const IconComponent = option.icon;
            const isSelected = theme === option.value;
            const isCurrentTheme = currentTheme === option.value || 
              (option.value === 'system' && theme === 'system');

            return (
              <button
                key={option.value}
                className={`${styles.themeOption} ${isSelected ? styles.selected : ''}`}
                onClick={() => setTheme(option.value)}
                type="button"
              >
                <div className={styles.optionHeader}>
                  <div className={styles.optionIcon}>
                    <IconComponent className={styles.icon} />
                  </div>
                  <div className={styles.optionContent}>
                    <div className={styles.optionLabel}>
                      {option.label}
                      {isCurrentTheme && (
                        <span className={styles.currentBadge}>Atual</span>
                      )}
                    </div>
                    <div className={styles.optionDescription}>
                      {option.description}
                    </div>
                  </div>
                </div>
                <div className={styles.optionPreview}>
                  <div 
                    className={`${styles.preview} ${styles[`preview${option.value.charAt(0).toUpperCase() + option.value.slice(1)}`]}`}
                  >
                    <div className={styles.previewHeader} />
                    <div className={styles.previewContent}>
                      <div className={styles.previewLine} />
                      <div className={styles.previewLine} />
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
