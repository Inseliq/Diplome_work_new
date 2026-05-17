import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  getAdminUsers,
  getAdminUserById,
  updateAdminUserProfile,
  setAdminUserClan,
  removeAdminUserClan,
  updateAdminUserClanRank,
  setAdminUserAdministrator,
  getAdminUserClanRanks,
  getAdminClans,
} from '../../../api/endpoints';
import { logger } from '../../utils/logger';

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

const EMPTY_PROFILE_FORM = {
  nickname: '',
  email: '',
};

const EMPTY_CLAN_FORM = {
  clanId: '',
  rank: 2,
};

function getRankValueByKey(rankKey, ranks) {
  const found = ranks.find((rank) => rank.key === rankKey);

  return found?.value ?? 1;
}

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [clans, setClans] = useState([]);
  const [ranks, setRanks] = useState(DEFAULT_RANKS);
  const [selectedUser, setSelectedUser] = useState(null);
  const [profileForm, setProfileForm] = useState(EMPTY_PROFILE_FORM);
  const [clanForm, setClanForm] = useState(EMPTY_CLAN_FORM);
  const [search, setSearch] = useState('');
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingDictionaries, setLoadingDictionaries] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingClan, setSavingClan] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const selectedClan = useMemo(() => {
    if (!selectedUser?.clan?.id) return null;

    return clans.find((clan) => clan.id === selectedUser.clan.id) ?? null;
  }, [clans, selectedUser]);

  const loadUsers = async (searchValue = search) => {
    setLoadingUsers(true);
    setError(null);

    try {
      const data = await getAdminUsers(searchValue);
      setUsers(Array.isArray(data) ? data : []);

      if (selectedUser) {
        const updatedSelected = Array.isArray(data)
          ? data.find((user) => user.id === selectedUser.id)
          : null;

        if (updatedSelected) {
          applySelectedUser(updatedSelected);
        }
      }
    } catch (err) {
      logger.warn('AdminUsers: не удалось загрузить пользователей', err);
      setUsers([]);
      setError(err);
    } finally {
      setLoadingUsers(false);
    }
  };

  const loadDictionaries = async () => {
    setLoadingDictionaries(true);

    try {
      const [clansData, ranksData] = await Promise.all([
        getAdminClans(),
        getAdminUserClanRanks(),
      ]);

      setClans(Array.isArray(clansData) ? clansData : []);
      setRanks(Array.isArray(ranksData) ? ranksData : DEFAULT_RANKS);
    } catch (err) {
      logger.warn('AdminUsers: не удалось загрузить справочники', err);
      setClans([]);
      setRanks(DEFAULT_RANKS);
    } finally {
      setLoadingDictionaries(false);
    }
  };

  useEffect(() => {
    loadUsers('');
    loadDictionaries();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadUsers(search);
    }, 350);

    return () => clearTimeout(timer);
  }, [search]);

  const applySelectedUser = (user) => {
    setSelectedUser(user);

    setProfileForm({
      nickname: user.nickname ?? '',
      email: user.email ?? '',
    });

    setClanForm({
      clanId: user.clan?.id ?? '',
      rank: user.clanRank
        ? getRankValueByKey(user.clanRank, ranks)
        : 2,
    });
  };

  const selectUser = async (user) => {
    setError(null);
    setMessage(null);

    try {
      const freshUser = await getAdminUserById(user.id);
      applySelectedUser(freshUser);
    } catch (err) {
      logger.warn('AdminUsers: не удалось загрузить пользователя', err);
      applySelectedUser(user);
      setError(err);
    }
  };

  const refreshSelectedUser = async () => {
    if (!selectedUser) return;

    try {
      const freshUser = await getAdminUserById(selectedUser.id);
      applySelectedUser(freshUser);
    } catch (err) {
      logger.warn('AdminUsers: не удалось обновить выбранного пользователя', err);
      setError(err);
    }
  };

  const updateProfileField = (field, value) => {
    setProfileForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const updateClanField = (field, value) => {
    setClanForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const handleSaveProfile = async (event) => {
    event.preventDefault();

    if (!selectedUser) return;

    setMessage(null);
    setError(null);

    const nicknameRegex = /^[A-Za-z0-9_]{3,24}$/;

    if (!nicknameRegex.test(profileForm.nickname.trim())) {
      setError({
        message: 'Никнейм должен быть от 3 до 24 символов и может содержать только A-Z, a-z, 0-9 и _.',
      });
      return;
    }

    if (!profileForm.email.trim()) {
      setError({ message: 'Введите почту пользователя' });
      return;
    }

    setSavingProfile(true);

    try {
      const result = await updateAdminUserProfile(selectedUser.id, {
        nickname: profileForm.nickname.trim(),
        email: profileForm.email.trim(),
      });

      setMessage(result?.message || 'Пользователь обновлён');

      if (result?.user) {
        applySelectedUser(result.user);
      }

      await loadUsers(search);
    } catch (err) {
      logger.warn('AdminUsers: не удалось сохранить профиль', err);
      setError(err);
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSetClan = async (event) => {
    event.preventDefault();

    if (!selectedUser) return;

    setMessage(null);
    setError(null);

    if (!clanForm.clanId) {
      setError({ message: 'Выберите клан' });
      return;
    }

    setSavingClan(true);

    try {
      const result = await setAdminUserClan(selectedUser.id, {
        clanId: Number(clanForm.clanId),
        rank: Number(clanForm.rank),
      });

      setMessage(result?.message || 'Клан пользователя обновлён');

      if (result?.user) {
        applySelectedUser(result.user);
      }

      await loadUsers(search);
      await loadDictionaries();
    } catch (err) {
      logger.warn('AdminUsers: не удалось обновить клан пользователя', err);
      setError(err);
    } finally {
      setSavingClan(false);
    }
  };

  const handleRemoveFromClan = async () => {
    if (!selectedUser) return;

    const confirmed = window.confirm(`Удалить ${selectedUser.nickname} из клана?`);

    if (!confirmed) return;

    setActionLoading(true);
    setMessage(null);
    setError(null);

    try {
      const result = await removeAdminUserClan(selectedUser.id);

      setMessage(result?.message || 'Пользователь удалён из клана');

      if (result?.user) {
        applySelectedUser(result.user);
      }

      await loadUsers(search);
      await loadDictionaries();
    } catch (err) {
      logger.warn('AdminUsers: не удалось удалить пользователя из клана', err);
      setError(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateRank = async () => {
    if (!selectedUser) return;

    setActionLoading(true);
    setMessage(null);
    setError(null);

    try {
      const result = await updateAdminUserClanRank(selectedUser.id, {
        rank: Number(clanForm.rank),
      });

      setMessage(result?.message || 'Звание пользователя обновлено');

      if (result?.user) {
        applySelectedUser(result.user);
      }

      await loadUsers(search);
    } catch (err) {
      logger.warn('AdminUsers: не удалось обновить звание пользователя', err);
      setError(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleAdministrator = async () => {
    if (!selectedUser) return;

    const nextValue = !selectedUser.isAdministrator;

    const confirmed = window.confirm(
      nextValue
        ? `Выдать права администратора пользователю ${selectedUser.nickname}?`
        : `Снять права администратора у пользователя ${selectedUser.nickname}?`
    );

    if (!confirmed) return;

    setActionLoading(true);
    setMessage(null);
    setError(null);

    try {
      const result = await setAdminUserAdministrator(selectedUser.id, nextValue);

      setMessage(result?.message || 'Права пользователя обновлены');

      if (result?.user) {
        applySelectedUser(result.user);
      }

      await loadUsers(search);
    } catch (err) {
      logger.warn('AdminUsers: не удалось обновить роль администратора', err);
      setError(err);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <main className="wrapper admin-users">
      <div className="admin-users__container">
        <header className="admin-users__header">
          <div>
            <div className="admin-users__label">
              Админ-панель
            </div>

            <h1 className="admin-users__title">
              Управление пользователями
            </h1>

            <p className="admin-users__subtitle">
              Просматривайте пользователей, меняйте никнейм и почту, назначайте клан, управляйте званием и правами администратора.
            </p>
          </div>

          <Link to="/admin" className="admin-users__back">
            Назад в админку
          </Link>
        </header>

        {message && (
          <div className="admin-users__message admin-users__message--success">
            {message}
          </div>
        )}

        {error && (
          <div className="admin-users__message admin-users__message--error">
            {error?.data?.message || error?.message || 'Произошла ошибка'}
          </div>
        )}

        <section className="admin-users__layout">
          <aside className="admin-users__list-panel">
            <div className="admin-users__section-head">
              <div>
                <h2>Пользователи</h2>
                <p>Асинхронный поиск по никнейму или почте.</p>
              </div>

              <span>{users.length}</span>
            </div>

            <label className="admin-users__field">
              <span>Поиск</span>
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Введите никнейм или почту"
              />
            </label>

            <div className="admin-users__list">
              {loadingUsers ? (
                <p className="admin-users__empty">
                  Загружаем пользователей...
                </p>
              ) : users.length > 0 ? (
                users.map((user) => (
                  <button
                    key={user.id}
                    type="button"
                    className={`admin-users__user-card${selectedUser?.id === user.id ? ' admin-users__user-card--active' : ''}`}
                    onClick={() => selectUser(user)}
                  >
                    <div className="admin-users__user-main">
                      <strong>{user.nickname}</strong>
                      <span>{user.email}</span>
                    </div>

                    <div className="admin-users__user-meta">
                      {user.clan ? (
                        <span>[{user.clan.tag}] {user.clanRankLabel}</span>
                      ) : (
                        <span>Без клана</span>
                      )}

                      {user.isAdministrator && (
                        <b>Администратор</b>
                      )}

                      {!user.isAdministrator && user.isModerator && (
                        <b>Модератор</b>
                      )}
                    </div>
                  </button>
                ))
              ) : (
                <p className="admin-users__empty">
                  Пользователи не найдены.
                </p>
              )}
            </div>
          </aside>

          <section className="admin-users__details">
            {!selectedUser ? (
              <div className="admin-users__placeholder">
                <h2>Пользователь не выбран</h2>
                <p>Выберите пользователя из списка слева, чтобы открыть управление аккаунтом.</p>
              </div>
            ) : (
              <>
                <div className="admin-users__profile-head">
                  <div>
                    <div className="admin-users__profile-id">
                      ID: {selectedUser.id}
                    </div>

                    <h2>{selectedUser.nickname}</h2>

                    <p>{selectedUser.email}</p>
                  </div>

                  <button
                    type="button"
                    className="admin-users__small-btn"
                    onClick={refreshSelectedUser}
                  >
                    Обновить
                  </button>
                </div>

                <div className="admin-users__cards">
                  <form className="admin-users__card" onSubmit={handleSaveProfile}>
                    <div className="admin-users__card-head">
                      <h3>Профиль</h3>
                      <p>Изменение никнейма и почты пользователя.</p>
                    </div>

                    <label className="admin-users__field">
                      <span>Никнейм</span>
                      <input
                        type="text"
                        value={profileForm.nickname}
                        onChange={(event) => updateProfileField('nickname', event.target.value)}
                        maxLength={24}
                      />
                    </label>

                    <label className="admin-users__field">
                      <span>Почта</span>
                      <input
                        type="email"
                        value={profileForm.email}
                        onChange={(event) => updateProfileField('email', event.target.value)}
                      />
                    </label>

                    <button
                      type="submit"
                      className="admin-users__submit"
                      disabled={savingProfile}
                    >
                      {savingProfile ? 'Сохраняем...' : 'Сохранить профиль'}
                    </button>
                  </form>

                  <form className="admin-users__card" onSubmit={handleSetClan}>
                    <div className="admin-users__card-head">
                      <h3>Клан</h3>
                      <p>
                        Назначение клана и звания. Модератор выдаётся автоматически от звания «Командир подразделения» и выше.
                      </p>
                    </div>

                    <div className="admin-users__current-clan">
                      {selectedUser.clan ? (
                        <>
                          <span>Текущий клан</span>
                          <strong>[{selectedUser.clan.tag}] {selectedUser.clan.name}</strong>
                          <p>{selectedUser.clanRankLabel}</p>

                          <Link
                            className="admin-users__inline-link"
                            to={`/admin/clans?clanId=${selectedUser.clan.id}`}
                          >
                            Перейти к администрированию клана
                          </Link>
                        </>
                      ) : (
                        <>
                          <span>Текущий клан</span>
                          <strong>Пользователь не состоит в клане</strong>
                        </>
                      )}
                    </div>

                    <label className="admin-users__field">
                      <span>Клан</span>
                      <select
                        value={clanForm.clanId}
                        onChange={(event) => updateClanField('clanId', event.target.value)}
                        disabled={loadingDictionaries}
                      >
                        <option value="">Выберите клан</option>

                        {clans.map((clan) => (
                          <option key={clan.id} value={clan.id}>
                            [{clan.tag}] {clan.name} — {clan.membersCount}/100
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="admin-users__field">
                      <span>Звание</span>
                      <select
                        value={clanForm.rank}
                        onChange={(event) => updateClanField('rank', event.target.value)}
                      >
                        {ranks.map((rank) => (
                          <option key={rank.value} value={rank.value}>
                            {rank.label}
                          </option>
                        ))}
                      </select>
                    </label>

                    <div className="admin-users__actions-row">
                      <button
                        type="submit"
                        className="admin-users__submit"
                        disabled={savingClan}
                      >
                        {savingClan ? 'Сохраняем...' : 'Назначить клан'}
                      </button>

                      {selectedUser.clan && (
                        <button
                          type="button"
                          className="admin-users__small-btn"
                          onClick={handleUpdateRank}
                          disabled={actionLoading}
                        >
                          Обновить звание
                        </button>
                      )}

                      {selectedUser.clan && (
                        <button
                          type="button"
                          className="admin-users__small-btn admin-users__small-btn--danger"
                          onClick={handleRemoveFromClan}
                          disabled={actionLoading}
                        >
                          Удалить из клана
                        </button>
                      )}
                    </div>
                  </form>

                  <section className="admin-users__card">
                    <div className="admin-users__card-head">
                      <h3>Права доступа</h3>
                      <p>
                        Роль модератора управляется автоматически через звание в клане. Здесь можно вручную управлять только администратором.
                      </p>
                    </div>

                    <div className="admin-users__roles">
                      {selectedUser.roles?.length > 0 ? (
                        selectedUser.roles.map((role) => (
                          <span key={role}>{role}</span>
                        ))
                      ) : (
                        <span>Обычный пользователь</span>
                      )}
                    </div>

                    <button
                      type="button"
                      className={selectedUser.isAdministrator
                        ? 'admin-users__submit admin-users__submit--danger'
                        : 'admin-users__submit'}
                      onClick={handleToggleAdministrator}
                      disabled={actionLoading}
                    >
                      {selectedUser.isAdministrator
                        ? 'Снять администратора'
                        : 'Выдать администратора'}
                    </button>
                  </section>

                  <section className="admin-users__card">
                    <div className="admin-users__card-head">
                      <h3>Сводка</h3>
                    </div>

                    <div className="admin-users__summary">
                      <div>
                        <span>Никнейм</span>
                        <strong>{selectedUser.nickname}</strong>
                      </div>

                      <div>
                        <span>Почта</span>
                        <strong>{selectedUser.email}</strong>
                      </div>

                      <div>
                        <span>Клан</span>
                        <strong>
                          {selectedUser.clan
                            ? `[${selectedUser.clan.tag}] ${selectedUser.clan.name}`
                            : 'Нет'}
                        </strong>
                      </div>

                      <div>
                        <span>Звание</span>
                        <strong>{selectedUser.clanRankLabel || 'Нет'}</strong>
                      </div>

                      <div>
                        <span>Администратор</span>
                        <strong>{selectedUser.isAdministrator ? 'Да' : 'Нет'}</strong>
                      </div>

                      <div>
                        <span>Модератор</span>
                        <strong>{selectedUser.isModerator ? 'Да' : 'Нет'}</strong>
                      </div>
                    </div>
                  </section>
                </div>
              </>
            )}
          </section>
        </section>
      </div>
    </main>
  );
}

export default AdminUsers;