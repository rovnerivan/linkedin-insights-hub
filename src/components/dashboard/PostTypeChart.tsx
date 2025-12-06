import { useMemo } from 'react';
import type { LinkedInPost } from '@/types/linkedin';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip
} from 'recharts';

interface PostTypeChartProps {
  data: LinkedInPost[];
}

const COLORS = [
  'hsl(201, 100%, 36%)',
  'hsl(160, 84%, 39%)',
  'hsl(38, 92%, 50%)',
  'hsl(280, 65%, 60%)',
  'hsl(340, 75%, 55%)',
  'hsl(200, 80%, 60%)',
];

export function PostTypeChart({ data }: PostTypeChartProps) {
  const chartData = useMemo(() => {
    const counts: Record<string, number> = {};

    data.forEach(post => {
      const tipo = post.Tipo || 'Sin tipo';
      counts[tipo] = (counts[tipo] || 0) + 1;
    });

    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [data]);

  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="chart-container animate-fade-in" style={{ animationDelay: '600ms' }}>
      <h3 className="mb-4 text-lg font-semibold text-foreground">Distribución por Tipo de Post</h3>
      
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
                <span style={{ color: 'hsl(var(--foreground))' }}>{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
