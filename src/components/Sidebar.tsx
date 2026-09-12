import { Link, NavLink } from 'react-router-dom';
import {
  Bell,
  CalendarDays,
  FileText,
  Home,
  Landmark,
  LayoutDashboard,
  MessageSquare,
  ScrollText,
  ShieldCheck,
  UserRound,
  UsersRound,
} from 'lucide-react';
import { useMyProfile } from '../hooks/useMembers';
import { useAuth } from '../stores/AuthContext';
import type { NavigationItem } from '../types/navigation';
import { resolveAssetUrl } from '../utils/assetUrl';
import { roleLabel } from '../utils/labels';
import { UserAvatar } from './ui';

type SidebarProps = {
  items: NavigationItem[];
  isOpen: boolean;
  onClose: () => void;
};

export const Sidebar = ({ items, isOpen, onClose }: SidebarProps) => {
  const { logout, user } = useAuth();
  const profileQuery = useMyProfile(Boolean(user?.memberId));
  const profile = profileQuery.data;
  const displayName = profile?.fullName ?? user?.username;
  const avatarUrl = resolveAssetUrl(profile?.avatarUrl);
  const groups = [
    { key: 'overview', label: 'Tổng quan' },
    { key: 'personal', label: 'Cá nhân' },
    { key: 'activity', label: 'Hoạt động' },
    { key: 'management', label: 'Quản lý' },
    { key: 'system', label: 'Hệ thống' },
  ] as const;
  const iconMap = {
    dashboard: LayoutDashboard,
    members: UsersRound,
    organizations: Landmark,
    events: CalendarDays,
    posts: FileText,
    chat: MessageSquare,
    notifications: Bell,
    profile: UserRound,
    audit: ShieldCheck,
  } as const;

  return (
    <>
      <div className={isOpen ? 'sidebar-backdrop open' : 'sidebar-backdrop'} onClick={onClose} />
      <aside className={isOpen ? 'sidebar open' : 'sidebar'}>
        <Link className="brand" to="/dashboard" onClick={onClose}>
          <div className="brand-mark">
            <Home size={22} aria-hidden="true" />
          </div>
          <div>
            <strong>HCMCYU</strong>
            <span>Phường Thượng Cát</span>
          </div>
        </Link>
        {user && (
          <div className="user-summary">
            <UserAvatar name={displayName} src={avatarUrl} size="sm" />
            <div>
              <strong>{displayName}</strong>
              <span>{roleLabel[user.role] ?? user.role}</span>
            </div>
          </div>
        )}
        <nav className="nav-list" aria-label="Main navigation">
          {groups.map((group) => {
            const groupItems = items.filter((item) => item.group === group.key);

            if (!groupItems.length) {
              return null;
            }

            return (
              <div className="nav-group" key={group.key}>
                <span className="nav-group-label">{group.label}</span>
                {groupItems.map((item) => {
                  const Icon = iconMap[item.icon] ?? ScrollText;
                  return (
                    <NavLink key={item.to} className="nav-link" to={item.to} onClick={onClose}>
                      <Icon size={18} aria-hidden="true" />
                      <span>{item.label}</span>
                    </NavLink>
                  );
                })}
              </div>
            );
          })}
        </nav>
        <button className="secondary-button" type="button" onClick={logout}>
          Đăng xuất
        </button>
      </aside>
    </>
  );
};
