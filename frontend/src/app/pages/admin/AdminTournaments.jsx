import React, { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { tournamentsStore } from '../../admin/adminStore';
import { TOURNAMENT_TYPES, TOURNAMENT_STATUS, TIER_ROMAN } from '../../data/customsData';

const STATUS_ORDER = { active: 0, registration: 1, upcoming: 2, finished: 3 };

// ─── Список ───────────────────────────────────────────────────────

export function AdminTournamentsList() {
  const [list, setList] = useState(() => tournamentsStore.getAll());

  const handleDelete = (id) => {
    if (!window.confirm('Удалить турнир?')) return;
    tournamentsStore.remove(id);
    setList(tournamentsStore.getAll());
  };

  const handleReset = () => {
    if (!window.confirm('Сбросить все турниры к начальным данным?')) return;
    tournamentsStore.reset();
    setList(tournamentsStore.getAll());
  };

  const sorted = [...list].sort((a, b) => (STATUS_ORDER[a.status] ?? 9) - (STATUS_ORDER[b.status] ?? 9));

  return (
    <div className="adm-wrapper">
      <div className="adm-container">

        <div className="adm-page__header">
          <div className="adm-page__header-left">
            <Link to="/secure/helmet/admin" className="adm-back">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
              </svg>
              Назад
            </Link>
            <h1 className="adm-page__title">Турниры</h1>
            <span className="adm-page__count">{list.length}</span>
          </div>
          <div className="adm-page__header-right">
            <button className="adm-btn adm-btn--ghost adm-btn--sm" onClick={handleReset}>Сбросить</button>
            <Link to="/secure/helmet/admin/tournaments/new" className="adm-btn adm-btn--primary">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Создать
            </Link>
          </div>
        </div>

        <div className="adm-list">
          {sorted.map((t) => {
            const type = TOURNAMENT_TYPES[t.type];
            const status = TOURNAMENT_STATUS[t.status];
            return (
              <div key={t.id} className="adm-list-item">
                <div className="adm-list-item__body">
                  <div className="adm-list-item__meta">
                    <span className="adm-badge" style={{ borderColor: type?.border }}>
                      {type?.label ?? t.type}
                    </span>
                    <span className="adm-badge adm-badge--status" style={{ color: status?.color }}>
                      {status?.label ?? t.status}
                    </span>
                    <span className="adm-badge">{t.format}</span>
                    <span className="adm-badge">{TIER_ROMAN[t.tier] ?? t.tier}</span>
                    {t.openForAll && <span className="adm-badge adm-badge--green">Открытый</span>}
                  </div>
                  <h3 className="adm-list-item__title">{t.name}</h3>
                  <p className="adm-list-item__excerpt">{t.description}</p>
                  <div className="adm-list-item__sub">
                    <span>{t.dateStart} — {t.dateEnd}</span>
                    {t.sponsor && <span>Спонсор: {t.sponsor}</span>}
                    <span>{t.currentParticipants}/{t.maxParticipants ?? '∞'} команд</span>
                  </div>
                </div>
                <div className="adm-list-item__actions">
                  <Link to={`/secure/helmet/admin/tournaments/${t.id}`} className="adm-btn adm-btn--ghost adm-btn--sm">
                    Изменить
                  </Link>
                  <button className="adm-btn adm-btn--danger adm-btn--sm" onClick={() => handleDelete(t.id)}>
                    Удалить
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Пустая форма ─────────────────────────────────────────────────

const EMPTY_T = {
  name: '', description: '', type: 'common', tier: 10, format: '7x7',
  teamSize: 7, reserveSize: 1, maxParticipants: 16, currentParticipants: 0,
  classes: ['BO3'], status: 'upcoming', isStream: false, streamUrl: '',
  dateStart: '', dateEnd: '', dateStartISO: '', dateEndISO: '',
  regStart: '', regEnd: '', regStartISO: '', regEndISO: '',
  openForAll: false, sponsor: '', eventId: null,
  prizeText: '',
  prizes: { place1: { amount: 0, type: 'gold' }, place2: { amount: 0, type: 'gold' }, place3: null, others: null },
  maps: [],
};

const ALL_CLASSES = ['BO3', 'PE', 'RE', 'ST'];
const ALL_TYPES = ['common', 'rare', 'epic', 'legendary', 'brilliant'];
const ALL_STATUSES = ['upcoming', 'registration', 'active', 'finished'];
const ALL_FORMATS = ['1x1', '2x2', '3x3', '5x5', '7x7', '15x15'];
const ALL_TIERS = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
const ALL_PRIZE_TYPES = ['gold', 'rub', 'time-prime', 'any'];

// ─── Форма ────────────────────────────────────────────────────────

export function AdminTournamentsEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = id === 'new';

  const [form, setForm] = useState(() => isNew ? { ...EMPTY_T } : (tournamentsStore.getById(id) ?? { ...EMPTY_T }));
  const [saved, setSaved] = useState(false);

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));
  const setPrize = (place, key, val) => setForm((f) => ({
    ...f,
    prizes: { ...f.prizes, [place]: f.prizes[place] ? { ...f.prizes[place], [key]: val } : { amount: 0, type: 'gold', [key]: val } }
  }));

  const toggleClass = (cls) => set('classes',
    form.classes.includes(cls) ? form.classes.filter((c) => c !== cls) : [...form.classes, cls]
  );

  const addMap = () => set('maps', [...(form.maps ?? []), { name: '', image: '' }]);
  const setMap = (i, key, val) => {
    const maps = [...(form.maps ?? [])];
    maps[i] = { ...maps[i], [key]: val };
    set('maps', maps);
  };
  const removeMap = (i) => set('maps', form.maps.filter((_, idx) => idx !== i));

  const handleSave = () => {
    if (!form.name.trim()) { alert('Введите название турнира'); return; }
    if (isNew) tournamentsStore.create(form);
    else tournamentsStore.update(id, form);
    setSaved(true);
    setTimeout(() => { setSaved(false); navigate('/secure/helmet/admin/tournaments'); }, 800);
  };

  return (
    <div className="adm-wrapper">
      <div className="adm-container adm-container--narrow">

        <div className="adm-page__header">
          <div className="adm-page__header-left">
            <Link to="/secure/helmet/admin/tournaments" className="adm-back">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
              </svg>
              Турниры
            </Link>
            <h1 className="adm-page__title">{isNew ? 'Новый турнир' : 'Редактировать'}</h1>
          </div>
          <div className="adm-page__header-right">
            <button className="adm-btn adm-btn--primary" onClick={handleSave}>
              {saved ? '✓ Сохранено' : 'Сохранить'}
            </button>
          </div>
        </div>

        <div className="adm-form">

          {/* Основное */}
          <div className="adm-form__section-title">Основное</div>
          <div className="adm-field">
            <label className="adm-label">Название *</label>
            <input className="adm-input" value={form.name}
              onChange={(e) => set('name', e.target.value)} placeholder="Название турнира" />
          </div>
          <div className="adm-field">
            <label className="adm-label">Описание</label>
            <textarea className="adm-input adm-textarea adm-textarea--sm" value={form.description}
              onChange={(e) => set('description', e.target.value)} rows={2} />
          </div>

          <div className="adm-form__row adm-form__row--3">
            <div className="adm-field">
              <label className="adm-label">Тип</label>
              <select className="adm-input adm-select" value={form.type} onChange={(e) => set('type', e.target.value)}>
                {ALL_TYPES.map((t) => <option key={t} value={t}>{TOURNAMENT_TYPES[t]?.label ?? t}</option>)}
              </select>
            </div>
            <div className="adm-field">
              <label className="adm-label">Статус</label>
              <select className="adm-input adm-select" value={form.status} onChange={(e) => set('status', e.target.value)}>
                {ALL_STATUSES.map((s) => <option key={s} value={s}>{TOURNAMENT_STATUS[s]?.label ?? s}</option>)}
              </select>
            </div>
            <div className="adm-field">
              <label className="adm-label">Уровень</label>
              <select className="adm-input adm-select" value={form.tier} onChange={(e) => set('tier', Number(e.target.value))}>
                {ALL_TIERS.map((t) => <option key={t} value={t}>{TIER_ROMAN[t]}</option>)}
              </select>
            </div>
          </div>

          <div className="adm-form__row adm-form__row--3">
            <div className="adm-field">
              <label className="adm-label">Формат</label>
              <select className="adm-input adm-select" value={form.format} onChange={(e) => set('format', e.target.value)}>
                {ALL_FORMATS.map((f) => <option key={f}>{f}</option>)}
              </select>
            </div>
            <div className="adm-field">
              <label className="adm-label">Размер команды</label>
              <input className="adm-input" type="number" min={1} value={form.teamSize}
                onChange={(e) => set('teamSize', Number(e.target.value))} />
            </div>
            <div className="adm-field">
              <label className="adm-label">Запасных</label>
              <input className="adm-input" type="number" min={0} value={form.reserveSize}
                onChange={(e) => set('reserveSize', Number(e.target.value))} />
            </div>
          </div>

          <div className="adm-form__row adm-form__row--3">
            <div className="adm-field">
              <label className="adm-label">Макс. команд (0=∞)</label>
              <input className="adm-input" type="number" min={0}
                value={form.maxParticipants ?? 0}
                onChange={(e) => set('maxParticipants', Number(e.target.value) || null)} />
            </div>
            <div className="adm-field">
              <label className="adm-label">Сейчас участвует</label>
              <input className="adm-input" type="number" min={0} value={form.currentParticipants}
                onChange={(e) => set('currentParticipants', Number(e.target.value))} />
            </div>
            <div className="adm-field">
              <label className="adm-label">ID события (необяз.)</label>
              <input className="adm-input" type="number"
                value={form.eventId ?? ''}
                onChange={(e) => set('eventId', e.target.value ? Number(e.target.value) : null)} />
            </div>
          </div>

          {/* Классы */}
          <div className="adm-field">
            <label className="adm-label">Классы турнира</label>
            <div className="adm-checkgroup">
              {ALL_CLASSES.map((cls) => (
                <label key={cls} className="adm-checkbox">
                  <input type="checkbox" checked={form.classes.includes(cls)}
                    onChange={() => toggleClass(cls)} />
                  {cls}
                </label>
              ))}
            </div>
          </div>

          {/* Флаги */}
          <div className="adm-form__row adm-form__row--2">
            <label className="adm-checkbox adm-checkbox--block">
              <input type="checkbox" checked={form.openForAll}
                onChange={(e) => set('openForAll', e.target.checked)} />
              Открытый (для всех игроков)
            </label>
            <label className="adm-checkbox adm-checkbox--block">
              <input type="checkbox" checked={form.isStream}
                onChange={(e) => set('isStream', e.target.checked)} />
              Транслируемый
            </label>
          </div>

          {form.isStream && (
            <div className="adm-field">
              <label className="adm-label">Ссылка на трансляцию</label>
              <input className="adm-input" value={form.streamUrl}
                onChange={(e) => set('streamUrl', e.target.value)} placeholder="https://..." />
            </div>
          )}

          <div className="adm-field">
            <label className="adm-label">Спонсор</label>
            <input className="adm-input" value={form.sponsor}
              onChange={(e) => set('sponsor', e.target.value)} placeholder="Lesta Games / ник игрока" />
          </div>

          {/* Даты */}
          <div className="adm-form__section-title">Даты</div>
          <div className="adm-form__row adm-form__row--2">
            {[
              ['Начало регистрации', 'regStart', 'regStartISO'],
              ['Конец регистрации', 'regEnd', 'regEndISO'],
            ].map(([label, textKey, isoKey]) => (
              <div key={textKey} className="adm-field">
                <label className="adm-label">{label}</label>
                <input className="adm-input" value={form[textKey]}
                  onChange={(e) => set(textKey, e.target.value)} placeholder="1 января 2025" />
                <input className="adm-input adm-input--sm" type="date" value={form[isoKey]}
                  onChange={(e) => set(isoKey, e.target.value)} style={{ marginTop: 4 }} />
              </div>
            ))}
          </div>
          <div className="adm-form__row adm-form__row--2">
            {[
              ['Начало турнира', 'dateStart', 'dateStartISO'],
              ['Конец турнира', 'dateEnd', 'dateEndISO'],
            ].map(([label, textKey, isoKey]) => (
              <div key={textKey} className="adm-field">
                <label className="adm-label">{label}</label>
                <input className="adm-input" value={form[textKey]}
                  onChange={(e) => set(textKey, e.target.value)} placeholder="1 января 2025" />
                <input className="adm-input adm-input--sm" type="date" value={form[isoKey]}
                  onChange={(e) => set(isoKey, e.target.value)} style={{ marginTop: 4 }} />
              </div>
            ))}
          </div>

          {/* Призы */}
          <div className="adm-form__section-title">Призы</div>
          <div className="adm-field">
            <label className="adm-label">Примечание к призам</label>
            <input className="adm-input" value={form.prizeText}
              onChange={(e) => set('prizeText', e.target.value)}
              placeholder="Призовой фонд будет объявлен позже" />
          </div>
          {['place1', 'place2', 'place3', 'others'].map((pl, i) => {
            const labels = ['1 место', '2 место', '3 место', 'Остальные'];
            const prize = form.prizes?.[pl];
            return (
              <div key={pl} className="adm-form__row adm-form__row--3 adm-form__row--aligned">
                <span className="adm-label adm-label--inline">{labels[i]}</span>
                <select className="adm-input adm-select"
                  value={prize?.type ?? 'gold'}
                  onChange={(e) => setPrize(pl, 'type', e.target.value)}>
                  {ALL_PRIZE_TYPES.map((pt) => <option key={pt}>{pt}</option>)}
                </select>
                <input className="adm-input" type="number" min={0}
                  value={prize?.amount ?? 0}
                  onChange={(e) => setPrize(pl, 'amount', Number(e.target.value))}
                  placeholder="Количество" />
                {prize?.type === 'any' && (
                  <input className="adm-input" value={prize?.text ?? ''}
                    onChange={(e) => setPrize(pl, 'text', e.target.value)}
                    placeholder="Описание приза" />
                )}
              </div>
            );
          })}

          {/* Карты */}
          <div className="adm-form__section-title">
            Карты
            <button className="adm-btn adm-btn--ghost adm-btn--xs" onClick={addMap} style={{ marginLeft: 12 }}>+ Добавить</button>
          </div>
          {(form.maps ?? []).map((m, i) => (
            <div key={i} className="adm-form__row adm-form__row--2 adm-form__row--aligned">
              <input className="adm-input" value={m.name}
                onChange={(e) => setMap(i, 'name', e.target.value)} placeholder="Название карты" />
              <input className="adm-input" value={m.image}
                onChange={(e) => setMap(i, 'image', e.target.value)} placeholder="/images/maps/..." />
              {m.image && <img src={m.image} alt={m.name} className="adm-map-preview" onError={(e) => { e.target.style.display = 'none'; }} />}
              <button className="adm-btn adm-btn--danger adm-btn--xs" onClick={() => removeMap(i)}>✕</button>
            </div>
          ))}

          <div className="adm-form__footer">
            <Link to="/secure/helmet/admin/tournaments" className="adm-btn adm-btn--ghost">Отмена</Link>
            <button className="adm-btn adm-btn--primary" onClick={handleSave}>
              {saved ? '✓ Сохранено' : 'Сохранить'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}