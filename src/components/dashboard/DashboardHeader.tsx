import { useState } from 'react';
import { RefreshCw, Users, Upload, AlertCircle, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { ExportButtons } from './ExportButtons';
import camaraLogo from '@/assets/camara-logo.png';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';

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
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);

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

          {/* Upload Button */}
          <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="default" size="sm" className="gap-2">
                <Upload className="h-4 w-4" />
                <span className="hidden sm:inline">Subir nuevo extracto</span>
                <span className="sm:hidden">Subir</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] w-full max-w-4xl overflow-hidden">
              <DialogHeader>
                <DialogTitle className="text-center text-xl">
                  Subir nuevo extracto de LinkedIn
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                <Alert className="border-amber-500/50 bg-amber-500/10">
                  <AlertCircle className="h-4 w-4 text-amber-500" />
                  <AlertDescription className="text-sm text-foreground">
                    Una vez usted envíe el nuevo documento a través de este formulario, deberá esperar al menos <strong>5 minutos</strong> para que la información se integre a este dashboard.
                  </AlertDescription>
                </Alert>
                
                <Alert className="border-blue-500/50 bg-blue-500/10">
                  <Info className="h-4 w-4 text-blue-500" />
                  <AlertDescription className="text-sm text-foreground">
                    Si abrió esto por error, ciérrelo sin problemas. Así mismo, si ya envió el nuevo archivo puede cerrarlo y esperar.
                  </AlertDescription>
                </Alert>
                
                <div className="relative h-[60vh] w-full overflow-hidden rounded-lg border">
                  <iframe
                    src="https://docs.google.com/forms/d/e/1FAIpQLSeSjuB8OyU3RlFB7kHO16zO1FTh1ccj2fCFJD-GHvv7HUMWWg/viewform?embedded=true"
                    className="h-full w-full"
                    title="Formulario de carga de datos"
                  >
                    Cargando formulario...
                  </iframe>
                </div>
              </div>
            </DialogContent>
          </Dialog>

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
