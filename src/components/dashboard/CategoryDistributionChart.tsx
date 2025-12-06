import { useState, useMemo } from 'react';
import type { LinkedInPost } from '@/types/linkedin';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip
} from 'recharts';
import { Button } from '@/components/ui/button';

interface CategoryDistributionChartProps {
  data: LinkedInPost[];
}

const COLORS = [
  'hsl(201, 100%, 36%)',
  'hsl(160, 84%, 39%)',
  'hsl(38, 92%, 50%)',
  'hsl(280, 65%, 60%)',
  'hsl(340, 75%, 55%)',
  'hsl(200, 80%, 60%)',
  'hsl(120, 60%, 45%)',
  'hsl(45, 90%, 55%)',
];

type ViewMode = 'QUE' | 'COMO' | 'combined';

export function CategoryDistributionChart({ data }: CategoryDistributionChartProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('QUE');

  const chartData = useMemo(() => {
    const counts: Record<string, number> = {};

    data.forEach(post => {
      let key = '';
      
      if (viewMode === 'QUE') {
        key = post.QUE || 'Sin QUÉ';
      } else if (viewMode === 'COMO') {
        key = post.COMO || 'Sin CÓMO';
      } else {
        // Combined
        const que = post.QUE || 'Sin QUÉ';
        const como = post.COMO || 'Sin CÓMO';
        key = `${que} + ${como}`;
      }
      
      counts[key] = (counts[key] || 0) + 1;
    });

    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [data, viewMode]);

  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  const getTitle = () => {
    switch (viewMode) {
      case 'QUE': return 'Distribución por QUÉ';
      case 'COMO': return 'Distribución por CÓMO';
      case 'combined': return 'Distribución QUÉ + CÓMO';
    }
  };

  return (
    <div className="chart-container animate-fade-in" style={{ animationDelay: '600ms' }}>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-lg font-semibold text-foreground">{getTitle()}</h3>
        
        <div className="flex gap-1 rounded-lg bg-muted p-1">
          <Button
            variant={viewMode === 'QUE' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('QUE')}
            className="text-xs"
          >
            QUÉ
          </Button>
          <Button
            variant={viewMode === 'COMO' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('COMO')}
            className="text-xs"
          >
            CÓMO
          </Button>
          <Button
            variant={viewMode === 'combined' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('combined')}
            className="text-xs"
          >
            Combinado
          </Button>
        </div>
      </div>
      
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={2}
              dataKey="value"
            >
              {chartData.map((_, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={COLORS[index % COLORS.length]}
                  stroke="hsl(var(--card))"
                  strokeWidth={2}
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
              formatter={(value: number) => [
                `${value} (${((value / total) * 100).toFixed(1)}%)`,
                'Posts'
              ]}
            />
            <Legend 
              verticalAlign="middle" 
              align="right"
              layout="vertical"
              iconType="circle"
              formatter={(value) => (
                <span style={{ color: 'hsl(var(--foreground))' }} className="text-xs">
                  {value.length > 25 ? value.substring(0, 25) + '...' : value}
                </span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}