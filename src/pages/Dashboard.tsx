import { useNavigate } from 'react-router-dom';
import {
  Package,
  AlertTriangle,
  ArrowDownToLine,
  ArrowUpFromLine,
  ChevronRight,
  Clock,
  DollarSign,
} from 'lucide-react';
import { motion } from 'framer-motion';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import KPICard from '../components/ui/KPICard';
import { useApp } from '../context/AppContext';

// ── Chart mock data ──────────────────────────────────────────────────
const chartData = [
  { mes: 'JUN', ingresos: 1320, salidas: 980 },
  { mes: 'JUL', ingresos: 1480, salidas: 1120 },
  { mes: 'AGO', ingresos: 1250, salidas: 1050 },
  { mes: 'SEP', ingresos: 1620, salidas: 1280 },
  { mes: 'OCT', ingresos: 1780, salidas: 1400 },
  { mes: 'NOV', ingresos: 1540, salidas: 1180 },
  { mes: 'DIC', ingresos: 1380, salidas: 920 },
  { mes: 'ENE', ingresos: 1450, salidas: 1060 },
  { mes: 'FEB', ingresos: 1680, salidas: 1320 },
  { mes: 'MAR', ingresos: 1520, salidas: 1150 },
  { mes: 'ABR', ingresos: 1600, salidas: 1240 },
  { mes: 'MAY', ingresos: 1722, salidas: 1056 },
];

// ── Alerts mock data ─────────────────────────────────────────────────
type AlertSeverity = 'danger' | 'warning' | 'info';

interface DashboardAlert {
  id: number;
  severity: AlertSeverity;
  title: string;
  description: string;
  time: string;
}

const alerts: DashboardAlert[] = [
  {
    id: 1,
    severity: 'danger',
    title: 'Stock bajo',
    description: 'Tornillo Hexagonal M12 x 50',
    time: '09:31',
  },
  {
    id: 2,
    severity: 'warning',
    title: 'Mantenimiento pendiente',
    description: 'Camión FLT-045',
    time: '08:47',
  },
  {
    id: 3,
    severity: 'warning',
    title: 'Orden retrasada',
    description: 'Orden #OC-1528',
    time: '08:15',
  },
  {
    id: 4,
    severity: 'info',
    title: 'Consumo elevado',
    description: 'Unidad FLT-032',
    time: '07:52',
  },
  {
    id: 5,
    severity: 'info',
    title: 'Recepción incompleta',
    description: 'Orden #RC-0934',
    time: '07:21',
  },
];

const severityDotColors: Record<AlertSeverity, string> = {
  danger: 'bg-red-500',
  warning: 'bg-amber-500',
  info: 'bg-blue-500',
};

// ── Component ────────────────────────────────────────────────────────
export default function Dashboard() {
  const navigate = useNavigate();
  const { state } = useApp();

  const stockBajoCount = state.materiales.filter(
    (m) => m.stockActual < m.stockMin
  ).length;

  const valorTotalStock = state.materiales.reduce(
    (sum, m) => sum + m.stockActual * m.precioUnitario, 0
  );

  const fmtPEN = (v: number) => `S/ ${v.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      {/* ── Valor Total en Stock (destacado) ──────────────────── */}
      <div className="bg-gradient-to-r from-[#1B2A4A] to-[#2a3f6b] rounded-xl p-3.5 lg:p-4 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center">
            <DollarSign className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-white/70 text-[10px] uppercase tracking-wider font-medium">Valor Total en Stock</p>
            <p className="text-white text-2xl lg:text-3xl font-bold font-display">{fmtPEN(valorTotalStock)}</p>
          </div>
        </div>
        <div className="text-right hidden sm:block">
          <p className="text-white/60 text-[11px]">{state.materiales.length} materiales registrados</p>
          <p className="text-green-400 text-xs font-semibold">+3.2% vs mes anterior</p>
        </div>
      </div>

      {/* ── KPI Cards ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <KPICard
          title="STOCK TOTAL"
          value={state.materiales.reduce((sum, material) => sum + material.stockActual, 0)}
          subtitle="Unidades totales"
          trend={8.4}
          trendLabel="vs mes anterior"
          accentColor="navy"
          icon={<Package className="w-5 h-5" />}
        />
        <KPICard
          title="STOCK BAJO"
          value={stockBajoCount}
          subtitle="Materiales"
          trend={15.6}
          trendLabel="vs semana anterior"
          accentColor="orange"
          icon={<AlertTriangle className="w-5 h-5" />}
        />
        <KPICard
          title="INGRESOS DEL DÍA"
          value={state.movimientos
            .filter((movement) => movement.tipo === 'ingreso')
            .reduce((sum, movement) => sum + movement.cantidad, 0)}
          subtitle="Unidades"
          trend={12.3}
          trendLabel="vs ayer"
          accentColor="navy"
          icon={<ArrowDownToLine className="w-5 h-5" />}
        />
        <KPICard
          title="SALIDAS DEL DÍA"
          value={state.movimientos
            .filter((movement) => movement.tipo === 'salida')
            .reduce((sum, movement) => sum + movement.cantidad, 0)}
          subtitle="Unidades"
          trend={9.7}
          trendLabel="vs ayer"
          accentColor="navy"
          icon={<ArrowUpFromLine className="w-5 h-5" />}
        />
      </div>

      {/* ── Two-column layout ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* ── Chart Card ──────────────────────────────────────────── */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-[#E2E6EF] shadow-sm">
          {/* Header */}
          <div className="flex items-center justify-between px-4 pt-4 pb-3">
            <h2 className="uppercase text-xs tracking-wider text-[#6B7A99] font-semibold">
              Flujo de Materiales (Mensual)
            </h2>
            <select className="text-xs border border-[#E2E6EF] rounded-lg px-3 py-1.5 text-[#6B7A99] bg-white focus:outline-none focus:ring-2 focus:ring-[#E8672C]/30">
              <option>Últimos 12 meses</option>
            </select>
          </div>

          {/* Chart */}
          <div className="px-3 pb-1" style={{ height: 240 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
              >
                <defs>
                  <linearGradient id="gradIngresos" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#1B2A4A" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#1B2A4A" stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="gradSalidas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#E8672C" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#E8672C" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E6EF" />
                <XAxis
                  dataKey="mes"
                  tick={{ fontSize: 11, fill: '#6B7A99' }}
                  axisLine={{ stroke: '#E2E6EF' }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#6B7A99' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #E2E6EF',
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Legend
                  verticalAlign="top"
                  align="right"
                  iconType="circle"
                  wrapperStyle={{ fontSize: 12, paddingBottom: 8 }}
                />
                <Area
                  type="monotone"
                  dataKey="ingresos"
                  name="Ingresos"
                  stroke="#1B2A4A"
                  strokeWidth={2}
                  fill="url(#gradIngresos)"
                />
                <Area
                  type="monotone"
                  dataKey="salidas"
                  name="Salidas"
                  stroke="#E8672C"
                  strokeWidth={2}
                  fill="url(#gradSalidas)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Summary stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 px-4 pb-4 pt-2 border-t border-[#E2E6EF]">
            <div>
              <p className="text-xs text-[#6B7A99] uppercase tracking-wide">
                Total Ingresos
              </p>
              <p className="text-base font-bold text-[#1B2A4A]">17,842</p>
            </div>
            <div>
              <p className="text-xs text-[#6B7A99] uppercase tracking-wide">
                Total Salidas
              </p>
              <p className="text-base font-bold text-[#1B2A4A]">13,756</p>
            </div>
            <div>
              <p className="text-xs text-[#6B7A99] uppercase tracking-wide">
                Promedio Mensual Ingresos
              </p>
              <p className="text-base font-bold text-[#1B2A4A]">1,487</p>
            </div>
            <div>
              <p className="text-xs text-[#6B7A99] uppercase tracking-wide">
                Promedio Mensual Salidas
              </p>
              <p className="text-base font-bold text-[#1B2A4A]">1,146</p>
            </div>
          </div>
        </div>

        {/* ── Alerts Card ─────────────────────────────────────────── */}
        <div className="lg:col-span-1 bg-white rounded-xl border border-[#E2E6EF] shadow-sm flex flex-col">
          {/* Header */}
          <div className="px-6 pt-5 pb-4">
            <h2 className="uppercase text-xs tracking-wider text-[#6B7A99] font-semibold">
              Alertas Recientes
            </h2>
          </div>

          {/* Alert list */}
          <div className="flex-1 divide-y divide-[#E2E6EF]">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className="flex items-center gap-3 px-6 py-3.5 hover:bg-[#F7F8FA] transition-colors cursor-pointer"
              >
                {/* Severity dot */}
                <span
                  className={`shrink-0 w-2.5 h-2.5 rounded-full ${severityDotColors[alert.severity]}`}
                />

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-[#1B2A4A] truncate">
                    {alert.title}
                  </p>
                  <p className="text-xs text-[#6B7A99] truncate">
                    {alert.description}
                  </p>
                </div>

                {/* Time */}
                <div className="flex items-center gap-1 shrink-0">
                  <Clock className="w-3 h-3 text-[#6B7A99]" />
                  <span className="text-xs text-[#6B7A99]">{alert.time}</span>
                </div>

                {/* Chevron */}
                <ChevronRight className="w-4 h-4 text-[#6B7A99] shrink-0" />
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-[#E2E6EF]">
            <button
              onClick={() => navigate('/alertas')}
              className="w-full text-center text-[#E8672C] font-semibold text-sm uppercase tracking-wider hover:text-[#d45a22] transition-colors"
            >
              Ir al Centro de Alertas
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
