import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useClanReserves } from '../hooks/useClanReserves';
import { LoadingSpinner } from '../components/ui/StatusComponents';

function formatTimeLeft(endsAtUtc, now) {
  if (!endsAtUtc) return null;

  const end = new Date(endsAtUtc).getTime();
  const diff = Math.max(0, end - now.getTime());

  const totalSeconds = Math.floor(diff / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return [
    String(hours).padStart(2, '0'),
    String(minutes).padStart(2, '0'),
    String(seconds).padStart(2, '0'),
  ].join(':');
}

function ReservesAccessDenied({ reason }) {
  const code = reason?.code;

  let title = 'Клановые резервы недоступны';
  let description = 'У вас нет доступа к странице клановых резервов.';
  let secondButton = null;

  if (code === 'ClanRequired') {
    title = 'Сначала вступите в клан';
    description = 'Клановые резервы доступны только игрокам, которые состоят в клане.';
    secondButton = (
      <Link className="btn btn-ghost" to="/clan">
        К странице клана
      </Link>
    );
  }

  if (code === 'RankRequired') {
    title = 'Не указано звание в клане';
    description = 'Для доступа к резервам у пользователя должно быть назначено звание в клане.';
    secondButton = (
      <Link className="btn btn-ghost" to="/clan">
        К странице клана
      </Link>
    );
  }

  if (code === 'RankTooLow') {
    title = 'Недостаточное звание';
    description = 'Резервисты не могут просматривать и активировать клановые резервы.';
    secondButton = (
      <Link className="btn btn-ghost" to="/clan">
        К странице клана
      </Link>
    );
  }

  return (
    <div className="wrapper clan-reserves">
      <div className="container">
        <div
          className="clan-reserves__empty reveal reveal--visible"
          style={{ padding: '32px', textAlign: 'center' }}
        >
          <h1>{title}</h1>
          <p>{description}</p>

          <div
            style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'center',
              marginTop: '20px',
              flexWrap: 'wrap',
            }}
          >
            <Link className="btn btn-primary" to="/">
              На главную
            </Link>

            {secondButton}
          </div>
        </div>
      </div>
    </div>
  );
}

function ReservesError({ onReload }) {
  return (
    <div className="wrapper clan-reserves">
      <div className="container">
        <div
          className="clan-reserves__empty reveal reveal--visible"
          style={{ padding: '32px', textAlign: 'center' }}
        >
          <h1>К сожалению, не удалось загрузить клановые резервы.</h1>
          <p>Пожалуйста, попробуйте перезагрузить страницу.</p>

          <div
            style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'center',
              marginTop: '20px',
              flexWrap: 'wrap',
            }}
          >
            <button className="btn btn-primary" onClick={onReload}>
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

function ReserveCard({
  reserve,
  groupActiveReserve,
  canActivateReserves,
  activatingType,
  now,
  onActivate,
}) {
  const activeTimeLeft = reserve.endsAtUtc
    ? formatTimeLeft(reserve.endsAtUtc, now)
    : null;

  const isActivating = activatingType === reserve.type;

  return (
    <article className={`reserve-card${reserve.isActive ? ' reserve-card--active' : ''}`}>
      <div className="reserve-card__image-wrap">
        <img
          src={reserve.imageUrl}
          alt={reserve.title}
          className="reserve-card__image"
          width="72"
          height="72"
          onError={(event) => {
            event.currentTarget.style.opacity = '0.35';
          }}
        />
      </div>

      <div className="reserve-card__body">
        <div className="reserve-card__top">
          <h3 className="reserve-card__title">
            {reserve.title}
          </h3>

          <span className="reserve-card__stock">
            На складе: {reserve.stock}
          </span>
        </div>

        <p className="reserve-card__description">
          {reserve.description}
        </p>

        <div className="reserve-card__bonus">
          {reserve.bonusText}
        </div>

        {reserve.isActive && activeTimeLeft && (
          <div className="reserve-card__timer">
            До окончания: <strong>{activeTimeLeft}</strong>
          </div>
        )}

        {!reserve.isActive && groupActiveReserve && (
          <div className="reserve-card__group-lock">
            Сейчас активен резерв группы: <strong>{groupActiveReserve.title}</strong>
          </div>
        )}
      </div>

      <div className="reserve-card__actions">
        {reserve.canActivate ? (
          <button
            className="btn btn-primary reserve-card__btn"
            disabled={isActivating}
            onClick={() => onActivate(reserve.type)}
          >
            {isActivating ? 'Активация...' : 'Активировать резерв'}
          </button>
        ) : (
          <span
            className={`reserve-card__status${reserve.isActive ? ' reserve-card__status--active' : ''}`}
          >
            {reserve.statusText}
          </span>
        )}

        {!canActivateReserves && reserve.stock > 0 && !reserve.isActive && !groupActiveReserve && (
          <span className="reserve-card__hint">
            Активировать может модератор или администратор.
          </span>
        )}
      </div>
    </article>
  );
}

function ReserveGroup({
  group,
  canActivateReserves,
  activatingType,
  now,
  onActivate,
}) {
  const activeTimeLeft = group.activeReserve
    ? formatTimeLeft(group.activeReserve.endsAtUtc, now)
    : null;

  return (
    <section className="clan-reserves__group reveal">
      <div className="clan-reserves__group-header">
        <div>
          <h2 className="clan-reserves__group-title">
            {group.title}
          </h2>

          <p className="clan-reserves__group-subtitle">
            В каждой группе одновременно может быть активен только один резерв.
          </p>
        </div>

        {group.activeReserve ? (
          <div className="clan-reserves__active">
            <span className="clan-reserves__active-label">
              Активен
            </span>

            <strong className="clan-reserves__active-title">
              {group.activeReserve.title}
            </strong>

            {activeTimeLeft && (
              <span className="clan-reserves__active-time">
                Осталось: {activeTimeLeft}
              </span>
            )}

            <span className="clan-reserves__active-user">
              Активировал: {group.activeReserve.activatedByNickname}
            </span>
          </div>
        ) : (
          <div className="clan-reserves__inactive">
            Активных резервов в группе нет
          </div>
        )}
      </div>

      <div className="clan-reserves__cards">
        {group.reserves.map((reserve) => (
          <ReserveCard
            key={reserve.type}
            reserve={reserve}
            groupActiveReserve={group.activeReserve}
            canActivateReserves={canActivateReserves}
            activatingType={activatingType}
            now={now}
            onActivate={onActivate}
          />
        ))}
      </div>
    </section>
  );
}

function Reserves() {
  const {
    state,
    loading,
    error,
    activatingType,
    reload,
    activate,
  } = useClanReserves();

  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  const groups = useMemo(() => {
    return state?.groups ?? [];
  }, [state]);

  if (loading) {
    return (
      <div className="wrapper clan-reserves">
        <div className="container">
          <LoadingSpinner text="Загружаем клановые резервы..." />
        </div>
      </div>
    );
  }

  if (error?.status === 403) {
    return <ReservesAccessDenied reason={error.data} />;
  }

  if (error || !state) {
    return <ReservesError onReload={reload} />;
  }

  return (
    <div className="wrapper clan-reserves">
      <div className="container">
        <div className="clan-reserves__header reveal">
          <div className="clan-reserves__header-label">
            Клан
          </div>

          <h1 className="clan-reserves__title">
            Активация клановых резервов
          </h1>

          <p className="clan-reserves__subtitle">
            Резервы действуют 2 часа. В каждой группе может быть активен только один резерв.
          </p>
        </div>

        <div className="clan-reserves__notice reveal">
          {state.canActivateReserves
            ? 'Вы можете активировать доступные резервы своего клана.'
            : 'Вы можете просматривать склад резервов. Активировать резервы может модератор или администратор.'}
        </div>

        <div className="clan-reserves__groups">
          {groups.map((group) => (
            <ReserveGroup
              key={group.key}
              group={group}
              canActivateReserves={state.canActivateReserves}
              activatingType={activatingType}
              now={now}
              onActivate={activate}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default Reserves;