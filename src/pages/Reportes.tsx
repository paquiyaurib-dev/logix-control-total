import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Package, ArrowDownToLine, ArrowUpFromLine, MapPin, UserCheck, Wrench, BookOpen, AlertTriangle, TrendingDown, History, Download } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useExport } from '../hooks/useExport';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';

const fmtPEN = (v: number) => v.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const reports = [
  { id: 'stock', title: 'Stock Actual (Valorizado)', desc: 'Reporte completo del stock actual con valorización en soles', icon: Package, needsDates: false },
  { id: 'ingresos', title: 'Ingresos por Período', desc: 'Detalle de ingresos en un rango de fechas', icon: ArrowDownToLine, needsDates: true },
  { id: 'salidas', title: 'Salidas por Período', desc: 'Detalle de salidas en un rango de fechas', icon: ArrowUpFromLine, needsDates: true },
  { id: 'consumos-zona', title: 'Consumos por Zona', desc: 'Consumo de materiales agrupado por zona de destino', icon: MapPin, needsDates: true },
  { id: 'consumos-supervisor', title: 'Consumos por Supervisor', desc: 'Consumo de materiales agrupado por supervisor', icon: UserCheck, needsDates: true },
  { id: 'consumos-labor', title: 'Consumos por Labor', desc: 'Consumo de materiales agrupado por labor/actividad', icon: Wrench, needsDates: true },
  { id: 'kardex', title: 'Kardex Completo', desc: 'Movimientos completos tipo kardex de todos los materiales', icon: BookOpen, needsDates: true },
  { id: 'criticos', title: 'Materiales Críticos', desc: 'Materiales con stock por debajo del mínimo', icon: AlertTriangle, needsDates: false },
  { id: 'stock-bajo', title: 'Materiales con Stock Bajo', desc: 'Materiales con stock cercano al mínimo', icon: TrendingDown, needsDates: false },
  { id: 'historial', title: 'Historial de Movimientos', desc: 'Registro completo de todos los movimientos', icon: History, needsDates: true },
];

export default function Reportes() {
  const { state } = useApp();
  const { exportToExcel } = useExport();
  const [activeReport, setActiveReport] = useState<string | null>(null);
  const [desde, setDesde] = useState('2026-01-01');
  const [hasta, setHasta] = useState(new Date().toISOString().split('T')[0]);

  const reportData = useMemo(() => {
    if (!activeReport) return [];
    switch (activeReport) {
      case 'stock': return state.materiales.map(m => ({ Código: m.codigo, Descripción: m.descripcion, Categoría: m.categoria, Unidad: m.unidad, 'Stock Mín': m.stockMin, 'Stock Máx': m.stockMax, 'Stock Actual': m.stockActual, 'P. Unit. (S/)': fmtPEN(m.precioUnitario), 'Valor Stock (S/)': fmtPEN(m.stockActual * m.precioUnitario), Ubicación: m.ubicacion, Estado: m.estado }));
      case 'ingresos': return state.movimientos.filter(m => m.tipo === 'ingreso' && m.fecha >= desde && m.fecha <= hasta).map(m => ({ Fecha: m.fecha, Documento: m.documento, Código: m.materialCodigo, Descripción: m.materialDescripcion, Cantidad: m.cantidad, Proveedor: m.proveedor, Usuario: m.usuario }));
      case 'salidas': return state.movimientos.filter(m => m.tipo === 'salida' && m.fecha >= desde && m.fecha <= hasta).map(m => ({ Fecha: m.fecha, Documento: m.documento, Código: m.materialCodigo, Descripción: m.materialDescripcion, Cantidad: m.cantidad, Zona: m.zona, Usuario: m.usuario }));
      case 'consumos-zona': { const grouped: Record<string, number> = {}; state.movimientos.filter(m => m.tipo === 'salida' && m.fecha >= desde && m.fecha <= hasta).forEach(m => { grouped[m.zona || 'Sin zona'] = (grouped[m.zona || 'Sin zona'] || 0) + m.cantidad; }); return Object.entries(grouped).map(([zona, total]) => ({ Zona: zona, 'Total Consumido': total })); }
      case 'consumos-supervisor': { const grouped: Record<string, number> = {}; state.movimientos.filter(m => m.tipo === 'salida' && m.fecha >= desde && m.fecha <= hasta).forEach(m => { grouped[m.supervisor || 'Sin supervisor'] = (grouped[m.supervisor || 'Sin supervisor'] || 0) + m.cantidad; }); return Object.entries(grouped).map(([sup, total]) => ({ Supervisor: sup, 'Total Consumido': total })); }
      case 'consumos-labor': { const grouped: Record<string, number> = {}; state.despachos.filter(d => d.fecha >= desde && d.fecha <= hasta).forEach(d => { grouped[d.labor] = (grouped[d.labor] || 0) + d.cantidad; }); return Object.entries(grouped).map(([labor, total]) => ({ Labor: labor, 'Total Consumido': total })); }
      case 'kardex': return state.movimientos.filter(m => m.fecha >= desde && m.fecha <= hasta).map(m => ({ Fecha: m.fecha, Tipo: m.tipo, Código: m.materialCodigo, Descripción: m.materialDescripcion, Cantidad: m.cantidad, Documento: m.documento, Usuario: m.usuario }));
      case 'criticos': return state.materiales.filter(m => m.stockActual < m.stockMin).map(m => ({ Código: m.codigo, Descripción: m.descripcion, 'Stock Actual': m.stockActual, 'Stock Mín': m.stockMin, Diferencia: m.stockActual - m.stockMin, 'P. Unit. (S/)': fmtPEN(m.precioUnitario), 'Valor Stock (S/)': fmtPEN(m.stockActual * m.precioUnitario) }));
      case 'stock-bajo': return state.materiales.filter(m => m.stockActual <= m.stockMin * 1.5).map(m => ({ Código: m.codigo, Descripción: m.descripcion, 'Stock Actual': m.stockActual, 'Stock Mín': m.stockMin, 'P. Unit. (S/)': fmtPEN(m.precioUnitario), 'Valor Stock (S/)': fmtPEN(m.stockActual * m.precioUnitario) }));
      case 'historial': return state.movimientos.filter(m => m.fecha >= desde && m.fecha <= hasta).sort((a, b) => b.fecha.localeCompare(a.fecha)).map(m => ({ Fecha: m.fecha, Tipo: m.tipo, Código: m.materialCodigo, Descripción: m.materialDescripcion, Cantidad: m.cantidad, Documento: m.documento, Usuario: m.usuario }));
      default: return [];
    }
  }, [activeReport, state, desde, hasta]);

  // Calculate total for stock-related reports
  const stockTotal = useMemo(() => {
    if (activeReport === 'stock') return state.materiales.reduce((s, m) => s + m.stockActual * m.precioUnitario, 0);
    if (activeReport === 'criticos') return state.materiales.filter(m => m.stockActual < m.stockMin).reduce((s, m) => s + m.stockActual * m.precioUnitario, 0);
    if (activeReport === 'stock-bajo') return state.materiales.filter(m => m.stockActual <= m.stockMin * 1.5).reduce((s, m) => s + m.stockActual * m.precioUnitario, 0);
    return null;
  }, [activeReport, state]);

  const currentReport = reports.find(r => r.id === activeReport);
  const columns = reportData.length > 0 ? Object.keys(reportData[0]) : [];

  const handleExport = () => {
    const exportData = [...reportData];
    if (stockTotal !== null) {
      const totalRow: Record<string, unknown> = {};
      columns.forEach((c, i) => {
        if (i === 0) totalRow[c] = 'TOTAL';
        else if (c === 'Valor Stock (S/)') totalRow[c] = `S/ ${fmtPEN(stockTotal)}`;
        else totalRow[c] = '';
      });
      exportData.push(totalRow as any);
    }
    exportToExcel(exportData, currentReport?.title || 'Reporte', `reporte-${activeReport}`);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <h2 className="text-lg font-display font-semibold text-[#1B2A4A]">Centro de Reportes</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {reports.map(r => (
          <div key={r.id} className="bg-white rounded-xl border border-[#E2E6EF] p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start gap-2.5 mb-2.5">
              <div className="w-9 h-9 rounded-lg bg-[#1B2A4A]/10 text-[#1B2A4A] flex items-center justify-center shrink-0"><r.icon className="w-4 h-4" /></div>
              <div><h3 className="font-semibold text-[#1B2A4A] text-sm">{r.title}</h3><p className="text-xs text-[#6B7A99] mt-0.5">{r.desc}</p></div>
            </div>
            <Button size="sm" onClick={() => setActiveReport(r.id)}>Generar</Button>
          </div>
        ))}
      </div>

      <Modal isOpen={!!activeReport} onClose={() => setActiveReport(null)} title={currentReport?.title || 'Reporte'} size="xl">
        {currentReport?.needsDates && (
          <div className="flex gap-4 mb-4">
            <div><label className="block text-xs font-medium text-[#6B7A99] uppercase tracking-wider mb-1">Desde</label>
              <input type="date" value={desde} onChange={e => setDesde(e.target.value)} className="border border-[#E2E6EF] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E8672C]/30" /></div>
            <div><label className="block text-xs font-medium text-[#6B7A99] uppercase tracking-wider mb-1">Hasta</label>
              <input type="date" value={hasta} onChange={e => setHasta(e.target.value)} className="border border-[#E2E6EF] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E8672C]/30" /></div>
          </div>
        )}

        <div className="overflow-x-auto rounded-lg border border-[#E2E6EF] mb-4 max-h-[400px] overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0"><tr className="bg-gray-50 border-b border-[#E2E6EF]">
              {columns.map(c => <th key={c} className="px-3 py-2.5 text-left uppercase text-xs tracking-wider font-semibold text-[#6B7A99] whitespace-nowrap">{c}</th>)}
            </tr></thead>
            <tbody>
              {reportData.slice(0, 100).map((row, i) => (
                <tr key={i} className={`${i%2 ? 'bg-gray-50/50' : ''} border-b border-[#E2E6EF]`}>
                  {columns.map(c => <td key={c} className="px-3 py-2 whitespace-nowrap">{String((row as any)[c] ?? '')}</td>)}
                </tr>
              ))}
            </tbody>
            {stockTotal !== null && (
              <tfoot>
                <tr className="bg-[#1B2A4A]/5 border-t-2 border-[#1B2A4A]/20 font-bold">
                  {columns.map((c, i) => (
                    <td key={c} className="px-3 py-2.5 whitespace-nowrap">
                      {i === 0 ? 'TOTAL' : c === 'Valor Stock (S/)' ? <span className="text-[#E8672C]">S/ {fmtPEN(stockTotal)}</span> : ''}
                    </td>
                  ))}
                </tr>
              </tfoot>
            )}
          </table>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs text-[#6B7A99]">{reportData.length} registros{stockTotal !== null && ` — Valor total: S/ ${fmtPEN(stockTotal)}`}</span>
          <Button icon={<Download className="w-4 h-4" />} onClick={handleExport}>Exportar a Excel</Button>
        </div>
      </Modal>
    </motion.div>
  );
}
