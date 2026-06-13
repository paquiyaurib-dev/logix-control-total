import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, AlertTriangle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';

export default function Flota() {
  const { state, addTareo } = useApp();
  const [success, setSuccess] = useState(false);
  const [vehiculoFilter, setVehiculoFilter] = useState('');
  const [form, setForm] = useState({ vehiculoId: '', fecha: new Date().toISOString().split('T')[0], operador: '', supervisor: '', kmInicial: 0, kmFinal: 0, horometroInicial: 0, horometroFinal: 0, combustible: 0, actividad: '', observaciones: '' });

  const filteredTareos = useMemo(() => {
    let t = [...state.tareos].reverse();
    if (vehiculoFilter) t = t.filter(x => x.vehiculoId === Number(vehiculoFilter));
    return t;
  }, [state.tareos, vehiculoFilter]);

  const maintenanceVehicles = state.vehiculos.filter(v => v.estado !== 'Operativo');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.vehiculoId) return;
    const v = state.vehiculos.find(x => x.id === Number(form.vehiculoId));
    if (!v) return;
    await addTareo({ vehiculoId: v.id, placa: v.placa, fecha: form.fecha, operador: form.operador || v.operador, supervisor: form.supervisor, kmInicial: form.kmInicial, kmFinal: form.kmFinal, horometroInicial: form.horometroInicial, horometroFinal: form.horometroFinal, combustible: form.combustible, actividad: form.actividad, observaciones: form.observaciones });
    setSuccess(true); setTimeout(() => setSuccess(false), 3000);
    setForm({ ...form, vehiculoId: '', kmInicial: 0, kmFinal: 0, horometroInicial: 0, horometroFinal: 0, combustible: 0, actividad: '', observaciones: '' });
  };

  const estadoColor = (e: string) => e === 'Operativo' ? 'border-green-500' : e === 'En Mantenimiento' ? 'border-amber-500' : 'border-red-500';
  const estadoVariant = (e: string) => e === 'Operativo' ? 'success' as const : e === 'En Mantenimiento' ? 'warning' as const : 'danger' as const;
  const inputCls = "w-full border border-[#E2E6EF] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E8672C]/30";

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      {success && (
        <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} className="fixed top-20 right-6 bg-green-600 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50">
          <CheckCircle className="w-5 h-5" /> Tareo registrado exitosamente
        </motion.div>
      )}

      {/* Vehicle cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {state.vehiculos.map(v => (
          <div key={v.id} className={`bg-white rounded-xl border-l-4 ${estadoColor(v.estado)} border border-[#E2E6EF] p-4`}>
            <p className="text-lg font-bold text-[#1B2A4A]">{v.placa}</p>
            <Badge variant={estadoVariant(v.estado)} className="mt-1">{v.tipo}</Badge>
            <p className="text-xs text-[#6B7A99] mt-2">{v.marca} {v.modelo}</p>
            <p className="text-xs text-[#6B7A99]">Operador: {v.operador}</p>
            <div className="mt-2 pt-2 border-t border-[#E2E6EF] text-xs text-[#6B7A99] flex justify-between">
              <span>Km: {v.kmActual.toLocaleString()}</span>
              <span>Horo: {v.horometroActual}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Tareo form */}
      <div className="bg-white rounded-xl border border-[#E2E6EF] p-6">
        <h3 className="font-display font-semibold text-[#1B2A4A] mb-4">Registro de Tareo Diario</h3>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div><label className="block text-xs font-medium text-[#6B7A99] uppercase tracking-wider mb-1">Vehículo</label>
            <select value={form.vehiculoId} onChange={e => { setForm({...form, vehiculoId: e.target.value}); const v = state.vehiculos.find(x => x.id === Number(e.target.value)); if(v) setForm(f => ({...f, vehiculoId: e.target.value, operador: v.operador, kmInicial: v.kmActual, horometroInicial: v.horometroActual})); }} className={inputCls}>
              <option value="">Seleccionar...</option>
              {state.vehiculos.map(v => <option key={v.id} value={v.id}>{v.placa} - {v.marca} {v.modelo}</option>)}
            </select></div>
          <div><label className="block text-xs font-medium text-[#6B7A99] uppercase tracking-wider mb-1">Fecha</label><input type="date" value={form.fecha} onChange={e => setForm({...form, fecha: e.target.value})} className={inputCls} /></div>
          <div><label className="block text-xs font-medium text-[#6B7A99] uppercase tracking-wider mb-1">Operador</label><input value={form.operador} onChange={e => setForm({...form, operador: e.target.value})} className={inputCls} /></div>
          <div><label className="block text-xs font-medium text-[#6B7A99] uppercase tracking-wider mb-1">Supervisor</label><input value={form.supervisor} onChange={e => setForm({...form, supervisor: e.target.value})} className={inputCls} /></div>
          <div><label className="block text-xs font-medium text-[#6B7A99] uppercase tracking-wider mb-1">Km Inicial</label><input type="number" value={form.kmInicial || ''} onChange={e => setForm({...form, kmInicial: Number(e.target.value)})} className={inputCls} /></div>
          <div><label className="block text-xs font-medium text-[#6B7A99] uppercase tracking-wider mb-1">Km Final</label><input type="number" value={form.kmFinal || ''} onChange={e => setForm({...form, kmFinal: Number(e.target.value)})} className={inputCls} /></div>
          <div><label className="block text-xs font-medium text-[#6B7A99] uppercase tracking-wider mb-1">Horómetro Inicial</label><input type="number" value={form.horometroInicial || ''} onChange={e => setForm({...form, horometroInicial: Number(e.target.value)})} className={inputCls} /></div>
          <div><label className="block text-xs font-medium text-[#6B7A99] uppercase tracking-wider mb-1">Horómetro Final</label><input type="number" value={form.horometroFinal || ''} onChange={e => setForm({...form, horometroFinal: Number(e.target.value)})} className={inputCls} /></div>
          <div><label className="block text-xs font-medium text-[#6B7A99] uppercase tracking-wider mb-1">Combustible (L)</label><input type="number" value={form.combustible || ''} onChange={e => setForm({...form, combustible: Number(e.target.value)})} className={inputCls} /></div>
          <div className="lg:col-span-2"><label className="block text-xs font-medium text-[#6B7A99] uppercase tracking-wider mb-1">Actividad</label><input value={form.actividad} onChange={e => setForm({...form, actividad: e.target.value})} className={inputCls} /></div>
          <div><label className="block text-xs font-medium text-[#6B7A99] uppercase tracking-wider mb-1">Observaciones</label><input value={form.observaciones} onChange={e => setForm({...form, observaciones: e.target.value})} className={inputCls} /></div>
          <div className="lg:col-span-4 flex justify-end"><Button type="submit">Registrar Tareo</Button></div>
        </form>
      </div>

      {/* Maintenance alerts */}
      {maintenanceVehicles.length > 0 && (
        <div className="bg-amber-50 rounded-xl border border-amber-200 p-4">
          <h3 className="font-display font-semibold text-amber-800 flex items-center gap-2 mb-2"><AlertTriangle className="w-5 h-5" />Alertas de Mantenimiento</h3>
          <div className="space-y-2">{maintenanceVehicles.map(v => (
            <div key={v.id} className="flex items-center gap-3 text-sm text-amber-800">
              <Badge variant="warning">{v.estado}</Badge>
              <span className="font-medium">{v.placa}</span> — {v.marca} {v.modelo}
            </div>
          ))}</div>
        </div>
      )}

      {/* Tareos table */}
      <div className="bg-white rounded-xl border border-[#E2E6EF]">
        <div className="px-6 py-4 border-b border-[#E2E6EF] flex items-center justify-between">
          <h3 className="font-display font-semibold text-[#1B2A4A]">Historial de Tareos</h3>
          <select value={vehiculoFilter} onChange={e => setVehiculoFilter(e.target.value)} className="text-sm border border-[#E2E6EF] rounded-lg px-3 py-1.5 bg-white focus:outline-none">
            <option value="">Todos los vehículos</option>
            {state.vehiculos.map(v => <option key={v.id} value={v.id}>{v.placa}</option>)}
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-gray-50 border-b border-[#E2E6EF]">
              {['Fecha','Vehículo','Operador','Km Ini','Km Fin','Km Rec.','Horo Ini','Horo Fin','Combustible','Actividad'].map(h => (
                <th key={h} className="px-3 py-3 text-left uppercase text-xs tracking-wider font-semibold text-[#6B7A99] whitespace-nowrap">{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {filteredTareos.map((t, i) => (
                <tr key={t.id} className={`${i%2 ? 'bg-gray-50/50' : ''} border-b border-[#E2E6EF]`}>
                  <td className="px-3 py-2.5">{t.fecha}</td>
                  <td className="px-3 py-2.5 font-medium">{t.placa}</td>
                  <td className="px-3 py-2.5">{t.operador}</td>
                  <td className="px-3 py-2.5 text-right">{t.kmInicial.toLocaleString()}</td>
                  <td className="px-3 py-2.5 text-right">{t.kmFinal.toLocaleString()}</td>
                  <td className="px-3 py-2.5 text-right font-semibold">{(t.kmFinal - t.kmInicial).toLocaleString()}</td>
                  <td className="px-3 py-2.5 text-right">{t.horometroInicial}</td>
                  <td className="px-3 py-2.5 text-right">{t.horometroFinal}</td>
                  <td className="px-3 py-2.5 text-right">{t.combustible} L</td>
                  <td className="px-3 py-2.5">{t.actividad}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}
