import { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, Pencil } from 'lucide-react';
import { StoredUser, useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';

const tabs = ['Usuarios', 'Perfil', 'Sistema'] as const;

export default function Configuracion() {
  const { state: authState, saveUsers } = useAuth();
  const { state: appState } = useApp();
  const [activeTab, setActiveTab] = useState<string>(tabs[0]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [form, setForm] = useState({
    nombre: '',
    username: '',
    password: '',
    rol: 'Consulta' as StoredUser['rol'],
    planta: 'Planta Principal',
    avatar: '',
  });
  const isAdmin = authState.user?.rol === 'Administrador';

  const openCreate = () => {
    setEditingUserId(null);
    setForm({
      nombre: '',
      username: '',
      password: '',
      rol: 'Consulta',
      planta: 'Planta Principal',
      avatar: '',
    });
    setModalOpen(true);
  };

  const openEdit = (user: StoredUser) => {
    setEditingUserId(user.id);
    setForm({
      nombre: user.nombre,
      username: user.username,
      password: user.password,
      rol: user.rol,
      planta: user.planta,
      avatar: user.avatar,
    });
    setModalOpen(true);
  };

  const handleSaveUser = () => {
    const avatar = form.avatar || form.nombre.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase();
    const nextUser: StoredUser = {
      id: editingUserId ?? `user-${Date.now()}`,
      nombre: form.nombre,
      username: form.username,
      password: form.password,
      rol: form.rol,
      planta: form.planta,
      avatar,
    };
    const nextUsers = editingUserId
      ? authState.users.map((user) => (user.id === editingUserId ? nextUser : user))
      : [...authState.users, nextUser];
    saveUsers(nextUsers);
    setModalOpen(false);
  };

  const handleDeleteUser = (userId: string) => {
    if (authState.user?.id === userId) return;
    saveUsers(authState.users.filter((user) => user.id !== userId));
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      {/* Tabs */}
      <div className="flex gap-1 border-b border-[#E2E6EF]">
        {tabs.map(t => (
          <button key={t} onClick={() => setActiveTab(t)} className={`px-4 py-2.5 text-sm whitespace-nowrap transition-colors ${activeTab === t ? 'border-b-2 border-[#E8672C] text-[#E8672C] font-semibold' : 'text-[#6B7A99] hover:text-[#1B2A4A]'}`}>{t}</button>
        ))}
      </div>

      {/* Tab: Usuarios */}
      {activeTab === tabs[0] && (
        <div className="space-y-4">
          {!isAdmin && <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800">Solo los administradores pueden gestionar usuarios.</div>}
          {isAdmin && (
            <div className="flex justify-end">
              <Button onClick={openCreate}>Nuevo Usuario</Button>
            </div>
          )}
          <div className="bg-white rounded-xl border border-[#E2E6EF] overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="bg-gray-50 border-b border-[#E2E6EF]">
                {['Nombre','Usuario','Rol','Planta','Estado','Acciones'].map(h => (
                  <th key={h} className="px-4 py-3 text-left uppercase text-xs tracking-wider font-semibold text-[#6B7A99]">{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {authState.users.map((u, i) => (
                  <tr key={u.id} className={`${i%2 ? 'bg-gray-50/50' : ''} border-b border-[#E2E6EF]`}>
                    <td className="px-4 py-3 flex items-center gap-2"><div className="w-8 h-8 rounded-full bg-[#1B2A4A] text-white text-xs font-bold flex items-center justify-center">{u.nombre.split(' ').map(n => n[0]).join('')}</div>{u.nombre}</td>
                    <td className="px-4 py-3 text-[#6B7A99]">{u.username}</td>
                    <td className="px-4 py-3"><Badge variant={u.rol === 'Administrador' ? 'danger' : u.rol === 'Supervisor' ? 'warning' : 'info'}>{u.rol}</Badge></td>
                    <td className="px-4 py-3 text-[#6B7A99]">{u.planta}</td>
                    <td className="px-4 py-3"><Badge variant="success">Activo</Badge></td>
                    <td className="px-4 py-3">
                      {isAdmin && (
                        <div className="flex gap-2">
                          <button onClick={() => openEdit(u)} className="p-1.5 rounded hover:bg-gray-100 text-[#6B7A99]"><Pencil className="w-4 h-4" /></button>
                          <button
                            onClick={() => handleDeleteUser(u.id)}
                            disabled={authState.user?.id === u.id}
                            className="px-2 py-1 text-xs rounded bg-red-50 text-red-600 disabled:opacity-40"
                          >
                            Eliminar
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingUserId ? 'Editar Usuario' : 'Nuevo Usuario'} size="md">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-xs font-medium text-[#6B7A99] uppercase tracking-wider mb-1">Nombre</label>
                <input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} className="w-full border border-[#E2E6EF] rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#6B7A99] uppercase tracking-wider mb-1">Usuario</label>
                <input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} className="w-full border border-[#E2E6EF] rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#6B7A99] uppercase tracking-wider mb-1">Contraseña</label>
                <input value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="w-full border border-[#E2E6EF] rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#6B7A99] uppercase tracking-wider mb-1">Rol</label>
                <select value={form.rol} onChange={(e) => setForm({ ...form, rol: e.target.value as StoredUser['rol'] })} className="w-full border border-[#E2E6EF] rounded-lg px-3 py-2 text-sm">
                  <option>Administrador</option>
                  <option>Supervisor</option>
                  <option>Bodeguero</option>
                  <option>Consulta</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancelar</Button>
              <Button onClick={handleSaveUser}>Guardar</Button>
            </div>
          </Modal>
        </div>
      )}

      {/* Tab: Perfil */}
      {activeTab === tabs[1] && authState.user && (
        <div className="max-w-lg">
          <div className="bg-white rounded-xl border border-[#E2E6EF] p-4">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-[#E8672C] text-white text-xl font-bold flex items-center justify-center">{authState.user.avatar}</div>
              <div>
                <h3 className="text-lg font-semibold text-[#1B2A4A]">{authState.user.nombre}</h3>
                <p className="text-sm text-[#6B7A99]">{authState.user.rol} — {authState.user.planta}</p>
              </div>
            </div>
            <div className="space-y-4">
              {[{ l: 'Nombre completo', v: authState.user.nombre }, { l: 'Usuario', v: authState.user.username }, { l: 'Rol', v: authState.user.rol }, { l: 'Planta', v: authState.user.planta }].map(({ l, v }) => (
                <div key={l}><label className="block text-xs font-medium text-[#6B7A99] uppercase tracking-wider mb-1">{l}</label>
                <input readOnly value={v} className="w-full border border-[#E2E6EF] rounded-lg px-3 py-2 text-sm bg-gray-50" /></div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab: Sistema */}
      {activeTab === tabs[2] && (
        <div className="max-w-lg space-y-4">
          <div className="bg-white rounded-xl border border-[#E2E6EF] p-4">
            <h3 className="font-display font-semibold text-[#1B2A4A] mb-4 flex items-center gap-2"><Settings className="w-5 h-5" />Información del Sistema</h3>
            <div className="space-y-3 text-sm">
              {[
                ['Versión', '1.0.0'],
                ['Módulos activos', '13'],
                ['Materiales registrados', String(appState.materiales.length)],
                ['Activos registrados', String(appState.activos.length)],
                ['Vehículos registrados', String(appState.vehiculos.length)],
                ['Movimientos totales', String(appState.movimientos.length)],
                ['Alertas activas', String(appState.alertas.filter(a => !a.resuelta).length)],
              ].map(([label, val]) => (
                <div key={label} className="flex justify-between py-2 border-b border-[#E2E6EF] last:border-0">
                  <span className="text-[#6B7A99]">{label}</span>
                  <span className="font-medium text-[#1B2A4A]">{val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
