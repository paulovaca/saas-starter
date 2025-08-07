import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

const Timeline = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('relative', className)}
    {...props}
  />
));
Timeline.displayName = 'Timeline';

const TimelineItem = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('relative pb-6 last:pb-0', className)}
    {...props}
  />
));
TimelineItem.displayName = 'TimelineItem';

const TimelinePoint = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'absolute left-0 top-1 z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 border-border bg-background',
      'before:absolute before:left-1/2 before:top-full before:h-6 before:w-0.5 before:-translate-x-1/2 before:bg-border before:content-[""]',
      'last:before:hidden',
      className
    )}
    {...props}
  />
));
TimelinePoint.displayName = 'TimelinePoint';

const TimelineContent = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('ml-12 py-2', className)}
    {...props}
  />
));
TimelineContent.displayName = 'TimelineContent';

export { Timeline, TimelineItem, TimelinePoint, TimelineContent };