import { useMemo } from 'react';
import { LinkedInPost } from '@/hooks/useLinkedInData';
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

interface TopPostsChartProps {
  data: LinkedInPost[];
}

export function TopPostsChart({ data }: TopPostsChartProps) {
  const chartData = useMemo(() => {
    return [...data]
      .filter(post => typeof post.Interacciones === 'number')
      .sort((a, b) => (b.Interacciones || 0) - (a.Interacciones || 0))
      .slice(0, 10)
      .map(post => ({
        name: String(post['Post / Tema'] || 'Sin título').substring(0, 35) + 
              (String(post['Post / Tema'] || '').length > 35 ? '...' : ''),
        fullName: post['Post / Tema'] || 'Sin título',
        interactions: post.Interacciones || 0
      }));
  }, [data]);

  const maxValue = Math.max(...chartData.map(d => d.interactions));

  return (
    <div className="chart-container animate-fade-in" style={{ animationDelay: '800ms' }}>
      <h3 className="mb-4 text-lg font-semibold text-foreground">Top 10 Posts por Interacciones</h3>
      
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart 
            data={chartData} 
            layout="vertical"
            margin={{ top: 5, right: 30, left: 120, bottom: 5 }}
          >
            <defs>
              <linearGradient id="barGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="hsl(201, 100%, 36%)" />
                <stop offset="100%" stopColor="hsl(160, 84%, 39%)" />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={true} vertical={false} />
            <XAxis 
              type="number"
              tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
              tickLine={false}
              axisLine={{ stroke: 'hsl(var(--border))' }}
              tickFormatter={(value) => value.toLocaleString('es-ES')}
            />
            <YAxis 
              type="category"
              dataKey="name"
              tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
              tickLine={false}
              axisLine={{ stroke: 'hsl(var(--border))' }}
              width={120}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
              formatter={(value: number) => [value.toLocaleString('es-ES'), 'Interacciones']}
              labelFormatter={(_, payload) => payload?.[0]?.payload?.fullName || ''}
            />
            <Bar 
              dataKey="interactions" 
              radius={[0, 4, 4, 0]}
            >
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={`hsl(201, 100%, ${36 + (entry.interactions / maxValue) * 20}%)`}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
