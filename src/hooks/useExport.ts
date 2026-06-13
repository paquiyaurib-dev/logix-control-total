import * as XLSX from 'xlsx';

export function useExport() {
  const exportToExcel = (data: Record<string, unknown>[], sheetName: string, fileName: string) => {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, sheetName.slice(0, 31));
    XLSX.writeFile(wb, `${fileName}.xlsx`);
  };

  return { exportToExcel };
}
