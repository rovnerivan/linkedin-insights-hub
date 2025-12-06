import { useMemo } from 'react';
import type { LinkedInPost, Filters } from '@/types/linkedin';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Filter, RotateCcw, X, Calendar, Tag, Target, Zap, MousePointerClick, Layers } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DateRangePicker } from './DateRangePicker';

interface FiltersSidebarProps {
  data: LinkedInPost[];
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
  onReset: () => void;
  isOpen: boolean;
  onToggle: () => void;
}

// These will be extracted dynamically from data if the hardcoded ones don't match

export function FiltersSidebar({ 
  data, 
  filters, 
  onFiltersChange, 
  onReset,
  isOpen,
  onToggle
}: FiltersSidebarProps) {
  const { tipoOptions, queOptions, comoOptions, maxInteractions } = useMemo(() => {
    const tipoSet = new Set<string>();
    const queSet = new Set<string>();
    const comoSet = new Set<string>();
    let max = 0;

    data.forEach(post => {
      // Extract unique Tipo values (from the Tipo column)
      const tipo = String(post.Tipo || '').trim();
      if (tipo) tipoSet.add(tipo);

      // Extract unique QUE values
      const que = String(post.QUE || '').trim();
      if (que) queSet.add(que);

      // Extract unique COMO values
      const como = String(post.COMO || '').trim();
      if (como) comoSet.add(como);

      if (typeof post.Interacciones === 'number' && post.Interacciones > max) {
        max = post.Interacciones;
      }
    });

    return {
      tipoOptions: Array.from(tipoSet).sort(),
      queOptions: Array.from(queSet).sort(),
      comoOptions: Array.from(comoSet).sort(),
      maxInteractions: Math.max(max, 100)
    };
  }, [data]);

  const toggleTipo = (tipo: string) => {
    const newTipos = filters.tipos.includes(tipo)
      ? filters.tipos.filter(t => t !== tipo)
      : [...filters.tipos, tipo];
    onFiltersChange({ ...filters, tipos: newTipos });
  };

  const toggleCategoria = (cat: string) => {
    const newCats = filters.categorias.includes(cat)
      ? filters.categorias.filter(c => c !== cat)
      : [...filters.categorias, cat];
    onFiltersChange({ ...filters, categorias: newCats });
  };

  const toggleEstrategia = (est: string) => {
    const newEsts = filters.estrategias.includes(est)
      ? filters.estrategias.filter(e => e !== est)
      : [...filters.estrategias, est];
    onFiltersChange({ ...filters, estrategias: newEsts });
  };

  const toggleComo = (como: string) => {
    const newComos = filters.comos?.includes(como)
      ? filters.comos.filter(c => c !== como)
      : [...(filters.comos || []), como];
    onFiltersChange({ ...filters, comos: newComos });
  };

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.startDate || filters.endDate) count++;
    if (!filters.organico || !filters.patrocinado) count++;
    if (filters.tipos.length > 0) count++;
    if (filters.categorias.length > 0) count++;
    if (filters.estrategias.length > 0) count++;
    if ((filters.comos?.length || 0) > 0) count++;
    if (filters.minInteractions > 0) count++;
    return count;
  }, [filters]);

  return (
    <>
      {/* Mobile FAB */}
      <Button
        variant="default"
        size="icon"
        className="fixed bottom-4 right-4 z-50 h-14 w-14 rounded-full shadow-xl lg:hidden"
        onClick={onToggle}
      >
        <Filter className="h-6 w-6" />
        {activeFiltersCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-xs text-white">
            {activeFiltersCount}
          </span>
        )}
      </Button>

      {/* Sidebar */}
      <aside className={cn(
        'fixed left-0 top-0 z-40 h-screen w-80 transform border-r border-sidebar-border bg-sidebar transition-transform duration-300 lg:relative lg:translate-x-0',
        isOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-sidebar-border p-4">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold text-sidebar-foreground">Filters</h2>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onReset}
                className="text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
              >
                <RotateCcw className="mr-1 h-4 w-4" />
                Reset
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden text-sidebar-foreground"
                onClick={onToggle}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Scrollable Content */}
          <ScrollArea className="flex-1">
            <div className="space-y-1 p-4">
              {/* Date Range */}
              <div className="rounded-lg bg-sidebar-accent/30 p-4">
                <div className="mb-3 flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  <h3 className="text-sm font-medium text-sidebar-foreground">Date Range</h3>
                </div>
                <DateRangePicker
                  startDate={filters.startDate}
                  endDate={filters.endDate}
                  onStartDateChange={(date) => onFiltersChange({ ...filters, startDate: date })}
                  onEndDateChange={(date) => onFiltersChange({ ...filters, endDate: date })}
                />
              </div>

              <Separator className="my-4 bg-sidebar-border" />

              {/* Post Type (Orgánico/Patrocinado) */}
              <div className="rounded-lg bg-sidebar-accent/30 p-4">
                <h3 className="mb-3 text-sm font-medium text-sidebar-foreground">Post Type</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      id="organic"
                      checked={filters.organico}
                      onCheckedChange={(checked) => 
                        onFiltersChange({ ...filters, organico: !!checked })
                      }
                      className="border-sidebar-foreground/30 data-[state=checked]:bg-primary"
                    />
                    <Label htmlFor="organic" className="cursor-pointer text-sm text-sidebar-foreground">
                      Orgánico
                    </Label>
                  </div>
                  <div className="flex items-center gap-3">
                    <Checkbox
                      id="sponsored"
                      checked={filters.patrocinado}
                      onCheckedChange={(checked) => 
                        onFiltersChange({ ...filters, patrocinado: !!checked })
                      }
                      className="border-sidebar-foreground/30 data-[state=checked]:bg-primary"
                    />
                    <Label htmlFor="sponsored" className="cursor-pointer text-sm text-sidebar-foreground">
                      Patrocinado
                    </Label>
                  </div>
                </div>
              </div>

              <Separator className="my-4 bg-sidebar-border" />

              {/* Tipo (Noticia, Evento, Servicio, Tema Socios) */}
              <div className="rounded-lg bg-sidebar-accent/30 p-4">
                <div className="mb-3 flex items-center gap-2">
                  <Tag className="h-4 w-4 text-primary" />
                  <h3 className="text-sm font-medium text-sidebar-foreground">Tipo</h3>
                </div>
                <div className="max-h-48 space-y-2 overflow-y-auto pr-2">
                  {tipoOptions.length === 0 ? (
                    <p className="text-xs text-sidebar-foreground/50">No hay tipos disponibles</p>
                  ) : (
                    tipoOptions.map(tipo => (
                      <div key={tipo} className="flex items-center gap-3">
                        <Checkbox
                          id={`tipo-${tipo}`}
                          checked={filters.tipos.includes(tipo)}
                          onCheckedChange={() => toggleTipo(tipo)}
                          className="border-sidebar-foreground/30 data-[state=checked]:bg-primary"
                        />
                        <Label 
                          htmlFor={`tipo-${tipo}`} 
                          className="cursor-pointer text-sm text-sidebar-foreground"
                        >
                          {tipo}
                        </Label>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <Separator className="my-4 bg-sidebar-border" />

              {/* QUÉ (Strategy) */}
              <div className="rounded-lg bg-sidebar-accent/30 p-4">
                <div className="mb-3 flex items-center gap-2">
                  <Target className="h-4 w-4 text-primary" />
                  <h3 className="text-sm font-medium text-sidebar-foreground">QUÉ (Strategy)</h3>
                </div>
                <div className="max-h-48 space-y-2 overflow-y-auto pr-2">
                  {queOptions.length === 0 ? (
                    <p className="text-xs text-sidebar-foreground/50">No hay categorías disponibles</p>
                  ) : (
                    queOptions.map(que => (
                      <div key={que} className="flex items-center gap-3">
                        <Checkbox
                          id={`que-${que}`}
                          checked={filters.categorias.includes(que)}
                          onCheckedChange={() => toggleCategoria(que)}
                          className="border-sidebar-foreground/30 data-[state=checked]:bg-primary"
                        />
                        <Label 
                          htmlFor={`que-${que}`} 
                          className="cursor-pointer text-sm text-sidebar-foreground"
                        >
                          {que}
                        </Label>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <Separator className="my-4 bg-sidebar-border" />

              {/* CÓMO (Approach) */}
              <div className="rounded-lg bg-sidebar-accent/30 p-4">
                <div className="mb-3 flex items-center gap-2">
                  <Layers className="h-4 w-4 text-primary" />
                  <h3 className="text-sm font-medium text-sidebar-foreground">CÓMO (Approach)</h3>
                </div>
                <div className="max-h-48 space-y-2 overflow-y-auto pr-2">
                  {comoOptions.length === 0 ? (
                    <p className="text-xs text-sidebar-foreground/50">No hay opciones disponibles</p>
                  ) : (
                    comoOptions.map(como => (
                      <div key={como} className="flex items-center gap-3">
                        <Checkbox
                          id={`como-${como}`}
                          checked={filters.comos?.includes(como) || false}
                          onCheckedChange={() => toggleComo(como)}
                          className="border-sidebar-foreground/30 data-[state=checked]:bg-primary"
                        />
                        <Label 
                          htmlFor={`como-${como}`} 
                          className="cursor-pointer text-sm text-sidebar-foreground"
                        >
                          {como}
                        </Label>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <Separator className="my-4 bg-sidebar-border" />

              {/* Min Interactions Slider */}
              <div className="rounded-lg bg-sidebar-accent/30 p-4">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MousePointerClick className="h-4 w-4 text-primary" />
                    <h3 className="text-sm font-medium text-sidebar-foreground">Min. Interactions:</h3>
                  </div>
                  <span className="rounded bg-primary/20 px-2 py-0.5 text-sm font-semibold text-primary">
                    {filters.minInteractions}
                  </span>
                </div>
                <Slider
                  value={[filters.minInteractions]}
                  onValueChange={([value]) => 
                    onFiltersChange({ ...filters, minInteractions: value })
                  }
                  max={maxInteractions}
                  step={1}
                  className="w-full"
                />
                <div className="mt-2 flex justify-between text-xs text-sidebar-foreground/50">
                  <span>0</span>
                  <span>{maxInteractions}</span>
                </div>
              </div>

              {/* Comparison Mode (optional) */}
              <Separator className="my-4 bg-sidebar-border" />
              
              <div className="rounded-lg bg-sidebar-accent/30 p-4">
                <div className="flex items-center gap-3">
                  <Checkbox
                    id="comparison-mode"
                    checked={filters.comparisonMode}
                    onCheckedChange={(checked) => 
                      onFiltersChange({ ...filters, comparisonMode: !!checked })
                    }
                    className="border-sidebar-foreground/30 data-[state=checked]:bg-primary"
                  />
                  <Label htmlFor="comparison-mode" className="cursor-pointer text-sm font-medium text-sidebar-foreground">
                    Modo Comparación
                  </Label>
                </div>
                
                {filters.comparisonMode && (
                  <div className="mt-4">
                    <p className="mb-2 text-xs text-sidebar-foreground/70">Período a comparar:</p>
                    <DateRangePicker
                      startDate={filters.compareStartDate}
                      endDate={filters.compareEndDate}
                      onStartDateChange={(date) => onFiltersChange({ ...filters, compareStartDate: date })}
                      onEndDateChange={(date) => onFiltersChange({ ...filters, compareEndDate: date })}
                    />
                  </div>
                )}
              </div>
            </div>
          </ScrollArea>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-30 bg-foreground/20 backdrop-blur-sm lg:hidden"
          onClick={onToggle}
        />
      )}
    </>
  );
}