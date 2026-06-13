import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Bell, CheckCircle, Eye, Filter } from 'lucide-react';
import { useApp } from '../context/AppContext';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';

const tipos = [
  { value: '', label: 'Todas' },
  { value: 'stock_bajo', label: 'Stock Bajo' },
  { value: 'sin_movimiento', label: 'Sin Movimiento' },
  { value: 'critico', label: 'Críticos' },
  { value: 'mantenimiento', label: 'Mantenimiento' },
  { value: 'orden_retrasada', label: 'Orden Retrasada' },
  { value: 'consumo_elevado', label: 'Consumo Elevado' },
  { value: 'recepcion_incompleta', label: 'Recepción Incompleta' },
];

const sevVariant = (s: string) => s === 'danger' ? 'danger' as const : s === 'warning' ? 'warning' as const : 'info' as const;
const sevDot = (s: string) => s === 'danger' ? 'bg-red-500' : s === 'warning' ? 'bg-amber-500' : 'bg-blue-500';

export default function Alertas() {
  const { state, markAlertaRead, resolveAlerta } = useApp();
  const [tipoFilter, setTipoFilter] = useState('');
  const [showResolved, setShowResolved] = useState(false);

  const filtered = useMemo(() => {
    let a = [...state.alertas].sort((x, y) => y.fecha.localeCompare(x.fecha));
    if (tipoFilter) a = a.filter(x => x.tipo === tipoFilter);
    if (!showResolved) a = a.filter(x => !x.resuelta);
    return a;
  }, [state.alertas, tipoFilter, showResolved]);

  const unread = state.alertas.filter(a => !a.leida).length;
  const unresolved = state.alertas.filter(a => !a.resuelta).length;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white rounded-xl border border-[#E2E6EF] p-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-red-100 text-red-600 flex items-center justify-center"><Bell className="w-4 h-4" /></div>
          <div><p className="text-2xl font-bold text-[#1B2A4A]">{unresolved}</p><p className="text-xs text-[#6B7A99]">Sin resolver</p></div>
        </div>
        <div className="bg-white rounded-xl border border-[#E2E6EF] p-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center"><Eye className="w-4 h-4" /></div>
          <div><p className="text-2xl font-bold text-[#1B2A4A]">{unread}</p><p className="text-xs text-[#6B7A99]">No leídas</p></div>
        </div>
        <div className="bg-white rounded-xl border border-[#E2E6EF] p-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-green-100 text-green-600 flex items-center justify-center"><CheckCircle className="w-4 h-4" /></div>
          <div><p className="text-2xl font-bold text-[#1B2A4A]">{state.alertas.filter(a => a.resuelta).length}</p><p className="text-xs text-[#6B7A99]">Resueltas</p></div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <Filter className="w-4 h-4 text-[#6B7A99]" />
        <select value={tipoFilter} onChange={e => setTipoFilter(e.target.value)} className="text-sm border border-[#E2E6EF] rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#E8672C]/30">
          {tipos.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
        <label className="flex items-center gap-2 text-sm text-[#6B7A99] cursor-pointer">
          <input type="checkbox" checked={showResolved} onChange={e => setShowResolved(e.target.checked)} className="rounded border-[#E2E6EF]" />
          Mostrar resueltas
        </label>
      </div>

      {/* Alert list */}
      <div className="space-y-2.5">
        {filtered.map(a => (
          <div key={a.id} className={`bg-white rounded-xl border border-[#E2E6EF] p-3 flex items-start gap-3 ${!a.leida ? 'ring-1 ring-[#E8672C]/20' : ''} ${a.resuelta ? 'opacity-60' : ''}`}>
            <span className={`shrink-0 w-3 h-3 rounded-full mt-1.5 ${sevDot(a.severidad)}`} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-semibold text-sm text-[#1B2A4A]">{a.titulo}</h4>
                <Badge variant={sevVariant(a.severidad)}>{a.severidad}</Badge>
                {a.resuelta && <Badge variant="success">Resuelta</Badge>}
                {!a.leida && <span className="w-2 h-2 rounded-full bg-[#E8672C]" />}
              </div>
              <p className="text-sm text-[#6B7A99]">{a.descripcion}</p>
              <p className="text-xs text-[#6B7A99] mt-1">{a.fecha} — {a.hora}</p>
            </div>
            {!a.resuelta && (
              <div className="flex gap-2 shrink-0">
                {!a.leida && <Button size="sm" variant="ghost" onClick={() => void markAlertaRead(a.id)}>Marcar leída</Button>}
                <Button size="sm" variant="secondary" onClick={() => void resolveAlerta(a.id)}>Resolver</Button>
              </div>
            )}
          </div>
        ))}
        {filtered.length === 0 && <p className="text-center text-[#6B7A99] py-12">No hay alertas que coincidan con los filtros.</p>}
      </div>
    </motion.div>
  );
}
