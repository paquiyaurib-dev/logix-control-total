import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Pencil, Plus, Settings, Trash2 } from 'lucide-react';
import { useApp, type CatalogItem } from '../context/AppContext';
import { Material } from '../data/mockData';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import SearchBar from '../components/ui/SearchBar';
import Modal from '../components/ui/Modal';

const estados = ['Todos', 'Activo', 'Inactivo'] as const;

const fmtPEN = (value: number) =>
  `S/ ${value.toLocaleString('es-PE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

type MaterialForm = {
  codigo: string;
  descripcion: string;
  categoria: string;
  familia: string;
  unidad: string;
  marca: string;
  stockMin: number;
  stockMax: number;
  stockActual: number;
  ubicacion: string;
  estado: Material['estado'];
  ultimoMovimiento: string;
  precioUnitario: number;
};

const emptyMaterial: MaterialForm = {
  codigo: '',
  descripcion: '',
  categoria: '',
  familia: '',
  unidad: '',
  marca: '',
  stockMin: 0,
  stockMax: 0,
  stockActual: 0,
  ubicacion: '',
  estado: 'Activo',
  ultimoMovimiento: '',
  precioUnitario: 0,
};

type CatalogModalType = 'categoria' | 'unidad' | null;
type CatalogManagerType = 'categoria' | 'unidad' | null;

export default function Materiales() {
  const {
    state,
    addMaterial,
    updateMaterial,
    saveCategorias,
    saveUnidades,
  } = useApp();

  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('Todas');
  const [estFilter, setEstFilter] = useState('Todos');
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Material | null>(null);
  const [form, setForm] = useState<MaterialForm>({
    ...emptyMaterial,
    categoria: state.categorias[0]?.nombre ?? '',
    unidad: state.unidades[0]?.nombre ?? '',
  });
  const [catalogModal, setCatalogModal] = useState<CatalogModalType>(null);
  const [catalogName, setCatalogName] = useState('');
  const [catalogManager, setCatalogManager] = useState<CatalogManagerType>(null);
  const [editingCatalogId, setEditingCatalogId] = useState<string | null>(null);
  const [editingCatalogName, setEditingCatalogName] = useState('');

  const categorias = useMemo(
    () => ['Todas', ...state.categorias.map((item) => item.nombre)],
    [state.categorias]
  );

  const filtered = useMemo(() => {
    return state.materiales.filter((material) => {
      const matchSearch =
        !search ||
        material.codigo.toLowerCase().includes(search.toLowerCase()) ||
        material.descripcion.toLowerCase().includes(search.toLowerCase());
      const matchCat = catFilter === 'Todas' || material.categoria === catFilter;
      const matchEst = estFilter === 'Todos' || material.estado === estFilter;
      return matchSearch && matchCat && matchEst;
    });
  }, [state.materiales, search, catFilter, estFilter]);

  const perPage = 10;
  const totalPages = Math.ceil(filtered.length / perPage);
  const pageData = filtered.slice((page - 1) * perPage, page * perPage);

  const totalValorStock = useMemo(
    () =>
      filtered.reduce(
        (sum, material) => sum + material.stockActual * material.precioUnitario,
        0
      ),
    [filtered]
  );

  const openNew = () => {
    setEditing(null);
    setForm({
      ...emptyMaterial,
      categoria: state.categorias[0]?.nombre ?? '',
      unidad: state.unidades[0]?.nombre ?? '',
    });
    setModalOpen(true);
  };

  const openEdit = (material: Material) => {
    setEditing(material);
    setForm({ ...material });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.categoria || !form.unidad) {
      return;
    }
    if (editing) {
      await updateMaterial({
        ...(editing as any),
        ...form,
        id: editing.id,
        categoria: form.categoria as Material['categoria'],
        unidad: form.unidad as Material['unidad'],
      });
    } else {
      await addMaterial({
        ...form,
        categoria: form.categoria as Material['categoria'],
        unidad: form.unidad as Material['unidad'],
      } as any);
    }
    setModalOpen(false);
  };

  const openCatalogModal = (type: CatalogModalType) => {
    setCatalogModal(type);
    setCatalogName('');
  };

  const createCatalogItem = async () => {
    const nombre = catalogName.trim();
    if (!nombre || !catalogModal) {
      return;
    }

    const newItem: CatalogItem = {
      id: `${catalogModal}-${Date.now()}`,
      nombre,
    };

    if (catalogModal === 'categoria') {
      await saveCategorias([...state.categorias, newItem]);
      setForm((current) => ({ ...current, categoria: nombre }));
    }

    if (catalogModal === 'unidad') {
      await saveUnidades([...state.unidades, newItem]);
      setForm((current) => ({ ...current, unidad: nombre }));
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
    if (catalogManager === 'categoria') {
      return state.categorias;
    }
    if (catalogManager === 'unidad') {
      return state.unidades;
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

    if (catalogManager === 'categoria') {
      await saveCategorias(
        state.categorias.map((item) =>
          item.id === editingCatalogId ? { ...item, nombre } : item
        )
      );
      if (form.categoria === getCatalogItems().find((item) => item.id === editingCatalogId)?.nombre) {
        setForm((current) => ({ ...current, categoria: nombre }));
      }
    }

    if (catalogManager === 'unidad') {
      await saveUnidades(
        state.unidades.map((item) =>
          item.id === editingCatalogId ? { ...item, nombre } : item
        )
      );
      if (form.unidad === getCatalogItems().find((item) => item.id === editingCatalogId)?.nombre) {
        setForm((current) => ({ ...current, unidad: nombre }));
      }
    }

    setEditingCatalogId(null);
    setEditingCatalogName('');
  };

  const deleteCatalogItem = async (item: CatalogItem) => {
    if (catalogManager === 'categoria') {
      await saveCategorias(state.categorias.filter((current) => current.id !== item.id));
      if (form.categoria === item.nombre) {
        setForm((current) => ({ ...current, categoria: '' }));
      }
    }

    if (catalogManager === 'unidad') {
      await saveUnidades(state.unidades.filter((current) => current.id !== item.id));
      if (form.unidad === item.nombre) {
        setForm((current) => ({ ...current, unidad: '' }));
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-3"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h2 className="text-lg font-display font-semibold text-[#1B2A4A]">
          Maestro de Materiales
        </h2>
        <Button onClick={openNew} icon={<Plus className="w-4 h-4" />}>
          Nuevo Material
        </Button>
      </div>

      <div className="flex flex-wrap gap-3">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Buscar por código o descripción..."
          className="w-full sm:w-72"
        />
        <select
          value={catFilter}
          onChange={(e) => {
            setCatFilter(e.target.value);
            setPage(1);
          }}
          className="text-sm border border-[#E2E6EF] rounded-lg px-3 py-2 bg-white text-[#1B2A4A] focus:outline-none focus:ring-2 focus:ring-[#E8672C]/30"
        >
          {categorias.map((categoria) => (
            <option key={categoria}>{categoria}</option>
          ))}
        </select>
        <select
          value={estFilter}
          onChange={(e) => {
            setEstFilter(e.target.value);
            setPage(1);
          }}
          className="text-sm border border-[#E2E6EF] rounded-lg px-3 py-2 bg-white text-[#1B2A4A] focus:outline-none focus:ring-2 focus:ring-[#E8672C]/30"
        >
          {estados.map((estado) => (
            <option key={estado}>{estado}</option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto rounded-xl border border-[#E2E6EF] bg-white">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="bg-gray-50 border-b border-[#E2E6EF]">
              {[
                'Código',
                'Descripción',
                'Categoría',
                'Unidad',
                'Marca',
                'Stock Mín',
                'Stock Máx',
                'Stock Actual',
                'P. Unit. (S/)',
                'Valor Stock',
                'Ubicación',
                'Estado',
                'Acciones',
              ].map((header) => (
                <th
                  key={header}
                  className="px-2.5 py-2.5 text-left uppercase text-[10px] tracking-wider font-semibold text-[#6B7A99] whitespace-nowrap"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageData.map((material, index) => (
              <tr
                key={material.id}
                className={`${index % 2 ? 'bg-gray-50/50' : 'bg-white'} border-b border-[#E2E6EF] hover:bg-[#E8672C]/5`}
              >
                <td className="px-2.5 py-2 font-medium text-[#1B2A4A]">
                  {material.codigo}
                </td>
                <td className="px-2.5 py-2 text-[#1B2A4A] max-w-[180px] truncate">
                  {material.descripcion}
                </td>
                <td className="px-2.5 py-2 text-[#6B7A99]">{material.categoria}</td>
                <td className="px-2.5 py-2 text-[#6B7A99]">{material.unidad}</td>
                <td className="px-2.5 py-2 text-[#6B7A99]">{material.marca}</td>
                <td className="px-2.5 py-2 text-center">{material.stockMin}</td>
                <td className="px-2.5 py-2 text-center">{material.stockMax}</td>
                <td
                  className={`px-2.5 py-2 text-center font-semibold ${material.stockActual < material.stockMin ? 'text-red-600' : 'text-[#1B2A4A]'}`}
                >
                  {material.stockActual}
                </td>
                <td className="px-2.5 py-2 text-right text-[#1B2A4A]">
                  {fmtPEN(material.precioUnitario)}
                </td>
                <td className="px-2.5 py-2 text-right font-semibold text-[#1B2A4A]">
                  {fmtPEN(material.stockActual * material.precioUnitario)}
                </td>
                <td className="px-2.5 py-2 text-[#6B7A99]">{material.ubicacion}</td>
                <td className="px-2.5 py-2">
                  <Badge variant={material.estado === 'Activo' ? 'success' : 'neutral'}>
                    {material.estado}
                  </Badge>
                </td>
                <td className="px-2.5 py-2">
                  <div className="flex gap-1">
                    <button
                      onClick={() => openEdit(material)}
                      className="p-1.5 rounded hover:bg-gray-100 text-[#6B7A99]"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-[#1B2A4A]/5 border-t-2 border-[#1B2A4A]/20">
              <td
                colSpan={9}
                className="px-2.5 py-2.5 text-right uppercase text-[10px] tracking-wider font-bold text-[#1B2A4A]"
              >
                Total Valorizado ({filtered.length} materiales)
              </td>
              <td className="px-2.5 py-2.5 text-right font-bold text-base text-[#E8672C]">
                {fmtPEN(totalValorStock)}
              </td>
              <td colSpan={3}></td>
            </tr>
          </tfoot>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-[#6B7A99]">
          <span>
            Mostrando {(page - 1) * perPage + 1}–{Math.min(page * perPage, filtered.length)} de{' '}
            {filtered.length}
          </span>
          <div className="flex gap-1">
            {Array.from({ length: totalPages }, (_, index) => (
              <button
                key={index}
                onClick={() => setPage(index + 1)}
                className={`w-8 h-8 rounded-lg text-sm ${page === index + 1 ? 'bg-[#E8672C] text-white' : 'hover:bg-gray-100'}`}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </div>
      )}

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Editar Material' : 'Nuevo Material'}
        size="lg"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { label: 'Código', key: 'codigo' },
            { label: 'Descripción', key: 'descripcion' },
            { label: 'Familia', key: 'familia' },
            { label: 'Marca', key: 'marca' },
            { label: 'Ubicación', key: 'ubicacion' },
          ].map(({ label, key }) => (
            <div key={key}>
              <label className="block text-xs font-medium text-[#6B7A99] uppercase tracking-wider mb-1">
                {label}
              </label>
              <input
                value={form[key as keyof MaterialForm] as string}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                className="w-full border border-[#E2E6EF] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E8672C]/30"
              />
            </div>
          ))}

          <div>
            <label className="block text-xs font-medium text-[#6B7A99] uppercase tracking-wider mb-1">
              Categoría
            </label>
            <div className="flex gap-2">
              <select
                value={form.categoria}
                onChange={(e) => setForm({ ...form, categoria: e.target.value })}
                className="w-full border border-[#E2E6EF] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E8672C]/30"
              >
                <option value="">Seleccionar...</option>
                {state.categorias.map((categoria) => (
                  <option key={categoria.id} value={categoria.nombre}>
                    {categoria.nombre}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => openCatalogModal('categoria')}
                className="shrink-0 w-10 rounded-lg border border-[#E2E6EF] text-[#E8672C] hover:bg-[#E8672C]/5"
              >
                +
              </button>
              <button
                type="button"
                onClick={() => openCatalogManager('categoria')}
                className="shrink-0 w-10 rounded-lg border border-[#E2E6EF] text-[#1B2A4A] hover:bg-gray-50"
              >
                <Settings className="w-4 h-4 mx-auto" />
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#6B7A99] uppercase tracking-wider mb-1">
              Unidad
            </label>
            <div className="flex gap-2">
              <select
                value={form.unidad}
                onChange={(e) => setForm({ ...form, unidad: e.target.value })}
                className="w-full border border-[#E2E6EF] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E8672C]/30"
              >
                <option value="">Seleccionar...</option>
                {state.unidades.map((unidad) => (
                  <option key={unidad.id} value={unidad.nombre}>
                    {unidad.nombre}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => openCatalogModal('unidad')}
                className="shrink-0 w-10 rounded-lg border border-[#E2E6EF] text-[#E8672C] hover:bg-[#E8672C]/5"
              >
                +
              </button>
              <button
                type="button"
                onClick={() => openCatalogManager('unidad')}
                className="shrink-0 w-10 rounded-lg border border-[#E2E6EF] text-[#1B2A4A] hover:bg-gray-50"
              >
                <Settings className="w-4 h-4 mx-auto" />
              </button>
            </div>
          </div>

          {[
            { key: 'stockMin', label: 'Stock Mínimo' },
            { key: 'stockMax', label: 'Stock Máximo' },
            { key: 'stockActual', label: 'Stock Actual' },
          ].map(({ key, label }) => (
            <div key={key}>
              <label className="block text-xs font-medium text-[#6B7A99] uppercase tracking-wider mb-1">
                {label}
              </label>
              <input
                type="number"
                value={form[key as keyof MaterialForm] as number}
                onChange={(e) => setForm({ ...form, [key]: Number(e.target.value) })}
                className="w-full border border-[#E2E6EF] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E8672C]/30"
              />
            </div>
          ))}

          <div>
            <label className="block text-xs font-medium text-[#6B7A99] uppercase tracking-wider mb-1">
              Precio Unitario (S/)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={form.precioUnitario}
              onChange={(e) => setForm({ ...form, precioUnitario: Number(e.target.value) })}
              className="w-full border border-[#E2E6EF] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E8672C]/30"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#6B7A99] uppercase tracking-wider mb-1">
              Estado
            </label>
            <select
              value={form.estado}
              onChange={(e) => setForm({ ...form, estado: e.target.value as Material['estado'] })}
              className="w-full border border-[#E2E6EF] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E8672C]/30"
            >
              <option value="Activo">Activo</option>
              <option value="Inactivo">Inactivo</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <Button variant="secondary" onClick={() => setModalOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>
            {editing ? 'Guardar Cambios' : 'Crear Material'}
          </Button>
        </div>
      </Modal>

      <Modal
        isOpen={catalogModal !== null}
        onClose={() => setCatalogModal(null)}
        title={catalogModal === 'categoria' ? 'Nueva categoría' : 'Nueva unidad'}
        size="sm"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#6B7A99] uppercase tracking-wider mb-1">
              Nombre
            </label>
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
        title={catalogManager === 'categoria' ? 'Gestionar categorías' : 'Gestionar unidades'}
        size="md"
      >
        <div className="space-y-3">
          {getCatalogItems().map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-3 border border-[#E2E6EF] rounded-lg px-3 py-2"
            >
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
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      setEditingCatalogId(null);
                      setEditingCatalogName('');
                    }}
                  >
                    Cancelar
                  </Button>
                </div>
              ) : (
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => startCatalogEdit(item)}
                    className="p-2 rounded-lg text-[#1B2A4A] hover:bg-gray-100"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteCatalogItem(item)}
                    className="p-2 rounded-lg text-red-600 hover:bg-red-50"
                  >
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