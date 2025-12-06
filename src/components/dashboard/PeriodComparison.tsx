import { useMemo } from 'react';
import { LinkedInPost } from '@/hooks/useLinkedInData';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PeriodComparisonProps {
  currentData: LinkedInPost[];
  previousData: LinkedInPost[];
}

interface MetricComparison {
  label: string;
  current: number;
  previous: number;
  change: number;
  format: 'number' | 'percent';
}

export function PeriodComparison({ currentData, previousData }: PeriodComparisonProps) {
  const comparison = useMemo((): MetricComparison[] => {
    const calculateMetrics = (data: LinkedInPost[]) => ({
      impressions: data.reduce((sum, item) => 
        sum + (typeof item.Impresiones === 'number' ? item.Impresiones : 0), 0
      ),
      interactions: data.reduce((sum, item) => 
        sum + (typeof item.Interacciones === 'number' ? item.Interacciones : 0), 0
      ),
      engagement: data.length > 0
        ? data.reduce((sum, item) => 
            sum + (typeof item['Tasa de interacción'] === 'number' ? item['Tasa de interacción'] : 0), 0
          ) / data.length * 100
        : 0,
      posts: data.length
    });

    const current = calculateMetrics(currentData);
    const previous = calculateMetrics(previousData);

    const calcChange = (curr: number, prev: number) => 
      prev === 0 ? (curr > 0 ? 100 : 0) : ((curr - prev) / prev) * 100;

    return [
      {
        label: 'Impresiones',
        current: current.impressions,
        previous: previous.impressions,
        change: calcChange(current.impressions, previous.impressions),
        format: 'number'
      },
      {
        label: 'Interacciones',
        current: current.interactions,
        previous: previous.interactions,
        change: calcChange(current.interactions, previous.interactions),
        format: 'number'
      },
      {
        label: 'Engagement',
        current: current.engagement,
        previous: previous.engagement,
        change: calcChange(current.engagement, previous.engagement),
        format: 'percent'
      },
      {
        label: 'Posts',
        current: current.posts,
        previous: previous.posts,
        change: calcChange(current.posts, previous.posts),
        format: 'number'
      }
    ];
  }, [currentData, previousData]);

  const formatValue = (value: number, format: 'number' | 'percent') => {
    if (format === 'percent') return `${value.toFixed(2)}%`;
    return value.toLocaleString('es-ES');
  };

  return (
    <div className="chart-container mb-6 animate-fade-in">
      <h3 className="mb-4 text-lg font-semibold text-foreground">
        Comparación de Períodos
      </h3>
      
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {comparison.map((metric) => (
          <div 
            key={metric.label}
            className="rounded-lg border border-border bg-background p-4"
          >
            <p className="text-sm text-muted-foreground">{metric.label}</p>
            
            <div className="mt-2 flex items-end justify-between">
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {formatValue(metric.current, metric.format)}
                </p>
                <p className="text-xs text-muted-foreground">
                  vs {formatValue(metric.previous, metric.format)}
                </p>
              </div>
              
              <div className={cn(
                'flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium',
                metric.change > 0 && 'bg-success/10 text-success',
                metric.change < 0 && 'bg-destructive/10 text-destructive',
                metric.change === 0 && 'bg-muted text-muted-foreground'
              )}>
                {metric.change > 0 && <TrendingUp className="h-3 w-3" />}
                {metric.change < 0 && <TrendingDown className="h-3 w-3" />}
                {metric.change === 0 && <Minus className="h-3 w-3" />}
                {metric.change > 0 ? '+' : ''}{metric.change.toFixed(1)}%
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
