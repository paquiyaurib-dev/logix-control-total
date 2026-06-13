import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useApp } from '../context/AppContext';
import KPICard from '../components/ui/KPICard';
import { Package, CheckCircle, Car, AlertTriangle, TrendingUp, Repeat, Fuel } from 'lucide-react';

const COLORS = ['#1B2A4A', '#E8672C', '#22C55E', '#F59E0B', '#6B7A99', '#8B5CF6'];

export default function KPIs() {
  const { state } = useApp();

  const exactitudInventario = useMemo(() => {
    if (state.materiales.length === 0) return 0;
    const correct = state.materiales.filter(m => m.stockActual >= m.stockMin).length;
    return Math.round((correct / state.materiales.length) * 100);
  }, [state.materiales]);

  const activosOperativos = useMemo(() => {
    if (state.activos.length === 0) return 0;
    const op = state.activos.filter(a => a.estado === 'Operativo').length;
    return Math.round((op / state.activos.length) * 100);
  }, [state.activos]);

  const vehiculosDisponibles = useMemo(() => {
    if (state.vehiculos.length === 0) return 0;
    const op = state.vehiculos.filter(v => v.estado === 'Operativo').length;
    return Math.round((op / state.vehiculos.length) * 100);
  }, [state.vehiculos]);

  const materialesCriticos = state.materiales.filter(m => m.stockActual < m.stockMin).length;

  const consumoMensual = useMemo(() => {
    return state.movimientos.filter(m => m.tipo === 'salida').reduce((sum, m) => sum + m.cantidad, 0);
  }, [state.movimientos]);

  const topConsumo = useMemo(() => {
    const map: Record<string, number> = {};
    state.movimientos.filter(m => m.tipo === 'salida').forEach(m => { map[m.materialCodigo] = (map[m.materialCodigo] || 0) + m.cantidad; });
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([code, total]) => ({ name: code, value: total }));
  }, [state.movimientos]);

  const consumoPorCategoria = useMemo(() => {
    const map: Record<string, number> = {};
    state.movimientos.filter(m => m.tipo === 'salida').forEach(m => {
      const mat = state.materiales.find(x => x.id === m.materialId);
      if (mat) map[mat.categoria] = (map[mat.categoria] || 0) + m.cantidad;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [state.movimientos, state.materiales]);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <h2 className="text-xl font-display font-semibold text-[#1B2A4A]">Indicadores de Gestión (KPIs)</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <KPICard title="Exactitud de Inventario" value={exactitudInventario} subtitle="% materiales en rango" accentColor="navy" icon={<CheckCircle className="w-5 h-5" />} trend={2.1} trendLabel="vs mes anterior" />
        <KPICard title="Activos Operativos" value={activosOperativos} subtitle="% del total" accentColor="success" icon={<Package className="w-5 h-5" />} trend={5.0} trendLabel="vs mes anterior" />
        <KPICard title="Disponibilidad Vehículos" value={vehiculosDisponibles} subtitle="% del total" accentColor="navy" icon={<Car className="w-5 h-5" />} trend={-2.3} trendLabel="vs mes anterior" />
        <KPICard title="Materiales Críticos" value={materialesCriticos} subtitle="Por debajo del mínimo" accentColor="orange" icon={<AlertTriangle className="w-5 h-5" />} trend={15.6} trendLabel="vs semana anterior" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top consumo bar chart */}
        <div className="bg-white rounded-xl border border-[#E2E6EF] p-5">
          <h3 className="uppercase text-xs tracking-wider text-[#6B7A99] font-semibold mb-4">Materiales Mayor Consumo</h3>
          <div style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topConsumo} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E6EF" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#6B7A99' }} />
                <YAxis tick={{ fontSize: 11, fill: '#6B7A99' }} />
                <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #E2E6EF' }} />
                <Bar dataKey="value" name="Consumo" fill="#1B2A4A" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Consumo por categoría pie chart */}
        <div className="bg-white rounded-xl border border-[#E2E6EF] p-5">
          <h3 className="uppercase text-xs tracking-wider text-[#6B7A99] font-semibold mb-4">Consumo por Categoría</h3>
          <div style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={consumoPorCategoria} cx="50%" cy="50%" labelLine={false} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} outerRadius={100} fill="#8884d8" dataKey="value">
                  {consumoPorCategoria.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Additional metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-[#E2E6EF] p-5">
          <div className="flex items-center gap-3 mb-2"><TrendingUp className="w-5 h-5 text-[#E8672C]" /><h3 className="text-sm font-semibold text-[#1B2A4A]">Rotación de Materiales</h3></div>
          <p className="text-3xl font-bold font-display text-[#1B2A4A]">4.2x</p>
          <p className="text-xs text-[#6B7A99] mt-1">Promedio últimos 12 meses</p>
        </div>
        <div className="bg-white rounded-xl border border-[#E2E6EF] p-5">
          <div className="flex items-center gap-3 mb-2"><Repeat className="w-5 h-5 text-[#1B2A4A]" /><h3 className="text-sm font-semibold text-[#1B2A4A]">Consumo Mensual Total</h3></div>
          <p className="text-3xl font-bold font-display text-[#1B2A4A]">{consumoMensual.toLocaleString()}</p>
          <p className="text-xs text-[#6B7A99] mt-1">Unidades consumidas</p>
        </div>
        <div className="bg-white rounded-xl border border-[#E2E6EF] p-5">
          <div className="flex items-center gap-3 mb-2"><Fuel className="w-5 h-5 text-[#E8672C]" /><h3 className="text-sm font-semibold text-[#1B2A4A]">Consumo Combustible</h3></div>
          <p className="text-3xl font-bold font-display text-[#1B2A4A]">{state.tareos.reduce((s, t) => s + t.combustible, 0).toLocaleString()} L</p>
          <p className="text-xs text-[#6B7A99] mt-1">Total registrado</p>
        </div>
      </div>
    </motion.div>
  );
}
