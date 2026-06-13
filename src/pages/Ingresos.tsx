import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { clasesMovimiento, proveedores } from '../data/mockData';
import Button from '../components/ui/Button';

export default function Ingresos() {
  const { state, addIngreso } = useApp();
  const { state: authState } = useAuth();
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({ fecha: new Date().toISOString().split('T')[0], documento: '', clase: '101', proveedorId: '', materialId: '', cantidad: 0, observaciones: '' });
  const [materialSearch, setMaterialSearch] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const ingresosClases = clasesMovimiento.filter(c => c.value.startsWith('1'));
  const recentIngresos = useMemo(() => state.movimientos.filter(m => m.tipo === 'ingreso').slice(-20).reverse(), [state.movimientos]);

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
    addIngreso({
      materialId: mat.id,
      materialCodigo: mat.codigo,
      materialDescripcion: mat.descripcion,
      cantidad: form.cantidad,
      documento: form.documento,
      proveedor: proveedores.find(p => p.id === Number(form.proveedorId))?.razonSocial || '',
      bodeguero: authState.user?.nombre || '',
      supervisor: '',
      observaciones: form.observaciones,
      usuario: authState.user?.nombre || '',
    });
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
    setForm({ ...form, documento: '', materialId: '', cantidad: 0, observaciones: '' });
    setMaterialSearch('');
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      {/* Success toast */}
      {success && (
        <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} className="fixed top-20 right-6 bg-green-600 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50">
          <CheckCircle className="w-5 h-5" /> Ingreso registrado exitosamente
        </motion.div>
      )}

      {/* Form */}
      <div className="bg-white rounded-xl border border-[#E2E6EF] p-6">
        <h3 className="font-display font-semibold text-[#1B2A4A] mb-4">Registrar Ingreso</h3>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium text-[#6B7A99] uppercase tracking-wider mb-1">Fecha</label>
            <input type="date" value={form.fecha} onChange={e => setForm({...form, fecha: e.target.value})} className="w-full border border-[#E2E6EF] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E8672C]/30" />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#6B7A99] uppercase tracking-wider mb-1">N° Documento</label>
            <input value={form.documento} onChange={e => setForm({...form, documento: e.target.value})} className="w-full border border-[#E2E6EF] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E8672C]/30" />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#6B7A99] uppercase tracking-wider mb-1">Clase de Movimiento</label>
            <select value={form.clase} onChange={e => setForm({...form, clase: e.target.value})} className="w-full border border-[#E2E6EF] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E8672C]/30">
              {ingresosClases.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-[#6B7A99] uppercase tracking-wider mb-1">Proveedor</label>
            <select value={form.proveedorId} onChange={e => setForm({...form, proveedorId: e.target.value})} className="w-full border border-[#E2E6EF] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E8672C]/30">
              <option value="">Seleccionar...</option>
              {proveedores.map(p => <option key={p.id} value={p.id}>{p.razonSocial}</option>)}
            </select>
          </div>
          <div className="relative">
            <label className="block text-xs font-medium text-[#6B7A99] uppercase tracking-wider mb-1">Código Producto</label>
            <input value={materialSearch} onChange={e => { setMaterialSearch(e.target.value); setShowSuggestions(true); }} onFocus={() => setShowSuggestions(true)} className="w-full border border-[#E2E6EF] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E8672C]/30" placeholder="Buscar material..." />
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute z-10 top-full mt-1 w-full bg-white border border-[#E2E6EF] rounded-lg shadow-lg max-h-48 overflow-y-auto">
                {suggestions.map(m => (
                  <button key={m.id} type="button" onClick={() => { setForm({...form, materialId: String(m.id)}); setMaterialSearch(m.codigo); setShowSuggestions(false); }} className="w-full text-left px-3 py-2 text-sm hover:bg-[#E8672C]/5 flex justify-between">
                    <span className="font-medium">{m.codigo}</span><span className="text-[#6B7A99] truncate ml-2">{m.descripcion}</span>
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
            <label className="block text-xs font-medium text-[#6B7A99] uppercase tracking-wider mb-1">Cantidad</label>
            <input type="number" min={1} value={form.cantidad || ''} onChange={e => setForm({...form, cantidad: Number(e.target.value)})} className="w-full border border-[#E2E6EF] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E8672C]/30" />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#6B7A99] uppercase tracking-wider mb-1">Observaciones</label>
            <input value={form.observaciones} onChange={e => setForm({...form, observaciones: e.target.value})} className="w-full border border-[#E2E6EF] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E8672C]/30" />
          </div>
          <div className="md:col-span-2 lg:col-span-4 flex justify-end">
            <Button type="submit">Registrar Ingreso</Button>
          </div>
        </form>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-[#E2E6EF]">
        <div className="px-6 py-4 border-b border-[#E2E6EF]">
          <h3 className="font-display font-semibold text-[#1B2A4A]">Ingresos Recientes</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-gray-50 border-b border-[#E2E6EF]">
              {['Fecha','N° Doc','Clase','Proveedor','Código','Descripción','Cantidad','Observaciones','Usuario'].map(h => (
                <th key={h} className="px-3 py-3 text-left uppercase text-xs tracking-wider font-semibold text-[#6B7A99] whitespace-nowrap">{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {recentIngresos.map((m, i) => (
                <tr key={m.id} className={`${i%2 ? 'bg-gray-50/50' : ''} border-b border-[#E2E6EF]`}>
                  <td className="px-3 py-2.5">{m.fecha}</td>
                  <td className="px-3 py-2.5">{m.documento}</td>
                  <td className="px-3 py-2.5">Ingreso</td>
                  <td className="px-3 py-2.5">{m.proveedor}</td>
                  <td className="px-3 py-2.5 font-medium">{m.materialCodigo}</td>
                  <td className="px-3 py-2.5 max-w-[180px] truncate">{m.materialDescripcion}</td>
                  <td className="px-3 py-2.5 text-center font-semibold">{m.cantidad}</td>
                  <td className="px-3 py-2.5 text-[#6B7A99]">{m.observaciones}</td>
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
