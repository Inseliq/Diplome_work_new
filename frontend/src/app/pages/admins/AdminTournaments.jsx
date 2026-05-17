import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  getAdminTournaments,
  getAdminTournamentById,
  createAdminTournament,
  updateAdminTournament,
  setAdminTournamentPublished,
  deleteAdminTournament,
  deleteAdminTournamentRegistration,
  confirmAdminTournamentRegistration,
  rejectAdminTournamentRegistration,
  createAdminTournamentMap,
  updateAdminTournamentMap,
  deleteAdminTournamentMap,
  createAdminTournamentPrize,
  updateAdminTournamentPrize,
  deleteAdminTournamentPrize,
} from '../../../api/endpoints';
import { logger } from '../../utils/logger';

const TODAY = new Date().toISOString().slice(0, 10);

const EMPTY_TOURNAMENT_FORM = {
  name: '',
  description: '',
  type: 'common',
  tier: 10,
  format: '7x7',
  teamSize: 7,
  reserveSize: 1,
  maxParticipants: '',
  initialParticipants: 0,
  classes: '',
  status: 'upcoming',
  isStream: false,
  streamUrl: '',
  dateStart: TODAY,
  dateEnd: TODAY,
  regStart: TODAY,
  regEnd: TODAY,
  openForAll: true,
  sponsor: '',
  prizeText: '',
  isPublished: true,
  eventId: '',
};

const EMPTY_MAP_FORM = {
  name: '',
  image: '',
};

const EMPTY_PRIZE_FORM = {
  place: 'place1',
  amount: 0,
  type: 'gold',
  text: '',
};

const TOURNAMENT_TYPES = [
  { value: 'common', label: 'Обычный' },
  { value: 'rare', label: 'Редкий' },
  { value: 'epic', label: 'Эпический' },
  { value: 'legendary', label: 'Легендарный' },
  { value: 'brilliant', label: 'Бриллиантовый' },
];

const TOURNAMENT_STATUSES = [
  { value: 'upcoming', label: 'Скоро' },
  { value: 'registration', label: 'Регистрация' },
  { value: 'active', label: 'Идёт' },
  { value: 'finished', label: 'Завершён' },
];

const REGISTRATION_STATUSES = {
  sent: {
    label: 'На рассмотрении',
    className: 'admin-tournaments__reg-status--sent',
  },
  confirmed: {
    label: 'Принята',
    className: 'admin-tournaments__reg-status--confirmed',
  },
  rejected: {
    label: 'Отклонена',
    className: 'admin-tournaments__reg-status--rejected',
  },
};

const PRIZE_PLACES = [
  { value: 'place1', label: '1 место' },
  { value: 'place2', label: '2 место' },
  { value: 'place3', label: '3 место' },
  { value: 'others', label: 'Остальные' },
];

const PRIZE_TYPES = [
  { value: 'gold', label: 'Золото' },
  { value: 'rub', label: 'Рубли' },
  { value: 'time-prime', label: 'Премиум' },
  { value: 'any', label: 'Другое' },
];

function getStatusLabel(value) {
  return TOURNAMENT_STATUSES.find((item) => item.value === value)?.label || value;
}

function getTypeLabel(value) {
  return TOURNAMENT_TYPES.find((item) => item.value === value)?.label || value;
}

function normalizeRegistrationStatus(status) {
  return String(status ?? '').trim().toLowerCase();
}

function getRegistrationStatusConfig(status) {
  const normalized = normalizeRegistrationStatus(status);

  return REGISTRATION_STATUSES[normalized] ?? {
    label: status || 'Неизвестно',
    className: '',
  };
}

function getErrorMessage(err) {
  return (
    err?.response?.data?.message ||
    err?.data?.message ||
    err?.message ||
    'Произошла ошибка'
  );
}

function AdminTournaments() {
  const [tournaments, setTournaments] = useState([]);
  const [selectedTournament, setSelectedTournament] = useState(null);

  const [tournamentForm, setTournamentForm] = useState(EMPTY_TOURNAMENT_FORM);
  const [mapForm, setMapForm] = useState(EMPTY_MAP_FORM);
  const [prizeForm, setPrizeForm] = useState(EMPTY_PRIZE_FORM);

  const [editingTournamentId, setEditingTournamentId] = useState(null);
  const [editingMapId, setEditingMapId] = useState(null);
  const [editingPrizeId, setEditingPrizeId] = useState(null);

  const [search, setSearch] = useState('');
  const [publishFilter, setPublishFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const [loading, setLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [savingTournament, setSavingTournament] = useState(false);
  const [savingMap, setSavingMap] = useState(false);
  const [savingPrize, setSavingPrize] = useState(false);
  const [actionKey, setActionKey] = useState(null);

  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const isEditingTournament = editingTournamentId != null;
  const isEditingMap = editingMapId != null;
  const isEditingPrize = editingPrizeId != null;

  const filteredTournaments = useMemo(() => {
    return tournaments.filter((item) => {
      const matchesPublish =
        publishFilter === 'all' ||
        (publishFilter === 'published' && item.isPublished) ||
        (publishFilter === 'drafts' && !item.isPublished);

      const matchesStatus =
        statusFilter === 'all' ||
        item.status === statusFilter;

      return matchesPublish && matchesStatus;
    });
  }, [tournaments, publishFilter, statusFilter]);

  const loadTournamentDetails = async (id, withLoading = true) => {
    if (withLoading) {
      setDetailsLoading(true);
    }

    setError(null);

    try {
      const data = await getAdminTournamentById(id);

      setSelectedTournament(data);

      setTournaments((previous) => {
        const exists = previous.some((item) => item.id === data.id);

        if (!exists) return [data, ...previous];

        return previous.map((item) => (item.id === data.id ? data : item));
      });

      return data;
    } catch (err) {
      logger.warn(`AdminTournaments: не удалось загрузить турнир ${id}`, err);
      setError(err);
      return null;
    } finally {
      if (withLoading) {
        setDetailsLoading(false);
      }
    }
  };

  const loadTournaments = async (searchValue = search, selectedId = selectedTournament?.id) => {
    setLoading(true);
    setError(null);

    try {
      const data = await getAdminTournaments(searchValue);
      const list = Array.isArray(data) ? data : [];

      setTournaments(list);

      if (selectedId) {
        const exists = list.find((x) => x.id === selectedId);

        if (exists) {
          await loadTournamentDetails(selectedId, false);
        } else {
          setSelectedTournament(null);
        }
      }
    } catch (err) {
      logger.warn('AdminTournaments: не удалось загрузить турниры', err);
      setTournaments([]);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTournaments('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadTournaments(search);
    }, 350);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const updateTournamentField = (field, value) => {
    setTournamentForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const updateMapField = (field, value) => {
    setMapForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const updatePrizeField = (field, value) => {
    setPrizeForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const resetTournamentForm = () => {
    setTournamentForm(EMPTY_TOURNAMENT_FORM);
    setEditingTournamentId(null);
  };

  const resetMapForm = () => {
    setMapForm(EMPTY_MAP_FORM);
    setEditingMapId(null);
  };

  const resetPrizeForm = () => {
    setPrizeForm(EMPTY_PRIZE_FORM);
    setEditingPrizeId(null);
  };

  const selectTournament = async (tournament) => {
    setMessage(null);
    setError(null);
    resetMapForm();
    resetPrizeForm();

    await loadTournamentDetails(tournament.id);
  };

  const startEditTournament = (tournament) => {
    setEditingTournamentId(tournament.id);

    setTournamentForm({
      name: tournament.name ?? '',
      description: tournament.description ?? '',
      type: tournament.type ?? 'common',
      tier: tournament.tier ?? 10,
      format: tournament.format ?? '7x7',
      teamSize: tournament.teamSize ?? 7,
      reserveSize: tournament.reserveSize ?? 1,
      maxParticipants: tournament.maxParticipants ?? '',
      initialParticipants: tournament.initialParticipants ?? 0,
      classes: tournament.classes ?? '',
      status: tournament.status ?? 'upcoming',
      isStream: Boolean(tournament.isStream),
      streamUrl: tournament.streamUrl ?? '',
      dateStart: tournament.dateStartISO ?? TODAY,
      dateEnd: tournament.dateEndISO ?? TODAY,
      regStart: tournament.regStartISO ?? TODAY,
      regEnd: tournament.regEndISO ?? TODAY,
      openForAll: Boolean(tournament.openForAll),
      sponsor: tournament.sponsor ?? '',
      prizeText: tournament.prizeText ?? '',
      isPublished: Boolean(tournament.isPublished),
      eventId: tournament.eventId ?? '',
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const buildTournamentPayload = () => ({
    name: tournamentForm.name.trim(),
    description: tournamentForm.description.trim(),
    type: tournamentForm.type,
    tier: Number(tournamentForm.tier),
    format: tournamentForm.format.trim(),
    teamSize: Number(tournamentForm.teamSize),
    reserveSize: Number(tournamentForm.reserveSize),
    maxParticipants: tournamentForm.maxParticipants === ''
      ? null
      : Number(tournamentForm.maxParticipants),
    initialParticipants: Number(tournamentForm.initialParticipants),
    classes: tournamentForm.classes.trim(),
    status: tournamentForm.status,
    isStream: Boolean(tournamentForm.isStream),
    streamUrl: tournamentForm.streamUrl.trim() || null,
    dateStart: tournamentForm.dateStart,
    dateEnd: tournamentForm.dateEnd,
    regStart: tournamentForm.regStart,
    regEnd: tournamentForm.regEnd,
    openForAll: Boolean(tournamentForm.openForAll),
    sponsor: tournamentForm.sponsor.trim() || null,
    prizeText: tournamentForm.prizeText.trim() || null,
    isPublished: Boolean(tournamentForm.isPublished),
    eventId: tournamentForm.eventId === ''
      ? null
      : Number(tournamentForm.eventId),
  });

  const validateTournamentForm = () => {
    if (!tournamentForm.name.trim()) return 'Введите название турнира';
    if (!tournamentForm.description.trim()) return 'Введите описание турнира';
    if (!tournamentForm.format.trim()) return 'Введите формат турнира';

    if (new Date(tournamentForm.dateEnd) < new Date(tournamentForm.dateStart)) {
      return 'Дата окончания турнира не может быть раньше даты начала';
    }

    if (new Date(tournamentForm.regEnd) < new Date(tournamentForm.regStart)) {
      return 'Дата окончания регистрации не может быть раньше даты начала регистрации';
    }

    if (Number(tournamentForm.teamSize) <= 0) {
      return 'Размер команды должен быть больше 0';
    }

    if (Number(tournamentForm.reserveSize) < 0) {
      return 'Количество запасных не может быть меньше 0';
    }

    return null;
  };

  const handleSaveTournament = async (event) => {
    event.preventDefault();

    setMessage(null);
    setError(null);

    const validationError = validateTournamentForm();

    if (validationError) {
      setError({ message: validationError });
      return;
    }

    setSavingTournament(true);

    try {
      const payload = buildTournamentPayload();

      const result = isEditingTournament
        ? await updateAdminTournament(editingTournamentId, payload)
        : await createAdminTournament(payload);

      setMessage(result?.message || 'Турнир сохранён');

      if (result?.tournament) {
        setSelectedTournament(result.tournament);

        setTournaments((previous) => {
          const exists = previous.some((item) => item.id === result.tournament.id);

          if (!exists) return [result.tournament, ...previous];

          return previous.map((item) =>
            item.id === result.tournament.id ? result.tournament : item
          );
        });
      }

      resetTournamentForm();
      await loadTournaments(search, result?.tournament?.id ?? selectedTournament?.id);
    } catch (err) {
      logger.warn('AdminTournaments: не удалось сохранить турнир', err);
      setError(err);
    } finally {
      setSavingTournament(false);
    }
  };

  const handleDeleteTournament = async (tournament) => {
    const confirmed = window.confirm(`Удалить турнир «${tournament.name}»?`);

    if (!confirmed) return;

    setActionKey(`delete-tournament-${tournament.id}`);
    setMessage(null);
    setError(null);

    try {
      const result = await deleteAdminTournament(tournament.id);

      setMessage(result?.message || 'Турнир удалён');

      if (selectedTournament?.id === tournament.id) {
        setSelectedTournament(null);
      }

      if (editingTournamentId === tournament.id) {
        resetTournamentForm();
      }

      await loadTournaments(search);
    } catch (err) {
      logger.warn('AdminTournaments: не удалось удалить турнир', err);
      setError(err);
    } finally {
      setActionKey(null);
    }
  };

  const handleTogglePublish = async (tournament) => {
    setActionKey(`publish-${tournament.id}`);
    setMessage(null);
    setError(null);

    try {
      const nextValue = !tournament.isPublished;
      const result = await setAdminTournamentPublished(tournament.id, nextValue);

      setMessage(result?.message || 'Статус публикации обновлён');

      await loadTournaments(search, tournament.id);
    } catch (err) {
      logger.warn('AdminTournaments: не удалось изменить публикацию', err);
      setError(err);
    } finally {
      setActionKey(null);
    }
  };

  const startEditMap = (map) => {
    setEditingMapId(map.id);
    setMapForm({
      name: map.name ?? '',
      image: map.image ?? '',
    });
  };

  const handleSaveMap = async (event) => {
    event.preventDefault();

    if (!selectedTournament) return;

    setMessage(null);
    setError(null);

    if (!mapForm.name.trim() || !mapForm.image.trim()) {
      setError({ message: 'Введите название карты и путь к изображению' });
      return;
    }

    setSavingMap(true);

    try {
      const payload = {
        name: mapForm.name.trim(),
        image: mapForm.image.trim(),
      };

      const result = isEditingMap
        ? await updateAdminTournamentMap(selectedTournament.id, editingMapId, payload)
        : await createAdminTournamentMap(selectedTournament.id, payload);

      setMessage(result?.message || 'Карта сохранена');

      if (result?.tournament) {
        setSelectedTournament(result.tournament);
      }

      resetMapForm();
      await loadTournaments(search, selectedTournament.id);
    } catch (err) {
      logger.warn('AdminTournaments: не удалось сохранить карту', err);
      setError(err);
    } finally {
      setSavingMap(false);
    }
  };

  const handleDeleteMap = async (map) => {
    if (!selectedTournament) return;

    const confirmed = window.confirm(`Удалить карту «${map.name}»?`);

    if (!confirmed) return;

    setActionKey(`delete-map-${map.id}`);
    setMessage(null);
    setError(null);

    try {
      const result = await deleteAdminTournamentMap(selectedTournament.id, map.id);

      setMessage(result?.message || 'Карта удалена');

      if (result?.tournament) {
        setSelectedTournament(result.tournament);
      }

      if (editingMapId === map.id) {
        resetMapForm();
      }

      await loadTournaments(search, selectedTournament.id);
    } catch (err) {
      logger.warn('AdminTournaments: не удалось удалить карту', err);
      setError(err);
    } finally {
      setActionKey(null);
    }
  };

  const startEditPrize = (prize) => {
    setEditingPrizeId(prize.id);
    setPrizeForm({
      place: prize.place ?? 'place1',
      amount: prize.amount ?? 0,
      type: prize.type ?? 'gold',
      text: prize.text ?? '',
    });
  };

  const handleSavePrize = async (event) => {
    event.preventDefault();

    if (!selectedTournament) return;

    setMessage(null);
    setError(null);
    setSavingPrize(true);

    try {
      const payload = {
        place: prizeForm.place,
        amount: Number(prizeForm.amount),
        type: prizeForm.type,
        text: prizeForm.text.trim() || null,
      };

      const result = isEditingPrize
        ? await updateAdminTournamentPrize(selectedTournament.id, editingPrizeId, payload)
        : await createAdminTournamentPrize(selectedTournament.id, payload);

      setMessage(result?.message || 'Приз сохранён');

      if (result?.tournament) {
        setSelectedTournament(result.tournament);
      }

      resetPrizeForm();
      await loadTournaments(search, selectedTournament.id);
    } catch (err) {
      logger.warn('AdminTournaments: не удалось сохранить приз', err);
      setError(err);
    } finally {
      setSavingPrize(false);
    }
  };

  const handleDeletePrize = async (prize) => {
    if (!selectedTournament) return;

    const confirmed = window.confirm(`Удалить приз «${prize.placeLabel}»?`);

    if (!confirmed) return;

    setActionKey(`delete-prize-${prize.id}`);
    setMessage(null);
    setError(null);

    try {
      const result = await deleteAdminTournamentPrize(selectedTournament.id, prize.id);

      setMessage(result?.message || 'Приз удалён');

      if (result?.tournament) {
        setSelectedTournament(result.tournament);
      }

      if (editingPrizeId === prize.id) {
        resetPrizeForm();
      }

      await loadTournaments(search, selectedTournament.id);
    } catch (err) {
      logger.warn('AdminTournaments: не удалось удалить приз', err);
      setError(err);
    } finally {
      setActionKey(null);
    }
  };

  const handleConfirmRegistration = async (registration) => {
    if (!selectedTournament) return;

    const confirmed = window.confirm(`Принять заявку команды «${registration.teamName}»?`);

    if (!confirmed) return;

    setActionKey(`confirm-registration-${registration.id}`);
    setMessage(null);
    setError(null);

    try {
      const result = await confirmAdminTournamentRegistration(
        selectedTournament.id,
        registration.id,
        {}
      );

      setMessage(result?.message || 'Заявка принята');

      if (result?.tournament) {
        setSelectedTournament(result.tournament);
      }

      await loadTournaments(search, selectedTournament.id);
    } catch (err) {
      logger.warn('AdminTournaments: не удалось принять заявку', err);
      setError(err);
    } finally {
      setActionKey(null);
    }
  };

  const handleRejectRegistration = async (registration) => {
    if (!selectedTournament) return;

    const reviewComment = window.prompt(
      `Причина отклонения заявки команды «${registration.teamName}»:`,
      ''
    );

    if (reviewComment === null) return;

    setActionKey(`reject-registration-${registration.id}`);
    setMessage(null);
    setError(null);

    try {
      const result = await rejectAdminTournamentRegistration(
        selectedTournament.id,
        registration.id,
        {
          comment: reviewComment.trim() || null,
        }
      );

      setMessage(result?.message || 'Заявка отклонена');

      if (result?.tournament) {
        setSelectedTournament(result.tournament);
      }

      await loadTournaments(search, selectedTournament.id);
    } catch (err) {
      logger.warn('AdminTournaments: не удалось отклонить заявку', err);
      setError(err);
    } finally {
      setActionKey(null);
    }
  };

  const handleDeleteRegistration = async (registration) => {
    if (!selectedTournament) return;

    const status = normalizeRegistrationStatus(registration.status);

    if (status === 'confirmed') {
      setError({ message: 'Подтверждённую заявку удалить нельзя' });
      return;
    }

    if (status === 'rejected') {
      setError({
        message: 'Отклонённую заявку лучше не удалять, иначе пользователь сможет подать заявку повторно.',
      });
      return;
    }

    const confirmed = window.confirm(`Удалить заявку команды «${registration.teamName}»?`);

    if (!confirmed) return;

    setActionKey(`delete-registration-${registration.id}`);
    setMessage(null);
    setError(null);

    try {
      const result = await deleteAdminTournamentRegistration(
        selectedTournament.id,
        registration.id
      );

      setMessage(result?.message || 'Заявка удалена');

      if (result?.tournament) {
        setSelectedTournament(result.tournament);
      }

      await loadTournaments(search, selectedTournament.id);
    } catch (err) {
      logger.warn('AdminTournaments: не удалось удалить регистрацию', err);
      setError(err);
    } finally {
      setActionKey(null);
    }
  };

  return (
    <main className="wrapper admin-tournaments">
      <div className="admin-tournaments__container">
        <header className="admin-tournaments__header">
          <div>
            <div className="admin-tournaments__label">
              Админ-панель
            </div>

            <h1 className="admin-tournaments__title">
              Управление турнирами
            </h1>

            <p className="admin-tournaments__subtitle">
              Создание и редактирование турниров, карт, призов и зарегистрированных команд.
              Матчи пока не добавлены в эту страницу — они находятся в отдельном модуле.
            </p>
          </div>

          <Link to="/admin" className="admin-tournaments__back">
            Назад в админку
          </Link>
        </header>

        {message && (
          <div className="admin-tournaments__message admin-tournaments__message--success">
            {message}
          </div>
        )}

        {error && (
          <div className="admin-tournaments__message admin-tournaments__message--error">
            {getErrorMessage(error)}
          </div>
        )}

        <section className="admin-tournaments__layout">
          <aside className="admin-tournaments__list-panel">
            <div className="admin-tournaments__section-head">
              <div>
                <h2>Турниры</h2>
                <p>Поиск работает по названию, описанию, формату и статусу.</p>
              </div>

              <span>{filteredTournaments.length}</span>
            </div>

            <label className="admin-tournaments__field">
              <span>Поиск</span>
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Название, формат, статус"
              />
            </label>

            <div className="admin-tournaments__filters">
              <button
                type="button"
                className={publishFilter === 'all' ? 'admin-tournaments__filter admin-tournaments__filter--active' : 'admin-tournaments__filter'}
                onClick={() => setPublishFilter('all')}
              >
                Все
              </button>

              <button
                type="button"
                className={publishFilter === 'published' ? 'admin-tournaments__filter admin-tournaments__filter--active' : 'admin-tournaments__filter'}
                onClick={() => setPublishFilter('published')}
              >
                Опубликованные
              </button>

              <button
                type="button"
                className={publishFilter === 'drafts' ? 'admin-tournaments__filter admin-tournaments__filter--active' : 'admin-tournaments__filter'}
                onClick={() => setPublishFilter('drafts')}
              >
                Черновики
              </button>
            </div>

            <div className="admin-tournaments__filters">
              <button
                type="button"
                className={statusFilter === 'all' ? 'admin-tournaments__filter admin-tournaments__filter--active' : 'admin-tournaments__filter'}
                onClick={() => setStatusFilter('all')}
              >
                Все статусы
              </button>

              {TOURNAMENT_STATUSES.map((status) => (
                <button
                  key={status.value}
                  type="button"
                  className={statusFilter === status.value ? 'admin-tournaments__filter admin-tournaments__filter--active' : 'admin-tournaments__filter'}
                  onClick={() => setStatusFilter(status.value)}
                >
                  {status.label}
                </button>
              ))}
            </div>

            <div className="admin-tournaments__list">
              {loading ? (
                <p className="admin-tournaments__empty">Загружаем турниры...</p>
              ) : filteredTournaments.length > 0 ? (
                filteredTournaments.map((tournament) => (
                  <article
                    key={tournament.id}
                    className={`admin-tournaments__item${selectedTournament?.id === tournament.id ? ' admin-tournaments__item--active' : ''}`}
                  >
                    <div className="admin-tournaments__item-top">
                      <strong>{tournament.name}</strong>
                      <span>{tournament.isPublished ? 'Опубликован' : 'Черновик'}</span>
                    </div>

                    <p>{tournament.description}</p>

                    <div className="admin-tournaments__item-meta">
                      <span>{getStatusLabel(tournament.status)}</span>
                      <span>{getTypeLabel(tournament.type)}</span>
                      <span>{tournament.format}</span>
                      <span>{tournament.currentParticipants}/{tournament.maxParticipants ?? '∞'}</span>
                    </div>

                    <div className="admin-tournaments__item-actions">
                      <button
                        type="button"
                        className="admin-tournaments__small-btn"
                        onClick={() => selectTournament(tournament)}
                      >
                        Открыть
                      </button>

                      <button
                        type="button"
                        className="admin-tournaments__small-btn"
                        onClick={() => startEditTournament(tournament)}
                      >
                        Изменить
                      </button>

                      <button
                        type="button"
                        className="admin-tournaments__small-btn"
                        onClick={() => handleTogglePublish(tournament)}
                        disabled={actionKey === `publish-${tournament.id}`}
                      >
                        {tournament.isPublished ? 'Снять' : 'Опубликовать'}
                      </button>

                      <button
                        type="button"
                        className="admin-tournaments__small-btn admin-tournaments__small-btn--danger"
                        onClick={() => handleDeleteTournament(tournament)}
                        disabled={actionKey === `delete-tournament-${tournament.id}`}
                      >
                        Удалить
                      </button>
                    </div>
                  </article>
                ))
              ) : (
                <p className="admin-tournaments__empty">
                  Турниров пока нет.
                </p>
              )}
            </div>
          </aside>

          <section className="admin-tournaments__main">
            <form className="admin-tournaments__form" onSubmit={handleSaveTournament}>
              <div className="admin-tournaments__form-head">
                <div>
                  <h2>{isEditingTournament ? 'Редактирование турнира' : 'Новый турнир'}</h2>
                  <p>Заполните основные данные турнира. Карты и призы добавляются ниже после выбора турнира.</p>
                </div>

                {isEditingTournament && (
                  <button
                    type="button"
                    className="admin-tournaments__small-btn"
                    onClick={resetTournamentForm}
                  >
                    Отмена
                  </button>
                )}
              </div>

              <label className="admin-tournaments__field">
                <span>Название</span>
                <input
                  type="text"
                  value={tournamentForm.name}
                  onChange={(event) => updateTournamentField('name', event.target.value)}
                  maxLength={200}
                  placeholder="Кубок Весны 2025"
                />
              </label>

              <label className="admin-tournaments__field">
                <span>Описание</span>
                <textarea
                  value={tournamentForm.description}
                  onChange={(event) => updateTournamentField('description', event.target.value)}
                  rows={4}
                  maxLength={1000}
                  placeholder="Описание турнира"
                />
              </label>

              <div className="admin-tournaments__row admin-tournaments__row--4">
                <label className="admin-tournaments__field">
                  <span>Тип</span>
                  <select
                    value={tournamentForm.type}
                    onChange={(event) => updateTournamentField('type', event.target.value)}
                  >
                    {TOURNAMENT_TYPES.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="admin-tournaments__field">
                  <span>Статус</span>
                  <select
                    value={tournamentForm.status}
                    onChange={(event) => updateTournamentField('status', event.target.value)}
                  >
                    {TOURNAMENT_STATUSES.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="admin-tournaments__field">
                  <span>Уровень</span>
                  <input
                    type="number"
                    min="1"
                    max="11"
                    value={tournamentForm.tier}
                    onChange={(event) => updateTournamentField('tier', event.target.value)}
                  />
                </label>

                <label className="admin-tournaments__field">
                  <span>Формат</span>
                  <input
                    type="text"
                    value={tournamentForm.format}
                    onChange={(event) => updateTournamentField('format', event.target.value)}
                    maxLength={20}
                    placeholder="7x7"
                  />
                </label>
              </div>

              <div className="admin-tournaments__row admin-tournaments__row--4">
                <label className="admin-tournaments__field">
                  <span>Размер команды</span>
                  <input
                    type="number"
                    min="1"
                    value={tournamentForm.teamSize}
                    onChange={(event) => updateTournamentField('teamSize', event.target.value)}
                  />
                </label>

                <label className="admin-tournaments__field">
                  <span>Запасные</span>
                  <input
                    type="number"
                    min="0"
                    value={tournamentForm.reserveSize}
                    onChange={(event) => updateTournamentField('reserveSize', event.target.value)}
                  />
                </label>

                <label className="admin-tournaments__field">
                  <span>Макс. участников</span>
                  <input
                    type="number"
                    min="1"
                    value={tournamentForm.maxParticipants}
                    onChange={(event) => updateTournamentField('maxParticipants', event.target.value)}
                    placeholder="Без лимита"
                  />
                </label>

                <label className="admin-tournaments__field">
                  <span>Начальные участники</span>
                  <input
                    type="number"
                    min="0"
                    value={tournamentForm.initialParticipants}
                    onChange={(event) => updateTournamentField('initialParticipants', event.target.value)}
                  />
                </label>
              </div>

              <div className="admin-tournaments__row admin-tournaments__row--4">
                <label className="admin-tournaments__field">
                  <span>Начало турнира</span>
                  <input
                    type="date"
                    value={tournamentForm.dateStart}
                    onChange={(event) => updateTournamentField('dateStart', event.target.value)}
                  />
                </label>

                <label className="admin-tournaments__field">
                  <span>Конец турнира</span>
                  <input
                    type="date"
                    value={tournamentForm.dateEnd}
                    onChange={(event) => updateTournamentField('dateEnd', event.target.value)}
                  />
                </label>

                <label className="admin-tournaments__field">
                  <span>Начало регистрации</span>
                  <input
                    type="date"
                    value={tournamentForm.regStart}
                    onChange={(event) => updateTournamentField('regStart', event.target.value)}
                  />
                </label>

                <label className="admin-tournaments__field">
                  <span>Конец регистрации</span>
                  <input
                    type="date"
                    value={tournamentForm.regEnd}
                    onChange={(event) => updateTournamentField('regEnd', event.target.value)}
                  />
                </label>
              </div>

              <div className="admin-tournaments__row">
                <label className="admin-tournaments__field">
                  <span>Классы</span>
                  <input
                    type="text"
                    value={tournamentForm.classes}
                    onChange={(event) => updateTournamentField('classes', event.target.value)}
                    maxLength={100}
                    placeholder="BO3,PE,RE"
                  />
                </label>

                <label className="admin-tournaments__field">
                  <span>Спонсор</span>
                  <input
                    type="text"
                    value={tournamentForm.sponsor}
                    onChange={(event) => updateTournamentField('sponsor', event.target.value)}
                    maxLength={100}
                    placeholder="Lesta Games"
                  />
                </label>
              </div>

              <div className="admin-tournaments__row">
                <label className="admin-tournaments__field">
                  <span>Stream URL</span>
                  <input
                    type="text"
                    value={tournamentForm.streamUrl}
                    onChange={(event) => updateTournamentField('streamUrl', event.target.value)}
                    maxLength={500}
                    placeholder="https://..."
                  />
                </label>

                <label className="admin-tournaments__field">
                  <span>ID события</span>
                  <input
                    type="number"
                    value={tournamentForm.eventId}
                    onChange={(event) => updateTournamentField('eventId', event.target.value)}
                    placeholder="Например: 103"
                  />
                </label>
              </div>

              <label className="admin-tournaments__field">
                <span>Текст призов</span>
                <textarea
                  value={tournamentForm.prizeText}
                  onChange={(event) => updateTournamentField('prizeText', event.target.value)}
                  rows={3}
                  placeholder="Дополнительное описание призов"
                />
              </label>

              <div className="admin-tournaments__checks">
                <label>
                  <input
                    type="checkbox"
                    checked={tournamentForm.isStream}
                    onChange={(event) => updateTournamentField('isStream', event.target.checked)}
                  />
                  <span>Есть трансляция</span>
                </label>

                <label>
                  <input
                    type="checkbox"
                    checked={tournamentForm.openForAll}
                    onChange={(event) => updateTournamentField('openForAll', event.target.checked)}
                  />
                  <span>Открыт для всех</span>
                </label>

                <label>
                  <input
                    type="checkbox"
                    checked={tournamentForm.isPublished}
                    onChange={(event) => updateTournamentField('isPublished', event.target.checked)}
                  />
                  <span>Опубликован</span>
                </label>
              </div>

              <button
                type="submit"
                className="admin-tournaments__submit"
                disabled={savingTournament}
              >
                {savingTournament
                  ? 'Сохраняем...'
                  : isEditingTournament
                    ? 'Сохранить турнир'
                    : 'Создать турнир'}
              </button>
            </form>

            <TournamentDetails
              tournament={selectedTournament}
              loading={detailsLoading}
              mapForm={mapForm}
              prizeForm={prizeForm}
              editingMapId={editingMapId}
              editingPrizeId={editingPrizeId}
              savingMap={savingMap}
              savingPrize={savingPrize}
              actionKey={actionKey}
              onUpdateMapField={updateMapField}
              onUpdatePrizeField={updatePrizeField}
              onSaveMap={handleSaveMap}
              onSavePrize={handleSavePrize}
              onEditMap={startEditMap}
              onEditPrize={startEditPrize}
              onDeleteMap={handleDeleteMap}
              onDeletePrize={handleDeletePrize}
              onConfirmRegistration={handleConfirmRegistration}
              onRejectRegistration={handleRejectRegistration}
              onDeleteRegistration={handleDeleteRegistration}
              onCancelMap={resetMapForm}
              onCancelPrize={resetPrizeForm}
            />
          </section>
        </section>
      </div>
    </main>
  );
}

function TournamentDetails({
  tournament,
  loading,
  mapForm,
  prizeForm,
  editingMapId,
  editingPrizeId,
  savingMap,
  savingPrize,
  actionKey,
  onUpdateMapField,
  onUpdatePrizeField,
  onSaveMap,
  onSavePrize,
  onEditMap,
  onEditPrize,
  onDeleteMap,
  onDeletePrize,
  onConfirmRegistration,
  onRejectRegistration,
  onDeleteRegistration,
  onCancelMap,
  onCancelPrize,
}) {
  if (loading) {
    return (
      <section className="admin-tournaments__details">
        <p className="admin-tournaments__empty">Загружаем турнир...</p>
      </section>
    );
  }

  if (!tournament) {
    return (
      <section className="admin-tournaments__details">
        <div className="admin-tournaments__placeholder">
          <h2>Турнир не выбран</h2>
          <p>Выберите турнир из списка слева, чтобы управлять картами, призами и заявками команд.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="admin-tournaments__details">
      <div className="admin-tournaments__details-head">
        <div>
          <span>ID: {tournament.id}</span>
          <h2>{tournament.name}</h2>
          <p>
            {getStatusLabel(tournament.status)} · {tournament.format} · {tournament.currentParticipants}/{tournament.maxParticipants ?? '∞'}
          </p>
        </div>

        <Link
          to={`/tournaments/custom/details/${tournament.id}`}
          className="admin-tournaments__small-btn"
        >
          Открыть на сайте
        </Link>
      </div>

      <div className="admin-tournaments__cards">
        <section className="admin-tournaments__card">
          <div className="admin-tournaments__card-head">
            <h3>Карты</h3>
            <span>{tournament.maps?.length ?? 0}</span>
          </div>

          <form className="admin-tournaments__mini-form" onSubmit={onSaveMap}>
            <label className="admin-tournaments__field">
              <span>Название карты</span>
              <input
                type="text"
                value={mapForm.name}
                onChange={(event) => onUpdateMapField('name', event.target.value)}
                placeholder="Прохоровка"
              />
            </label>

            <label className="admin-tournaments__field">
              <span>Изображение</span>
              <input
                type="text"
                value={mapForm.image}
                onChange={(event) => onUpdateMapField('image', event.target.value)}
                placeholder="/images/maps/prokhorovka.webp"
              />
            </label>

            <div className="admin-tournaments__mini-actions">
              <button
                type="submit"
                className="admin-tournaments__submit"
                disabled={savingMap}
              >
                {editingMapId ? 'Сохранить карту' : 'Добавить карту'}
              </button>

              {editingMapId && (
                <button
                  type="button"
                  className="admin-tournaments__small-btn"
                  onClick={onCancelMap}
                >
                  Отмена
                </button>
              )}
            </div>
          </form>

          <div className="admin-tournaments__sub-list">
            {tournament.maps?.length > 0 ? (
              tournament.maps.map((map) => (
                <article key={map.id} className="admin-tournaments__sub-item">
                  <div>
                    <strong>{map.name}</strong>
                    <span>{map.image}</span>
                  </div>

                  <div className="admin-tournaments__sub-actions">
                    <button
                      type="button"
                      className="admin-tournaments__small-btn"
                      onClick={() => onEditMap(map)}
                    >
                      Изменить
                    </button>

                    <button
                      type="button"
                      className="admin-tournaments__small-btn admin-tournaments__small-btn--danger"
                      onClick={() => onDeleteMap(map)}
                      disabled={actionKey === `delete-map-${map.id}`}
                    >
                      Удалить
                    </button>
                  </div>
                </article>
              ))
            ) : (
              <p className="admin-tournaments__empty">Карт пока нет.</p>
            )}
          </div>
        </section>

        <section className="admin-tournaments__card">
          <div className="admin-tournaments__card-head">
            <h3>Призы</h3>
            <span>{tournament.prizes?.length ?? 0}</span>
          </div>

          <form className="admin-tournaments__mini-form" onSubmit={onSavePrize}>
            <div className="admin-tournaments__row">
              <label className="admin-tournaments__field">
                <span>Место</span>
                <select
                  value={prizeForm.place}
                  onChange={(event) => onUpdatePrizeField('place', event.target.value)}
                >
                  {PRIZE_PLACES.map((place) => (
                    <option key={place.value} value={place.value}>
                      {place.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="admin-tournaments__field">
                <span>Тип</span>
                <select
                  value={prizeForm.type}
                  onChange={(event) => onUpdatePrizeField('type', event.target.value)}
                >
                  {PRIZE_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <label className="admin-tournaments__field">
              <span>Количество</span>
              <input
                type="number"
                min="0"
                value={prizeForm.amount}
                onChange={(event) => onUpdatePrizeField('amount', event.target.value)}
              />
            </label>

            <label className="admin-tournaments__field">
              <span>Текст</span>
              <input
                type="text"
                value={prizeForm.text}
                onChange={(event) => onUpdatePrizeField('text', event.target.value)}
                placeholder="Необязательное описание"
              />
            </label>

            <div className="admin-tournaments__mini-actions">
              <button
                type="submit"
                className="admin-tournaments__submit"
                disabled={savingPrize}
              >
                {editingPrizeId ? 'Сохранить приз' : 'Добавить приз'}
              </button>

              {editingPrizeId && (
                <button
                  type="button"
                  className="admin-tournaments__small-btn"
                  onClick={onCancelPrize}
                >
                  Отмена
                </button>
              )}
            </div>
          </form>

          <div className="admin-tournaments__sub-list">
            {tournament.prizes?.length > 0 ? (
              tournament.prizes.map((prize) => (
                <article key={prize.id} className="admin-tournaments__sub-item">
                  <div>
                    <strong>{prize.placeLabel}</strong>
                    <span>
                      {prize.amount} · {prize.type}
                      {prize.text ? ` · ${prize.text}` : ''}
                    </span>
                  </div>

                  <div className="admin-tournaments__sub-actions">
                    <button
                      type="button"
                      className="admin-tournaments__small-btn"
                      onClick={() => onEditPrize(prize)}
                    >
                      Изменить
                    </button>

                    <button
                      type="button"
                      className="admin-tournaments__small-btn admin-tournaments__small-btn--danger"
                      onClick={() => onDeletePrize(prize)}
                      disabled={actionKey === `delete-prize-${prize.id}`}
                    >
                      Удалить
                    </button>
                  </div>
                </article>
              ))
            ) : (
              <p className="admin-tournaments__empty">Призов пока нет.</p>
            )}
          </div>
        </section>
      </div>

      <section className="admin-tournaments__registrations">
        <div className="admin-tournaments__card-head">
          <h3>Заявки команд</h3>
          <span>{tournament.registrations?.length ?? 0}</span>
        </div>

        {tournament.registrations?.length > 0 ? (
          <div className="admin-tournaments__registrations-list">
            {tournament.registrations.map((registration) => (
              <RegistrationCard
                key={registration.id}
                registration={registration}
                actionKey={actionKey}
                onConfirm={onConfirmRegistration}
                onReject={onRejectRegistration}
                onDelete={onDeleteRegistration}
              />
            ))}
          </div>
        ) : (
          <p className="admin-tournaments__empty">
            Заявок команд пока нет.
          </p>
        )}
      </section>
    </section>
  );
}

function RegistrationCard({
  registration,
  actionKey,
  onConfirm,
  onReject,
  onDelete,
}) {
  const normalizedStatus = normalizeRegistrationStatus(registration.status);
  const statusConfig = getRegistrationStatusConfig(registration.status);

  const players = Array.isArray(registration.players)
    ? [...registration.players].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
    : [];

  const canReview = normalizedStatus === 'sent';
  const canDelete = normalizedStatus === 'sent';

  return (
    <article className="admin-tournaments__registration">
      <div className="admin-tournaments__registration-main">
        <div className="admin-tournaments__registration-head">
          <div>
            <strong>{registration.teamName}</strong>

            <span>
              Капитан: {registration.captainNickname || 'Не указан'}
              {registration.captainEmail ? ` · ${registration.captainEmail}` : ''}
            </span>
          </div>

          <span className={`admin-tournaments__reg-status ${statusConfig.className}`}>
            {registration.statusLabel || statusConfig.label}
          </span>
        </div>

        <div className="admin-tournaments__registration-info">
          <span>Дата регистрации: {registration.registeredAt}</span>

          {registration.contact && (
            <span>Контакт: {registration.contact}</span>
          )}

          {registration.reviewedAt && (
            <span>Рассмотрена: {registration.reviewedAt}</span>
          )}
        </div>

        {players.length > 0 && (
          <div className="admin-tournaments__registration-players">
            {players.map((player) => (
              <span key={player.id}>
                {player.roleLabel}: {player.nickname}
              </span>
            ))}
          </div>
        )}

        {registration.comment && (
          <p className="admin-tournaments__registration-comment">
            {registration.comment}
          </p>
        )}

        {registration.reviewComment && (
          <p className="admin-tournaments__registration-review">
            Причина / комментарий: {registration.reviewComment}
          </p>
        )}

        {normalizedStatus === 'confirmed' && (
          <p className="admin-tournaments__note">
            Подтверждённую заявку удалить нельзя.
          </p>
        )}

        {normalizedStatus === 'rejected' && (
          <p className="admin-tournaments__note">
            Заявка отклонена. Повторная регистрация пользователю недоступна.
          </p>
        )}
      </div>

      <div className="admin-tournaments__registration-actions">
        {canReview && (
          <>
            <button
              type="button"
              className="admin-tournaments__small-btn"
              onClick={() => onConfirm(registration)}
              disabled={actionKey === `confirm-registration-${registration.id}`}
            >
              Принять
            </button>

            <button
              type="button"
              className="admin-tournaments__small-btn"
              onClick={() => onReject(registration)}
              disabled={actionKey === `reject-registration-${registration.id}`}
            >
              Отклонить
            </button>
          </>
        )}

        {canDelete && (
          <button
            type="button"
            className="admin-tournaments__small-btn admin-tournaments__small-btn--danger"
            onClick={() => onDelete(registration)}
            disabled={actionKey === `delete-registration-${registration.id}`}
          >
            Удалить заявку
          </button>
        )}
      </div>
    </article>
  );
}

export default AdminTournaments;