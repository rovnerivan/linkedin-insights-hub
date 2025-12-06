import { LucideIcon } from 'lucide-react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface KPICardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: number;
  variant?: 'default' | 'success' | 'warning' | 'info';
  delay?: number;
}

export function KPICard({ title, value, icon: Icon, trend, variant = 'default', delay = 0 }: KPICardProps) {
  const formattedValue = typeof value === 'number' 
    ? value.toLocaleString('es-ES', { maximumFractionDigits: 2 })
    : value;

  return (
    <div 
      className={cn('kpi-card opacity-0 animate-slide-up', variant)}
      style={{ animationDelay: `${delay}ms`, animationFillMode: 'forwards' }}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="mt-2 text-3xl font-bold text-foreground">{formattedValue}</p>
          
          {trend !== undefined && (
            <div className="mt-2 flex items-center gap-1">
              {trend >= 0 ? (
                <TrendingUp className="h-4 w-4 text-success" />
              ) : (
                <TrendingDown className="h-4 w-4 text-destructive" />
              )}
              <span className={cn(
                'text-sm font-medium',
                trend >= 0 ? 'text-success' : 'text-destructive'
              )}>
                {trend >= 0 ? '+' : ''}{trend.toFixed(1)}%
              </span>
            </div>
          )}
        </div>
        
        <div className={cn(
          'rounded-xl p-3',
          variant === 'success' && 'bg-success/10',
          variant === 'warning' && 'bg-warning/10',
          variant === 'info' && 'bg-info/10',
          variant === 'default' && 'bg-primary/10'
        )}>
          <Icon className={cn(
            'h-6 w-6',
            variant === 'success' && 'text-success',
            variant === 'warning' && 'text-warning',
            variant === 'info' && 'text-info',
            variant === 'default' && 'text-primary'
          )} />
        </div>
      </div>
    </div>
  );
}
