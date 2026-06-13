import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { useAuth, type UserRole } from './AuthContext';

interface PermissionContextType {
  role: UserRole | null;
  canManageMaterials: boolean;
  canManageCatalogs: boolean;
  canManageUsers: boolean;
  canRegisterOperations: boolean;
  canViewReports: boolean;
  canViewKpis: boolean;
  canEditAssets: boolean;
  isReadOnly: boolean;
  hasRole: (...roles: UserRole[]) => boolean;
}

const PermissionContext = createContext<PermissionContextType | undefined>(undefined);

export function PermissionProvider({ children }: { children: ReactNode }) {
  const { state } = useAuth();
  const role = state.user?.rol ?? null;

  const value = useMemo<PermissionContextType>(() => ({
    role,
    canManageMaterials: role === 'Administrador',
    canManageCatalogs: role === 'Administrador',
    canManageUsers: role === 'Administrador',
    canRegisterOperations: role === 'Administrador' || role === 'Supervisor' || role === 'Bodeguero',
    canViewReports: role === 'Administrador' || role === 'Supervisor',
    canViewKpis: role === 'Administrador' || role === 'Supervisor',
    canEditAssets: role === 'Administrador',
    isReadOnly: role === 'Consulta',
    hasRole: (...roles: UserRole[]) => (role ? roles.includes(role) : false),
  }), [role]);

  return <PermissionContext.Provider value={value}>{children}</PermissionContext.Provider>;
}

export function usePermissions() {
  const context = useContext(PermissionContext);
  if (!context) throw new Error('usePermissions must be used within PermissionProvider');
  return context;
}