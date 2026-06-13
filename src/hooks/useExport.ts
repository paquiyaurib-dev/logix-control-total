import * as XLSX from 'xlsx';

interface ExportSheet {
  name: string;
  data: Record<string, unknown>[];
}

interface ExportMeta {
  title: string;
  generatedAt?: string;
  filters?: Array<{ label: string; value: string }>;
  summary?: Array<{ label: string; value: string | number }>;
}

interface ExportOptions {
  sheets: ExportSheet[];
  fileName: string;
  meta?: ExportMeta;
}

const fitColumnWidths = (rows: Record<string, unknown>[]) => {
  const keys = rows.length > 0 ? Object.keys(rows[0]) : [];
  return keys.map((key) => {
    const maxCellLength = rows.reduce((max, row) => {
      const value = row[key];
      return Math.max(max, String(value ?? '').length);
    }, key.length);
    return { wch: Math.min(Math.max(maxCellLength + 2, 12), 40) };
  });
};

const buildSummarySheet = (meta: ExportMeta) => {
  const rows: Record<string, unknown>[] = [
    { Campo: 'Reporte', Valor: meta.title },
    { Campo: 'Generado', Valor: meta.generatedAt ?? new Date().toLocaleString('es-PE') },
  ];

  meta.filters?.forEach((filter) => {
    rows.push({ Campo: filter.label, Valor: filter.value });
  });

  meta.summary?.forEach((item) => {
    rows.push({ Campo: item.label, Valor: item.value });
  });

  const worksheet = XLSX.utils.json_to_sheet(rows);
  worksheet['!cols'] = fitColumnWidths(rows);
  return worksheet;
};

export function useExport() {
  const exportToExcel = ({ sheets, fileName, meta }: ExportOptions) => {
    const workbook = XLSX.utils.book_new();

    if (meta) {
      XLSX.utils.book_append_sheet(workbook, buildSummarySheet(meta), 'Resumen');
    }

    sheets.forEach((sheet) => {
      const safeData = sheet.data.length > 0 ? sheet.data : [{ Mensaje: 'Sin registros para exportar' }];
      const worksheet = XLSX.utils.json_to_sheet(safeData);
      worksheet['!cols'] = fitColumnWidths(safeData);
      XLSX.utils.book_append_sheet(workbook, worksheet, sheet.name.slice(0, 31));
    });

    XLSX.writeFile(workbook, `${fileName}.xlsx`);
  };

  return { exportToExcel };
}
