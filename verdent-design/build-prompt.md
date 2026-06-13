# Build Instructions — Sistema de Control Logístico Integral

## Chosen Design Direction
The user selected **comp-1-industrial-precision.png** (Industrial Precision style):
- Background: light cool gray #F7F8FA
- Primary ink: deep navy #1B2A4A
- Accent: burnt orange #E8672C
- Style: clean, structured, engineering-grade dashboard
- Reference image: C:/Users/paqui/Projects/sistema-logistico/verdent-design/stage1/comp-1-industrial-precision.png

## Your Task
Build a complete, production-quality logistics control system web application that faithfully restores the chosen design direction. This is a full multi-module system — build ALL modules listed below.

## Tech Stack
Use Vite + React + TypeScript + Tailwind v4. 

**Scaffold using the bundled template:**
```bash
rsync -a ~/.verdent/skills/design-then-build/templates/vite-react-tailwind/ C:/Users/paqui/Projects/sistema-logistico/
cd C:/Users/paqui/Projects/sistema-logistico && npm install
```

If rsync is not available on Windows, use this fallback:
```bash
cd C:/Users/paqui/Projects/sistema-logistico
npm create vite@latest . -- --template react-ts --force
npm install
npm install -D tailwindcss @tailwindcss/vite
npm install framer-motion react-router-dom recharts lucide-react date-fns xlsx
```

## Design Tokens (from chosen comp)
```css
@theme {
  --color-bg: #F7F8FA;
  --color-sidebar: #1B2A4A;
  --color-sidebar-hover: #243a61;
  --color-sidebar-active: #E8672C;
  --color-navy: #1B2A4A;
  --color-orange: #E8672C;
  --color-orange-light: #FFF0E8;
  --color-text-primary: #1B2A4A;
  --color-text-secondary: #6B7A99;
  --color-border: #E2E6EF;
  --color-card: #FFFFFF;
  --color-success: #22C55E;
  --color-warning: #F59E0B;
  --color-danger: #EF4444;
  --font-display: 'DIN Pro', 'Barlow', 'Inter', sans-serif;
  --font-body: 'Inter', sans-serif;
}
```

## Application Structure

Build a full SPA with React Router. All modules must be accessible from the sidebar navigation.

### Layout (AppLayout.tsx)
- Fixed left sidebar (240px wide on desktop, collapsible on mobile)
- Sidebar: dark navy #1B2A4A background, white text, orange active indicator
- Logo at top: "LOGIX" wordmark with "CONTROL TOTAL" subtitle in orange
- Navigation items with icons (use lucide-react icons):
  - Dashboard (LayoutDashboard)
  - Almacén (Warehouse)
  - Materiales (Package)
  - Ingresos (PackagePlus)
  - Salidas (PackageMinus)
  - Despachos (Truck)
  - Inventarios (ClipboardList)
  - Activos (Monitor)
  - Flota (Car)
  - Reportes (BarChart3)
  - Alertas (Bell)
  - Configuración (Settings)
- Bottom of sidebar: "CENTRO DE CONTROL / Planta Principal" with user plant selector
- Top bar: hamburger menu (mobile), page title, global search bar, notification bell with badge, document icon with badge, user avatar + name + role
- Main content area: gray #F7F8FA background, scrollable

### Module 1: Dashboard (/)
KPI Cards row (4 cards):
- STOCK TOTAL: large number (18,732), subtitle "Unidades totales", trend arrow +8.4% vs mes anterior, navy border-left accent
- STOCK BAJO: large orange number (312), subtitle "Materiales", trend arrow +15.6% vs semana anterior, orange border-left accent  
- INGRESOS DEL DÍA: large number (1,245), subtitle "Unidades", trend +12.3% vs ayer
- SALIDAS DEL DÍA: large number (987), subtitle "Unidades", trend +9.7% vs ayer

Below cards, two-column layout:
Left (wider): "FLUJO DE MATERIALES (MENSUAL)" chart
- Area/line chart using recharts with two lines: Ingresos (navy) and Salidas (orange)
- X-axis: JUN, JUL, AGO, SEP, OCT, NOV, DIC, ENE, FEB, MAR, ABR, MAY
- Dropdown filter "Últimos 12 meses"
- Below chart: 4 summary stats (Total Ingresos 17,842 / Total Salidas 13,756 / Promedio Mensual Ingresos 1,487 / Promedio Mensual Salidas 1,146)

Right (narrower): "ALERTAS RECIENTES" panel
- List of 5 alerts with icon, title, subtitle, time, chevron:
  1. Stock bajo - Tornillo Hexagonal M12 x 50 - 09:31
  2. Mantenimiento pendiente - Camión FLT-045 - 08:47
  3. Orden retrasada - Orden #OC-1528 - 08:15
  4. Consumo elevado - Unidad FLT-032 - 07:52
  5. Recepción incompleta - Orden #RC-0934 - 07:21
- "IR AL CENTRO DE ALERTAS" orange button at bottom

### Module 2: Maestro de Materiales (/materiales)
Full CRUD table with:
- Search bar + filters (categoría, familia, estado)
- "Nuevo Material" button (orange)
- Table columns: Código, Descripción, Categoría, Familia, Unidad, Marca, Stock Mín, Stock Máx, Stock Actual, Ubicación, Estado (badge), Acciones
- Modal form for create/edit with all fields
- Sample data: 15+ materials (tornillos, cables, filtros, aceites, herramientas, etc.)
- Status badges: Activo (green), Inactivo (gray)
- Pagination

### Module 3: Control de Ingresos (/ingresos)
- Form at top: Fecha, N° Documento, Clase de Movimiento (select), Proveedor, Código Producto (with autocomplete), Descripción (auto-fill), Cantidad, Observaciones
- "Registrar Ingreso" button
- Table below showing recent ingresos with columns: Fecha, N° Doc, Clase, Proveedor, Código, Descripción, Cantidad, Observaciones, Usuario
- Auto-updates stock on submit (local state)

### Module 4: Control de Salidas (/salidas)
- Form: Fecha, Código Producto (autocomplete), Descripción (auto), Cantidad, N° Vale, Zona de Destino (select), Bodeguero, Supervisor, Observaciones
- "Registrar Salida" button
- Table of recent salidas
- Validates stock availability before allowing salida

### Module 5: Despachos Internos (/despachos)
- Form: Código Material (autocomplete), Descripción (auto), Cantidad Entregada, Labor/Actividad, Supervisor, Fecha, Observaciones
- Table with historial de consumos por labor
- Filter by labor/actividad

### Module 6: Inventarios (/inventarios)
Tabs:
- Inventario Físico: table with Código, Descripción, Stock Sistema, Stock Físico, Diferencia, Estado
- Ajustes: form to register inventory adjustments
- Kardex por Material: select material → show full movement history table
- Kardex por Familia: select familia → aggregated movements
- Historial: complete movement log with filters

### Module 7: Activos (/activos)
- Cards/table view toggle
- Asset categories: Equipos, Herramientas, Radios, Computadoras, Impresoras, Vehículos
- Table columns: Código Patrimonial, Serie, Marca, Modelo, Categoría, Ubicación, Responsable, Estado, Fecha Asignación, Acciones
- Status badges: Operativo (green), En Mantenimiento (yellow), Dado de Baja (red)
- Modal for create/edit/transfer
- Transfer history per asset

### Module 8: Control de Flota (/flota)
- Vehicle cards showing: placa, tipo (Camioneta/Camión/Equipo Móvil), marca/modelo, operador, estado
- Daily tareo form: Vehículo, Fecha, Operador, Supervisor, Km Inicial, Km Final, Horómetro Inicial, Horómetro Final, Combustible (L), Actividad, Observaciones
- Maintenance alerts
- Table: historial de tareos por unidad

### Module 9: Reportes (/reportes)
- Report cards grid, each with icon, title, description, "Generar" button
- Reports available:
  1. Stock Actual
  2. Ingresos por período
  3. Salidas por período
  4. Consumos por Zona
  5. Consumos por Supervisor
  6. Consumos por Labor
  7. Kardex Completo
  8. Materiales Críticos
  9. Materiales con Stock Bajo
  10. Historial de Movimientos
- Date range picker for each report
- "Exportar a Excel" button using xlsx library
- Preview table before export

### Module 10: Alertas (/alertas)
- Alert list with severity levels (danger/warning/info)
- Filter by type: Stock Bajo, Sin Movimiento, Críticos, Mantenimiento
- Mark as read / resolve actions
- Alert history

### Module 11: KPIs (/kpis) — accessible from Dashboard or sidebar
- KPI cards: Exactitud de Inventario %, Rotación de Materiales, Consumo Mensual, Activos Operativos %, Disponibilidad Vehículos %, Materiales Críticos count, Materiales Mayor Consumo
- Charts for trends

### Module 12: Login (/login)
- Full-page login form
- Logo centered
- Username + password fields
- "Iniciar Sesión" button (orange)
- Role-based access (store current user in context)
- Demo users: admin/admin123 (Administrador), supervisor/sup123 (Supervisor), bodeguero/bod123 (Bodeguero), consulta/con123 (Consulta)

### Module 13: Configuración (/configuracion)
- User management table (admin only)
- Profile settings
- System settings

## State Management
Use React Context + useReducer for:
- Auth context (current user, role, permissions)
- Materials/stock data (shared across modules)
- Alerts (auto-generated when stock < 5)
- Audit log (track all user actions)

## Mock Data
Create realistic mock data in src/data/:
- 30+ materials with realistic logistics names (Tornillo Hexagonal M12x50, Cable Eléctrico 2.5mm, Filtro de Aceite, Aceite Hidráulico 46, Guante de Seguridad, etc.)
- 10+ proveedores
- 50+ movement records (ingresos/salidas)
- 15+ activos
- 8+ vehículos
- 20+ alerts

## Auto-Alert Logic
Implement in context:
- When stock < 5 units → generate "Stock bajo" alert
- When material has no movement in 30 days → "Sin movimiento" alert
- Critical materials (defined by stock_min) → "Material crítico" alert

## Excel Export
Use the xlsx library to export any table to .xlsx with:
- Proper headers
- Data formatted for pivot tables (flat structure, no merged cells)
- Sheet named after the report type

## Responsive Design
- Mobile: sidebar collapses to hamburger menu, cards stack vertically
- Tablet: sidebar can be toggled, 2-column card grid
- Desktop: full sidebar visible, 4-column KPI cards

## Animation
Use framer-motion for:
- Page transitions (fade + slide)
- KPI card number count-up animation on mount
- Sidebar collapse/expand
- Modal open/close
- Alert notifications slide in from right

## Important Implementation Notes
1. Start the dev server with `npm run dev` using bash_background after installing dependencies
2. Open first preview as soon as the dashboard renders correctly
3. All text must match the comp exactly (Spanish, logistics terminology)
4. Use lucide-react for ALL icons — no emoji
5. Colors must come from the design tokens above — no Tailwind defaults
6. The sidebar must always show the LOGIX logo with the orange "CONTROL TOTAL" text
7. Active nav item has orange left border + slightly lighter navy background
8. KPI numbers use a large bold condensed font for impact
9. Charts use recharts library with navy + orange color scheme
10. Tables have alternating row shading, hover states, and action buttons

## File Structure
```
src/
  components/
    layout/
      AppLayout.tsx
      Sidebar.tsx
      TopBar.tsx
    ui/
      KPICard.tsx
      DataTable.tsx
      Modal.tsx
      Badge.tsx
      Button.tsx
      SearchBar.tsx
      DatePicker.tsx
  pages/
    Login.tsx
    Dashboard.tsx
    Materiales.tsx
    Ingresos.tsx
    Salidas.tsx
    Despachos.tsx
    Inventarios.tsx
    Activos.tsx
    Flota.tsx
    Reportes.tsx
    Alertas.tsx
    KPIs.tsx
    Configuracion.tsx
  context/
    AuthContext.tsx
    AppContext.tsx
  data/
    mockData.ts
  hooks/
    useAlerts.ts
    useExport.ts
  icons/
    (SVG icon components)
  App.tsx
  main.tsx
  index.css
```

## Completion Criteria
1. All 13 modules/pages are implemented and navigable
2. Dashboard matches the comp-1-industrial-precision.png design exactly
3. All CRUD operations work with local state
4. Excel export works for at least 3 report types
5. Login/auth flow works with the 4 demo users
6. Responsive at 360px, 768px, 1440px
7. No TypeScript errors (run tsc --noEmit)
8. Dev server runs without errors
9. Open the running app in the browser for the user to preview

## After First Preview
Report the localhost URL and ask if the user wants to continue with additional pages or backend integration.
