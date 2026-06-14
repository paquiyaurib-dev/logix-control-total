import { useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Download, Pencil, Plus, Trash2, Upload, Users } from 'lucide-react';
import * as XLSX from 'xlsx';
import { useApp } from '../context/AppContext';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import SearchBar from '../components/ui/SearchBar';
import { Personal } from '../data/mockData';

const emptyForm = {
  dni: '',
  nombres: '',
  apellidos: '',
  cargo: '',
  area: '',
  activo: true,
};

export default function Empleados() {
  const { state, addPersonal, savePersonal, deletePersonal } = useApp();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'Todos' | 'Activos' | 'Inactivos'>('Todos');
  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState<Personal | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [importResult, setImportResult] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const empleados = useMemo(() => {
    return state.personal.filter((empleado) => {
      const term = search.trim().toLowerCase();
      const matchesSearch =
        !term ||
        empleado.dni.toLowerCase().includes(term) ||
        empleado.nombres.toLowerCase().includes(term) ||
        empleado.apellidos.toLowerCase().includes(term) ||
        empleado.cargo.toLowerCase().includes(term) ||
        empleado.area.toLowerCase().includes(term);
      const matchesStatus =
        statusFilter === 'Todos' ||
        (statusFilter === 'Activos' && empleado.activo) ||
        (statusFilter === 'Inactivos' && !empleado.activo);
      return matchesSearch && matchesStatus;
    });
  }, [search, state.personal, statusFilter]);

  const totalActivos = state.personal.filter((empleado) => empleado.activo).length;
  const totalInactivos = state.personal.length - totalActivos;

  const openCreate = () => {
    setSelected(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (empleado: Personal) => {
    setSelected(empleado);
    setForm({
      dni: empleado.dni,
      nombres: empleado.nombres,
      apellidos: empleado.apellidos,
      cargo: empleado.cargo,
      area: empleado.area,
      activo: empleado.activo,
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    const payload: Personal = {
      id: selected?.id ?? Date.now(),
      dni: form.dni.trim(),
      nombres: form.nombres.trim(),
      apellidos: form.apellidos.trim(),
      cargo: form.cargo.trim(),
      area: form.area.trim(),
      activo: form.activo,
    };

    if (!payload.dni || !payload.nombres || !payload.apellidos || !payload.cargo || !payload.area) {
      return;
    }

    if (selected) {
      await savePersonal(state.personal.map((item) => (item.id === selected.id ? payload : item)));
    } else {
      await addPersonal(payload);
    }
    setModalOpen(false);
  };

  const handleDelete = async (empleado: Personal) => {
    await deletePersonal(empleado.id);
  };

  const handleImportExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json<Record<string, string>>(sheet);

    let added = 0;
    let updated = 0;
    const updatedList = [...state.personal];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const dni = String(row['DNI'] || row['dni'] || '').trim();
      if (!dni) continue;
      const nombres = String(row['NOMBRES'] || row['Nombres'] || row['nombres'] || '').trim();
      const apellidos = String(row['APELLIDOS'] || row['Apellidos'] || row['apellidos'] || '').trim();
      const cargo = String(row['CARGO'] || row['Cargo'] || row['cargo'] || '').trim();
      const area = String(row['AREA'] || row['ÁREA'] || row['Area'] || row['Área'] || row['area'] || '').trim();

      const existing = updatedList.findIndex((p) => p.dni === dni);
      if (existing >= 0) {
        updatedList[existing] = { ...updatedList[existing], nombres, apellidos, cargo, area };
        updated++;
      } else {
        updatedList.push({ id: Date.now() + i, dni, nombres, apellidos, cargo, area, activo: true });
        added++;
      }
    }

    await savePersonal(updatedList);
    setImportResult(`Se importaron ${added} empleados nuevos, se actualizaron ${updated}`);
    setTimeout(() => setImportResult(''), 5000);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleExportExcel = () => {
    const data = state.personal.map((p) => ({
      DNI: p.dni,
      NOMBRES: p.nombres,
      APELLIDOS: p.apellidos,
      CARGO: p.cargo,
      AREA: p.area,
      ESTADO: p.activo ? 'Activo' : 'Inactivo',
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Empleados');
    XLSX.writeFile(wb, 'empleados.xlsx');
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-xl font-display font-semibold text-[#1B2A4A]">Módulo de Empleados</h2>
          <p className="text-sm text-[#6B7A99]">Gestiona el personal operativo y administrativo.</p>
        </div>
        <div className="flex gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            onChange={handleImportExcel}
            className="hidden"
          />
          <Button variant="secondary" onClick={() => fileInputRef.current?.click()} icon={<Upload className="w-4 h-4" />}>
            Importar Excel
          </Button>
          <Button variant="secondary" onClick={handleExportExcel} icon={<Download className="w-4 h-4" />}>
            Exportar Excel
          </Button>
          <Button onClick={openCreate} icon={<Plus className="w-4 h-4" />}>
            Nuevo Empleado
          </Button>
        </div>
      </div>

      {importResult && (
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-green-600 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2"
        >
          ✓ {importResult}
        </motion.div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="bg-white rounded-xl border border-[#E2E6EF] p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#6B7A99]">Total empleados</p>
              <p className="text-2xl font-semibold text-[#1B2A4A]">{state.personal.length}</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-[#1B2A4A]/10 text-[#1B2A4A] flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-[#E2E6EF] p-4">
          <p className="text-sm text-[#6B7A99]">Activos</p>
          <p className="text-2xl font-semibold text-[#1B2A4A]">{totalActivos}</p>
        </div>
        <div className="bg-white rounded-xl border border-[#E2E6EF] p-4">
          <p className="text-sm text-[#6B7A99]">Inactivos</p>
          <p className="text-2xl font-semibold text-[#1B2A4A]">{totalInactivos}</p>
        </div>
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Buscar por DNI, nombre, cargo o área..."
          className="w-full lg:w-96"
        />
        <div className="flex gap-2">
          {(['Todos', 'Activos', 'Inactivos'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                statusFilter === status
                  ? 'bg-[#E8672C] text-white border-[#E8672C]'
                  : 'bg-white text-[#6B7A99] border-[#E2E6EF] hover:bg-gray-50'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-[#E2E6EF] overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-[#E2E6EF]">
              {['DNI', 'Nombres', 'Apellidos', 'Cargo', 'Área', 'Estado', 'Acciones'].map((header) => (
                <th
                  key={header}
                  className="px-4 py-3 text-left uppercase text-xs tracking-wider font-semibold text-[#6B7A99] whitespace-nowrap"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {empleados.map((empleado, index) => (
              <tr key={empleado.id} className={`${index % 2 ? 'bg-gray-50/50' : ''} border-b border-[#E2E6EF]`}>
                <td className="px-4 py-3 font-medium text-[#1B2A4A]">{empleado.dni}</td>
                <td className="px-4 py-3">{empleado.nombres}</td>
                <td className="px-4 py-3">{empleado.apellidos}</td>
                <td className="px-4 py-3 text-[#6B7A99]">{empleado.cargo}</td>
                <td className="px-4 py-3 text-[#6B7A99]">{empleado.area}</td>
                <td className="px-4 py-3">
                  <Badge variant={empleado.activo ? 'success' : 'neutral'}>
                    {empleado.activo ? 'Activo' : 'Inactivo'}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(empleado)} className="p-1.5 rounded hover:bg-gray-100 text-[#6B7A99]">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(empleado)} className="p-1.5 rounded hover:bg-red-50 text-red-600">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {empleados.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-sm text-[#6B7A99]">
                  No se encontraron empleados con los filtros actuales.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={selected ? 'Editar Empleado' : 'Nuevo Empleado'} size="lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-[#6B7A99] uppercase tracking-wider mb-1">DNI</label>
            <input
              value={form.dni}
              onChange={(event) => setForm({ ...form, dni: event.target.value })}
              className="w-full border border-[#E2E6EF] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E8672C]/30"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#6B7A99] uppercase tracking-wider mb-1">Cargo</label>
            <input
              value={form.cargo}
              onChange={(event) => setForm({ ...form, cargo: event.target.value })}
              className="w-full border border-[#E2E6EF] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E8672C]/30"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#6B7A99] uppercase tracking-wider mb-1">Nombres</label>
            <input
              value={form.nombres}
              onChange={(event) => setForm({ ...form, nombres: event.target.value })}
              className="w-full border border-[#E2E6EF] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E8672C]/30"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#6B7A99] uppercase tracking-wider mb-1">Apellidos</label>
            <input
              value={form.apellidos}
              onChange={(event) => setForm({ ...form, apellidos: event.target.value })}
              className="w-full border border-[#E2E6EF] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E8672C]/30"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-[#6B7A99] uppercase tracking-wider mb-1">Área</label>
            <input
              value={form.area}
              onChange={(event) => setForm({ ...form, area: event.target.value })}
              className="w-full border border-[#E2E6EF] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E8672C]/30"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-[#6B7A99] uppercase tracking-wider mb-1">Estado</label>
            <select
              value={form.activo ? 'Activo' : 'Inactivo'}
              onChange={(event) => setForm({ ...form, activo: event.target.value === 'Activo' })}
              className="w-full border border-[#E2E6EF] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E8672C]/30"
            >
              <option>Activo</option>
              <option>Inactivo</option>
            </select>
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="secondary" onClick={() => setModalOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>{selected ? 'Guardar cambios' : 'Crear empleado'}</Button>
        </div>
      </Modal>
    </motion.div>
  );
}