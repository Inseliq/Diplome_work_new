import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useProfile } from '../hooks/useProfile';
import { useAuth } from '../context/AuthContext';
import { LoadingSpinner } from '../components/ui/StatusComponents';

const VISIBLE_ROLES = ['Administrator', 'Moderator'];

function getVisibleRoles(roles = []) {
  return roles.filter((role) => VISIBLE_ROLES.includes(role));
}

function ChangePasswordModal({ onClose, onSubmit }) {
  const [form, setForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const updateField = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);

    if (form.newPassword !== form.confirmNewPassword) {
      setError('Пароли не совпадают');
      return;
    }

    setSubmitting(true);

    try {
      await onSubmit(form);
      onClose();
    } catch (err) {
      setError(err?.data?.message || err?.message || 'Не удалось изменить пароль');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="profile-modal" role="dialog" aria-modal="true">
      <div className="profile-modal__overlay" onClick={onClose} />

      <div className="profile-modal__content">
        <div className="profile-modal__header">
          <h2>Изменить пароль</h2>

          <button
            type="button"
            className="profile-modal__close"
            onClick={onClose}
            aria-label="Закрыть"
          >
            ×
          </button>
        </div>

        <form className="profile-modal__form" onSubmit={handleSubmit}>
          <label className="profile-form__field">
            <span>Старый пароль</span>
            <input
              type="password"
              value={form.currentPassword}
              onChange={(event) => updateField('currentPassword', event.target.value)}
              required
            />
          </label>

          <label className="profile-form__field">
            <span>Новый пароль</span>
            <input
              type="password"
              value={form.newPassword}
              onChange={(event) => updateField('newPassword', event.target.value)}
              required
              minLength={8}
            />
          </label>

          <label className="profile-form__field">
            <span>Повтор нового пароля</span>
            <input
              type="password"
              value={form.confirmNewPassword}
              onChange={(event) => updateField('confirmNewPassword', event.target.value)}
              required
              minLength={8}
            />
          </label>

          {error && (
            <div className="profile-modal__error">
              {error}
            </div>
          )}

          <div className="profile-modal__actions">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={onClose}
              disabled={submitting}
            >
              Отмена
            </button>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
            >
              {submitting ? 'Сохраняем...' : 'Сохранить пароль'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Profile() {
  const {
    profile,
    loading,
    error,
    reload,
    changePassword,
    leaveCurrentClan,
  } = useProfile();

  const { refreshUser } = useAuth();

  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [leavingClan, setLeavingClan] = useState(false);
  const [message, setMessage] = useState(null);

  if (loading) {
    return (
      <div className="wrapper profile-page">
        <div className="container">
          <LoadingSpinner text="Загружаем профиль..." />
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="wrapper profile-page">
        <div className="container">
          <div
            className="profile-page__empty reveal reveal--visible"
            style={{ padding: '32px', textAlign: 'center' }}
          >
            <h1>К сожалению, не удалось загрузить профиль.</h1>
            <p>Пожалуйста, попробуйте ещё раз.</p>

            <div
              style={{
                display: 'flex',
                gap: '12px',
                justifyContent: 'center',
                marginTop: '20px',
                flexWrap: 'wrap',
              }}
            >
              <button className="btn btn-primary" onClick={reload}>
                Попробовать снова
              </button>

              <Link className="btn btn-ghost" to="/">
                На главную
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const visibleRoles = getVisibleRoles(profile.roles);

  const handleLeaveClan = async () => {
    const confirmed = window.confirm('Вы точно хотите покинуть клан?');

    if (!confirmed) return;

    setLeavingClan(true);
    setMessage(null);

    try {
      const result = await leaveCurrentClan();
      await refreshUser?.();
      setMessage(result?.message || 'Вы покинули клан');
    } catch (err) {
      setMessage(err?.data?.message || err?.message || 'Не удалось покинуть клан');
    } finally {
      setLeavingClan(false);
    }
  };

  const handleChangePassword = async (payload) => {
    const result = await changePassword(payload);
    setMessage(result?.message || 'Пароль успешно изменён');
  };

  return (
    <div className="wrapper profile-page">
      <div className="container">
        <div className="profile-page__header reveal">
          <div className="profile-page__label">
            Аккаунт
          </div>

          <h1 className="profile-page__title">
            Профиль
          </h1>

          <p className="profile-page__subtitle">
            Основная информация о пользователе, клане и участии в турнирах.
          </p>
        </div>

        {message && (
          <div className="profile-page__message reveal">
            {message}
          </div>
        )}

        <section className="profile-card reveal">
          <div className="profile-card__header">
            <h2>Информация</h2>
          </div>

          <div className="profile-card__grid">
            <div className="profile-field">
              <span className="profile-field__label">Никнейм</span>
              <strong className="profile-field__value">{profile.nickname}</strong>
            </div>

            <div className="profile-field">
              <span className="profile-field__label">Почта</span>
              <strong className="profile-field__value">{profile.email}</strong>
            </div>

            <div className="profile-field">
              <span className="profile-field__label">Клан</span>

              {profile.clan ? (
                <Link to="/clan/me" className="profile-field__value profile-field__link">
                  {profile.clan.tag}
                </Link>
              ) : (
                <strong className="profile-field__value">
                  Вы пока не в клане
                </strong>
              )}
            </div>

            {profile.clan && profile.clanRankLabel && (
              <div className="profile-field">
                <span className="profile-field__label">Звание</span>
                <strong className="profile-field__value">
                  {profile.clanRankLabel}
                </strong>
              </div>
            )}

            {visibleRoles.length > 0 && (
              <div className="profile-field">
                <span className="profile-field__label">Роль</span>
                <strong className="profile-field__value">
                  {visibleRoles.join(', ')}
                </strong>
              </div>
            )}
          </div>

          <div className="profile-card__actions">
            <button
              className="btn btn-primary"
              onClick={() => setPasswordModalOpen(true)}
            >
              Изменить пароль
            </button>

            {profile.clan && (
              <button
                className="btn btn-ghost"
                onClick={handleLeaveClan}
                disabled={leavingClan}
              >
                {leavingClan ? 'Выходим...' : 'Покинуть клан'}
              </button>
            )}
          </div>
        </section>

        <section className="profile-card reveal">
          <div className="profile-card__header">
            <h2>Участие в турнирах</h2>
          </div>

          {profile.tournaments?.length > 0 ? (
            <div className="profile-tournaments">
              {profile.tournaments.map((item) => (
                <Link
                  key={item.registrationId}
                  to={`/tournaments/custom/details/${item.tournamentId}`}
                  className="profile-tournament"
                >
                  <div className="profile-tournament__main">
                    <h3>{item.tournamentName}</h3>
                    <p>Команда: {item.teamName}</p>
                  </div>

                  <div className="profile-tournament__meta">
                    <span>{item.format}</span>
                    <span>Уровень: {item.tier}</span>
                    <span>Статус: {item.tournamentStatus}</span>
                    <span>Регистрация: {item.registeredAt}</span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="profile-card__empty">
              Вы пока не участвуете в турнирах.
            </p>
          )}
        </section>

        {passwordModalOpen && (
          <ChangePasswordModal
            onClose={() => setPasswordModalOpen(false)}
            onSubmit={handleChangePassword}
          />
        )}
      </div>
    </div>
  );
}

export default Profile;