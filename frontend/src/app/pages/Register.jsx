import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [form, setForm] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm(prev => ({
      ...prev,
      [name]: value
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (form.password !== form.confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      await register(form.email, form.password, form.confirmPassword);
      navigate('/profile');
    } catch (err) {
      const data = err.response?.data;

      if (data?.errors) {
        setError(Array.isArray(data.errors) ? data.errors.join(', ') : 'Ошибка регистрации');
      } else {
        setError(data?.message || 'Ошибка регистрации');
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h1>Регистрация</h1>

        {error && <div className="auth-error">{error}</div>}

        <label>
          Email
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Пароль
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Повторите пароль
          <input
            type="password"
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={handleChange}
            required
          />
        </label>

        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Регистрация...' : 'Зарегистрироваться'}
        </button>
      </form>
    </main>
  );
}