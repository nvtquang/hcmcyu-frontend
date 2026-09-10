import { Link } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { useUnreadNotifications } from '../hooks/useNotifications';

export const NotificationBell = () => {
  const unreadQuery = useUnreadNotifications();
  const count = unreadQuery.data?.count ?? 0;

  return (
    <Link className="notification-bell" to="/notifications" aria-label="Thông báo" title="Thông báo">
      <Bell size={19} aria-hidden="true" />
      {count > 0 && <strong>{count}</strong>}
    </Link>
  );
};
