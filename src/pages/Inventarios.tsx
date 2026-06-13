import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import Badge from '../components/ui/Badge';

const tabs = [
  'Inventario Físico',
  'Ajustes',
  'Kardex por Material',
  'Kardex por Familia',
  'Historial',
] as const;

export default function Inventarios() {
  const { state } = useApp();
  const [activeTab, setActiveTab] = useState<string>(tabs[0]);
  const [selectedMaterialId, setSelectedMaterialId] = useState('');
  const [selectedFamilia, setSelectedFamilia] = useState('');
  const [histFiltroTipo, setHistFiltroTipo] = useState('');
  const [selectedBodegaId, setSelectedBodegaId] = useState(state.bodegas[0]?.id ?? '');

  const familias = useMemo(
    () => [...new Set(state.materiales.map((material) => material.familia).filter(Boolean))],
    [state.materiales]
  );

  const inventarioPorBodega = useMemo(() => {
    return state.materiales.map((material) => {
      const stockBodega =
        material.inventarioPorBodega.find((item) => item.bodegaId === selectedBodegaId)?.stockActual ?? 0;
      return {
        ...material,
        stockBodega,
      };
    });
  }, [state.materiales, selectedBodegaId]);

  const kardexMaterial = useMemo(() => {
    if (!selectedMaterialId) {
      return [];
    }
    const materialId = Number(selectedMaterialId);
    const movimientos = state.movimientos
      .filter((movimiento) => movimiento.materialId === materialId)
      .sort((a, b) => a.fecha.localeCompare(b.fecha));
    let saldo = 0;
    return movimientos.map((movimiento) => {
      saldo += movimiento.tipo === 'ingreso' ? movimiento.cantidad : -movimiento.cantidad;
      return { ...movimiento, saldo };
    });
  }, [selectedMaterialId, state.movimientos]);

  const kardexFamilia = useMemo(() => {
    if (!selectedFamilia) {
      return [];
    }
    const materialIds = state.materiales
      .filter((material) => material.familia === selectedFamilia)
      .map((material) => material.id);
    return state.movimientos
      .filter((movimiento) => materialIds.includes(movimiento.materialId))
      .sort((a, b) => b.fecha.localeCompare(a.fecha));
  }, [selectedFamilia, state.materiales, state.movimientos]);

  const historial = useMemo(() => {
    let movimientos = [...state.movimientos].sort((a, b) => b.fecha.localeCompare(a.fecha));
    if (histFiltroTipo) {
      movimientos = movimientos.filter((movimiento) => movimiento.tipo === histFiltroTipo);
    }
    return movimientos;
  }, [state.movimientos, histFiltroTipo]);

  const inputCls =
    'w-full border border-[#E2E6EF] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E8672C]/30';
  const thCls =
    'px-3 py-3 text-left uppercase text-xs tracking-wider font-semibold text-[#6B7A99] whitespace-nowrap';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="bg-white rounded-xl border border-[#E2E6EF] p-4 flex flex-col md:flex-row gap-4 md:items-end">
        <div className="w-full md:max-w-xs">
          <label className="block text-xs font-medium text-[#6B7A99] uppercase tracking-wider mb-1">
            Bodega
          </label>
          <select
            value={selectedBodegaId}
            onChange={(e) => setSelectedBodegaId(e.target.value)}
            className={inputCls}
          >
            {state.bodegas.map((bodega) => (
              <option key={bodega.id} value={bodega.id}>
                {bodega.nombre}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex gap-1 border-b border-[#E2E6EF] overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-sm whitespace-nowrap transition-colors ${activeTab === tab ? 'border-b-2 border-[#E8672C] text-[#E8672C] font-semibold' : 'text-[#6B7A99] hover:text-[#1B2A4A]'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === tabs[0] && (
        <div className="bg-white rounded-xl border border-[#E2E6EF] overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-[#E2E6EF]">
                {['Código', 'Descripción', 'Bodega', 'Stock Sistema', 'Estado'].map((header) => (
                  <th key={header} className={thCls}>
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {inventarioPorBodega.map((material, index) => (
                <tr
                  key={material.id}
                  className={`${index % 2 ? 'bg-gray-50/50' : ''} border-b border-[#E2E6EF]`}
                >
                  <td className="px-3 py-2.5 font-medium">{material.codigo}</td>
                  <td className="px-3 py-2.5">{material.descripcion}</td>
                  <td className="px-3 py-2.5">
                    {state.bodegas.find((bodega) => bodega.id === selectedBodegaId)?.nombre ?? ''}
                  </td>
                  <td className="px-3 py-2.5 text-center">{material.stockBodega}</td>
                  <td className="px-3 py-2.5">
                    <Badge variant={material.stockBodega <= material.stockMin ? 'danger' : 'success'}>
                      {material.stockBodega <= material.stockMin ? 'Bajo' : 'Disponible'}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === tabs[1] && (
        <div className="bg-white rounded-xl border border-[#E2E6EF] overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-[#E2E6EF]">
                {['Fecha', 'Código', 'Descripción', 'Tipo', 'Cantidad', 'Documento', 'Usuario'].map(
                  (header) => (
                    <th key={header} className={thCls}>
                      {header}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {state.movimientos
                .filter((movimiento) => movimiento.tipo === 'ajuste')
                .map((movimiento, index) => (
                  <tr
                    key={movimiento.id}
                    className={`${index % 2 ? 'bg-gray-50/50' : ''} border-b border-[#E2E6EF]`}
                  >
                    <td className="px-3 py-2.5">{movimiento.fecha}</td>
                    <td className="px-3 py-2.5 font-medium">{movimiento.materialCodigo}</td>
                    <td className="px-3 py-2.5">{movimiento.materialDescripcion}</td>
                    <td className="px-3 py-2.5 uppercase">{movimiento.tipo}</td>
                    <td className="px-3 py-2.5 text-center">{movimiento.cantidad}</td>
                    <td className="px-3 py-2.5">{movimiento.documento}</td>
                    <td className="px-3 py-2.5">{movimiento.usuario}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === tabs[2] && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-[#E2E6EF] p-4">
            <label className="block text-xs font-medium text-[#6B7A99] uppercase tracking-wider mb-1">
              Material
            </label>
            <select
              value={selectedMaterialId}
              onChange={(e) => setSelectedMaterialId(e.target.value)}
              className={inputCls}
            >
              <option value="">Seleccionar...</option>
              {state.materiales.map((material) => (
                <option key={material.id} value={material.id}>
                  {material.codigo} - {material.descripcion}
                </option>
              ))}
            </select>
          </div>
          <div className="bg-white rounded-xl border border-[#E2E6EF] overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-[#E2E6EF]">
                  {['Fecha', 'Tipo', 'Documento', 'Ingreso', 'Salida', 'Saldo'].map((header) => (
                    <th key={header} className={thCls}>
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {kardexMaterial.map((movimiento, index) => (
                  <tr
                    key={movimiento.id}
                    className={`${index % 2 ? 'bg-gray-50/50' : ''} border-b border-[#E2E6EF]`}
                  >
                    <td className="px-3 py-2.5">{movimiento.fecha}</td>
                    <td className="px-3 py-2.5 uppercase">{movimiento.tipo}</td>
                    <td className="px-3 py-2.5">{movimiento.documento}</td>
                    <td className="px-3 py-2.5 text-center">
                      {movimiento.tipo === 'ingreso' ? movimiento.cantidad : '-'}
                    </td>
                    <td className="px-3 py-2.5 text-center">
                      {movimiento.tipo === 'salida' ? movimiento.cantidad : '-'}
                    </td>
                    <td className="px-3 py-2.5 text-center font-semibold">{movimiento.saldo}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === tabs[3] && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-[#E2E6EF] p-4">
            <label className="block text-xs font-medium text-[#6B7A99] uppercase tracking-wider mb-1">
              Familia
            </label>
            <select
              value={selectedFamilia}
              onChange={(e) => setSelectedFamilia(e.target.value)}
              className={inputCls}
            >
              <option value="">Seleccionar...</option>
              {familias.map((familia) => (
                <option key={familia} value={familia}>
                  {familia}
                </option>
              ))}
            </select>
          </div>
          <div className="bg-white rounded-xl border border-[#E2E6EF] overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-[#E2E6EF]">
                  {['Fecha', 'Código', 'Descripción', 'Tipo', 'Cantidad', 'Documento'].map((header) => (
                    <th key={header} className={thCls}>
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {kardexFamilia.map((movimiento, index) => (
                  <tr
                    key={movimiento.id}
                    className={`${index % 2 ? 'bg-gray-50/50' : ''} border-b border-[#E2E6EF]`}
                  >
                    <td className="px-3 py-2.5">{movimiento.fecha}</td>
                    <td className="px-3 py-2.5 font-medium">{movimiento.materialCodigo}</td>
                    <td className="px-3 py-2.5">{movimiento.materialDescripcion}</td>
                    <td className="px-3 py-2.5 uppercase">{movimiento.tipo}</td>
                    <td className="px-3 py-2.5 text-center">{movimiento.cantidad}</td>
                    <td className="px-3 py-2.5">{movimiento.documento}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === tabs[4] && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-[#E2E6EF] p-4">
            <label className="block text-xs font-medium text-[#6B7A99] uppercase tracking-wider mb-1">
              Tipo de movimiento
            </label>
            <select
              value={histFiltroTipo}
              onChange={(e) => setHistFiltroTipo(e.target.value)}
              className={inputCls}
            >
              <option value="">Todos</option>
              <option value="ingreso">Ingreso</option>
              <option value="salida">Salida</option>
              <option value="ajuste">Ajuste</option>
            </select>
          </div>
          <div className="bg-white rounded-xl border border-[#E2E6EF] overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-[#E2E6EF]">
                  {['Fecha', 'Tipo', 'Código', 'Descripción', 'Cantidad', 'Documento', 'Usuario'].map(
                    (header) => (
                      <th key={header} className={thCls}>
                        {header}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {historial.map((movimiento, index) => (
                  <tr
                    key={movimiento.id}
                    className={`${index % 2 ? 'bg-gray-50/50' : ''} border-b border-[#E2E6EF]`}
                  >
                    <td className="px-3 py-2.5">{movimiento.fecha}</td>
                    <td className="px-3 py-2.5 uppercase">{movimiento.tipo}</td>
                    <td className="px-3 py-2.5 font-medium">{movimiento.materialCodigo}</td>
                    <td className="px-3 py-2.5">{movimiento.materialDescripcion}</td>
                    <td className="px-3 py-2.5 text-center">{movimiento.cantidad}</td>
                    <td className="px-3 py-2.5">{movimiento.documento}</td>
                    <td className="px-3 py-2.5">{movimiento.usuario}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </motion.div>
  );
}