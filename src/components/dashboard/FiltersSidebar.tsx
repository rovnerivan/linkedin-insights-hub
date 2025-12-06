import { useMemo } from 'react';
import { LinkedInPost } from '@/hooks/useLinkedInData';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Filter, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Filters {
  organico: boolean;
  patrocinado: boolean;
  tipos: string[];
  categorias: string[];
  minInteractions: number;
}

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
  const { tipos, categorias, maxInteractions } = useMemo(() => {
    const tiposSet = new Set<string>();
    const categoriasSet = new Set<string>();
    let max = 0;

    data.forEach(post => {
      if (post.Tipo) tiposSet.add(post.Tipo);
      if (post.QUÉ) categoriasSet.add(post.QUÉ);
      if (typeof post.Interacciones === 'number' && post.Interacciones > max) {
        max = post.Interacciones;
      }
    });

    return {
      tipos: Array.from(tiposSet).sort(),
      categorias: Array.from(categoriasSet).sort(),
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

  return (
    <>
      {/* Mobile toggle button */}
      <Button
        variant="outline"
        size="icon"
        className="fixed bottom-4 right-4 z-50 h-12 w-12 rounded-full shadow-lg lg:hidden"
        onClick={onToggle}
      >
        <Filter className="h-5 w-5" />
      </Button>

      {/* Sidebar */}
      <aside className={cn(
        'fixed left-0 top-0 z-40 h-screen w-72 transform bg-sidebar transition-transform duration-300 lg:relative lg:translate-x-0',
        isOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        <div className="flex h-full flex-col p-6 text-sidebar-foreground">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Filtros</h2>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onReset}
              className="text-sidebar-foreground hover:bg-sidebar-accent"
            >
              <RotateCcw className="mr-1 h-4 w-4" />
              Reset
            </Button>
          </div>

          <div className="flex-1 space-y-6 overflow-y-auto">
            {/* Organic/Sponsored */}
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
                  <Label htmlFor="organic" className="cursor-pointer text-sm">
                    Orgánico
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="sponsored"
                    checked={filters.patrocinado}
                    onCheckedChange={(checked) => 
                      onFiltersChange({ ...filters, patrocinado: !!checked })
                    }
                  />
                  <Label htmlFor="sponsored" className="cursor-pointer text-sm">
                    Patrocinado
                  </Label>
                </div>
              </div>
            </div>

            {/* Post Types */}
            <div className="sidebar-filter">
              <h3 className="mb-3 text-sm font-medium">Tipo de Post</h3>
              <div className="max-h-32 space-y-2 overflow-y-auto">
                {tipos.map(tipo => (
                  <div key={tipo} className="flex items-center gap-2">
                    <Checkbox
                      id={`tipo-${tipo}`}
                      checked={filters.tipos.includes(tipo)}
                      onCheckedChange={() => toggleTipo(tipo)}
                    />
                    <Label htmlFor={`tipo-${tipo}`} className="cursor-pointer text-sm">
                      {tipo}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Categories */}
            <div className="sidebar-filter">
              <h3 className="mb-3 text-sm font-medium">Categoría (QUÉ)</h3>
              <div className="max-h-32 space-y-2 overflow-y-auto">
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

            {/* Minimum Interactions */}
            <div className="sidebar-filter">
              <h3 className="mb-3 text-sm font-medium">
                Mínimo de Interacciones: {filters.minInteractions}
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

      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-30 bg-foreground/20 backdrop-blur-sm lg:hidden"
          onClick={onToggle}
        />
      )}
    </>
  );
}
