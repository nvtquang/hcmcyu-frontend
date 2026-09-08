import { AdminLayout } from './AdminLayout';
import { MemberLayout } from './MemberLayout';
import { useAuth } from '../stores/AuthContext';

export const RoleLayout = () => {
  const { role } = useAuth();

  if (role === 'MEMBER') {
    return <MemberLayout />;
  }

  return <AdminLayout />;
};

