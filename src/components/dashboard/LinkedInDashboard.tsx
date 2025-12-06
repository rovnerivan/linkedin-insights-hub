import { useState, useMemo, useRef, useCallback } from 'react';
import { useLinkedInData, LinkedInPost } from '@/hooks/useLinkedInData';
import { DashboardHeader } from './DashboardHeader';
import { KPICard } from './KPICard';
import { DataTable } from './DataTable';
import { ImpressionsChart } from './ImpressionsChart';
import { PostTypeChart } from './PostTypeChart';
import { EngagementChart } from './EngagementChart';
import { TopPostsChart } from './TopPostsChart';
import { FiltersSidebar, Filters } from './FiltersSidebar';
import { PeriodComparison } from './PeriodComparison';
import { LoadingSkeleton } from './LoadingSkeleton';
import { ErrorState } from './ErrorState';
import { Eye, MousePointerClick, Percent, FileText } from 'lucide-react';
import { parse, isWithinInterval, parseISO } from 'date-fns';

const initialFilters: Filters = {
  organico: true,
  patrocinado: true,
  tipos: [],
  categorias: [],
  estrategias: [],
  minInteractions: 0,
  startDate: undefined,
  endDate: undefined,
  compareStartDate: undefined,
  compareEndDate: undefined,
  comparisonMode: false
};

const parseDate = (dateStr: string): Date | null => {
  if (!dateStr) return null;
  
  try {
    const isoDate = parseISO(dateStr);
    if (!isNaN(isoDate.getTime())) return isoDate;
  } catch {
    // Continue to next format
  }
  
  try {
    const parsed = parse(dateStr, 'dd/MM/yyyy', new Date());
    if (!isNaN(parsed.getTime())) return parsed;
  } catch {
    // Continue to next format
  }
  
  try {
    const parsed = parse(dateStr, 'yyyy-MM-dd', new Date());
    if (!isNaN(parsed.getTime())) return parsed;
  } catch {
    // Return null if no format works
  }
  
  return null;
};

const filterDataByDateRange = (
  data: LinkedInPost[], 
  startDate: Date | undefined, 
  endDate: Date | undefined
): LinkedInPost[] => {
  if (!startDate || !endDate) return data;
  
  return data.filter(post => {
    const postDate = parseDate(post.Fecha);
    if (!postDate) return false;
    
    return isWithinInterval(postDate, { start: startDate, end: endDate });
  });
};

export function LinkedInDashboard() {
  const { data, loading, error, lastUpdated, refetch } = useLinkedInData();
  const [filters, setFilters] = useState<Filters>(initialFilters);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const dashboardRef = useRef<HTMLDivElement>(null);

  const filteredData = useMemo(() => {
    let result = [...data];

    if (filters.startDate && filters.endDate) {
      result = filterDataByDateRange(result, filters.startDate, filters.endDate);
    }

    return result.filter(post => {
      const isOrganic = post['Orgánico / Patrocinado'] === 'Orgánico';
      if (isOrganic && !filters.organico) return false;
      if (!isOrganic && !filters.patrocinado) return false;

      if (filters.tipos.length > 0 && !filters.tipos.includes(post.Tipo)) {
        return false;
      }

      if (filters.categorias.length > 0 && !filters.categorias.includes(post.QUÉ)) {
        return false;
      }

      if (filters.estrategias.length > 0 && !filters.estrategias.includes(post.CÓMO)) {
        return false;
      }

      if (typeof post.Interacciones === 'number' && post.Interacciones < filters.minInteractions) {
        return false;
      }

      return true;
    });
  }, [data, filters]);

  const comparisonData = useMemo(() => {
    if (!filters.comparisonMode || !filters.compareStartDate || !filters.compareEndDate) {
      return [];
    }

    const result = filterDataByDateRange(data, filters.compareStartDate, filters.compareEndDate);

    return result.filter(post => {
      const isOrganic = post['Orgánico / Patrocinado'] === 'Orgánico';
      if (isOrganic && !filters.organico) return false;
      if (!isOrganic && !filters.patrocinado) return false;
      if (filters.tipos.length > 0 && !filters.tipos.includes(post.Tipo)) return false;
      if (filters.categorias.length > 0 && !filters.categorias.includes(post.QUÉ)) return false;
      if (filters.estrategias.length > 0 && !filters.estrategias.includes(post.CÓMO)) return false;
      return true;
    });
  }, [data, filters]);

  const metrics = useMemo(() => {
    const totalImpresiones = filteredData.reduce((sum, item) => 
      sum + (typeof item.Impresiones === 'number' ? item.Impresiones : 0), 0
    );

    const totalInteracciones = filteredData.reduce((sum, item) => 
      sum + (typeof item.Interacciones === 'number' ? item.Interacciones : 0), 0
    );

    const avgEngagement = filteredData.length > 0
      ? filteredData.reduce((sum, item) => 
          sum + (typeof item['Tasa de interacción'] === 'number' ? item['Tasa de interacción'] : 0), 0
        ) / filteredData.length * 100
      : 0;

    return {
      totalImpresiones,
      totalInteracciones,
      avgEngagement,
      totalPosts: filteredData.length
    };
  }, [filteredData]);

  const exportToCSV = useCallback(() => {
    const headers = [
      'Post / Tema', 'Fecha', 'Orgánico / Patrocinado', 'Tipo', 'QUÉ', 'CÓMO',
      'Visualizaciones', 'Recomendaciones', 'Comentarios', 'Veces compartido',
      'Impresiones', 'Porcentaje de clics', 'Interacciones', 'Tasa de interacción'
    ];

    const csvContent = [
      headers.join(','),
      ...filteredData.map(row => 
        headers.map(h => {
          const val = row[h];
          const strVal = String(val ?? '');
          return strVal.includes(',') ? `"${strVal}"` : strVal;
        }).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `linkedin_analytics_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  }, [filteredData]);

  if (loading) return <LoadingSkeleton />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;

  return (
    <div className="flex min-h-screen bg-background">
      <FiltersSidebar
        data={data}
        filters={filters}
        onFiltersChange={setFilters}
        onReset={() => setFilters(initialFilters)}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      <main className="flex-1 overflow-x-hidden p-4 lg:p-8" ref={dashboardRef}>
        <DashboardHeader
          totalFollowers={12500}
          lastUpdated={lastUpdated}
          onRefresh={refetch}
          isLoading={loading}
          dashboardRef={dashboardRef}
          onExportCSV={exportToCSV}
        />

        {filters.comparisonMode && comparisonData.length > 0 && (
          <PeriodComparison 
            currentData={filteredData}
            previousData={comparisonData}
          />
        )}

        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KPICard
            title="Total Impresiones"
            value={metrics.totalImpresiones}
            icon={Eye}
            trend={12.5}
            variant="default"
            delay={100}
          />
          <KPICard
            title="Total Interacciones"
            value={metrics.totalInteracciones}
            icon={MousePointerClick}
            trend={8.2}
            variant="success"
            delay={200}
          />
          <KPICard
            title="Tasa de Engagement"
            value={`${metrics.avgEngagement.toFixed(2)}%`}
            icon={Percent}
            trend={-2.1}
            variant="warning"
            delay={300}
          />
          <KPICard
            title="Total Posts"
            value={metrics.totalPosts}
            icon={FileText}
            variant="info"
            delay={400}
          />
        </div>

        <div className="mb-8">
          <DataTable data={filteredData} />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <ImpressionsChart data={filteredData} />
          <PostTypeChart data={filteredData} />
          <EngagementChart data={filteredData} />
          <TopPostsChart data={filteredData} />
        </div>
      </main>
    </div>
  );
}
