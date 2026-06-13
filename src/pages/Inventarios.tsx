import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import Badge from '../components/ui/Badge';

const tabs = ['Inventario Físico', 'Ajustes', 'Kardex por Material', 'Kardex por Familia', 'Historial'] as const;

export default function Inventarios() {
  const { state } = useApp();
  const [activeTab, setActiveTab] = useState<string>(tabs[0]);
  const [selectedMaterialId, setSelectedMaterialId] = useState('');
  const [selectedFamilia, setSelectedFamilia] = useState('');
  const [histFiltroTipo, setHistFiltroTipo] = useState('');

  const familias = useMemo(() => [...new Set(state.materiales.map(m => m.familia))], [state.materiales]);

  // Inventario Físico - generate mock physical counts
  const inventarioFisico = useMemo(() => state.materiales.map(m => {
    const diff = Math.floor(Math.random() * 7) - 3;
    const stockFisico = Math.max(0, m.stockActual + diff);
    return { ...m, stockFisico, diferencia: stockFisico - m.stockActual };
  }), [state.materiales]);

  // Kardex for selected material
  const kardexMaterial = useMemo(() => {
    if (!selectedMaterialId) return [];
    const id = Number(selectedMaterialId);
    const movs = state.movimientos.filter(m => m.materialId === id).sort((a, b) => a.fecha.localeCompare(b.fecha));
    let saldo = 0;
    return movs.map(m => {
      saldo += m.tipo === 'ingreso' ? m.cantidad : -m.cantidad;
      return { ...m, saldo };
    });
  }, [selectedMaterialId, state.movimientos]);

  // Kardex by family
  const kardexFamilia = useMemo(() => {
    if (!selectedFamilia) return [];
    const matIds = state.materiales.filter(m => m.familia === selectedFamilia).map(m => m.id);
    return state.movimientos.filter(m => matIds.includes(m.materialId)).sort((a, b) => b.fecha.localeCompare(a.fecha));
  }, [selectedFamilia, state.materiales, state.movimientos]);

  // Historial
  const historial = useMemo(() => {
    let movs = [...state.movimientos].sort((a, b) => b.fecha.localeCompare(a.fecha));
    if (histFiltroTipo) movs = movs.filter(m => m.tipo === histFiltroTipo);
    return movs;
  }, [state.movimientos, histFiltroTipo]);

  const inputCls = "w-full border border-[#E2E6EF] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E8672C]/30";
  const thCls = "px-3 py-3 text-left uppercase text-xs tracking-wider font-semibold text-[#6B7A99] whitespace-nowrap";

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-1 border-b border-[#E2E6EF] overflow-x-auto">
        {tabs.map(t => (
          <button key={t} onClick={() => setActiveTab(t)} className={`px-4 py-2.5 text-sm whitespace-nowrap transition-colors ${activeTab === t ? 'border-b-2 border-[#E8672C] text-[#E8672C] font-semibold' : 'text-[#6B7A99] hover:text-[#1B2A4A]'}`}>{t}</button>
        ))}
      </div>

      {/* Tab: Inventario Físico */}
      {activeTab === tabs[0] && (
        <div className="bg-white rounded-xl border border-[#E2E6EF] overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-gray-50 border-b border-[#E2E6EF]">
              {['Código','Descripción','Stock Sistema','Stock Físico','Diferencia','Estado'].map(h => <th key={h} className={thCls}>{h}</th>)}
            </tr></thead>
            <tbody>
              {inventarioFisico.map((m, i) => (
                <tr key={m.id} className={`${i%2 ? 'bg-gray-50/50' : ''} border-b border-[#E2E6EF]`}>
                  <td className="px-3 py-2.5 font-medium">{m.codigo}</td>
                  <td className="px-3 py-2.5">{m.descripcion}</td>
                  <td className="px-3 py-2.5 text-center">{m.stockActual}</td>
                  <td className="px-3 py-2.5 text-center">{m.stockFisico}</td>
                  <td className={`px-3 py-2.5 text-center font-semibold ${m.diferencia < 0 ? 'text-red-600' : m.diferencia > 0 ? 'text-green-600' : ''}`}>{m.diferencia > 0 ? '+' : ''}{m.diferencia}</td>
                  <td className="px-3 py-2.5"><Badge variant={m.diferencia === 0 ? 'success' : Math.abs(m.diferencia) > 3 ? 'danger' : 'warning'}>{m.diferencia === 0 ? 'Correcto' : Math.abs(m.diferencia) > 3 ? 'Crítico' : 'Diferencia'}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab: Ajustes */}
      {activeTab === tabs[1] && (
        <div className="bg-white rounded-xl border border-[#E2E6EF] p-6">
          <h3 className="font-display font-semibold text-[#1B2A4A] mb-4">Registrar Ajuste de Inventario</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
            <div><label className="block text-xs font-medium text-[#6B7A99] uppercase tracking-wider mb-1">Material</label>
              <select className={inputCls}><option value="">Seleccionar...</option>{state.materiales.map(m => <option key={m.id} value={m.id}>{m.codigo} - {m.descripcion}</option>)}</select></div>
            <div><label className="block text-xs font-medium text-[#6B7A99] uppercase tracking-wider mb-1">Tipo Ajuste</label>
              <select className={inputCls}><option>Positivo</option><option>Negativo</option></select></div>
            <div><label className="block text-xs font-medium text-[#6B7A99] uppercase tracking-wider mb-1">Cantidad</label>
              <input type="number" className={inputCls} /></div>
            <div><label className="block text-xs font-medium text-[#6B7A99] uppercase tracking-wider mb-1">Motivo</label>
              <select className={inputCls}><option>Conteo físico</option><option>Merma</option><option>Error de registro</option><option>Otro</option></select></div>
            <div className="md:col-span-2"><label className="block text-xs font-medium text-[#6B7A99] uppercase tracking-wider mb-1">Observaciones</label>
              <textarea className={inputCls} rows={2} /></div>
            <div className="md:col-span-2 flex justify-end">
              <button className="bg-[#E8672C] text-white px-6 py-2 rounded-lg text-sm font-semibold hover:bg-[#E8672C]/90">Registrar Ajuste</button>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Kardex por Material */}
      {activeTab === tabs[2] && (
        <div className="space-y-4">
          <select value={selectedMaterialId} onChange={e => setSelectedMaterialId(e.target.value)} className={`${inputCls} max-w-md`}>
            <option value="">Seleccionar material...</option>
            {state.materiales.map(m => <option key={m.id} value={m.id}>{m.codigo} - {m.descripcion}</option>)}
          </select>
          {selectedMaterialId && (
            <div className="bg-white rounded-xl border border-[#E2E6EF] overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="bg-gray-50 border-b border-[#E2E6EF]">
                  {['Fecha','Tipo','Documento','Cantidad','Saldo','Observaciones'].map(h => <th key={h} className={thCls}>{h}</th>)}
                </tr></thead>
                <tbody>
                  {kardexMaterial.map((m, i) => (
                    <tr key={m.id} className={`${i%2 ? 'bg-gray-50/50' : ''} border-b border-[#E2E6EF]`}>
                      <td className="px-3 py-2.5">{m.fecha}</td>
                      <td className="px-3 py-2.5"><Badge variant={m.tipo === 'ingreso' ? 'success' : m.tipo === 'salida' ? 'danger' : 'warning'}>{m.tipo}</Badge></td>
                      <td className="px-3 py-2.5">{m.documento}</td>
                      <td className={`px-3 py-2.5 text-center font-semibold ${m.tipo === 'ingreso' ? 'text-green-600' : 'text-red-600'}`}>{m.tipo === 'ingreso' ? '+' : '-'}{m.cantidad}</td>
                      <td className="px-3 py-2.5 text-center font-bold">{m.saldo}</td>
                      <td className="px-3 py-2.5 text-[#6B7A99]">{m.observaciones}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab: Kardex por Familia */}
      {activeTab === tabs[3] && (
        <div className="space-y-4">
          <select value={selectedFamilia} onChange={e => setSelectedFamilia(e.target.value)} className={`${inputCls} max-w-md`}>
            <option value="">Seleccionar familia...</option>
            {familias.map(f => <option key={f}>{f}</option>)}
          </select>
          {selectedFamilia && (
            <div className="bg-white rounded-xl border border-[#E2E6EF] overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="bg-gray-50 border-b border-[#E2E6EF]">
                  {['Fecha','Código','Descripción','Tipo','Cantidad','Usuario'].map(h => <th key={h} className={thCls}>{h}</th>)}
                </tr></thead>
                <tbody>
                  {kardexFamilia.map((m, i) => (
                    <tr key={m.id} className={`${i%2 ? 'bg-gray-50/50' : ''} border-b border-[#E2E6EF]`}>
                      <td className="px-3 py-2.5">{m.fecha}</td>
                      <td className="px-3 py-2.5 font-medium">{m.materialCodigo}</td>
                      <td className="px-3 py-2.5">{m.materialDescripcion}</td>
                      <td className="px-3 py-2.5"><Badge variant={m.tipo === 'ingreso' ? 'success' : m.tipo === 'salida' ? 'danger' : 'warning'}>{m.tipo}</Badge></td>
                      <td className="px-3 py-2.5 text-center font-semibold">{m.cantidad}</td>
                      <td className="px-3 py-2.5 text-[#6B7A99]">{m.usuario}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab: Historial */}
      {activeTab === tabs[4] && (
        <div className="space-y-4">
          <div className="flex gap-3">
            <select value={histFiltroTipo} onChange={e => setHistFiltroTipo(e.target.value)} className={`${inputCls} max-w-xs`}>
              <option value="">Todos los tipos</option>
              <option value="ingreso">Ingresos</option>
              <option value="salida">Salidas</option>
              <option value="ajuste">Ajustes</option>
            </select>
          </div>
          <div className="bg-white rounded-xl border border-[#E2E6EF] overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="bg-gray-50 border-b border-[#E2E6EF]">
                {['Fecha','Tipo','Código','Descripción','Cantidad','Documento','Usuario'].map(h => <th key={h} className={thCls}>{h}</th>)}
              </tr></thead>
              <tbody>
                {historial.slice(0, 50).map((m, i) => (
                  <tr key={m.id} className={`${i%2 ? 'bg-gray-50/50' : ''} border-b border-[#E2E6EF]`}>
                    <td className="px-3 py-2.5">{m.fecha}</td>
                    <td className="px-3 py-2.5"><Badge variant={m.tipo === 'ingreso' ? 'success' : m.tipo === 'salida' ? 'danger' : 'warning'}>{m.tipo}</Badge></td>
                    <td className="px-3 py-2.5 font-medium">{m.materialCodigo}</td>
                    <td className="px-3 py-2.5">{m.materialDescripcion}</td>
                    <td className="px-3 py-2.5 text-center font-semibold">{m.cantidad}</td>
                    <td className="px-3 py-2.5">{m.documento}</td>
                    <td className="px-3 py-2.5 text-[#6B7A99]">{m.usuario}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </motion.div>
  );
}
