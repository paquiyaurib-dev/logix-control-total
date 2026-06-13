import type { ReactNode } from 'react';
import { usePermissions } from '../../context/PermissionContext';

interface PermissionGuardProps {
  allow: boolean;
  children: ReactNode;
  fallback?: ReactNode;
}

export default function PermissionGuard({ allow, children, fallback = null }: PermissionGuardProps) {
  const permissions = usePermissions();
  return allow && !permissions.isReadOnly ? <>{children}</> : <>{fallback}</>;
}