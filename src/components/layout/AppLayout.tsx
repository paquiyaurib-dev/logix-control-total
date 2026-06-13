import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

const pageTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/materiales': 'Maestro de Materiales',
  '/ingresos': 'Control de Ingresos',
  '/salidas': 'Control de Salidas',
  '/despachos': 'Despachos Internos',
  '/inventarios': 'Inventarios',
  '/activos': 'Control de Activos',
  '/flota': 'Control de Flota',
  '/reportes': 'Reportes',
  '/alertas': 'Centro de Alertas',
  '/kpis': 'Indicadores KPI',
  '/configuracion': 'Configuración',
};

export default function AppLayout() {
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const location = useLocation();
  const title = pageTitles[location.pathname] || 'Sistema Logístico';
  const isDesktop = typeof window !== 'undefined' ? window.innerWidth >= 1024 : false;

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setSidebarExpanded(false);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="min-h-screen bg-[#F7F8FA]">
      <Sidebar
        isExpanded={sidebarExpanded}
        onToggle={() => setSidebarExpanded((value) => !value)}
        onExpand={() => setSidebarExpanded(true)}
        onCollapse={() => setSidebarExpanded(false)}
      />
      <div
        className="flex flex-col min-h-screen transition-[margin-left] duration-200"
        style={{ marginLeft: isDesktop ? (sidebarExpanded ? 200 : 60) : 0 }}
      >
        <TopBar title={title} onMenuClick={() => setSidebarExpanded((value) => !value)} />
        <main className="flex-1 p-3 lg:p-4 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
