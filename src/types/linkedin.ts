export interface LinkedInPost {
  Post_Tema: string;
  Enlace: string;
  Fecha: string;
  Organico_Patrocinado: string;
  Tipo: string;
  QUE: string;
  COMO: string;
  Autor: string;
  Publico: string;
  Nombre_Campana: string;
  Fecha_Inicio_Campana: string;
  Fecha_Fin_Campana: string;
  Impresiones: number;
  Visualizaciones: number;
  Visualizaciones_Fuera_Sitio: number;
  Seguidores: number;
  Recomendaciones: number;
  Comentarios: number;
  Veces_Compartido: number;
  Porcentaje_Clics: number;
  Interacciones: number;
  Tasa_Interaccion: number;
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
