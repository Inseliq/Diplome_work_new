import React, { useEffect, useState } from 'react';
import { useParams, Link, Navigate, useNavigate } from 'react-router-dom';

import {
  TOURNAMENT_TYPES,
  TOURNAMENT_STATUS,
  TIER_ROMAN,
} from '../data/customsData';

import { useCustomTournamentDetail } from '../hooks/useTournaments';
import { registerToTournament } from '../../api/endpoints';
import { useAuth } from '../context/AuthContext';

const REG_STATUS = {
  sent: {
    label: 'Заявка отправлена',
    color: '#FAB81B',
    bg: 'rgba(250,184,27,0.1)',
    border: 'rgba(250,184,27,0.3)',
    icon: '📤',
  },
  confirmed: {
    label: 'Заявка принята',
    color: '#22c55e',
    bg: 'rgba(34,197,94,0.1)',
    border: 'rgba(34,197,94,0.3)',
    icon: '✅',
  },
};

function buildEmptyForm(teamSize, reserveSize) {
  return {
    teamName: '',
    captain: '',
    contact: '',
    members: Array(Math.max(0, teamSize - 1)).fill(''),
    reserves: Array(Math.max(0, reserveSize)).fill(''),
  };
}

function PlayerInput({
  label,
  value,
  onChange,
  disabled,
  placeholder,
  required,
}) {
  return (
    <div className="reg-field">
      <label className="reg-field__label">
        {label}
        {required && <span className="reg-field__req">*</span>}
      </label>

      <div className="reg-field__input-wrap">
        <svg
          className="reg-field__icon"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>

        <input
          type="text"
          className="reg-field__input"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          placeholder={placeholder ?? 'Ник игрока'}
          maxLength={64}
        />
      </div>
    </div>
  );
}

function StatusBanner({ status }) {
  const cfg = REG_STATUS[status] ?? REG_STATUS.sent;

  return (
    <div
      className="reg-status-banner"
      style={{
        '--s-color': cfg.color,
        '--s-bg': cfg.bg,
        '--s-border': cfg.border,
      }}
    >
      <div className="reg-status-banner__icon">
        {cfg.icon}
      </div>

      <div className="reg-status-banner__body">
        <div className="reg-status-banner__label">
          {cfg.label}
        </div>

        <p className="reg-status-banner__hint">
          {status === 'confirmed'
            ? 'Вы уже зарегистрированы на этот турнир.'
            : 'Заявка отправлена. Ожидайте подтверждения организатором.'}
        </p>
      </div>
    </div>
  );
}

function CustomRegister() {
  const { id } = useParams();
  const navigate = useNavigate();

  const {
    tournament: t,
    loading,
  } = useCustomTournamentDetail(id);

  const {
    isAuthenticated,
    isAuthLoading,
  } = useAuth();

  const [form, setForm] = useState(buildEmptyForm(1, 0));
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [sending, setSending] = useState(false);
  const [registered, setRegistered] = useState(false);

  useEffect(() => {
    if (!t) return;

    setForm(buildEmptyForm(t.teamSize ?? 1, t.reserveSize ?? 0));
    setErrors({});
    setApiError(null);
    setSuccess(false);
    setRegistered(Boolean(t.isRegistered));
  }, [t]);

  if (isAuthLoading) {
    return (
      <div className="wrapper customs-register">
        <div className="container">
          <div className="customs__empty reveal">
            Проверяем авторизацию...
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    const returnUrl = `/tournaments/custom/register/${id}`;

    return (
      <Navigate
        to={`/login?returnUrl=${encodeURIComponent(returnUrl)}`}
        replace
      />
    );
  }

  if (loading) {
    return (
      <div className="wrapper customs-register">
        <div className="container">
          <div className="customs__empty reveal">
            Загружаем турнир...
          </div>
        </div>
      </div>
    );
  }

  if (!t) {
    return <Navigate to="/tournaments/custom" replace />;
  }

  const type = TOURNAMENT_TYPES[t.type] || TOURNAMENT_TYPES.common;
  const status = TOURNAMENT_STATUS[t.status] || TOURNAMENT_STATUS.upcoming;

  const canRegister = t.openForAll && t.status === 'registration';

  const validate = () => {
    const e = {};

    if (!form.teamName.trim()) {
      e.teamName = 'Введите название команды';
    }

    if (!form.captain.trim()) {
      e.captain = 'Введите ник капитана';
    }

    if (!form.contact.trim()) {
      e.contact = 'Введите контакт для связи';
    }

    form.members.forEach((member, index) => {
      if (!member.trim()) {
        e[`member_${index}`] = 'Введите ник игрока';
      }
    });

    setErrors(e);

    return Object.keys(e).length === 0;
  };

  const setMember = (index, value) => {
    const members = [...form.members];
    members[index] = value;

    setForm({
      ...form,
      members,
    });
  };

  const setReserve = (index, value) => {
    const reserves = [...form.reserves];
    reserves[index] = value;

    setForm({
      ...form,
      reserves,
    });
  };

  const buildComment = () => {
    const mainPlayers = [
      form.captain.trim(),
      ...form.members.map((x) => x.trim()).filter(Boolean),
    ];

    const reservePlayers = form.reserves
      .map((x) => x.trim())
      .filter(Boolean);

    return [
      `Капитан: ${form.captain.trim()}`,
      `Основной состав: ${mainPlayers.join(', ')}`,
      reservePlayers.length
        ? `Запасные: ${reservePlayers.join(', ')}`
        : 'Запасные: не указаны',
    ].join('\n');
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setSending(true);
    setApiError(null);
    setSuccess(false);

    try {
      await registerToTournament(t.id, {
        teamName: form.teamName.trim(),
        contact: form.contact.trim(),
        comment: buildComment(),
      });

      setRegistered(true);
      setSuccess(true);

      setTimeout(() => {
        navigate(`/tournaments/custom/details/${t.id}`, {
          replace: true,
        });
      }, 1200);
    } catch (err) {
      if (err?.response?.status === 401) {
        const returnUrl = `/tournaments/custom/register/${t.id}`;

        navigate(`/login?returnUrl=${encodeURIComponent(returnUrl)}`, {
          replace: true,
        });

        return;
      }

      setApiError(
        err?.response?.data?.message ||
        'Не удалось отправить заявку на турнир'
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="wrapper customs-register">
      <div className="container">
        <nav className="reg-breadcrumb reveal">
          <Link to="/tournaments/custom" className="reg-crumb">
            Кастомные турниры
          </Link>

          <span>/</span>

          <Link
            to={`/tournaments/custom/details/${t.id}`}
            className="reg-crumb"
          >
            {t.name}
          </Link>

          <span>/</span>

          <span className="reg-crumb reg-crumb--active">
            Регистрация
          </span>
        </nav>

        <div className="reg-layout reveal">
          <aside className="reg-info">
            <div
              className="reg-info__card"
              style={{
                '--type-color': type.color,
                '--type-glow': type.glow,
                '--type-border': type.border,
              }}
            >
              <div className="reg-info__card-glow" />

              <div className="reg-info__badges">
                <span
                  className="reg-info__type"
                  style={{
                    color: type.color,
                    borderColor: type.border,
                    background: type.glow,
                  }}
                >
                  {type.label}
                </span>

                <span
                  className="reg-info__status"
                  style={{
                    color: status.color,
                    background: status.bg,
                    borderColor: status.border,
                  }}
                >
                  {status.label}
                </span>
              </div>

              <h2 className="reg-info__title">
                {t.name}
              </h2>

              <p className="reg-info__desc">
                {t.description}
              </p>

              <div className="reg-info__rows">
                {[
                  {
                    label: 'Формат',
                    value: `${t.format}${t.reserveSize > 0 ? ` + ${t.reserveSize} зап.` : ''}`,
                  },
                  {
                    label: 'Уровень',
                    value: TIER_ROMAN[t.tier] ?? t.tier,
                  },
                  {
                    label: 'Классы',
                    value: t.classes?.length ? t.classes.join(' + ') : 'Не указаны',
                  },
                ].map(({ label, value }) => (
                  <div key={label} className="reg-info__row">
                    <span className="reg-info__row-label">
                      {label}
                    </span>

                    <span className="reg-info__row-val">
                      {value}
                    </span>
                  </div>
                ))}
              </div>

              <div className="reg-info__dates">
                <div className="reg-info__date-block">
                  <div className="reg-info__date-label">
                    Регистрация
                  </div>

                  <div className="reg-info__date-range">
                    {t.regStart} — {t.regEnd}
                  </div>
                </div>

                <div className="reg-info__date-block">
                  <div className="reg-info__date-label">
                    Турнир
                  </div>

                  <div className="reg-info__date-range">
                    {t.dateStart} — {t.dateEnd}
                  </div>
                </div>
              </div>

              <Link
                to={`/tournaments/custom/details/${t.id}`}
                className="btn btn-ghost btn-sm reg-info__more"
              >
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                Подробнее о турнире
              </Link>
            </div>
          </aside>

          <div className="reg-form-wrap">
            {!canRegister && !registered && (
              <div className="reg-unavailable">
                <div className="reg-unavailable__icon">
                  🔒
                </div>

                <h3 className="reg-unavailable__title">
                  Регистрация недоступна
                </h3>

                <p className="reg-unavailable__desc">
                  {t.status !== 'registration'
                    ? `Регистрация ${t.status === 'upcoming' ? 'ещё не началась' : 'завершена'}.`
                    : 'Этот турнир доступен только по приглашению или не открыт для всех игроков.'}
                </p>

                <Link
                  to={`/tournaments/custom/details/${t.id}`}
                  className="btn btn-ghost"
                >
                  Подробнее о турнире
                </Link>
              </div>
            )}

            {registered && (
              <StatusBanner status="confirmed" />
            )}

            {success && (
              <div className="reg-success-toast">
                ✅ Заявка успешно отправлена!
              </div>
            )}

            {apiError && (
              <div className="reg-unavailable" style={{ marginBottom: 16 }}>
                <div className="reg-unavailable__icon">
                  ⚠️
                </div>

                <h3 className="reg-unavailable__title">
                  Ошибка отправки
                </h3>

                <p className="reg-unavailable__desc">
                  {apiError}
                </p>
              </div>
            )}

            {canRegister && !registered && (
              <div className="reg-form">
                <div className="reg-form__header">
                  <h2 className="reg-form__title">
                    Регистрация команды
                  </h2>

                  <p className="reg-form__hint">
                    Формат: <strong>{t.format}</strong>
                    {t.reserveSize > 0 && (
                      <>
                        {' '}+ <strong>{t.reserveSize} запасн.</strong>
                      </>
                    )}
                    {' '}— всего{' '}
                    <strong>{t.teamSize + t.reserveSize}</strong> игроков
                  </p>
                </div>

                <div className="reg-field">
                  <label className="reg-field__label">
                    Название команды
                    <span className="reg-field__req">*</span>
                  </label>

                  <div className="reg-field__input-wrap">
                    <svg
                      className="reg-field__icon"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>

                    <input
                      type="text"
                      className={`reg-field__input${errors.teamName ? ' reg-field__input--error' : ''}`}
                      value={form.teamName}
                      onChange={(e) => setForm({
                        ...form,
                        teamName: e.target.value,
                      })}
                      placeholder="Название вашей команды"
                      maxLength={64}
                    />
                  </div>

                  {errors.teamName && (
                    <span className="reg-field__error">
                      {errors.teamName}
                    </span>
                  )}
                </div>

                <div className="reg-form__section-label">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                  Капитан
                </div>

                <PlayerInput
                  label="Ник капитана"
                  value={form.captain}
                  onChange={(value) => setForm({
                    ...form,
                    captain: value,
                  })}
                  disabled={false}
                  placeholder="Ник капитана команды"
                  required
                />

                {errors.captain && (
                  <span className="reg-field__error">
                    {errors.captain}
                  </span>
                )}

                <div className="reg-field">
                  <label className="reg-field__label">
                    Контакт для связи
                    <span className="reg-field__req">*</span>
                  </label>

                  <div className="reg-field__input-wrap">
                    <svg
                      className="reg-field__icon"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M21 15a4 4 0 0 1-4 4H7l-4 4V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z" />
                    </svg>

                    <input
                      type="text"
                      className={`reg-field__input${errors.contact ? ' reg-field__input--error' : ''}`}
                      value={form.contact}
                      onChange={(e) => setForm({
                        ...form,
                        contact: e.target.value,
                      })}
                      placeholder="Telegram, VK или Discord"
                      maxLength={100}
                    />
                  </div>

                  {errors.contact && (
                    <span className="reg-field__error">
                      {errors.contact}
                    </span>
                  )}
                </div>

                {form.members.length > 0 && (
                  <>
                    <div className="reg-form__section-label">
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                      </svg>
                      Состав ({form.members.length})
                    </div>

                    <div className="reg-form__players-grid">
                      {form.members.map((member, index) => (
                        <div key={index}>
                          <PlayerInput
                            label={`Игрок ${index + 2}`}
                            value={member}
                            onChange={(value) => setMember(index, value)}
                            placeholder={`Ник игрока ${index + 2}`}
                            required
                          />

                          {errors[`member_${index}`] && (
                            <span className="reg-field__error">
                              {errors[`member_${index}`]}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {form.reserves.length > 0 && (
                  <>
                    <div className="reg-form__section-label reg-form__section-label--reserve">
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="12" />
                        <line x1="12" y1="16" x2="12.01" y2="16" />
                      </svg>
                      Запасные ({form.reserves.length})
                    </div>

                    <div className="reg-form__players-grid">
                      {form.reserves.map((reserve, index) => (
                        <PlayerInput
                          key={index}
                          label={`Запасной ${index + 1}`}
                          value={reserve}
                          onChange={(value) => setReserve(index, value)}
                          placeholder="Ник запасного"
                        />
                      ))}
                    </div>
                  </>
                )}

                <div className="reg-form__footer">
                  <button
                    type="button"
                    className="btn btn-primary reg-form__submit"
                    onClick={handleSubmit}
                    disabled={sending}
                  >
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    {sending ? 'Отправляем...' : 'Отправить заявку'}
                  </button>
                </div>
              </div>
            )}

            {registered && (
              <div className="reg-blocked">
                <p>
                  Повторная подача заявки недоступна, так как вы уже зарегистрированы.
                </p>

                <Link
                  to={`/tournaments/custom/details/${t.id}`}
                  className="btn btn-ghost"
                >
                  Вернуться к турниру
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CustomRegister;