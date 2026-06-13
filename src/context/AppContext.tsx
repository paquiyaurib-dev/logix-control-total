import { createContext, useContext, useEffect, useMemo, useReducer, type ReactNode } from 'react';
import {
  Material,
  Movimiento,
  Alerta,
  Activo,
  Vehiculo,
  Tareo,
  DespachoRecord,
  Proveedor,
  materiales as mockMateriales,
  movimientos as mockMovimientos,
  alertas as mockAlertas,
  activos as mockActivos,
  vehiculos as mockVehiculos,
  tareos as mockTareos,
  despachos as mockDespachos,
  proveedores as mockProveedores,
} from '../data/mockData';

export interface CatalogItem {
  id: string;
  nombre: string;
}

export interface AuditEntry {
  id: string;
  accion: string;
  detalle: string;
  usuario: string;
  fecha: string;
}

export interface AppState {
  materiales: Material[];
  movimientos: Movimiento[];
  alertas: Alerta[];
  activos: Activo[];
  vehiculos: Vehiculo[];
  tareos: Tareo[];
  despachos: DespachoRecord[];
  proveedores: Proveedor[];
  categorias: CatalogItem[];
  unidades: CatalogItem[];
  auditLog: AuditEntry[];
  lastUpdatedAt: number;
}

type AppAction =
  | { type: 'ADD_MOVIMIENTO'; payload: Movimiento }
  | { type: 'ADD_ALERTA'; payload: Alerta }
  | { type: 'MARK_ALERTA_READ'; payload: number }
  | { type: 'RESOLVE_ALERTA'; payload: number }
  | { type: 'ADD_MATERIAL'; payload: Material }
  | { type: 'UPDATE_MATERIAL'; payload: Material }
  | { type: 'ADD_ACTIVO'; payload: Activo }
  | { type: 'UPDATE_ACTIVO'; payload: Activo }
  | { type: 'ADD_TAREO'; payload: Tareo }
  | { type: 'ADD_DESPACHO'; payload: DespachoRecord }
  | { type: 'ADD_AUDIT_LOG'; payload: AuditEntry }
  | { type: 'SET_PROVEEDORES'; payload: Proveedor[] }
  | { type: 'SET_CATEGORIAS'; payload: CatalogItem[] }
  | { type: 'SET_UNIDADES'; payload: CatalogItem[] }
  | { type: 'HYDRATE'; payload: AppState };

const CHANNEL_NAME = 'logix-sync';

const defaultCategorias: CatalogItem[] = [
  { id: 'cat-ferreteria', nombre: 'Ferretería' },
  { id: 'cat-electrico', nombre: 'Eléctrico' },
  { id: 'cat-lubricantes', nombre: 'Lubricantes' },
  { id: 'cat-seguridad', nombre: 'Seguridad' },
  { id: 'cat-herramientas', nombre: 'Herramientas' },
  { id: 'cat-filtros', nombre: 'Filtros' },
];

const defaultUnidades: CatalogItem[] = [
  { id: 'und-und', nombre: 'UND' },
  { id: 'und-mt', nombre: 'MT' },
  { id: 'und-lt', nombre: 'LT' },
  { id: 'und-gl', nombre: 'GL' },
  { id: 'und-kg', nombre: 'KG' },
  { id: 'und-par', nombre: 'PAR' },
  { id: 'und-rol', nombre: 'ROL' },
];

const initialState: AppState = {
  materiales: mockMateriales,
  movimientos: mockMovimientos,
  alertas: mockAlertas,
  activos: mockActivos,
  vehiculos: mockVehiculos,
  tareos: mockTareos,
  despachos: mockDespachos,
  proveedores: mockProveedores,
  categorias: defaultCategorias,
  unidades: defaultUnidades,
  auditLog: [],
  lastUpdatedAt: Date.now(),
};

const STORAGE_KEY = 'logix-app-state';

function stamp(state: Omit<AppState, 'lastUpdatedAt'>): AppState {
  return { ...state, lastUpdatedAt: Date.now() };
}

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'HYDRATE':
      return action.payload.lastUpdatedAt >= state.lastUpdatedAt ? action.payload : state;
    case 'ADD_MOVIMIENTO': {
      const mov = action.payload;
      const updatedMateriales = state.materiales.map((m) => {
        if (m.id === mov.materialId) {
          const delta = mov.tipo === 'ingreso' ? mov.cantidad : -mov.cantidad;
          return { ...m, stockActual: m.stockActual + delta, ultimoMovimiento: mov.fecha };
        }
        return m;
      });
      const newAlertas = [...state.alertas];
      const material = updatedMateriales.find((m) => m.id === mov.materialId);
      if (material && material.stockActual < material.stockMin) {
        newAlertas.push({
          id: Date.now(),
          tipo: 'stock_bajo',
          titulo: `Stock bajo: ${material.descripcion}`,
          descripcion: `Solo quedan ${material.stockActual} ${material.unidad}`,
          materialId: material.id,
          severidad: 'danger',
          fecha: new Date().toISOString().split('T')[0],
          hora: new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }),
          leida: false,
          resuelta: false,
        });
      }
      return stamp({ ...state, movimientos: [...state.movimientos, mov], materiales: updatedMateriales, alertas: newAlertas });
    }
    case 'ADD_ALERTA':
      return stamp({ ...state, alertas: [...state.alertas, action.payload] });
    case 'MARK_ALERTA_READ':
      return stamp({ ...state, alertas: state.alertas.map((a) => a.id === action.payload ? { ...a, leida: true } : a) });
    case 'RESOLVE_ALERTA':
      return stamp({ ...state, alertas: state.alertas.map((a) => a.id === action.payload ? { ...a, resuelta: true, leida: true } : a) });
    case 'ADD_MATERIAL':
      return stamp({ ...state, materiales: [...state.materiales, action.payload] });
    case 'UPDATE_MATERIAL':
      return stamp({ ...state, materiales: state.materiales.map((m) => m.id === action.payload.id ? action.payload : m) });
    case 'ADD_ACTIVO':
      return stamp({ ...state, activos: [...state.activos, action.payload] });
    case 'UPDATE_ACTIVO':
      return stamp({ ...state, activos: state.activos.map((a) => a.id === action.payload.id ? action.payload : a) });
    case 'ADD_TAREO':
      return stamp({ ...state, tareos: [...state.tareos, action.payload] });
    case 'ADD_DESPACHO':
      return stamp({ ...state, despachos: [...state.despachos, action.payload] });
    case 'ADD_AUDIT_LOG':
      return stamp({ ...state, auditLog: [...state.auditLog, action.payload] });
    case 'SET_PROVEEDORES':
      return stamp({ ...state, proveedores: action.payload });
    case 'SET_CATEGORIAS':
      return stamp({ ...state, categorias: action.payload });
    case 'SET_UNIDADES':
      return stamp({ ...state, unidades: action.payload });
    default:
      return state;
  }
}

interface AppContextType {
  state: AppState;
  addIngreso: (mov: Partial<Movimiento>) => void;
  addSalida: (mov: Partial<Movimiento>) => boolean;
  addDespacho: (d: Partial<DespachoRecord>) => void;
  addMaterial: (m: Omit<Material, 'id'>) => void;
  updateMaterial: (m: Material) => void;
  addActivo: (a: Omit<Activo, 'id'>) => void;
  updateActivo: (a: Activo) => void;
  addTareo: (t: Omit<Tareo, 'id'>) => void;
  markAlertaRead: (id: number) => void;
  resolveAlerta: (id: number) => void;
  saveProveedores: (proveedores: Proveedor[]) => void;
  saveCategorias: (categorias: CatalogItem[]) => void;
  saveUnidades: (unidades: CatalogItem[]) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(
    appReducer,
    initialState,
    (baseState) => {
      if (typeof window === 'undefined') return baseState;
      try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (!raw) return baseState;
        const parsed = JSON.parse(raw) as Partial<AppState>;
        return {
          ...baseState,
          ...parsed,
          proveedores: parsed.proveedores ?? baseState.proveedores,
          categorias: parsed.categorias ?? baseState.categorias,
          unidades: parsed.unidades ?? baseState.unidades,
          auditLog: parsed.auditLog ?? baseState.auditLog,
          lastUpdatedAt: parsed.lastUpdatedAt ?? baseState.lastUpdatedAt,
        };
      } catch {
        return baseState;
      }
    }
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    if ('BroadcastChannel' in window) {
      const channel = new BroadcastChannel(CHANNEL_NAME);
      channel.postMessage(state);
      channel.close();
    }
  }, [state]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleStorage = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY || !event.newValue) return;
      try {
        dispatch({ type: 'HYDRATE', payload: JSON.parse(event.newValue) as AppState });
      } catch {
        return;
      }
    };
    window.addEventListener('storage', handleStorage);

    let channel: BroadcastChannel | null = null;
    if ('BroadcastChannel' in window) {
      channel = new BroadcastChannel(CHANNEL_NAME);
      channel.onmessage = (event) => {
        dispatch({ type: 'HYDRATE', payload: event.data as AppState });
      };
    }

    return () => {
      window.removeEventListener('storage', handleStorage);
      channel?.close();
    };
  }, []);

  const addIngreso = (mov: Partial<Movimiento>) => {
    const newMov: Movimiento = {
      id: Date.now(),
      tipo: 'ingreso',
      fecha: new Date().toISOString().split('T')[0],
      materialId: 0,
      materialCodigo: '',
      materialDescripcion: '',
      cantidad: 0,
      documento: '',
      bodeguero: '',
      supervisor: '',
      observaciones: '',
      usuario: '',
      ...mov,
    };
    dispatch({ type: 'ADD_MOVIMIENTO', payload: newMov });
    dispatch({ type: 'ADD_AUDIT_LOG', payload: { id: `a-${Date.now()}`, accion: 'INGRESO', detalle: `Ingreso ${newMov.cantidad} uds de ${newMov.materialCodigo}`, usuario: newMov.usuario, fecha: newMov.fecha } });
  };

  const addSalida = (mov: Partial<Movimiento>): boolean => {
    const material = state.materiales.find((m) => m.id === mov.materialId);
    if (!material || material.stockActual < (mov.cantidad || 0)) return false;
    const newMov: Movimiento = {
      id: Date.now(),
      tipo: 'salida',
      fecha: new Date().toISOString().split('T')[0],
      materialId: 0,
      materialCodigo: '',
      materialDescripcion: '',
      cantidad: 0,
      documento: '',
      bodeguero: '',
      supervisor: '',
      observaciones: '',
      usuario: '',
      ...mov,
    };
    dispatch({ type: 'ADD_MOVIMIENTO', payload: newMov });
    dispatch({ type: 'ADD_AUDIT_LOG', payload: { id: `a-${Date.now()}`, accion: 'SALIDA', detalle: `Salida ${newMov.cantidad} uds de ${newMov.materialCodigo}`, usuario: newMov.usuario, fecha: newMov.fecha } });
    return true;
  };

  const addDespacho = (d: Partial<DespachoRecord>) => {
    const nd: DespachoRecord = { id: Date.now(), materialId: 0, materialCodigo: '', materialDescripcion: '', cantidad: 0, labor: '', supervisor: '', fecha: new Date().toISOString().split('T')[0], observaciones: '', ...d };
    dispatch({ type: 'ADD_DESPACHO', payload: nd });
  };

  const addMaterial = (m: Omit<Material, 'id'>) => {
    dispatch({ type: 'ADD_MATERIAL', payload: { ...m, id: Date.now() } as Material });
  };

  const updateMaterial = (m: Material) => dispatch({ type: 'UPDATE_MATERIAL', payload: m });

  const addActivo = (a: Omit<Activo, 'id'>) => {
    dispatch({ type: 'ADD_ACTIVO', payload: { ...a, id: Date.now() } as Activo });
  };

  const updateActivo = (a: Activo) => dispatch({ type: 'UPDATE_ACTIVO', payload: a });

  const addTareo = (t: Omit<Tareo, 'id'>) => {
    dispatch({ type: 'ADD_TAREO', payload: { ...t, id: Date.now() } as Tareo });
  };

  const markAlertaRead = (id: number) => dispatch({ type: 'MARK_ALERTA_READ', payload: id });
  const resolveAlerta = (id: number) => {
    dispatch({ type: 'RESOLVE_ALERTA', payload: id });
    dispatch({ type: 'ADD_AUDIT_LOG', payload: { id: `a-${Date.now()}`, accion: 'RESOLVER_ALERTA', detalle: `Alerta ${id} resuelta`, usuario: 'Sistema', fecha: new Date().toISOString() } });
  };

  const saveProveedores = (proveedores: Proveedor[]) => dispatch({ type: 'SET_PROVEEDORES', payload: proveedores });
  const saveCategorias = (categorias: CatalogItem[]) => dispatch({ type: 'SET_CATEGORIAS', payload: categorias });
  const saveUnidades = (unidades: CatalogItem[]) => dispatch({ type: 'SET_UNIDADES', payload: unidades });

  const value = useMemo(() => ({
    state,
    addIngreso,
    addSalida,
    addDespacho,
    addMaterial,
    updateMaterial,
    addActivo,
    updateActivo,
    addTareo,
    markAlertaRead,
    resolveAlerta,
    saveProveedores,
    saveCategorias,
    saveUnidades,
  }), [state]);

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}
