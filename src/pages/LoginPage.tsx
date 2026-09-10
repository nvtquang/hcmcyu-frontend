import { FormEvent, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../stores/AuthContext';
import { toApiError } from '../utils/apiError';

export const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, isLoading } = useAuth();
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);

    try {
      await login({ usernameOrEmail, password });
      const destination = typeof location.state?.from?.pathname === 'string' ? location.state.from.pathname : '/dashboard';
      navigate(destination, { replace: true });
    } catch (caught) {
      setError(toApiError(caught).message ?? 'Đăng nhập không thành công');
    }
  };

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <>
      <p className="page-eyebrow">HCMCYU Thượng Cát</p>
      <h1 className="page-title">Đăng nhập hệ thống</h1>
      <p className="page-description">Quản lý đoàn viên, sự kiện, thông báo và hoạt động Đoàn.</p>
      <form className="form-stack section-gap" onSubmit={onSubmit}>
        <label>
          Tài khoản hoặc email
          <input
            autoComplete="username"
            required
            value={usernameOrEmail}
            onChange={(event) => setUsernameOrEmail(event.target.value)}
          />
        </label>
        <label>
          Mật khẩu
          <input
            autoComplete="current-password"
            required
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>
        {error && <div className="error-box">{error}</div>}
        <button className="primary-button" type="submit" disabled={isLoading}>
          Đăng nhập
        </button>
        <Link className="text-action" to="/register">
          Tạo tài khoản đoàn viên
        </Link>
      </form>
    </>
  );
};
