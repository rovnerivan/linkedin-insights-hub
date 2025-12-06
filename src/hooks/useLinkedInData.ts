import { useState, useEffect, useCallback } from 'react';
import type { LinkedInPost } from '@/types/linkedin';

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

      const columns: string[] = rawJson.table.cols.map((col: { label: string }) => col.label);
      
      // Log columns for debugging
      console.log('Google Sheets columns:', columns);

      const transformedData: LinkedInPost[] = rawJson.table.rows.map((row: { c: Array<{ v?: unknown; f?: string } | null> }, rowIndex: number) => {
        const rowObject: Record<string, string | number> = {};
        
        row.c.forEach((cell, index) => {
          const colName = columns[index];
          if (!colName) return;

          if (cell === null) {
            rowObject[colName] = '';
            return;
          }

          const rawValue = cell.v;
          const formattedValue = cell.f;

          // Handle Google Sheets Date format: "Date(YYYY,M,D)"
          if (typeof rawValue === 'string' && rawValue.startsWith('Date(')) {
            // Use the formatted value if available, otherwise parse the Date string
            if (formattedValue) {
              rowObject[colName] = formattedValue;
            } else {
              const match = rawValue.match(/Date\((\d+),(\d+),(\d+)\)/);
              if (match) {
                const [, year, month, day] = match;
                rowObject[colName] = `${String(parseInt(month) + 1).padStart(2, '0')}/${day.padStart(2, '0')}/${year}`;
              } else {
                rowObject[colName] = rawValue;
              }
            }
            return;
          }

          // For date columns, prefer the formatted value
          if (colName === 'Fecha' && formattedValue) {
            rowObject[colName] = formattedValue;
            return;
          }

          let value: string | number;
          if (rawValue === undefined || rawValue === null) {
            value = formattedValue || '';
          } else {
            value = rawValue as string | number;
          }

          if (typeof value === 'number') {
            rowObject[colName] = value;
          } else if (typeof value === 'string' && value !== '' && !isNaN(parseFloat(value)) && colName !== 'Fecha') {
            rowObject[colName] = parseFloat(value);
          } else {
            rowObject[colName] = value;
          }
        });

        // Log first row for debugging
        if (rowIndex === 0) {
          console.log('First row data:', rowObject);
        }

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
    const interval = setInterval(fetchData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchData]);

  return { data, loading, error, lastUpdated, refetch: fetchData };
}
