import { useState, useMemo, useRef, useCallback } from 'react';
import { useLinkedInData } from '@/hooks/useLinkedInData';
import type { LinkedInPost, Filters } from '@/types/linkedin';
import { DashboardHeader } from './DashboardHeader';
import { KPICard } from './KPICard';
import { DataTable } from './DataTable';
import { ImpressionsChart } from './ImpressionsChart';
import { CategoryDistributionChart } from './CategoryDistributionChart';
import { EngagementChart } from './EngagementChart';
import { TopPostsChart } from './TopPostsChart';
import { FiltersSidebar } from './FiltersSidebar';
import { PeriodComparison } from './PeriodComparison';
import { LoadingSkeleton } from './LoadingSkeleton';
import { ErrorState } from './ErrorState';
import { Eye, MousePointerClick, Percent, FileText } from 'lucide-react';

const initialFilters: Filters = {
  organico: true,
  patrocinado: true,
  tipos: [],
  categorias: [],
  estrategias: [],
  comos: [],
  minInteractions: 0,
  startDate: undefined,
  endDate: undefined,
  compareStartDate: undefined,
  compareEndDate: undefined,
  comparisonMode: false
};

const parseDate = (dateStr: string): Date | null => {
  if (!dateStr) return null;
  
  // Handle MM/DD/YYYY format from Google Sheets
  const parts = dateStr.split('/');
  if (parts.length === 3) {
    const [month, day, year] = parts;
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    if (!isNaN(date.getTime())) return date;
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
    return postDate >= startDate && postDate <= endDate;
  });
};

export function LinkedInDashboard() {
  const { data, loading, error, lastUpdated, refetch } = useLinkedInData();
  const [filters, setFilters] = useState<Filters>(initialFilters);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const dashboardRef = useRef<HTMLDivElement>(null);

  // Debug: Log unique values to understand the data
  useMemo(() => {
    if (data.length > 0) {
      const uniqueQUE = [...new Set(data.map(p => p.QUE))].filter(Boolean);
      const uniqueCOMO = [...new Set(data.map(p => p.COMO))].filter(Boolean);
      const uniqueTipo = [...new Set(data.map(p => p.Tipo))].filter(Boolean);
      console.log('Unique QUE values:', uniqueQUE);
      console.log('Unique COMO values:', uniqueCOMO);
      console.log('Unique Tipo values:', uniqueTipo);
    }
  }, [data]);

  const filteredData = useMemo(() => {
    let result = [...data];

    if (filters.startDate && filters.endDate) {
      result = filterDataByDateRange(result, filters.startDate, filters.endDate);
    }

    return result.filter(post => {
      const isOrganic = post.Organico_Patrocinado === 'Orgánico';
      if (isOrganic && !filters.organico) return false;
      if (!isOrganic && !filters.patrocinado) return false;

      // tipos = Tipo (Noticia, Evento, Servicio, Tema Socios)
      if (filters.tipos.length > 0) {
        const postTipo = String(post.Tipo || '').trim();
        const matchesTipo = filters.tipos.some(t => 
          t === 'Ninguno' ? (postTipo === '' || !postTipo) : postTipo === t
        );
        if (!matchesTipo) return false;
      }

      // categorias = QUÉ (Educamos, Queremos Que Te Vean, etc)
      if (filters.categorias.length > 0) {
        const postQUE = String(post.QUE || '').trim();
        if (!postQUE || !filters.categorias.includes(postQUE)) {
          return false;
        }
      }

      // comos = CÓMO (CambioConstante, SomosIguales, SomosResponsables)
      if (filters.comos && filters.comos.length > 0) {
        const postCOMO = String(post.COMO || '').trim();
        if (!postCOMO || !filters.comos.includes(postCOMO)) {
          return false;
        }
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
      const isOrganic = post.Organico_Patrocinado === 'Orgánico';
      if (isOrganic && !filters.organico) return false;
      if (!isOrganic && !filters.patrocinado) return false;
      if (filters.tipos.length > 0 && !filters.tipos.includes(String(post.Tipo || ''))) return false;
      if (filters.categorias.length > 0 && !filters.categorias.includes(String(post.QUE || ''))) return false;
      if (filters.comos && filters.comos.length > 0 && !filters.comos.includes(String(post.COMO || ''))) return false;
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
          sum + (typeof item.Tasa_Interaccion === 'number' ? item.Tasa_Interaccion : 0), 0
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
      'Post_Tema', 'Fecha', 'Organico_Patrocinado', 'Tipo', 'QUE', 'COMO',
      'Visualizaciones', 'Recomendaciones', 'Comentarios', 'Veces_Compartido',
      'Impresiones', 'Porcentaje_Clics', 'Interacciones', 'Tasa_Interaccion'
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
          <CategoryDistributionChart data={filteredData} />
          <EngagementChart data={filteredData} />
          <TopPostsChart data={filteredData} />
        </div>
      </main>
    </div>
  );
}