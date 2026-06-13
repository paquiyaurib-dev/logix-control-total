import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Plus, Pencil } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Material } from '../data/mockData';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import SearchBar from '../components/ui/SearchBar';
import Modal from '../components/ui/Modal';

const categorias = ['Todas', 'Ferretería', 'Eléctrico', 'Lubricantes', 'Seguridad', 'Herramientas', 'Filtros'] as const;
const estados = ['Todos', 'Activo', 'Inactivo'] as const;

const fmtPEN = (v: number) => `S/ ${v.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const emptyMaterial: Omit<Material, 'id'> = {
  codigo: '', descripcion: '', categoria: 'Ferretería', familia: '', unidad: 'UND',
  marca: '', stockMin: 0, stockMax: 0, stockActual: 0, ubicacion: '', estado: 'Activo', ultimoMovimiento: '', precioUnitario: 0,
};

export default function Materiales() {
  const { state, addMaterial, updateMaterial } = useApp();
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('Todas');
  const [estFilter, setEstFilter] = useState('Todos');
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Material | null>(null);
  const [form, setForm] = useState<any>({ ...emptyMaterial });

  const filtered = useMemo(() => {
    return state.materiales.filter((m) => {
      const matchSearch = !search || m.codigo.toLowerCase().includes(search.toLowerCase()) || m.descripcion.toLowerCase().includes(search.toLowerCase());
      const matchCat = catFilter === 'Todas' || m.categoria === catFilter;
      const matchEst = estFilter === 'Todos' || m.estado === estFilter;
      return matchSearch && matchCat && matchEst;
    });
  }, [state.materiales, search, catFilter, estFilter]);

  const perPage = 10;
  const totalPages = Math.ceil(filtered.length / perPage);
  const pageData = filtered.slice((page - 1) * perPage, page * perPage);

  const totalValorStock = useMemo(() => filtered.reduce((sum, m) => sum + m.stockActual * m.precioUnitario, 0), [filtered]);

  const openNew = () => { setEditing(null); setForm({ ...emptyMaterial }); setModalOpen(true); };
  const openEdit = (m: Material) => { setEditing(m); setForm({ ...m }); setModalOpen(true); };
  const handleSave = () => {
    if (editing) { updateMaterial({ ...form, id: editing.id }); }
    else { addMaterial(form); }
    setModalOpen(false);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h2 className="text-lg font-display font-semibold text-[#1B2A4A]">Maestro de Materiales</h2>
        <Button onClick={openNew} icon={<Plus className="w-4 h-4" />}>Nuevo Material</Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <SearchBar value={search} onChange={setSearch} placeholder="Buscar por código o descripción..." className="w-full sm:w-72" />
        <select value={catFilter} onChange={(e) => { setCatFilter(e.target.value); setPage(1); }} className="text-sm border border-[#E2E6EF] rounded-lg px-3 py-2 bg-white text-[#1B2A4A] focus:outline-none focus:ring-2 focus:ring-[#E8672C]/30">
          {categorias.map((c) => <option key={c}>{c}</option>)}
        </select>
        <select value={estFilter} onChange={(e) => { setEstFilter(e.target.value); setPage(1); }} className="text-sm border border-[#E2E6EF] rounded-lg px-3 py-2 bg-white text-[#1B2A4A] focus:outline-none focus:ring-2 focus:ring-[#E8672C]/30">
          {estados.map((e) => <option key={e}>{e}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-[#E2E6EF] bg-white">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="bg-gray-50 border-b border-[#E2E6EF]">
              {['Código','Descripción','Categoría','Unidad','Marca','Stock Mín','Stock Máx','Stock Actual','P. Unit. (S/)','Valor Stock','Ubicación','Estado','Acciones'].map((h) => (
                <th key={h} className="px-2.5 py-2.5 text-left uppercase text-[10px] tracking-wider font-semibold text-[#6B7A99] whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageData.map((m, i) => (
              <tr key={m.id} className={`${i % 2 ? 'bg-gray-50/50' : 'bg-white'} border-b border-[#E2E6EF] hover:bg-[#E8672C]/5`}>
                <td className="px-2.5 py-2 font-medium text-[#1B2A4A]">{m.codigo}</td>
                <td className="px-2.5 py-2 text-[#1B2A4A] max-w-[180px] truncate">{m.descripcion}</td>
                <td className="px-2.5 py-2 text-[#6B7A99]">{m.categoria}</td>
                <td className="px-2.5 py-2 text-[#6B7A99]">{m.unidad}</td>
                <td className="px-2.5 py-2 text-[#6B7A99]">{m.marca}</td>
                <td className="px-2.5 py-2 text-center">{m.stockMin}</td>
                <td className="px-2.5 py-2 text-center">{m.stockMax}</td>
                <td className={`px-2.5 py-2 text-center font-semibold ${m.stockActual < m.stockMin ? 'text-red-600' : 'text-[#1B2A4A]'}`}>{m.stockActual}</td>
                <td className="px-2.5 py-2 text-right text-[#1B2A4A]">{fmtPEN(m.precioUnitario)}</td>
                <td className="px-2.5 py-2 text-right font-semibold text-[#1B2A4A]">{fmtPEN(m.stockActual * m.precioUnitario)}</td>
                <td className="px-2.5 py-2 text-[#6B7A99]">{m.ubicacion}</td>
                <td className="px-2.5 py-2"><Badge variant={m.estado === 'Activo' ? 'success' : 'neutral'}>{m.estado}</Badge></td>
                <td className="px-2.5 py-2">
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(m)} className="p-1.5 rounded hover:bg-gray-100 text-[#6B7A99]"><Pencil className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
          {/* Totals row */}
          <tfoot>
            <tr className="bg-[#1B2A4A]/5 border-t-2 border-[#1B2A4A]/20">
              <td colSpan={9} className="px-2.5 py-2.5 text-right uppercase text-[10px] tracking-wider font-bold text-[#1B2A4A]">Total Valorizado ({filtered.length} materiales)</td>
              <td className="px-2.5 py-2.5 text-right font-bold text-base text-[#E8672C]">{fmtPEN(totalValorStock)}</td>
              <td colSpan={3}></td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-[#6B7A99]">
          <span>Mostrando {(page-1)*perPage+1}–{Math.min(page*perPage, filtered.length)} de {filtered.length}</span>
          <div className="flex gap-1">
            {Array.from({ length: totalPages }, (_, i) => (
              <button key={i} onClick={() => setPage(i+1)} className={`w-8 h-8 rounded-lg text-sm ${page === i+1 ? 'bg-[#E8672C] text-white' : 'hover:bg-gray-100'}`}>{i+1}</button>
            ))}
          </div>
        </div>
      )}

      {/* Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Editar Material' : 'Nuevo Material'} size="lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { label: 'Código', key: 'codigo' },
            { label: 'Descripción', key: 'descripcion' },
            { label: 'Familia', key: 'familia' },
            { label: 'Marca', key: 'marca' },
            { label: 'Ubicación', key: 'ubicacion' },
          ].map(({ label, key }) => (
            <div key={key}>
              <label className="block text-xs font-medium text-[#6B7A99] uppercase tracking-wider mb-1">{label}</label>
              <input value={form[key] || ''} onChange={(e) => setForm({ ...form, [key]: e.target.value })} className="w-full border border-[#E2E6EF] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E8672C]/30" />
            </div>
          ))}
          <div>
            <label className="block text-xs font-medium text-[#6B7A99] uppercase tracking-wider mb-1">Categoría</label>
            <select value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value })} className="w-full border border-[#E2E6EF] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E8672C]/30">
              {categorias.filter(c => c !== 'Todas').map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-[#6B7A99] uppercase tracking-wider mb-1">Unidad</label>
            <select value={form.unidad} onChange={(e) => setForm({ ...form, unidad: e.target.value })} className="w-full border border-[#E2E6EF] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E8672C]/30">
              {['UND','MT','LT','GL','KG','PAR','ROL'].map((u) => <option key={u}>{u}</option>)}
            </select>
          </div>
          {['stockMin','stockMax','stockActual'].map((key) => (
            <div key={key}>
              <label className="block text-xs font-medium text-[#6B7A99] uppercase tracking-wider mb-1">{key === 'stockMin' ? 'Stock Mínimo' : key === 'stockMax' ? 'Stock Máximo' : 'Stock Actual'}</label>
              <input type="number" value={form[key] || 0} onChange={(e) => setForm({ ...form, [key]: Number(e.target.value) })} className="w-full border border-[#E2E6EF] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E8672C]/30" />
            </div>
          ))}
          <div>
            <label className="block text-xs font-medium text-[#6B7A99] uppercase tracking-wider mb-1">Precio Unitario (S/)</label>
            <input type="number" step="0.01" min="0" value={form.precioUnitario || 0} onChange={(e) => setForm({ ...form, precioUnitario: Number(e.target.value) })} className="w-full border border-[#E2E6EF] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E8672C]/30" />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#6B7A99] uppercase tracking-wider mb-1">Estado</label>
            <select value={form.estado} onChange={(e) => setForm({ ...form, estado: e.target.value })} className="w-full border border-[#E2E6EF] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E8672C]/30">
              <option>Activo</option><option>Inactivo</option>
            </select>
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancelar</Button>
          <Button onClick={handleSave}>{editing ? 'Guardar Cambios' : 'Crear Material'}</Button>
        </div>
      </Modal>
    </motion.div>
  );
}
