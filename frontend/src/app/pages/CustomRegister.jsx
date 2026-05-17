import React, { useEffect, useMemo, useState } from 'react';
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
    label: 'Заявка на рассмотрении',
    color: '#FAB81B',
    bg: 'rgba(250,184,27,0.1)',
    border: 'rgba(250,184,27,0.3)',
    icon: '📤',
    hint: 'Заявка отправлена. Ожидайте подтверждения организатором.',
  },
  confirmed: {
    label: 'Заявка принята',
    color: '#22c55e',
    bg: 'rgba(34,197,94,0.1)',
    border: 'rgba(34,197,94,0.3)',
    icon: '✅',
    hint: 'Ваша команда принята на турнир.',
  },
  rejected: {
    label: 'Заявка отклонена',
    color: '#ef4444',
    bg: 'rgba(239,68,68,0.1)',
    border: 'rgba(239,68,68,0.3)',
    icon: '⛔',
    hint: 'Заявка была отклонена. Повторная регистрация на этот турнир недоступна.',
  },
};

function buildEmptyForm(teamSize, reserveSize, captainNickname = '') {
  return {
    teamName: '',
    captain: captainNickname,
    contact: '',
    comment: '',
    members: Array(Math.max(0, Number(teamSize) - 1)).fill(''),
    reserves: Array(Math.max(0, Number(reserveSize))).fill(''),
  };
}

function normalizeStatus(status) {
  if (!status) return 'sent';
  return String(status).trim().toLowerCase();
}

function normalizeRole(role) {
  if (!role) return '';
  return String(role).trim().toLowerCase();
}

function normalizeNick(value) {
  return String(value ?? '').trim().toUpperCase();
}

function isValidNickname(value) {
  return /^[A-Za-z0-9_]{3,24}$/.test(String(value ?? '').trim());
}

function getUserNickname(user) {
  return (
    user?.nickname ??
    user?.Nickname ??
    user?.user?.nickname ??
    user?.user?.Nickname ??
    ''
  );
}

function getErrorMessage(err) {
  return (
    err?.response?.data?.message ||
    err?.data?.message ||
    err?.message ||
    'Не удалось отправить заявку на турнир'
  );
}

function PlayerInput({
  label,
  value,
  onChange,
  disabled = false,
  placeholder,
  required = false,
  error,
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
          className={`reg-field__input${error ? ' reg-field__input--error' : ''}`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          placeholder={placeholder ?? 'Ник игрока'}
          maxLength={24}
        />
      </div>

      {error && (
        <span className="reg-field__error">
          {error}
        </span>
      )}
    </div>
  );
}

function StatusBanner({ status }) {
  const normalized = normalizeStatus(status);
  const cfg = REG_STATUS[normalized] ?? REG_STATUS.sent;

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
          {cfg.hint}
        </p>
      </div>
    </div>
  );
}

function TeamSummary({
  teamName,
  contact,
  comment,
  players,
}) {
  const safePlayers = Array.isArray(players) ? players : [];

  const captain = safePlayers.find((x) => normalizeRole(x.role) === 'captain');

  const main = safePlayers.filter((x) => normalizeRole(x.role) === 'main');

  const reserves = safePlayers.filter((x) => normalizeRole(x.role) === 'reserve');

  return (
    <div className="reg-summary">
      <h3 className="reg-summary__title">
        Итоговый состав команды
      </h3>

      <div className="reg-summary__meta">
        <div>
          <span>Команда</span>
          <strong>{teamName || 'Без названия'}</strong>
        </div>

        <div>
          <span>Контакт</span>
          <strong>{contact || 'Не указан'}</strong>
        </div>
      </div>

      <div className="reg-summary__group">
        <h4>Командир</h4>

        <div className="reg-summary__player">
          {captain?.nickname || 'Не указан'}
        </div>
      </div>

      <div className="reg-summary__group">
        <h4>Основной состав</h4>

        {main.length > 0 ? (
          main.map((player, index) => (
            <div
              key={`${player.nickname}-${player.sortOrder ?? index}`}
              className="reg-summary__player"
            >
              {player.nickname}
            </div>
          ))
        ) : (
          <p className="reg-summary__empty">
            Основной состав не указан
          </p>
        )}
      </div>

      <div className="reg-summary__group">
        <h4>Запасные</h4>

        {reserves.length > 0 ? (
          reserves.map((player, index) => (
            <div
              key={`${player.nickname}-${player.sortOrder ?? index}`}
              className="reg-summary__player"
            >
              {player.nickname}
            </div>
          ))
        ) : (
          <p className="reg-summary__empty">
            Запасные не указаны
          </p>
        )}
      </div>

      {comment && (
        <div className="reg-summary__group">
          <h4>Комментарий</h4>

          <p>{comment}</p>
        </div>
      )}
    </div>
  );
}

function CustomRegister() {
  const { id } = useParams();
  const navigate = useNavigate();

  const {
    tournament: t,
    loading,
    reload,
  } = useCustomTournamentDetail(id);

  const {
    user,
    isAuthenticated,
    isAuthLoading,
  } = useAuth();

  const [form, setForm] = useState(buildEmptyForm(1, 0));
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [sending, setSending] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [myRegistration, setMyRegistration] = useState(null);

  const captainNickname = useMemo(() => getUserNickname(user), [user]);

  useEffect(() => {
    if (!t) return;

    setForm(buildEmptyForm(
      t.teamSize ?? 1,
      t.reserveSize ?? 0,
      captainNickname
    ));

    setErrors({});
    setApiError(null);
    setSuccess(false);
    setPreviewMode(false);
    setMyRegistration(t.myRegistration ?? null);
  }, [t, captainNickname]);

  const type = t
    ? TOURNAMENT_TYPES[t.type] || TOURNAMENT_TYPES.common
    : TOURNAMENT_TYPES.common;

  const status = t
    ? TOURNAMENT_STATUS[t.status] || TOURNAMENT_STATUS.upcoming
    : TOURNAMENT_STATUS.upcoming;

  const canRegister = Boolean(t?.openForAll && t?.status === 'registration');

  const hasMyRegistration = Boolean(myRegistration);

  const getTeamPlayersFromForm = () => {
    return [
      {
        id: 'captain',
        role: 'captain',
        roleLabel: 'Командир',
        nickname: form.captain.trim(),
        sortOrder: 1,
      },
      ...form.members.map((nickname, index) => ({
        id: `main-${index}`,
        role: 'main',
        roleLabel: `Игрок ${index + 2}`,
        nickname: nickname.trim(),
        sortOrder: index + 2,
      })),
      ...form.reserves
        .map((nickname, index) => ({
          id: `reserve-${index}`,
          role: 'reserve',
          roleLabel: `Запасной ${index + 1}`,
          nickname: nickname.trim(),
          sortOrder: form.members.length + index + 2,
        }))
        .filter((player) => player.nickname),
    ];
  };

  const validate = () => {
    const e = {};

    if (!form.teamName.trim()) {
      e.teamName = 'Введите название команды';
    }

    if (!form.captain.trim()) {
      e.captain = 'Не удалось определить ник командира';
    }

    if (!form.contact.trim()) {
      e.contact = 'Введите контакт для связи';
    }

    form.members.forEach((member, index) => {
      if (!member.trim()) {
        e[`member_${index}`] = 'Введите ник игрока';
      }
    });

    const players = getTeamPlayersFromForm();

    for (const player of players) {
      if (!isValidNickname(player.nickname)) {
        e.players = `Некорректный ник: ${player.nickname}. Разрешены A-Z, a-z, 0-9 и _. Длина от 3 до 24 символов.`;
        break;
      }
    }

    const normalized = players.map((player) => normalizeNick(player.nickname));

    const hasDuplicates = normalized.some((nick, index) => normalized.indexOf(nick) !== index);

    if (hasDuplicates) {
      e.players = 'В составе команды нельзя указывать одинаковые ники';
    }

    setErrors(e);

    return Object.keys(e).length === 0;
  };

  const setMember = (index, value) => {
    const members = [...form.members];
    members[index] = value;

    setForm((previous) => ({
      ...previous,
      members,
    }));

    if (errors[`member_${index}`] || errors.players) {
      setErrors((previous) => {
        const next = { ...previous };
        delete next[`member_${index}`];
        delete next.players;
        return next;
      });
    }
  };

  const setReserve = (index, value) => {
    const reserves = [...form.reserves];
    reserves[index] = value;

    setForm((previous) => ({
      ...previous,
      reserves,
    }));

    if (errors.players) {
      setErrors((previous) => {
        const next = { ...previous };
        delete next.players;
        return next;
      });
    }
  };

  const updateFormField = (field, value) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));

    if (errors[field] || errors.players) {
      setErrors((previous) => {
        const next = { ...previous };
        delete next[field];
        if (field !== 'comment') {
          delete next.players;
        }
        return next;
      });
    }
  };

  const handleBuildPreview = () => {
    if (!validate()) return;

    setApiError(null);
    setSuccess(false);
    setPreviewMode(true);

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const handleSendRegistration = async () => {
    if (!validate()) return;

    setSending(true);
    setApiError(null);
    setSuccess(false);

    try {
      const result = await registerToTournament(t.id, {
        teamName: form.teamName.trim(),
        contact: form.contact.trim(),
        comment: form.comment.trim() || null,
        members: form.members.map((x) => x.trim()),
        reserves: form.reserves
          .map((x) => x.trim())
          .filter(Boolean),
      });

      setMyRegistration(result?.registration ?? null);
      setSuccess(true);
      setPreviewMode(false);

      if (typeof reload === 'function') {
        await reload();
      }
    } catch (err) {
      if (err?.response?.status === 401) {
        const returnUrl = `/tournaments/custom/register/${t.id}`;

        navigate(`/login?returnUrl=${encodeURIComponent(returnUrl)}`, {
          replace: true,
        });

        return;
      }

      setApiError(getErrorMessage(err));
    } finally {
      setSending(false);
    }
  };

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
            {!canRegister && !hasMyRegistration && (
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

            {hasMyRegistration && (
              <div className="reg-form">
                <StatusBanner status={myRegistration.status} />

                <TeamSummary
                  teamName={myRegistration.teamName}
                  contact={myRegistration.contact}
                  comment={myRegistration.comment}
                  players={myRegistration.players}
                />

                <div className="reg-form__footer">
                  <Link
                    to={`/tournaments/custom/details/${t.id}`}
                    className="btn btn-ghost"
                  >
                    К турниру
                  </Link>
                </div>
              </div>
            )}

            {success && !hasMyRegistration && (
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

            {canRegister && !hasMyRegistration && (
              <div className="reg-form">
                <div className="reg-form__header">
                  <h2 className="reg-form__title">
                    {previewMode ? 'Проверьте заявку' : 'Регистрация команды'}
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

                {!previewMode ? (
                  <>
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
                          onChange={(e) => updateFormField('teamName', e.target.value)}
                          placeholder="Название вашей команды"
                          maxLength={100}
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
                      Командир
                    </div>

                    <PlayerInput
                      label="Ник командира"
                      value={form.captain}
                      onChange={() => { }}
                      disabled
                      placeholder="Ник командира команды"
                      required
                      error={errors.captain}
                    />

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
                          onChange={(e) => updateFormField('contact', e.target.value)}
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
                          Основной состав ({form.members.length})
                        </div>

                        <div className="reg-form__players-grid">
                          {form.members.map((member, index) => (
                            <PlayerInput
                              key={index}
                              label={`Игрок ${index + 2}`}
                              value={member}
                              onChange={(value) => setMember(index, value)}
                              placeholder={`Ник игрока ${index + 2}`}
                              required
                              error={errors[`member_${index}`]}
                            />
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

                    <div className="reg-field">
                      <label className="reg-field__label">
                        Комментарий
                      </label>

                      <div className="reg-field__input-wrap">
                        <textarea
                          className="reg-field__input"
                          value={form.comment}
                          onChange={(e) => updateFormField('comment', e.target.value)}
                          placeholder="Дополнительная информация для организатора"
                          maxLength={1000}
                          rows={4}
                        />
                      </div>
                    </div>

                    {errors.players && (
                      <div className="reg-unavailable" style={{ marginBottom: 16 }}>
                        <div className="reg-unavailable__icon">
                          ⚠️
                        </div>

                        <h3 className="reg-unavailable__title">
                          Проверьте состав
                        </h3>

                        <p className="reg-unavailable__desc">
                          {errors.players}
                        </p>
                      </div>
                    )}

                    <div className="reg-form__footer">
                      <button
                        type="button"
                        className="btn btn-primary reg-form__submit"
                        onClick={handleBuildPreview}
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
                        Сформировать заявку
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <TeamSummary
                      teamName={form.teamName}
                      contact={form.contact}
                      comment={form.comment}
                      players={getTeamPlayersFromForm()}
                    />

                    <div className="reg-form__footer">
                      <button
                        type="button"
                        className="btn btn-primary reg-form__submit"
                        onClick={handleSendRegistration}
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

                      <button
                        type="button"
                        className="btn btn-ghost"
                        onClick={() => setPreviewMode(false)}
                        disabled={sending}
                      >
                        Изменить
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CustomRegister;