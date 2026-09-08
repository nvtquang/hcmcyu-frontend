import { useAuth } from '../stores/AuthContext';
import { NotificationBell } from './NotificationBell';

type HeaderProps = {
  onMenuClick: () => void;
};

export const Header = ({ onMenuClick }: HeaderProps) => {
  const { user } = useAuth();

  return (
    <header className="app-header">
      <button className="menu-button" type="button" onClick={onMenuClick} aria-label="Mở menu">
        ☰
      </button>
      <div>
        <div className="header-title">HCMCYU Thượng Cát</div>
        <div className="header-subtitle">{user?.organizationId ?? 'Đoàn TNCS Hồ Chí Minh'}</div>
      </div>
      {user && (
        <div className="header-right">
          <NotificationBell />
          <div className="header-user">
            <strong>{user.username}</strong>
            <span>{user.role}</span>
          </div>
        </div>
      )}
    </header>
  );
};
