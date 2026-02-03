import { DayStatus } from '@/types/goals';
import { cn } from '@/lib/utils';
import { Check, X, Circle, Minus } from 'lucide-react';

interface StatusIndicatorProps {
  status: DayStatus;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

const statusConfig = {
  hit: {
    icon: Check,
    label: 'Hit',
    className: 'bg-rag-green-light text-rag-green',
    dotClassName: 'bg-rag-green',
  },
  miss: {
    icon: X,
    label: 'Miss',
    className: 'bg-rag-red-light text-rag-red',
    dotClassName: 'bg-rag-red',
  },
  partial: {
    icon: Minus,
    label: 'Partial',
    className: 'bg-rag-amber-light text-rag-amber',
    dotClassName: 'bg-rag-amber',
  },
  pending: {
    icon: Circle,
    label: 'Pending',
    className: 'bg-muted text-muted-foreground',
    dotClassName: 'bg-muted-foreground/50',
  },
};

const sizeConfig = {
  sm: {
    container: 'h-5 w-5',
    icon: 'h-3 w-3',
    dot: 'h-2 w-2',
    text: 'text-xs',
  },
  md: {
    container: 'h-6 w-6',
    icon: 'h-3.5 w-3.5',
    dot: 'h-2.5 w-2.5',
    text: 'text-sm',
  },
  lg: {
    container: 'h-8 w-8',
    icon: 'h-4 w-4',
    dot: 'h-3 w-3',
    text: 'text-base',
  },
};

export const StatusIndicator = ({ status, size = 'md', showLabel = false }: StatusIndicatorProps) => {
  const config = statusConfig[status];
  const sizeClass = sizeConfig[size];
  const Icon = config.icon;

  return (
    <div className={cn('flex items-center gap-1.5', showLabel && 'gap-2')}>
      <div
        className={cn(
          'flex items-center justify-center rounded-full',
          config.className,
          sizeClass.container
        )}
      >
        <Icon className={sizeClass.icon} />
      </div>
      {showLabel && (
        <span className={cn('font-medium', sizeClass.text, 'text-foreground')}>
          {config.label}
        </span>
      )}
    </div>
  );
};

export const StatusDot = ({ status, size = 'md' }: { status: DayStatus; size?: 'sm' | 'md' | 'lg' }) => {
  const config = statusConfig[status];
  const sizeClass = sizeConfig[size];

  return (
    <div className={cn('rounded-full', config.dotClassName, sizeClass.dot)} />
  );
};

export const RAGBadge = ({ status, className }: { status: DayStatus; className?: string }) => {
  const config = statusConfig[status];
  
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium',
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
};
