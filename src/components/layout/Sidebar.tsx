import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, Package, PackagePlus, PackageMinus,
  Truck, ClipboardList, Monitor, Car, BarChart3, Bell, Settings,
  TrendingUp, Building2,
} from 'lucide-react';

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/materiales', label: 'Materiales', icon: Package },
  { to: '/ingresos', label: 'Ingresos', icon: PackagePlus },
  { to: '/salidas', label: 'Salidas', icon: PackageMinus },
  { to: '/despachos', label: 'Despachos', icon: Truck },
  { to: '/inventarios', label: 'Inventarios', icon: ClipboardList },
  { to: '/activos', label: 'Activos', icon: Monitor },
  { to: '/flota', label: 'Flota', icon: Car },
  { to: '/reportes', label: 'Reportes', icon: BarChart3 },
  { to: '/alertas', label: 'Alertas', icon: Bell },
  { to: '/kpis', label: 'KPIs', icon: TrendingUp },
  { to: '/configuracion', label: 'Configuración', icon: Settings },
];

interface SidebarProps {
  isExpanded: boolean;
  onToggle: () => void;
  onExpand: () => void;
  onCollapse: () => void;
}

export default function Sidebar({ isExpanded, onToggle, onExpand, onCollapse }: SidebarProps) {
  const sidebarContent = (
    <div
      className="flex flex-col h-full bg-[#1B2A4A] text-white transition-[width] duration-200"
      style={{ width: isExpanded ? 200 : 60 }}
    >
      {/* Logo */}
      <div className="px-3 pt-4 pb-3">
        <div className="flex items-center justify-between">
          <div className={`${isExpanded ? 'opacity-100' : 'opacity-0 pointer-events-none'} transition-opacity duration-150`}>
            <h1 className="font-display text-xl font-bold tracking-wider whitespace-nowrap">LOGIX</h1>
            <p className="text-[10px] tracking-[0.28em] text-[#E8672C] font-medium whitespace-nowrap">CONTROL TOTAL</p>
          </div>
          <button
            onClick={onToggle}
            className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center shrink-0"
            aria-label="Alternar sidebar"
          >
            <LayoutDashboard className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 py-1.5 space-y-0.5">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              [
                'flex items-center gap-2.5 px-3 py-2 text-[13px] rounded-lg transition-colors overflow-hidden',
                isActive
                  ? 'bg-[#243a61] text-white border-l-[3px] border-[#E8672C] font-medium'
                  : 'text-white/70 hover:bg-[#243a61] hover:text-white border-l-[3px] border-transparent',
              ].join(' ')
            }
          >
            <item.icon className="w-4 h-4 shrink-0" />
            {isExpanded && <span className="whitespace-nowrap">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Bottom */}
      <div className="px-4 py-3 border-t border-white/10">
        <div className="flex items-center gap-2 text-white/50 text-xs">
          <Building2 className="w-4 h-4" />
          {isExpanded && (
            <div>
              <p className="uppercase tracking-wider text-[10px]">Centro de Control</p>
              <p className="text-white/80 text-xs">Planta Principal</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <motion.div
      className="hidden lg:block fixed inset-y-0 left-0 z-30"
      onMouseEnter={onExpand}
      onMouseLeave={onCollapse}
      animate={{ width: isExpanded ? 200 : 60 }}
      transition={{ duration: 0.2 }}
    >
      {sidebarContent}
    </motion.div>
  );
}
