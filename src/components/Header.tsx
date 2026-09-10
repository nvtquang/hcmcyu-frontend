import { LogOut, Menu, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../stores/AuthContext';
import { roleLabel } from '../utils/labels';
import { NotificationBell } from './NotificationBell';
import { UserAvatar } from './ui';

type HeaderProps = {
  onMenuClick: () => void;
};

export const Header = ({ onMenuClick }: HeaderProps) => {
  const { logout, user } = useAuth();

  return (
    <header className="app-header">
      <button className="icon-button menu-button" type="button" onClick={onMenuClick} aria-label="Mở menu">
        <Menu size={20} aria-hidden="true" />
      </button>
      <Link className="header-heading" to="/dashboard">
        <div className="header-title">HCMCYU Thượng Cát</div>
        <div className="header-subtitle">Đoàn TNCS Hồ Chí Minh</div>
      </Link>
      <div className="header-search" role="search">
        <Search size={17} aria-hidden="true" />
        <span>Tìm kiếm nhanh</span>
      </div>
      {user && (
        <div className="header-right">
          <NotificationBell />
          <div className="header-user">
            <UserAvatar name={user.username} size="sm" />
            <div>
              <strong>{user.username}</strong>
              <span>{roleLabel[user.role] ?? user.role}</span>
            </div>
          </div>
          <button className="icon-button" type="button" onClick={logout} aria-label="Đăng xuất" title="Đăng xuất">
            <LogOut size={18} aria-hidden="true" />
          </button>
        </div>
      )}
    </header>
  );
};
