import { useState, useMemo } from 'react';
import { LinkedInPost } from '@/hooks/useLinkedInData';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  ChevronUp, 
  ChevronDown, 
  ChevronsUpDown,
  Search,
  Download,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface DataTableProps {
  data: LinkedInPost[];
}

type SortDirection = 'asc' | 'desc' | null;

const ROWS_PER_PAGE = 20;

export function DataTable({ data }: DataTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortColumn(null);
        setSortDirection(null);
      }
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const filteredAndSortedData = useMemo(() => {
    let result = [...data];

    // Filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(row => 
        Object.values(row).some(val => 
          String(val).toLowerCase().includes(term)
        )
      );
    }

    // Sort
    if (sortColumn && sortDirection) {
      result.sort((a, b) => {
        const aVal = a[sortColumn];
        const bVal = b[sortColumn];

        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
        }

        const aStr = String(aVal || '');
        const bStr = String(bVal || '');
        return sortDirection === 'asc' 
          ? aStr.localeCompare(bStr)
          : bStr.localeCompare(aStr);
      });
    }

    return result;
  }, [data, searchTerm, sortColumn, sortDirection]);

  const totalPages = Math.ceil(filteredAndSortedData.length / ROWS_PER_PAGE);
  const paginatedData = filteredAndSortedData.slice(
    (currentPage - 1) * ROWS_PER_PAGE,
    currentPage * ROWS_PER_PAGE
  );

  const exportToCSV = () => {
    const headers = [
      'Post / Tema', 'Fecha', 'Orgánico / Patrocinado', 'Tipo', 'QUÉ', 'CÓMO',
      'Visualizaciones', 'Recomendaciones', 'Comentarios', 'Veces compartido',
      'Impresiones', 'Porcentaje de clics', 'Interacciones', 'Tasa de interacción'
    ];

    const csvContent = [
      headers.join(','),
      ...filteredAndSortedData.map(row => 
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
  };

  const SortIcon = ({ column }: { column: string }) => {
    if (sortColumn !== column) return <ChevronsUpDown className="h-4 w-4 text-muted-foreground" />;
    if (sortDirection === 'asc') return <ChevronUp className="h-4 w-4 text-primary" />;
    return <ChevronDown className="h-4 w-4 text-primary" />;
  };

  const columns = [
    { key: 'Post / Tema', label: 'Post / Tema', width: 'min-w-[200px]' },
    { key: 'Fecha', label: 'Fecha', width: 'w-28' },
    { key: 'Orgánico / Patrocinado', label: 'Tipo', width: 'w-24' },
    { key: 'Tipo', label: 'Formato', width: 'w-24' },
    { key: 'Impresiones', label: 'Impresiones', width: 'w-28' },
    { key: 'Interacciones', label: 'Interacciones', width: 'w-28' },
    { key: 'Tasa de interacción', label: 'Engagement %', width: 'w-28' },
  ];

  return (
    <div className="chart-container animate-fade-in" style={{ animationDelay: '400ms' }}>
      <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-lg font-semibold text-foreground">Datos de Publicaciones</h3>
        
        <div className="flex gap-3">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-9"
            />
          </div>
          
          <Button variant="outline" size="icon" onClick={exportToCSV}>
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              {columns.map(col => (
                <TableHead
                  key={col.key}
                  className={cn('cursor-pointer select-none', col.width)}
                  onClick={() => handleSort(col.key)}
                >
                  <div className="flex items-center gap-1">
                    {col.label}
                    <SortIcon column={col.key} />
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No se encontraron resultados
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((row, idx) => (
                <TableRow key={idx} className="data-table-row">
                  <TableCell className="max-w-[200px] truncate font-medium">
                    {row['Post / Tema'] || '-'}
                  </TableCell>
                  <TableCell>{row.Fecha || '-'}</TableCell>
                  <TableCell>
                    <span className={row['Orgánico / Patrocinado'] === 'Orgánico' ? 'badge-organic' : 'badge-sponsored'}>
                      {row['Orgánico / Patrocinado'] === 'Orgánico' ? 'Orgánico' : 'Patrocinado'}
                    </span>
                  </TableCell>
                  <TableCell>{row.Tipo || '-'}</TableCell>
                  <TableCell className="text-right">
                    {typeof row.Impresiones === 'number' ? row.Impresiones.toLocaleString('es-ES') : '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    {typeof row.Interacciones === 'number' ? row.Interacciones.toLocaleString('es-ES') : '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    {typeof row['Tasa de interacción'] === 'number' 
                      ? `${(row['Tasa de interacción'] * 100).toFixed(2)}%` 
                      : '-'}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Mostrando {((currentPage - 1) * ROWS_PER_PAGE) + 1} - {Math.min(currentPage * ROWS_PER_PAGE, filteredAndSortedData.length)} de {filteredAndSortedData.length}
          </p>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <span className="text-sm">
              Página {currentPage} de {totalPages}
            </span>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
