import { useApp } from '../context/AppContext';

export function useAlerts() {
  const { state, markAlertaRead, resolveAlerta } = useApp();

  const unreadCount = state.alertas.filter((a) => !a.leida).length;
  const unresolvedCount = state.alertas.filter((a) => !a.resuelta).length;
  const dangerAlerts = state.alertas.filter((a) => a.severidad === 'danger' && !a.resuelta);
  const warningAlerts = state.alertas.filter((a) => a.severidad === 'warning' && !a.resuelta);

  return { alerts: state.alertas, unreadCount, unresolvedCount, dangerAlerts, warningAlerts, markAlertaRead, resolveAlerta };
}
