import { NavLink } from 'react-router-dom';
import { useAuth } from '../stores/AuthContext';
import type { NavigationItem } from '../types/navigation';

type SidebarProps = {
  items: NavigationItem[];
  isOpen: boolean;
  onClose: () => void;
};

export const Sidebar = ({ items, isOpen, onClose }: SidebarProps) => {
  const { logout, user } = useAuth();

  return (
    <>
      <div className={isOpen ? 'sidebar-backdrop open' : 'sidebar-backdrop'} onClick={onClose} />
      <aside className={isOpen ? 'sidebar open' : 'sidebar'}>
        <div className="brand">HCMCYU</div>
        {user && (
          <div className="user-summary">
            <strong>{user.username}</strong>
            <span>{user.role}</span>
          </div>
        )}
        <nav className="nav-list" aria-label="Main navigation">
          {items.map((item) => (
            <NavLink key={item.to} className="nav-link" to={item.to} onClick={onClose}>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <button className="secondary-button" type="button" onClick={logout}>
          Đăng xuất
        </button>
      </aside>
    </>
  );
};

