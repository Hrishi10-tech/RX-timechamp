/** Export to CSV/PDF hook. */

import { useCallback, useState } from "react";

import type { ExportFormat } from "@/types/ui";
import { exportToCsv, exportToPdf } from "@/utils/exportHelpers";

interface CsvColumn<T> {
  header: string;
  accessor: (row: T) => string | number;
}

export interface UseExportReturn {
  isExporting: boolean;
  exportError: string | null;
  exportCsv: <T>(data: T[], columns: CsvColumn<T>[], filename: string) => void;
  exportPdf: (elementId: string, filename: string) => Promise<void>;
  exportByFormat: <T>(
    format: ExportFormat,
    data: T[],
    columns: CsvColumn<T>[],
    elementId: string,
    filename: string,
  ) => Promise<void>;
}

export function useExport(): UseExportReturn {
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const handleExportCsv = useCallback(
    <T>(data: T[], columns: CsvColumn<T>[], filename: string): void => {
      try {
        setIsExporting(true);
        setExportError(null);
        exportToCsv(data, columns, filename);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Export failed";
        setExportError(message);
      } finally {
        setIsExporting(false);
      }
    },
    [],
  );

  const handleExportPdf = useCallback(
    async (elementId: string, filename: string): Promise<void> => {
      try {
        setIsExporting(true);
        setExportError(null);
        await exportToPdf(elementId, filename);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Export failed";
        setExportError(message);
      } finally {
        setIsExporting(false);
      }
    },
    [],
  );

  const exportByFormat = useCallback(
    async <T>(
      format: ExportFormat,
      data: T[],
      columns: CsvColumn<T>[],
      elementId: string,
      filename: string,
    ): Promise<void> => {
      if (format === "csv") {
        handleExportCsv(data, columns, filename);
      } else {
        await handleExportPdf(elementId, filename);
      }
    },
    [handleExportCsv, handleExportPdf],
  );

  return {
    isExporting,
    exportError,
    exportCsv: handleExportCsv,
    exportPdf: handleExportPdf,
    exportByFormat,
  };
}
