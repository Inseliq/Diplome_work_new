import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  getAdminReserves,
  getAdminClanReserves,
  setAdminReserveAmount,
  adjustAdminReserveAmount,
  deleteAdminReserveInventory,
} from '../../../api/endpoints';
import { logger } from '../../utils/logger';

function formatDateTime(value) {
  if (!value) return '—';

  return new Date(value).toLocaleString('ru-RU', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getTotalStock(clan) {
  if (!clan?.groups) return 0;

  return clan.groups.reduce((groupSum, group) => {
    const reserveSum = group.reserves?.reduce((sum, reserve) => sum + reserve.stock, 0) ?? 0;

    return groupSum + reserveSum;
  }, 0);
}

function AdminReserves() {
  const [clans, setClans] = useState([]);
  const [selectedClan, setSelectedClan] = useState(null);
  const [draftAmounts, setDraftAmounts] = useState({});
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [actionKey, setActionKey] = useState(null);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const selectedTotalStock = useMemo(
    () => getTotalStock(selectedClan),
    [selectedClan]
  );

  const loadReserves = async (searchValue = search, selectedClanId = selectedClan?.id) => {
    setLoading(true);
    setError(null);

    try {
      const data = await getAdminReserves(searchValue);
      const list = Array.isArray(data) ? data : [];

      setClans(list);

      const nextSelected =
        list.find((clan) => clan.id === selectedClanId) ??
        list[0] ??
        null;

      setSelectedClan(nextSelected);
      syncDraftAmounts(nextSelected);
    } catch (err) {
      logger.warn('AdminReserves: не удалось загрузить резервы', err);
      setClans([]);
      setSelectedClan(null);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const loadSelectedClan = async (clanId = selectedClan?.id) => {
    if (!clanId) return;

    setDetailsLoading(true);
    setError(null);

    try {
      const data = await getAdminClanReserves(clanId);

      setSelectedClan(data);
      syncDraftAmounts(data);

      setClans((previous) =>
        previous.map((clan) => (clan.id === data.id ? data : clan))
      );
    } catch (err) {
      logger.warn('AdminReserves: не удалось загрузить выбранный клан', err);
      setError(err);
    } finally {
      setDetailsLoading(false);
    }
  };

  useEffect(() => {
    loadReserves('');
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadReserves(search, selectedClan?.id);
    }, 350);

    return () => clearTimeout(timer);
  }, [search]);

  const syncDraftAmounts = (clan) => {
    if (!clan?.groups) {
      setDraftAmounts({});
      return;
    }

    const next = {};

    clan.groups.forEach((group) => {
      group.reserves.forEach((reserve) => {
        next[getDraftKey(clan.id, reserve.type)] = String(reserve.stock);
      });
    });

    setDraftAmounts(next);
  };

  const getDraftKey = (clanId, reserveType) => `${clanId}:${reserveType}`;

  const getDraftAmount = (reserve) => {
    if (!selectedClan) return '';

    return draftAmounts[getDraftKey(selectedClan.id, reserve.type)] ?? String(reserve.stock);
  };

  const updateDraftAmount = (reserve, value) => {
    if (!selectedClan) return;

    const onlyNumber = value.replace(/[^\d]/g, '');

    setDraftAmounts((previous) => ({
      ...previous,
      [getDraftKey(selectedClan.id, reserve.type)]: onlyNumber,
    }));
  };

  const selectClan = (clan) => {
    setSelectedClan(clan);
    syncDraftAmounts(clan);
    setError(null);
    setMessage(null);
  };

  const handleSetAmount = async (reserve) => {
    if (!selectedClan) return;

    const amount = Number(getDraftAmount(reserve));

    if (Number.isNaN(amount) || amount < 0) {
      setError({ message: 'Количество резервов не может быть меньше 0' });
      return;
    }

    const key = `set-${selectedClan.id}-${reserve.type}`;

    setActionKey(key);
    setError(null);
    setMessage(null);

    try {
      const result = await setAdminReserveAmount(
        selectedClan.id,
        reserve.type,
        amount
      );

      setMessage(result?.message || 'Количество резервов обновлено');

      if (result?.clan) {
        setSelectedClan(result.clan);
        syncDraftAmounts(result.clan);

        setClans((previous) =>
          previous.map((clan) => (clan.id === result.clan.id ? result.clan : clan))
        );
      }
    } catch (err) {
      logger.warn('AdminReserves: не удалось установить количество', err);
      setError(err);
    } finally {
      setActionKey(null);
    }
  };

  const handleAdjustAmount = async (reserve, delta) => {
    if (!selectedClan) return;

    const key = `adjust-${selectedClan.id}-${reserve.type}-${delta}`;

    setActionKey(key);
    setError(null);
    setMessage(null);

    try {
      const result = await adjustAdminReserveAmount(
        selectedClan.id,
        reserve.type,
        delta
      );

      setMessage(result?.message || 'Количество резервов изменено');

      if (result?.clan) {
        setSelectedClan(result.clan);
        syncDraftAmounts(result.clan);

        setClans((previous) =>
          previous.map((clan) => (clan.id === result.clan.id ? result.clan : clan))
        );
      }
    } catch (err) {
      logger.warn('AdminReserves: не удалось изменить количество', err);
      setError(err);
    } finally {
      setActionKey(null);
    }
  };

  const handleZeroAmount = async (reserve) => {
    if (!selectedClan) return;

    const confirmed = window.confirm(`Обнулить резерв «${reserve.title}» у клана [${selectedClan.tag}]?`);

    if (!confirmed) return;

    const key = `zero-${selectedClan.id}-${reserve.type}`;

    setActionKey(key);
    setError(null);
    setMessage(null);

    try {
      const result = await deleteAdminReserveInventory(
        selectedClan.id,
        reserve.type
      );

      setMessage(result?.message || 'Запас резерва обнулён');

      if (result?.clan) {
        setSelectedClan(result.clan);
        syncDraftAmounts(result.clan);

        setClans((previous) =>
          previous.map((clan) => (clan.id === result.clan.id ? result.clan : clan))
        );
      }
    } catch (err) {
      logger.warn('AdminReserves: не удалось обнулить резерв', err);
      setError(err);
    } finally {
      setActionKey(null);
    }
  };

  return (
    <main className="wrapper admin-reserves">
      <div className="admin-reserves__container">
        <header className="admin-reserves__header">
          <div>
            <div className="admin-reserves__label">
              Админ-панель
            </div>

            <h1 className="admin-reserves__title">
              Резервы кланов
            </h1>

            <p className="admin-reserves__subtitle">
              Управляйте складом клановых резервов: добавляйте, убавляйте и задавайте точное количество резервов для каждого клана.
            </p>
          </div>

          <Link to="/admin" className="admin-reserves__back">
            Назад в админку
          </Link>
        </header>

        {message && (
          <div className="admin-reserves__message admin-reserves__message--success">
            {message}
          </div>
        )}

        {error && (
          <div className="admin-reserves__message admin-reserves__message--error">
            {error?.data?.message || error?.message || 'Произошла ошибка'}
          </div>
        )}

        <section className="admin-reserves__layout">
          <aside className="admin-reserves__clans">
            <div className="admin-reserves__section-head">
              <div>
                <h2>Кланы</h2>
                <p>Выберите клан для управления складом резервов.</p>
              </div>

              <span>{clans.length}</span>
            </div>

            <label className="admin-reserves__field">
              <span>Поиск клана</span>
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Тег или название"
              />
            </label>

            <div className="admin-reserves__clan-list">
              {loading ? (
                <p className="admin-reserves__empty">Загружаем кланы...</p>
              ) : clans.length > 0 ? (
                clans.map((clan) => (
                  <button
                    key={clan.id}
                    type="button"
                    className={`admin-reserves__clan-card${selectedClan?.id === clan.id ? ' admin-reserves__clan-card--active' : ''}`}
                    onClick={() => selectClan(clan)}
                  >
                    <div className="admin-reserves__clan-main">
                      <strong>[{clan.tag}] {clan.name}</strong>
                      <span>{clan.membersCount} участников</span>
                    </div>

                    <div className="admin-reserves__clan-meta">
                      <span>ELO: {clan.eloRating}</span>
                      <span>На складе: {getTotalStock(clan)}</span>
                    </div>
                  </button>
                ))
              ) : (
                <p className="admin-reserves__empty">
                  Кланы не найдены.
                </p>
              )}
            </div>
          </aside>

          <section className="admin-reserves__content">
            {!selectedClan ? (
              <div className="admin-reserves__placeholder">
                <h2>Клан не выбран</h2>
                <p>Выберите клан слева, чтобы изменить количество резервов.</p>
              </div>
            ) : (
              <>
                <div className="admin-reserves__clan-head">
                  <div>
                    <div className="admin-reserves__clan-label">
                      Выбранный клан
                    </div>

                    <h2>[{selectedClan.tag}] {selectedClan.name}</h2>

                    <p>
                      Участников: {selectedClan.membersCount} · ELO: {selectedClan.eloRating} · Всего резервов: {selectedTotalStock}
                    </p>
                  </div>

                  <button
                    type="button"
                    className="admin-reserves__small-btn"
                    onClick={() => loadSelectedClan(selectedClan.id)}
                    disabled={detailsLoading}
                  >
                    Обновить
                  </button>
                </div>

                {selectedClan.groups?.map((group) => (
                  <ReserveGroup
                    key={group.key}
                    group={group}
                    selectedClan={selectedClan}
                    actionKey={actionKey}
                    getDraftAmount={getDraftAmount}
                    updateDraftAmount={updateDraftAmount}
                    onSetAmount={handleSetAmount}
                    onAdjustAmount={handleAdjustAmount}
                    onZeroAmount={handleZeroAmount}
                  />
                ))}
              </>
            )}
          </section>
        </section>
      </div>
    </main>
  );
}

function ReserveGroup({
  group,
  selectedClan,
  actionKey,
  getDraftAmount,
  updateDraftAmount,
  onSetAmount,
  onAdjustAmount,
  onZeroAmount,
}) {
  return (
    <section className="admin-reserves__group">
      <div className="admin-reserves__group-head">
        <div>
          <h3>{group.title}</h3>

          {group.activeReserve ? (
            <p>
              Активен резерв «{group.activeReserve.title}» до {formatDateTime(group.activeReserve.endsAtUtc)}.
              Активировал: {group.activeReserve.activatedByNickname}.
            </p>
          ) : (
            <p>В этой группе сейчас нет активного резерва.</p>
          )}
        </div>

        {group.activeReserve && (
          <span className="admin-reserves__active-badge">
            Активен
          </span>
        )}
      </div>

      <div className="admin-reserves__grid">
        {group.reserves.map((reserve) => {
          const setKey = `set-${selectedClan.id}-${reserve.type}`;
          const isBusy = actionKey?.includes(`${selectedClan.id}-${reserve.type}`);

          return (
            <article key={reserve.type} className="admin-reserves__reserve">
              <div className="admin-reserves__reserve-top">
                <img
                  src={reserve.imageUrl}
                  alt={reserve.title}
                  className="admin-reserves__reserve-img"
                />

                <div>
                  <h4>{reserve.title}</h4>
                  <p>{reserve.bonusText}</p>
                </div>
              </div>

              <p className="admin-reserves__reserve-desc">
                {reserve.description}
              </p>

              <div className="admin-reserves__stock">
                <span>На складе</span>
                <strong>{reserve.stock}</strong>
              </div>

              <label className="admin-reserves__field admin-reserves__field--compact">
                <span>Точное количество</span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={getDraftAmount(reserve)}
                  onChange={(event) => updateDraftAmount(reserve, event.target.value)}
                />
              </label>

              <div className="admin-reserves__quick-actions">
                <button
                  type="button"
                  onClick={() => onAdjustAmount(reserve, -1)}
                  disabled={isBusy || reserve.stock <= 0}
                >
                  -1
                </button>

                <button
                  type="button"
                  onClick={() => onAdjustAmount(reserve, 1)}
                  disabled={isBusy}
                >
                  +1
                </button>

                <button
                  type="button"
                  onClick={() => onAdjustAmount(reserve, 5)}
                  disabled={isBusy}
                >
                  +5
                </button>

                <button
                  type="button"
                  onClick={() => onAdjustAmount(reserve, 10)}
                  disabled={isBusy}
                >
                  +10
                </button>
              </div>

              <div className="admin-reserves__reserve-actions">
                <button
                  type="button"
                  className="admin-reserves__submit"
                  onClick={() => onSetAmount(reserve)}
                  disabled={actionKey === setKey}
                >
                  Сохранить
                </button>

                <button
                  type="button"
                  className="admin-reserves__small-btn admin-reserves__small-btn--danger"
                  onClick={() => onZeroAmount(reserve)}
                  disabled={isBusy || reserve.stock <= 0}
                >
                  Обнулить
                </button>
              </div>

              {reserve.updatedAtUtc && (
                <div className="admin-reserves__updated">
                  Обновлено: {formatDateTime(reserve.updatedAtUtc)}
                </div>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}

export default AdminReserves;