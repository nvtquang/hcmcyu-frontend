import { useMemo, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from '../components/Header';
import { Sidebar } from '../components/Sidebar';
import { getNavigationForRole } from '../routes/navigation';
import { useAuth } from '../stores/AuthContext';
import type { LayoutRoleGroup } from '../types/navigation';

type MainLayoutProps = {
  roleGroup: LayoutRoleGroup;
};

export const MainLayout = ({ roleGroup }: MainLayoutProps) => {
  const { role } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigationItems = useMemo(() => getNavigationForRole(role), [role]);

  return (
    <div className={`app-shell ${roleGroup}-shell`}>
      <Sidebar items={navigationItems} isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div className="app-main">
        <Header onMenuClick={() => setIsSidebarOpen(true)} />
        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

