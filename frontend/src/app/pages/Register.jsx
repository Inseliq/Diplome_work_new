import { useState } from 'react';
import { useNavigate, Link, useSearchParams, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function getSafeReturnUrl(url) {
  if (!url) return '/';

  // Разрешаем только внутренние ссылки сайта
  if (!url.startsWith('/')) {
    return '/';
  }

  // Защита от ссылок вида //evil-site.com
  if (url.startsWith('//')) {
    return '/';
  }

  return url;
}

function getErrorMessage(err) {
  if (err?.data?.errors) {
    if (Array.isArray(err.data.errors)) {
      return err.data.errors.join(', ');
    }

    if (typeof err.data.errors === 'object') {
      return Object.values(err.data.errors).flat().join(', ');
    }
  }

  if (err?.data?.message) {
    return err.data.message;
  }

  if (err?.message) {
    return err.message;
  }

  return 'Ошибка регистрации';
}

export default function Register() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { register, user } = useAuth();

  const returnUrl = searchParams.get('returnUrl') || '/';
  const safeReturnUrl = getSafeReturnUrl(returnUrl);

  const loginUrl = safeReturnUrl !== '/'
    ? `/login?returnUrl=${encodeURIComponent(safeReturnUrl)}`
    : '/login';

  const [form, setForm] = useState({
    nickname: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [error, setError] = useState('');
  const [isLoading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showConf, setShowConf] = useState(false);

  if (user) {
    return <Navigate to={safeReturnUrl} replace />;
  }

  const nicknameRegex = /^[A-Za-z0-9_]{3,24}$/;

  function handleChange(e) {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (error) {
      setError('');
    }
  }

  const passStrength = (() => {
    const password = form.password;

    if (!password) return 0;

    let strength = 0;

    if (password.length >= 8) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;

    return strength;
  })();

  const passMatch = Boolean(
    form.confirmPassword &&
    form.password === form.confirmPassword
  );

  const passMismatch = Boolean(
    form.confirmPassword &&
    form.password !== form.confirmPassword
  );

  function validateForm() {
    const nickname = form.nickname.trim();
    const email = form.email.trim();

    if (!nickname) {
      return 'Введите никнейм';
    }

    if (!nicknameRegex.test(nickname)) {
      return 'Никнейм должен быть от 3 до 24 символов и может содержать только A-Z, a-z, 0-9 и _.';
    }

    if (!email) {
      return 'Введите email';
    }

    if (!form.password) {
      return 'Введите пароль';
    }

    if (form.password.length < 8) {
      return 'Пароль должен быть не короче 8 символов';
    }

    if (!form.confirmPassword) {
      return 'Повторите пароль';
    }

    if (form.password !== form.confirmPassword) {
      return 'Пароли не совпадают';
    }

    return null;
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    setError('');
    setLoading(true);

    try {
      await register(
        form.nickname.trim(),
        form.email.trim(),
        form.password,
        form.confirmPassword
      );

      navigate(safeReturnUrl, {
        replace: true,
      });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-bg">
        <div className="auth-bg__glow auth-bg__glow--1" />
        <div className="auth-bg__glow auth-bg__glow--2" />
      </div>

      <div className="auth-card">
        <div className="auth-card__header">
          <div className="auth-card__icon">
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <line x1="19" y1="8" x2="19" y2="14" />
              <line x1="22" y1="11" x2="16" y2="11" />
            </svg>
          </div>

          <h1 className="auth-card__title">Регистрация</h1>
          <p className="auth-card__subtitle">Создайте аккаунт CosmoManager</p>
        </div>

        {error && (
          <div className="auth-error">
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>

            {error}
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-field">
            <label className="auth-label" htmlFor="reg-nickname">
              Никнейм
            </label>

            <div className="auth-input-wrap">
              <svg
                className="auth-input-icon"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>

              <input
                id="reg-nickname"
                className="auth-input"
                type="text"
                name="nickname"
                value={form.nickname}
                onChange={handleChange}
                placeholder="Ваш никнейм"
                autoComplete="username"
                minLength={3}
                maxLength={24}
                pattern="[A-Za-z0-9_]{3,24}"
                title="Никнейм должен быть от 3 до 24 символов и может содержать только A-Z, a-z, 0-9 и _."
                required
              />
            </div>

            <span className="auth-field__hint">
              Только A-Z, a-z, 0-9 и _. От 3 до 24 символов.
            </span>
          </div>

          <div className="auth-field">
            <label className="auth-label" htmlFor="reg-email">
              Email
            </label>

            <div className="auth-input-wrap">
              <svg
                className="auth-input-icon"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>

              <input
                id="reg-email"
                className="auth-input"
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                autoComplete="email"
                required
              />
            </div>
          </div>

          <div className="auth-field">
            <label className="auth-label" htmlFor="reg-password">
              Пароль
            </label>

            <div className="auth-input-wrap">
              <svg
                className="auth-input-icon"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>

              <input
                id="reg-password"
                className="auth-input auth-input--pass"
                type={showPass ? 'text' : 'password'}
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Минимум 8 символов"
                autoComplete="new-password"
                minLength={8}
                required
              />

              <button
                type="button"
                className="auth-pass-toggle"
                onClick={() => setShowPass((v) => !v)}
                aria-label={showPass ? 'Скрыть пароль' : 'Показать пароль'}
              >
                {showPass ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>

            {form.password && (
              <div className="auth-strength">
                <div className="auth-strength__bars">
                  {[1, 2, 3, 4].map((lvl) => (
                    <div
                      key={lvl}
                      className={`auth-strength__bar${passStrength >= lvl
                          ? ` auth-strength__bar--${passStrength >= 3
                            ? 'strong'
                            : passStrength === 2
                              ? 'medium'
                              : 'weak'
                          }`
                          : ''
                        }`}
                    />
                  ))}
                </div>

                <span className="auth-strength__label">
                  {passStrength <= 1
                    ? 'Слабый'
                    : passStrength === 2
                      ? 'Средний'
                      : passStrength === 3
                        ? 'Хороший'
                        : 'Надёжный'}
                </span>
              </div>
            )}
          </div>

          <div className="auth-field">
            <label className="auth-label" htmlFor="reg-confirm">
              Повторите пароль
            </label>

            <div className={`auth-input-wrap${passMatch ? ' auth-input-wrap--ok' : passMismatch ? ' auth-input-wrap--err' : ''}`}>
              <svg
                className="auth-input-icon"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>

              <input
                id="reg-confirm"
                className="auth-input auth-input--pass"
                type={showConf ? 'text' : 'password'}
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                autoComplete="new-password"
                required
              />

              <button
                type="button"
                className="auth-pass-toggle"
                onClick={() => setShowConf((v) => !v)}
                aria-label={showConf ? 'Скрыть пароль' : 'Показать пароль'}
              >
                {showConf ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>

              {passMatch && (
                <svg
                  className="auth-match-icon auth-match-icon--ok"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}

              {passMismatch && (
                <svg
                  className="auth-match-icon auth-match-icon--err"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              )}
            </div>

            {passMismatch && (
              <span className="auth-field__hint auth-field__hint--err">
                Пароли не совпадают
              </span>
            )}
          </div>

          <button
            className="auth-submit"
            type="submit"
            disabled={isLoading || passMismatch}
          >
            {isLoading ? (
              <>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  style={{ animation: 'auth-spin 0.8s linear infinite' }}
                >
                  <polyline points="1 4 1 10 7 10" />
                  <path d="M3.51 15a9 9 0 1 0 .49-3.5" />
                </svg>

                Создаём аккаунт...
              </>
            ) : (
              <>
                Зарегистрироваться

                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </>
            )}
          </button>
        </form>

        <div className="auth-card__footer">
          <span className="auth-card__footer-text">
            Уже есть аккаунт?
          </span>

          <Link to={loginUrl} className="auth-card__switch-link">
            Войти
          </Link>
        </div>
      </div>
    </div>
  );
}