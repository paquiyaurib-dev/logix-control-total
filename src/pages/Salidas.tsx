import { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, CheckCircle } from 'lucide-react';
import { useApp, type CatalogItem } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';

type CatalogModalType = 'zona' | 'supervisor' | null;

export default function Salidas() {
  const {
    state,
    addSalida,
    saveZonasDestino,
    saveSupervisores,
  } = useApp();
  const { state: authState } = useAuth();

  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [catalogModal, setCatalogModal] = useState<CatalogModalType>(null);
  const [catalogName, setCatalogName] = useState('');
  const [form, setForm] = useState({
    fecha: new Date().toISOString().split('T')[0],
    materialId: '',
    cantidad: 0,
    vale: '',
    zona: '',
    bodeguero: authState.user?.nombre || '',
    supervisor: '',
    observaciones: '',
  });

  const selectedMaterial = state.materiales.find(
    (material) => material.id === Number(form.materialId)
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!selectedMaterial || !form.cantidad) {
      return;
    }

    const ok = addSalida({
      fecha: form.fecha,
      materialId: selectedMaterial.id,
      materialCodigo: selectedMaterial.codigo,
      materialDescripcion: selectedMaterial.descripcion,
      cantidad: form.cantidad,
      documento: form.vale,
      zona: form.zona,
      bodeguero: form.bodeguero,
      supervisor: form.supervisor,
      observaciones: form.observaciones,
      usuario: authState.user?.nombre || 'Sistema',
    });

    if (!ok) {
      setError('No hay stock suficiente para registrar la salida');
      return;
    }

    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
    setForm({
      ...form,
      materialId: '',
      cantidad: 0,
      vale: '',
      zona: '',
      supervisor: '',
      observaciones: '',
    });
  };

  const createCatalogItem = () => {
    const nombre = catalogName.trim();
    if (!nombre || !catalogModal) {
      return;
    }

    const item: CatalogItem = {
      id: `${catalogModal}-${Date.now()}`,
      nombre,
    };

    if (catalogModal === 'zona') {
      saveZonasDestino([...state.zonasDestino, item]);
      setForm((current) => ({ ...current, zona: nombre }));
    }

    if (catalogModal === 'supervisor') {
      saveSupervisores([...state.supervisores, item]);
      setForm((current) => ({ ...current, supervisor: nombre }));
    }

    setCatalogModal(null);
    setCatalogName('');
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
          <div>
            <label className="block text-xs font-medium text-[#6B7A99] uppercase tracking-wider mb-1">Material</label>
            <select
              value={form.materialId}
              onChange={(e) => setForm({ ...form, materialId: e.target.value })}
              className="w-full border border-[#E2E6EF] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E8672C]/30"
            >
              <option value="">Seleccionar...</option>
              {state.materiales.map((material) => (
                <option key={material.id} value={material.id}>
                  {material.codigo} - {material.descripcion}
                </option>
              ))}
            </select>
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
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-[#6B7A99] uppercase tracking-wider mb-1">Bodeguero</label>
            <input
              value={form.bodeguero}
              onChange={(e) => setForm({ ...form, bodeguero: e.target.value })}
              className="w-full border border-[#E2E6EF] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E8672C]/30"
            />
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
                {['Fecha', 'Código', 'Descripción', 'Cantidad', 'Vale', 'Zona', 'Supervisor'].map((header) => (
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
              {state.movimientos
                .filter((movimiento) => movimiento.tipo === 'salida')
                .map((movimiento, index) => (
                  <tr
                    key={movimiento.id}
                    className={`${index % 2 ? 'bg-gray-50/50' : ''} border-b border-[#E2E6EF]`}
                  >
                    <td className="px-3 py-2.5">{movimiento.fecha}</td>
                    <td className="px-3 py-2.5 font-medium">{movimiento.materialCodigo}</td>
                    <td className="px-3 py-2.5">{movimiento.materialDescripcion}</td>
                    <td className="px-3 py-2.5 text-center font-semibold">{movimiento.cantidad}</td>
                    <td className="px-3 py-2.5">{movimiento.documento}</td>
                    <td className="px-3 py-2.5">{movimiento.zona}</td>
                    <td className="px-3 py-2.5 text-[#6B7A99]">{movimiento.supervisor}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={catalogModal !== null}
        onClose={() => setCatalogModal(null)}
        title={catalogModal === 'zona' ? 'Nueva zona destino' : 'Nuevo supervisor'}
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
    </motion.div>
  );
}