import { supabase } from './supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';
import type { StoredUser } from '../context/AuthContext';
import type {
  AppState,
  AuditEntry,
  CatalogItem,
  MaterialWithWarehouseInventory,
  MovementClassItem,
  WarehouseInventory,
} from '../context/AppContext';
import type { Activo, Alerta, DespachoRecord, Material, Movimiento, Personal, Proveedor, Tareo, Vehiculo } from '../data/mockData';

type UUID = string;

const MATERIAL_UUID_MAP_KEY = 'logix-material-uuid-map';
const USER_UUID_MAP_KEY = 'logix-user-uuid-map';
const PROVEEDOR_UUID_MAP_KEY = 'logix-proveedor-uuid-map';

function readUuidMap(storageKey: string): Record<string, UUID> {
  if (typeof window === 'undefined') {
    return {};
  }
  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) {
      return {};
    }
    const parsed = JSON.parse(raw) as Record<string, string>;
    return Object.fromEntries(
      Object.entries(parsed).filter((entry): entry is [string, UUID] => typeof entry[0] === 'string' && typeof entry[1] === 'string' && entry[1].length > 0)
    );
  } catch {
    return {};
  }
}

function writeUuidMap(storageKey: string, map: Record<string, UUID>) {
  if (typeof window === 'undefined') {
    return;
  }
  window.localStorage.setItem(storageKey, JSON.stringify(map));
}

function getMappedUuid(storageKey: string, value: number | string) {
  const key = String(value);
  const map = readUuidMap(storageKey);
  return map[key];
}

function setMappedUuid(storageKey: string, value: number | string, uuid: UUID) {
  const key = String(value);
  const map = readUuidMap(storageKey);
  if (map[key] === uuid) {
    return;
  }
  map[key] = uuid;
  writeUuidMap(storageKey, map);
}

type UsuarioRow = {
  id: UUID;
  username: string;
  password: string;
  nombre: string;
  rol: StoredUser['rol'];
  planta: string;
  avatar: string;
};

type MaterialRow = {
  id: UUID;
  codigo: string;
  descripcion: string;
  categoria: string;
  familia: string;
  unidad: string;
  marca: string;
  stock_min: number;
  stock_max: number;
  stock_actual: number;
  precio_unitario: number;
  ubicacion: string;
  estado: Material['estado'];
  ultimo_movimiento: string | null;
};

type ProveedorRow = {
  id: UUID;
  ruc: string;
  razon_social: string;
  contacto: string;
  telefono: string;
  email: string;
};

type MovimientoRow = {
  id: UUID;
  tipo: Movimiento['tipo'];
  fecha: string;
  num_documento: string;
  clase_movimiento: string;
  proveedor: string | null;
  material_id: UUID | null;
  descripcion: string;
  cantidad: number;
  num_vale: string;
  zona_destino: string | null;
  bodeguero: string;
  supervisor: string;
  bodega_origen: string;
  observaciones: string;
  usuario: string;
};

type ActivoRow = {
  id: UUID;
  codigo_patrimonial: string;
  serie: string;
  marca: string;
  modelo: string;
  categoria: string;
  ubicacion: string;
  responsable: string;
  estado: Activo['estado'];
  fecha_asignacion: string;
  historial_transferencias: Activo['historialTransferencias'];
};

type VehiculoRow = {
  id: UUID;
  placa: string;
  tipo: Vehiculo['tipo'];
  marca: string;
  modelo: string;
  anio: number;
  operador: string;
  supervisor: string;
  estado: Vehiculo['estado'];
  km_actual: number;
  horometro_actual: number;
};

type TareoRow = {
  id: UUID;
  vehiculo_id: UUID | null;
  fecha: string;
  operador: string;
  supervisor: string;
  km_inicial: number;
  km_final: number;
  horometro_inicial: number;
  horometro_final: number;
  combustible: number;
  actividad: string;
  horas_trabajadas: number;
  observaciones: string;
  placa: string;
};

type AlertaRow = {
  id: UUID;
  tipo: Alerta['tipo'];
  titulo: string;
  subtitulo: string;
  severidad: Alerta['severidad'];
  leida: boolean;
  resuelta: boolean;
  fecha: string;
  material_id: UUID | null;
  vehiculo_id: UUID | null;
};

type CatalogoRow = {
  id: UUID;
  tipo: string;
  nombre: string;
  datos: Record<string, unknown>;
};

type DespachoRow = {
  id: UUID;
  material_id: UUID | null;
  descripcion: string;
  cantidad: number;
  labor: string;
  supervisor: string;
  bodega_origen: string;
  fecha: string;
  observaciones: string;
  usuario: string;
};

const toNumericId = (value: string) => {
  const digits = value.replace(/\D/g, '');
  return digits ? Number(digits.slice(-12)) : Date.now();
};

const toUuidId = (value: number | string, storageKey?: string) => {
  if (typeof value === 'string' && value.includes('-')) {
    return value;
  }
  if (storageKey) {
    const mapped = getMappedUuid(storageKey, value);
    if (mapped) {
      return mapped;
    }
  }
  const uuid = crypto.randomUUID();
  if (storageKey) {
    setMappedUuid(storageKey, value, uuid);
  }
  return uuid;
};

const parseWarehouseInventory = (datos: Record<string, unknown>): WarehouseInventory[] => {
  const raw = datos.inventarioPorBodega;
  if (!Array.isArray(raw)) {
    return [];
  }
  return raw
    .map((item) => {
      if (!item || typeof item !== 'object') {
        return null;
      }
      const candidate = item as Record<string, unknown>;
      return {
        bodegaId: String(candidate.bodegaId ?? ''),
        stockActual: Number(candidate.stockActual ?? 0),
      };
    })
    .filter((item): item is WarehouseInventory => Boolean(item?.bodegaId));
};

const mapUserRow = (row: UsuarioRow): StoredUser => row;

const mapMaterialRow = (row: MaterialRow, inventory: WarehouseInventory[]): MaterialWithWarehouseInventory => ({
  id: toNumericId(row.id),
  codigo: row.codigo,
  descripcion: row.descripcion,
  categoria: row.categoria as Material['categoria'],
  familia: row.familia,
  unidad: row.unidad as Material['unidad'],
  marca: row.marca,
  stockMin: row.stock_min,
  stockMax: row.stock_max,
  stockActual: row.stock_actual,
  ubicacion: row.ubicacion,
  estado: row.estado,
  ultimoMovimiento: row.ultimo_movimiento ?? '',
  precioUnitario: Number(row.precio_unitario ?? 0),
  inventarioPorBodega: inventory,
});

const mapProveedorRow = (row: ProveedorRow): Proveedor => ({
  id: toNumericId(row.id),
  ruc: row.ruc,
  razonSocial: row.razon_social,
  contacto: row.contacto,
  telefono: row.telefono,
  email: row.email,
});

const mapMovimientoRow = (
  row: MovimientoRow,
  materialesByUuid: Map<string, MaterialWithWarehouseInventory>
): Movimiento => {
  const material = row.material_id ? materialesByUuid.get(row.material_id) : undefined;
  return {
    id: toNumericId(row.id),
    tipo: row.tipo,
    fecha: row.fecha,
    materialId: material?.id ?? 0,
    materialCodigo: material?.codigo ?? '',
    materialDescripcion: material?.descripcion ?? row.descripcion,
    cantidad: row.cantidad,
    documento: row.num_documento || row.num_vale,
    proveedor: row.proveedor ?? '',
    zona: row.zona_destino ?? '',
    bodeguero: row.bodeguero,
    supervisor: row.supervisor,
    observaciones: row.observaciones,
    usuario: row.usuario,
  };
};

const mapActivoRow = (row: ActivoRow): Activo => ({
  id: toNumericId(row.id),
  codigoPatrimonial: row.codigo_patrimonial,
  serie: row.serie,
  marca: row.marca,
  modelo: row.modelo,
  categoria: row.categoria as Activo['categoria'],
  ubicacion: row.ubicacion,
  responsable: row.responsable,
  estado: row.estado,
  fechaAsignacion: row.fecha_asignacion,
  historialTransferencias: row.historial_transferencias ?? [],
});

const mapVehiculoRow = (row: VehiculoRow): Vehiculo => ({
  id: toNumericId(row.id),
  placa: row.placa,
  tipo: row.tipo,
  marca: row.marca,
  modelo: row.modelo,
  anio: row.anio,
  operador: row.operador,
  estado: row.estado,
  kmActual: Number(row.km_actual ?? 0),
  horometroActual: Number(row.horometro_actual ?? 0),
});

const mapTareoRow = (row: TareoRow, vehiculosByUuid: Map<string, Vehiculo>): Tareo => ({
  id: toNumericId(row.id),
  vehiculoId: row.vehiculo_id ? vehiculosByUuid.get(row.vehiculo_id)?.id ?? 0 : 0,
  placa: row.placa,
  fecha: row.fecha,
  operador: row.operador,
  supervisor: row.supervisor,
  kmInicial: Number(row.km_inicial ?? 0),
  kmFinal: Number(row.km_final ?? 0),
  horometroInicial: Number(row.horometro_inicial ?? 0),
  horometroFinal: Number(row.horometro_final ?? 0),
  combustible: Number(row.combustible ?? 0),
  actividad: row.actividad,
  observaciones: row.observaciones,
});

const mapAlertaRow = (row: AlertaRow, materialesByUuid: Map<string, MaterialWithWarehouseInventory>, vehiculosByUuid: Map<string, Vehiculo>): Alerta => ({
  id: toNumericId(row.id),
  tipo: row.tipo,
  titulo: row.titulo,
  descripcion: row.subtitulo,
  materialId: row.material_id ? materialesByUuid.get(row.material_id)?.id : undefined,
  vehiculoId: row.vehiculo_id ? vehiculosByUuid.get(row.vehiculo_id)?.id : undefined,
  severidad: row.severidad,
  fecha: row.fecha.split('T')[0],
  hora: new Date(row.fecha).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }),
  leida: row.leida,
  resuelta: row.resuelta,
});

const mapCatalogRow = (row: CatalogoRow): CatalogItem => ({
  id: row.id,
  nombre: row.nombre,
});

const mapMovementClassRow = (row: CatalogoRow): MovementClassItem => ({
  id: row.id,
  value: String(row.datos.value ?? ''),
  label: String(row.datos.label ?? row.nombre),
});

const mapDespachoRow = (row: DespachoRow, materialesByUuid: Map<string, MaterialWithWarehouseInventory>): DespachoRecord => {
  const material = row.material_id ? materialesByUuid.get(row.material_id) : undefined;
  return {
    id: toNumericId(row.id),
    tipoDespacho: (row as any).tipo_despacho === 'interno' ? 'interno' : 'externo',
    materialId: material?.id ?? 0,
    materialCodigo: material?.codigo ?? '',
    materialDescripcion: material?.descripcion ?? row.descripcion,
    cantidad: row.cantidad,
    labor: row.labor,
    supervisor: row.supervisor,
    fecha: row.fecha,
    observaciones: row.observaciones,
  };
};

async function selectAll<T>(table: string) {
  const { data, error } = await supabase.from(table).select('*');
  if (error) {
    throw error;
  }
  return (data ?? []) as T[];
}

export async function getUsuarios() {
  return (await selectAll<UsuarioRow>('usuarios')).map((row) => {
    setMappedUuid(USER_UUID_MAP_KEY, row.id, row.id);
    return mapUserRow(row);
  });
}

export async function upsertUsuario(user: StoredUser) {
  const payload = {
    id: toUuidId(user.id, USER_UUID_MAP_KEY),
    username: user.username,
    password: user.password,
    nombre: user.nombre,
    rol: user.rol,
    planta: user.planta,
    avatar: user.avatar,
  };
  const { error } = await supabase.from('usuarios').upsert(payload, { onConflict: 'username' });
  if (error) {
    throw error;
  }
}

export async function replaceUsuarios(users: StoredUser[]) {
  const existing = await getUsuarios();
  const incomingIds = new Set(users.map((user) => user.id));
  await Promise.all(users.map((user) => upsertUsuario(user)));
  const toDelete = existing.filter((user) => !incomingIds.has(user.id) && user.username !== 'admin');
  if (toDelete.length > 0) {
    const { error } = await supabase.from('usuarios').delete().in('id', toDelete.map((user) => user.id));
    if (error) {
      throw error;
    }
  }
}

export async function loadAppData(defaultState: AppState): Promise<AppState> {
  const [materialRows, proveedorRows, movimientoRows, activoRows, vehiculoRows, tareoRows, alertaRows, catalogoRows, despachoRows, personalRows] =
    await Promise.all([
      selectAll<MaterialRow>('materiales'),
      selectAll<ProveedorRow>('proveedores'),
      selectAll<MovimientoRow>('movimientos'),
      selectAll<ActivoRow>('activos'),
      selectAll<VehiculoRow>('vehiculos'),
      selectAll<TareoRow>('tareos'),
      selectAll<AlertaRow>('alertas'),
      selectAll<CatalogoRow>('catalogos'),
      selectAll<DespachoRow>('despachos'),
      selectAll<{ id: string; dni: string; nombres: string; apellidos: string; cargo: string; area: string; activo: boolean }>('personal'),
    ]);

  const inventoryCatalogs = catalogoRows.filter((row) => row.tipo === 'inventario_bodega');
  const inventoryByMaterialId = new Map<string, WarehouseInventory[]>(
    inventoryCatalogs.map((row) => [String(row.datos.materialId ?? ''), parseWarehouseInventory(row.datos)])
  );

  const materiales = materialRows.map((row) => {
    setMappedUuid(MATERIAL_UUID_MAP_KEY, toNumericId(row.id), row.id);
    setMappedUuid(MATERIAL_UUID_MAP_KEY, row.id, row.id);
    return mapMaterialRow(row, inventoryByMaterialId.get(row.id) ?? []);
  });
  const materialesByUuid = new Map(materialRows.map((row, index) => [row.id, materiales[index]]));
  const vehiculos = vehiculoRows.map(mapVehiculoRow);
  const vehiculosByUuid = new Map(vehiculoRows.map((row, index) => [row.id, vehiculos[index]]));

  const catalogosByTipo = (tipo: string) => catalogoRows.filter((row) => row.tipo === tipo);

  return {
    ...defaultState,
    materiales: materiales.length > 0 ? materiales : defaultState.materiales,
    movimientos: movimientoRows.map((row) => mapMovimientoRow(row, materialesByUuid)),
    alertas: alertaRows.map((row) => mapAlertaRow(row, materialesByUuid, vehiculosByUuid)),
    activos: activoRows.map(mapActivoRow),
    vehiculos,
    tareos: tareoRows.map((row) => mapTareoRow(row, vehiculosByUuid)),
    despachos: despachoRows.map((row) => mapDespachoRow(row, materialesByUuid)),
    proveedores: proveedorRows.map(mapProveedorRow),
    categorias: catalogosByTipo('categoria').map(mapCatalogRow).length > 0 ? catalogosByTipo('categoria').map(mapCatalogRow) : defaultState.categorias,
    unidades: catalogosByTipo('unidad').map(mapCatalogRow).length > 0 ? catalogosByTipo('unidad').map(mapCatalogRow) : defaultState.unidades,
    bodegas: catalogosByTipo('bodega').map(mapCatalogRow).length > 0 ? catalogosByTipo('bodega').map(mapCatalogRow) : defaultState.bodegas,
    zonasDestino: catalogosByTipo('zona').map(mapCatalogRow).length > 0 ? catalogosByTipo('zona').map(mapCatalogRow) : defaultState.zonasDestino,
    laboresActividad: catalogosByTipo('labor').map(mapCatalogRow).length > 0 ? catalogosByTipo('labor').map(mapCatalogRow) : defaultState.laboresActividad,
    supervisores: catalogosByTipo('supervisor').map(mapCatalogRow).length > 0 ? catalogosByTipo('supervisor').map(mapCatalogRow) : defaultState.supervisores,
    clasesMovimiento: catalogosByTipo('clase').map(mapMovementClassRow).length > 0 ? catalogosByTipo('clase').map(mapMovementClassRow) : defaultState.clasesMovimiento,
    equipos: catalogosByTipo('equipo').map(mapCatalogRow).length > 0 ? catalogosByTipo('equipo').map(mapCatalogRow) : defaultState.equipos,
    personal: personalRows.map((row) => ({
      id: toNumericId(row.id),
      dni: row.dni,
      nombres: row.nombres,
      apellidos: row.apellidos,
      cargo: row.cargo,
      area: row.area,
      activo: row.activo,
    })),
    auditLog: defaultState.auditLog,
    lastUpdatedAt: Date.now(),
  };
}

export async function upsertMaterial(material: MaterialWithWarehouseInventory) {
  const uuid = toUuidId(material.id, MATERIAL_UUID_MAP_KEY);
  const { error } = await supabase.from('materiales').upsert({
    id: uuid,
    codigo: material.codigo,
    descripcion: material.descripcion,
    categoria: material.categoria,
    familia: material.familia,
    unidad: material.unidad,
    marca: material.marca,
    stock_min: material.stockMin,
    stock_max: material.stockMax,
    stock_actual: material.stockActual,
    precio_unitario: material.precioUnitario,
    ubicacion: material.ubicacion,
    estado: material.estado,
    ultimo_movimiento: material.ultimoMovimiento || null,
  });
  if (error) {
    throw error;
  }
  await supabase.from('catalogos').upsert({
    id: crypto.randomUUID(),
    tipo: 'inventario_bodega',
    nombre: material.codigo,
    datos: {
      materialId: uuid,
      inventarioPorBodega: material.inventarioPorBodega,
    },
  });
}

export async function replaceCatalog(tipo: string, items: CatalogItem[] | MovementClassItem[]) {
  const existing = await supabase.from('catalogos').select('id').eq('tipo', tipo);
  if (existing.error) {
    throw existing.error;
  }
  const ids = (items as Array<CatalogItem | MovementClassItem>).map((item) => item.id);
  const rows = items.map((item) =>
    'value' in item
      ? { id: item.id || crypto.randomUUID(), tipo, nombre: item.label, datos: { value: item.value, label: item.label } }
      : { id: item.id || crypto.randomUUID(), tipo, nombre: item.nombre, datos: {} }
  );
  if (rows.length > 0) {
    const { error } = await supabase.from('catalogos').upsert(rows);
    if (error) {
      throw error;
    }
  }
  const staleIds = (existing.data ?? []).map((row) => row.id).filter((id) => !ids.includes(id));
  if (staleIds.length > 0) {
    const { error } = await supabase.from('catalogos').delete().in('id', staleIds);
    if (error) {
      throw error;
    }
  }
}

export async function replaceProveedores(proveedores: Proveedor[]) {
  const existing = await selectAll<ProveedorRow>('proveedores');
  const rows = proveedores.map((proveedor) => ({
    id: toUuidId(proveedor.id, PROVEEDOR_UUID_MAP_KEY),
    ruc: proveedor.ruc,
    razon_social: proveedor.razonSocial,
    contacto: proveedor.contacto,
    telefono: proveedor.telefono,
    email: proveedor.email,
  }));
  if (rows.length > 0) {
    const { error } = await supabase.from('proveedores').upsert(rows);
    if (error) {
      throw error;
    }
  }
  const incomingIds = new Set(rows.map((row) => row.id));
  const staleIds = existing.map((row) => row.id).filter((id) => !incomingIds.has(id));
  if (staleIds.length > 0) {
    const { error } = await supabase.from('proveedores').delete().in('id', staleIds);
    if (error) {
      throw error;
    }
  }
}

export async function addMovimiento(movimiento: Movimiento, materialUuid?: string) {
  const { error } = await supabase.from('movimientos').insert({
    id: toUuidId(movimiento.id),
    tipo: movimiento.tipo,
    fecha: movimiento.fecha,
    num_documento: movimiento.documento,
    clase_movimiento: movimiento.documento.split('-')[0] || '',
    proveedor: movimiento.proveedor ?? null,
    material_id: materialUuid ?? getMappedUuid(MATERIAL_UUID_MAP_KEY, movimiento.materialId) ?? null,
    descripcion: movimiento.materialDescripcion,
    cantidad: movimiento.cantidad,
    num_vale: movimiento.documento,
    zona_destino: movimiento.zona ?? null,
    bodeguero: movimiento.bodeguero,
    supervisor: movimiento.supervisor,
    bodega_origen: '',
    observaciones: movimiento.observaciones,
    usuario: movimiento.usuario,
  });
  if (error) {
    throw error;
  }

  // Update stock_actual in materiales
  const resolvedMaterialUuid = materialUuid ?? getMappedUuid(MATERIAL_UUID_MAP_KEY, movimiento.materialId);
  if (resolvedMaterialUuid) {
    const { data: currentMaterial } = await supabase
      .from('materiales')
      .select('stock_actual')
      .eq('id', resolvedMaterialUuid)
      .single();

    if (currentMaterial) {
      const currentStock = currentMaterial.stock_actual || 0;
      const newStock = movimiento.tipo === 'ingreso'
        ? currentStock + movimiento.cantidad
        : currentStock - movimiento.cantidad;

      await supabase
        .from('materiales')
        .update({ stock_actual: newStock })
        .eq('id', resolvedMaterialUuid);
    }
  }
}

export async function deleteMovimiento(movimientoId: number) {
  const uuid = toUuidId(movimientoId);
  const { error } = await supabase.from('movimientos').delete().eq('id', uuid);
  if (error) {
    throw error;
  }
}

export async function upsertActivo(activo: Activo) {
  const { error } = await supabase.from('activos').upsert({
    id: toUuidId(activo.id),
    codigo_patrimonial: activo.codigoPatrimonial,
    serie: activo.serie,
    marca: activo.marca,
    modelo: activo.modelo,
    categoria: activo.categoria,
    ubicacion: activo.ubicacion,
    responsable: activo.responsable,
    estado: activo.estado,
    fecha_asignacion: activo.fechaAsignacion,
    historial_transferencias: activo.historialTransferencias,
  });
  if (error) {
    throw error;
  }
}

export async function addTareo(tareo: Tareo, vehiculoUuid?: string) {
  const horasTrabajadas = Math.max(0, tareo.horometroFinal - tareo.horometroInicial);
  const { error } = await supabase.from('tareos').insert({
    id: toUuidId(tareo.id),
    vehiculo_id: vehiculoUuid ?? null,
    fecha: tareo.fecha,
    operador: tareo.operador,
    supervisor: tareo.supervisor,
    km_inicial: tareo.kmInicial,
    km_final: tareo.kmFinal,
    horometro_inicial: tareo.horometroInicial,
    horometro_final: tareo.horometroFinal,
    combustible: tareo.combustible,
    actividad: tareo.actividad,
    horas_trabajadas: horasTrabajadas,
    observaciones: tareo.observaciones,
    placa: tareo.placa,
  });
  if (error) {
    throw error;
  }
}

export async function upsertAlerta(alerta: Alerta) {
  const { error } = await supabase.from('alertas').upsert({
    id: toUuidId(alerta.id),
    tipo: alerta.tipo,
    titulo: alerta.titulo,
    subtitulo: alerta.descripcion,
    severidad: alerta.severidad,
    leida: alerta.leida,
    resuelta: alerta.resuelta,
    fecha: `${alerta.fecha}T${alerta.hora || '00:00'}:00`,
    material_id: null,
    vehiculo_id: null,
  });
  if (error) {
    throw error;
  }
}

export async function addDespacho(despacho: DespachoRecord, materialUuid?: string) {
  const { error } = await supabase.from('despachos').insert({
    id: toUuidId(despacho.id),
    material_id: materialUuid ?? getMappedUuid(MATERIAL_UUID_MAP_KEY, despacho.materialId) ?? null,
    descripcion: despacho.materialDescripcion,
    cantidad: despacho.cantidad,
    labor: despacho.labor,
    supervisor: despacho.supervisor,
    bodega_origen: despacho.observaciones.match(/Bodega: ([^|]+)/)?.[1]?.trim() ?? '',
    fecha: despacho.fecha,
    observaciones: despacho.observaciones,
    usuario: '',
  });
  if (error) {
    throw error;
  }

  // Update stock_actual in materiales (only for external despachos)
  if (despacho.tipoDespacho !== 'interno') {
    const resolvedMaterialUuid = materialUuid ?? getMappedUuid(MATERIAL_UUID_MAP_KEY, despacho.materialId);
    if (resolvedMaterialUuid) {
      const { data: currentMaterial } = await supabase
        .from('materiales')
        .select('stock_actual')
        .eq('id', resolvedMaterialUuid)
        .single();

      if (currentMaterial) {
        const newStock = (currentMaterial.stock_actual || 0) - despacho.cantidad;
        await supabase
          .from('materiales')
          .update({ stock_actual: newStock })
          .eq('id', resolvedMaterialUuid);
      }
    }
  }
}

export async function upsertPersonal(p: Personal) {
  const { error } = await supabase.from('personal').upsert({
    id: toUuidId(p.id),
    dni: p.dni,
    nombres: p.nombres,
    apellidos: p.apellidos,
    cargo: p.cargo,
    area: p.area,
    activo: p.activo,
  });
  if (error) {
    throw error;
  }
}

export async function deletePersonal(personalId: number) {
  const uuid = toUuidId(personalId);
  const { error } = await supabase.from('personal').delete().eq('id', uuid);
  if (error) {
    throw error;
  }
}

export async function appendAuditEntry(_entry: AuditEntry) {
  return Promise.resolve();
}

const REALTIME_TABLES = [
  'materiales',
  'movimientos',
  'activos',
  'vehiculos',
  'tareos',
  'alertas',
  'catalogos',
  'despachos',
  'proveedores',
  'personal',
] as const;

export function subscribeToAppDataChanges(onChange: () => void): RealtimeChannel {
  const channel = supabase.channel(`logix-db-sync-${crypto.randomUUID()}`);

  REALTIME_TABLES.forEach((table) => {
    channel.on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table,
      },
      () => {
        onChange();
      }
    );
  });

  channel.subscribe();
  return channel;
}

export async function unsubscribeFromAppDataChanges(channel: RealtimeChannel) {
  await supabase.removeChannel(channel);
}