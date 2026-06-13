import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Grid3X3, List, Plus, Monitor, Wrench, Radio, Laptop, Printer, Car } from 'lucide-react';
import { useApp } from '../context/AppContext';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import SearchBar from '../components/ui/SearchBar';
import { Activo } from '../data/mockData';

const categorias = ['Todos', 'Equipos', 'Herramientas', 'Radios', 'Computadoras', 'Impresoras', 'Vehículos'] as const;
const catIcons: Record<string, React.ReactNode> = {
  Equipos: <Monitor className="w-5 h-5" />, Herramientas: <Wrench className="w-5 h-5" />, Radios: <Radio className="w-5 h-5" />,
  Computadoras: <Laptop className="w-5 h-5" />, Impresoras: <Printer className="w-5 h-5" />, Vehículos: <Car className="w-5 h-5" />,
};
const estadoVariant = (e: string) => e === 'Operativo' ? 'success' as const : e === 'En Mantenimiento' ? 'warning' as const : 'danger' as const;

export default function Activos() {
  const { state, addActivo, updateActivo } = useApp();
  const [view, setView] = useState<'grid' | 'table'>('grid');
  const [catFilter, setCatFilter] = useState('Todos');
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState<Activo | null>(null);
  const [form, setForm] = useState<any>({ codigoPatrimonial: '', serie: '', marca: '', modelo: '', categoria: 'Equipos', ubicacion: '', responsable: '', estado: 'Operativo', fechaAsignacion: new Date().toISOString().split('T')[0], historialTransferencias: [] });

  const filtered = useMemo(() => state.activos.filter(a => {
    const matchCat = catFilter === 'Todos' || a.categoria === catFilter;
    const matchSearch = !search || a.codigoPatrimonial.toLowerCase().includes(search.toLowerCase()) || a.marca.toLowerCase().includes(search.toLowerCase()) || a.modelo.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  }), [state.activos, catFilter, search]);

  const openNew = () => { setSelected(null); setForm({ codigoPatrimonial: '', serie: '', marca: '', modelo: '', categoria: 'Equipos', ubicacion: '', responsable: '', estado: 'Operativo', fechaAsignacion: new Date().toISOString().split('T')[0], historialTransferencias: [] }); setModalOpen(true); };
  const openEdit = (a: Activo) => { setSelected(a); setForm({ ...a }); setModalOpen(true); };
  const handleSave = () => {
    if (selected) updateActivo({ ...form, id: selected.id }); else addActivo(form);
    setModalOpen(false);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h2 className="text-xl font-display font-semibold text-[#1B2A4A]">Control de Activos</h2>
        <div className="flex gap-2">
          <button onClick={() => setView('grid')} className={`p-2 rounded-lg ${view === 'grid' ? 'bg-[#E8672C] text-white' : 'bg-white border border-[#E2E6EF] text-[#6B7A99]'}`}><Grid3X3 className="w-4 h-4" /></button>
          <button onClick={() => setView('table')} className={`p-2 rounded-lg ${view === 'table' ? 'bg-[#E8672C] text-white' : 'bg-white border border-[#E2E6EF] text-[#6B7A99]'}`}><List className="w-4 h-4" /></button>
          <Button onClick={openNew} icon={<Plus className="w-4 h-4" />}>Nuevo Activo</Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <SearchBar value={search} onChange={setSearch} placeholder="Buscar activo..." className="w-full sm:w-72" />
        <div className="flex gap-1 overflow-x-auto">
          {categorias.map(c => (
            <button key={c} onClick={() => setCatFilter(c)} className={`px-3 py-1.5 text-xs rounded-full whitespace-nowrap ${catFilter === c ? 'bg-[#E8672C] text-white' : 'bg-white border border-[#E2E6EF] text-[#6B7A99] hover:bg-gray-50'}`}>{c}</button>
          ))}
        </div>
      </div>

      {view === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(a => (
            <div key={a.id} onClick={() => openEdit(a)} className="bg-white rounded-xl border border-[#E2E6EF] p-5 hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-[#1B2A4A]/10 text-[#1B2A4A] flex items-center justify-center">{catIcons[a.categoria] || <Monitor className="w-5 h-5" />}</div>
                <Badge variant={estadoVariant(a.estado)}>{a.estado}</Badge>
              </div>
              <p className="font-semibold text-[#1B2A4A]">{a.codigoPatrimonial}</p>
              <p className="text-sm text-[#6B7A99]">{a.marca} {a.modelo}</p>
              <p className="text-xs text-[#6B7A99] mt-1">Serie: {a.serie}</p>
              <div className="mt-3 pt-3 border-t border-[#E2E6EF] text-xs text-[#6B7A99] space-y-1">
                <p>Ubicación: {a.ubicacion}</p>
                <p>Responsable: {a.responsable}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-[#E2E6EF] overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-gray-50 border-b border-[#E2E6EF]">
              {['Código','Serie','Marca','Modelo','Categoría','Ubicación','Responsable','Estado','Fecha Asig.'].map(h => (
                <th key={h} className="px-3 py-3 text-left uppercase text-xs tracking-wider font-semibold text-[#6B7A99] whitespace-nowrap">{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {filtered.map((a, i) => (
                <tr key={a.id} onClick={() => openEdit(a)} className={`${i%2 ? 'bg-gray-50/50' : ''} border-b border-[#E2E6EF] hover:bg-[#E8672C]/5 cursor-pointer`}>
                  <td className="px-3 py-2.5 font-medium">{a.codigoPatrimonial}</td>
                  <td className="px-3 py-2.5">{a.serie}</td>
                  <td className="px-3 py-2.5">{a.marca}</td>
                  <td className="px-3 py-2.5">{a.modelo}</td>
                  <td className="px-3 py-2.5">{a.categoria}</td>
                  <td className="px-3 py-2.5">{a.ubicacion}</td>
                  <td className="px-3 py-2.5">{a.responsable}</td>
                  <td className="px-3 py-2.5"><Badge variant={estadoVariant(a.estado)}>{a.estado}</Badge></td>
                  <td className="px-3 py-2.5">{a.fechaAsignacion}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={selected ? 'Editar Activo' : 'Nuevo Activo'} size="lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[{ l: 'Código Patrimonial', k: 'codigoPatrimonial' }, { l: 'Serie', k: 'serie' }, { l: 'Marca', k: 'marca' }, { l: 'Modelo', k: 'modelo' }, { l: 'Ubicación', k: 'ubicacion' }, { l: 'Responsable', k: 'responsable' }].map(({ l, k }) => (
            <div key={k}><label className="block text-xs font-medium text-[#6B7A99] uppercase tracking-wider mb-1">{l}</label>
            <input value={form[k] || ''} onChange={e => setForm({ ...form, [k]: e.target.value })} className="w-full border border-[#E2E6EF] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E8672C]/30" /></div>
          ))}
          <div><label className="block text-xs font-medium text-[#6B7A99] uppercase tracking-wider mb-1">Categoría</label>
            <select value={form.categoria} onChange={e => setForm({ ...form, categoria: e.target.value })} className="w-full border border-[#E2E6EF] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E8672C]/30">
              {categorias.filter(c => c !== 'Todos').map(c => <option key={c}>{c}</option>)}</select></div>
          <div><label className="block text-xs font-medium text-[#6B7A99] uppercase tracking-wider mb-1">Estado</label>
            <select value={form.estado} onChange={e => setForm({ ...form, estado: e.target.value })} className="w-full border border-[#E2E6EF] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E8672C]/30">
              <option>Operativo</option><option>En Mantenimiento</option><option>Dado de Baja</option></select></div>
        </div>
        {selected && selected.historialTransferencias.length > 0 && (
          <div className="mt-6">
            <h4 className="text-sm font-semibold text-[#1B2A4A] mb-2">Historial de Transferencias</h4>
            <div className="space-y-2">{selected.historialTransferencias.map((t, i) => (
              <div key={i} className="text-xs bg-gray-50 rounded-lg p-3 text-[#6B7A99]">
                <span className="font-medium text-[#1B2A4A]">{t.fecha}</span> — De: {t.de} → A: {t.a} ({t.motivo})
              </div>
            ))}</div>
          </div>
        )}
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancelar</Button>
          <Button onClick={handleSave}>{selected ? 'Guardar' : 'Crear Activo'}</Button>
        </div>
      </Modal>
    </motion.div>
  );
}
