import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';
import { useApp, type MovementClassItem } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';

type CatalogModalType = 'proveedor' | 'clase' | null;

export default function Ingresos() {
  const {
    state,
    addIngreso,
    saveProveedores,
    saveClasesMovimiento,
  } = useApp();
  const { state: authState } = useAuth();

  const [success, setSuccess] = useState(false);
  const [catalogModal, setCatalogModal] = useState<CatalogModalType>(null);
  const [catalogName, setCatalogName] = useState('');
  const [catalogCode, setCatalogCode] = useState('');
  const [form, setForm] = useState({
    fecha: new Date().toISOString().split('T')[0],
    materialId: '',
    cantidad: 0,
    documento: '',
    proveedorId: '',
    clase: '',
    bodeguero: authState.user?.nombre || '',
    supervisor: '',
    observaciones: '',
  });

  const ingresosClases = useMemo(
    () => state.clasesMovimiento.filter((item) => item.value.startsWith('1')),
    [state.clasesMovimiento]
  );

  const selectedMaterial = state.materiales.find(
    (material) => material.id === Number(form.materialId)
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMaterial || !form.cantidad) {
      return;
    }

    addIngreso({
      fecha: form.fecha,
      materialId: selectedMaterial.id,
      materialCodigo: selectedMaterial.codigo,
      materialDescripcion: selectedMaterial.descripcion,
      cantidad: form.cantidad,
      documento: `${form.clase}-${form.documento}`,
      proveedor:
        state.proveedores.find((proveedor) => proveedor.id === Number(form.proveedorId))
          ?.razonSocial || '',
      bodeguero: form.bodeguero,
      supervisor: form.supervisor,
      observaciones: form.observaciones,
      usuario: authState.user?.nombre || 'Sistema',
    });

    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
    setForm({
      ...form,
      materialId: '',
      cantidad: 0,
      documento: '',
      proveedorId: '',
      clase: '',
      supervisor: '',
      observaciones: '',
    });
  };

  const createCatalogItem = () => {
    if (catalogModal === 'proveedor') {
      const razonSocial = catalogName.trim();
      if (!razonSocial) {
        return;
      }
      const proveedor = {
        id: Date.now(),
        ruc: '',
        razonSocial,
        contacto: '',
        telefono: '',
        email: '',
      };
      saveProveedores([...state.proveedores, proveedor]);
      setForm((current) => ({ ...current, proveedorId: String(proveedor.id) }));
    }

    if (catalogModal === 'clase') {
      const code = catalogCode.trim();
      const label = catalogName.trim();
      if (!code || !label) {
        return;
      }
      const clase: MovementClassItem = {
        id: `mov-${Date.now()}`,
        value: code,
        label: `${code}-${label}`,
      };
      saveClasesMovimiento([...state.clasesMovimiento, clase]);
      setForm((current) => ({ ...current, clase: clase.value }));
    }

    setCatalogModal(null);
    setCatalogName('');
    setCatalogCode('');
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      {success && (
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          className="fixed top-20 right-6 bg-green-600 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50"
        >
          <CheckCircle className="w-5 h-5" /> Ingreso registrado exitosamente
        </motion.div>
      )}

      <div className="bg-white rounded-xl border border-[#E2E6EF] p-6">
        <h3 className="font-display font-semibold text-[#1B2A4A] mb-4">Registrar Ingreso</h3>
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
            <label className="block text-xs font-medium text-[#6B7A99] uppercase tracking-wider mb-1">Documento</label>
            <input
              value={form.documento}
              onChange={(e) => setForm({ ...form, documento: e.target.value })}
              className="w-full border border-[#E2E6EF] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E8672C]/30"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#6B7A99] uppercase tracking-wider mb-1">Proveedor</label>
            <div className="flex gap-2">
              <select
                value={form.proveedorId}
                onChange={(e) => setForm({ ...form, proveedorId: e.target.value })}
                className="w-full border border-[#E2E6EF] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E8672C]/30"
              >
                <option value="">Seleccionar...</option>
                {state.proveedores.map((proveedor) => (
                  <option key={proveedor.id} value={proveedor.id}>
                    {proveedor.razonSocial}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setCatalogModal('proveedor')}
                className="shrink-0 w-10 rounded-lg border border-[#E2E6EF] text-[#E8672C] hover:bg-[#E8672C]/5"
              >
                +
              </button>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-[#6B7A99] uppercase tracking-wider mb-1">Clase de Movimiento</label>
            <div className="flex gap-2">
              <select
                value={form.clase}
                onChange={(e) => setForm({ ...form, clase: e.target.value })}
                className="w-full border border-[#E2E6EF] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E8672C]/30"
              >
                <option value="">Seleccionar...</option>
                {ingresosClases.map((clase) => (
                  <option key={clase.id} value={clase.value}>
                    {clase.label}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setCatalogModal('clase')}
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
            <input
              value={form.supervisor}
              onChange={(e) => setForm({ ...form, supervisor: e.target.value })}
              className="w-full border border-[#E2E6EF] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E8672C]/30"
            />
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
            <Button type="submit">Registrar Ingreso</Button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-xl border border-[#E2E6EF]">
        <div className="px-6 py-4 border-b border-[#E2E6EF]">
          <h3 className="font-display font-semibold text-[#1B2A4A]">Historial de Ingresos</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-[#E2E6EF]">
                {['Fecha', 'Código', 'Descripción', 'Cantidad', 'Documento', 'Proveedor', 'Usuario'].map((header) => (
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
                .filter((movimiento) => movimiento.tipo === 'ingreso')
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
                    <td className="px-3 py-2.5">{movimiento.proveedor}</td>
                    <td className="px-3 py-2.5">{movimiento.usuario}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={catalogModal !== null}
        onClose={() => setCatalogModal(null)}
        title={catalogModal === 'proveedor' ? 'Nuevo proveedor' : 'Nueva clase de movimiento'}
        size="sm"
      >
        <div className="space-y-4">
          {catalogModal === 'clase' && (
            <div>
              <label className="block text-xs font-medium text-[#6B7A99] uppercase tracking-wider mb-1">Código</label>
              <input
                value={catalogCode}
                onChange={(e) => setCatalogCode(e.target.value)}
                className="w-full border border-[#E2E6EF] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E8672C]/30"
              />
            </div>
          )}
          <div>
            <label className="block text-xs font-medium text-[#6B7A99] uppercase tracking-wider mb-1">
              {catalogModal === 'proveedor' ? 'Razón social' : 'Descripción'}
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
    </motion.div>
  );
}