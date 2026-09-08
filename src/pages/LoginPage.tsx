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
      setError(toApiError(caught).message ?? 'Dang nhap khong thanh cong');
    }
  };

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <>
      <h1 className="page-title">Dang nhap</h1>
      <form className="form-stack" onSubmit={onSubmit}>
        <label>
          Tai khoan hoac email
          <input
            autoComplete="username"
            required
            value={usernameOrEmail}
            onChange={(event) => setUsernameOrEmail(event.target.value)}
          />
        </label>
        <label>
          Mat khau
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
          Dang nhap
        </button>
        <Link to="/register">Tao tai khoan doan vien</Link>
      </form>
    </>
  );
};
