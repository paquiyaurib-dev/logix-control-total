import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, CheckCircle, Pencil, Settings, Trash2, UserPlus } from 'lucide-react';
import { useApp, type CatalogItem } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import type { Personal } from '../data/mockData';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';

type CatalogModalType = 'zona' | 'supervisor' | 'categoria' | 'equipo' | null;
type CatalogManagerType = 'zona' | 'supervisor' | 'categoria' | 'equipo' | null;

export default function Salidas() {
  const {
    state,
    addSalida,
    removeMovimiento,
    saveZonasDestino,
    saveSupervisores,
    saveCategorias,
    saveEquipos,
    addPersonal,
  } = useApp();
  const { state: authState } = useAuth();

  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [catalogModal, setCatalogModal] = useState<CatalogModalType>(null);
  const [catalogName, setCatalogName] = useState('');
  const [catalogManager, setCatalogManager] = useState<CatalogManagerType>(null);
  const [editingCatalogId, setEditingCatalogId] = useState<string | null>(null);
  const [editingCatalogName, setEditingCatalogName] = useState('');
  const [materialSearch, setMaterialSearch] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [dniSearch, setDniSearch] = useState('');
  const [foundPersonal, setFoundPersonal] = useState<Personal | null>(null);
  const [supervisorDni, setSupervisorDni] = useState('');
  const [foundSupervisor, setFoundSupervisor] = useState<Personal | null>(null);
  const [bodegueroDni, setBodegueroDni] = useState('');
  const [foundBodeguero, setFoundBodeguero] = useState<Personal | null>(null);
  const [showNewPersonalModal, setShowNewPersonalModal] = useState(false);
  const [newPersonalModalTarget, setNewPersonalModalTarget] = useState<'solicitante' | 'supervisor' | 'bodeguero'>('solicitante');
  const [newPersonalForm, setNewPersonalForm] = useState({ dni: '', nombres: '', apellidos: '', cargo: '', area: '' });
  const [form, setForm] = useState({
    fecha: new Date().toISOString().split('T')[0],
    materialId: '',
    cantidad: 0,
    vale: '',
    categoria: '',
    equipo: '',
    zona: '',
    bodeguero: authState.user?.nombre || '',
    supervisor: '',
    solicitante: '',
    observaciones: '',
  });

  const selectedMaterial = state.materiales.find(
    (material) => material.id === Number(form.materialId)
  );

  const materialSuggestions = useMemo(() => {
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

  const handleDniSearch = (dni: string) => {
    setDniSearch(dni);
    if (dni.length === 8) {
      const found = state.personal.find((p) => p.dni === dni);
      if (found) {
        setFoundPersonal(found);
        setForm((f) => ({ ...f, solicitante: `${found.dni} - ${found.nombres} ${found.apellidos} (${found.cargo})` }));
      } else {
        setFoundPersonal(null);
        setForm((f) => ({ ...f, solicitante: '' }));
      }
    } else {
      setFoundPersonal(null);
      setForm((f) => ({ ...f, solicitante: '' }));
    }
  };

  const handleSupervisorDni = (dni: string) => {
    setSupervisorDni(dni);
    if (dni.length === 8) {
      const found = state.personal.find((p) => p.dni === dni);
      if (found) {
        setFoundSupervisor(found);
        setForm((f) => ({ ...f, supervisor: `${found.nombres} ${found.apellidos}` }));
      } else {
        setFoundSupervisor(null);
        setForm((f) => ({ ...f, supervisor: '' }));
      }
    } else {
      setFoundSupervisor(null);
      setForm((f) => ({ ...f, supervisor: '' }));
    }
  };

  const handleBodegueroDni = (dni: string) => {
    setBodegueroDni(dni);
    if (dni.length === 8) {
      const found = state.personal.find((p) => p.dni === dni);
      if (found) {
        setFoundBodeguero(found);
        setForm((f) => ({ ...f, bodeguero: `${found.nombres} ${found.apellidos}` }));
      } else {
        setFoundBodeguero(null);
        setForm((f) => ({ ...f, bodeguero: '' }));
      }
    } else {
      setFoundBodeguero(null);
      setForm((f) => ({ ...f, bodeguero: '' }));
    }
  };

  const handleCreatePersonal = async () => {
    const p: Personal = {
      id: Date.now(),
      dni: newPersonalForm.dni,
      nombres: newPersonalForm.nombres,
      apellidos: newPersonalForm.apellidos,
      cargo: newPersonalForm.cargo,
      area: newPersonalForm.area,
      activo: true,
    };
    await addPersonal(p);
    if (newPersonalModalTarget === 'solicitante') {
      setFoundPersonal(p);
      setDniSearch(p.dni);
      setForm((f) => ({ ...f, solicitante: `${p.dni} - ${p.nombres} ${p.apellidos} (${p.cargo})` }));
    } else if (newPersonalModalTarget === 'supervisor') {
      setFoundSupervisor(p);
      setSupervisorDni(p.dni);
      setForm((f) => ({ ...f, supervisor: `${p.nombres} ${p.apellidos}` }));
    } else if (newPersonalModalTarget === 'bodeguero') {
      setFoundBodeguero(p);
      setBodegueroDni(p.dni);
      setForm((f) => ({ ...f, bodeguero: `${p.nombres} ${p.apellidos}` }));
    }
    setShowNewPersonalModal(false);
    setNewPersonalForm({ dni: '', nombres: '', apellidos: '', cargo: '', area: '' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!selectedMaterial || !form.cantidad) {
      return;
    }

    const ok = await addSalida({
      fecha: form.fecha,
      materialId: selectedMaterial.id,
      materialCodigo: selectedMaterial.codigo,
      materialDescripcion: selectedMaterial.descripcion,
      cantidad: form.cantidad,
      documento: form.vale,
      zona: form.zona,
      bodeguero: form.bodeguero,
      supervisor: form.supervisor,
      solicitante: form.solicitante,
      observaciones: `Cat: ${form.categoria} | Equipo: ${form.equipo} | ${form.observaciones}`,
      usuario: authState.user?.nombre || 'Sistema',
    });

    if (!ok) {
      setError('No hay stock suficiente para registrar la salida');
      return;
    }

    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
    setDniSearch('');
    setFoundPersonal(null);
    setSupervisorDni('');
    setFoundSupervisor(null);
    setBodegueroDni('');
    setFoundBodeguero(null);
    setForm({
      ...form,
      materialId: '',
      cantidad: 0,
      vale: '',
      categoria: '',
      equipo: '',
      zona: '',
      supervisor: '',
      solicitante: '',
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

    if (catalogModal === 'zona') {
      await saveZonasDestino([...state.zonasDestino, item]);
      setForm((current) => ({ ...current, zona: nombre }));
    }

    if (catalogModal === 'supervisor') {
      await saveSupervisores([...state.supervisores, item]);
      setForm((current) => ({ ...current, supervisor: nombre }));
    }

    if (catalogModal === 'categoria') {
      await saveCategorias([...state.categorias, item]);
      setForm((current) => ({ ...current, categoria: nombre }));
    }

    if (catalogModal === 'equipo') {
      await saveEquipos([...state.equipos, item]);
      setForm((current) => ({ ...current, equipo: nombre }));
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
    if (catalogManager === 'zona') {
      return state.zonasDestino;
    }
    if (catalogManager === 'supervisor') {
      return state.supervisores;
    }
    if (catalogManager === 'categoria') {
      return state.categorias;
    }
    if (catalogManager === 'equipo') {
      return state.equipos;
    }
    return [];
  };

  const getCatalogTitle = () => {
    if (catalogManager === 'zona') return 'Gestionar zonas destino';
    if (catalogManager === 'supervisor') return 'Gestionar supervisores';
    if (catalogManager === 'categoria') return 'Gestionar categorías';
    if (catalogManager === 'equipo') return 'Gestionar equipos';
    return '';
  };

  const getModalTitle = () => {
    if (catalogModal === 'zona') return 'Nueva zona destino';
    if (catalogModal === 'supervisor') return 'Nuevo supervisor';
    if (catalogModal === 'categoria') return 'Nueva categoría';
    if (catalogModal === 'equipo') return 'Nuevo equipo';
    return '';
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

    if (catalogManager === 'zona') {
      const previous = state.zonasDestino.find((item) => item.id === editingCatalogId)?.nombre;
      await saveZonasDestino(
        state.zonasDestino.map((item) =>
          item.id === editingCatalogId ? { ...item, nombre } : item
        )
      );
      if (form.zona === previous) {
        setForm((current) => ({ ...current, zona: nombre }));
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

    if (catalogManager === 'categoria') {
      const previous = state.categorias.find((item) => item.id === editingCatalogId)?.nombre;
      await saveCategorias(
        state.categorias.map((item) =>
          item.id === editingCatalogId ? { ...item, nombre } : item
        )
      );
      if (form.categoria === previous) {
        setForm((current) => ({ ...current, categoria: nombre }));
      }
    }

    if (catalogManager === 'equipo') {
      const previous = state.equipos.find((item) => item.id === editingCatalogId)?.nombre;
      await saveEquipos(
        state.equipos.map((item) =>
          item.id === editingCatalogId ? { ...item, nombre } : item
        )
      );
      if (form.equipo === previous) {
        setForm((current) => ({ ...current, equipo: nombre }));
      }
    }

    setEditingCatalogId(null);
    setEditingCatalogName('');
  };

  const deleteCatalogItem = async (item: CatalogItem) => {
    if (catalogManager === 'zona') {
      await saveZonasDestino(state.zonasDestino.filter((current) => current.id !== item.id));
      if (form.zona === item.nombre) {
        setForm((current) => ({ ...current, zona: '' }));
      }
    }

    if (catalogManager === 'supervisor') {
      await saveSupervisores(state.supervisores.filter((current) => current.id !== item.id));
      if (form.supervisor === item.nombre) {
        setForm((current) => ({ ...current, supervisor: '' }));
      }
    }

    if (catalogManager === 'categoria') {
      await saveCategorias(state.categorias.filter((current) => current.id !== item.id));
      if (form.categoria === item.nombre) {
        setForm((current) => ({ ...current, categoria: '' }));
      }
    }

    if (catalogManager === 'equipo') {
      await saveEquipos(state.equipos.filter((current) => current.id !== item.id));
      if (form.equipo === item.nombre) {
        setForm((current) => ({ ...current, equipo: '' }));
      }
    }
  };

  // Extract categoria and equipo from observaciones for display
  const parseObservaciones = (obs: string) => {
    const catMatch = obs.match(/Cat: ([^|]*)/);
    const eqMatch = obs.match(/Equipo: ([^|]*)/);
    const cat = catMatch ? catMatch[1].trim() : '';
    const eq = eqMatch ? eqMatch[1].trim() : '';
    return { categoria: cat, equipo: eq };
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      {success && (
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          className="fixed top-20 right-6 bg-green-600 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50"
        >
          <CheckCircle className="w-5 h-5" /> Salida registrada exitosamente
        </motion.div>
      )}

      {error && (
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          className="fixed top-20 right-6 bg-red-600 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50"
        >
          <AlertTriangle className="w-5 h-5" /> {error}
        </motion.div>
      )}

      <div className="bg-white rounded-xl border border-[#E2E6EF] p-6">
        <h3 className="font-display font-semibold text-[#1B2A4A] mb-4">Registrar Salida</h3>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium text-[#6B7A99] uppercase tracking-wider mb-1">Fecha</label>
            <input
              type="date"
              value={form.fecha}
              onChange={(e) => setForm({ ...form, fecha: e.target.value })}
              className="w-full border border-[#E2E6EF] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E8672C]/30"
            />
          </div>
          <div className="relative">
            <label className="block text-xs font-medium text-[#6B7A99] uppercase tracking-wider mb-1">Material</label>
            <input
              value={materialSearch}
              onChange={(e) => {
                setMaterialSearch(e.target.value);
                setForm({ ...form, materialId: '' });
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              placeholder="Buscar por código o descripción..."
              className="w-full border border-[#E2E6EF] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E8672C]/30"
            />
            {showSuggestions && materialSuggestions.length > 0 && (
              <div className="absolute z-10 top-full mt-1 w-full bg-white border border-[#E2E6EF] rounded-lg shadow-lg max-h-48 overflow-y-auto">
                {materialSuggestions.map((material) => (
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
            <label className="block text-xs font-medium text-[#6B7A99] uppercase tracking-wider mb-1">Cantidad</label>
            <input
              type="number"
              min={1}
              value={form.cantidad || ''}
              onChange={(e) => setForm({ ...form, cantidad: Number(e.target.value) })}
              className="w-full border border-[#E2E6EF] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E8672C]/30"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#6B7A99] uppercase tracking-wider mb-1">Categoría</label>
            <div className="flex gap-2">
              <select
                value={form.categoria}
                onChange={(e) => setForm({ ...form, categoria: e.target.value })}
                className="w-full border border-[#E2E6EF] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E8672C]/30"
              >
                <option value="">Seleccionar...</option>
                {state.categorias.map((cat) => (
                  <option key={cat.id} value={cat.nombre}>
                    {cat.nombre}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setCatalogModal('categoria')}
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
            <label className="block text-xs font-medium text-[#6B7A99] uppercase tracking-wider mb-1">Equipo / Máquina</label>
            <div className="flex gap-2">
              <select
                value={form.equipo}
                onChange={(e) => setForm({ ...form, equipo: e.target.value })}
                className="w-full border border-[#E2E6EF] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E8672C]/30"
              >
                <option value="">Seleccionar...</option>
                {state.equipos.map((eq) => (
                  <option key={eq.id} value={eq.nombre}>
                    {eq.nombre}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setCatalogModal('equipo')}
                className="shrink-0 w-10 rounded-lg border border-[#E2E6EF] text-[#E8672C] hover:bg-[#E8672C]/5"
              >
                +
              </button>
              <button
                type="button"
                onClick={() => openCatalogManager('equipo')}
                className="shrink-0 w-10 rounded-lg border border-[#E2E6EF] text-[#1B2A4A] hover:bg-gray-50"
              >
                <Settings className="w-4 h-4 mx-auto" />
              </button>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-[#6B7A99] uppercase tracking-wider mb-1">Solicitante (DNI)</label>
            <div className="flex gap-2">
              <input
                value={dniSearch}
                onChange={(e) => handleDniSearch(e.target.value.replace(/\D/g, '').slice(0, 8))}
                placeholder="Ingrese DNI (8 dígitos)..."
                maxLength={8}
                className="w-full border border-[#E2E6EF] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E8672C]/30"
              />
              <button
                type="button"
                onClick={() => {
                  setNewPersonalForm({ dni: dniSearch, nombres: '', apellidos: '', cargo: '', area: '' });
                  setShowNewPersonalModal(true);
                }}
                className="shrink-0 w-10 rounded-lg border border-[#E2E6EF] text-[#E8672C] hover:bg-[#E8672C]/5"
                title="Registrar nuevo personal"
              >
                <UserPlus className="w-4 h-4 mx-auto" />
              </button>
            </div>
            {foundPersonal && (
              <div className="mt-1 text-xs text-green-700 bg-green-50 rounded px-2 py-1">
                ✓ {foundPersonal.nombres} {foundPersonal.apellidos} — {foundPersonal.cargo}
              </div>
            )}
            {dniSearch.length === 8 && !foundPersonal && (
              <div className="mt-1 text-xs text-orange-600 bg-orange-50 rounded px-2 py-1">
                DNI no encontrado. Use + para registrar.
              </div>
            )}
          </div>
          <div>
            <label className="block text-xs font-medium text-[#6B7A99] uppercase tracking-wider mb-1">Vale / Documento</label>
            <input
              value={form.vale}
              onChange={(e) => setForm({ ...form, vale: e.target.value })}
              className="w-full border border-[#E2E6EF] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E8672C]/30"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#6B7A99] uppercase tracking-wider mb-1">Zona Destino</label>
            <div className="flex gap-2">
              <select
                value={form.zona}
                onChange={(e) => setForm({ ...form, zona: e.target.value })}
                className="w-full border border-[#E2E6EF] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E8672C]/30"
              >
                <option value="">Seleccionar...</option>
                {state.zonasDestino.map((zona) => (
                  <option key={zona.id} value={zona.nombre}>
                    {zona.nombre}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setCatalogModal('zona')}
                className="shrink-0 w-10 rounded-lg border border-[#E2E6EF] text-[#E8672C] hover:bg-[#E8672C]/5"
              >
                +
              </button>
              <button
                type="button"
                onClick={() => openCatalogManager('zona')}
                className="shrink-0 w-10 rounded-lg border border-[#E2E6EF] text-[#1B2A4A] hover:bg-gray-50"
              >
                <Settings className="w-4 h-4 mx-auto" />
              </button>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-[#6B7A99] uppercase tracking-wider mb-1">Bodeguero (DNI)</label>
            <div className="flex gap-2">
              <input
                value={bodegueroDni}
                onChange={(e) => handleBodegueroDni(e.target.value.replace(/\D/g, '').slice(0, 8))}
                placeholder="DNI del bodeguero..."
                maxLength={8}
                className="w-full border border-[#E2E6EF] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E8672C]/30"
              />
              <button
                type="button"
                onClick={() => {
                  setNewPersonalModalTarget('bodeguero');
                  setNewPersonalForm({ dni: bodegueroDni, nombres: '', apellidos: '', cargo: 'Bodeguero', area: '' });
                  setShowNewPersonalModal(true);
                }}
                className="shrink-0 w-10 rounded-lg border border-[#E2E6EF] text-[#E8672C] hover:bg-[#E8672C]/5"
                title="Registrar nuevo personal"
              >
                <UserPlus className="w-4 h-4 mx-auto" />
              </button>
            </div>
            {foundBodeguero && (
              <div className="mt-1 text-xs text-green-700 bg-green-50 rounded px-2 py-1">
                ✓ {foundBodeguero.nombres} {foundBodeguero.apellidos} — {foundBodeguero.cargo}
              </div>
            )}
            {bodegueroDni.length === 8 && !foundBodeguero && (
              <div className="mt-1 text-xs text-orange-600 bg-orange-50 rounded px-2 py-1">
                DNI no encontrado.
              </div>
            )}
          </div>
          <div>
            <label className="block text-xs font-medium text-[#6B7A99] uppercase tracking-wider mb-1">Supervisor (DNI)</label>
            <div className="flex gap-2">
              <input
                value={supervisorDni}
                onChange={(e) => handleSupervisorDni(e.target.value.replace(/\D/g, '').slice(0, 8))}
                placeholder="DNI del supervisor..."
                maxLength={8}
                className="w-full border border-[#E2E6EF] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E8672C]/30"
              />
              <button
                type="button"
                onClick={() => {
                  setNewPersonalModalTarget('supervisor');
                  setNewPersonalForm({ dni: supervisorDni, nombres: '', apellidos: '', cargo: 'Supervisor', area: '' });
                  setShowNewPersonalModal(true);
                }}
                className="shrink-0 w-10 rounded-lg border border-[#E2E6EF] text-[#E8672C] hover:bg-[#E8672C]/5"
                title="Registrar nuevo personal"
              >
                <UserPlus className="w-4 h-4 mx-auto" />
              </button>
            </div>
            {foundSupervisor && (
              <div className="mt-1 text-xs text-green-700 bg-green-50 rounded px-2 py-1">
                ✓ {foundSupervisor.nombres} {foundSupervisor.apellidos} — {foundSupervisor.cargo}
              </div>
            )}
            {supervisorDni.length === 8 && !foundSupervisor && (
              <div className="mt-1 text-xs text-orange-600 bg-orange-50 rounded px-2 py-1">
                DNI no encontrado.
              </div>
            )}
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
            <Button type="submit">Registrar Salida</Button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-xl border border-[#E2E6EF]">
        <div className="px-6 py-4 border-b border-[#E2E6EF]">
          <h3 className="font-display font-semibold text-[#1B2A4A]">Historial de Salidas</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-[#E2E6EF]">
                {['Fecha', 'Código', 'Descripción', 'Cantidad', 'Categoría', 'Equipo', 'Solicitante', 'Vale', 'Zona', 'Supervisor', ''].map((header) => (
                  <th
                    key={header || 'actions'}
                    className="px-3 py-3 text-left uppercase text-xs tracking-wider font-semibold text-[#6B7A99] whitespace-nowrap"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {state.movimientos
                .filter((movimiento) => movimiento.tipo === 'salida')
                .map((movimiento, index) => {
                  const parsed = parseObservaciones(movimiento.observaciones);
                  return (
                    <tr
                      key={movimiento.id}
                      className={`${index % 2 ? 'bg-gray-50/50' : ''} border-b border-[#E2E6EF]`}
                    >
                      <td className="px-3 py-2.5">{movimiento.fecha}</td>
                      <td className="px-3 py-2.5 font-medium">{movimiento.materialCodigo}</td>
                      <td className="px-3 py-2.5">{movimiento.materialDescripcion}</td>
                      <td className="px-3 py-2.5 text-center font-semibold">{movimiento.cantidad}</td>
                      <td className="px-3 py-2.5">{parsed.categoria}</td>
                      <td className="px-3 py-2.5">{parsed.equipo}</td>
                      <td className="px-3 py-2.5">{movimiento.solicitante || ''}</td>
                      <td className="px-3 py-2.5">{movimiento.documento}</td>
                      <td className="px-3 py-2.5">{movimiento.zona}</td>
                      <td className="px-3 py-2.5 text-[#6B7A99]">{movimiento.supervisor}</td>
                      <td className="px-3 py-2.5">
                        <button
                          type="button"
                          onClick={() => removeMovimiento(movimiento.id)}
                          className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 hover:text-red-700"
                          title="Eliminar salida"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={catalogModal !== null}
        onClose={() => setCatalogModal(null)}
        title={getModalTitle()}
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
        title={getCatalogTitle()}
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

      <Modal
        isOpen={showNewPersonalModal}
        onClose={() => setShowNewPersonalModal(false)}
        title="Registrar nuevo personal"
        size="md"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#6B7A99] uppercase tracking-wider mb-1">DNI</label>
              <input
                value={newPersonalForm.dni}
                onChange={(e) => setNewPersonalForm({ ...newPersonalForm, dni: e.target.value.replace(/\D/g, '').slice(0, 8) })}
                maxLength={8}
                className="w-full border border-[#E2E6EF] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E8672C]/30"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#6B7A99] uppercase tracking-wider mb-1">Cargo</label>
              <input
                value={newPersonalForm.cargo}
                onChange={(e) => setNewPersonalForm({ ...newPersonalForm, cargo: e.target.value })}
                className="w-full border border-[#E2E6EF] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E8672C]/30"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#6B7A99] uppercase tracking-wider mb-1">Nombres</label>
              <input
                value={newPersonalForm.nombres}
                onChange={(e) => setNewPersonalForm({ ...newPersonalForm, nombres: e.target.value })}
                className="w-full border border-[#E2E6EF] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E8672C]/30"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#6B7A99] uppercase tracking-wider mb-1">Apellidos</label>
              <input
                value={newPersonalForm.apellidos}
                onChange={(e) => setNewPersonalForm({ ...newPersonalForm, apellidos: e.target.value })}
                className="w-full border border-[#E2E6EF] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E8672C]/30"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setShowNewPersonalModal(false)}>Cancelar</Button>
            <Button onClick={handleCreatePersonal}>Guardar</Button>
          </div>
        </div>
      </Modal>
    </motion.div>
  );
}
