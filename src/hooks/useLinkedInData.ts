import { useState, useEffect, useCallback } from 'react';

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

interface UseLinkedInDataReturn {
  data: LinkedInPost[];
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  refetch: () => Promise<void>;
}

const GVIZ_URL = 'https://docs.google.com/spreadsheets/d/1yODO4q9oLaBXg2MiA_oGZxfJRICm3kjFQGwv1iM1ZY4/gviz/tq?tqx=out:json&gid=330647936';

export function useLinkedInData(): UseLinkedInDataReturn {
  const [data, setData] = useState<LinkedInPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(GVIZ_URL);

      if (!response.ok) {
        throw new Error('Failed to load data from Google Sheets');
      }

      const text = await response.text();
      const jsonString = text.substring(47).slice(0, -2);
      const rawJson = JSON.parse(jsonString);

      const columns = rawJson.table.cols.map((col: { label: string }) => col.label);

      const transformedData: LinkedInPost[] = rawJson.table.rows.map((row: { c: Array<{ v?: unknown; f?: string } | null> }) => {
        const rowObject: Record<string, string | number> = {};
        
        row.c.forEach((cell, index) => {
          const colName = columns[index];
          if (!colName) return;

          let value: string | number;
          if (cell === null) {
            value = '';
          } else {
            value = cell.v !== undefined ? cell.v as string | number : (cell.f || '');
            if (value === null) value = '';
          }

          if (typeof value === 'number') {
            rowObject[colName] = value;
          } else if (typeof value === 'string' && value !== '' && !isNaN(parseFloat(value))) {
            rowObject[colName] = parseFloat(value);
          } else {
            rowObject[colName] = value;
          }
        });

        return rowObject as LinkedInPost;
      });

      setData(transformedData);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();

    // Refresh every 5 minutes
    const interval = setInterval(fetchData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchData]);

  return { data, loading, error, lastUpdated, refetch: fetchData };
}
