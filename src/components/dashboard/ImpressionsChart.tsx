import { useMemo } from 'react';
import { LinkedInPost } from '@/hooks/useLinkedInData';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Area,
  ComposedChart
} from 'recharts';

interface ImpressionsChartProps {
  data: LinkedInPost[];
}

export function ImpressionsChart({ data }: ImpressionsChartProps) {
  const chartData = useMemo(() => {
    const grouped: Record<string, { organic: number; sponsored: number }> = {};

    data.forEach(post => {
      const date = post.Fecha;
      if (!date) return;

      if (!grouped[date]) {
        grouped[date] = { organic: 0, sponsored: 0 };
      }

      const impressions = typeof post.Impresiones === 'number' ? post.Impresiones : 0;
      
      if (post['Orgánico / Patrocinado'] === 'Orgánico') {
        grouped[date].organic += impressions;
      } else {
        grouped[date].sponsored += impressions;
      }
    });

    return Object.entries(grouped)
      .map(([date, values]) => ({
        date,
        Orgánico: values.organic,
        Patrocinado: values.sponsored
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [data]);

  return (
    <div className="chart-container animate-fade-in" style={{ animationDelay: '500ms' }}>
      <h3 className="mb-4 text-lg font-semibold text-foreground">Impresiones a lo largo del tiempo</h3>
      
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <defs>
              <linearGradient id="organicGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(201, 100%, 36%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(201, 100%, 36%)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="sponsoredGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(38, 92%, 50%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(38, 92%, 50%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
              tickLine={false}
              axisLine={{ stroke: 'hsl(var(--border))' }}
            />
            <YAxis 
              tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
              tickLine={false}
              axisLine={{ stroke: 'hsl(var(--border))' }}
              tickFormatter={(value) => value.toLocaleString('es-ES')}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
              formatter={(value: number) => [value.toLocaleString('es-ES'), undefined]}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="Orgánico"
              stroke="hsl(201, 100%, 36%)"
              fill="url(#organicGradient)"
              strokeWidth={0}
            />
            <Area
              type="monotone"
              dataKey="Patrocinado"
              stroke="hsl(38, 92%, 50%)"
              fill="url(#sponsoredGradient)"
              strokeWidth={0}
            />
            <Line
              type="monotone"
              dataKey="Orgánico"
              stroke="hsl(201, 100%, 36%)"
              strokeWidth={2}
              dot={{ fill: 'hsl(201, 100%, 36%)', strokeWidth: 0, r: 3 }}
              activeDot={{ r: 5, strokeWidth: 0 }}
            />
            <Line
              type="monotone"
              dataKey="Patrocinado"
              stroke="hsl(38, 92%, 50%)"
              strokeWidth={2}
              dot={{ fill: 'hsl(38, 92%, 50%)', strokeWidth: 0, r: 3 }}
              activeDot={{ r: 5, strokeWidth: 0 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
