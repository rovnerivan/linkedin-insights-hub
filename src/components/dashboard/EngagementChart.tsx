import { useState, useMemo } from 'react';
import type { LinkedInPost } from '@/types/linkedin';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { Button } from '@/components/ui/button';

interface EngagementChartProps {
  data: LinkedInPost[];
}

const COLORS = [
  'hsl(201, 100%, 36%)',
  'hsl(201, 100%, 42%)',
  'hsl(201, 100%, 48%)',
  'hsl(201, 100%, 54%)',
  'hsl(201, 100%, 60%)',
  'hsl(160, 84%, 39%)',
  'hsl(38, 92%, 50%)',
  'hsl(280, 65%, 60%)',
];

type ViewMode = 'QUE' | 'COMO' | 'combined';

export function EngagementChart({ data }: EngagementChartProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('QUE');

  const chartData = useMemo(() => {
    const grouped: Record<string, { total: number; count: number }> = {};

    data.forEach(post => {
      let key = '';
      
      if (viewMode === 'QUE') {
        key = post.QUE || 'Sin QUÉ';
      } else if (viewMode === 'COMO') {
        key = post.COMO || 'Sin CÓMO';
      } else {
        const que = post.QUE || 'Sin QUÉ';
        const como = post.COMO || 'Sin CÓMO';
        key = `${que} + ${como}`;
      }
      
      const rate = typeof post.Tasa_Interaccion === 'number' ? post.Tasa_Interaccion : 0;

      if (!grouped[key]) {
        grouped[key] = { total: 0, count: 0 };
      }

      grouped[key].total += rate;
      grouped[key].count += 1;
    });

    return Object.entries(grouped)
      .map(([name, values]) => ({
        name: name.length > 20 ? name.substring(0, 20) + '...' : name,
        fullName: name,
        avgEngagement: values.count > 0 ? (values.total / values.count) * 100 : 0
      }))
      .sort((a, b) => b.avgEngagement - a.avgEngagement);
  }, [data, viewMode]);

  const getTitle = () => {
    switch (viewMode) {
      case 'QUE': return 'Engagement por QUÉ';
      case 'COMO': return 'Engagement por CÓMO';
      case 'combined': return 'Engagement QUÉ + CÓMO';
    }
  };

  return (
    <div className="chart-container animate-fade-in" style={{ animationDelay: '700ms' }}>
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
          <BarChart 
            data={chartData} 
            layout="vertical"
            margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={true} vertical={false} />
            <XAxis 
              type="number"
              tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
              tickLine={false}
              axisLine={{ stroke: 'hsl(var(--border))' }}
              tickFormatter={(value) => `${value.toFixed(1)}%`}
            />
            <YAxis 
              type="category"
              dataKey="name"
              tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
              tickLine={false}
              axisLine={{ stroke: 'hsl(var(--border))' }}
              width={80}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
              formatter={(value: number) => [`${value.toFixed(2)}%`, 'Engagement promedio']}
              labelFormatter={(_, payload) => payload?.[0]?.payload?.fullName || ''}
            />
            <Bar 
              dataKey="avgEngagement" 
              radius={[0, 4, 4, 0]}
            >
              {chartData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}