import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { zonasDestino } from '../data/mockData';
import Button from '../components/ui/Button';

export default function Salidas() {
  const { state, addSalida } = useApp();
  const { state: authState } = useAuth();
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [form, setForm] = useState({ fecha: new Date().toISOString().split('T')[0], materialId: '', cantidad: 0, vale: '', zona: '', bodeguero: authState.user?.nombre || '', supervisor: '', observaciones: '' });
  const [materialSearch, setMaterialSearch] = useState('');
  const [showSugg, setShowSugg] = useState(false);

  const recentSalidas = useMemo(() => state.movimientos.filter(m => m.tipo === 'salida').slice(-20).reverse(), [state.movimientos]);
  const suggestions = useMemo(() => {
    if (!materialSearch) return [];
    return state.materiales.filter(m => m.codigo.toLowerCase().includes(materialSearch.toLowerCase()) || m.descripcion.toLowerCase().includes(materialSearch.toLowerCase())).slice(0, 8);
  }, [materialSearch, state.materiales]);
  const selectedMaterial = state.materiales.find(m => m.id === Number(form.materialId));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.materialId || !form.cantidad) return;
    const mat = state.materiales.find(m => m.id === Number(form.materialId));
    if (!mat) return;
    const ok = addSalida({
      materialId: mat.id, materialCodigo: mat.codigo, materialDescripcion: mat.descripcion,
      cantidad: form.cantidad, documento: form.vale, zona: form.zona,
      bodeguero: form.bodeguero, supervisor: form.supervisor, observaciones: form.observaciones,
      usuario: authState.user?.nombre || '',
    });
    if (ok) {
      setMsg({ type: 'success', text: 'Salida registrada exitosamente' });
      setForm({ ...form, materialId: '', cantidad: 0, vale: '', observaciones: '' }); setMaterialSearch('');
    } else {
      setMsg({ type: 'error', text: `Stock insuficiente. Disponible: ${mat.stockActual} ${mat.unidad}` });
    }
    setTimeout(() => setMsg(null), 3000);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      {msg && (
        <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} className={`fixed top-20 right-6 ${msg.type === 'success' ? 'bg-green-600' : 'bg-red-600'} text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50`}>
          {msg.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />} {msg.text}
        </motion.div>
      )}

      <div className="bg-white rounded-xl border border-[#E2E6EF] p-6">
        <h3 className="font-display font-semibold text-[#1B2A4A] mb-4">Registrar Salida</h3>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium text-[#6B7A99] uppercase tracking-wider mb-1">Fecha</label>
            <input type="date" value={form.fecha} onChange={e => setForm({...form, fecha: e.target.value})} className="w-full border border-[#E2E6EF] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E8672C]/30" />
          </div>
          <div className="relative">
            <label className="block text-xs font-medium text-[#6B7A99] uppercase tracking-wider mb-1">Código Producto</label>
            <input value={materialSearch} onChange={e => { setMaterialSearch(e.target.value); setShowSugg(true); }} onFocus={() => setShowSugg(true)} className="w-full border border-[#E2E6EF] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E8672C]/30" placeholder="Buscar..." />
            {showSugg && suggestions.length > 0 && (
              <div className="absolute z-10 top-full mt-1 w-full bg-white border border-[#E2E6EF] rounded-lg shadow-lg max-h-48 overflow-y-auto">
                {suggestions.map(m => (
                  <button key={m.id} type="button" onClick={() => { setForm({...form, materialId: String(m.id)}); setMaterialSearch(m.codigo); setShowSugg(false); }} className="w-full text-left px-3 py-2 text-sm hover:bg-[#E8672C]/5 flex justify-between">
                    <span className="font-medium">{m.codigo}</span><span className="text-[#6B7A99] truncate ml-2">{m.descripcion} (Stock: {m.stockActual})</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <div>
            <label className="block text-xs font-medium text-[#6B7A99] uppercase tracking-wider mb-1">Descripción</label>
            <input readOnly value={selectedMaterial?.descripcion || ''} className="w-full border border-[#E2E6EF] rounded-lg px-3 py-2 text-sm bg-gray-50 text-[#6B7A99]" />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#6B7A99] uppercase tracking-wider mb-1">Cantidad {selectedMaterial && <span className="text-[#6B7A99]">(Disp: {selectedMaterial.stockActual})</span>}</label>
            <input type="number" min={1} max={selectedMaterial?.stockActual} value={form.cantidad || ''} onChange={e => setForm({...form, cantidad: Number(e.target.value)})} className="w-full border border-[#E2E6EF] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E8672C]/30" />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#6B7A99] uppercase tracking-wider mb-1">N° Vale</label>
            <input value={form.vale} onChange={e => setForm({...form, vale: e.target.value})} className="w-full border border-[#E2E6EF] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E8672C]/30" />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#6B7A99] uppercase tracking-wider mb-1">Zona de Destino</label>
            <select value={form.zona} onChange={e => setForm({...form, zona: e.target.value})} className="w-full border border-[#E2E6EF] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E8672C]/30">
              <option value="">Seleccionar...</option>
              {zonasDestino.map(z => <option key={z}>{z}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-[#6B7A99] uppercase tracking-wider mb-1">Supervisor</label>
            <input value={form.supervisor} onChange={e => setForm({...form, supervisor: e.target.value})} className="w-full border border-[#E2E6EF] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E8672C]/30" />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#6B7A99] uppercase tracking-wider mb-1">Observaciones</label>
            <input value={form.observaciones} onChange={e => setForm({...form, observaciones: e.target.value})} className="w-full border border-[#E2E6EF] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E8672C]/30" />
          </div>
          <div className="md:col-span-2 lg:col-span-4 flex justify-end">
            <Button type="submit">Registrar Salida</Button>
          </div>
        </form>
      </div>

      {/* Recent table */}
      <div className="bg-white rounded-xl border border-[#E2E6EF]">
        <div className="px-6 py-4 border-b border-[#E2E6EF]"><h3 className="font-display font-semibold text-[#1B2A4A]">Salidas Recientes</h3></div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-gray-50 border-b border-[#E2E6EF]">
              {['Fecha','N° Vale','Zona','Código','Descripción','Cantidad','Bodeguero','Supervisor','Usuario'].map(h => (
                <th key={h} className="px-3 py-3 text-left uppercase text-xs tracking-wider font-semibold text-[#6B7A99] whitespace-nowrap">{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {recentSalidas.map((m, i) => (
                <tr key={m.id} className={`${i%2 ? 'bg-gray-50/50' : ''} border-b border-[#E2E6EF]`}>
                  <td className="px-3 py-2.5">{m.fecha}</td>
                  <td className="px-3 py-2.5">{m.documento}</td>
                  <td className="px-3 py-2.5">{m.zona}</td>
                  <td className="px-3 py-2.5 font-medium">{m.materialCodigo}</td>
                  <td className="px-3 py-2.5 max-w-[180px] truncate">{m.materialDescripcion}</td>
                  <td className="px-3 py-2.5 text-center font-semibold">{m.cantidad}</td>
                  <td className="px-3 py-2.5 text-[#6B7A99]">{m.bodeguero}</td>
                  <td className="px-3 py-2.5 text-[#6B7A99]">{m.supervisor}</td>
                  <td className="px-3 py-2.5 text-[#6B7A99]">{m.usuario}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}
