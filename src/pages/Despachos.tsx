import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Pencil, Settings, Trash2 } from 'lucide-react';
import { useApp, type CatalogItem } from '../context/AppContext';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';

type CatalogModalType = 'labor' | 'supervisor' | 'bodega' | null;
type CatalogManagerType = 'labor' | 'supervisor' | 'bodega' | null;

export default function Despachos() {
  const {
    state,
    addDespacho,
    saveLaboresActividad,
    saveSupervisores,
    saveBodegas,
  } = useApp();

  const [success, setSuccess] = useState(false);
  const [materialSearch, setMaterialSearch] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [laborFilter, setLaborFilter] = useState('');
  const [catalogModal, setCatalogModal] = useState<CatalogModalType>(null);
  const [catalogName, setCatalogName] = useState('');
  const [catalogManager, setCatalogManager] = useState<CatalogManagerType>(null);
  const [editingCatalogId, setEditingCatalogId] = useState<string | null>(null);
  const [editingCatalogName, setEditingCatalogName] = useState('');
  const [form, setForm] = useState({
    materialId: '',
    cantidad: 0,
    labor: '',
    supervisor: '',
    bodegaOrigen: '',
    fecha: new Date().toISOString().split('T')[0],
    observaciones: '',
  });

  const suggestions = useMemo(() => {
    const term = materialSearch.trim().toLowerCase();
    if (!term) {
      return state.materiales.slice(0, 8);
    }
    return state.materiales
      .filter(
        (material) =>
          material.codigo.toLowerCase().includes(term) ||
          material.descripcion.toLowerCase().includes(term)
      )
      .slice(0, 8);
  }, [materialSearch, state.materiales]);

  const selectedMaterial = state.materiales.find(
    (material) => material.id === Number(form.materialId)
  );

  const filteredDespachos = useMemo(() => {
    return state.despachos.filter((despacho) => !laborFilter || despacho.labor === laborFilter);
  }, [state.despachos, laborFilter]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMaterial || !form.cantidad) {
      return;
    }

    await addDespacho({
      materialId: selectedMaterial.id,
      materialCodigo: selectedMaterial.codigo,
      materialDescripcion: selectedMaterial.descripcion,
      cantidad: form.cantidad,
      labor: form.labor,
      supervisor: form.supervisor,
      fecha: form.fecha,
      observaciones: `Bodega: ${form.bodegaOrigen}${form.observaciones ? ` | ${form.observaciones}` : ''}`,
    });

    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
    setForm({
      ...form,
      materialId: '',
      cantidad: 0,
      labor: '',
      supervisor: '',
      bodegaOrigen: '',
      observaciones: '',
    });
    setMaterialSearch('');
  };

  const createCatalogItem = async () => {
    const nombre = catalogName.trim();
    if (!nombre || !catalogModal) {
      return;
    }

    const item: CatalogItem = {
      id: `${catalogModal}-${Date.now()}`,
      nombre,
    };

    if (catalogModal === 'labor') {
      await saveLaboresActividad([...state.laboresActividad, item]);
      setForm((current) => ({ ...current, labor: nombre }));
    }

    if (catalogModal === 'supervisor') {
      await saveSupervisores([...state.supervisores, item]);
      setForm((current) => ({ ...current, supervisor: nombre }));
    }

    if (catalogModal === 'bodega') {
      await saveBodegas([...state.bodegas, item]);
      setForm((current) => ({ ...current, bodegaOrigen: nombre }));
    }

    setCatalogModal(null);
    setCatalogName('');
  };

  const openCatalogManager = (type: CatalogManagerType) => {
    setCatalogManager(type);
    setEditingCatalogId(null);
    setEditingCatalogName('');
  };

  const getCatalogItems = () => {
    if (catalogManager === 'labor') {
      return state.laboresActividad;
    }
    if (catalogManager === 'supervisor') {
      return state.supervisores;
    }
    if (catalogManager === 'bodega') {
      return state.bodegas;
    }
    return [];
  };

  const startCatalogEdit = (item: CatalogItem) => {
    setEditingCatalogId(item.id);
    setEditingCatalogName(item.nombre);
  };

  const saveCatalogEdit = async () => {
    const nombre = editingCatalogName.trim();
    if (!catalogManager || !editingCatalogId || !nombre) {
      return;
    }

    if (catalogManager === 'labor') {
      const previous = state.laboresActividad.find((item) => item.id === editingCatalogId)?.nombre;
      await saveLaboresActividad(
        state.laboresActividad.map((item) =>
          item.id === editingCatalogId ? { ...item, nombre } : item
        )
      );
      if (form.labor === previous) {
        setForm((current) => ({ ...current, labor: nombre }));
      }
    }

    if (catalogManager === 'supervisor') {
      const previous = state.supervisores.find((item) => item.id === editingCatalogId)?.nombre;
      await saveSupervisores(
        state.supervisores.map((item) =>
          item.id === editingCatalogId ? { ...item, nombre } : item
        )
      );
      if (form.supervisor === previous) {
        setForm((current) => ({ ...current, supervisor: nombre }));
      }
    }

    if (catalogManager === 'bodega') {
      const previous = state.bodegas.find((item) => item.id === editingCatalogId)?.nombre;
      await saveBodegas(
        state.bodegas.map((item) =>
          item.id === editingCatalogId ? { ...item, nombre } : item
        )
      );
      if (form.bodegaOrigen === previous) {
        setForm((current) => ({ ...current, bodegaOrigen: nombre }));
      }
    }

    setEditingCatalogId(null);
    setEditingCatalogName('');
  };

  const deleteCatalogItem = async (item: CatalogItem) => {
    if (catalogManager === 'labor') {
      await saveLaboresActividad(state.laboresActividad.filter((current) => current.id !== item.id));
      if (form.labor === item.nombre) {
        setForm((current) => ({ ...current, labor: '' }));
      }
    }

    if (catalogManager === 'supervisor') {
      await saveSupervisores(state.supervisores.filter((current) => current.id !== item.id));
      if (form.supervisor === item.nombre) {
        setForm((current) => ({ ...current, supervisor: '' }));
      }
    }

    if (catalogManager === 'bodega') {
      await saveBodegas(state.bodegas.filter((current) => current.id !== item.id));
      if (form.bodegaOrigen === item.nombre) {
        setForm((current) => ({ ...current, bodegaOrigen: '' }));
      }
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      {success && (
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          className="fixed top-20 right-6 bg-green-600 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50"
        >
          <CheckCircle className="w-5 h-5" /> Despacho registrado exitosamente
        </motion.div>
      )}

      <div className="bg-white rounded-xl border border-[#E2E6EF] p-6">
        <h3 className="font-display font-semibold text-[#1B2A4A] mb-4">Registrar Despacho Interno</h3>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative">
            <label className="block text-xs font-medium text-[#6B7A99] uppercase tracking-wider mb-1">Código Material</label>
            <input
              value={materialSearch}
              onChange={(e) => {
                setMaterialSearch(e.target.value);
                setForm({ ...form, materialId: '' });
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              className="w-full border border-[#E2E6EF] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E8672C]/30"
              placeholder="Buscar por código o descripción..."
            />
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute z-10 top-full mt-1 w-full bg-white border border-[#E2E6EF] rounded-lg shadow-lg max-h-48 overflow-y-auto">
                {suggestions.map((material) => (
                  <button
                    key={material.id}
                    type="button"
                    onClick={() => {
                      setForm({ ...form, materialId: String(material.id) });
                      setMaterialSearch(material.codigo);
                      setShowSuggestions(false);
                    }}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-[#E8672C]/5"
                  >
                    <span className="font-medium">{material.codigo}</span> —{' '}
                    <span className="text-[#6B7A99]">{material.descripcion}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <div>
            <label className="block text-xs font-medium text-[#6B7A99] uppercase tracking-wider mb-1">Descripción</label>
            <input
              readOnly
              value={selectedMaterial?.descripcion || ''}
              className="w-full border border-[#E2E6EF] rounded-lg px-3 py-2 text-sm bg-gray-50 text-[#6B7A99]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#6B7A99] uppercase tracking-wider mb-1">Cantidad Entregada</label>
            <input
              type="number"
              min={1}
              value={form.cantidad || ''}
              onChange={(e) => setForm({ ...form, cantidad: Number(e.target.value) })}
              className="w-full border border-[#E2E6EF] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E8672C]/30"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#6B7A99] uppercase tracking-wider mb-1">Fecha</label>
            <input
              type="date"
              value={form.fecha}
              onChange={(e) => setForm({ ...form, fecha: e.target.value })}
              className="w-full border border-[#E2E6EF] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E8672C]/30"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#6B7A99] uppercase tracking-wider mb-1">Labor / Actividad</label>
            <div className="flex gap-2">
              <select
                value={form.labor}
                onChange={(e) => setForm({ ...form, labor: e.target.value })}
                className="w-full border border-[#E2E6EF] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E8672C]/30"
              >
                <option value="">Seleccionar...</option>
                {state.laboresActividad.map((labor) => (
                  <option key={labor.id} value={labor.nombre}>
                    {labor.nombre}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setCatalogModal('labor')}
                className="shrink-0 w-10 rounded-lg border border-[#E2E6EF] text-[#E8672C] hover:bg-[#E8672C]/5"
              >
                +
              </button>
              <button
                type="button"
                onClick={() => openCatalogManager('labor')}
                className="shrink-0 w-10 rounded-lg border border-[#E2E6EF] text-[#1B2A4A] hover:bg-gray-50"
              >
                <Settings className="w-4 h-4 mx-auto" />
              </button>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-[#6B7A99] uppercase tracking-wider mb-1">Supervisor</label>
            <div className="flex gap-2">
              <select
                value={form.supervisor}
                onChange={(e) => setForm({ ...form, supervisor: e.target.value })}
                className="w-full border border-[#E2E6EF] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E8672C]/30"
              >
                <option value="">Seleccionar...</option>
                {state.supervisores.map((supervisor) => (
                  <option key={supervisor.id} value={supervisor.nombre}>
                    {supervisor.nombre}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setCatalogModal('supervisor')}
                className="shrink-0 w-10 rounded-lg border border-[#E2E6EF] text-[#E8672C] hover:bg-[#E8672C]/5"
              >
                +
              </button>
              <button
                type="button"
                onClick={() => openCatalogManager('supervisor')}
                className="shrink-0 w-10 rounded-lg border border-[#E2E6EF] text-[#1B2A4A] hover:bg-gray-50"
              >
                <Settings className="w-4 h-4 mx-auto" />
              </button>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-[#6B7A99] uppercase tracking-wider mb-1">Bodega de Origen</label>
            <div className="flex gap-2">
              <select
                value={form.bodegaOrigen}
                onChange={(e) => setForm({ ...form, bodegaOrigen: e.target.value })}
                className="w-full border border-[#E2E6EF] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E8672C]/30"
              >
                <option value="">Seleccionar...</option>
                {state.bodegas.map((bodega) => (
                  <option key={bodega.id} value={bodega.nombre}>
                    {bodega.nombre}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setCatalogModal('bodega')}
                className="shrink-0 w-10 rounded-lg border border-[#E2E6EF] text-[#E8672C] hover:bg-[#E8672C]/5"
              >
                +
              </button>
              <button
                type="button"
                onClick={() => openCatalogManager('bodega')}
                className="shrink-0 w-10 rounded-lg border border-[#E2E6EF] text-[#1B2A4A] hover:bg-gray-50"
              >
                <Settings className="w-4 h-4 mx-auto" />
              </button>
            </div>
          </div>
          <div className="md:col-span-2 lg:col-span-4">
            <label className="block text-xs font-medium text-[#6B7A99] uppercase tracking-wider mb-1">Observaciones</label>
            <input
              value={form.observaciones}
              onChange={(e) => setForm({ ...form, observaciones: e.target.value })}
              className="w-full border border-[#E2E6EF] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E8672C]/30"
            />
          </div>
          <div className="md:col-span-2 lg:col-span-4 flex justify-end">
            <Button type="submit">Registrar Despacho</Button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-xl border border-[#E2E6EF]">
        <div className="px-6 py-4 border-b border-[#E2E6EF] flex items-center justify-between">
          <h3 className="font-display font-semibold text-[#1B2A4A]">Historial de Despachos</h3>
          <select
            value={laborFilter}
            onChange={(e) => setLaborFilter(e.target.value)}
            className="text-sm border border-[#E2E6EF] rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-[#E8672C]/30"
          >
            <option value="">Todas las labores</option>
            {state.laboresActividad.map((labor) => (
              <option key={labor.id} value={labor.nombre}>
                {labor.nombre}
              </option>
            ))}
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-[#E2E6EF]">
                {['Fecha', 'Código', 'Descripción', 'Cantidad', 'Labor', 'Supervisor', 'Observaciones'].map((header) => (
                  <th
                    key={header}
                    className="px-3 py-3 text-left uppercase text-xs tracking-wider font-semibold text-[#6B7A99] whitespace-nowrap"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredDespachos.map((despacho, index) => (
                <tr
                  key={despacho.id}
                  className={`${index % 2 ? 'bg-gray-50/50' : ''} border-b border-[#E2E6EF]`}
                >
                  <td className="px-3 py-2.5">{despacho.fecha}</td>
                  <td className="px-3 py-2.5 font-medium">{despacho.materialCodigo}</td>
                  <td className="px-3 py-2.5">{despacho.materialDescripcion}</td>
                  <td className="px-3 py-2.5 text-center font-semibold">{despacho.cantidad}</td>
                  <td className="px-3 py-2.5">{despacho.labor}</td>
                  <td className="px-3 py-2.5">{despacho.supervisor}</td>
                  <td className="px-3 py-2.5 text-[#6B7A99]">{despacho.observaciones}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={catalogModal !== null}
        onClose={() => setCatalogModal(null)}
        title={
          catalogModal === 'labor'
            ? 'Nueva labor'
            : catalogModal === 'supervisor'
              ? 'Nuevo supervisor'
              : 'Nueva bodega'
        }
        size="sm"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#6B7A99] uppercase tracking-wider mb-1">Nombre</label>
            <input
              value={catalogName}
              onChange={(e) => setCatalogName(e.target.value)}
              className="w-full border border-[#E2E6EF] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E8672C]/30"
            />
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setCatalogModal(null)}>
              Cancelar
            </Button>
            <Button onClick={createCatalogItem}>Guardar</Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={catalogManager !== null}
        onClose={() => {
          setCatalogManager(null);
          setEditingCatalogId(null);
          setEditingCatalogName('');
        }}
        title={
          catalogManager === 'labor'
            ? 'Gestionar labores'
            : catalogManager === 'supervisor'
              ? 'Gestionar supervisores'
              : 'Gestionar bodegas'
        }
        size="md"
      >
        <div className="space-y-3">
          {getCatalogItems().map((item) => (
            <div key={item.id} className="flex items-center gap-3 border border-[#E2E6EF] rounded-lg px-3 py-2">
              {editingCatalogId === item.id ? (
                <input
                  value={editingCatalogName}
                  onChange={(e) => setEditingCatalogName(e.target.value)}
                  className="flex-1 border border-[#E2E6EF] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E8672C]/30"
                />
              ) : (
                <span className="flex-1 text-sm text-[#1B2A4A]">{item.nombre}</span>
              )}
              {editingCatalogId === item.id ? (
                <div className="flex gap-2">
                  <Button size="sm" onClick={saveCatalogEdit}>Guardar</Button>
                  <Button size="sm" variant="secondary" onClick={() => { setEditingCatalogId(null); setEditingCatalogName(''); }}>
                    Cancelar
                  </Button>
                </div>
              ) : (
                <div className="flex gap-1">
                  <button type="button" onClick={() => startCatalogEdit(item)} className="p-2 rounded-lg text-[#1B2A4A] hover:bg-gray-100">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button type="button" onClick={() => deleteCatalogItem(item)} className="p-2 rounded-lg text-red-600 hover:bg-red-50">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </Modal>
    </motion.div>
  );
}