import type { NavigationItem } from '../types/navigation';
import type { Role } from '../types/api';

const wardSecretaryMenu: NavigationItem[] = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/members', label: 'Đoàn viên' },
  { to: '/organizations', label: 'Tổ dân phố' },
  { to: '/events', label: 'Sự kiện' },
  { to: '/posts', label: 'Bài viết' },
  { to: '/chat', label: 'Chat' },
  { to: '/notifications', label: 'Thông báo' },
  { to: '/audit-logs', label: 'Audit / Phân quyền' },
];

const wardDeputyMenu: NavigationItem[] = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/members', label: 'Đoàn viên' },
  { to: '/organizations', label: 'Tổ dân phố' },
  { to: '/events', label: 'Sự kiện' },
  { to: '/posts', label: 'Bài viết' },
  { to: '/chat', label: 'Chat' },
  { to: '/notifications', label: 'Thông báo' },
];

const tdpAdminMenu: NavigationItem[] = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/members', label: 'Đoàn viên TDP' },
  { to: '/events', label: 'Sự kiện' },
  { to: '/posts', label: 'Báo cáo' },
  { to: '/chat', label: 'Chat' },
  { to: '/notifications', label: 'Thông báo' },
];

const memberMenu: NavigationItem[] = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/profile', label: 'Hồ sơ' },
  { to: '/events', label: 'Sự kiện' },
  { to: '/posts', label: 'Bài viết' },
  { to: '/chat', label: 'Chat' },
  { to: '/notifications', label: 'Thông báo' },
];

export const getNavigationForRole = (role: Role | null): NavigationItem[] => {
  switch (role) {
    case 'WARD_SECRETARY':
      return wardSecretaryMenu;
    case 'WARD_DEPUTY_SECRETARY':
      return wardDeputyMenu;
    case 'TDP_SECRETARY':
    case 'TDP_DEPUTY_SECRETARY':
      return tdpAdminMenu;
    case 'MEMBER':
      return memberMenu;
    default:
      return [];
  }
};

