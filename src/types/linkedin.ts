export interface LinkedInPost {
  'Post / Tema': string;
  Fecha: string;
  'Orgánico / Patrocinado': string;
  Tipo: string;
  QUÉ: string;
  CÓMO: string;
  Visualizaciones: number;
  Recomendaciones: number;
  Comentarios: number;
  'Veces compartido': number;
  Impresiones: number;
  'Porcentaje de clics': number;
  Interacciones: number;
  'Tasa de interacción': number;
  [key: string]: string | number;
}

export interface Filters {
  organico: boolean;
  patrocinado: boolean;
  tipos: string[];
  categorias: string[];
  estrategias: string[];
  minInteractions: number;
  startDate: Date | undefined;
  endDate: Date | undefined;
  compareStartDate: Date | undefined;
  compareEndDate: Date | undefined;
  comparisonMode: boolean;
}
