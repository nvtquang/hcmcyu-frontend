import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../stores/AuthContext';
import { toApiError } from '../utils/apiError';

export const RegisterPage = () => {
  const navigate = useNavigate();
  const { register, isLoading } = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);

    try {
      await register({ username, email, password });
      navigate('/dashboard', { replace: true });
    } catch (caught) {
      setError(toApiError(caught).message ?? 'Dang ky khong thanh cong');
    }
  };

  return (
    <>
      <h1 className="page-title">Dang ky</h1>
      <form className="form-stack" onSubmit={onSubmit}>
        <label>
          Ten dang nhap
          <input
            autoComplete="username"
            minLength={3}
            required
            value={username}
            onChange={(event) => setUsername(event.target.value)}
          />
        </label>
        <label>
          Email
          <input
            autoComplete="email"
            required
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </label>
        <label>
          Mat khau
          <input
            autoComplete="new-password"
            minLength={8}
            required
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>
        {error && <div className="error-box">{error}</div>}
        <button className="primary-button" type="submit" disabled={isLoading}>
          Dang ky
        </button>
        <Link to="/login">Da co tai khoan</Link>
      </form>
    </>
  );
};
