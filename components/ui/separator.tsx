import { cn } from '@/lib/utils';
import styles from './separator.module.css';

interface SeparatorProps {
  className?: string;
  orientation?: 'horizontal' | 'vertical';
}

export function Separator({ 
  className,
  orientation = 'horizontal',
  ...props 
}: SeparatorProps) {
  return (
    <div
      className={cn(
        styles.separator,
        orientation === 'vertical' ? styles.vertical : styles.horizontal,
        className
      )}
      {...props}
    />
  );
}