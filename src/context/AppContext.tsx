import { createContext, useContext, useEffect, useMemo, useReducer, useRef, type ReactNode } from 'react';
import {
  Material,
  Movimiento,
  Alerta,
  Activo,
  Vehiculo,
  Tareo,
  DespachoRecord,
  Proveedor,
  Personal,
  materiales as mockMateriales,
  movimientos as mockMovimientos,
  alertas as mockAlertas,
  activos as mockActivos,
  vehiculos as mockVehiculos,
  tareos as mockTareos,
  despachos as mockDespachos,
  proveedores as mockProveedores,
  personal as mockPersonal,
} from '../data/mockData';
import {
  addDespacho as addDespachoRemote,
  addMovimiento as addMovimientoRemote,
  addTareo as addTareoRemote,
  appendAuditEntry,
  deleteMovimiento as deleteMovimientoRemote,
  loadAppData,
  replaceCatalog,
  replaceProveedores,
  upsertActivo,
  upsertAlerta,
  upsertMaterial,
  upsertPersonal,
} from '../lib/database';

export interface CatalogItem {
  id: string;
  nombre: string;
}

export interface MovementClassItem {
  id: string;
  value: string;
  label: string;
}

export interface WarehouseInventory {
  bodegaId: string;
  stockActual: number;
}

export interface MaterialWithWarehouseInventory extends Material {
  inventarioPorBodega: WarehouseInventory[];
}

export interface AuditEntry {
  id: string;
  accion: string;
  detalle: string;
  usuario: string;
  fecha: string;
}

export interface AppState {
  materiales: MaterialWithWarehouseInventory[];
  movimientos: Movimiento[];
  alertas: Alerta[];
  activos: Activo[];
  vehiculos: Vehiculo[];
  tareos: Tareo[];
  despachos: DespachoRecord[];
  proveedores: Proveedor[];
  categorias: CatalogItem[];
  unidades: CatalogItem[];
  bodegas: CatalogItem[];
  zonasDestino: CatalogItem[];
  laboresActividad: CatalogItem[];
  supervisores: CatalogItem[];
  equipos: CatalogItem[];
  personal: Personal[];
  clasesMovimiento: MovementClassItem[];
  auditLog: AuditEntry[];
  lastUpdatedAt: number;
}

type AppAction =
  | { type: 'ADD_MOVIMIENTO'; payload: Movimiento }
  | { type: 'REMOVE_MOVIMIENTO'; payload: number }
  | { type: 'ADD_ALERTA'; payload: Alerta }
  | { type: 'MARK_ALERTA_READ'; payload: number }
  | { type: 'RESOLVE_ALERTA'; payload: number }
  | { type: 'ADD_MATERIAL'; payload: MaterialWithWarehouseInventory }
  | { type: 'UPDATE_MATERIAL'; payload: MaterialWithWarehouseInventory }
  | { type: 'ADD_ACTIVO'; payload: Activo }
  | { type: 'UPDATE_ACTIVO'; payload: Activo }
  | { type: 'ADD_TAREO'; payload: Tareo }
  | { type: 'ADD_DESPACHO'; payload: DespachoRecord }
  | { type: 'ADD_AUDIT_LOG'; payload: AuditEntry }
  | { type: 'SET_PROVEEDORES'; payload: Proveedor[] }
  | { type: 'SET_CATEGORIAS'; payload: CatalogItem[] }
  | { type: 'SET_UNIDADES'; payload: CatalogItem[] }
  | { type: 'SET_BODEGAS'; payload: CatalogItem[] }
  | { type: 'SET_ZONAS_DESTINO'; payload: CatalogItem[] }
  | { type: 'SET_CLASES_MOVIMIENTO'; payload: MovementClassItem[] }
  | { type: 'SET_LABORES_ACTIVIDAD'; payload: CatalogItem[] }
  | { type: 'SET_SUPERVISORES'; payload: CatalogItem[] }
  | { type: 'SET_EQUIPOS'; payload: CatalogItem[] }
  | { type: 'SET_PERSONAL'; payload: Personal[] }
  | { type: 'HYDRATE'; payload: AppState };

const CHANNEL_NAME = 'logix-sync';
const STORAGE_KEY = 'logix-app-state';

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

const defaultBodegas: CatalogItem[] = [
  { id: 'bod-principal', nombre: 'Almacén Principal' },
  { id: 'bod-planta-1', nombre: 'Planta 1' },
  { id: 'bod-planta-2', nombre: 'Planta 2' },
  { id: 'bod-taller', nombre: 'Taller Central' },
];

const defaultZonasDestino: CatalogItem[] = [
  { id: 'zona-norte', nombre: 'Zona Norte' },
  { id: 'zona-sur', nombre: 'Zona Sur' },
  { id: 'zona-este', nombre: 'Zona Este' },
  { id: 'zona-oeste', nombre: 'Zona Oeste' },
  { id: 'zona-taller', nombre: 'Taller Central' },
  { id: 'zona-almacen', nombre: 'Almacén Principal' },
  { id: 'zona-planta-1', nombre: 'Planta 1' },
  { id: 'zona-planta-2', nombre: 'Planta 2' },
];

const defaultClasesMovimiento: MovementClassItem[] = [
  { id: 'mov-101', value: '101', label: '101-Ingreso por compra' },
  { id: 'mov-102', value: '102', label: '102-Ingreso por devolución' },
  { id: 'mov-103', value: '103', label: '103-Ingreso por transferencia' },
  { id: 'mov-201', value: '201', label: '201-Salida por consumo' },
  { id: 'mov-202', value: '202', label: '202-Salida por préstamo' },
  { id: 'mov-203', value: '203', label: '203-Salida por transferencia' },
  { id: 'mov-301', value: '301', label: '301-Ajuste positivo' },
  { id: 'mov-302', value: '302', label: '302-Ajuste negativo' },
];

const defaultLaboresActividad: CatalogItem[] = [
  { id: 'lab-prev', nombre: 'Mantenimiento Preventivo' },
  { id: 'lab-corr', nombre: 'Mantenimiento Correctivo' },
  { id: 'lab-mina', nombre: 'Operación Mina' },
  { id: 'lab-cons', nombre: 'Construcción' },
  { id: 'lab-limp', nombre: 'Limpieza' },
  { id: 'lab-elec', nombre: 'Instalación Eléctrica' },
  { id: 'lab-sold', nombre: 'Soldadura' },
  { id: 'lab-pint', nombre: 'Pintura' },
];

const defaultSupervisores: CatalogItem[] = [
  { id: 'sup-cm', nombre: 'Carlos Mendoza' },
  { id: 'sup-at', nombre: 'Ana Torres' },
  { id: 'sup-jp', nombre: 'Juan Pérez' },
  { id: 'sup-ml', nombre: 'María López' },
];

function buildWarehouseInventory(stockActual: number, bodegas: CatalogItem[]): WarehouseInventory[] {
  if (bodegas.length === 0) {
    return [];
  }
  return bodegas.map((bodega, index) => ({
    bodegaId: bodega.id,
    stockActual: index === 0 ? stockActual : 0,
  }));
}

function normalizeMaterial(
  material: Material,
  bodegas: CatalogItem[],
): MaterialWithWarehouseInventory {
  const existing = (material as MaterialWithWarehouseInventory).inventarioPorBodega;
  if (existing && existing.length > 0) {
    const merged = bodegas.map((bodega, index) => {
      const found = existing.find((item) => item.bodegaId === bodega.id);
      return found ?? { bodegaId: bodega.id, stockActual: index === 0 ? material.stockActual : 0 };
    });
    return { ...material, inventarioPorBodega: merged };
  }
  return {
    ...material,
    inventarioPorBodega: buildWarehouseInventory(material.stockActual, bodegas),
  };
}

function normalizeMateriales(
  materiales: Material[],
  bodegas: CatalogItem[],
): MaterialWithWarehouseInventory[] {
  return materiales.map((material) => normalizeMaterial(material, bodegas));
}

const initialState: AppState = {
  materiales: normalizeMateriales(mockMateriales, defaultBodegas),
  movimientos: mockMovimientos,
  alertas: mockAlertas,
  activos: mockActivos,
  vehiculos: mockVehiculos,
  tareos: mockTareos,
  despachos: mockDespachos,
  proveedores: mockProveedores,
  categorias: defaultCategorias,
  unidades: defaultUnidades,
  bodegas: defaultBodegas,
  zonasDestino: defaultZonasDestino,
  laboresActividad: defaultLaboresActividad,
  supervisores: defaultSupervisores,
  equipos: [],
  personal: mockPersonal,
  clasesMovimiento: defaultClasesMovimiento,
  auditLog: [],
  lastUpdatedAt: Date.now(),
};

function stamp(state: Omit<AppState, 'lastUpdatedAt'>): AppState {
  return { ...state, lastUpdatedAt: Date.now() };
}

function syncMaterialesWithBodegas(
  materiales: MaterialWithWarehouseInventory[],
  bodegas: CatalogItem[],
): MaterialWithWarehouseInventory[] {
  return materiales.map((material) => normalizeMaterial(material, bodegas));
}

function applyMovementToMaterial(
  material: MaterialWithWarehouseInventory,
  mov: Movimiento,
): MaterialWithWarehouseInventory {
  const delta =
    mov.tipo === 'ingreso' ? mov.cantidad : mov.tipo === 'salida' ? -mov.cantidad : 0;
  const nextStock = Math.max(0, material.stockActual + delta);
  const inventarioPorBodega = material.inventarioPorBodega.map((item, index) => {
    if (index !== 0) {
      return item;
    }
    return {
      ...item,
      stockActual: Math.max(0, item.stockActual + delta),
    };
  });
  return {
    ...material,
    stockActual: nextStock,
    ultimoMovimiento: mov.fecha,
    inventarioPorBodega,
  };
}

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'HYDRATE':
      return action.payload.lastUpdatedAt >= state.lastUpdatedAt ? action.payload : state;
    case 'ADD_MOVIMIENTO': {
      const mov = action.payload;
      const updatedMateriales = state.materiales.map((material) => {
        if (material.id !== mov.materialId) {
          return material;
        }
        return applyMovementToMaterial(material, mov);
      });
      const newAlertas = [...state.alertas];
      const material = updatedMateriales.find((item) => item.id === mov.materialId);
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
      return stamp({
        ...state,
        movimientos: [...state.movimientos, mov],
        materiales: updatedMateriales,
        alertas: newAlertas,
      });
    }
    case 'REMOVE_MOVIMIENTO': {
      const movToRemove = state.movimientos.find((m) => m.id === action.payload);
      let revertedMateriales = state.materiales;
      if (movToRemove) {
        revertedMateriales = state.materiales.map((material) => {
          if (material.id !== movToRemove.materialId) return material;
          const delta = movToRemove.tipo === 'ingreso' ? -movToRemove.cantidad : movToRemove.cantidad;
          return { ...material, stockActual: Math.max(0, material.stockActual + delta) };
        });
      }
      return stamp({
        ...state,
        movimientos: state.movimientos.filter((m) => m.id !== action.payload),
        materiales: revertedMateriales,
      });
    }
    case 'ADD_ALERTA':
      return stamp({ ...state, alertas: [...state.alertas, action.payload] });
    case 'MARK_ALERTA_READ':
      return stamp({
        ...state,
        alertas: state.alertas.map((alerta) =>
          alerta.id === action.payload ? { ...alerta, leida: true } : alerta
        ),
      });
    case 'RESOLVE_ALERTA':
      return stamp({
        ...state,
        alertas: state.alertas.map((alerta) =>
          alerta.id === action.payload ? { ...alerta, resuelta: true, leida: true } : alerta
        ),
      });
    case 'ADD_MATERIAL':
      return stamp({ ...state, materiales: [...state.materiales, normalizeMaterial(action.payload, state.bodegas)] });
    case 'UPDATE_MATERIAL':
      return stamp({
        ...state,
        materiales: state.materiales.map((material) =>
          material.id === action.payload.id ? normalizeMaterial(action.payload, state.bodegas) : material
        ),
      });
    case 'ADD_ACTIVO':
      return stamp({ ...state, activos: [...state.activos, action.payload] });
    case 'UPDATE_ACTIVO':
      return stamp({
        ...state,
        activos: state.activos.map((activo) =>
          activo.id === action.payload.id ? action.payload : activo
        ),
      });
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
    case 'SET_BODEGAS':
      return stamp({
        ...state,
        bodegas: action.payload,
        materiales: syncMaterialesWithBodegas(state.materiales, action.payload),
      });
    case 'SET_ZONAS_DESTINO':
      return stamp({ ...state, zonasDestino: action.payload });
    case 'SET_CLASES_MOVIMIENTO':
      return stamp({ ...state, clasesMovimiento: action.payload });
    case 'SET_LABORES_ACTIVIDAD':
      return stamp({ ...state, laboresActividad: action.payload });
    case 'SET_SUPERVISORES':
      return stamp({ ...state, supervisores: action.payload });
    case 'SET_EQUIPOS':
      return stamp({ ...state, equipos: action.payload });
    case 'SET_PERSONAL':
      return stamp({ ...state, personal: action.payload });
    default:
      return state;
  }
}

interface AppContextType {
  state: AppState;
  addIngreso: (mov: Partial<Movimiento>) => Promise<void>;
  addSalida: (mov: Partial<Movimiento>) => Promise<boolean>;
  removeMovimiento: (movId: number) => Promise<void>;
  addDespacho: (d: Partial<DespachoRecord>) => Promise<void>;
  addMaterial: (m: Omit<MaterialWithWarehouseInventory, 'id' | 'inventarioPorBodega'>) => Promise<void>;
  updateMaterial: (m: MaterialWithWarehouseInventory) => Promise<void>;
  addActivo: (a: Omit<Activo, 'id'>) => Promise<void>;
  updateActivo: (a: Activo) => Promise<void>;
  addTareo: (t: Omit<Tareo, 'id'>) => Promise<void>;
  markAlertaRead: (id: number) => Promise<void>;
  resolveAlerta: (id: number) => Promise<void>;
  saveProveedores: (proveedores: Proveedor[]) => Promise<void>;
  saveCategorias: (categorias: CatalogItem[]) => Promise<void>;
  saveUnidades: (unidades: CatalogItem[]) => Promise<void>;
  saveBodegas: (bodegas: CatalogItem[]) => Promise<void>;
  saveZonasDestino: (zonasDestino: CatalogItem[]) => Promise<void>;
  saveClasesMovimiento: (clasesMovimiento: MovementClassItem[]) => Promise<void>;
  saveLaboresActividad: (laboresActividad: CatalogItem[]) => Promise<void>;
  saveSupervisores: (supervisores: CatalogItem[]) => Promise<void>;
  saveEquipos: (equipos: CatalogItem[]) => Promise<void>;
  addPersonal: (p: Personal) => Promise<void>;
  savePersonal: (personal: Personal[]) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const remoteLoadedRef = useRef(false);
  const [state, dispatch] = useReducer(
    appReducer,
    initialState,
    (baseState) => {
      if (typeof window === 'undefined') {
        return baseState;
      }
      try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (!raw) {
          return baseState;
        }
        const parsed = JSON.parse(raw) as Partial<AppState>;
        const bodegas = parsed.bodegas ?? baseState.bodegas;
        return {
          ...baseState,
          ...parsed,
          materiales: normalizeMateriales(parsed.materiales ?? baseState.materiales, bodegas),
          proveedores: parsed.proveedores ?? baseState.proveedores,
          categorias: parsed.categorias ?? baseState.categorias,
          unidades: parsed.unidades ?? baseState.unidades,
          bodegas,
          zonasDestino: parsed.zonasDestino ?? baseState.zonasDestino,
          laboresActividad: parsed.laboresActividad ?? baseState.laboresActividad,
          supervisores: parsed.supervisores ?? baseState.supervisores,
          equipos: parsed.equipos ?? baseState.equipos,
          personal: parsed.personal ?? baseState.personal,
          clasesMovimiento: parsed.clasesMovimiento ?? baseState.clasesMovimiento,
          auditLog: parsed.auditLog ?? baseState.auditLog,
          lastUpdatedAt: parsed.lastUpdatedAt ?? baseState.lastUpdatedAt,
        };
      } catch {
        return baseState;
      }
    }
  );

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    if ('BroadcastChannel' in window) {
      const channel = new BroadcastChannel(CHANNEL_NAME);
      channel.postMessage(state);
      channel.close();
    }
  }, [state]);

  useEffect(() => {
    if (typeof window === 'undefined' || remoteLoadedRef.current) {
      return;
    }

    const hydrateFromSupabase = async () => {
      try {
        const remoteState = await loadAppData(initialState);
        dispatch({ type: 'HYDRATE', payload: remoteState });
      } catch {
        return;
      } finally {
        remoteLoadedRef.current = true;
      }
    };

    void hydrateFromSupabase();
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    const handleStorage = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY || !event.newValue) {
        return;
      }
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

  const addIngreso = async (mov: Partial<Movimiento>) => {
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
    const materialBeforeUpdate = state.materiales.find((m) => m.id === newMov.materialId);
    dispatch({ type: 'ADD_MOVIMIENTO', payload: newMov });
    const auditEntry = {
      id: `a-${Date.now()}`,
      accion: 'INGRESO',
      detalle: `Ingreso ${newMov.cantidad} uds de ${newMov.materialCodigo}`,
      usuario: newMov.usuario,
      fecha: newMov.fecha,
    };
    dispatch({ type: 'ADD_AUDIT_LOG', payload: auditEntry });
    try {
      await addMovimientoRemote(newMov);
      if (materialBeforeUpdate) {
        const updatedMaterial = applyMovementToMaterial(materialBeforeUpdate, newMov);
        await upsertMaterial(updatedMaterial);
      }
      await appendAuditEntry(auditEntry);
    } catch {
      return;
    }
  };

  const addSalida = async (mov: Partial<Movimiento>): Promise<boolean> => {
    const material = state.materiales.find((item) => item.id === mov.materialId);
    if (!material || material.stockActual < (mov.cantidad || 0)) {
      return false;
    }
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
    const materialBeforeSalida = state.materiales.find((m) => m.id === newMov.materialId);
    dispatch({ type: 'ADD_MOVIMIENTO', payload: newMov });
    const auditEntry = {
      id: `a-${Date.now()}`,
      accion: 'SALIDA',
      detalle: `Salida ${newMov.cantidad} uds de ${newMov.materialCodigo}`,
      usuario: newMov.usuario,
      fecha: newMov.fecha,
    };
    dispatch({ type: 'ADD_AUDIT_LOG', payload: auditEntry });
    try {
      await addMovimientoRemote(newMov);
      if (materialBeforeSalida) {
        const updatedMaterial = applyMovementToMaterial(materialBeforeSalida, newMov);
        await upsertMaterial(updatedMaterial);
      }
      await appendAuditEntry(auditEntry);
    } catch {
      return true;
    }
    return true;
  };

  const removeMovimiento = async (movId: number) => {
    const mov = state.movimientos.find((m) => m.id === movId);
    dispatch({ type: 'REMOVE_MOVIMIENTO', payload: movId });
    try {
      await deleteMovimientoRemote(movId);
      if (mov) {
        const material = state.materiales.find((m) => m.id === mov.materialId);
        if (material) {
          const delta = mov.tipo === 'ingreso' ? -mov.cantidad : mov.cantidad;
          const updatedMaterial = {
            ...material,
            stockActual: Math.max(0, material.stockActual + delta),
          };
          await upsertMaterial(updatedMaterial);
        }
      }
    } catch {
      return;
    }
  };

  const addDespacho = async (d: Partial<DespachoRecord>) => {
    const newDespacho: DespachoRecord = {
      id: Date.now(),
      tipoDespacho: 'externo',
      materialId: 0,
      materialCodigo: '',
      materialDescripcion: '',
      cantidad: 0,
      labor: '',
      supervisor: '',
      fecha: new Date().toISOString().split('T')[0],
      observaciones: '',
      ...d,
    };
    const materialBeforeDespacho = state.materiales.find((m) => m.id === newDespacho.materialId);
    dispatch({ type: 'ADD_DESPACHO', payload: newDespacho });
    try {
      await addDespachoRemote(newDespacho);
      if (newDespacho.tipoDespacho !== 'interno' && materialBeforeDespacho) {
        const updatedMaterial = {
          ...materialBeforeDespacho,
          stockActual: Math.max(0, materialBeforeDespacho.stockActual - newDespacho.cantidad),
        };
        await upsertMaterial(updatedMaterial);
      }
    } catch {
      return;
    }
  };

  const addMaterial = async (material: Omit<MaterialWithWarehouseInventory, 'id' | 'inventarioPorBodega'>) => {
    const payload = normalizeMaterial({ ...material, id: Date.now() } as Material, state.bodegas);
    dispatch({
      type: 'ADD_MATERIAL',
      payload,
    });
    try {
      await upsertMaterial(payload);
    } catch {
      return;
    }
  };

  const updateMaterial = async (material: MaterialWithWarehouseInventory) => {
    const payload = normalizeMaterial(material, state.bodegas);
    dispatch({ type: 'UPDATE_MATERIAL', payload });
    try {
      await upsertMaterial(payload);
    } catch {
      return;
    }
  };

  const addActivo = async (activo: Omit<Activo, 'id'>) => {
    const payload = { ...activo, id: Date.now() } as Activo;
    dispatch({ type: 'ADD_ACTIVO', payload });
    try {
      await upsertActivo(payload);
    } catch {
      return;
    }
  };

  const updateActivo = async (activo: Activo) => {
    dispatch({ type: 'UPDATE_ACTIVO', payload: activo });
    try {
      await upsertActivo(activo);
    } catch {
      return;
    }
  };

  const addTareo = async (tareo: Omit<Tareo, 'id'>) => {
    const payload = { ...tareo, id: Date.now() } as Tareo;
    dispatch({ type: 'ADD_TAREO', payload });
    try {
      await addTareoRemote(payload);
    } catch {
      return;
    }
  };

  const markAlertaRead = async (id: number) => {
    dispatch({ type: 'MARK_ALERTA_READ', payload: id });
    const alerta = state.alertas.find((item) => item.id === id);
    if (!alerta) {
      return;
    }
    try {
      await upsertAlerta({ ...alerta, leida: true });
    } catch {
      return;
    }
  };

  const resolveAlerta = async (id: number) => {
    dispatch({ type: 'RESOLVE_ALERTA', payload: id });
    const alerta = state.alertas.find((item) => item.id === id);
    const auditEntry = {
      id: `a-${Date.now()}`,
      accion: 'RESOLVER_ALERTA',
      detalle: `Alerta ${id} resuelta`,
      usuario: 'Sistema',
      fecha: new Date().toISOString(),
    };
    dispatch({ type: 'ADD_AUDIT_LOG', payload: auditEntry });
    try {
      if (alerta) {
        await upsertAlerta({ ...alerta, resuelta: true, leida: true });
      }
      await appendAuditEntry(auditEntry);
    } catch {
      return;
    }
  };

  const saveProveedores = async (proveedores: Proveedor[]) => {
    dispatch({ type: 'SET_PROVEEDORES', payload: proveedores });
    try {
      await replaceProveedores(proveedores);
    } catch {
      return;
    }
  };
  const saveCategorias = async (categorias: CatalogItem[]) => {
    dispatch({ type: 'SET_CATEGORIAS', payload: categorias });
    try {
      await replaceCatalog('categoria', categorias);
    } catch {
      return;
    }
  };
  const saveUnidades = async (unidades: CatalogItem[]) => {
    dispatch({ type: 'SET_UNIDADES', payload: unidades });
    try {
      await replaceCatalog('unidad', unidades);
    } catch {
      return;
    }
  };
  const saveBodegas = async (bodegas: CatalogItem[]) => {
    dispatch({ type: 'SET_BODEGAS', payload: bodegas });
    try {
      await replaceCatalog('bodega', bodegas);
    } catch {
      return;
    }
  };
  const saveZonasDestino = async (zonasDestino: CatalogItem[]) => {
    dispatch({ type: 'SET_ZONAS_DESTINO', payload: zonasDestino });
    try {
      await replaceCatalog('zona', zonasDestino);
    } catch {
      return;
    }
  };
  const saveClasesMovimiento = async (clasesMovimiento: MovementClassItem[]) => {
    dispatch({ type: 'SET_CLASES_MOVIMIENTO', payload: clasesMovimiento });
    try {
      await replaceCatalog('clase', clasesMovimiento);
    } catch {
      return;
    }
  };
  const saveLaboresActividad = async (laboresActividad: CatalogItem[]) => {
    dispatch({ type: 'SET_LABORES_ACTIVIDAD', payload: laboresActividad });
    try {
      await replaceCatalog('labor', laboresActividad);
    } catch {
      return;
    }
  };
  const saveSupervisores = async (supervisores: CatalogItem[]) => {
    dispatch({ type: 'SET_SUPERVISORES', payload: supervisores });
    try {
      await replaceCatalog('supervisor', supervisores);
    } catch {
      return;
    }
  };
  const saveEquipos = async (equipos: CatalogItem[]) => {
    dispatch({ type: 'SET_EQUIPOS', payload: equipos });
    try {
      await replaceCatalog('equipo', equipos);
    } catch {
      return;
    }
  };
  const addPersonal = async (p: Personal) => {
    dispatch({ type: 'SET_PERSONAL', payload: [...state.personal, p] });
    try {
      await upsertPersonal(p);
    } catch {
      return;
    }
  };
  const savePersonal = async (personal: Personal[]) => {
    dispatch({ type: 'SET_PERSONAL', payload: personal });
  };

  const value = useMemo(
    () => ({
      state,
      addIngreso,
      addSalida,
      removeMovimiento,
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
      saveBodegas,
      saveZonasDestino,
      saveClasesMovimiento,
      saveLaboresActividad,
      saveSupervisores,
      saveEquipos,
      addPersonal,
      savePersonal,
    }),
    [state]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}