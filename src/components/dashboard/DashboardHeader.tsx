import { RefreshCw, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { ExportButtons } from './ExportButtons';
import camaraLogo from '@/assets/camara-logo.png';

interface DashboardHeaderProps {
  totalFollowers: number;
  lastUpdated: Date | null;
  onRefresh: () => void;
  isLoading: boolean;
  dashboardRef: React.RefObject<HTMLDivElement>;
  onExportCSV: () => void;
}

export function DashboardHeader({ 
  totalFollowers, 
  lastUpdated, 
  onRefresh, 
  isLoading,
  dashboardRef,
  onExportCSV
}: DashboardHeaderProps) {
  return (
    <header className="mb-8 animate-fade-in">
      {/* Organization Header */}
      <div className="mb-6 flex flex-col items-center justify-center gap-3 text-center">
        <img 
          src={camaraLogo} 
          alt="Cámara Oficial de Comercio de España en el Perú" 
          className="h-16 w-16 object-contain sm:h-20 sm:w-20"
        />
        <h2 className="text-lg font-semibold text-foreground sm:text-xl">
          Cámara Oficial de Comercio de España en el Perú
        </h2>
      </div>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl lg:text-4xl">
            <span className="gradient-text">LinkedIn</span> Analytics Dashboard
          </h1>
          <p className="mt-1 text-sm text-muted-foreground sm:text-base">
            Monitorea el rendimiento de tus publicaciones en LinkedIn
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 rounded-lg bg-card px-3 py-2 shadow-sm sm:px-4">
            <Users className="h-4 w-4 text-primary sm:h-5 sm:w-5" />
            <div>
              <p className="text-xs text-muted-foreground">Seguidores</p>
              <p className="text-sm font-semibold text-foreground sm:text-base">
                {totalFollowers.toLocaleString('es-ES')}
              </p>
            </div>
          </div>

          <ExportButtons 
            dashboardRef={dashboardRef}
            onExportCSV={onExportCSV}
          />
          
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={isLoading}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Actualizar</span>
          </Button>
        </div>
      </div>
      
      {lastUpdated && (
        <p className="mt-2 text-xs text-muted-foreground sm:text-sm">
          Última actualización: {format(lastUpdated, "d 'de' MMMM, HH:mm", { locale: es })}
        </p>
      )}
    </header>
  );
}
