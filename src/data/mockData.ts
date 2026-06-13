export interface Material {
  id: number;
  codigo: string;
  descripcion: string;
  categoria: 'Ferretería' | 'Eléctrico' | 'Lubricantes' | 'Seguridad' | 'Herramientas' | 'Filtros';
  familia: string;
  unidad: 'UND' | 'MT' | 'LT' | 'GL' | 'KG' | 'PAR' | 'ROL';
  marca: string;
  stockMin: number;
  stockMax: number;
  stockActual: number;
  ubicacion: string;
  estado: 'Activo' | 'Inactivo';
  ultimoMovimiento: string;
  precioUnitario: number;
}

export interface Proveedor {
  id: number;
  ruc: string;
  razonSocial: string;
  contacto: string;
  telefono: string;
  email: string;
}

export interface Movimiento {
  id: number;
  tipo: 'ingreso' | 'salida' | 'ajuste';
  fecha: string;
  materialId: number;
  materialCodigo: string;
  materialDescripcion: string;
  cantidad: number;
  documento: string;
  proveedor?: string;
  zona?: string;
  bodeguero: string;
  supervisor: string;
  observaciones: string;
  usuario: string;
  solicitante?: string;
}

export interface Personal {
  id: number;
  dni: string;
  nombres: string;
  apellidos: string;
  cargo: string;
  area: string;
  activo: boolean;
}

export interface Activo {
  id: number;
  codigoPatrimonial: string;
  serie: string;
  marca: string;
  modelo: string;
  categoria: 'Equipos' | 'Herramientas' | 'Radios' | 'Computadoras' | 'Impresoras' | 'Vehículos';
  ubicacion: string;
  responsable: string;
  estado: 'Operativo' | 'En Mantenimiento' | 'Dado de Baja';
  fechaAsignacion: string;
  historialTransferencias: { fecha: string; de: string; a: string; motivo: string }[];
}

export interface Vehiculo {
  id: number;
  placa: string;
  tipo: 'Camioneta' | 'Camión' | 'Equipo Móvil';
  marca: string;
  modelo: string;
  anio: number;
  operador: string;
  estado: 'Operativo' | 'En Mantenimiento' | 'Fuera de Servicio';
  kmActual: number;
  horometroActual: number;
}

export interface Alerta {
  id: number;
  tipo: 'stock_bajo' | 'sin_movimiento' | 'critico' | 'mantenimiento' | 'orden_retrasada' | 'consumo_elevado' | 'recepcion_incompleta';
  titulo: string;
  descripcion: string;
  materialId?: number;
  vehiculoId?: number;
  severidad: 'danger' | 'warning' | 'info';
  fecha: string;
  hora: string;
  leida: boolean;
  resuelta: boolean;
}

export interface Usuario {
  id: number;
  username: string;
  password: string;
  nombre: string;
  rol: string;
  planta: string;
  avatar: string;
}

export interface Tareo {
  id: number;
  vehiculoId: number;
  placa: string;
  fecha: string;
  operador: string;
  supervisor: string;
  kmInicial: number;
  kmFinal: number;
  horometroInicial: number;
  horometroFinal: number;
  combustible: number;
  actividad: string;
  observaciones: string;
}

export interface DespachoRecord {
  id: number;
  tipoDespacho: 'interno' | 'externo';
  materialId: number;
  materialCodigo: string;
  materialDescripcion: string;
  cantidad: number;
  labor: string;
  supervisor: string;
  fecha: string;
  observaciones: string;
}

export const materiales: Material[] = [];
export const proveedores: Proveedor[] = [];
export const movimientos: Movimiento[] = [];
export const activos: Activo[] = [];
export const vehiculos: Vehiculo[] = [];
export const alertas: Alerta[] = [];

export const usuarios: Usuario[] = [
  {
    id: 1,
    username: 'admin',
    password: 'admin123',
    nombre: 'Carlos Mendoza',
    rol: 'Administrador',
    planta: 'Todas',
    avatar: 'CM',
  },
  {
    id: 2,
    username: 'supervisor',
    password: 'sup123',
    nombre: 'Ana Torres',
    rol: 'Supervisor',
    planta: 'Planta 1',
    avatar: 'AT',
  },
  {
    id: 3,
    username: 'bodeguero',
    password: 'bod123',
    nombre: 'Juan Pérez',
    rol: 'Bodeguero',
    planta: 'Almacén Principal',
    avatar: 'JP',
  },
  {
    id: 4,
    username: 'consulta',
    password: 'con123',
    nombre: 'María López',
    rol: 'Consulta',
    planta: 'Planta 2',
    avatar: 'ML',
  },
];

export const tareos: Tareo[] = [];
export const despachos: DespachoRecord[] = [];
export const personal: Personal[] = [];

export const zonasDestino: string[] = [
  'Zona Norte',
  'Zona Sur',
  'Zona Este',
  'Zona Oeste',
  'Taller Central',
  'Almacén Principal',
  'Planta 1',
  'Planta 2',
];

export const clasesMovimiento: { value: string; label: string }[] = [
  { value: '101', label: '101-Ingreso por compra' },
  { value: '102', label: '102-Ingreso por devolución' },
  { value: '103', label: '103-Ingreso por transferencia' },
  { value: '201', label: '201-Salida por consumo' },
  { value: '202', label: '202-Salida por préstamo' },
  { value: '203', label: '203-Salida por transferencia' },
  { value: '301', label: '301-Ajuste positivo' },
  { value: '302', label: '302-Ajuste negativo' },
];

export const laboresActividad: string[] = [
  'Mantenimiento Preventivo',
  'Mantenimiento Correctivo',
  'Operación Mina',
  'Construcción',
  'Limpieza',
  'Instalación Eléctrica',
  'Soldadura',
  'Pintura',
];