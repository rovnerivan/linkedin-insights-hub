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

interface EngagementChartProps {
  data: LinkedInPost[];
}

const COLORS = [
  'hsl(201, 100%, 36%)',
  'hsl(201, 100%, 42%)',
  'hsl(201, 100%, 48%)',
  'hsl(201, 100%, 54%)',
  'hsl(201, 100%, 60%)',
];

export function EngagementChart({ data }: EngagementChartProps) {
  const chartData = useMemo(() => {
    const grouped: Record<string, { total: number; count: number }> = {};

    data.forEach(post => {
      const category = post.QUÉ || 'Sin categoría';
      const rate = typeof post['Tasa de interacción'] === 'number' ? post['Tasa de interacción'] : 0;

      if (!grouped[category]) {
        grouped[category] = { total: 0, count: 0 };
      }

      grouped[category].total += rate;
      grouped[category].count += 1;
    });

    return Object.entries(grouped)
      .map(([name, values]) => ({
        name: name.length > 20 ? name.substring(0, 20) + '...' : name,
        fullName: name,
        avgEngagement: values.count > 0 ? (values.total / values.count) * 100 : 0
      }))
      .sort((a, b) => b.avgEngagement - a.avgEngagement);
  }, [data]);

  return (
    <div className="chart-container animate-fade-in" style={{ animationDelay: '700ms' }}>
      <h3 className="mb-4 text-lg font-semibold text-foreground">Engagement por Categoría (QUÉ)</h3>
      
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
