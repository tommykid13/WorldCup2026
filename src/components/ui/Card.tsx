import { cn } from '@/lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export function Card({ children, className, hover = true }: CardProps) {
  return (
    <div
      className={cn(
        'bg-card rounded-xl border border-border overflow-hidden',
        hover && 'transition-all duration-200 hover:shadow-md hover:border-primary/20 hover:-translate-y-0.5',
        className
      )}
    >
      {children}
    </div>
  );
}
