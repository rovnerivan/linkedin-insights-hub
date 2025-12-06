import { useMemo } from 'react';
import type { LinkedInPost, Filters } from '@/types/linkedin';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Filter, RotateCcw, X } from 'lucide-react';
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

export function FiltersSidebar({ 
  data, 
  filters, 
  onFiltersChange, 
  onReset,
  isOpen,
  onToggle
}: FiltersSidebarProps) {
  const { tipos, categorias, estrategias, maxInteractions } = useMemo(() => {
    const tiposSet = new Set<string>();
    const categoriasSet = new Set<string>();
    const estrategiasSet = new Set<string>();
    let max = 0;

    data.forEach(post => {
      if (post.Tipo && typeof post.Tipo === 'string') tiposSet.add(post.Tipo);
      if (post.QUE && typeof post.QUE === 'string') categoriasSet.add(post.QUE);
      if (post.COMO && typeof post.COMO === 'string') estrategiasSet.add(post.COMO);
      if (typeof post.Interacciones === 'number' && post.Interacciones > max) {
        max = post.Interacciones;
      }
    });

    return {
      tipos: Array.from(tiposSet).sort(),
      categorias: Array.from(categoriasSet).sort(),
      estrategias: Array.from(estrategiasSet).sort(),
      maxInteractions: max
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

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        className="fixed bottom-4 right-4 z-50 h-12 w-12 rounded-full shadow-lg lg:hidden"
        onClick={onToggle}
      >
        <Filter className="h-5 w-5" />
      </Button>

      <aside className={cn(
        'fixed left-0 top-0 z-40 h-screen w-80 transform bg-sidebar transition-transform duration-300 lg:relative lg:translate-x-0',
        isOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        <div className="flex h-full flex-col text-sidebar-foreground">
          <div className="flex items-center justify-between p-6 pb-4">
            <h2 className="text-lg font-semibold">Filtros</h2>
            <div className="flex gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onReset}
                className="text-sidebar-foreground hover:bg-sidebar-accent"
              >
                <RotateCcw className="mr-1 h-4 w-4" />
                Reset
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={onToggle}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto px-6 pb-6">
            <div className="sidebar-filter">
              <h3 className="mb-3 text-sm font-medium">Rango de Fechas</h3>
              <DateRangePicker
                startDate={filters.startDate}
                endDate={filters.endDate}
                onStartDateChange={(date) => onFiltersChange({ ...filters, startDate: date })}
                onEndDateChange={(date) => onFiltersChange({ ...filters, endDate: date })}
              />
            </div>

            <div className="sidebar-filter">
              <div className="mb-3 flex items-center gap-2">
                <Checkbox
                  id="comparison-mode"
                  checked={filters.comparisonMode}
                  onCheckedChange={(checked) => 
                    onFiltersChange({ ...filters, comparisonMode: !!checked })
                  }
                />
                <Label htmlFor="comparison-mode" className="cursor-pointer text-sm font-medium">
                  Modo Comparación
                </Label>
              </div>
              
              {filters.comparisonMode && (
                <div className="mt-3">
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

            <div className="sidebar-filter">
              <h3 className="mb-3 text-sm font-medium">Tipo de Alcance</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="organic"
                    checked={filters.organico}
                    onCheckedChange={(checked) => 
                      onFiltersChange({ ...filters, organico: !!checked })
                    }
                  />
                  <Label htmlFor="organic" className="cursor-pointer text-sm">Orgánico</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="sponsored"
                    checked={filters.patrocinado}
                    onCheckedChange={(checked) => 
                      onFiltersChange({ ...filters, patrocinado: !!checked })
                    }
                  />
                  <Label htmlFor="sponsored" className="cursor-pointer text-sm">Patrocinado</Label>
                </div>
              </div>
            </div>

            <div className="sidebar-filter">
              <h3 className="mb-3 text-sm font-medium">Tipo de Post</h3>
              <div className="max-h-28 space-y-2 overflow-y-auto">
                {tipos.map(tipo => (
                  <div key={tipo} className="flex items-center gap-2">
                    <Checkbox
                      id={`tipo-${tipo}`}
                      checked={filters.tipos.includes(tipo)}
                      onCheckedChange={() => toggleTipo(tipo)}
                    />
                    <Label htmlFor={`tipo-${tipo}`} className="cursor-pointer text-sm">{tipo}</Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="sidebar-filter">
              <h3 className="mb-3 text-sm font-medium">Categoría (QUÉ)</h3>
              <div className="max-h-28 space-y-2 overflow-y-auto">
                {categorias.map(cat => (
                  <div key={cat} className="flex items-center gap-2">
                    <Checkbox
                      id={`cat-${cat}`}
                      checked={filters.categorias.includes(cat)}
                      onCheckedChange={() => toggleCategoria(cat)}
                    />
                    <Label htmlFor={`cat-${cat}`} className="cursor-pointer text-xs">
                      {cat.length > 25 ? cat.substring(0, 25) + '...' : cat}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="sidebar-filter">
              <h3 className="mb-3 text-sm font-medium">Estrategia (CÓMO)</h3>
              <div className="max-h-28 space-y-2 overflow-y-auto">
                {estrategias.map(est => (
                  <div key={est} className="flex items-center gap-2">
                    <Checkbox
                      id={`est-${est}`}
                      checked={filters.estrategias.includes(est)}
                      onCheckedChange={() => toggleEstrategia(est)}
                    />
                    <Label htmlFor={`est-${est}`} className="cursor-pointer text-xs">
                      {est.length > 25 ? est.substring(0, 25) + '...' : est}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="sidebar-filter">
              <h3 className="mb-3 text-sm font-medium">
                Mín. Interacciones: {filters.minInteractions}
              </h3>
              <Slider
                value={[filters.minInteractions]}
                onValueChange={([value]) => 
                  onFiltersChange({ ...filters, minInteractions: value })
                }
                max={maxInteractions}
                step={1}
                className="w-full"
              />
            </div>
          </div>
        </div>
      </aside>

      {isOpen && (
        <div 
          className="fixed inset-0 z-30 bg-foreground/20 backdrop-blur-sm lg:hidden"
          onClick={onToggle}
        />
      )}
    </>
  );
}
