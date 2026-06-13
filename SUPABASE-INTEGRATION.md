# Integrar Supabase - Instrucciones

## Credenciales
- URL: https://pokbocttpciehafsxsam.supabase.co
- ANON KEY: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBva2JvY3R0cGNpZWhhZnN4c2FtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEzNzM2ODcsImV4cCI6MjA5Njk0OTY4N30.8p9yVNRIObSDPOBQtXTKdCvXPez9a_z5Mt3ORGuTq4o

## Pasos

### 1. Instalar dependencia
npm install @supabase/supabase-js (usar PATH C:/Users/paqui/nodejs-temp/node-v20.18.3-win-x64)

### 2. Crear src/lib/supabase.ts
Cliente Supabase con URL y anon key.

### 3. Crear tablas en Supabase
Usar fetch POST al endpoint https://pokbocttpciehafsxsam.supabase.co/rest/v1/rpc o el SQL endpoint para crear las tablas.

Tablas necesarias:
- **usuarios**: id uuid PK, username text unique, password text, nombre text, rol text, planta text, avatar text
- **materiales**: id uuid PK, codigo text, descripcion text, categoria text, familia text, unidad text, marca text, stock_min int, stock_max int, stock_actual int, precio_unitario numeric, ubicacion text, estado text
- **proveedores**: id uuid PK, ruc text, razon_social text, contacto text, telefono text
- **movimientos**: id uuid PK, tipo text (ingreso/salida), fecha date, num_documento text, clase_movimiento text, proveedor text, material_id uuid, descripcion text, cantidad int, num_vale text, zona_destino text, bodeguero text, supervisor text, bodega_origen text, observaciones text, usuario text, created_at timestamptz default now()
- **activos**: id uuid PK, codigo_patrimonial text, serie text, marca text, modelo text, categoria text, ubicacion text, responsable text, estado text, fecha_asignacion date
- **vehiculos**: id uuid PK, placa text, tipo text, marca text, modelo text, operador text, supervisor text, estado text
- **tareos**: id uuid PK, vehiculo_id uuid, fecha date, operador text, supervisor text, km_inicial numeric, km_final numeric, horometro_inicial numeric, horometro_final numeric, combustible numeric, actividad text, horas_trabajadas numeric, observaciones text
- **alertas**: id uuid PK, tipo text, titulo text, subtitulo text, severidad text, leida boolean default false, resuelta boolean default false, fecha timestamptz default now()
- **catalogos**: id uuid PK, tipo text (categoria/unidad/zona/clase/labor/supervisor/bodega), nombre text, datos jsonb
- **despachos**: id uuid PK, material_id uuid, descripcion text, cantidad int, labor text, supervisor text, bodega_origen text, fecha date, observaciones text, usuario text, created_at timestamptz default now()

Para crear tablas, ejecutar SQL via fetch:
```
fetch('https://pokbocttpciehafsxsam.supabase.co/rest/v1/rpc', {
  method: 'POST',
  headers: {
    'apikey': ANON_KEY,
    'Authorization': 'Bearer ' + ANON_KEY,
    'Content-Type': 'application/json'
  }
})
```

O mejor: crear un script setup-db.mjs que use el cliente Supabase para ejecutar el SQL de creacion via la Management API.

Alternativa mas simple: El usuario puede ir a Supabase Dashboard > SQL Editor y pegar el SQL. Generar el archivo setup.sql con todo el DDL y dar instrucciones para ejecutarlo.

### 4. Crear src/lib/database.ts
Funciones CRUD para cada tabla usando supabase-js:
- getMateriales, addMaterial, updateMaterial, deleteMaterial
- getProveedores, addProveedor, updateProveedor, deleteProveedor
- getMovimientos, addMovimiento
- getActivos, addActivo, updateActivo, deleteActivo
- getVehiculos, addVehiculo, updateVehiculo
- getTareos, addTareo
- getAlertas, addAlerta, updateAlerta
- getCatalogos, addCatalogo, updateCatalogo, deleteCatalogo
- getDespachos, addDespacho
- getUsuarios, addUsuario, updateUsuario, deleteUsuario

### 5. Modificar AppContext.tsx
- Al montar la app: cargar todos los datos de Supabase
- En cada operacion CRUD: guardar en Supabase Y actualizar estado local
- Mantener localStorage como cache para carga rapida
- Usar useEffect para cargar datos async al inicio

### 6. Modificar AuthContext.tsx
- Login: verificar contra tabla usuarios en Supabase
- Crear usuario: guardar en Supabase
- Cargar usuarios: leer de Supabase al inicio

### 7. Mantener localStorage como cache/fallback offline

### 8. Hacer npm run build al terminar

## IMPORTANTE
- Usar file_read y file_write para editar archivos, NO PowerShell
- Generar un archivo setup.sql con todo el DDL de las tablas
- El SQL debe ejecutarse en Supabase Dashboard > SQL Editor
- Habilitar RLS (Row Level Security) pero con politica permissive para anon para empezar
