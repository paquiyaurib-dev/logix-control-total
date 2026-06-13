import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { laboresActividad } from '../data/mockData';
import Button from '../components/ui/Button';

export default function Despachos() {
  const { state, addDespacho } = useApp();
  const [success, setSuccess] = useState(false);
  const [laborFilter, setLaborFilter] = useState('');
  const [materialSearch, setMaterialSearch] = useState('');
  const [showSugg, setShowSugg] = useState(false);
  const [form, setForm] = useState({ materialId: '', cantidad: 0, labor: '', supervisor: '', fecha: new Date().toISOString().split('T')[0], observaciones: '' });

  const suggestions = useMemo(() => {
    if (!materialSearch) return [];
    return state.materiales.filter(m => m.codigo.toLowerCase().includes(materialSearch.toLowerCase()) || m.descripcion.toLowerCase().includes(materialSearch.toLowerCase())).slice(0, 8);
  }, [materialSearch, state.materiales]);

  const selectedMaterial = state.materiales.find(m => m.id === Number(form.materialId));
  const filteredDespachos = useMemo(() => {
    let d = [...state.despachos].reverse();
    if (laborFilter) d = d.filter(x => x.labor === laborFilter);
    return d;
  }, [state.despachos, laborFilter]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const mat = state.materiales.find(m => m.id === Number(form.materialId));
    if (!mat || !form.cantidad) return;
    addDespacho({ materialId: mat.id, materialCodigo: mat.codigo, materialDescripcion: mat.descripcion, cantidad: form.cantidad, labor: form.labor, supervisor: form.supervisor, observaciones: form.observaciones });
    setSuccess(true); setTimeout(() => setSuccess(false), 3000);
    setForm({ ...form, materialId: '', cantidad: 0, observaciones: '' }); setMaterialSearch('');
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      {success && (
        <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} className="fixed top-20 right-6 bg-green-600 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50">
          <CheckCircle className="w-5 h-5" /> Despacho registrado exitosamente
        </motion.div>
      )}

      <div className="bg-white rounded-xl border border-[#E2E6EF] p-6">
        <h3 className="font-display font-semibold text-[#1B2A4A] mb-4">Registrar Despacho Interno</h3>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="relative">
            <label className="block text-xs font-medium text-[#6B7A99] uppercase tracking-wider mb-1">Código Material</label>
            <input value={materialSearch} onChange={e => { setMaterialSearch(e.target.value); setShowSugg(true); }} onFocus={() => setShowSugg(true)} className="w-full border border-[#E2E6EF] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E8672C]/30" placeholder="Buscar..." />
            {showSugg && suggestions.length > 0 && (
              <div className="absolute z-10 top-full mt-1 w-full bg-white border border-[#E2E6EF] rounded-lg shadow-lg max-h-48 overflow-y-auto">
                {suggestions.map(m => (
                  <button key={m.id} type="button" onClick={() => { setForm({...form, materialId: String(m.id)}); setMaterialSearch(m.codigo); setShowSugg(false); }} className="w-full text-left px-3 py-2 text-sm hover:bg-[#E8672C]/5">
                    <span className="font-medium">{m.codigo}</span> — <span className="text-[#6B7A99]">{m.descripcion}</span>
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
            <label className="block text-xs font-medium text-[#6B7A99] uppercase tracking-wider mb-1">Cantidad Entregada</label>
            <input type="number" min={1} value={form.cantidad || ''} onChange={e => setForm({...form, cantidad: Number(e.target.value)})} className="w-full border border-[#E2E6EF] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E8672C]/30" />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#6B7A99] uppercase tracking-wider mb-1">Labor / Actividad</label>
            <select value={form.labor} onChange={e => setForm({...form, labor: e.target.value})} className="w-full border border-[#E2E6EF] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E8672C]/30">
              <option value="">Seleccionar...</option>
              {laboresActividad.map(l => <option key={l}>{l}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-[#6B7A99] uppercase tracking-wider mb-1">Supervisor</label>
            <input value={form.supervisor} onChange={e => setForm({...form, supervisor: e.target.value})} className="w-full border border-[#E2E6EF] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E8672C]/30" />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#6B7A99] uppercase tracking-wider mb-1">Fecha</label>
            <input type="date" value={form.fecha} onChange={e => setForm({...form, fecha: e.target.value})} className="w-full border border-[#E2E6EF] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E8672C]/30" />
          </div>
          <div className="md:col-span-2 lg:col-span-3">
            <label className="block text-xs font-medium text-[#6B7A99] uppercase tracking-wider mb-1">Observaciones</label>
            <input value={form.observaciones} onChange={e => setForm({...form, observaciones: e.target.value})} className="w-full border border-[#E2E6EF] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E8672C]/30" />
          </div>
          <div className="md:col-span-2 lg:col-span-3 flex justify-end">
            <Button type="submit">Registrar Despacho</Button>
          </div>
        </form>
      </div>

      {/* Historial */}
      <div className="bg-white rounded-xl border border-[#E2E6EF]">
        <div className="px-6 py-4 border-b border-[#E2E6EF] flex items-center justify-between">
          <h3 className="font-display font-semibold text-[#1B2A4A]">Historial de Despachos</h3>
          <select value={laborFilter} onChange={e => setLaborFilter(e.target.value)} className="text-sm border border-[#E2E6EF] rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-[#E8672C]/30">
            <option value="">Todas las labores</option>
            {laboresActividad.map(l => <option key={l}>{l}</option>)}
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-gray-50 border-b border-[#E2E6EF]">
              {['Fecha','Código','Descripción','Cantidad','Labor','Supervisor','Observaciones'].map(h => (
                <th key={h} className="px-3 py-3 text-left uppercase text-xs tracking-wider font-semibold text-[#6B7A99] whitespace-nowrap">{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {filteredDespachos.map((d, i) => (
                <tr key={d.id} className={`${i%2 ? 'bg-gray-50/50' : ''} border-b border-[#E2E6EF]`}>
                  <td className="px-3 py-2.5">{d.fecha}</td>
                  <td className="px-3 py-2.5 font-medium">{d.materialCodigo}</td>
                  <td className="px-3 py-2.5">{d.materialDescripcion}</td>
                  <td className="px-3 py-2.5 text-center font-semibold">{d.cantidad}</td>
                  <td className="px-3 py-2.5">{d.labor}</td>
                  <td className="px-3 py-2.5">{d.supervisor}</td>
                  <td className="px-3 py-2.5 text-[#6B7A99]">{d.observaciones}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}
