import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  getAdminClans,
  getAdminClanById,
  createAdminClan,
  updateAdminClan,
  deleteAdminClan,
  removeAdminClanPlayer,
  updateAdminClanPlayerRank,
  getAdminClanRanks,
} from '../../../api/endpoints';
import { logger } from '../../utils/logger';

const EMPTY_FORM = {
  tag: '',
  name: '',
  description: '',
  eloRating: 1000,
};

const DEFAULT_RANKS = [
  { value: 1, key: 'Reservist', label: 'Резервист' },
  { value: 2, key: 'Recruit', label: 'Новобранец' },
  { value: 3, key: 'Fighter', label: 'Боец' },
  { value: 4, key: 'JuniorOfficer', label: 'Младший офицер' },
  { value: 5, key: 'UnitCommander', label: 'Командир подразделения' },
  { value: 6, key: 'StaffOfficer', label: 'Офицер штаба' },
  { value: 7, key: 'DeputyCommander', label: 'Заместитель командующего' },
  { value: 8, key: 'Commander', label: 'Командующий' },
];

function AdminClans() {
  const [clans, setClans] = useState([]);
  const [selectedClan, setSelectedClan] = useState(null);
  const [ranks, setRanks] = useState(DEFAULT_RANKS);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [actionId, setActionId] = useState(null);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  const isEditing = editingId != null;

  const filteredClans = useMemo(() => {
    const normalized = search.trim().toLowerCase();

    if (!normalized) return clans;

    return clans.filter((clan) =>
      clan.tag?.toLowerCase().includes(normalized) ||
      clan.name?.toLowerCase().includes(normalized)
    );
  }, [clans, search]);

  const loadClans = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getAdminClans();
      setClans(Array.isArray(data) ? data : []);
    } catch (err) {
      logger.warn('AdminClans: не удалось загрузить кланы', err);
      setClans([]);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const loadRanks = async () => {
    try {
      const data = await getAdminClanRanks();
      setRanks(Array.isArray(data) ? data : DEFAULT_RANKS);
    } catch (err) {
      logger.warn('AdminClans: не удалось загрузить звания', err);
      setRanks(DEFAULT_RANKS);
    }
  };

  const loadClanDetails = async (id) => {
    setDetailsLoading(true);
    setError(null);

    try {
      const data = await getAdminClanById(id);
      setSelectedClan(data);
    } catch (err) {
      logger.warn(`AdminClans: не удалось загрузить клан ${id}`, err);
      setSelectedClan(null);
      setError(err);
    } finally {
      setDetailsLoading(false);
    }
  };

  useEffect(() => {
    loadClans();
    loadRanks();
  }, []);

  const updateField = (field, value) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setError(null);
    setMessage(null);
  };

  const startEdit = (clan) => {
    setEditingId(clan.id);
    setForm({
      tag: clan.tag ?? '',
      name: clan.name ?? '',
      description: clan.description ?? '',
      eloRating: clan.eloRating ?? 1000,
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const buildPayload = () => ({
    tag: form.tag.trim(),
    name: form.name.trim(),
    description: form.description.trim(),
    eloRating: Number(form.eloRating) || 0,
  });

  const validateForm = () => {
    const tagRegex = /^[A-Za-z0-9_-]{3,5}$/;

    if (!tagRegex.test(form.tag.trim())) {
      return 'Тег клана должен быть от 3 до 5 символов и может содержать только A-Z, a-z, 0-9, -, _.';
    }

    if (!form.name.trim()) {
      return 'Введите название клана';
    }

    if (!form.description.trim()) {
      return 'Введите описание клана';
    }

    if (Number(form.eloRating) < 0) {
      return 'Рейтинг ELO не может быть меньше 0';
    }

    return null;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError(null);
    setMessage(null);

    const validationError = validateForm();

    if (validationError) {
      setError({ message: validationError });
      return;
    }

    setSaving(true);

    try {
      const payload = buildPayload();

      const result = isEditing
        ? await updateAdminClan(editingId, payload)
        : await createAdminClan(payload);

      setMessage(result?.message || (isEditing ? 'Клан обновлён' : 'Клан создан'));
      resetForm();

      await loadClans();

      if (selectedClan?.id) {
        await loadClanDetails(selectedClan.id);
      }
    } catch (err) {
      logger.warn('AdminClans: не удалось сохранить клан', err);
      setError(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteClan = async (clan) => {
    const confirmed = window.confirm(`Удалить клан [${clan.tag}] ${clan.name}?`);

    if (!confirmed) return;

    setActionId(`clan-${clan.id}`);
    setError(null);
    setMessage(null);

    try {
      const result = await deleteAdminClan(clan.id);

      if (selectedClan?.id === clan.id) {
        setSelectedClan(null);
      }

      if (editingId === clan.id) {
        resetForm();
      }

      setMessage(result?.message || 'Клан удалён');
      await loadClans();
    } catch (err) {
      logger.warn('AdminClans: не удалось удалить клан', err);
      setError(err);
    } finally {
      setActionId(null);
    }
  };

  const handleRemovePlayer = async (player) => {
    if (!selectedClan) return;

    const confirmed = window.confirm(`Исключить игрока ${player.nickname} из клана?`);

    if (!confirmed) return;

    setActionId(`player-${player.id}`);
    setError(null);
    setMessage(null);

    try {
      const result = await removeAdminClanPlayer(selectedClan.id, player.id);

      setMessage(result?.message || 'Пользователь исключён из клана');

      await loadClanDetails(selectedClan.id);
      await loadClans();
    } catch (err) {
      logger.warn('AdminClans: не удалось исключить игрока', err);
      setError(err);
    } finally {
      setActionId(null);
    }
  };

  const handleRankChange = async (player, rankValue) => {
    if (!selectedClan) return;

    setActionId(`rank-${player.id}`);
    setError(null);
    setMessage(null);

    try {
      const result = await updateAdminClanPlayerRank(selectedClan.id, {
        userId: player.id,
        rank: Number(rankValue),
      });

      setMessage(result?.message || 'Звание обновлено');

      await loadClanDetails(selectedClan.id);
      await loadClans();
    } catch (err) {
      logger.warn('AdminClans: не удалось обновить звание', err);
      setError(err);
    } finally {
      setActionId(null);
    }
  };

  return (
    <main className="wrapper admin-clans">
      <div className="admin-clans__container">
        <header className="admin-clans__header">
          <div>
            <div className="admin-clans__label">
              Админ-панель
            </div>

            <h1 className="admin-clans__title">
              Управление кланами
            </h1>

            <p className="admin-clans__subtitle">
              Создание, редактирование и удаление кланов, просмотр участников и исключение пользователей из клана.
            </p>
          </div>

          <Link to="/admin" className="admin-clans__back">
            Назад в админку
          </Link>
        </header>

        {message && (
          <div className="admin-clans__message admin-clans__message--success">
            {message}
          </div>
        )}

        {error && (
          <div className="admin-clans__message admin-clans__message--error">
            {error?.data?.message || error?.message || 'Произошла ошибка'}
          </div>
        )}

        <section className="admin-clans__layout">
          <form className="admin-clans__form" onSubmit={handleSubmit}>
            <div className="admin-clans__form-head">
              <div>
                <h2>{isEditing ? 'Редактирование клана' : 'Новый клан'}</h2>
                <p>
                  Тег клана должен быть от 3 до 5 символов: латиница, цифры, дефис или нижнее подчёркивание.
                </p>
              </div>

              {isEditing && (
                <button
                  type="button"
                  className="admin-clans__small-btn"
                  onClick={resetForm}
                >
                  Отмена
                </button>
              )}
            </div>

            <div className="admin-clans__row">
              <label className="admin-clans__field">
                <span>Тег</span>
                <input
                  type="text"
                  value={form.tag}
                  onChange={(event) => updateField('tag', event.target.value)}
                  placeholder="EVG"
                  maxLength={5}
                />
              </label>

              <label className="admin-clans__field">
                <span>Рейтинг ELO</span>
                <input
                  type="number"
                  value={form.eloRating}
                  onChange={(event) => updateField('eloRating', event.target.value)}
                  min={0}
                  max={100000}
                />
              </label>
            </div>

            <label className="admin-clans__field">
              <span>Название</span>
              <input
                type="text"
                value={form.name}
                onChange={(event) => updateField('name', event.target.value)}
                placeholder="Название клана"
                maxLength={100}
              />
            </label>

            <label className="admin-clans__field">
              <span>Описание</span>
              <textarea
                value={form.description}
                onChange={(event) => updateField('description', event.target.value)}
                placeholder="Описание клана"
                rows={6}
                maxLength={1000}
              />
            </label>

            <button
              type="submit"
              className="admin-clans__submit"
              disabled={saving}
            >
              {saving
                ? 'Сохраняем...'
                : isEditing
                  ? 'Сохранить изменения'
                  : 'Создать клан'}
            </button>
          </form>

          <aside className="admin-clans__side">
            <section className="admin-clans__tools">
              <div className="admin-clans__section-head">
                <h2>Список кланов</h2>
                <span>{filteredClans.length}</span>
              </div>

              <label className="admin-clans__field">
                <span>Поиск</span>
                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Поиск по тегу или названию"
                />
              </label>
            </section>

            <section className="admin-clans__list-wrap">
              {loading ? (
                <p className="admin-clans__empty">Загружаем кланы...</p>
              ) : filteredClans.length > 0 ? (
                <div className="admin-clans__list">
                  {filteredClans.map((clan) => (
                    <article
                      key={clan.id}
                      className={`admin-clans__item${selectedClan?.id === clan.id ? ' admin-clans__item--active' : ''}`}
                    >
                      <div className="admin-clans__item-top">
                        <strong>[{clan.tag}]</strong>
                        <span>{clan.membersCount} участников</span>
                      </div>

                      <h3>{clan.name}</h3>
                      <p>{clan.description}</p>

                      <div className="admin-clans__item-meta">
                        <span>ELO: {clan.eloRating}</span>
                        <span>ID: {clan.id}</span>
                      </div>

                      <div className="admin-clans__item-actions">
                        <button
                          type="button"
                          className="admin-clans__small-btn"
                          onClick={() => loadClanDetails(clan.id)}
                        >
                          Участники
                        </button>

                        <button
                          type="button"
                          className="admin-clans__small-btn"
                          onClick={() => startEdit(clan)}
                        >
                          Изменить
                        </button>

                        <button
                          type="button"
                          className="admin-clans__small-btn admin-clans__small-btn--danger"
                          onClick={() => handleDeleteClan(clan)}
                          disabled={actionId === `clan-${clan.id}`}
                        >
                          Удалить
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <p className="admin-clans__empty">
                  Кланов пока нет.
                </p>
              )}
            </section>
          </aside>
        </section>

        <section className="admin-clans__members">
          <div className="admin-clans__section-head">
            <div>
              <h2>
                {selectedClan
                  ? `Участники клана [${selectedClan.tag}]`
                  : 'Участники клана'}
              </h2>

              <p>
                {selectedClan
                  ? `${selectedClan.name} — ${selectedClan.membersCount} участников`
                  : 'Выберите клан из списка, чтобы посмотреть участников.'}
              </p>
            </div>

            {selectedClan && (
              <button
                type="button"
                className="admin-clans__small-btn"
                onClick={() => loadClanDetails(selectedClan.id)}
              >
                Обновить
              </button>
            )}
          </div>

          {detailsLoading ? (
            <p className="admin-clans__empty">Загружаем участников...</p>
          ) : selectedClan?.players?.length > 0 ? (
            <div className="admin-clans__members-list">
              {selectedClan.players.map((player) => (
                <article key={player.id} className="admin-clans__member">
                  <div className="admin-clans__member-main">
                    <strong>{player.nickname}</strong>

                    {player.email && (
                      <span>{player.email}</span>
                    )}
                  </div>

                  <div className="admin-clans__member-rank">
                    <label>
                      <span>Звание</span>

                      <select
                        value={getRankValue(player.rank)}
                        onChange={(event) => handleRankChange(player, event.target.value)}
                        disabled={actionId === `rank-${player.id}`}
                      >
                        {ranks.map((rank) => (
                          <option key={rank.value} value={rank.value}>
                            {rank.label}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>

                  <div className="admin-clans__member-info">
                    <span>{player.rankLabel}</span>

                    {player.roles?.length > 0 && (
                      <span>{player.roles.join(', ')}</span>
                    )}
                  </div>

                  <button
                    type="button"
                    className="admin-clans__small-btn admin-clans__small-btn--danger"
                    onClick={() => handleRemovePlayer(player)}
                    disabled={actionId === `player-${player.id}`}
                  >
                    Исключить
                  </button>
                </article>
              ))}
            </div>
          ) : selectedClan ? (
            <p className="admin-clans__empty">
              В этом клане пока нет участников.
            </p>
          ) : (
            <p className="admin-clans__empty">
              Клан не выбран.
            </p>
          )}
        </section>
      </div>
    </main>
  );
}

function getRankValue(rank) {
  const found = DEFAULT_RANKS.find((item) => item.key === rank);

  return found?.value ?? 1;
}

export default AdminClans;