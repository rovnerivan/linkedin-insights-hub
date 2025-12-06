import { useState, useMemo, useCallback } from 'react';
import type { LinkedInPost } from '@/types/linkedin';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Area,
  ComposedChart,
  Line,
  Brush,
  ReferenceArea
} from 'recharts';
import { Button } from '@/components/ui/button';
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

interface ImpressionsChartProps {
  data: LinkedInPost[];
}

export function ImpressionsChart({ data }: ImpressionsChartProps) {
  const [zoomDomain, setZoomDomain] = useState<{ left: number; right: number } | null>(null);
  const [refAreaLeft, setRefAreaLeft] = useState<string | null>(null);
  const [refAreaRight, setRefAreaRight] = useState<string | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);

  const chartData = useMemo(() => {
    const grouped: Record<string, { organic: number; sponsored: number }> = {};

    data.forEach(post => {
      const date = post.Fecha;
      if (!date) return;

      if (!grouped[date]) {
        grouped[date] = { organic: 0, sponsored: 0 };
      }

      const impressions = typeof post.Impresiones === 'number' ? post.Impresiones : 0;
      
      if (post.Organico_Patrocinado === 'Orgánico') {
        grouped[date].organic += impressions;
      } else {
        grouped[date].sponsored += impressions;
      }
    });

    return Object.entries(grouped)
      .map(([date, values], index) => ({
        date,
        index,
        Orgánico: values.organic,
        Patrocinado: values.sponsored
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [data]);

  const handleMouseDown = useCallback((e: any) => {
    if (e?.activeLabel) {
      setRefAreaLeft(e.activeLabel);
      setIsSelecting(true);
    }
  }, []);

  const handleMouseMove = useCallback((e: any) => {
    if (isSelecting && e?.activeLabel) {
      setRefAreaRight(e.activeLabel);
    }
  }, [isSelecting]);

  const handleMouseUp = useCallback(() => {
    if (refAreaLeft && refAreaRight) {
      const leftIndex = chartData.findIndex(d => d.date === refAreaLeft);
      const rightIndex = chartData.findIndex(d => d.date === refAreaRight);
      
      if (leftIndex !== -1 && rightIndex !== -1) {
        const [left, right] = leftIndex <= rightIndex 
          ? [leftIndex, rightIndex] 
          : [rightIndex, leftIndex];
        
        if (right - left >= 1) {
          setZoomDomain({ left, right });
        }
      }
    }
    setRefAreaLeft(null);
    setRefAreaRight(null);
    setIsSelecting(false);
  }, [refAreaLeft, refAreaRight, chartData]);

  const handleZoomOut = useCallback(() => {
    setZoomDomain(null);
  }, []);

  const displayData = useMemo(() => {
    if (!zoomDomain) return chartData;
    return chartData.slice(zoomDomain.left, zoomDomain.right + 1);
  }, [chartData, zoomDomain]);

  const maxValue = useMemo(() => {
    return Math.max(...displayData.map(d => Math.max(d.Orgánico, d.Patrocinado)));
  }, [displayData]);

  return (
    <div className="chart-container animate-fade-in" style={{ animationDelay: '500ms' }}>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-lg font-semibold text-foreground">Impresiones a lo largo del tiempo</h3>
        
        <div className="flex items-center gap-2">
          {zoomDomain && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleZoomOut}
              className="flex items-center gap-1"
            >
              <RotateCcw className="h-4 w-4" />
              Reset Zoom
            </Button>
          )}
          <span className="text-xs text-muted-foreground">
            Arrastra para hacer zoom
          </span>
        </div>
      </div>
      
      <div className="h-[350px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart 
            data={displayData} 
            margin={{ top: 5, right: 30, left: 20, bottom: 40 }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={() => {
              if (isSelecting) {
                handleMouseUp();
              }
            }}
          >
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
              tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
              tickLine={false}
              axisLine={{ stroke: 'hsl(var(--border))' }}
              angle={-45}
              textAnchor="end"
              height={60}
              interval="preserveStartEnd"
            />
            <YAxis 
              tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
              tickLine={false}
              axisLine={{ stroke: 'hsl(var(--border))' }}
              tickFormatter={(value) => value.toLocaleString('es-ES')}
              domain={[0, maxValue * 1.1]}
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
            
            {refAreaLeft && refAreaRight && (
              <ReferenceArea
                x1={refAreaLeft}
                x2={refAreaRight}
                strokeOpacity={0.3}
                fill="hsl(var(--primary))"
                fillOpacity={0.2}
              />
            )}
            
            <Brush
              dataKey="date"
              height={30}
              stroke="hsl(var(--primary))"
              fill="hsl(var(--muted))"
              tickFormatter={(value) => ''}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      
      <p className="mt-2 text-center text-xs text-muted-foreground">
        Usa el selector inferior para navegar o arrastra sobre el gráfico para hacer zoom
      </p>
    </div>
  );
}