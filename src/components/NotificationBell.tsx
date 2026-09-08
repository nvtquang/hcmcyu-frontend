import { Link } from 'react-router-dom';
import { useUnreadNotifications } from '../hooks/useNotifications';

export const NotificationBell = () => {
  const unreadQuery = useUnreadNotifications();
  const count = unreadQuery.data?.count ?? 0;

  return (
    <Link className="notification-bell" to="/notifications" aria-label={`Thông báo chưa đọc: ${count}`}>
      <span aria-hidden="true">🔔</span>
      {count > 0 && <strong>{count > 99 ? '99+' : count}</strong>}
    </Link>
  );
};
