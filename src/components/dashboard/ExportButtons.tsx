import { useCallback } from 'react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { Button } from '@/components/ui/button';
import { FileDown, Download, Loader2 } from 'lucide-react';
import { useState } from 'react';

interface ExportButtonsProps {
  dashboardRef: React.RefObject<HTMLDivElement>;
  onExportCSV: () => void;
}

export function ExportButtons({ dashboardRef, onExportCSV }: ExportButtonsProps) {
  const [isExporting, setIsExporting] = useState(false);

  const exportToPDF = useCallback(async () => {
    if (!dashboardRef.current) return;
    
    setIsExporting(true);
    
    try {
      const element = dashboardRef.current;
      
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#f5f7fa'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [canvas.width, canvas.height]
      });

      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`linkedin_analytics_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setIsExporting(false);
    }
  }, [dashboardRef]);

  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={onExportCSV}
        className="gap-2"
      >
        <Download className="h-4 w-4" />
        <span className="hidden sm:inline">CSV</span>
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        onClick={exportToPDF}
        disabled={isExporting}
        className="gap-2"
      >
        {isExporting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <FileDown className="h-4 w-4" />
        )}
        <span className="hidden sm:inline">PDF</span>
      </Button>
    </div>
  );
}
