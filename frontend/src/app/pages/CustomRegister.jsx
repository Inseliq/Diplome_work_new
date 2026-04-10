import React, { useState, useEffect } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { CUSTOMS_DATA, TOURNAMENT_TYPES, TOURNAMENT_STATUS, TIER_ROMAN } from '../data/customsData';

const IS_EVG_MEMBER = false;

// ─── localStorage helpers ────────────────────────────────────────────────────

const STORAGE_KEY = (id) => `custom_reg_${id}`;

function getRegistration(id) {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY(id))) ?? null; }
  catch { return null; }
}

function saveRegistration(id, data) {
  localStorage.setItem(STORAGE_KEY(id), JSON.stringify(data));
}

// ─── Status config ────────────────────────────────────────────────────────────

const REG_STATUS = {
  sent: { label: 'Заявка отправлена', color: '#FAB81B', bg: 'rgba(250,184,27,0.1)', border: 'rgba(250,184,27,0.3)', icon: '📤' },
  confirmed: { label: 'Заявка подтверждена', color: '#22c55e', bg: 'rgba(34,197,94,0.1)', border: 'rgba(34,197,94,0.3)', icon: '✅' },
  cancelled: { label: 'Заявка отменена', color: '#ef4444', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.3)', icon: '❌' },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildEmptyForm(teamSize, reserveSize) {
  return {
    teamName: '',
    captain: '',
    members: Array(Math.max(0, teamSize - 1)).fill(''),
    reserves: Array(reserveSize).fill(''),
  };
}

function buildFormFromReg(reg) {
  return {
    teamName: reg.teamName ?? '',
    captain: reg.captain ?? '',
    members: reg.members ?? [],
    reserves: reg.reserves ?? [],
  };
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function PlayerInput({ label, value, onChange, disabled, placeholder, required }) {
  return (
    <div className="reg-field">
      <label className="reg-field__label">{label}{required && <span className="reg-field__req">*</span>}</label>
      <div className="reg-field__input-wrap">
        <svg className="reg-field__icon" width="14" height="14" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" strokeWidth="2">
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

function StatusBanner({ status, onCancel, onEdit, isConfirmed }) {
  const cfg = REG_STATUS[status];
  return (
    <div className="reg-status-banner" style={{ '--s-color': cfg.color, '--s-bg': cfg.bg, '--s-border': cfg.border }}>
      <div className="reg-status-banner__icon">{cfg.icon}</div>
      <div className="reg-status-banner__body">
        <div className="reg-status-banner__label">{cfg.label}</div>
        {status === 'sent' && (
          <p className="reg-status-banner__hint">
            Ожидайте подтверждения организатором. Вы можете изменить заявку до её подтверждения.
          </p>
        )}
        {status === 'confirmed' && (
          <p className="reg-status-banner__hint">
            Ваша заявка подтверждена. Изменения недоступны.
          </p>
        )}
        {status === 'cancelled' && (
          <p className="reg-status-banner__hint">
            Заявка была отменена. Повторная подача заявки недоступна.
          </p>
        )}
      </div>
      {status === 'sent' && (
        <div className="reg-status-banner__actions">
          <button className="btn btn-ghost btn-sm" onClick={onEdit}>Изменить</button>
          <button className="btn btn-danger btn-sm" onClick={onCancel}>Отменить</button>
        </div>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

function CustomRegister() {
  const { id } = useParams();
  const t = CUSTOMS_DATA.find((x) => x.id === Number(id));
  if (!t) return <Navigate to="/tournaments/custom" replace />;

  const type = TOURNAMENT_TYPES[t.type];
  const status = TOURNAMENT_STATUS[t.status];

  const canRegister = (IS_EVG_MEMBER || t.openForAll) && t.status === 'registration';

  // ── Registration state ──
  const [reg, setReg] = useState(() => getRegistration(t.id));
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(() =>
    reg ? buildFormFromReg(reg) : buildEmptyForm(t.teamSize, t.reserveSize)
  );
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);

  const isLocked = reg && (reg.status === 'confirmed' || reg.status === 'cancelled');
  const showForm = !reg || (reg.status === 'sent' && editing);

  // ── Validation ──
  const validate = () => {
    const e = {};
    if (!form.teamName.trim()) e.teamName = 'Введите название команды';
    if (!form.captain.trim()) e.captain = 'Введите ник капитана';
    form.members.forEach((m, i) => {
      if (!m.trim()) e[`member_${i}`] = 'Введите ник игрока';
    });
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── Submit ──
  const handleSubmit = () => {
    if (!validate()) return;
    const newReg = {
      ...form,
      status: 'sent',
      submittedAt: new Date().toISOString(),
      tournamentId: t.id,
    };
    saveRegistration(t.id, newReg);
    setReg(newReg);
    setEditing(false);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  // ── Cancel ──
  const handleCancel = () => {
    if (!window.confirm('Отменить заявку? Повторно подать заявку будет невозможно.')) return;
    const updated = { ...reg, status: 'cancelled' };
    saveRegistration(t.id, updated);
    setReg(updated);
    setEditing(false);
  };

  // ── Edit ──
  const handleEdit = () => {
    setForm(buildFormFromReg(reg));
    setEditing(true);
  };

  // ── Form field setters ──
  const setMember = (i, val) => {
    const arr = [...form.members];
    arr[i] = val;
    setForm({ ...form, members: arr });
  };

  const setReserve = (i, val) => {
    const arr = [...form.reserves];
    arr[i] = val;
    setForm({ ...form, reserves: arr });
  };

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="wrapper customs-register">
      <div className="container">

        {/* Breadcrumb */}
        <nav className="reg-breadcrumb reveal">
          <Link to="/tournaments/custom" className="reg-crumb">Кастомные турниры</Link>
          <span>/</span>
          <Link to={`/tournaments/custom/details/${t.id}`} className="reg-crumb">{t.name}</Link>
          <span>/</span>
          <span className="reg-crumb reg-crumb--active">Регистрация</span>
        </nav>

        <div className="reg-layout reveal">

          {/* ── Tournament info (левая колонка) ── */}
          <aside className="reg-info">
            <div className="reg-info__card" style={{ '--type-color': type.color, '--type-glow': type.glow, '--type-border': type.border }}>
              <div className="reg-info__card-glow" />
              <div className="reg-info__badges">
                <span className="reg-info__type" style={{ color: type.color, borderColor: type.border, background: type.glow }}>
                  {type.label}
                </span>
                <span className="reg-info__status" style={{ color: status.color, background: status.bg, borderColor: status.border }}>
                  {status.label}
                </span>
              </div>
              <h2 className="reg-info__title">{t.name}</h2>
              <p className="reg-info__desc">{t.description}</p>

              <div className="reg-info__rows">
                {[
                  { label: 'Формат', value: `${t.format}${t.reserveSize > 0 ? ` + ${t.reserveSize} зап.` : ''}` },
                  { label: 'Уровень', value: TIER_ROMAN[t.tier] ?? t.tier },
                  { label: 'Классы', value: t.classes.join(' + ') },
                ].map(({ label, value }) => (
                  <div key={label} className="reg-info__row">
                    <span className="reg-info__row-label">{label}</span>
                    <span className="reg-info__row-val">{value}</span>
                  </div>
                ))}
              </div>

              <div className="reg-info__dates">
                <div className="reg-info__date-block">
                  <div className="reg-info__date-label">Регистрация</div>
                  <div className="reg-info__date-range">{t.regStart} — {t.regEnd}</div>
                </div>
                <div className="reg-info__date-block">
                  <div className="reg-info__date-label">Турнир</div>
                  <div className="reg-info__date-range">{t.dateStart} — {t.dateEnd}</div>
                </div>
              </div>

              <Link to={`/tournaments/custom/details/${t.id}`} className="btn btn-ghost btn-sm reg-info__more">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                Подробнее о турнире
              </Link>
            </div>
          </aside>

          {/* ── Form (правая колонка) ── */}
          <div className="reg-form-wrap">

            {/* Нет прав на регистрацию */}
            {!canRegister && !reg && (
              <div className="reg-unavailable">
                <div className="reg-unavailable__icon">🔒</div>
                <h3 className="reg-unavailable__title">Регистрация недоступна</h3>
                <p className="reg-unavailable__desc">
                  {t.status !== 'registration'
                    ? `Регистрация ${t.status === 'upcoming' ? 'ещё не началась' : 'завершена'}.`
                    : 'Этот турнир доступен только для участников клана IEVGI.'
                  }
                </p>
                <Link to={`/tournaments/custom/details/${t.id}`} className="btn btn-ghost">
                  Подробнее о турнире
                </Link>
              </div>
            )}

            {/* Статус существующей заявки */}
            {reg && (
              <StatusBanner
                status={reg.status}
                onCancel={handleCancel}
                onEdit={handleEdit}
                isConfirmed={reg.status === 'confirmed'}
              />
            )}

            {/* Уведомление об успешной отправке */}
            {success && (
              <div className="reg-success-toast">
                ✅ Заявка успешно {editing ? 'обновлена' : 'отправлена'}!
              </div>
            )}

            {/* Форма */}
            {(showForm || (!reg && canRegister)) && (
              <div className="reg-form">
                <div className="reg-form__header">
                  <h2 className="reg-form__title">
                    {editing ? 'Изменить заявку' : 'Регистрация команды'}
                  </h2>
                  <p className="reg-form__hint">
                    Формат: <strong>{t.format}</strong>
                    {t.reserveSize > 0 && <> + <strong>{t.reserveSize} запасн.</strong></>}
                    {' '}— всего <strong>{t.teamSize + t.reserveSize}</strong> игроков
                  </p>
                </div>

                {/* Название команды */}
                <div className="reg-field">
                  <label className="reg-field__label">
                    Название команды<span className="reg-field__req">*</span>
                  </label>
                  <div className="reg-field__input-wrap">
                    <svg className="reg-field__icon" width="14" height="14" viewBox="0 0 24 24"
                      fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                    <input
                      type="text"
                      className={`reg-field__input${errors.teamName ? ' reg-field__input--error' : ''}`}
                      value={form.teamName}
                      onChange={(e) => setForm({ ...form, teamName: e.target.value })}
                      placeholder="Название вашей команды"
                      maxLength={64}
                    />
                  </div>
                  {errors.teamName && <span className="reg-field__error">{errors.teamName}</span>}
                </div>

                {/* Капитан */}
                <div className="reg-form__section-label">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                  Капитан
                </div>
                <PlayerInput
                  label="Ник капитана"
                  value={form.captain}
                  onChange={(v) => setForm({ ...form, captain: v })}
                  disabled={false}
                  placeholder="Ник капитана команды"
                  required
                />
                {errors.captain && <span className="reg-field__error">{errors.captain}</span>}

                {/* Состав */}
                {form.members.length > 0 && (
                  <>
                    <div className="reg-form__section-label">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                      </svg>
                      Состав ({form.members.length} {form.members.length === 1 ? 'игрок' : form.members.length < 5 ? 'игрока' : 'игроков'})
                    </div>
                    <div className="reg-form__players-grid">
                      {form.members.map((m, i) => (
                        <div key={i}>
                          <PlayerInput
                            label={`Игрок ${i + 2}`}
                            value={m}
                            onChange={(v) => setMember(i, v)}
                            placeholder={`Ник игрока ${i + 2}`}
                            required
                          />
                          {errors[`member_${i}`] && (
                            <span className="reg-field__error">{errors[`member_${i}`]}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {/* Запасные */}
                {form.reserves.length > 0 && (
                  <>
                    <div className="reg-form__section-label reg-form__section-label--reserve">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" />
                        <line x1="12" y1="16" x2="12.01" y2="16" />
                      </svg>
                      Запасные ({form.reserves.length})
                    </div>
                    <div className="reg-form__players-grid">
                      {form.reserves.map((r, i) => (
                        <PlayerInput
                          key={i}
                          label={`Запасной ${i + 1}`}
                          value={r}
                          onChange={(v) => setReserve(i, v)}
                          placeholder="Ник запасного"
                        />
                      ))}
                    </div>
                  </>
                )}

                {/* Submit */}
                <div className="reg-form__footer">
                  {editing && (
                    <button className="btn btn-ghost"
                      onClick={() => { setEditing(false); setErrors({}); }}>
                      Отмена
                    </button>
                  )}
                  <button className="btn btn-primary reg-form__submit" onClick={handleSubmit}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    {editing ? 'Сохранить изменения' : 'Отправить заявку'}
                  </button>
                </div>
              </div>
            )}

            {/* После отмены — заблокировано */}
            {reg?.status === 'cancelled' && (
              <div className="reg-blocked">
                <p>Повторная подача заявки недоступна.</p>
                <Link to={`/tournaments/custom/details/${t.id}`} className="btn btn-ghost">
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