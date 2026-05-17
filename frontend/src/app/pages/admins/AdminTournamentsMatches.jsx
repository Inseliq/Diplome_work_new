import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  getAdminMatchTournaments,
  getAdminMatchRegistrations,
  getAdminTournamentMatches,
  createAdminTournamentMatch,
  updateAdminTournamentMatch,
  updateAdminTournamentMatchResult,
  deleteAdminTournamentMatch,
} from '../../../api/endpoints';
import { logger } from '../../utils/logger';

const BRACKETS = [
  { value: 'upper', label: 'Верхняя сетка' },
  { value: 'lower', label: 'Нижняя сетка' },
  { value: 'final', label: 'Финал' },
  { value: 'grandFinal', label: 'Гранд-финал' },
];

const STATUSES = [
  { value: 'scheduled', label: 'Запланирован' },
  { value: 'live', label: 'Идёт' },
  { value: 'finished', label: 'Завершён' },
  { value: 'cancelled', label: 'Отменён' },
];

const RESULT_STATUSES = [
  { value: 'pending', label: 'Без результата' },
  { value: 'team1_win', label: 'Победа команды 1' },
  { value: 'team2_win', label: 'Победа команды 2' },
  { value: 'draw', label: 'Ничья' },
  { value: 'tech_team1', label: 'Тех. победа команды 1' },
  { value: 'tech_team2', label: 'Тех. победа команды 2' },
];

const ROUND_SIZES = [128, 64, 32, 16, 8, 4, 2];

const EMPTY_SLOT = {
  registrationId: '',
  sourceMatchId: '',
  sourceResult: '',
  seedNumber: '',
  isBye: false,
};

const EMPTY_MATCH_FORM = {
  bracket: 'upper',
  roundSize: 2,
  roundNumber: 1,
  matchNumber: 1,
  status: 'scheduled',
  scheduledAtUtc: '',
  streamUrl: '',
  comment: '',
  winnerToMatchId: '',
  winnerToSlotNumber: '',
  loserToMatchId: '',
  loserToSlotNumber: '',
  slot1: { ...EMPTY_SLOT },
  slot2: { ...EMPTY_SLOT },
};

function getBracketLabel(value) {
  return BRACKETS.find((item) => item.value === value)?.label || value;
}

function getStatusLabel(value) {
  return STATUSES.find((item) => item.value === value)?.label || value;
}

function getResultLabel(value) {
  return RESULT_STATUSES.find((item) => item.value === value)?.label || value;
}

function toDateTimeLocal(value) {
  if (!value) return '';

  const date = new Date(value);
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60_000);

  return local.toISOString().slice(0, 16);
}

function toIsoOrNull(value) {
  if (!value) return null;

  return new Date(value).toISOString();
}

function normalizeNumberOrNull(value) {
  if (value === '' || value == null) return null;

  return Number(value);
}

function groupMatches(matches) {
  const grouped = {};

  matches.forEach((match) => {
    if (!grouped[match.bracket]) {
      grouped[match.bracket] = {};
    }

    const roundKey = `${match.roundSize}-${match.roundNumber}`;

    if (!grouped[match.bracket][roundKey]) {
      grouped[match.bracket][roundKey] = {
        roundTitle: match.roundTitle,
        roundSize: match.roundSize,
        roundNumber: match.roundNumber,
        matches: [],
      };
    }

    grouped[match.bracket][roundKey].matches.push(match);
  });

  return grouped;
}

function AdminTournamentsMatches() {
  const [tournaments, setTournaments] = useState([]);
  const [selectedTournament, setSelectedTournament] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [matches, setMatches] = useState([]);
  const [matchForm, setMatchForm] = useState(EMPTY_MATCH_FORM);
  const [editingMatchId, setEditingMatchId] = useState(null);

  const [search, setSearch] = useState('');
  const [bracketFilter, setBracketFilter] = useState('all');

  const [loadingTournaments, setLoadingTournaments] = useState(true);
  const [loadingMatches, setLoadingMatches] = useState(false);
  const [savingMatch, setSavingMatch] = useState(false);
  const [actionKey, setActionKey] = useState(null);

  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const isEditing = editingMatchId != null;

  const filteredMatches = useMemo(() => {
    if (bracketFilter === 'all') return matches;

    return matches.filter((match) => match.bracket === bracketFilter);
  }, [matches, bracketFilter]);

  const groupedMatches = useMemo(
    () => groupMatches(filteredMatches),
    [filteredMatches]
  );

  const loadTournaments = async (searchValue = search) => {
    setLoadingTournaments(true);
    setError(null);

    try {
      const data = await getAdminMatchTournaments(searchValue);
      setTournaments(Array.isArray(data) ? data : []);
    } catch (err) {
      logger.warn('AdminTournamentMatches: не удалось загрузить турниры', err);
      setTournaments([]);
      setError(err);
    } finally {
      setLoadingTournaments(false);
    }
  };

  const loadTournamentData = async (tournament) => {
    setSelectedTournament(tournament);
    setLoadingMatches(true);
    setError(null);
    setMessage(null);
    resetMatchForm();

    try {
      const [registrationData, matchData] = await Promise.all([
        getAdminMatchRegistrations(tournament.id),
        getAdminTournamentMatches(tournament.id),
      ]);

      setRegistrations(Array.isArray(registrationData) ? registrationData : []);
      setMatches(Array.isArray(matchData) ? matchData : []);
    } catch (err) {
      logger.warn('AdminTournamentMatches: не удалось загрузить данные турнира', err);
      setRegistrations([]);
      setMatches([]);
      setError(err);
    } finally {
      setLoadingMatches(false);
    }
  };

  const reloadMatches = async () => {
    if (!selectedTournament) return;

    setLoadingMatches(true);
    setError(null);

    try {
      const data = await getAdminTournamentMatches(selectedTournament.id);
      setMatches(Array.isArray(data) ? data : []);
      await loadTournaments(search);
    } catch (err) {
      logger.warn('AdminTournamentMatches: не удалось обновить матчи', err);
      setError(err);
    } finally {
      setLoadingMatches(false);
    }
  };

  useEffect(() => {
    loadTournaments('');
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadTournaments(search);
    }, 350);

    return () => clearTimeout(timer);
  }, [search]);

  const updateMatchField = (field, value) => {
    setMatchForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const updateSlotField = (slotKey, field, value) => {
    setMatchForm((previous) => ({
      ...previous,
      [slotKey]: {
        ...previous[slotKey],
        [field]: value,
      },
    }));
  };

  const resetMatchForm = () => {
    setMatchForm(EMPTY_MATCH_FORM);
    setEditingMatchId(null);
  };

  const startEditMatch = (match) => {
    const slot1 = match.slots?.find((slot) => slot.slotNumber === 1) ?? {};
    const slot2 = match.slots?.find((slot) => slot.slotNumber === 2) ?? {};

    setEditingMatchId(match.id);

    setMatchForm({
      bracket: match.bracket ?? 'upper',
      roundSize: match.roundSize ?? 2,
      roundNumber: match.roundNumber ?? 1,
      matchNumber: match.matchNumber ?? 1,
      status: match.status ?? 'scheduled',
      scheduledAtUtc: toDateTimeLocal(match.scheduledAtISO),
      streamUrl: match.streamUrl ?? '',
      comment: match.comment ?? '',
      winnerToMatchId: match.winnerToMatchId ?? '',
      winnerToSlotNumber: match.winnerToSlotNumber ?? '',
      loserToMatchId: match.loserToMatchId ?? '',
      loserToSlotNumber: match.loserToSlotNumber ?? '',
      slot1: {
        registrationId: slot1.registrationId ?? '',
        sourceMatchId: slot1.sourceMatchId ?? '',
        sourceResult: slot1.sourceResult ?? '',
        seedNumber: slot1.seedNumber ?? '',
        isBye: Boolean(slot1.isBye),
      },
      slot2: {
        registrationId: slot2.registrationId ?? '',
        sourceMatchId: slot2.sourceMatchId ?? '',
        sourceResult: slot2.sourceResult ?? '',
        seedNumber: slot2.seedNumber ?? '',
        isBye: Boolean(slot2.isBye),
      },
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const buildSlotPayload = (slot) => ({
    registrationId: normalizeNumberOrNull(slot.registrationId),
    sourceMatchId: normalizeNumberOrNull(slot.sourceMatchId),
    sourceResult: slot.sourceResult || null,
    seedNumber: normalizeNumberOrNull(slot.seedNumber),
    isBye: Boolean(slot.isBye),
  });

  const buildMatchPayload = () => ({
    bracket: matchForm.bracket,
    roundSize: Number(matchForm.roundSize),
    roundNumber: Number(matchForm.roundNumber),
    matchNumber: Number(matchForm.matchNumber),
    status: matchForm.status,
    scheduledAtUtc: toIsoOrNull(matchForm.scheduledAtUtc),
    streamUrl: matchForm.streamUrl.trim() || null,
    comment: matchForm.comment.trim() || null,
    winnerToMatchId: normalizeNumberOrNull(matchForm.winnerToMatchId),
    winnerToSlotNumber: normalizeNumberOrNull(matchForm.winnerToSlotNumber),
    loserToMatchId: normalizeNumberOrNull(matchForm.loserToMatchId),
    loserToSlotNumber: normalizeNumberOrNull(matchForm.loserToSlotNumber),
    slot1: buildSlotPayload(matchForm.slot1),
    slot2: buildSlotPayload(matchForm.slot2),
  });

  const handleSaveMatch = async (event) => {
    event.preventDefault();

    if (!selectedTournament) return;

    setMessage(null);
    setError(null);

    setSavingMatch(true);

    try {
      const payload = buildMatchPayload();

      const result = isEditing
        ? await updateAdminTournamentMatch(selectedTournament.id, editingMatchId, payload)
        : await createAdminTournamentMatch(selectedTournament.id, payload);

      setMessage(result?.message || 'Матч сохранён');
      setMatches(Array.isArray(result?.matches) ? result.matches : []);

      resetMatchForm();
      await loadTournaments(search);
    } catch (err) {
      logger.warn('AdminTournamentMatches: не удалось сохранить матч', err);
      setError(err);
    } finally {
      setSavingMatch(false);
    }
  };

  const handleDeleteMatch = async (match) => {
    if (!selectedTournament) return;

    const confirmed = window.confirm(`Удалить матч #${match.matchNumber} (${match.roundTitle})?`);

    if (!confirmed) return;

    setActionKey(`delete-${match.id}`);
    setMessage(null);
    setError(null);

    try {
      const result = await deleteAdminTournamentMatch(selectedTournament.id, match.id);

      setMessage(result?.message || 'Матч удалён');
      setMatches(Array.isArray(result?.matches) ? result.matches : []);

      if (editingMatchId === match.id) {
        resetMatchForm();
      }

      await loadTournaments(search);
    } catch (err) {
      logger.warn('AdminTournamentMatches: не удалось удалить матч', err);
      setError(err);
    } finally {
      setActionKey(null);
    }
  };

  const handleUpdateResult = async (match, payload) => {
    if (!selectedTournament) return;

    setActionKey(`result-${match.id}`);
    setMessage(null);
    setError(null);

    try {
      const result = await updateAdminTournamentMatchResult(
        selectedTournament.id,
        match.id,
        payload
      );

      setMessage(result?.message || 'Результат обновлён');
      setMatches(Array.isArray(result?.matches) ? result.matches : []);
    } catch (err) {
      logger.warn('AdminTournamentMatches: не удалось обновить результат', err);
      setError(err);
    } finally {
      setActionKey(null);
    }
  };

  return (
    <main className="wrapper admin-matches">
      <div className="admin-matches__container">
        <header className="admin-matches__header">
          <div>
            <div className="admin-matches__label">Админ-панель</div>
            <h1 className="admin-matches__title">Матчи турниров</h1>
            <p className="admin-matches__subtitle">
              Создание матчей, настройка верхней и нижней сетки, выбор победителей,
              результат матча и автоматическая передача команды в следующий матч.
            </p>
          </div>

          <Link to="/admin" className="admin-matches__back">
            Назад в админку
          </Link>
        </header>

        {message && (
          <div className="admin-matches__message admin-matches__message--success">
            {message}
          </div>
        )}

        {error && (
          <div className="admin-matches__message admin-matches__message--error">
            {error?.data?.message || error?.message || 'Произошла ошибка'}
          </div>
        )}

        <section className="admin-matches__layout">
          <aside className="admin-matches__sidebar">
            <div className="admin-matches__section-head">
              <div>
                <h2>Турниры</h2>
                <p>Выберите турнир, чтобы открыть сетку матчей.</p>
              </div>
              <span>{tournaments.length}</span>
            </div>

            <label className="admin-matches__field">
              <span>Поиск</span>
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Название, формат, статус"
              />
            </label>

            <div className="admin-matches__tournament-list">
              {loadingTournaments ? (
                <p className="admin-matches__empty">Загружаем турниры...</p>
              ) : tournaments.length > 0 ? (
                tournaments.map((tournament) => (
                  <button
                    key={tournament.id}
                    type="button"
                    className={`admin-matches__tournament-card${selectedTournament?.id === tournament.id ? ' admin-matches__tournament-card--active' : ''}`}
                    onClick={() => loadTournamentData(tournament)}
                  >
                    <strong>{tournament.name}</strong>

                    <div className="admin-matches__tournament-meta">
                      <span>{tournament.format}</span>
                      <span>{getStatusLabel(tournament.status)}</span>
                      <span>{tournament.matchesCount} матчей</span>
                      <span>{tournament.registrationsCount} команд</span>
                    </div>

                    {tournament.hasMatches ? (
                      <b>Сетка создана</b>
                    ) : (
                      <em>Матчей пока нет</em>
                    )}
                  </button>
                ))
              ) : (
                <p className="admin-matches__empty">Турниры не найдены.</p>
              )}
            </div>
          </aside>

          <section className="admin-matches__content">
            {!selectedTournament ? (
              <div className="admin-matches__placeholder">
                <h2>Турнир не выбран</h2>
                <p>Выберите турнир слева, чтобы управлять матчами и сеткой.</p>
              </div>
            ) : (
              <>
                <div className="admin-matches__selected">
                  <div>
                    <span>Выбранный турнир</span>
                    <h2>{selectedTournament.name}</h2>
                    <p>
                      Формат: {selectedTournament.format} · Команд: {registrations.length} · Матчей: {matches.length}
                    </p>
                  </div>

                  <button
                    type="button"
                    className="admin-matches__small-btn"
                    onClick={reloadMatches}
                    disabled={loadingMatches}
                  >
                    Обновить
                  </button>
                </div>

                <form className="admin-matches__form" onSubmit={handleSaveMatch}>
                  <div className="admin-matches__form-head">
                    <div>
                      <h2>{isEditing ? 'Редактирование матча' : 'Новый матч'}</h2>
                      <p>
                        Укажите позицию матча в сетке, команды или источник из другого матча.
                      </p>
                    </div>

                    {isEditing && (
                      <button
                        type="button"
                        className="admin-matches__small-btn"
                        onClick={resetMatchForm}
                      >
                        Отмена
                      </button>
                    )}
                  </div>

                  <div className="admin-matches__row admin-matches__row--4">
                    <label className="admin-matches__field">
                      <span>Сетка</span>
                      <select
                        value={matchForm.bracket}
                        onChange={(event) => updateMatchField('bracket', event.target.value)}
                      >
                        {BRACKETS.map((item) => (
                          <option key={item.value} value={item.value}>
                            {item.label}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="admin-matches__field">
                      <span>Раунд</span>
                      <select
                        value={matchForm.roundSize}
                        onChange={(event) => updateMatchField('roundSize', event.target.value)}
                      >
                        {ROUND_SIZES.map((size) => (
                          <option key={size} value={size}>
                            {size === 2 ? 'Финал' : `1/${size / 2}`}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="admin-matches__field">
                      <span>Номер раунда</span>
                      <input
                        type="number"
                        min="1"
                        value={matchForm.roundNumber}
                        onChange={(event) => updateMatchField('roundNumber', event.target.value)}
                      />
                    </label>

                    <label className="admin-matches__field">
                      <span>Номер матча</span>
                      <input
                        type="number"
                        min="1"
                        value={matchForm.matchNumber}
                        onChange={(event) => updateMatchField('matchNumber', event.target.value)}
                      />
                    </label>
                  </div>

                  <div className="admin-matches__row">
                    <label className="admin-matches__field">
                      <span>Статус</span>
                      <select
                        value={matchForm.status}
                        onChange={(event) => updateMatchField('status', event.target.value)}
                      >
                        {STATUSES.map((item) => (
                          <option key={item.value} value={item.value}>
                            {item.label}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="admin-matches__field">
                      <span>Дата и время</span>
                      <input
                        type="datetime-local"
                        value={matchForm.scheduledAtUtc}
                        onChange={(event) => updateMatchField('scheduledAtUtc', event.target.value)}
                      />
                    </label>
                  </div>

                  <div className="admin-matches__slots">
                    <MatchSlotForm
                      title="Команда 1"
                      slot={matchForm.slot1}
                      slotKey="slot1"
                      registrations={registrations}
                      matches={matches}
                      onChange={updateSlotField}
                    />

                    <MatchSlotForm
                      title="Команда 2"
                      slot={matchForm.slot2}
                      slotKey="slot2"
                      registrations={registrations}
                      matches={matches}
                      onChange={updateSlotField}
                    />
                  </div>

                  <div className="admin-matches__row admin-matches__row--4">
                    <label className="admin-matches__field">
                      <span>Победитель в матч ID</span>
                      <input
                        type="number"
                        value={matchForm.winnerToMatchId}
                        onChange={(event) => updateMatchField('winnerToMatchId', event.target.value)}
                        placeholder="ID матча"
                      />
                    </label>

                    <label className="admin-matches__field">
                      <span>Победитель в слот</span>
                      <select
                        value={matchForm.winnerToSlotNumber}
                        onChange={(event) => updateMatchField('winnerToSlotNumber', event.target.value)}
                      >
                        <option value="">Не задано</option>
                        <option value="1">Слот 1</option>
                        <option value="2">Слот 2</option>
                      </select>
                    </label>

                    <label className="admin-matches__field">
                      <span>Проигравший в матч ID</span>
                      <input
                        type="number"
                        value={matchForm.loserToMatchId}
                        onChange={(event) => updateMatchField('loserToMatchId', event.target.value)}
                        placeholder="ID матча"
                      />
                    </label>

                    <label className="admin-matches__field">
                      <span>Проигравший в слот</span>
                      <select
                        value={matchForm.loserToSlotNumber}
                        onChange={(event) => updateMatchField('loserToSlotNumber', event.target.value)}
                      >
                        <option value="">Не задано</option>
                        <option value="1">Слот 1</option>
                        <option value="2">Слот 2</option>
                      </select>
                    </label>
                  </div>

                  <label className="admin-matches__field">
                    <span>Ссылка на трансляцию</span>
                    <input
                      type="text"
                      value={matchForm.streamUrl}
                      onChange={(event) => updateMatchField('streamUrl', event.target.value)}
                      placeholder="https://..."
                    />
                  </label>

                  <label className="admin-matches__field">
                    <span>Комментарий</span>
                    <textarea
                      value={matchForm.comment}
                      onChange={(event) => updateMatchField('comment', event.target.value)}
                      rows={3}
                      placeholder="Комментарий администратора"
                    />
                  </label>

                  <button
                    type="submit"
                    className="admin-matches__submit"
                    disabled={savingMatch}
                  >
                    {savingMatch
                      ? 'Сохраняем...'
                      : isEditing
                        ? 'Сохранить матч'
                        : 'Создать матч'}
                  </button>
                </form>

                <section className="admin-matches__bracket">
                  <div className="admin-matches__section-head">
                    <div>
                      <h2>Сетка матчей</h2>
                      <p>Матчи сгруппированы по сетке и раундам.</p>
                    </div>

                    <select
                      className="admin-matches__filter-select"
                      value={bracketFilter}
                      onChange={(event) => setBracketFilter(event.target.value)}
                    >
                      <option value="all">Все сетки</option>
                      {BRACKETS.map((item) => (
                        <option key={item.value} value={item.value}>
                          {item.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {loadingMatches ? (
                    <p className="admin-matches__empty">Загружаем матчи...</p>
                  ) : filteredMatches.length > 0 ? (
                    Object.entries(groupedMatches).map(([bracket, rounds]) => (
                      <div key={bracket} className="admin-matches__bracket-group">
                        <h3>{getBracketLabel(bracket)}</h3>

                        {Object.values(rounds).map((round) => (
                          <div key={`${bracket}-${round.roundSize}-${round.roundNumber}`} className="admin-matches__round">
                            <h4>
                              {round.roundTitle} · раунд {round.roundNumber}
                            </h4>

                            <div className="admin-matches__match-grid">
                              {round.matches.map((match) => (
                                <MatchCard
                                  key={match.id}
                                  match={match}
                                  registrations={registrations}
                                  actionKey={actionKey}
                                  onEdit={startEditMatch}
                                  onDelete={handleDeleteMatch}
                                  onUpdateResult={handleUpdateResult}
                                />
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    ))
                  ) : (
                    <p className="admin-matches__empty">
                      Матчей пока нет.
                    </p>
                  )}
                </section>
              </>
            )}
          </section>
        </section>
      </div>
    </main>
  );
}

function MatchSlotForm({
  title,
  slot,
  slotKey,
  registrations,
  matches,
  onChange,
}) {
  return (
    <section className="admin-matches__slot-form">
      <h3>{title}</h3>

      <label className="admin-matches__check">
        <input
          type="checkbox"
          checked={slot.isBye}
          onChange={(event) => onChange(slotKey, 'isBye', event.target.checked)}
        />
        <span>BYE / свободный проход</span>
      </label>

      <label className="admin-matches__field">
        <span>Команда</span>
        <select
          value={slot.registrationId}
          onChange={(event) => onChange(slotKey, 'registrationId', event.target.value)}
          disabled={slot.isBye}
        >
          <option value="">Не выбрана</option>
          {registrations.map((registration) => (
            <option key={registration.registrationId} value={registration.registrationId}>
              #{registration.registrationId} · {registration.teamName} · {registration.captainNickname}
            </option>
          ))}
        </select>
      </label>

      <div className="admin-matches__row">
        <label className="admin-matches__field">
          <span>Источник: матч ID</span>
          <select
            value={slot.sourceMatchId}
            onChange={(event) => onChange(slotKey, 'sourceMatchId', event.target.value)}
            disabled={slot.isBye || Boolean(slot.registrationId)}
          >
            <option value="">Нет</option>
            {matches.map((match) => (
              <option key={match.id} value={match.id}>
                #{match.id} · {getBracketLabel(match.bracket)} · {match.roundTitle} · матч {match.matchNumber}
              </option>
            ))}
          </select>
        </label>

        <label className="admin-matches__field">
          <span>Кто приходит</span>
          <select
            value={slot.sourceResult}
            onChange={(event) => onChange(slotKey, 'sourceResult', event.target.value)}
            disabled={slot.isBye || Boolean(slot.registrationId)}
          >
            <option value="">Не задано</option>
            <option value="winner">Победитель</option>
            <option value="loser">Проигравший</option>
          </select>
        </label>
      </div>

      <label className="admin-matches__field">
        <span>Посев</span>
        <input
          type="number"
          value={slot.seedNumber}
          onChange={(event) => onChange(slotKey, 'seedNumber', event.target.value)}
          placeholder="Например: 1"
        />
      </label>
    </section>
  );
}

function MatchCard({
  match,
  registrations,
  actionKey,
  onEdit,
  onDelete,
  onUpdateResult,
}) {
  const [team1Score, setTeam1Score] = useState(match.team1Score ?? 0);
  const [team2Score, setTeam2Score] = useState(match.team2Score ?? 0);
  const [status, setStatus] = useState(match.status ?? 'scheduled');
  const [resultStatus, setResultStatus] = useState(match.resultStatus ?? 'pending');
  const [advancingRegistrationId, setAdvancingRegistrationId] = useState(match.advancingRegistrationId ?? '');

  useEffect(() => {
    setTeam1Score(match.team1Score ?? 0);
    setTeam2Score(match.team2Score ?? 0);
    setStatus(match.status ?? 'scheduled');
    setResultStatus(match.resultStatus ?? 'pending');
    setAdvancingRegistrationId(match.advancingRegistrationId ?? '');
  }, [match]);

  const slot1 = match.slots?.find((slot) => slot.slotNumber === 1);
  const slot2 = match.slots?.find((slot) => slot.slotNumber === 2);

  const saveResult = (nextResultStatus = resultStatus) => {
    onUpdateResult(match, {
      team1Score: Number(team1Score),
      team2Score: Number(team2Score),
      resultStatus: nextResultStatus,
      advancingRegistrationId: nextResultStatus === 'draw'
        ? normalizeNumberOrNull(advancingRegistrationId)
        : null,
      status,
    });
  };

  return (
    <article className="admin-matches__match">
      <div className="admin-matches__match-head">
        <div>
          <strong>Матч #{match.id}</strong>
          <span>
            {match.roundTitle} · матч {match.matchNumber}
          </span>
        </div>

        <b>{getStatusLabel(match.status)}</b>
      </div>

      <div className="admin-matches__teams">
        <MatchTeam slot={slot1} score={team1Score} onScore={setTeam1Score} />
        <MatchTeam slot={slot2} score={team2Score} onScore={setTeam2Score} />
      </div>

      <div className="admin-matches__result-panel">
        <div className="admin-matches__row">
          <label className="admin-matches__field">
            <span>Статус</span>
            <select value={status} onChange={(event) => setStatus(event.target.value)}>
              {STATUSES.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>

          <label className="admin-matches__field">
            <span>Результат</span>
            <select value={resultStatus} onChange={(event) => setResultStatus(event.target.value)}>
              {RESULT_STATUSES.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        {resultStatus === 'draw' && (
          <label className="admin-matches__field">
            <span>Кто проходит при ничьей</span>
            <select
              value={advancingRegistrationId}
              onChange={(event) => setAdvancingRegistrationId(event.target.value)}
            >
              <option value="">Выберите команду</option>
              {[slot1, slot2]
                .filter((slot) => slot?.registrationId)
                .map((slot) => (
                  <option key={slot.registrationId} value={slot.registrationId}>
                    {slot.teamName}
                  </option>
                ))}
            </select>
          </label>
        )}

        <div className="admin-matches__quick-result">
          <button
            type="button"
            onClick={() => {
              setResultStatus('team1_win');
              saveResult('team1_win');
            }}
            disabled={actionKey === `result-${match.id}`}
          >
            Победа 1
          </button>

          <button
            type="button"
            onClick={() => {
              setResultStatus('team2_win');
              saveResult('team2_win');
            }}
            disabled={actionKey === `result-${match.id}`}
          >
            Победа 2
          </button>

          <button
            type="button"
            onClick={() => saveResult(resultStatus)}
            disabled={actionKey === `result-${match.id}`}
          >
            Сохранить
          </button>
        </div>
      </div>

      <div className="admin-matches__match-meta">
        <span>Результат: {getResultLabel(match.resultStatus)}</span>
        {match.scheduledAt && <span>Время: {match.scheduledAt}</span>}
        {match.winnerToMatchId && (
          <span>
            Победитель → матч #{match.winnerToMatchId}, слот {match.winnerToSlotNumber}
          </span>
        )}
        {match.loserToMatchId && (
          <span>
            Проигравший → матч #{match.loserToMatchId}, слот {match.loserToSlotNumber}
          </span>
        )}
      </div>

      <div className="admin-matches__match-actions">
        <button type="button" className="admin-matches__small-btn" onClick={() => onEdit(match)}>
          Изменить
        </button>

        <button
          type="button"
          className="admin-matches__small-btn admin-matches__small-btn--danger"
          onClick={() => onDelete(match)}
          disabled={actionKey === `delete-${match.id}`}
        >
          Удалить
        </button>
      </div>
    </article>
  );
}

function MatchTeam({ slot, score, onScore }) {
  const title = slot?.isBye
    ? 'BYE'
    : slot?.teamName
      ? slot.teamName
      : slot?.sourceMatchId
        ? `Из матча #${slot.sourceMatchId} (${slot.sourceResult})`
        : 'Команда не выбрана';

  return (
    <div className={`admin-matches__team${slot?.isWinner ? ' admin-matches__team--winner' : ''}${slot?.isAdvancing ? ' admin-matches__team--advancing' : ''}`}>
      <div>
        <strong>{title}</strong>
        {slot?.captainNickname && <span>Капитан: {slot.captainNickname}</span>}
        {slot?.seedNumber && <span>Посев: {slot.seedNumber}</span>}
      </div>

      <input
        type="number"
        min="0"
        value={score}
        onChange={(event) => onScore(event.target.value)}
      />
    </div>
  );
}

export default AdminTournamentsMatches;