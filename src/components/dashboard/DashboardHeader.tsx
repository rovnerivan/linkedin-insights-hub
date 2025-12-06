import { RefreshCw, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface DashboardHeaderProps {
  totalFollowers: number;
  lastUpdated: Date | null;
  onRefresh: () => void;
  isLoading: boolean;
}

export function DashboardHeader({ 
  totalFollowers, 
  lastUpdated, 
  onRefresh, 
  isLoading 
}: DashboardHeaderProps) {
  return (
    <header className="mb-8 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground sm:text-4xl">
            <span className="gradient-text">LinkedIn</span> Analytics Dashboard
          </h1>
          <p className="mt-1 text-muted-foreground">
            Monitorea el rendimiento de tus publicaciones en LinkedIn
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 rounded-lg bg-card px-4 py-2 shadow-sm">
            <Users className="h-5 w-5 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Seguidores</p>
              <p className="font-semibold text-foreground">
                {totalFollowers.toLocaleString('es-ES')}
              </p>
            </div>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={isLoading}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
        </div>
      </div>
      
      {lastUpdated && (
        <p className="mt-2 text-sm text-muted-foreground">
          Última actualización: {format(lastUpdated, "d 'de' MMMM, HH:mm", { locale: es })}
        </p>
      )}
    </header>
  );
}
